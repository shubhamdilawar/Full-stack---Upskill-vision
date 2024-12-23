import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import ForgotPassword from './components/ForgotPassword';
import CreateCourse from './components/CreateCourse';
import ManagerDashboard from './components/ManagerDashboard';
import HRAdminDashboard from './components/HRAdminDashboard';
import InstructorDashboard from './components/InstructorDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/create-course" element={<CreateCourse />} />
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
        <Route path="/hr-admin-dashboard" element={<HRAdminDashboard />} />
        <Route path="/instructor-dashboard" element={<InstructorDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;