import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function Layout() {
  return (
    <div className="min-h-screen bg-pink-50 pb-24">
      <header className="max-w-md mx-auto flex items-center justify-between px-4 py-3 mt-2 mb-2 rounded-3xl bg-white shadow-[4px_4px_0_0_rgba(31,41,55,1)] border-2 border-gray-800 cartoon-border">
        <div className="flex items-center gap-3">
          <img src="./logo.svg" alt="Yourmanga" className="w-12 h-12" />
          <div>
            <h1 className="text-xl font-black text-pink-600 tracking-tight">Yourmanga</h1>
            <p className="text-xs text-gray-500">Lectura manga, manhwa y cómic</p>
          </div>
        </div>
      </header>
      <main className="max-w-md mx-auto min-h-screen p-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
