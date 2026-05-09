import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchObraById, fetchChapters, addToLibrary } from '../lib/apiService';
import { useAuth } from '../context/AuthContext';
import { Share2, MoreVertical, Flag, Play, ChevronDown, List as ListIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WorkDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [work, setWork] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [showAllChapters, setShowAllChapters] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchObraById(id),
      fetchChapters(id)
    ]).then(([workData, chaptersData]) => {
      setWork(workData);
      setChapters(chaptersData);
      setLoading(false);
    });
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `¡NO DEJO DE LEER ${work?.title}!`,
        text: `Te invito a leer ${work?.title}.`,
         url: window.location.href,
      }).catch(console.error);
    } else {
      toast.success('Enlace copiado al portapapeles');
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleReport = () => {
    toast('Reporte enviado al administrador.', { icon: <Flag className="text-red-500" /> });
  };

  const readChapter = (chapterId) => {
    if (currentUser?.email) {
       addToLibrary(id, currentUser.email);
    }
    navigate(`/leer/${id}/capitulo/${chapterId}`);
  };

  if (loading) return <div className="p-4 animate-pulse pt-10"><div className="w-full h-80 bg-pink-200 rounded-2xl cartoon-border"></div></div>;
  if (!work) return <div className="p-4 pt-20 text-center font-black text-xl">Obra no encontrada</div>;

  const displayChapters = [...chapters].sort((a,b) => sortAsc ? a.chapter_number - b.chapter_number : b.chapter_number - a.chapter_number);
  const visibleChapters = showAllChapters ? displayChapters : displayChapters.slice(0, 3);
  
  const categories = typeof work.categories === 'string' ? JSON.parse(work.categories) : work.categories || [];
  const tags = typeof work.tags === 'string' ? JSON.parse(work.tags) : work.tags || [];

  return (
    <div className="pb-20">
      <div className="relative">
        {/* Netflix style big image */}
        <div className="h-[60vh] w-[100vw] ml-[calc(50%-50vw)] relative">
          <div className="absolute inset-0 bg-gradient-to-t from-pink-50 via-transparent to-transparent z-10" />
          <img src={work.cover_url || 'https://placehold.co/800x1200'} className="w-full h-full object-cover" />
          
          <div className="absolute top-4 right-4 z-20 flex gap-2">
            <button onClick={handleShare} className="bg-white p-2 rounded-full cartoon-border cartoon-shadow"><Share2 size={20} /></button>
            <button onClick={handleReport} className="bg-white p-2 rounded-full cartoon-border cartoon-shadow"><MoreVertical size={20} /></button>
          </div>
        </div>
      </div>

      <div className="relative z-20 -mt-10 px-4">
        <h1 className="text-4xl font-black uppercase drop-shadow-[2px_2px_0_rgba(255,255,255,1)] text-pink-600 leading-none mb-2">{work.title}</h1>
        <div className="flex gap-2 items-center mb-4 flex-wrap">
          <span className={`text-[10px] font-black px-2 py-1 rounded cartoon-border text-white ${work.status === 'En emisión' ? 'bg-green-500' : 'bg-blue-500'}`}>
            {work.status?.toUpperCase() || 'DESCONOCIDO'}
          </span>
          <span className="text-xs font-bold text-gray-500">{work.author}</span>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
          {[...categories, ...tags].map(c => (
            <span key={c} className="bg-white px-2 py-0.5 rounded-full cartoon-border text-[10px] font-bold whitespace-nowrap">{c}</span>
          ))}
        </div>

        <div className="bg-white p-4 rounded-xl cartoon-border cartoon-shadow mb-6">
          <h3 className="font-black mb-1">Sinopsis</h3>
          <p className={`text-sm font-bold text-gray-600 ${!showFullSynopsis && 'line-clamp-3'}`}>
            {work.synopsis || 'Sin sinopsis.'}
          </p>
          {work.synopsis?.length > 100 && (
            <button onClick={() => setShowFullSynopsis(!showFullSynopsis)} className="text-pink-500 font-bold text-xs mt-1">
              {showFullSynopsis ? 'Leer menos' : 'Leer más'}
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black uppercase">Capítulos ({chapters.length})</h2>
          <button onClick={() => setSortAsc(!sortAsc)} className="text-sm font-bold bg-gray-200 px-2 py-1 rounded-lg cartoon-border flex items-center">
            <ListIcon size={16} className="mr-1"/> {sortAsc ? 'Inicio a fin' : 'Fin a inicio'}
          </button>
        </div>

        <div className="space-y-3">
           {visibleChapters.map(c => (
             <div key={c.id} onClick={() => readChapter(c.id)} className="cartoon-card p-2 flex items-center cursor-pointer active:scale-95 transition-transform">
               <img src={c.cover_url || work.cover_url || 'https://placehold.co/100x100'} className="w-16 h-16 object-cover rounded-lg cartoon-border" />
               <div className="ml-3 flex-1">
                 <h4 className="font-black text-sm uppercase">Capítulo {c.chapter_number}</h4>
                 <p className="text-[10px] font-bold text-gray-400">{c.title || 'Sin título'}</p>
               </div>
               <div className="mr-2 bg-pink-100 p-2 rounded-full text-pink-500 border border-pink-300">
                 <Play fill="currentColor" size={16} />
               </div>
             </div>
           ))}
        </div>
        
        {!showAllChapters && chapters.length > 3 && (
          <button onClick={() => setShowAllChapters(true)} className="cartoon-btn w-full mt-4 flex items-center justify-center bg-white text-black">
             MÁS CAPÍTULOS <ChevronDown className="ml-1" size={16}/>
          </button>
        )}
      </div>
    </div>
  );
}
