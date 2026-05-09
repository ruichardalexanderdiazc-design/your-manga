/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Discover from './pages/Discover';
import Library from './pages/Library';
import Profile from './pages/Profile';
import Studio from './pages/Studio';
import WorkDetail from './pages/WorkDetail';
import Reader from './pages/Reader';

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" toastOptions={{
        className: 'font-bold border-2 border-gray-800 shadow-[4px_4px_0_0_#1f2937] rounded-xl',
      }} />
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="descubre" element={<Discover />} />
            <Route path="biblioteca" element={<Library />} />
            <Route path="perfil" element={<Profile />} />
            <Route path="estudio" element={<Studio />} />
            <Route path="obra/:id" element={<WorkDetail />} />
          </Route>
          {/* Reader is outside of Layout because it occupies full screen */}
          <Route path="/leer/:workId/capitulo/:chapterId" element={<Reader />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
