import React, { useState, useRef, useEffect } from 'react';
import { Search, Download, Plus, ChevronRight, User, X } from 'lucide-react';
import { useScouting } from '../../context/ScoutingContext';

interface TopHeaderProps {
  onOpenNewProspectModal: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenNewProspectModal }) => {
  const {
    activeView,
    activeProspect,
    prospects,
    setSelectedProspectId,
    setActiveView,
    exportJSONBackup,
  } = useScouting();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProspects = searchTerm.trim()
    ? prospects.filter((p) => {
        const query = searchTerm.toLowerCase();
        return (
          p.firstName.toLowerCase().includes(query) ||
          p.lastName.toLowerCase().includes(query) ||
          p.currentTeam.toLowerCase().includes(query) ||
          p.primaryPosition.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query))
        );
      })
    : [];

  const handleSelectProspect = (id: string) => {
    setSelectedProspectId(id);
    setActiveView('dossier');
    setSearchOpen(false);
    setSearchTerm('');
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'dashboard':
        return 'Scouting Dashboard';
      case 'database':
        return 'Player Database';
      case 'dossier':
        return activeProspect
          ? `${activeProspect.firstName} ${activeProspect.lastName}`
          : 'Prospect Dossier';
      case 'reports':
        return 'Scouting Reports';
      case 'draftboard':
        return 'My Draft Board';
      case 'comparison':
        return 'Prospect Comparison Matrix';
      case 'video':
        return 'Video Library & Timestamps';
      case 'settings':
        return 'Settings & Backup Management';
      default:
        return 'Workstation';
    }
  };

  return (
    <header className="h-14 border-b border-[#1E293B] bg-[#0E1322] px-6 flex items-center justify-between gap-6 shrink-0 z-20">
      {/* Zone 1: Breadcrumb */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">COURTSIDE</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-slate-200 font-semibold tracking-wide">
          {getViewTitle()}
        </span>
        {activeView === 'dossier' && activeProspect && (
          <span className="text-xs font-mono text-amber-400 font-bold ml-1 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
            {activeProspect.primaryPosition} · {activeProspect.currentTeam}
          </span>
        )}
      </div>

      {/* Zone 2: Global Search */}
      <div className="flex-1 max-w-md relative" ref={searchRef}>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search prospects (e.g. Morgan, State, Wing, SF)..."
            className="w-full bg-[#141B2D] border border-[#23314D] rounded-md pl-9 pr-8 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/80 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Instant Search Dropdown */}
        {searchOpen && searchTerm.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#12192A] border border-[#243350] rounded-md shadow-2xl py-1.5 max-h-72 overflow-y-auto z-50">
            {filteredProspects.length === 0 ? (
              <div className="px-4 py-3 text-xs text-slate-400 text-center">
                No prospects found for "{searchTerm}".
              </div>
            ) : (
              filteredProspects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectProspect(p.id)}
                  className="w-full px-3 py-2 text-left hover:bg-[#1A243B] flex items-center justify-between text-xs transition-colors border-b border-[#1A2337] last:border-0"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-amber-400">
                      {p.primaryPosition}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-100">
                        {p.firstName} {p.lastName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {p.currentTeam} · {p.measurements.heightFormatted} · Class of {p.draftYear}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {p.status}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={exportJSONBackup}
          title="Backup all data to JSON file"
          className="px-3 py-1.5 bg-[#162035] hover:bg-[#1E2B47] text-slate-300 border border-[#23314D] rounded-md text-xs font-medium transition-colors flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>Export JSON</span>
        </button>

        <button
          onClick={onOpenNewProspectModal}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-md text-xs transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Prospect</span>
        </button>
      </div>
    </header>
  );
};
