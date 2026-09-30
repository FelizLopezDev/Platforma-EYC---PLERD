import React from 'react';
import { User, UserRole, ROLE_LABELS } from '../../types';
import { InstitutionalLogo } from './InstitutionalLogo';
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
      className="sticky top-0 z-30 bg-white border-b border-[#e2e8f0] px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between shadow-xs"
    >
      <div className="flex items-center gap-3.5">
        {/* Institutional Circular Logo */}
        <div className="shrink-0">
          <InstitutionalLogo size={40} theme="dark" />
        </div>

        {/* System Title & Hierarchy */}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
            <span className="font-semibold text-[#0c1f33]">SIGEL CELIDER 10</span>
            <span>—</span>
            <span>MONUR XVIII</span>
            <span className="hidden sm:inline text-[#cbd5e1]">•</span>
            <span className="hidden sm:inline text-[#0d5285] font-medium">{ROLE_LABELS[user.role]}</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold font-display text-[#0c1f33] tracking-tight">
            Revisión de informes
          </h1>
        </div>
      </div>

      {/* Right controls: User Details & Logout */}
      <div className="flex items-center gap-3">
        {/* User Badge */}
        <div
          id="header-user-badge"
          className="flex items-center gap-2 pl-3 border-l border-[#e2e8f0]"
        >
          <div className="w-8 h-8 rounded-full bg-[#0c1f33] text-[#ecc978] flex items-center justify-center font-display font-bold text-xs border border-[#c9972b] shrink-0">
            {user.fullName.charAt(0)}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-[#0c1f33] leading-tight">
              {user.fullName}
            </div>
            <div className="text-[11px] text-[#64748b] leading-tight truncate max-w-[130px]">
              {user.email}
            </div>
          </div>
        </div>

        {/* Logout button */}
        <button
          id="header-logout-btn"
          onClick={onLogout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#475569] hover:text-[#b23b31] bg-[#f8fafc] hover:bg-[#fdeeec] border border-[#e2e8f0] hover:border-[#f5c9c4] rounded-lg transition-colors cursor-pointer"
          title="Cerrar sesión"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Cerrar sesión</span>
        </button>
      </div>
    </header>
  );
};
