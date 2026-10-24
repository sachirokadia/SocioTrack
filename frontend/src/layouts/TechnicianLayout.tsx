import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const TechnicianLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f2faf9]">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default TechnicianLayout;
