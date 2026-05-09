import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchObras } from '../lib/apiService';
import { Search, Filter, Heart, FileText, Eye } from 'lucide-react';

export default function Discover() {
  const [obras, setObras] = useState([]);
  const [filteredObras, setFilteredObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchObras().then(data => {
      setObras(data);
      setFilteredObras(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = obras;
    if (search) {
      result = result.filter(o => o.title.toLowerCase().includes(search.toLowerCase()) || o.author?.toLowerCase().includes(search.toLowerCase()));
    }
    if (genre) {
      result = result.filter(o => o.categories && o.categories.includes(genre));
    }
    setFilteredObras(result);
  }, [search, genre, obras]);

  return (
    <div className="pb-10 pt-4">
      <h1 className="text-2xl font-black mb-4 px-2 uppercase bg-white inline-block cartoon-border rounded-xl cartoon-shadow py-1 ml-2">Cómics y Manhwas</h1>
      
      <div className="px-2 mb-6">
        <div className="flex gap-2 mb-2">
          <div className="flex-1 bg-white cartoon-border rounded-xl flex items-center px-3 py-2 cartoon-shadow">
            <Search className="text-gray-400 mr-2" size={20} />
            <input 
              type="text" 
              placeholder="Buscar título o autor..." 
              className="w-full outline-none font-bold text-gray-700 bg-transparent"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="cartoon-btn px-3 flex items-center justify-center bg-yellow-400 text-black">
            <Filter size={20} />
          </button>
        </div>
        
        {/* Filtros simples */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 py-2">
          {['Todos', 'Acción', 'Fantasía', 'Romance', 'BL', 'Drama', '+18'].map(g => (
            <button 
              key={g} 
              onClick={() => setGenre(g === 'Todos' ? '' : g)}
              className={`whitespace-nowrap px-3 py-1 font-bold text-sm rounded-xl cartoon-border ${genre === g || (g === 'Todos' && !genre) ? 'bg-pink-500 text-white' : 'bg-white'}`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-2">
        {loading ? (
          [1,2,3,4].map(i => <div key={i} className="h-48 bg-pink-200 animate-pulse rounded-2xl cartoon-border" />)
        ) : filteredObras.length === 0 ? (
          <p className="col-span-2 text-center font-bold text-gray-500 mt-10">No se encontraron resultados.</p>
        ) : (
          filteredObras.map(o => (
            <div key={o.id} onClick={() => navigate(`/obra/${o.id}`)} className="cartoon-card cursor-pointer group flex flex-col h-full">
              <div className="relative">
                {o.status === 'FINALIZADO' && <span className="absolute top-1 right-1 bg-blue-500 text-white text-[10px] px-1 font-bold rounded cartoon-border z-10">FINALIZADO</span>}
                <img src={o.cover_url || 'https://placehold.co/200x300'} alt={o.title} className="w-full h-40 object-cover" />
              </div>
              <div className="p-2 flex-col flex justify-between flex-1">
                <h3 className="font-bold text-sm line-clamp-2 uppercase leading-tight mb-1">{o.title}</h3>
                <div>
                  <p className="text-[10px] text-gray-600 font-bold mb-1 truncate">{o.author || 'Admin'}</p>
                  <div className="flex gap-2 text-[10px] font-bold text-gray-500">
                    <span className="flex items-center gap-0.5"><Eye size={12}/> {o.read_count || 0}</span>
                    <span className="flex items-center gap-0.5"><Heart size={12}/> {o.likes_count || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
