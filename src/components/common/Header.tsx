import React from 'react';
import { User, UserRole, ROLE_LABELS } from '../../types';
import { PlerdLogo } from './PlerdLogo';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  user: User;
  onSwitchRole?: (role: UserRole) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
}) => {
  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 bg-white border-b border-[#e2e8f0] px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between shadow-xs transition-colors"
    >
      {/* Left: PLERD Institutional Brand + SIGEL System Hierarchy */}
      <div className="flex items-center gap-4">
        {/* Official PLERD Brand Logo */}
        <div className="shrink-0 flex items-center">
          <PlerdLogo variant="horizontal" size={32} showSubtitle={true} />
        </div>

        {/* Vertical divider */}
        <div className="h-7 w-px bg-[#e2e8f0] hidden sm:block" />

        {/* System Title & Hierarchy */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#475569]">
            <span className="font-semibold text-[#64748b]">{ROLE_LABELS[user.role]}</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold font-display text-[#002B49] tracking-tight leading-tight">
            {user.role === 'aic' ? 'Bandeja de Envío de Informes' : 'Revisión y Control Institucional'}
          </h1>
        </div>
      </div>

      {/* Right controls: User Details & Logout */}
      <div className="flex items-center gap-3">
        {/* User Badge */}
        <div
          id="header-user-badge"
          className="flex items-center gap-2.5 pl-3 border-l border-[#e2e8f0]"
        >
          <div className="w-8 h-8 rounded-full bg-[#002B49] text-white flex items-center justify-center font-display font-bold text-xs border border-[#006699]/30 shrink-0 shadow-2xs">
            {user.fullName.charAt(0)}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-[#002B49] leading-tight">
              {user.fullName}
            </div>
            <div className="text-[11px] text-[#64748b] leading-tight truncate max-w-[150px]">
              {user.email}
            </div>
          </div>
        </div>

        {/* Logout button */}
        <button
          id="header-logout-btn"
          onClick={onLogout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#475569] hover:text-[#C92437] bg-[#f8fafc] hover:bg-[#fdedef] border border-[#e2e8f0] hover:border-[#f9c2c8] rounded-lg transition-colors cursor-pointer"
          title="Cerrar sesión"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Cerrar sesión</span>
        </button>
      </div>
    </header>
  );
};
