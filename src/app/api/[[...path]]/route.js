import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    const client = await MongoClient.connect(MONGO_URL);
    const db = client.db(DB_NAME);

    cachedClient = client;
    cachedDb = db;

    return { client, db };
}

function verifyToken(request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.substring(7);
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
}

export async function GET(request) {
    try {
        const { db } = await connectToDatabase();
        const { pathname, searchParams } = new URL(request.url);
        const path = pathname.replace('/api/', '');

        // Auth - Get current user
        if (path === 'auth/me') {
            const user = verifyToken(request);
            if (!user) {
                return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const userDoc = await db.collection('users').findOne({ id: user.userId });
            if (!userDoc) {
                return Response.json({ error: 'User not found' }, { status: 404 });
            }

            return Response.json({
                id: userDoc.id,
                name: userDoc.name,
                email: userDoc.email,
                role: userDoc.role
            });
        }

        // Get all courses
        if (path === 'courses') {
            const category = searchParams.get('category');
            const instructorId = searchParams.get('instructor_id');

            let query = {};
            if (category) query.category = category;
            if (instructorId) query.instructor_id = instructorId;

            const courses = await db.collection('courses').find(query).sort({ created_at: -1 }).toArray();

            // Get enrollment counts + first lesson video for auto-thumbnail
            const coursesWithStats = await Promise.all(courses.map(async (course) => {
                const enrollmentCount = await db.collection('enrollments').countDocuments({ course_id: course.id });
                const firstLesson = await db.collection('lessons').findOne({ course_id: course.id }, { sort: { order: 1 } });
                return { ...course, enrollmentCount, first_video_url: firstLesson?.video_url || null };
            }));

            return Response.json(coursesWithStats);
        }

        // Get single course
        if (path.startsWith('courses/') && !path.includes('/lessons')) {
            const courseId = path.split('/')[1];
            const course = await db.collection('courses').findOne({ id: courseId });

            if (!course) {
                return Response.json({ error: 'Course not found' }, { status: 404 });
            }

            const lessons = await db.collection('lessons').find({ course_id: courseId }).sort({ order: 1 }).toArray();
            const enrollmentCount = await db.collection('enrollments').countDocuments({ course_id: courseId });

            return Response.json({ ...course, lessons, enrollmentCount });
        }

        // Get lessons for a course
        if (path.includes('/lessons')) {
            const courseId = path.split('/')[1];
            const lessons = await db.collection('lessons').find({ course_id: courseId }).sort({ order: 1 }).toArray();
            return Response.json(lessons);
        }

        // Get my enrollments
        if (path === 'enrollments/my-courses') {
            const user = verifyToken(request);
            if (!user) {
                return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const enrollments = await db.collection('enrollments').find({ user_id: user.userId }).toArray();

            const coursesWithProgress = await Promise.all(enrollments.map(async (enrollment) => {
                const course = await db.collection('courses').findOne({ id: enrollment.course_id });
                let lessons = await db.collection('lessons').find({ course_id: enrollment.course_id }).sort({ order: 1 }).toArray();
                const progress = lessons.length > 0 ? (enrollment.completed_lessons.length / lessons.length) * 100 : 0;
                const first_video_url = lessons.length > 0 ? lessons[0].video_url : null;

                return {
                    ...enrollment,
                    course: { ...course, first_video_url },
                    totalLessons: lessons.length,
                    completedLessons: enrollment.completed_lessons.length,
                    progress: Math.round(progress)
                };
            }));

            return Response.json(coursesWithProgress);
        }

        // Check enrollment status
        if (path.startsWith('enrollments/check')) {
            const user = verifyToken(request);
            if (!user) {
                return Response.json({ enrolled: false });
            }

            const courseId = searchParams.get('course_id');
            const enrollment = await db.collection('enrollments').findOne({
                user_id: user.userId,
                course_id: courseId
            });

            return Response.json({
                enrolled: !!enrollment,
                enrollment: enrollment || null
            });
        }

        return Response.json({ message: 'LMS API' });

    } catch (error) {
        console.error('API Error:', error);
        return Response.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { db } = await connectToDatabase();
        const { pathname } = new URL(request.url);
        const path = pathname.replace('/api/', '');
        const body = await request.json();

        // Register
        if (path === 'auth/register') {
            const { name, email, password, role } = body;

            if (!name || !email || !password || !role) {
                return Response.json({ error: 'All fields are required' }, { status: 400 });
            }

            if (!['student', 'instructor'].includes(role)) {
                return Response.json({ error: 'Invalid role' }, { status: 400 });
            }

            const existingUser = await db.collection('users').findOne({ email });
            if (existingUser) {
                return Response.json({ error: 'Email already registered' }, { status: 400 });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const userId = uuidv4();

            await db.collection('users').insertOne({
                id: userId,
                name,
                email,
                password: hashedPassword,
                role,
                created_at: new Date().toISOString()
            });

            const token = jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '7d' });

            return Response.json({
                token,
                user: { id: userId, name, email, role }
            });
        }

        // Login
        if (path === 'auth/login') {
            const { email, password } = body;

            if (!email || !password) {
                return Response.json({ error: 'Email and password are required' }, { status: 400 });
            }

            const user = await db.collection('users').findOne({ email });
            if (!user) {
                return Response.json({ error: 'Invalid credentials' }, { status: 401 });
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return Response.json({ error: 'Invalid credentials' }, { status: 401 });
            }

            const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

            return Response.json({
                token,
                user: { id: user.id, name: user.name, email: user.email, role: user.role }
            });
        }

        // Create course
        if (path === 'courses') {
            const user = verifyToken(request);
            if (!user || user.role !== 'instructor') {
                return Response.json({ error: 'Unauthorized. Only instructors can create courses.' }, { status: 403 });
            }

            const { title, description, thumbnail, category } = body;

            if (!title || !description) {
                return Response.json({ error: 'Title and description are required' }, { status: 400 });
            }

            const userDoc = await db.collection('users').findOne({ id: user.userId });
            const courseId = uuidv4();

            await db.collection('courses').insertOne({
                id: courseId,
                title,
                description,
                thumbnail: thumbnail || '',
                category: category || 'General',
                instructor_id: user.userId,
                instructor_name: userDoc.name,
                created_at: new Date().toISOString()
            });

            return Response.json({ message: 'Course created successfully', courseId });
        }

        // Add lesson to course
        if (path.includes('/lessons')) {
            const user = verifyToken(request);
            if (!user || user.role !== 'instructor') {
                return Response.json({ error: 'Unauthorized' }, { status: 403 });
            }

            const courseId = path.split('/')[1];
            const course = await db.collection('courses').findOne({ id: courseId });

            if (!course || course.instructor_id !== user.userId) {
                return Response.json({ error: 'Course not found or unauthorized' }, { status: 403 });
            }

            const { title, video_url, duration } = body;

            if (!title || !video_url) {
                return Response.json({ error: 'Title and video URL are required' }, { status: 400 });
            }

            const lessonCount = await db.collection('lessons').countDocuments({ course_id: courseId });
            const lessonId = uuidv4();

            await db.collection('lessons').insertOne({
                id: lessonId,
                course_id: courseId,
                title,
                video_url,
                duration: duration || '0:00',
                order: lessonCount + 1
            });

            return Response.json({ message: 'Lesson added successfully', lessonId });
        }

        // Enroll in course
        if (path === 'enrollments') {
            const user = verifyToken(request);
            if (!user) {
                return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const { course_id } = body;

            if (!course_id) {
                return Response.json({ error: 'Course ID is required' }, { status: 400 });
            }

            const course = await db.collection('courses').findOne({ id: course_id });
            if (!course) {
                return Response.json({ error: 'Course not found' }, { status: 404 });
            }

            const existingEnrollment = await db.collection('enrollments').findOne({
                user_id: user.userId,
                course_id
            });

            if (existingEnrollment) {
                return Response.json({ error: 'Already enrolled in this course' }, { status: 400 });
            }

            const enrollmentId = uuidv4();

            await db.collection('enrollments').insertOne({
                id: enrollmentId,
                user_id: user.userId,
                course_id,
                enrolled_at: new Date().toISOString(),
                completed_lessons: []
            });

            return Response.json({ message: 'Enrolled successfully', enrollmentId });
        }

        return Response.json({ error: 'Not found' }, { status: 404 });

    } catch (error) {
        console.error('API Error:', error);
        return Response.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const { db } = await connectToDatabase();
        const { pathname } = new URL(request.url);
        const path = pathname.replace('/api/', '');
        const body = await request.json();
        const user = verifyToken(request);

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Update course
        if (path.startsWith('courses/') && user.role === 'instructor') {
            const courseId = path.split('/')[1];
            const course = await db.collection('courses').findOne({ id: courseId });

            if (!course || course.instructor_id !== user.userId) {
                return Response.json({ error: 'Course not found or unauthorized' }, { status: 403 });
            }

            const { title, description, thumbnail, category } = body;
            const updateData = {};
            if (title) updateData.title = title;
            if (description) updateData.description = description;
            if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
            if (category) updateData.category = category;

            await db.collection('courses').updateOne(
                { id: courseId },
                { $set: updateData }
            );

            return Response.json({ message: 'Course updated successfully' });
        }

        // Update enrollment progress
        if (path.includes('enrollments/') && path.includes('/progress')) {
            const enrollmentId = path.split('/')[1];
            const { lesson_id, completed } = body;

            const enrollment = await db.collection('enrollments').findOne({ id: enrollmentId });
            if (!enrollment || enrollment.user_id !== user.userId) {
                return Response.json({ error: 'Enrollment not found' }, { status: 404 });
            }

            let completedLessons = enrollment.completed_lessons || [];

            if (completed && !completedLessons.includes(lesson_id)) {
                completedLessons.push(lesson_id);
            } else if (!completed && completedLessons.includes(lesson_id)) {
                completedLessons = completedLessons.filter(id => id !== lesson_id);
            }

            await db.collection('enrollments').updateOne(
                { id: enrollmentId },
                { $set: { completed_lessons: completedLessons } }
            );

            return Response.json({ message: 'Progress updated', completedLessons });
        }

        return Response.json({ error: 'Not found' }, { status: 404 });

    } catch (error) {
        console.error('API Error:', error);
        return Response.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { db } = await connectToDatabase();
        const { pathname } = new URL(request.url);
        const path = pathname.replace('/api/', '');
        const user = verifyToken(request);

        if (!user || user.role !== 'instructor') {
            return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Delete course
        if (path.startsWith('courses/')) {
            const courseId = path.split('/')[1];
            const course = await db.collection('courses').findOne({ id: courseId });

            if (!course || course.instructor_id !== user.userId) {
                return Response.json({ error: 'Course not found or unauthorized' }, { status: 403 });
            }

            await db.collection('courses').deleteOne({ id: courseId });
            await db.collection('lessons').deleteMany({ course_id: courseId });
            await db.collection('enrollments').deleteMany({ course_id: courseId });

            return Response.json({ message: 'Course deleted successfully' });
        }

        return Response.json({ error: 'Not found' }, { status: 404 });

    } catch (error) {
        console.error('API Error:', error);
        return Response.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
}
