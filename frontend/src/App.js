import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import ForgotPassword from './components/ForgotPassword';
import CreateCourse from './components/CreateCourse';
import ManagerDashboard from './components/ManagerDashboard';
import HRAdminDashboard from './components/HRAdminDashboard';
import InstructorDashboard from './components/InstructorDashboard';
import CourseOverview from './components/CourseOverview';
import AdminEditSuite from './components/AdminEditSuite';
import ProtectedRoute from './components/ProtectedRoute';
import CourseDetails from './pages/CourseDetails';
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983
import CourseInsights from './components/CourseInsights';
import StudentDetails from './components/StudentDetails';
import ParticipantCourseDetails from './components/ParticipantCourseDetails';
import QuizPage from './components/QuizPage';
<<<<<<< HEAD
=======
=======
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Protected Routes */}
        <Route 
          path="/instructor-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['Instructor']}>
              <InstructorDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/manager-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['Manager']}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/hr-admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={['HR Admin']}>
              <HRAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['Participant']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Other Routes */}
        <Route path="/courses" element={<CourseOverview />} />
        <Route path="/admin/courses" element={<AdminEditSuite />} />
        <Route 
          path="/course/:courseId/details" 
          element={
            <ProtectedRoute allowedRoles={['Instructor']}>
              <CourseDetails />
            </ProtectedRoute>
          } 
        />
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983
        <Route 
          path="/course/:courseId/insights" 
          element={
            <ProtectedRoute>
              <CourseInsights />
            </ProtectedRoute>
          } 
        />
        <Route path="/courses/:courseId/students/:studentId" element={<StudentDetails />} />
        <Route 
          path="/participantdashboard/:courseId/viewdetails" 
          element={
            <ProtectedRoute>
              <ParticipantCourseDetails />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/courses/:courseId/quizzes/:quizId" 
          element={
            <ProtectedRoute allowedRoles={['Participant']}>
              <QuizPage />
            </ProtectedRoute>
          }
        />
<<<<<<< HEAD
=======
=======
>>>>>>> 7dd64ab7236d2d413916d3989d6ea64b0bb306a8
>>>>>>> 753245e39b3c3e4bdeac6ccfdf0b81815f1ef983

        {/* 404 Route */}
        <Route path="*" element={
          <div className="not-found">
            <h1>404 - Page Not Found</h1>
            <button onClick={() => window.history.back()}>Go Back</button>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;