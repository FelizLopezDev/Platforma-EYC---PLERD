import React from 'react';
import { User, UserRole } from '../../types';
import { InstitutionalLogo } from './InstitutionalLogo';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  UserCheck, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  user: User;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  currentView,
  onNavigate,
  onLogout,
  isOpenMobile,
  onCloseMobile,
}) => {
  // Navigation items strictly per prompt requirements
  const getNavItems = (): NavItem[] => {
    switch (user.role) {
      case 'aic':
        return [
          { id: 'dashboard', label: 'Panel Principal', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'profile', label: 'Perfil Institucional', icon: <UserIcon className="w-4 h-4" /> },
        ];
      case 'undersecretary':
        return [
          { id: 'dashboard', label: 'Panel de Control', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'reports', label: 'Bandeja de Informes', icon: <FileText className="w-4 h-4" /> },
          { id: 'aic-users', label: 'Gestión Usuarios AIC', icon: <Users className="w-4 h-4" /> },
          { id: 'profile', label: 'Perfil Institucional', icon: <UserIcon className="w-4 h-4" /> },
        ];
      case 'secretary_general':
        return [
          { id: 'dashboard', label: 'Panel General', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'reports', label: 'Informes Reenviados', icon: <FileText className="w-4 h-4" /> },
          { id: 'undersecretaries', label: 'Subsecretarios', icon: <UserCheck className="w-4 h-4" /> },
          { id: 'profile', label: 'Perfil Institucional', icon: <UserIcon className="w-4 h-4" /> },
        ];
    }
  };

  const navItems = getNavItems();

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'secretary_general':
        return { label: 'SECRETARÍA GENERAL', color: 'bg-[#c9972b]/20 text-[#ecc978] border-[#c9972b]/40' };
      case 'undersecretary':
        return { label: 'SUBSECRETARÍA', color: 'bg-[#1d84c4]/25 text-[#b0dbf5] border-[#45a3dc]/40' };
      case 'aic':
        return { label: 'COMISIÓN AIC', color: 'bg-[#0f446d]/40 text-[#d6ecfa] border-[#7cc2ec]/30' };
    }
  };

  const badge = getRoleBadge(user.role);

  return (
    <>
      {/* Mobile overlay */}
      {isOpenMobile && (
        <div
          id="mobile-sidebar-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-[#0c1f33]/70 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Main Sidebar - ink surface (#0c1f33) as required by PDF */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0c1f33] text-white flex flex-col border-r border-[#0a1a2b] transition-transform duration-200 ease-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Area */}
        <div id="sidebar-brand-header" className="p-5 border-b border-[#10395b]/60 flex items-center gap-3">
          <InstitutionalLogo size={44} theme="dark" />
          <div className="flex flex-col min-w-0">
            <span className="font-display font-bold text-base tracking-wide text-white leading-tight">
              SIGEL CELIDER 10
            </span>
            <span className="text-[11px] text-[#ecc978] font-medium tracking-wider uppercase leading-snug">
              MONUR XVIII · REGIONAL 10
            </span>
          </div>
        </div>

        {/* User Identity Snippet */}
        <div id="sidebar-user-card" className="px-5 py-4 bg-[#0a1a2b]/80 border-b border-[#10395b]/40">
          <div className="flex items-center justify-between mb-1.5">
            <span
              className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border ${badge.color}`}
            >
              {badge.label}
            </span>
            <span className="text-[11px] text-[rgba(232,242,250,0.48)]">PLE-RD</span>
          </div>
          <div className="font-medium text-sm text-white truncate" title={user.fullName}>
            {user.fullName}
          </div>
          <div className="text-xs text-[rgba(232,242,250,0.65)] truncate" title={user.email}>
            {user.commission || user.department || user.email}
          </div>
        </div>

        {/* Navigation list */}
        <nav id="sidebar-nav" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[rgba(232,242,250,0.45)]">
            Navegación Oficial
          </div>

          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-[#10395b] text-white font-semibold shadow-xs'
                    : 'text-[rgba(232,242,250,0.72)] hover:text-white hover:bg-[#10395b]/50'
                }`}
              >
                {/* Protocol gold active rail (page 4, 5 PDF: 'ink + riel oro') */}
                {isActive && (
                  <span
                    id="sidebar-active-rail"
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#c9972b] rounded-r"
                  />
                )}

                <div className="flex items-center gap-3">
                  <span
                    className={`${
                      isActive ? 'text-[#ecc978]' : 'text-[rgba(232,242,250,0.55)] group-hover:text-white'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                <ChevronRight
                  className={`w-3.5 h-3.5 opacity-0 transition-opacity ${
                    isActive ? 'opacity-80 text-[#ecc978]' : 'group-hover:opacity-60'
                  }`}
                />
              </button>
            );
          })}
        </nav>

        {/* Institutional Footer & Logout */}
        <div id="sidebar-footer" className="p-4 border-t border-[#10395b]/60 space-y-2">
          <div className="px-2 py-1 text-[11px] text-[rgba(232,242,250,0.48)] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#ecc978]" />
            <span>Sistema Institucional Certificado</span>
          </div>

          <button
            id="sidebar-logout-btn"
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[rgba(232,242,250,0.72)] hover:text-white hover:bg-[#b23b31]/20 hover:border-[#b23b31]/40 border border-transparent transition-colors"
          >
            <LogOut className="w-4 h-4 text-[#f5c9c4]" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};
