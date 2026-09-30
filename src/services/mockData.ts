import { User, Report } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-sg-admin',
    username: 'felizlopezgroup',
    email: 'felizlopezgroup@gmail.com',
    fullName: 'Félix López (Secretaría General)',
    role: 'secretary_general',
    department: 'Secretaría General — Dirección Ejecutiva MONUR XVIII',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-sub-control',
    username: 'subsecretario.control',
    email: 'subsecretario.control@sigel.edu.do',
    fullName: 'Lic. Carlos Méndez (Subsecretaría de Evaluación)',
    role: 'undersecretary',
    department: 'Subsecretaría de Evaluación y Control Protocolar',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-eyc-disec',
    username: 'eyc.disec',
    email: 'eyc.disec@sigel.edu.do',
    fullName: 'Comisión EYC DISEC',
    role: 'aic',
    commission: 'Comisión EYC de Desarme y Seguridad Internacional (DISEC)',
    district: 'Distrito Educativo 10-01',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-eyc-ddhh',
    username: 'eyc.ddhh',
    email: 'eyc.ddhh@sigel.edu.do',
    fullName: 'Comisión EYC Derechos Humanos',
    role: 'aic',
    commission: 'Consejo EYC de Derechos Humanos (CDH)',
    district: 'Distrito Educativo 10-03',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_REPORTS: Report[] = [];

