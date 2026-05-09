import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { publishWork, addChapter } from '../lib/apiService';
import { uploadFileToSupabase } from '../lib/supabase';
import { PlusCircle, Image as ImageIcon, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function Studio() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    work_type: 'Manhwa',
    cover_url: '',
    title: '',
    synopsis: '',
    status: 'En emisión',
    chapterCount: 1, 
    categories: [],
    tags: [],
    is_coming_soon: false,
    scheduled_at: null
  });

  const [chaptersData, setChaptersData] = useState({});

  if (!currentUser?.isAdmin) {
    return <div className="p-4 text-center mt-20 font-black text-xl text-red-500">Acceso Denegado</div>;
  }

  const updateForm = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const updateChapter = (index, value) => {
    setChaptersData(prev => ({ ...prev, [index]: value }));
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    toast.loading("Procesando portada...", { id: "upload-cover" });
    try {
      const url = await uploadFileToSupabase(file, `covers/${Date.now()}_${file.name}`);
      updateForm('cover_url', url);
      toast.success("Portada añadida", { id: "upload-cover" });
    } catch (err) {
      console.error(err);
      toast.error("Error al procesar portada", { id: "upload-cover" });
    }
  };

  const handlePagesUpload = async (e, chapNum) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    toast.loading(`Procesando ${files.length} páginas...`, { id: `upload-chap-${chapNum}` });
    
    try {
      const urls = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadFileToSupabase(files[i], `chapters/${Date.now()}_chap${chapNum}_page${i}_${files[i].name}`);
        urls.push(url);
      }
      
      const existing = chaptersData[chapNum] || '';
      const newUrls = urls.join('\n');
      updateChapter(chapNum, existing ? existing + '\n' + newUrls : newUrls);
      toast.success("Páginas añadidas", { id: `upload-chap-${chapNum}` });
    } catch (err) {
      console.error(err);
      toast.error("Error al procesar páginas", { id: `upload-chap-${chapNum}` });
    }
  };

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const handlePublish = async () => {
    try {
      const payload = {
        ...formData,
        categories: JSON.stringify(formData.categories),
        tags: JSON.stringify(formData.tags)
      };
      
      const newWork = await publishWork(payload, currentUser.email);
      
      for(let i=1; i<=formData.chapterCount; i++) {
        const pagesString = chaptersData[i] || '';
        const pagesArray = pagesString.split('\n').map(l => l.trim()).filter(l => l);

        await addChapter({
          work_id: newWork.id || newWork.work_id || newWork.insert_id, // Manejar varias respuestas
          chapter_number: i,
          title: `Capitulo ${i}`,
          pages: JSON.stringify(pagesArray)
        }, currentUser.email);
      }
      
      toast.success('¡Obra publicada con éxito!');
      navigate('/');
    } catch (error) {
      toast.error('Error al publicar');
      console.error(error);
    }
  };

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      <h1 className="text-xl font-black mb-6 mt-4 uppercase bg-white border-[4px] border-[#1f2937] rounded-xl py-2 px-4 shadow-[4px_4px_0_0_#1f2937] text-center w-fit mx-auto">
        ESTUDIO DE CREADOR
      </h1>
      
      {step === 1 && (
        <div className="bg-white border-[4px] border-[#1f2937] rounded-[1.5rem] p-5 shadow-[6px_6px_0_0_#1f2937] space-y-4">
          <h2 className="font-black text-lg text-[#1f2937]">Paso 1: Obra y Portada</h2>
          <div>
            <label className="font-bold block mb-1 text-[#1f2937]">Tipo de Obra</label>
            <select 
              className="w-full border-[3px] border-[#1f2937] rounded-xl p-3 bg-white focus:outline-none font-bold"
              value={formData.work_type} onChange={e => updateForm('work_type', e.target.value)}
            >
              <option value="Manhwa">Manhwa</option>
              <option value="Comic">Comic</option>
              <option value="Manga">Manga</option>
              <option value="Novela">Historia / Novela</option>
            </select>
          </div>
          <div>
            <label className="font-bold block mb-1 text-[#1f2937]">URL de la Portada</label>
            <div className="relative">
               <input type="text" className="w-full border-[3px] border-[#1f2937] rounded-xl p-3 bg-white mb-2 font-bold focus:outline-none" 
                      value={formData.cover_url} onChange={e => updateForm('cover_url', e.target.value)} placeholder="https://..."/>
               <label className="absolute right-2 top-2 p-1.5 bg-pink-100 rounded-lg cursor-pointer border-[2px] border-[#1f2937] hover:bg-pink-200">
                  <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} />
                  <ImageIcon size={20} className="text-[#1f2937]"/>
               </label>
            </div>
            {formData.cover_url && <img src={formData.cover_url} className="w-32 h-48 object-cover border-[3px] border-[#1f2937] shadow-[4px_4px_0_0_#1f2937] rounded-xl mx-auto mt-2" alt="Portada de la obra" />}
          </div>
          <button onClick={handleNext} className="cartoon-btn w-full mt-4 flex items-center justify-center bg-[#ec4899] border-[#1f2937] border-[3px] text-white shadow-[4px_4px_0_0_#1f2937] py-3 rounded-xl hover:-translate-y-1 transition-transform">
            Siguiente <ChevronRight className="ml-1"/>
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="cartoon-card p-4 space-y-4">
          <h2 className="font-black text-lg">Paso 2: Detalles y Estado</h2>
          <input type="text" placeholder="Título" className="w-full cartoon-border rounded-xl p-3 font-bold uppercase" 
                 value={formData.title} onChange={e => updateForm('title', e.target.value)} />
          <textarea placeholder="Sinopsis..." className="w-full cartoon-border rounded-xl p-3 font-bold h-24" 
                    value={formData.synopsis} onChange={e => updateForm('synopsis', e.target.value)} />
          
          <div>
            <label className="font-bold block mb-1">Estado</label>
            <div className="flex gap-2">
              <button onClick={() => updateForm('status', 'FINALIZADO')} className={`flex-1 p-2 rounded-xl cartoon-border font-bold ${formData.status === 'FINALIZADO' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>Finalizado</button>
              <button onClick={() => updateForm('status', 'En emisión')} className={`flex-1 p-2 rounded-xl cartoon-border font-bold ${formData.status === 'En emisión' ? 'bg-green-500 text-white' : 'bg-gray-100'}`}>En emisión</button>
            </div>
          </div>

          <div>
            <label className="font-bold block mb-1">Número de capítulos a agregar ahora</label>
            <input type="number" min="1" className="w-full cartoon-border rounded-xl p-2 font-bold" 
                   value={formData.chapterCount} onChange={e => updateForm('chapterCount', parseInt(e.target.value) || 1)} />
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={handlePrev} className="cartoon-btn bg-gray-400">Atrás</button>
            <button onClick={handleNext} className="cartoon-btn flex-1">Siguiente <ChevronRight /></button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
           <h2 className="font-black text-lg px-2 text-[#1f2937]">Paso 3: Agregar Capítulos</h2>
           <p className="px-2 text-xs font-bold text-gray-500">Pega los enlaces (URLs) de las imágenes para cada capítulo o toca el icono para subirlas.</p>
           <div className="space-y-4">
              {Array.from({length: formData.chapterCount}).map((_, i) => {
                const chapNum = i + 1;
                return (
                  <div key={i} className="bg-white border-[4px] border-[#1f2937] rounded-3xl p-4 shadow-[4px_4px_0_0_#1f2937]">
                    <div className="flex justify-between items-center mb-2">
                       <h3 className="font-black uppercase text-[#1f2937]">Capítulo {chapNum}</h3>
                       <label className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-100 rounded-xl cursor-pointer border-[3px] border-[#1f2937] hover:bg-pink-200 font-bold text-xs text-[#1f2937] shadow-[2px_2px_0_0_#1f2937]">
                          <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => handlePagesUpload(e, chapNum)} />
                          <ImageIcon size={16} /> Subir Imágenes
                       </label>
                    </div>
                    <textarea 
                      placeholder="https://ejemplo.com/imagen1.jpg&#10;https://ejemplo.com/imagen2.jpg"
                      className="w-full border-[3px] border-[#1f2937] rounded-xl p-3 font-bold text-sm h-32 focus:outline-none"
                      value={chaptersData[chapNum] || ''}
                      onChange={(e) => updateChapter(chapNum, e.target.value)}
                    />
                  </div>
                );
              })}
           </div>
           <div className="flex gap-2 mt-4 px-2">
            <button onClick={handlePrev} className="cartoon-btn bg-gray-400">Atrás</button>
            <button onClick={handleNext} className="cartoon-btn flex-1 bg-[#ec4899]">Siguiente <ChevronRight /></button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="cartoon-card p-4 space-y-4">
          <h2 className="font-black text-lg">Paso 4: Etiquetas y Categorías</h2>
          
          <div>
            <label className="font-bold block mb-2">Categoría Principal (Múltiple)</label>
            <div className="flex flex-wrap gap-2">
              {['YAOI', 'BL', '+18', 'GORE'].map(f => (
                 <button key={f} 
                   onClick={() => {
                     const acts = formData.categories;
                     updateForm('categories', acts.includes(f) ? acts.filter(x=>x!==f) : [...acts, f]);
                   }}
                   className={`px-3 py-1 text-sm font-bold cartoon-border rounded-xl ${formData.categories.includes(f) ? 'bg-red-500 text-white' : 'bg-gray-100'}`}
                 >{f}</button>
              ))}
            </div>
          </div>

          <div>
             <label className="font-bold block mb-2">Etiquetas</label>
             <div className="flex flex-wrap gap-2">
                {['Acción', 'Vida Cotidiana', 'Fantasía', 'Drama', 'Suspenso', 'Escolar', 'Adolescentes', 'Bullying', 'Chico Rudo', 'Cárcel'].map(t => (
                  <button key={t}
                    onClick={() => {
                      const tags = formData.tags;
                      updateForm('tags', tags.includes(t) ? tags.filter(x=>x!==t) : [...tags, t]);
                    }}
                    className={`px-3 py-1 text-xs font-bold cartoon-border rounded-xl ${formData.tags.includes(t) ? 'bg-pink-500 text-white' : 'bg-white'}`}
                  >{t}</button>
                ))}
             </div>
          </div>

          {formData.status === 'En emisión' && (
            <div className="bg-yellow-100 p-3 rounded-xl cartoon-border mt-4">
              <label className="font-black block mb-2">¿Agregar en PRÓXIMAMENTE?</label>
              <div className="flex flex-col gap-2">
                <button onClick={() => updateForm('is_coming_soon', true)} className={`p-2 font-bold cartoon-border rounded-xl ${formData.is_coming_soon ? 'bg-yellow-400' : 'bg-white'}`}>SÍ (Requiere Fecha)</button>
                {formData.is_coming_soon && (
                  <input type="datetime-local" className="w-full cartoon-border rounded-xl p-2 font-bold" 
                      onChange={e => updateForm('scheduled_at', new Date(e.target.value).toISOString())} />
                )}
                <button onClick={() => updateForm('is_coming_soon', false)} className={`p-2 font-bold cartoon-border rounded-xl ${!formData.is_coming_soon ? 'bg-yellow-400' : 'bg-white'}`}>NO (Publicar de una vez)</button>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button onClick={handlePrev} className="cartoon-btn bg-gray-400">Atrás</button>
            <button onClick={handleNext} className="cartoon-btn flex-1 bg-green-500 text-white">Revisión Final <CheckCircle2 className="inline ml-1"/></button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="cartoon-card p-4 space-y-4">
          <h2 className="font-black text-xl text-center bg-yellow-300 cartoon-border rounded-xl py-1 transform -rotate-1 mb-6 text-black">LA OBRA ESTÁ LISTA</h2>
          
          <div className="flex flex-col items-center border-b-2 border-cartoon-border pb-4">
            <img src={formData.cover_url || 'https://placehold.co/200x300'} className="w-32 h-48 object-cover cartoon-border rounded-xl mb-4" alt="Portada" />
            <h3 className="font-black text-lg uppercase text-center">{formData.title || 'Sin Título'}</h3>
          </div>
          
          <ul className="text-sm font-bold space-y-2">
            <li><span className="text-gray-500">Estado:</span> {formData.status}</li>
            <li><span className="text-gray-500">Tipo de obra:</span> {formData.work_type}</li>
            <li><span className="text-gray-500">Capítulos a agregar ahora:</span> {formData.chapterCount}</li>
            <li><span className="text-gray-500">Categorías:</span> {formData.categories.join(', ') || 'Ninguna'}</li>
            <li><span className="text-gray-500">Etiquetas:</span> {formData.tags.join(', ') || 'Ninguna'}</li>
            <li><span className="text-gray-500">Autor:</span> {currentUser.displayName || 'Admin'}</li>
            {formData.is_coming_soon && <li><span className="text-purple-600 bg-purple-100 px-2 py-0.5 rounded border border-purple-300">¡Saldrá en PRÓXIMAMENTE!</span></li>}
          </ul>

          <div className="bg-gray-100 p-3 rounded-xl border border-gray-300 text-xs text-gray-600 font-bold mt-4 mb-4">
            Al publicar, esta información se enviará directamente a tu Base de Datos. Se actualizará en tiempo real para todos los usuarios.
          </div>

          <div className="flex gap-2">
            <button onClick={handlePrev} className="cartoon-btn bg-red-400 w-1/3 text-white">Cancelar</button>
            <button onClick={handlePublish} className="cartoon-btn bg-green-500 w-2/3 flex items-center justify-center text-lg text-white shadow-[6px_6px_0_0_#1f2937] hover:-translate-y-1">¡SÍ, PUBLICAR!</button>
          </div>
        </div>
      )}

    </div>
  );
}

