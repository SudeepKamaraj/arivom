import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate} from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CourseProvider } from './contexts/CourseContext';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import CourseDetail from './components/CourseDetail';
import VideoPlayer from './components/VideoPlayer';
import Assessment from './components/Assessment';
import Certificate from './components/Certificate';
import CourseCompletion from './components/CourseCompletion';
import Recommendations from './components/Recommendations';
import AllCourses from './components/AllCourses';
import Navigation from './components/Navigation';
import LoadingSpinner from './components/LoadingSpinner';
import AdminCourses from './components/AdminCourses';
import Profile from './components/Profile.tsx';
import Settings from './components/Settings.tsx';


function AppContent() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  // Optionally, you can use context for selectedCourse/selectedLesson if needed globally
  const [selectedCourse, setSelectedCourse] = React.useState<any>(null);
  const [selectedLesson, setSelectedLesson] = React.useState<any>(null);
  
  // Function to refresh course data after assessment completion
  const refreshCourseData = async (courseId: string) => {
    if (!courseId) return;
    
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const updatedCourse = await response.json();
          setSelectedCourse(updatedCourse);
        }
      }
    } catch (error) {
      console.error('Error refreshing course data:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-isabelline dark:bg-gray-950">
      {user && (
        <Navigation />
      )}
      <main>
        <Routes>
          <Route path="/" element={
            <HomePage
              onCourseSelect={(course) => {
                setSelectedCourse(course);
                navigate(`/courses/${(course as any)._id || course.id}`);
              }}
            />
          } />
          <Route path="/dashboard" element={
            <Dashboard
              onCourseSelect={(course) => {
                setSelectedCourse(course);
                navigate(`/courses/${(course as any)._id || course.id}`);
              }}
              onViewCertificate={(course) => {
                setSelectedCourse(course);
                navigate(`/courses/${(course as any)._id || course.id}/certificate`);
              }}
            />
          } />
          <Route path="/recommendations" element={
            <Recommendations
              onCourseSelect={(course) => {
                setSelectedCourse(course);
                navigate(`/courses/${(course as any)._id}`);
              }}
            />
          } />
          <Route path="/all-courses" element={
            <AllCourses
              onCourseSelect={(course) => {
                setSelectedCourse(course);
                navigate(`/courses/${(course as any)._id}`);
              }}
            />
          } />
          <Route path="/admin-courses" element={<AdminCourses />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/courses/:courseId" element={
            <CourseDetail
              course={selectedCourse}
              onLessonSelect={(lesson) => {
                setSelectedLesson(lesson);
                navigate(`/courses/${selectedCourse?._id}/lessons/${lesson._id}`);
              }}
              onAssessmentStart={async () => {
                // Always refresh course data before starting assessment
                if (selectedCourse?._id) {
                  await refreshCourseData(selectedCourse._id);
                }
                navigate(`/courses/${selectedCourse?._id}/assessment`);
              }}
              onAssessmentComplete={async () => {
                // This will handle the async update when returning from assessment
                if (selectedCourse?._id) {
                  await refreshCourseData(selectedCourse._id);
                }
              }}
              onBack={() => navigate('/dashboard')}
            />
          } />
          <Route path="/courses/:courseId/lessons/:lessonId" element={
            <VideoPlayer
              lesson={selectedLesson}
              course={selectedCourse}
              onComplete={() => navigate(`/courses/${selectedCourse?._id}`)}
              onBack={() => navigate(`/courses/${selectedCourse?._id}`)}
            />
          } />
          <Route path="/courses/:courseId/assessment" element={
            <Assessment
              course={selectedCourse}
              onComplete={async (passed) => {
                // Refresh the course data first
                if (selectedCourse?._id) {
                  await refreshCourseData(selectedCourse._id);
                }
                
                if (passed) {
                  // Show certificate on successful completion
                  navigate(`/courses/${selectedCourse?._id}/certificate`);
                } else {
                  // Go back to course page
                  navigate(`/courses/${selectedCourse?._id}`);
                }
              }}
              onBack={() => navigate(`/courses/${selectedCourse?._id}`)}
            />
          } />
          <Route path="/courses/:courseId/complete" element={
            <CourseCompletion
              course={selectedCourse}
              onBack={() => navigate(`/courses/${selectedCourse?._id}`)}
            />
          } />
          <Route path="/courses/:courseId/certificate" element={
            <Certificate
              course={selectedCourse}
              onBack={() => navigate('/dashboard')}
            />
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}


function App() {
  return (
    <AuthProvider>
      <CourseProvider>
        <Router>
          <AppContent />
        </Router>
      </CourseProvider>
    </AuthProvider>
  );
}

export default App;