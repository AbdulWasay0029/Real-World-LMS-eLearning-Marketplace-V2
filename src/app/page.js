'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Users, Video, Plus, LogOut, Trash2, Play, CheckCircle2, User, ArrowLeft, GraduationCap, BarChart3, Search } from 'lucide-react';

export default function LMSApp() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showProfile, setShowProfile] = useState(false);

  // Auth form state
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });

  // Course form state
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    thumbnail: '',
    category: 'Programming'
  });

  // Lesson form state
  const [lessonForm, setLessonForm] = useState({
    title: '',
    video_url: '',
    duration: ''
  });

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      fetchCurrentUser(savedToken);
    }
  }, []);

  useEffect(() => {
    if (token) {
      if (typeof window !== 'undefined') {
        const fetchCoursesEffect = async () => {
          try {
            const url = user?.role === 'instructor'
              ? `/api/courses?instructor_id=${user.id}`
              : '/api/courses';
            const response = await fetch(url);
            const data = await response.json();
            setCourses(data);
          } catch (error) {
            console.error('Error fetching courses:', error);
          }
        };

        const fetchMyCoursesEffect = async () => {
          try {
            const response = await fetch('/api/enrollments/my-courses', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setMyCourses(data);
          } catch (error) {
            console.error('Error fetching my courses:', error);
          }
        };

        fetchCoursesEffect();
        if (user?.role === 'student') {
          fetchMyCoursesEffect();
        }
      }
    }
  }, [token, user]);

  const fetchCurrentUser = async (authToken) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const url = user?.role === 'instructor'
        ? `/api/courses?instructor_id=${user.id}`
        : '/api/courses';
      const response = await fetch(url);
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchMyCourses = async () => {
    try {
      const response = await fetch('/api/enrollments/my-courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setMyCourses(data);
    } catch (error) {
      console.error('Error fetching my courses:', error);
    }
  };

  const fetchCourseDetails = async (courseId) => {
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      const data = await response.json();
      setSelectedCourse(data);

      if (user?.role === 'student') {
        const enrollResponse = await fetch(`/api/enrollments/check?course_id=${courseId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const enrollData = await enrollResponse.json();
        setEnrollment(enrollData.enrollment);
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = authMode === 'login'
        ? { email: authForm.email, password: authForm.password }
        : authForm;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        setAuthForm({ name: '', email: '', password: '', role: 'student' });
      } else {
        alert(data.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('Authentication failed');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    setCourses([]);
    setMyCourses([]);
    setSelectedCourse(null);
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(courseForm)
      });

      const data = await response.json();

      if (response.ok) {
        alert('Course created successfully!');
        setShowCourseModal(false);
        setCourseForm({ title: '', description: '', thumbnail: '', category: 'Programming' });
        fetchCourses();
      } else {
        alert(data.error || 'Failed to create course');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course');
    }
    setLoading(false);
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`/api/courses/${selectedCourse.id}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(lessonForm)
      });

      const data = await response.json();

      if (response.ok) {
        alert('Lesson added successfully!');
        setShowLessonModal(false);
        setLessonForm({ title: '', video_url: '', duration: '' });
        fetchCourseDetails(selectedCourse.id);
      } else {
        alert(data.error || 'Failed to add lesson');
      }
    } catch (error) {
      console.error('Error adding lesson:', error);
      alert('Failed to add lesson');
    }
    setLoading(false);
  };

  const handleEnroll = async (courseId) => {
    setLoading(true);
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ course_id: courseId })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Enrolled successfully!');
        fetchCourseDetails(courseId);
        fetchMyCourses();
      } else {
        alert(data.error || 'Failed to enroll');
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      alert('Failed to enroll');
    }
    setLoading(false);
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Course deleted successfully!');
        setSelectedCourse(null);
        fetchCourses();
      } else {
        alert('Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course');
    }
  };

  const handleMarkComplete = async (lessonId, completed) => {
    try {
      await fetch(`/api/enrollments/${enrollment.id}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ lesson_id: lessonId, completed })
      });

      fetchCourseDetails(selectedCourse.id);
      fetchMyCourses();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([a-zA-Z0-9_-]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  const getYouTubeTimestamp = (url) => {
    if (!url) return null;
    // Matches &t=120, ?t=120, &t=1m30s, ?t=1h2m3s etc.
    const match = url.match(/[?&]t=([0-9hms]+)/);
    if (!match) return null;
    const raw = match[1];
    // If already pure seconds
    if (/^\d+$/.test(raw)) return parseInt(raw, 10);
    // Parse 1h2m3s format
    let secs = 0;
    const h = raw.match(/(\d+)h/);
    const m = raw.match(/(\d+)m/);
    const s = raw.match(/(\d+)s/);
    if (h) secs += parseInt(h[1]) * 3600;
    if (m) secs += parseInt(m[1]) * 60;
    if (s) secs += parseInt(s[1]);
    return secs || null;
  };

  const getYouTubeEmbedUrl = (url) => {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return url;
    const start = getYouTubeTimestamp(url);
    return start
      ? `https://www.youtube.com/embed/${videoId}?start=${start}`
      : `https://www.youtube.com/embed/${videoId}`;
  };

  const getYouTubeThumbnail = (url) => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
  };

  // Pick thumbnail: custom URL > auto from first_video_url (API) or lessons array
  const getCourseThumbnail = (course) => {
    if (course.thumbnail) return course.thumbnail;
    // first_video_url comes from the API listing endpoint
    if (course.first_video_url) return getYouTubeThumbnail(course.first_video_url);
    // fallback: if lessons are embedded (single course detail view)
    if (course.lessons && course.lessons.length > 0) {
      return getYouTubeThumbnail(course.lessons[0].video_url);
    }
    return null;
  };

  // Auth Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo mark */}
          <div className="flex flex-col items-center mb-6">
            <div className="bg-primary rounded-xl p-3 shadow-sm mb-3">
              <BookOpen className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">LMS Marketplace</h1>
          </div>

          <Card className="shadow-xl shadow-indigo-100 border-0">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl text-center">
                {authMode === 'login' ? 'Welcome back 👋' : 'Create your account'}
              </CardTitle>
              <CardDescription className="text-center">
                {authMode === 'login' ? 'Sign in to continue learning' : 'Join thousands of learners today'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuth} className="space-y-4">
                {authMode === 'register' && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    required
                  />
                </div>

                {authMode === 'register' && (
                  <div className="space-y-2">
                    <Label htmlFor="role">I am a</Label>
                    <Select value={authForm.role} onValueChange={(value) => setAuthForm({ ...authForm, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="instructor">Instructor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="pt-0">
              <Button
                variant="link"
                className="w-full text-primary"
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              >
                {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // Main App
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-lg p-2">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">LMS Marketplace</h1>
              <p className="text-xs text-muted-foreground">{user.role === 'instructor' ? 'Instructor Portal' : 'Student Portal'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowProfile(true)}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">

        {/* ===== PROFILE VIEW ===== */}
        {showProfile ? (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => setShowProfile(false)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h2 className="text-3xl font-bold">My Profile</h2>
            </div>

            {/* Profile card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-6">
                  <div className="bg-primary rounded-full p-5 flex items-center justify-center">
                    {user.role === 'student'
                      ? <GraduationCap className="h-10 w-10 text-primary-foreground" />
                      : <BookOpen className="h-10 w-10 text-primary-foreground" />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{user.name}</h3>
                    <p className="text-muted-foreground">{user.email}</p>
                    <Badge className="mt-1 capitalize">{user.role}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ---- STUDENT PROFILE ---- */}
            {user.role === 'student' && (
              <>
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-4xl font-bold text-slate-800">{myCourses.length}</p>
                      <p className="text-sm text-muted-foreground mt-1">Enrolled</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-4xl font-bold text-slate-800">{myCourses.filter(c => c.progress === 100).length}</p>
                      <p className="text-sm text-muted-foreground mt-1">Completed</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-4xl font-bold text-slate-800">
                        {myCourses.length > 0
                          ? Math.round(myCourses.reduce((a, c) => a + c.progress, 0) / myCourses.length)
                          : 0}%
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">Avg Progress</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Course progress list */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" /> My Courses
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {myCourses.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No courses enrolled yet.</p>
                    ) : myCourses.map(item => (
                      <div key={item.id}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{item.course?.title}</span>
                          <div className="flex items-center gap-2">
                            {item.progress === 100 && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                            <span className="text-sm font-semibold">{item.progress}%</span>
                          </div>
                        </div>
                        <Progress value={item.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.completedLessons} of {item.totalLessons} lessons completed
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}

            {/* ---- INSTRUCTOR PROFILE ---- */}
            {user.role === 'instructor' && (
              <>
                {/* Stats row */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-4xl font-bold text-slate-800">{courses.length}</p>
                      <p className="text-sm text-muted-foreground mt-1">Courses Created</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-4xl font-bold text-slate-800">{courses.reduce((a, c) => a + (c.enrollmentCount || 0), 0)}</p>
                      <p className="text-sm text-muted-foreground mt-1">Total Students</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Course stats list */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" /> Your Courses
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {courses.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No courses created yet.</p>
                    ) : courses.map(course => (
                      <div key={course.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer" onClick={() => { setShowProfile(false); fetchCourseDetails(course.id); }}>
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <Badge variant="outline" className="text-xs mt-1">{course.category}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span className="font-semibold">{course.enrollmentCount || 0} students</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Button className="w-full" onClick={() => { setShowProfile(false); setShowCourseModal(true); }}>
                  <Plus className="h-4 w-4 mr-2" /> Create New Course
                </Button>
              </>
            )}
          </div>
        ) : (
          user.role === 'instructor' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">My Courses</h2>
                  <p className="text-muted-foreground">Manage your courses and lessons</p>
                </div>
                <Button onClick={() => setShowCourseModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              </div>

              {courses.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No courses yet. Create your first course!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <Card key={course.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => fetchCourseDetails(course.id)}>
                      <CardHeader>
                        <div className="aspect-video bg-slate-100 rounded-md mb-3 flex items-center justify-center overflow-hidden">
                          {getCourseThumbnail(course) ? (
                            <img src={getCourseThumbnail(course)} alt={course.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                          ) : null}
                          <span style={{ display: getCourseThumbnail(course) ? 'none' : 'flex' }} className="w-full h-full items-center justify-center">
                            <Video className="h-12 w-12 text-muted-foreground" />
                          </span>
                        </div>
                        <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                      </CardHeader>
                      <CardFooter className="flex justify-between">
                        <div className="text-sm text-muted-foreground">
                          <Users className="h-4 w-4 inline mr-1" />
                          {course.enrollmentCount || 0} students
                        </div>
                        <Badge className="bg-slate-900 text-slate-50 hover:bg-slate-800 border-0">{course.category}</Badge>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Tabs defaultValue="browse" className="space-y-6">
              <TabsList>
                <TabsTrigger value="browse">Browse Courses</TabsTrigger>
                <TabsTrigger value="my-courses">My Courses</TabsTrigger>
              </TabsList>

              <TabsContent value="browse" className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Explore Courses</h2>
                  <p className="text-muted-foreground">Discover and enroll in courses</p>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search courses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9"
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Programming">Programming</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(() => {
                  const filteredCourses = courses.filter(course => {
                    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      course.description.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
                    return matchesSearch && matchesCategory;
                  });

                  return (
                    <>
                      {filteredCourses.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          Showing {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
                        </div>
                      )}

                      {filteredCourses.length === 0 ? (
                        <Card>
                          <CardContent className="flex flex-col items-center justify-center py-12">
                            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                              {courses.length === 0 ? 'No courses available yet.' : 'No courses match your search.'}
                            </p>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredCourses.map((course) => (
                            <Card key={course.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => fetchCourseDetails(course.id)}>
                              <CardHeader>
                                <div className="aspect-video bg-slate-100 rounded-md mb-3 flex items-center justify-center overflow-hidden">
                                  {getCourseThumbnail(course) ? (
                                    <img src={getCourseThumbnail(course)} alt={course.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                  ) : null}
                                  <span style={{ display: getCourseThumbnail(course) ? 'none' : 'flex' }} className="w-full h-full items-center justify-center">
                                    <Video className="h-12 w-12 text-muted-foreground" />
                                  </span>
                                </div>
                                <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                              </CardHeader>
                              <CardFooter className="flex justify-between">
                                <div className="text-sm text-muted-foreground">
                                  By {course.instructor_name}
                                </div>
                                <Badge className="bg-slate-900 text-slate-50 hover:bg-slate-800 border-0">{course.category}</Badge>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </TabsContent>

              <TabsContent value="my-courses" className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">My Learning</h2>
                  <p className="text-muted-foreground">Continue your enrolled courses</p>
                </div>

                {myCourses.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">You haven&apos;t enrolled in any courses yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myCourses.map((item) => (
                      <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => fetchCourseDetails(item.course_id)}>
                        <CardHeader>
                          <div className="aspect-video bg-slate-100 rounded-md mb-3 flex items-center justify-center overflow-hidden">
                            {item.course?.thumbnail ? (
                              <img src={item.course.thumbnail} alt={item.course.title} className="w-full h-full object-cover" />
                            ) : (
                              <Video className="h-12 w-12 text-muted-foreground" />
                            )}
                          </div>
                          <CardTitle className="line-clamp-1">{item.course?.title}</CardTitle>
                          <CardDescription className="line-clamp-2">{item.course?.description}</CardDescription>
                        </CardHeader>
                        <CardFooter className="flex flex-col gap-2">
                          <div className="w-full space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span className="font-medium">{item.progress}%</span>
                            </div>
                            <Progress value={item.progress} />
                          </div>
                          <div className="w-full text-xs text-muted-foreground text-center">
                            {item.completedLessons} of {item.totalLessons} lessons completed
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )
        )}
      </main>

      {/* Footer */}
      {!showProfile && (
        <footer className="bg-slate-50 border-t border-border mt-12 py-8">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-lg font-bold text-slate-900 mb-2">LMS Marketplace</h3>
            <p className="text-slate-500 text-sm mb-4">Empowering learners and instructors worldwide.</p>
            <div className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} LMS Marketplace. All rights reserved.
            </div>
          </div>
        </footer>
      )}

      {/* Create Course Modal */}
      <Dialog open={showCourseModal} onOpenChange={setShowCourseModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>Fill in the details to create a new course</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCourse}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="course-title">Course Title</Label>
                <Input
                  id="course-title"
                  placeholder="Introduction to React"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-desc">Description</Label>
                <Textarea
                  id="course-desc"
                  placeholder="Describe what students will learn..."
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  required
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-thumbnail">Thumbnail URL (optional)</Label>
                <Input
                  id="course-thumbnail"
                  placeholder="https://example.com/image.jpg"
                  value={courseForm.thumbnail}
                  onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-category">Category</Label>
                <Select value={courseForm.category} onValueChange={(value) => setCourseForm({ ...courseForm, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Programming">Programming</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCourseModal(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>Create Course</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Lesson Modal */}
      <Dialog open={showLessonModal} onOpenChange={setShowLessonModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Lesson</DialogTitle>
            <DialogDescription>Add a video lesson to your course</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddLesson}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="lesson-title">Lesson Title</Label>
                <Input
                  id="lesson-title"
                  placeholder="Introduction to Components"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lesson-url">YouTube Video URL</Label>
                <Input
                  id="lesson-url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={lessonForm.video_url}
                  onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lesson-duration">Duration (optional)</Label>
                <Input
                  id="lesson-duration"
                  placeholder="15:30"
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowLessonModal(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>Add Lesson</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="aspect-video bg-slate-100 rounded-md mb-4 flex items-center justify-center overflow-hidden">
                {selectedCourse.thumbnail ? (
                  <img src={selectedCourse.thumbnail} alt={selectedCourse.title} className="w-full h-full object-cover" />
                ) : (
                  <Video className="h-16 w-16 text-muted-foreground" />
                )}
              </div>
              <DialogTitle className="text-2xl">{selectedCourse.title}</DialogTitle>
              <DialogDescription className="text-base">{selectedCourse.description}</DialogDescription>
              <div className="flex gap-2 pt-2">
                <Badge>{selectedCourse.category}</Badge>
                <Badge variant="outline">
                  <Users className="h-3 w-3 mr-1" />
                  {selectedCourse.enrollmentCount || 0} enrolled
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Course Content</h3>
                {user.role === 'instructor' && selectedCourse.instructor_id === user.id && (
                  <Button size="sm" onClick={() => setShowLessonModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Lesson
                  </Button>
                )}
              </div>

              {selectedCourse.lessons?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No lessons yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedCourse.lessons?.map((lesson, index) => (
                    <Card key={lesson.id} className="hover:bg-accent transition-colors cursor-pointer" onClick={() => {
                      if (enrollment || user.role === 'instructor') {
                        setCurrentLesson(lesson);
                        setShowPlayerModal(true);
                      }
                    }}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            {enrollment?.completed_lessons?.includes(lesson.id) ? (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            ) : (
                              <span className="text-sm font-medium">{index + 1}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{lesson.title}</p>
                            {lesson.duration && <p className="text-xs text-muted-foreground">{lesson.duration}</p>}
                          </div>
                          <Play className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              {user.role === 'instructor' && selectedCourse.instructor_id === user.id ? (
                <Button variant="destructive" onClick={() => handleDeleteCourse(selectedCourse.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Course
                </Button>
              ) : enrollment ? (
                <Button variant="outline" disabled>
                  Enrolled
                </Button>
              ) : (
                <Button onClick={() => handleEnroll(selectedCourse.id)} disabled={loading}>
                  Enroll Now - Free
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Video Player Modal */}
      {currentLesson && (
        <Dialog open={showPlayerModal} onOpenChange={setShowPlayerModal}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>{currentLesson.title}</DialogTitle>
            </DialogHeader>
            <div className="aspect-video">
              <iframe
                src={getYouTubeEmbedUrl(currentLesson.video_url)}
                className="w-full h-full rounded-md"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {user.role === 'student' && enrollment && (
              <DialogFooter>
                <Button
                  variant={enrollment.completed_lessons?.includes(currentLesson.id) ? 'outline' : 'default'}
                  onClick={() => {
                    const isCompleted = enrollment.completed_lessons?.includes(currentLesson.id);
                    handleMarkComplete(currentLesson.id, !isCompleted);
                  }}
                >
                  {enrollment.completed_lessons?.includes(currentLesson.id) ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark as Incomplete
                    </>
                  ) : (
                    'Mark as Complete'
                  )}
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
