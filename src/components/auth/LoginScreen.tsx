import React, { useState } from 'react';
import faroAColonWideImg from '../../assets/images/faro_colon_panoramic_1790044984760.jpg';
import { User } from '../../types';
import { DataStore } from '../../services/store';
import { AlertCircle, Lock, Mail, LogIn } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Por favor introduzca su correo institucional.');
      return;
    }

    if (!password) {
      setError('Por favor introduzca su contraseña.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const allUsers = DataStore.getAllUsers();
      const matched = allUsers.find(
        (u) =>
          u.email.toLowerCase() === cleanEmail ||
          u.username.toLowerCase() === cleanEmail.split('@')[0]
      );

      if (!matched) {
        setError(
          'Acceso denegado: Usuario no registrado. Solo el Secretario General puede dar de alta y autorizar usuarios en el sistema.'
        );
        setIsLoading(false);
        return;
      }

      const isPassValid = DataStore.verifyPassword(matched.email, password);
      if (!isPassValid) {
        setError('Contraseña incorrecta. Verifique sus credenciales institucionales.');
        setIsLoading(false);
        return;
      }

      DataStore.setSessionUser(matched);
      setIsLoading(false);
      onLoginSuccess(matched);
    }, 300);
  };

  return (
    <div
      id="login-screen-root"
      className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-x-hidden font-sans bg-[#08131e]"
    >
      {/* Background Photograph: Faro a Colón illuminated at night covering total background */}
      <img
        src={faroAColonWideImg}
        alt="Monumento Faro a Colón iluminado de noche"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-all duration-700"
        referrerPolicy="no-referrer"
      />

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#040a10]/85 via-[#061019]/45 to-[#040a10]/70 pointer-events-none" />
      <div className="absolute inset-0 bg-radial from-transparent via-[#061019]/25 to-[#061019]/65 pointer-events-none" />

      {/* ======================================================== */}
      {/* CENTERED CARD: Authentication Card (Translucent Glass)    */}
      {/* ======================================================== */}
      <div
        id="login-auth-card"
        className="relative z-10 w-full max-w-[420px] bg-[#050e18]/65 border border-white/20 rounded-2xl p-7 sm:p-9 shadow-2xl backdrop-blur-md my-auto transition-all"
      >
        {/* Card Title */}
        <div className="mb-6 text-center sm:text-left">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight drop-shadow-md">
            Iniciar Sesión
          </h2>
          <p className="text-xs text-[#9eb8d0] mt-1.5 leading-relaxed">
            Plataforma para Evaluación y Control
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            id="login-error-alert"
            className="mb-4 p-3 bg-[#fdeeec]/20 border border-[#ef4444]/60 text-white rounded-lg text-xs flex items-start gap-2 animate-fadeIn backdrop-blur-sm"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#ef4444]" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="login-email-input"
              className="block text-xs font-medium text-[#c5d8ea] mb-1.5 drop-shadow-sm"
            >
              Correo institucional autorizado
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8ea8c2] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="login-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="usuario@sigel.edu.do"
                className="w-full bg-[#071320]/75 border border-white/20 rounded-lg text-white pl-10 pr-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#389bd6] focus:bg-[#071320]/90 transition-colors placeholder:text-[#6a849d]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="login-password-input"
              className="block text-xs font-medium text-[#c5d8ea] mb-1.5 drop-shadow-sm"
            >
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8ea8c2] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="login-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="••••••••"
                className="w-full bg-[#071320]/75 border border-white/20 rounded-lg text-white pl-10 pr-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#389bd6] focus:bg-[#071320]/90 transition-colors placeholder:text-[#6a849d]"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full !mt-5 bg-[#389bd6] hover:bg-[#2e8ac0] active:bg-[#2579aa] text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg text-xs sm:text-sm transition-colors shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>Autenticando...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Ingresar al Sistema</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

