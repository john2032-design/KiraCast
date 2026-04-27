import { useState, useEffect } from 'react';
import { Clock, Calendar, Loader2 } from 'lucide-react';
import type { AiringScheduleItem } from '@/types';
import { getAiringSchedule } from '@/services/api';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<AiringScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());

  useEffect(() => {
    setLoading(true);
    const now = Math.floor(Date.now() / 1000);
    const weekLater = now + 7 * 24 * 60 * 60;

    getAiringSchedule(1, 100, now, weekLater)
      .then((data) => {
        setSchedule(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getDaySchedule = (dayIndex: number) => {
    return schedule.filter((item) => {
      const date = new Date(item.airingAt * 1000);
      return date.getDay() === dayIndex;
    }).sort((a, b) => a.airingAt - b.airingAt);
  };

  const currentDaySchedule = getDaySchedule(selectedDay);

  return (
    <div className="min-h-screen pt-20 lg:pt-6 pb-20 px-4 lg:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-[#f43f5e]" />
          <h1 className="text-2xl font-bold text-[#f8fafc]">Airing Schedule</h1>
        </div>

        {/* Day selector */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto hide-scrollbar">
          {DAYS.map((day, i) => (
            <button
              key={day}
              onClick={() => setSelectedDay(i)}
              className={`flex-1 min-w-[60px] py-3 rounded-lg text-sm font-medium transition-colors ${
                selectedDay === i
                  ? 'bg-[#f43f5e] text-white'
                  : 'bg-[#0f172a] text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1e293b]'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#f43f5e] animate-spin" />
          </div>
        ) : currentDaySchedule.length === 0 ? (
          <div className="text-center py-20">
            <Clock className="w-12 h-12 text-[#1e293b] mx-auto mb-4" />
            <p className="text-[#94a3b8]">No episodes airing on {DAYS[selectedDay]}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {currentDaySchedule.map((item) => {
              const date = new Date(item.airingAt * 1000);
              const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const isAired = date < new Date();

              return (
                <a
                  key={item.id}
                  href={`/anime/${item.media.id}`}
                  className="flex items-center gap-4 p-3 bg-[#0f172a] hover:bg-[#1e293b] rounded-xl transition-colors"
                >
                  <div className="w-20 md:w-24 aspect-[3/4] rounded-lg overflow-hidden flex-shrink-0 bg-[#030712]">
                    <img
                      src={item.media.coverImage.large}
                      alt={item.media.title.english || item.media.title.romaji}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#f8fafc] line-clamp-1">
                      {item.media.title.english || item.media.title.romaji}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[#94a3b8]">EP {item.episode}</span>
                      <span className="text-xs text-[#94a3b8]">{item.media.format}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full ${isAired ? 'bg-[#22c55e]' : 'bg-[#f43f5e] animate-pulse'}`} />
                    <span className="text-sm text-[#94a3b8] font-mono">{time}</span>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
