import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function Layout() {
  return (
    <div className="min-h-screen bg-pink-50 pb-24">
      <main className="max-w-md mx-auto min-h-screen p-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
