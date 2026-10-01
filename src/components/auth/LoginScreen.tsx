import React, { useState } from 'react';
import { User } from '../../types';
import { DataStore } from '../../services/store';
import { PlerdLogo } from '../common/PlerdLogo';
import { AlertCircle, Lock, Mail, LogIn, ShieldCheck } from 'lucide-react';

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

  // Quick 1-click test fill helper
  const handleQuickLogin = (roleEmail: string, pass: string) => {
    setEmail(roleEmail);
    setPassword(pass);
    setError(null);
  };

  return (
    <div
      id="login-screen-root"
      className="min-h-screen w-full flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans text-[#0f172a] bg-[#0E539D] relative overflow-hidden"
    >
      {/* Subtle institutional geometric background accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5 pointer-events-none blur-2xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#002B49]/30 pointer-events-none blur-2xl" />

      {/* Main Container */}
      <main className="w-full flex items-center justify-center relative z-10">
        <div className="w-full max-w-[440px] bg-white rounded-2xl border border-white/20 shadow-2xl p-7 sm:p-9 transition-all">
          {/* Brand Header inside Card */}
          <div className="flex flex-col items-center text-center pb-6 border-b border-[#f1f5f9]">
            <PlerdLogo
              variant="vertical"
              size={46}
              showSubtitle={true}
              secondaryText="Plataforma para Evaluación y Control"
              subtitle=""
            />
          </div>

          {/* Error Message */}
          {error && (
            <div
              id="login-error-alert"
              className="mt-5 p-3 bg-[#fdedef] border border-[#f9c2c8] text-[#C92437] rounded-lg text-xs flex items-start gap-2.5 animate-fadeIn"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C92437]" />
              <div className="leading-relaxed font-medium">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mt-5">
            <div>
              <label
                htmlFor="login-email-input"
                className="block text-xs font-semibold text-[#002B49] mb-1.5"
              >
                Correo institucional
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                  className="w-full bg-white border border-[#cbd5e1] rounded-lg text-[#0f172a] pl-10 pr-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#0E539D] focus:ring-1 focus:ring-[#0E539D] transition-all placeholder:text-[#94a3b8]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password-input"
                className="block text-xs font-semibold text-[#002B49] mb-1.5"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                  className="w-full bg-white border border-[#cbd5e1] rounded-lg text-[#0f172a] pl-10 pr-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#0E539D] focus:ring-1 focus:ring-[#0E539D] transition-all placeholder:text-[#94a3b8]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full !mt-5 bg-[#0E539D] hover:bg-[#0c4685] active:bg-[#09396e] text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg text-xs sm:text-sm transition-colors shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
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

          {/* Quick Access Helper Buttons for Evaluation/Testing */}
          <div className="mt-6 pt-5 border-t border-[#f1f5f9]">
            <span className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wider text-center mb-2.5">
              Acceso Rápido por Rol
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('felizlopezgroup@gmail.com', 'admin2026')}
                className="px-2 py-1.5 text-[11px] font-medium text-[#002B49] bg-[#f8fafc] hover:bg-[#e6f0fa] border border-[#e2e8f0] hover:border-[#b0dbf5] rounded-md transition-colors text-center cursor-pointer truncate"
                title="Secretario General"
              >
                Secretario Gral.
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('subsecretario.control@sigel.edu.do', 'sub2026')}
                className="px-2 py-1.5 text-[11px] font-medium text-[#002B49] bg-[#f8fafc] hover:bg-[#e6f0fa] border border-[#e2e8f0] hover:border-[#b0dbf5] rounded-md transition-colors text-center cursor-pointer truncate"
                title="Subsecretario de Evaluación"
              >
                Subsecretario
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('eyc.disec@sigel.edu.do', 'eyc2026')}
                className="px-2 py-1.5 text-[11px] font-medium text-[#002B49] bg-[#f8fafc] hover:bg-[#e6f0fa] border border-[#e2e8f0] hover:border-[#b0dbf5] rounded-md transition-colors text-center cursor-pointer truncate"
                title="Comisión EYC"
              >
                Comisión EYC
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
