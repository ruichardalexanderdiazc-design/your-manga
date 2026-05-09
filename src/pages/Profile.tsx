import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LogOut, Mail, Settings, ShieldAlert, Key } from 'lucide-react';

export default function Profile() {
  const { currentUser, loginWithGoogle, registerWithEmail, loginWithEmail, logout } = useAuth();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      toast.success('Sesión iniciada con éxito!');
    } catch (error) {
      if (error.code === 'auth/unauthorized-domain') {
        toast.error('Dominio no autorizado para Google Auth. Abre la app en una nueva pestaña o añade este dominio en Firebase.');
      } else {
        toast.error('Error al iniciar sesión con Google');
      }
      console.error(error);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if(!email || !password) return toast.error('Rellena todos los campos');
    if(password.length < 6) return toast.error('La contraseña debe tener al menos 6 caracteres');
    
    setLoadingForm(true);
    try {
      if (isLoginMode) {
        await loginWithEmail(email, password);
        toast.success('¡Bienvenido de nuevo!');
      } else {
        await registerWithEmail(email, password);
        toast.success('¡Cuenta creada con éxito!');
      }
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Este correo ya está registrado');
      } else if (error.code === 'auth/invalid-credential') {
        toast.error('Correo o contraseña incorrectos');
      } else {
        toast.error(isLoginMode ? 'Error al iniciar sesión' : 'Error al registrarte');
      }
    } finally {
      setLoadingForm(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Sesión cerrada');
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center p-4 min-h-[70vh]">
        <div className="cartoon-card p-6 w-full max-w-sm text-center">
          <div className="bg-pink-100 w-16 h-16 mx-auto rounded-full cartoon-border mb-4 flex items-center justify-center">
             <span className="text-3xl">👋</span>
          </div>
          <h2 className="text-2xl font-black mb-2 uppercase">{isLoginMode ? "Bienvenido" : "Crea tu Cuenta"}</h2>
          <p className="font-bold text-gray-600 mb-6 text-sm">{isLoginMode ? "Inicia sesión para guardar tu progreso." : "Únete a nuestra comunidad de lectores."}</p>
          
          <form onSubmit={handleEmailAuth} className="space-y-3 mb-6">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="email" placeholder="Correo electrónico" className="w-full cartoon-border rounded-xl py-2 pl-10 pr-3 font-bold" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="password" placeholder="Contraseña (mín 6 carácteres)" className="w-full cartoon-border rounded-xl py-2 pl-10 pr-3 font-bold" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>
            <button type="submit" disabled={loadingForm} className="cartoon-btn w-full flex items-center justify-center gap-2 mt-2 disabled:bg-gray-400">
               {loadingForm ? 'Cargando...' : (isLoginMode ? 'Entrar con Email' : 'Registrarme')}
            </button>
          </form>

          <div className="flex items-center gap-2 mb-6">
             <div className="flex-1 h-[2px] bg-gray-200"></div>
             <span className="text-xs font-bold text-gray-400">O usa Google</span>
             <div className="flex-1 h-[2px] bg-gray-200"></div>
          </div>

          <button onClick={handleGoogleLogin} className="cartoon-btn w-full bg-blue-500 text-white flex items-center justify-center gap-2 mb-4">
            Continúa con Google
          </button>
          
          <p className="text-sm font-bold text-gray-500 cursor-pointer hover:text-pink-500" onClick={() => setIsLoginMode(!isLoginMode)}>
            {isLoginMode ? "¿No tienes cuenta? Regístrate aquí" : "¿Ya tienes cuenta? Inicia sesión"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 px-2">
      <div className="cartoon-card p-6 flex flex-col items-center mb-6">
        <img src={currentUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.email}`} alt="Avatar" className="w-24 h-24 rounded-full cartoon-border mb-4 object-cover" />
        <h2 className="text-xl font-black uppercase text-center">{currentUser.displayName || 'Lector'}</h2>
        <p className="font-bold text-gray-500 text-sm flex items-center gap-1 mt-1"><Mail size={14} /> {currentUser.email}</p>
        {currentUser.isAdmin && (
          <span className="mt-3 bg-yellow-400 text-black text-xs px-2 py-1 rounded-xl cartoon-border font-black flex items-center gap-1"><ShieldAlert size={12}/> ADMINISTRADOR</span>
        )}
      </div>

      <div className="space-y-3">
        <button className="cartoon-card w-full p-4 flex items-center font-black active:scale-95 transition-transform"><Settings className="mr-3" /> Ajustes de lectura</button>
        <button onClick={handleLogout} className="cartoon-card w-full p-4 flex items-center font-black active:scale-95 transition-transform text-red-500"><LogOut className="mr-3" /> Cerrar sesión</button>
      </div>
    </div>
  );
}
