import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Calendar from './components/Calendar';
import GroupManagement from './components/GroupManagement';
import Navbar from './components/Navbar';
import AppLayout from './components/Navbar';
const App: React.FC = () => {
  return (
    <Router>
      <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/group-management" element={<GroupManagement />} />
      </Routes>
      </AppLayout>
    </Router>
  );
};

export default App;
