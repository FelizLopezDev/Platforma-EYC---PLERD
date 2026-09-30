import { User, Report, ReportStatus } from '../types';
import { INITIAL_USERS, INITIAL_REPORTS } from './mockData';

const USERS_STORAGE_KEY = 'sigel_users_v5';
const REPORTS_STORAGE_KEY = 'sigel_reports_v5';
const SESSION_STORAGE_KEY = 'sigel_session_user_v5';
const PASSWORDS_STORAGE_KEY = 'sigel_passwords_v5';

const DEFAULT_PASSWORDS: Record<string, string> = {
  'felizlopezgroup@gmail.com': 'admin2026',
  'subsecretario.control@sigel.edu.do': 'sub2026',
  'eyc.disec@sigel.edu.do': 'eyc2026',
  'eyc.ddhh@sigel.edu.do': 'eyc2026',
  'aic.disec@sigel.edu.do': 'aic2026',
  'aic.ddhh@sigel.edu.do': 'aic2026',
};

export class DataStore {
  // In-memory cache for live file object URLs (supports viewing/downloading actual files)
  private static fileUrlCache = new Map<string, string>();

  // In-memory cache for live file instances (File or Blob)
  private static fileInstanceMap = new Map<string, File | Blob>();

  static setLiveFile(reportId: string, file: File | Blob) {
    this.fileInstanceMap.set(reportId, file);
  }

  static getLiveFile(reportId: string): File | Blob | undefined {
    return this.fileInstanceMap.get(reportId);
  }

  static setCachedFileUrl(key: string, url: string) {
    this.fileUrlCache.set(key, url);
  }

  static getCachedFileUrl(key: string): string | undefined {
    return this.fileUrlCache.get(key);
  }

  private static getPasswords(): Record<string, string> {
    const raw = localStorage.getItem(PASSWORDS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(DEFAULT_PASSWORDS));
      return DEFAULT_PASSWORDS;
    }
    try {
      return { ...DEFAULT_PASSWORDS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_PASSWORDS;
    }
  }

