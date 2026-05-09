import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchObras } from '../lib/apiService';

const SkeletonCard: React.FC = () => (
  <div className="cartoon-card min-w-[120px] w-[120px] h-[180px] bg-pink-200 animate-pulse flex-shrink-0 relative">
    <div className="absolute inset-0 bg-pink-300 opacity-50" />
  </div>
);

const Section: React.FC<any> = ({ title, children, isLoading, isEmpty }) => {
  return (
    <div className="my-6">
      <h2 className="text-xl font-black mb-3 px-2 uppercase tracking-wide bg-white inline-block cartoon-border rounded-xl cartoon-shadow py-1 ml-2">{title}</h2>
      <div className="flex overflow-x-auto no-scrollbar gap-4 px-2 pb-4 pt-2">
        {isLoading ? (
          [1,2,3].map(i => <SkeletonCard key={i} />)
        ) : isEmpty ? (
          <p className="text-gray-500 font-bold ml-2">No hay obras por ahora.</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

const WorkCard: React.FC<any> = ({ work, onClick }) => (
  <div onClick={onClick} className="cartoon-card min-w-[120px] w-[120px] cursor-pointer group flex-shrink-0 relative">
     {work.status === 'FINALIZADO' && <span className="absolute top-1 right-1 bg-blue-500 text-white text-[10px] px-1 font-bold rounded cartoon-border z-10">FINALIZADO</span>}
     {work.is_new && <span className="absolute top-1 left-1 bg-yellow-400 text-white text-[10px] px-1 font-bold rounded cartoon-border z-10">NUEVO</span>}
    <img src={work.cover_url || 'https://placehold.co/120x180/f472b6/ffffff?text=Portada'} alt={work.title} className="w-full h-[180px] object-cover group-active:opacity-80" />
    <div className="p-2 border-t-2 border-gray-800">
      <h3 className="font-bold text-xs truncate uppercase">{work.title}</h3>
    </div>
  </div>
);

// Componente para Cuenta regresiva
const Countdown: React.FC<any> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!targetDate) return;
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft('¡Ya disponible!');
        return;
      }
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return <div className="text-[10px] bg-black text-white px-1 text-center font-mono absolute bottom-0 left-0 right-0">{timeLeft}</div>;
};

export default function Home() {
  const navigate = useNavigate();
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchObras();
      setObras(data);
      setLoading(false);
    };
    load();
  }, []);

  const recentlyAdded = obras.filter(o => !o.is_coming_soon && !o.is_trending).slice(0, 10);
  const comingSoon = obras.filter(o => o.is_coming_soon);
  const dailyUpdates = obras.filter(o => o.is_daily_update);
  const trending = obras.filter(o => o.is_trending);
  const allComicsManhwas = obras.filter(o => ['Comic', 'Manhwa', 'Manga'].includes(o.work_type));
  const finished = obras.filter(o => o.status?.toUpperCase() === 'FINALIZADO');

  const goToClassify = () => navigate('/descubre');
  const goToWork = (id) => navigate(`/obra/${id}`);

  return (
    <div className="pb-10">
      <div className="flex items-center justify-between mt-4 mb-4 px-2">
        <h1 className="text-3xl font-black text-pink-600 drop-shadow-[2px_2px_0_rgba(31,41,55,1)] tracking-tighter">Yourmanga</h1>
        <button onClick={goToClassify} className="cartoon-btn text-[10px] py-1 px-2 border-[2px] border-[#1f2937]">Buscar</button>
      </div>

      <Section title="Añadidos Recientemente" isLoading={loading} isEmpty={!loading && recentlyAdded.length === 0}>
        {recentlyAdded.map(w => <WorkCard key={w.id} work={w} onClick={() => goToWork(w.id)} />)}
      </Section>

      <Section title="Próximamente" isLoading={loading} isEmpty={!loading && comingSoon.length === 0}>
        {comingSoon.map(w => (
          <div key={w.id} onClick={() => goToWork(w.id)} className="cartoon-card min-w-[120px] w-[120px] cursor-pointer group flex-shrink-0 relative bg-white">
            <span className="absolute top-1 left-1 bg-purple-500 text-white text-[10px] px-1 font-bold rounded cartoon-border z-10">PRÓXIMO</span>
            <img src={w.cover_url || 'https://placehold.co/120x180/f472b6/ffffff?text=Portada'} alt={w.title} className="w-full h-[180px] object-cover group-active:opacity-80" />
            <Countdown targetDate={w.scheduled_at} />
            <div className="p-2 border-t-2 border-gray-800">
              <h3 className="font-bold text-xs truncate uppercase">{w.title}</h3>
            </div>
          </div>
        ))}
      </Section>

      <Section title="Actualizaciones Diarias" isLoading={loading} isEmpty={!loading && dailyUpdates.length === 0}>
        {dailyUpdates.map(w => <WorkCard key={w.id} work={w} onClick={() => goToWork(w.id)} />)}
      </Section>

      <Section title="Títulos en Tendencia" isLoading={loading} isEmpty={!loading && trending.length === 0}>
        {trending.map(w => <WorkCard key={w.id} work={w} onClick={() => goToWork(w.id)} />)}
      </Section>

      <div className="my-6">
        <h2 onClick={goToClassify} className="cursor-pointer text-xl font-black mb-3 px-2 uppercase tracking-wide bg-white inline-block cartoon-border rounded-xl cartoon-shadow py-1 ml-2 hover:bg-pink-100 transition-colors">CÓMICS Y MANHWAS <span className="text-pink-500">→</span></h2>
        <div className="flex overflow-x-auto no-scrollbar gap-4 px-2 pb-4 pt-2">
          {loading ? (
            [1,2,3].map(i => <SkeletonCard key={i} />)
          ) : allComicsManhwas.length === 0 ? (
            <p className="text-gray-500 font-bold ml-2">No hay obras por ahora.</p>
          ) : (
            allComicsManhwas.map(w => <WorkCard key={w.id} work={w} onClick={() => goToWork(w.id)} />)
          )}
        </div>
      </div>

      <Section title="Terminados" isLoading={loading} isEmpty={!loading && finished.length === 0}>
        {finished.map(w => <WorkCard key={w.id} work={w} onClick={() => goToWork(w.id)} />)}
      </Section>

      <Section title="Cómics/Manhwas/Mangas Terminados" isLoading={loading} isEmpty={!loading && finished.filter(o => ['Comic', 'Manhwa', 'Manga'].includes(o.work_type)).length === 0}>
        {finished.filter(o => ['Comic', 'Manhwa', 'Manga'].includes(o.work_type)).map(w => <WorkCard key={w.id} work={w} onClick={() => goToWork(w.id)} />)}
      </Section>
    </div>
  );
}
