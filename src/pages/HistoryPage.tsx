import { useState } from 'react';
import { Clock, Trash2, Play, Loader2 } from 'lucide-react';
import { storage } from '@/services/storage';

export default function HistoryPage() {
  const [history, setHistory] = useState(() => storage.getHistory());
  const [clearing, setClearing] = useState(false);

  const handleClear = () => {
    if (!confirm('Are you sure you want to clear all watch history?')) return;
    setClearing(true);
    storage.clearHistory();
    setHistory([]);
    setClearing(false);
  };

  const groupedByDate = history.reduce((acc, item) => {
    const date = new Date(item.updatedAt);
    const key = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, typeof history>);

  return (
    <div className="min-h-screen pt-20 lg:pt-6 pb-20 px-4 lg:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-[#f43f5e]" />
            <h1 className="text-2xl font-bold text-[#f8fafc]">Watch History</h1>
          </div>
          {history.length > 0 && (
            <button
              onClick={handleClear}
              disabled={clearing}
              className="flex items-center gap-2 px-4 py-2 bg-[#0f172a] hover:bg-red-500/10 border border-[#1e293b] hover:border-red-500/30 rounded-lg text-sm text-[#94a3b8] hover:text-red-400 transition-colors"
            >
              {clearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Clear History
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-20">
            <Clock className="w-12 h-12 text-[#1e293b] mx-auto mb-4" />
            <p className="text-[#94a3b8]">No watch history yet</p>
            <p className="text-[#64748b] text-sm mt-1">Start watching anime to see your history here</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedByDate).map(([date, items]) => (
              <div key={date}>
                <h2 className="text-xs uppercase tracking-wider text-[#94a3b8] font-semibold mb-3">{date}</h2>
                <div className="space-y-2">
                  {items.map((item) => {
                    const progressPercent = item.duration > 0 ? (item.currentTime / item.duration) * 100 : 0;
                    return (
                      <a
                        key={item.id}
                        href={`/watch/${item.animeId}/${item.episodeNumber}`}
                        className="flex items-center gap-4 p-3 bg-[#0f172a] hover:bg-[#1e293b] rounded-xl transition-colors group"
                      >
                        <div className="relative w-28 md:w-36 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-[#030712]">
                          <img
                            src={item.coverImage}
                            alt={item.animeTitle}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/20" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-8 h-8 rounded-full bg-[#f43f5e] flex items-center justify-center">
                              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                            </div>
                          </div>
                          {/* Progress */}
                          {progressPercent > 0 && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                              <div
                                className="h-full bg-[#f43f5e]"
                                style={{ width: `${Math.min(progressPercent, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#f8fafc] line-clamp-1 group-hover:text-[#f43f5e] transition-colors">
                            {item.animeTitle}
                          </p>
                          <p className="text-xs text-[#94a3b8] mt-1">
                            Episode {item.episodeNumber}
                          </p>
                          <p className="text-xs text-[#64748b] mt-0.5">
                            {formatTime(item.currentTime)} / {formatTime(item.duration)}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="text-xs text-[#64748b]">
                            {new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
