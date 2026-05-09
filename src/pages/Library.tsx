import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchLibrary } from '../lib/apiService';
import { useNavigate } from 'react-router-dom';

export default function Library() {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.email) {
      fetchLibrary(currentUser.email).then(data => {
        setItems(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center p-4 h-[70vh]">
        <div className="cartoon-card p-6 text-center">
          <h2 className="text-xl font-black mb-4 uppercase">Inicia Sesión</h2>
          <p className="font-bold text-gray-600 mb-6 font-sm">Necesitas iniciar sesión para ver tu biblioteca.</p>
          <button onClick={() => navigate('/perfil')} className="cartoon-btn w-full">Ingresar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 pb-10 px-2">
      <h1 className="text-2xl font-black mb-6 uppercase bg-white inline-block cartoon-border rounded-xl cartoon-shadow py-1 px-3">Mi Biblioteca</h1>
      
      {loading ? (
        <div className="animate-pulse space-y-4">
           {[1,2,3].map(i => <div key={i} className="h-24 bg-pink-200 rounded-2xl cartoon-border w-full"/>)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center mt-20">
          <p className="font-black text-gray-400 text-lg">Tu biblioteca está vacía.</p>
          <button onClick={() => navigate('/descubre')} className="cartoon-btn mt-4">Explorar Obras</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => (
            <div key={item.id} onClick={() => navigate(`/obra/${item.work_id}`)} className="cartoon-card flex cursor-pointer active:scale-95 transition-transform">
               <img src={item.work?.cover_url || 'https://placehold.co/100x150'} className="w-24 h-32 object-cover border-r-2 border-cartoon-border" alt="" />
               <div className="p-3">
                 <h3 className="font-black uppercase line-clamp-2">{item.work?.title}</h3>
                 <p className="text-xs font-bold text-gray-500 mt-2">Guardado automáticamente</p>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
