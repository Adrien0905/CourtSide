import React, { useState } from 'react';
import { CalendarDays, Plus, ExternalLink, Search, Clock, Film } from 'lucide-react';
import { useScouting } from '../../context/ScoutingContext';

export const GameLogView: React.FC = () => {
  const { gameLogs, prospects, addGameLog, setSelectedProspectId, setActiveView } = useScouting();

  const [isAddingLog, setIsAddingLog] = useState(false);
  const [search, setSearch] = useState('');

  // Form states
  const [selectedProspectId, setTargetProspectId] = useState(prospects[0]?.id || '');
  const [gameDate, setGameDate] = useState(new Date().toISOString().slice(0, 10));
  const [competition, setCompetition] = useState('NCAA / Showcase');
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [score, setScore] = useState('');
  const [minutesWatched, setMinutesWatched] = useState(32);
  const [pts, setPts] = useState(20);
  const [reb, setReb] = useState(8);
  const [ast, setAst] = useState(4);
  const [stl, setStl] = useState(1);
  const [blk, setBlk] = useState(1);
  const [fg, setFg] = useState('8/14');
  const [replayUrl, setReplayUrl] = useState('');
  const [observations, setObservations] = useState('');

  const filteredLogs = gameLogs.filter((log) => {
    const p = prospects.find((item) => item.id === log.prospectId);
    const pName = p ? `${p.firstName} ${p.lastName}`.toLowerCase() : '';
    const teams = `${log.homeTeam} ${log.awayTeam} ${log.competition}`.toLowerCase();
    const query = search.toLowerCase();
    return pName.includes(query) || teams.includes(query) || log.observations.toLowerCase().includes(query);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProspectId || !homeTeam.trim() || !awayTeam.trim()) return;

    addGameLog({
      prospectId: selectedProspectId,
      gameDate,
      competition,
      homeTeam: homeTeam.trim(),
      awayTeam: awayTeam.trim(),
      score: score.trim() || 'Final',
      minutesWatched: Number(minutesWatched),
      pts: Number(pts),
      reb: Number(reb),
      ast: Number(ast),
      stl: Number(stl),
      blk: Number(blk),
      fg: fg.trim(),
      replayUrl: replayUrl.trim() || undefined,
      observations: observations.trim(),
    });

    setIsAddingLog(false);
    setHomeTeam('');
    setAwayTeam('');
    setObservations('');
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <CalendarDays className="w-5 h-5 text-sky-400" />
            <span>Match Scouting Log</span>
            <span className="text-xs font-mono font-medium text-slate-400">
              ({filteredLogs.length} games recorded)
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Detailed log of watched games, live notes, box statistics, and replay cutup links.
          </p>
        </div>

        <button
          onClick={() => setIsAddingLog(!isAddingLog)}
          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-md transition-colors flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{isAddingLog ? 'Cancel' : 'Log New Game'}</span>
        </button>
      </div>

      {/* New Game Form */}
      {isAddingLog && (
        <form onSubmit={handleSubmit} className="bg-[#111827] border border-amber-500/40 rounded-lg p-6 space-y-4 text-xs shadow-xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400">
            Record New Game Observation
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Scouted Prospect *
              </label>
              <select
                value={selectedProspectId}
                onChange={(e) => setTargetProspectId(e.target.value)}
                required
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                {prospects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} ({p.primaryPosition} - {p.currentTeam})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Game Date
              </label>
              <input
                type="date"
                value={gameDate}
                onChange={(e) => setGameDate(e.target.value)}
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Competition / Event
              </label>
              <input
                type="text"
                value={competition}
                onChange={(e) => setCompetition(e.target.value)}
                placeholder="e.g. Hoophall Classic / NCAA Big 12"
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Home Team *
              </label>
              <input
                type="text"
                value={homeTeam}
                onChange={(e) => setHomeTeam(e.target.value)}
                placeholder="e.g. Duke"
                required
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Away Team *
              </label>
              <input
                type="text"
                value={awayTeam}
                onChange={(e) => setAwayTeam(e.target.value)}
                placeholder="e.g. North Carolina"
                required
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Final Score
              </label>
              <input
                type="text"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="e.g. 78 - 74"
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Player Game Stats */}
          <div className="p-3.5 rounded bg-[#141C2D] border border-[#1F2C46] space-y-2">
            <span className="text-[10px] uppercase font-bold text-amber-400 block">
              Player Game Statistics
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-400">Mins Watched</label>
                <input
                  type="number"
                  value={minutesWatched}
                  onChange={(e) => setMinutesWatched(Number(e.target.value))}
                  className="w-full bg-[#182337] border border-[#23324F] rounded px-2 py-1 font-mono text-white text-center"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-400">PTS</label>
                <input
                  type="number"
                  value={pts}
                  onChange={(e) => setPts(Number(e.target.value))}
                  className="w-full bg-[#182337] border border-[#23324F] rounded px-2 py-1 font-mono text-white text-center"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-400">REB</label>
                <input
                  type="number"
                  value={reb}
                  onChange={(e) => setReb(Number(e.target.value))}
                  className="w-full bg-[#182337] border border-[#23324F] rounded px-2 py-1 font-mono text-white text-center"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-400">AST</label>
                <input
                  type="number"
                  value={ast}
                  onChange={(e) => setAst(Number(e.target.value))}
                  className="w-full bg-[#182337] border border-[#23324F] rounded px-2 py-1 font-mono text-white text-center"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-400">STL</label>
                <input
                  type="number"
                  value={stl}
                  onChange={(e) => setStl(Number(e.target.value))}
                  className="w-full bg-[#182337] border border-[#23324F] rounded px-2 py-1 font-mono text-white text-center"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-400">BLK</label>
                <input
                  type="number"
                  value={blk}
                  onChange={(e) => setBlk(Number(e.target.value))}
                  className="w-full bg-[#182337] border border-[#23324F] rounded px-2 py-1 font-mono text-white text-center"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-400">FG (M/A)</label>
                <input
                  type="text"
                  value={fg}
                  onChange={(e) => setFg(e.target.value)}
                  placeholder="8/14"
                  className="w-full bg-[#182337] border border-[#23324F] rounded px-2 py-1 font-mono text-white text-center"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Replay / Film Link (YouTube, Synergy, etc.)
            </label>
            <input
              type="url"
              value={replayUrl}
              onChange={(e) => setReplayUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Game Observations & Takeaways *
            </label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={3}
              required
              placeholder="Write observations regarding motor, shot selection, defensive matchups, crunch-time execution..."
              className="w-full bg-[#141C2E] border border-[#23314D] rounded p-3 text-white focus:outline-none focus:border-amber-500 leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingLog(false)}
              className="px-4 py-2 bg-[#182337] text-slate-300 rounded font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded"
            >
              Save Game Entry
            </button>
          </div>
        </form>
      )}

      {/* Filter */}
      <div className="relative max-w-md">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search games by player, team, event, observations..."
          className="w-full bg-[#111827] border border-[#1E293B] rounded-md pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* List */}
      {filteredLogs.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-[#111827] border border-[#1E293B] rounded-lg">
          <CalendarDays className="w-8 h-8 text-sky-500/40 mx-auto mb-2" />
          <p className="text-sm font-medium">No game logs found</p>
          <p className="text-xs text-slate-400 mt-1">
            Log your first scouted match to start tracking in-game performance history.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => {
            const p = prospects.find((item) => item.id === log.prospectId);
            return (
              <div
                key={log.id}
                className="bg-[#111827] border border-[#1E293B] hover:border-slate-700 rounded-lg p-5 space-y-3 transition-colors shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E293B] pb-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (p) {
                          setSelectedProspectId(p.id);
                          setActiveView('dossier');
                        }
                      }}
                      className="font-bold text-white hover:text-amber-400 text-sm transition-colors"
                    >
                      {p ? `${p.firstName} ${p.lastName}` : 'Prospect'}
                    </button>
                    {p && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#182338] text-slate-300">
                        {p.primaryPosition} · {p.currentTeam}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="font-mono text-slate-400">{log.gameDate}</span>
                    {log.replayUrl && (
                      <a
                        href={log.replayUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
                      >
                        <span>Replay</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Teams & Score */}
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-200">
                      {log.homeTeam} vs {log.awayTeam}
                    </span>
                    <span className="text-slate-500 ml-2">({log.competition})</span>
                  </div>
                  <div className="font-mono font-bold text-amber-400 text-sm">
                    {log.score}
                  </div>
                </div>

                {/* Box Score Strip */}
                {log.pts !== undefined && (
                  <div className="flex items-center gap-4 text-xs font-mono tabular-nums text-slate-300 bg-[#131B2B] px-3 py-1.5 rounded border border-[#1E273D]">
                    <span><strong className="text-white">{log.pts}</strong> PTS</span>
                    <span><strong className="text-white">{log.reb}</strong> REB</span>
                    <span><strong className="text-white">{log.ast}</strong> AST</span>
                    <span><strong className="text-white">{log.stl}</strong> STL</span>
                    <span><strong className="text-white">{log.blk}</strong> BLK</span>
                    <span><strong className="text-white">{log.fg}</strong> FG</span>
                    <span className="text-slate-500">({log.minutesWatched} mins)</span>
                  </div>
                )}

                {/* Observation */}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {log.observations}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
