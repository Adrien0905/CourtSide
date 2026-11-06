/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScoutingProvider, useScouting } from './context/ScoutingContext';
import { ScoutingReport } from './types/scouting';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { DashboardView } from './components/dashboard/DashboardView';
import { PlayerDatabaseView } from './components/database/PlayerDatabaseView';
import { PlayerDossierView } from './components/dossier/PlayerDossierView';
import { ScoutingReportsView } from './components/reports/ScoutingReportsView';
import { DraftBoardView } from './components/draftboard/DraftBoardView';
import { PlayerComparisonView } from './components/comparison/PlayerComparisonView';
import { VideoLibraryView } from './components/video/VideoLibraryView';
import { SettingsView } from './components/settings/SettingsView';
import { NewProspectModal } from './components/prospects/NewProspectModal';
import { NewReportModal } from './components/reports/NewReportModal';

const AppContent: React.FC = () => {
  const { activeView } = useScouting();
  const [isProspectModalOpen, setIsProspectModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<ScoutingReport | null>(null);

  const openNewReport = () => {
    setEditingReport(null);
    setIsReportModalOpen(true);
  };

  const openEditReport = (report: ScoutingReport) => {
    setEditingReport(report);
    setIsReportModalOpen(true);
  };

  const closeReportModal = () => {
    setIsReportModalOpen(false);
    setEditingReport(null);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardView />
        );
      case 'database':
        return (
          <PlayerDatabaseView
            onOpenNewProspectModal={() => setIsProspectModalOpen(true)}
          />
        );
      case 'dossier':
        return (
          <PlayerDossierView
            onOpenNewReportModal={openNewReport}
            onEditReport={openEditReport}
          />
        );
      case 'reports':
        return (
          <ScoutingReportsView
            onOpenNewReportModal={openNewReport}
            onEditReport={openEditReport}
          />
        );
      case 'draftboard':
        return <DraftBoardView />;
      case 'comparison':
        return <PlayerComparisonView />;
      case 'video':
        return <VideoLibraryView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <DashboardView />
        );
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B0F17] text-slate-100 font-sans">
      {/* Desktop Permanent Sidebar */}
      <Sidebar
        onOpenNewProspectModal={() => setIsProspectModalOpen(true)}
      />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <TopHeader />

        <main className="flex-1 overflow-y-auto bg-[#0B0F17]">
          {renderActiveView()}
        </main>
      </div>

      {/* Modals */}
      <NewProspectModal
        isOpen={isProspectModalOpen}
        onClose={() => setIsProspectModalOpen(false)}
      />

      <NewReportModal
        isOpen={isReportModalOpen}
        onClose={closeReportModal}
        initialReport={editingReport}
      />
    </div>
  );
};

export default function App() {
  return (
    <ScoutingProvider>
      <AppContent />
    </ScoutingProvider>
  );
}
