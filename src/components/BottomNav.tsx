import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, BookOpen, User, PenTool } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';

export default function BottomNav() {
  const { currentUser } = useAuth();

  const navItems = [
    { to: '/', icon: Home, label: 'Inicio' },
    { to: '/descubre', icon: Compass, label: 'Descubre' },
    { to: '/biblioteca', icon: BookOpen, label: 'Biblioteca' },
    { to: '/perfil', icon: User, label: 'Perfil' },
  ];

  if (currentUser?.isAdmin) {
    navItems.push({ to: '/estudio', icon: PenTool, label: 'Estudio' });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-[4px] border-[#1f2937] rounded-t-[2rem] pt-3 pb-4 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isEstudio = item.to === '/estudio';
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  "flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 cursor-pointer min-w-[64px]",
                  // If it's "Estudio", style it like a pink button if active or just always pink button depending on reference
                  // Reference shows Estudio as a big pink button and active. Let's make active ones slightly popped
                  isActive && !isEstudio ? "text-[#1f2937] font-black" : "text-gray-500",
                  isEstudio && isActive ? "bg-[#f472b6] text-white border-[3px] border-[#1f2937] shadow-[2px_2px_0_0_#1f2937] -translate-y-1" : "",
                  isEstudio && !isActive ? "bg-[#fbcfe8] text-[#1f2937] border-[3px] border-[#1f2937] shadow-[2px_2px_0_0_#1f2937]" : ""
                )
              }
            >
              <item.icon size={22} strokeWidth={isEstudio || false ? 3 : 2.5} className={clsx("mb-1")} />
              <span className="text-[10px] font-bold tracking-wider">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