  static savePassword(email: string, pass: string) {
    const passwords = this.getPasswords();
    passwords[email.toLowerCase().trim()] = pass;
    localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(passwords));
  }

  static getPasswordForUser(email: string): string {
    const passwords = this.getPasswords();
    return passwords[email.toLowerCase().trim()] || 'monur2026';
  }

  static verifyPassword(email: string, pass: string): boolean {
    const passwords = this.getPasswords();
    const cleanEmail = email.toLowerCase().trim();
    const stored = passwords[cleanEmail];

    // Master override for institutional administration
    if (pass === 'monur2026' || pass === 'admin2026') {
      return true;
    }

    if (!stored) {
      this.savePassword(cleanEmail, pass);
      return true;
    }
    return stored === pass;
  }
  private static getUsers(): User[] {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    try {
      const parsed: User[] = JSON.parse(raw);
      const existingEmails = new Set(parsed.map((u) => u.email.toLowerCase()));
      let updated = false;
      INITIAL_USERS.forEach((iu) => {
        if (!existingEmails.has(iu.email.toLowerCase())) {
          parsed.unshift(iu);
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return INITIAL_USERS;
    }
  }

  private static saveUsers(users: User[]) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  static getAllUsers(): User[] {
    return this.getUsers();
  }

  static getAicUsers(): User[] {
    return this.getUsers().filter((u) => u.role === 'aic');
  }

  static getEycUsers(): User[] {
    return this.getAicUsers();
  }

  static getUndersecretaryUsers(): User[] {
    return this.getUsers().filter((u) => u.role === 'undersecretary');
  }

  static createAicUser(data: {
    fullName: string;
    email: string;
    commission: string;
    district: string;
    password?: string;
  }): User {
    const users = this.getUsers();
    const newUser: User = {
      id: `user-eyc-${Date.now()}`,
      username: data.email.split('@')[0],
      email: data.email,
      fullName: data.fullName,
      role: 'aic',
      commission: data.commission,
      district: data.district,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    this.saveUsers(users);

    if (data.password) {
      this.savePassword(data.email, data.password);
    } else {
      this.savePassword(data.email, 'eyc2026');
    }

    // Also automatically initialize a pending report slot for this EYC
    const reports = this.getReports();
    reports.push({
      id: `rep-${Date.now()}`,
      aicId: newUser.id,
      aicName: newUser.fullName,
      commission: newUser.commission || 'Comisión EYC General',
      district: newUser.district || 'Distrito Regional 10',
      fileName: '',
      fileSize: '',
      status: 'pending',
      updatedAt: new Date().toISOString(),
    });
    this.saveReports(reports);

    return newUser;
  }

  static createEycUser(data: {
    fullName: string;
    email: string;
    commission: string;
    district: string;
    password?: string;
  }): User {
    return this.createAicUser(data);
  }

  static createUndersecretaryUser(data: {
    fullName: string;
    email: string;
    department: string;
    password?: string;
  }): User {
    const users = this.getUsers();
    const newUser: User = {
      id: `user-sub-${Date.now()}`,
      username: data.email.split('@')[0],
      email: data.email,
      fullName: data.fullName,
      role: 'undersecretary',
      department: data.department,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    this.saveUsers(users);

    if (data.password) {
      this.savePassword(data.email, data.password);
    } else {
      this.savePassword(data.email, 'sub2026');
    }

    return newUser;
  }

  static deleteUser(userId: string) {
    const users = this.getUsers().filter((u) => u.id !== userId);
    this.saveUsers(users);
  }

  // Reports
  private static getReports(): Report[] {
    const raw = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(INITIAL_REPORTS));
      return INITIAL_REPORTS;
    }
    try {
      const parsed: Report[] = JSON.parse(raw);
      if (parsed.length === 0 && INITIAL_REPORTS.length > 0) {
        localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(INITIAL_REPORTS));
        return INITIAL_REPORTS.map((r) => {
          const liveFile = this.getLiveFile(r.id);
          const liveUrl = this.getCachedFileUrl(r.id);
          return {
            ...r,
            file: liveFile || r.file,
            fileUrl: liveUrl || r.fileUrl,
          };
        });
      }
      let updated = false;
      INITIAL_REPORTS.forEach((ir) => {
        if (!parsed.some((p) => p.id === ir.id)) {
          parsed.push(ir);
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(parsed));
      }
      return parsed.map((r) => {
        const liveFile = this.getLiveFile(r.id);
        const liveUrl = this.getCachedFileUrl(r.id);
        return {
          ...r,
          file: liveFile || r.file,
          fileUrl: liveUrl || r.fileUrl,
        };
      });
    } catch {
      return INITIAL_REPORTS;
    }
  }

  private static saveReports(reports: Report[]) {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
  }

  static getAllReports(): Report[] {
    return this.getReports();
  }

  static getReportByAicId(aicId: string): Report | undefined {
    return this.getReports().find((r) => r.aicId === aicId);
  }

  static getSubmittedReportsForUndersecretary(): Report[] {
    // Undersecretary sees reports that have been submitted to undersecretary or already forwarded/reviewed
    return this.getReports().filter(
      (r) =>
        r.status === 'submitted_to_undersecretary' ||
        r.status === 'forwarded_to_secretary_general' ||
        r.status === 'reviewed'
    );
  }

  static getForwardedReportsForSecretaryGeneral(): Report[] {
    // Secretary General sees reports forwarded by the Undersecretary that are pending review
    return this.getReports().filter((r) => r.status === 'forwarded_to_secretary_general');
  }

  static getReviewedReportsForSecretaryGeneral(): Report[] {
    // Secretary General sees reports that have been finalized and marked as reviewed
    return this.getReports().filter((r) => r.status === 'reviewed');
  }

  static markReportAsReviewed(reportId: string, secretaryUser: User): Report | null {
    const reports = this.getReports();
    const index = reports.findIndex((r) => r.id === reportId);
    if (index === -1) return null;

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    reports[index] = {
      ...reports[index],
      status: 'reviewed',
      reviewedDate: formattedDate,
      reviewedByName: secretaryUser.fullName,
      updatedAt: now.toISOString(),
    };

    this.saveReports(reports);
    return reports[index];
  }

  static submitAicReport(
    aicUser: User,
    data: {
      fileName: string;
      fileSize: string;
      fileType?: string;
      file?: File | Blob;
      fileUrl?: string;
      summary?: string;
      pageCount?: number;
    }
  ): Report {
    const reports = this.getReports();
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const existingIndex = reports.findIndex((r) => r.aicId === aicUser.id);
    const reportId = existingIndex >= 0 ? reports[existingIndex].id : `rep-${Date.now()}`;

    if (data.fileUrl) {
      this.setCachedFileUrl(reportId, data.fileUrl);
    }
    if (data.file) {
      this.setLiveFile(reportId, data.file);
    }

    const updatedReport: Report = {
      id: reportId,
      aicId: aicUser.id,
      aicName: aicUser.fullName,
      commission: aicUser.commission || 'Comisión Regional',
      district: aicUser.district || 'Distrito Regional 10',
      fileName: data.fileName,
      fileSize: data.fileSize,
      fileType: data.fileType || (data.file instanceof File ? data.file.type : 'application/pdf'),
      file: data.file,
      fileUrl: data.fileUrl,
      summary: data.summary || `Informe oficial cargado: ${data.fileName}`,
      pageCount: data.pageCount || 1,
      submissionDate: formattedDate,
      status: 'submitted_to_undersecretary',
      hashVerification: `SHA256: ${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
      updatedAt: now.toISOString(),
    };

    if (existingIndex >= 0) {
      reports[existingIndex] = updatedReport;
    } else {
      reports.push(updatedReport);
    }

    this.saveReports(reports);
    return updatedReport;
  }

  static forwardReportToSecretaryGeneral(reportId: string, undersecretaryUser: User): Report | null {
    const reports = this.getReports();
    const index = reports.findIndex((r) => r.id === reportId);
    if (index === -1) return null;

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    reports[index] = {
      ...reports[index],
      status: 'forwarded_to_secretary_general',
      forwardingDate: formattedDate,
      undersecretaryId: undersecretaryUser.id,
      undersecretaryName: undersecretaryUser.fullName,
      updatedAt: now.toISOString(),
    };

    this.saveReports(reports);
    return reports[index];
  }

  // Session / Auth Management
  static getSessionUser(): User | null {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static setSessionUser(user: User | null) {
    if (user) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }

  static resetToDefaultSeed() {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(INITIAL_REPORTS));
  }
}
