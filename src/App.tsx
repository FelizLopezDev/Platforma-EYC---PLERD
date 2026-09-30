/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, UserRole } from './types';
import { DataStore } from './services/store';
import { LoginScreen } from './components/auth/LoginScreen';
import { Header } from './components/common/Header';
import { AicDashboard } from './components/aic/AicDashboard';
import { UndersecretaryDashboard } from './components/undersecretary/UndersecretaryDashboard';
import { SecretaryGeneralDashboard } from './components/secretary/SecretaryGeneralDashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return DataStore.getSessionUser();
  });
  const [dataVersion, setDataVersion] = useState<number>(0);

  // Trigger re-render whenever store updates
  const handleRefreshData = () => {
    setDataVersion((v) => v + 1);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    DataStore.setSessionUser(null);
    setCurrentUser(null);
  };

  // Quick role switcher for testing convenience
  const handleSwitchRole = (newRole: UserRole) => {
    const allUsers = DataStore.getAllUsers();
    let targetUser: User | undefined;

    if (newRole === 'aic') {
      targetUser = allUsers.find((u) => u.role === 'aic');
    } else if (newRole === 'undersecretary') {
      targetUser = allUsers.find((u) => u.role === 'undersecretary');
    } else if (newRole === 'secretary_general') {
      targetUser = allUsers.find((u) => u.role === 'secretary_general');
    }

    if (targetUser) {
      DataStore.setSessionUser(targetUser);
      setCurrentUser(targetUser);
      handleRefreshData();
    }
  };

  // If not authenticated, show institutional login screen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Active AIC report
  const aicReport = currentUser.role === 'aic' ? DataStore.getReportByAicId(currentUser.id) : undefined;

  return (
    <div id="app-root-layout" className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col antialiased">
      {/* Top Header without menu button */}
      <Header
        user={currentUser}
        onSwitchRole={handleSwitchRole}
        onLogout={handleLogout}
      />

      {/* Main Single Screen Content Area */}
      <main id="main-content-view" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto">
        {currentUser.role === 'aic' && (
          <AicDashboard
            key={`${currentUser.id}-${dataVersion}`}
            user={currentUser}
            onRefreshData={handleRefreshData}
            report={aicReport}
          />
        )}

        {currentUser.role === 'undersecretary' && (
          <UndersecretaryDashboard
            key={`undersecretary-${dataVersion}`}
            user={currentUser}
            onRefreshData={handleRefreshData}
            activeView="reports"
          />
        )}

        {currentUser.role === 'secretary_general' && (
          <SecretaryGeneralDashboard
            key={`secgeneral-${dataVersion}`}
            user={currentUser}
            onRefreshData={handleRefreshData}
            activeView="reports"
          />
        )}
      </main>
    </div>
  );
}
