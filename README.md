<div align="center">
  <img src="assets/hero_banner.png" alt="LMS Marketplace Banner" width="100%" />
  
  <br />
  <br />

  <h1>LMS Marketplace (v2)</h1>
  
  <p>
    <strong>A next-generation, open-source Learning Management System for students and instructors.</strong>
  </p>
  
  <p>
    <a href="https://learningmarket.vercel.app"><img src="https://img.shields.io/badge/Live_Demo-learningmarket.vercel.app-6366f1?style=for-the-badge&logo=vercel" alt="Live Demo" /></a>
    <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/MongoDB-Enabled-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  </p>
</div>

<hr />

## ✨ Features

**LMS Marketplace** is split into two seamless portals, providing a dynamic experience for both learners and educators.

### 🎓 For Students
- **Explore & Enroll**: Browse a comprehensive marketplace of courses.
- **Track Progress**: Real-time progress tracking for every enrolled course and lesson.
- **Seamless Video Learning**: Embedded YouTube lessons for high-performance playback.
- **Modern Dashboard**: A sleek, intuitive student portal to manage learning paths.

### 👨‍🏫 For Instructors
- **Course Creation Studio**: Build robust courses with custom thumbnails and descriptions.
- **Curriculum Management**: Easily arrange, edit, or remove video lessons.
- **Enrollment Analytics**: Track student enrollment metrics across your courses.
- **Instructor Dashboard**: A powerful control center for all educator tools.

---

## 📸 Showcases

<div align="center">
  <h3>Student Portal</h3>
  <img src="assets/student_mockup.png" alt="Student Dashboard Mockup" width="100%" />
  <br/><br/>
  <h3>Instructor Dashboard</h3>
  <img src="assets/instructor_mockup.png" alt="Instructor Dashboard Mockup" width="100%" />
</div>

---

## 🛠️ Technology Stack

| Category | Technologies |
| --- | --- |
| **Framework** | Next.js 14, React 18 |
| **Styling** | Tailwind CSS, shadcn/ui (Radix) |
| **Database** | MongoDB |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs |

---

## 🗄️ Database Architecture

```mermaid
erDiagram
    USERS ||--o{ ENROLLMENTS : has
    USERS ||--o{ COURSES : creates
    COURSES ||--o{ LESSONS : contains
    COURSES ||--o{ ENROLLMENTS : tracking

    USERS {
        string id PK
        string name
        string email
        string password
        string role "student | instructor"
    }
    
    COURSES {
        string id PK
        string title
        string category
        string instructor_id FK
    }
    
    LESSONS {
        string id PK
        string course_id FK
        string title
        string video_url
        int order
    }
    
    ENROLLMENTS {
        string id PK
        string user_id FK
        string course_id FK
        string[] completed_lessons
    }
```

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/AbdulWasay0029/Real-World-LMS-eLearning-Marketplace-V2.git
cd Real-World-LMS-eLearning-Marketplace-V2
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=lms_marketplace
JWT_SECRET=your_super_secret_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Run the Development Server
```bash
npm run dev
# or
yarn dev
```
Navigate to `http://localhost:3000` to view the application!

<hr />
<div align="center">
  <p>Built with ❤️ by Abdul Wasay</p>
</div>
