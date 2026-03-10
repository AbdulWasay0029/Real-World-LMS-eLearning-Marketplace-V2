# LMS eLearning Marketplace

A modern Learning Management System built with Next.js, React, MongoDB, and TailwindCSS for college project.

## 🎯 Features

### User Roles
- **Students**: Browse, enroll in courses, track progress, watch video lessons
- **Instructors**: Create courses, add video lessons, manage content

### Core Functionality
- ✅ User Authentication (JWT-based)
- ✅ Role-based Access Control (Student/Instructor)
- ✅ Course Marketplace with Search & Filter
- ✅ Free Enrollment System
- ✅ YouTube Video Lessons (Embedded)
- ✅ Progress Tracking (Mark lessons as complete)
- ✅ Responsive Professional Design

## 📱 Pages & Flows

### 1. Authentication
- **Login**: Email and password authentication
- **Register**: Sign up with role selection (Student/Instructor)

### 2. Home Page (Student View)
- Browse all available courses
- Search courses by title/description
- Filter by category (Programming, Design, Business, Marketing, Other)
- View course cards with thumbnail, title, instructor, and category

### 3. Course Details Page
- Course description and metadata
- List of video lessons
- Enroll button (for students)
- Add/Edit/Delete options (for instructors)

### 4. Student Dashboard
- **Browse Courses Tab**: Explore all courses with search/filter
- **My Courses Tab**: View enrolled courses with progress tracking
- Continue learning from where you left off
- Track completion percentage

### 5. Instructor Dashboard
- View all created courses
- Create new course with title, description, thumbnail, category
- Add video lessons with YouTube links
- Edit or delete courses
- View enrollment count per course

### 6. Lesson Player
- Embedded YouTube video player
- Full-screen video playback
- Mark lesson as complete/incomplete (students)
- Automatic progress calculation

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TailwindCSS
- **UI Components**: shadcn/ui (Radix UI)
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: JWT (jsonwebtoken)
- **Password Security**: bcryptjs

## 🗄️ Database Schema

### Collections

**users**
```javascript
{
  id: String (UUID),
  name: String,
  email: String,
  password: String (hashed),
  role: String ('student' | 'instructor'),
  created_at: String (ISO Date)
}
```

**courses**
```javascript
{
  id: String (UUID),
  title: String,
  description: String,
  thumbnail: String (URL),
  category: String,
  instructor_id: String (UUID),
  instructor_name: String,
  created_at: String (ISO Date)
}
```

**lessons**
```javascript
{
  id: String (UUID),
  course_id: String (UUID),
  title: String,
  video_url: String (YouTube URL),
  duration: String,
  order: Number
}
```

**enrollments**
```javascript
{
  id: String (UUID),
  user_id: String (UUID),
  course_id: String (UUID),
  enrolled_at: String (ISO Date),
  completed_lessons: Array<String> (lesson IDs)
}
```

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Courses
- `POST /api/courses` - Create course (instructor only)
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get single course with lessons
- `PUT /api/courses/:id` - Update course (instructor only)
- `DELETE /api/courses/:id` - Delete course (instructor only)

### Lessons
- `POST /api/courses/:id/lessons` - Add lesson to course
- `GET /api/courses/:id/lessons` - Get lessons for course

### Enrollments
- `POST /api/enrollments` - Enroll in course
- `GET /api/enrollments/my-courses` - Get enrolled courses with progress
- `GET /api/enrollments/check` - Check enrollment status
- `PUT /api/enrollments/:id/progress` - Update lesson progress

## 💻 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- Yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables in `.env`:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=lms_marketplace
JWT_SECRET=your-super-secret-jwt-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. Start the development server:
```bash
yarn dev
```

5. Access the application at `http://localhost:3000`

## 🎨 Design Philosophy

- **Professional & Minimal**: Clean, distraction-free interface
- **Responsive**: Works on desktop, tablet, and mobile
- **Udemy-inspired**: Familiar learning platform UI patterns
- **Accessibility**: Semantic HTML and ARIA labels
- **Performance**: Optimized images and lazy loading

## 📝 Usage Guide

### For Students:
1. Register with "Student" role
2. Browse courses in the marketplace
3. Use search/filter to find courses
4. Click on a course to view details
5. Click "Enroll Now" to join (free)
6. Go to "My Courses" tab
7. Click on enrolled course to watch lessons
8. Mark lessons as complete to track progress

### For Instructors:
1. Register with "Instructor" role
2. Click "Create Course" button
3. Fill in course details (title, description, category, thumbnail)
4. Click on your course to manage it
5. Click "Add Lesson" to add video lessons
6. Paste YouTube video URL
7. Students can now enroll and watch your content

## 🔒 Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT token-based authentication
- Role-based authorization
- Protected API routes
- Input validation and sanitization
- MongoDB injection prevention

## 🧪 Testing

Backend API testing completed with 100% success rate:
- ✅ Authentication (register, login, JWT verification)
- ✅ Course CRUD operations
- ✅ Lesson management
- ✅ Enrollment system
- ✅ Progress tracking
- ✅ Authorization and security
- ✅ Error handling

## 📦 Project Structure

```
/app
├── app/
│   ├── api/[[...path]]/
│   │   └── route.js          # Backend API routes
│   ├── page.js                # Main frontend application
│   ├── layout.js              # Root layout
│   └── globals.css            # Global styles
├── components/ui/             # shadcn/ui components
├── lib/utils.js               # Utility functions
├── .env                       # Environment variables
├── package.json               # Dependencies
└── README.md                  # This file
```

## 🎓 College Project Notes

This project demonstrates:
- Full-stack web development skills
- RESTful API design
- Database modeling and queries
- User authentication and authorization
- Modern React patterns (hooks, context)
- Responsive UI design
- Professional coding practices

## 📄 License

MIT License - Feel free to use for educational purposes.

## 👨💻 Developer

Built with ❤️ for college project using modern web technologies.
