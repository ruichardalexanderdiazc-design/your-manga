import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchChapters, fetchObraById } from '../lib/apiService';
import { Heart, Info, Share2, ChevronLeft, ChevronRight, Menu, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Reader() {
  const { workId, chapterId } = useParams();
  const navigate = useNavigate();

  const [work, setWork] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(-1);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uiVisible, setUiVisible] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchObraById(workId),
      fetchChapters(workId)
    ]).then(([w, c]) => {
      setWork(w);
      const sorted = c.sort((a,b) => a.chapter_number - b.chapter_number);
      setChapters(sorted);
      
      const idx = sorted.findIndex(ch => String(ch.id) === String(chapterId));
      setCurrentChapterIndex(idx);
      
      if(idx !== -1) {
        const pgs = sorted[idx].pages;
        setPages(typeof pgs === 'string' ? JSON.parse(pgs) : (pgs || []));
      }
      setLoading(false);
    });
  }, [workId, chapterId]);

  const handleToggleUi = () => setUiVisible(!uiVisible);

  const handleSubscribe = (e) => {
    e.stopPropagation();
    if(subscribed) {
      setSubscribed(false);
      toast.success('Suscripción cancelada.');
    } else {
      setSubscribed(true);
      toast('ENTENDIDO, RECIBIRÁS UNA NOTIFICACIÓN DE CAMPANA CUANDO HAYA UNA NUEVA ACTUALIZACIÓN.', { icon: <Bell className="text-yellow-500"/> });
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: `¡NO DEJO DE LEER ${work?.title}!`,
        text: `Te invito a leer el Capítulo ${chapters[currentChapterIndex]?.chapter_number} de ${work?.title}.`,
         url: window.location.href,
      }).catch(console.error);
    } else {
      toast.success('Enlace copiado al portapapeles');
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const goInfo = (e) => {
    e.stopPropagation();
    navigate(`/obra/${workId}`);
  };

  const goPrev = (e) => {
    e.stopPropagation();
    if (currentChapterIndex > 0) {
      navigate(`/leer/${workId}/capitulo/${chapters[currentChapterIndex - 1].id}`);
    }
  };

  const goNext = (e) => {
    e.stopPropagation();
    if (currentChapterIndex < chapters.length - 1) {
      navigate(`/leer/${workId}/capitulo/${chapters[currentChapterIndex + 1].id}`);
    } else {
       toast.success('¡Has llegado al final!');
       navigate(`/obra/${workId}`);
    }
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center font-black py-4 animate-pulse"><div className="w-16 h-16 border-4 border-pink-500 rounded-full border-t-transparent animate-spin"/></div>;
  if (currentChapterIndex === -1) return <div className="text-center font-black mt-20">Capítulo no encontrado</div>;

  return (
    <div className="bg-black min-h-screen text-white relative" onClick={handleToggleUi}>
      
      {/* Top UI */}
      <div className={`fixed top-0 left-0 right-0 p-4 pt-6 bg-gradient-to-b from-black/80 to-transparent transition-transform duration-300 z-50 flex justify-between items-start ${uiVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div>
          <h2 className="font-black text-lg drop-shadow-md line-clamp-1">{work?.title}</h2>
          <p className="text-xs font-bold text-gray-300 drop-shadow-md">Capítulo {chapters[currentChapterIndex]?.chapter_number}: {chapters[currentChapterIndex]?.title}</p>
        </div>
        <div className="flex gap-4 items-center pl-4">
          <button onClick={handleSubscribe} className="text-white hover:text-pink-400 drop-shadow-md flex items-center" title="Suscribirse">
            <Heart size={24} fill={subscribed ? 'currentColor' : 'none'} className={subscribed ? 'text-pink-500' : ''}/>
            <span className="text-[10px] font-black absolute -bottom-1 -right-1 leading-none drop-shadow-md">+</span>
          </button>
          <button onClick={goInfo} className="text-white hover:text-pink-400 drop-shadow-md">
            <Info size={24} />
          </button>
        </div>
      </div>

      {/* Pages Container */}
      <div className="flex flex-col w-full max-w-2xl mx-auto min-h-screen">
        {pages.length > 0 ? pages.map((pageUrl, idx) => (
           <img key={idx} src={pageUrl} alt={`Page ${idx+1}`} className="w-full object-contain m-0 p-0 block" loading="lazy" />
        )) : (
          <div className="h-screen flex items-center justify-center text-gray-500 font-bold px-4 text-center">
            Este capítulo aún no tiene páginas agregadas.
          </div>
        )}
      </div>

      {/* Sharing overlay shortcut */}
      {uiVisible && (
         <button onClick={handleShare} className="fixed right-4 bottom-24 bg-pink-500 text-white p-3 rounded-full cartoon-border cartoon-shadow-lg z-50">
           <Share2 size={24} />
         </button>
      )}

      {/* Bottom UI */}
      <div className={`fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t-2 border-gray-800 p-4 transition-transform duration-300 z-50 flex justify-between items-center pb-8 ${uiVisible ? 'translate-y-0' : 'translate-y-full'}`}>
        <button onClick={goPrev} disabled={currentChapterIndex === 0} className={`p-2 rounded-xl cartoon-border bg-gray-800 ${currentChapterIndex === 0 ? 'opacity-50' : 'active:bg-gray-700'}`}>
          <ChevronLeft size={24} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); setShowDrawer(true); }} className="p-2 rounded-xl cartoon-border bg-gray-800 active:bg-gray-700">
          <Menu size={24} />
        </button>
        <button onClick={goNext} className="p-2 rounded-xl cartoon-border bg-gray-800 active:bg-gray-700 flex items-center">
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Chapters Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-end">
          <div className="w-full bg-white text-black h-[70vh] rounded-t-3xl cartoon-border overflow-hidden flex flex-col" onClick={e=>e.stopPropagation()}>
            <div className="p-4 border-b-2 border-gray-200 flex justify-between items-center">
              <h3 className="font-black text-xl uppercase">Capítulos</h3>
              <button onClick={()=>setShowDrawer(false)} className="bg-gray-200 text-black px-3 py-1 rounded-full font-bold text-sm cartoon-border">Cerrar</button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-2">
              <div className="grid grid-cols-1 gap-2">
                 {chapters.map((ch, idx) => (
                   <div key={ch.id} 
                        onClick={() => { setShowDrawer(false); navigate(`/leer/${workId}/capitulo/${ch.id}`); }} 
                        className={`flex items-center p-2 rounded-xl cartoon-border cursor-pointer ${idx === currentChapterIndex ? 'bg-pink-100 border-pink-400' : 'bg-gray-50'}`}>
                     <img src={ch.cover_url || work?.cover_url || 'https://placehold.co/50x50'} className="w-12 h-12 object-cover rounded-lg mr-3 border border-gray-300"/>
                     <div>
                       <h4 className="font-black text-sm uppercase">Capítulo {ch.chapter_number}</h4>
                       <p className="text-[10px] font-bold text-gray-500">{ch.title || ''}</p>
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
