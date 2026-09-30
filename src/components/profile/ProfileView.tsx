import React from 'react';
import { User, ROLE_LABELS } from '../../types';
import { InstitutionalLogo } from '../common/InstitutionalLogo';
import { ShieldCheck, Mail, Building, MapPin, Calendar, Key, CheckCircle2 } from 'lucide-react';

interface ProfileViewProps {
  user: User;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user }) => {
  return (
    <div id="institutional-profile-view" className="max-w-4xl space-y-6">
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs overflow-hidden">
        {/* Banner with ink surface and gold badge */}
        <div className="bg-[#0c1f33] p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[#10395b]">
          <div className="flex items-center gap-4">
            <InstitutionalLogo size={72} theme="gold" />
            <div>
              <span className="text-[10px] font-bold text-[#ecc978] uppercase tracking-wider block">
                CREDENCIAL INSTITUCIONAL MONUR XVIII
              </span>
              <h2 className="font-display font-bold text-2xl text-white mt-0.5">
                {user.fullName}
              </h2>
              <p className="text-xs text-[rgba(232,242,250,0.72)] mt-0.5">
                {ROLE_LABELS[user.role]} · Club Escolar Regional 10
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#10395b]/70 border border-[#c9972b]/40 px-3.5 py-2 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-[#ecc978]" />
            <div className="text-left">
              <span className="text-[10px] text-[rgba(232,242,250,0.6)] uppercase block font-bold">
                ESTADO DE FIRMA
              </span>
              <span className="text-xs font-semibold text-[#ecc978] block">
                Activo & Certificado
              </span>
            </div>
          </div>
        </div>

        {/* Profile Info Details */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] space-y-1">
              <span className="text-[#64748b] uppercase font-bold text-[10px] tracking-wider block">
                CORREO INSTITUCIONAL ASIGNADO
              </span>
              <span className="text-sm font-semibold text-[#0c1f33] font-mono block">
                {user.email}
              </span>
              <span className="text-[11px] text-[#0f68a4] block">
                Dominio verificado sigel.edu.do
              </span>
            </div>

            <div className="p-4 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] space-y-1">
              <span className="text-[#64748b] uppercase font-bold text-[10px] tracking-wider block">
                JURISDICCIÓN / DEPENDENCIA
              </span>
              <span className="text-sm font-semibold text-[#0c1f33] block">
                {user.commission || user.department || 'Regional 10 (PLE-RD)'}
              </span>
              <span className="text-[11px] text-[#64748b] block">
                {user.district || 'Ministerio de Educación de la República Dominicana'}
              </span>
            </div>

            <div className="p-4 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] space-y-1">
              <span className="text-[#64748b] uppercase font-bold text-[10px] tracking-wider block">
                NIVEL DE PRIVILEGIOS
              </span>
              <span className="text-sm font-semibold text-[#0c1f33] block">
                {ROLE_LABELS[user.role]}
              </span>
              <span className="text-[11px] text-[#0e7a52] font-medium block">
                {user.role === 'aic'
                  ? 'Carga y envío de informe de comisión'
                  : user.role === 'undersecretary'
                  ? 'Evaluación, reenvío y gestión de usuarios EYC'
                  : 'Recepción ejecutiva y gestión de subsecretarios'}
              </span>
            </div>

            <div className="p-4 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] space-y-1">
              <span className="text-[#64748b] uppercase font-bold text-[10px] tracking-wider block">
                FECHA DE ALTA EN SISTEMA
              </span>
              <span className="text-sm font-semibold text-[#0c1f33] tabular-nums block">
                {new Date(user.createdAt).toLocaleDateString('es-DO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="text-[11px] text-[#64748b] block">
                Protocolo MONUR XVIII vigente
              </span>
            </div>
          </div>

          <div className="p-4 bg-[#eff7fd] border border-[#b0dbf5] rounded-lg text-xs text-[#0d5285] flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#0f68a4] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Control de acceso seguro:</strong> Esta cuenta opera bajo los estándares del Manual de Identidad Visual SIGEL CELIDER 10. Las acciones registradas (envíos y reenvíos) se vinculan criptográficamente a la identidad institucional del funcionario o representante acreditado.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
