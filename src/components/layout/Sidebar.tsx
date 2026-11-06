import React from 'react';
import {
  LayoutDashboard,
  Users,
  Trophy,
  GitCompare,
  Settings,
  PlusCircle,
  ShieldCheck
} from 'lucide-react';
import { useScouting, ActiveView } from '../../context/ScoutingContext';

interface SidebarProps {
  onOpenNewProspectModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenNewProspectModal,
}) => {
  const { activeView, setActiveView, prospects, draftBoard, loadError } = useScouting();

  const navItems: { id: ActiveView; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'database', label: 'Player Database', icon: Users, count: prospects.length },
    { id: 'draftboard', label: 'My Draft Board', icon: Trophy, count: draftBoard.length },
    { id: 'comparison', label: 'Player Comparison', icon: GitCompare },
    { id: 'settings', label: 'Settings & Data', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0D121F] border-r border-[#1E293B] flex flex-col h-screen shrink-0 select-none">
      {/* Brand & Draft Focus */}
      <div className="p-5 border-b border-[#1E293B]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-black font-black text-sm tracking-wider shadow-md shadow-amber-500/10">
            CS
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white block leading-none">
              COURTSIDE
            </span>
            <span className="text-[10px] font-mono tracking-wider text-amber-400 font-semibold uppercase mt-0.5 block">
              NBA SCOUTING DB
            </span>
          </div>
        </div>

        {/* Current Active Class */}
        <div className="mt-3.5 px-2.5 py-1.5 rounded bg-[#131B2E] border border-[#1E293B] flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Focus Class</span>
          <span className="font-mono text-amber-400 font-bold">2027 DRAFT</span>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="px-4 py-3.5 space-y-2 border-b border-[#1E293B]">
        <button
          onClick={onOpenNewProspectModal}
          className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-md transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Prospect</span>
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Workstation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#151D2F]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-amber-400' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span
                  className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'text-slate-500 bg-[#162032]'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Local System Status & Scout Identity */}
      <div className="p-3.5 border-t border-[#1E293B] bg-[#0A0E18]">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span className="font-mono text-[10px]">{loadError ? 'Database offline' : 'SQLite'}</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Phase 3</span>
        </div>

        <div className="flex items-center gap-2.5 pt-1.5 border-t border-[#162032]">
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400">
            S1
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold text-slate-200 truncate">
              Lead Scout
            </div>
            <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400 inline" />
              <span>Offline Verified</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
