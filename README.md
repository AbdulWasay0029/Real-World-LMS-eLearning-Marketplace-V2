# LMS — eLearning Marketplace

Full-stack learning management system with separate student and instructor flows. Built with Next.js, MongoDB, and JWT authentication.

---

## Features

**Students**
- Browse and search course marketplace
- Filter by category
- Enroll in courses (free)
- Watch embedded YouTube lessons
- Track progress per lesson and per course

**Instructors**
- Create and manage courses
- Add YouTube-based video lessons
- View enrollment counts
- Edit or delete content

---

## Stack

**Next.js 14 · React 18 · TailwindCSS · MongoDB · JWT · bcryptjs**

UI components via shadcn/ui (Radix UI)

---

## Database Schema

```javascript
// users
{ id, name, email, password (bcrypt), role: 'student' | 'instructor', created_at }

// courses
{ id, title, description, thumbnail, category, instructor_id, instructor_name, created_at }

// lessons
{ id, course_id, title, video_url, duration, order }

// enrollments
{ id, user_id, course_id, enrolled_at, completed_lessons: string[] }
```

---

## API Routes

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

POST   /api/courses              # instructor only
GET    /api/courses
GET    /api/courses/:id
PUT    /api/courses/:id          # instructor only
DELETE /api/courses/:id          # instructor only

POST   /api/courses/:id/lessons
GET    /api/courses/:id/lessons

POST   /api/enrollments
GET    /api/enrollments/my-courses
GET    /api/enrollments/check
PUT    /api/enrollments/:id/progress
```

---

## Setup

```bash
# Install dependencies
yarn install

# Configure environment
cp .env.example .env
```

`.env` variables:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=lms_marketplace
JWT_SECRET=your-secret-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

```bash
# Start dev server
yarn dev
```

Open `http://localhost:3000`

---

## Project Structure

```
├── app/
│   ├── api/[[...path]]/route.js   # All API routes
│   ├── page.js                    # Main application
│   ├── layout.js
│   └── globals.css
├── components/ui/                 # shadcn/ui components
├── lib/utils.js
└── .env
```

---

## Security

- Passwords hashed with bcrypt (10 rounds)
- JWT-based session management
- Role-based route protection
- Input validation and sanitization on all endpoints
