import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipForward,
  Settings,
  ChevronLeft,
  Loader2,
  List,
  X,
  Subtitles,
} from 'lucide-react';
import Hls from 'hls.js';
import type { AnimeMedia } from '@/types';
import { getAnimeById } from '@/services/api';
import { storage } from '@/services/storage';
import { useSettings } from '@/hooks/useSettings';

// Public HLS test stream for demo purposes
const DEMO_STREAM = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

export default function WatchPage() {
  const { animeId, episodeNumber } = useParams<{ animeId: string; episodeNumber: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [anime, setAnime] = useState<AnimeMedia | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [epNum, setEpNum] = useState(parseInt(episodeNumber || '1'));
  const [nextEpCountdown, setNextEpCountdown] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalEpisodes = anime?.episodes || 12;

  // Load anime data
  useEffect(() => {
    if (!animeId) return;
    setLoading(true);
    getAnimeById(parseInt(animeId))
      .then((data) => {
        setAnime(data);
        if (episodeNumber) {
          setEpNum(parseInt(episodeNumber));
        }
      })
      .catch(() => setError('Failed to load anime'))
      .finally(() => setLoading(false));
  }, [animeId, episodeNumber]);

  // Initialize HLS player
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      });
      hls.loadSource(DEMO_STREAM);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Check for saved progress
        if (animeId) {
          const saved = storage.getProgressForEpisode(parseInt(animeId), epNum);
          if (saved && saved.currentTime > 0 && saved.duration > 0) {
            video.currentTime = saved.currentTime;
          }
        }
        setDuration(video.duration || 0);
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setError('Failed to load video stream');
        }
      });
      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = DEMO_STREAM;
      video.addEventListener('loadedmetadata', () => {
        setDuration(video.duration || 0);
      });
    }

    return () => {
      hlsRef.current?.destroy();
    };
  }, [animeId, epNum]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    const onDurationChange = () => {
      setDuration(video.duration || 0);
    };
    const onWaiting = () => setBuffering(true);
    const onPlaying = () => {
      setBuffering(false);
      setPlaying(true);
    };
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      if (settings.autoplayNext && epNum < totalEpisodes) {
        setNextEpCountdown(5);
      }
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
    };
  }, [epNum, totalEpisodes, settings.autoplayNext]);

  // Save progress periodically
  useEffect(() => {
    if (!anime || !animeId) return;
    saveInterval.current = setInterval(() => {
      const video = videoRef.current;
      if (video && video.currentTime > 0) {
        storage.saveWatchProgress(parseInt(animeId), epNum, video.currentTime, video.duration || duration, anime);
      }
    }, 5000);

    return () => {
      if (saveInterval.current) clearInterval(saveInterval.current);
    };
  }, [anime, animeId, epNum, duration]);

  // Next episode countdown
  useEffect(() => {
    if (nextEpCountdown > 0) {
      countdownInterval.current = setInterval(() => {
        setNextEpCountdown((prev) => {
          if (prev <= 1) {
            goToEpisode(epNum + 1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [nextEpCountdown]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowright':
          seek(10);
          break;
        case 'arrowleft':
          seek(-10);
          break;
        case 'arrowup':
          e.preventDefault();
          changeVolume(0.1);
          break;
        case 'arrowdown':
          e.preventDefault();
          changeVolume(-0.1);
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'm':
          toggleMute();
          break;
        case 'n':
          if (epNum < totalEpisodes) goToEpisode(epNum + 1);
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [epNum, totalEpisodes, playing]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, []);

  const seek = useCallback((amount: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + amount));
  }, []);

  const seekTo = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, time));
  }, []);

  const changeVolume = useCallback((delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    const newVol = Math.max(0, Math.min(1, video.volume + delta));
    video.volume = newVol;
    setVolume(newVol);
    setMuted(newVol === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setFullscreen(false);
    }
  }, []);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    if (playing) {
      controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [playing]);

  const goToEpisode = (num: number) => {
    if (!animeId || num < 1 || num > totalEpisodes) return;
    // Save current progress before leaving
    const video = videoRef.current;
    if (video && anime) {
      storage.saveWatchProgress(parseInt(animeId), epNum, video.currentTime, video.duration || duration, anime);
    }
    setNextEpCountdown(0);
    navigate(`/watch/${animeId}/${num}`);
    setEpNum(num);
    setTimeout(() => {
      video?.play().catch(() => {});
    }, 500);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    if (m >= 60) {
      const h = Math.floor(m / 60);
      return `${h}:${String(m % 60).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712]">
        <Loader2 className="w-8 h-8 text-[#f43f5e] animate-spin" />
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712]">
        <div className="text-center">
          <p className="text-[#94a3b8] mb-4">{error || 'Anime not found'}</p>
          <a href="#/" className="text-[#f43f5e] hover:underline">Go home</a>
        </div>
      </div>
    );
  }

  const title = anime.title.english || anime.title.romaji;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-[#030712] flex flex-col"
      onMouseMove={handleMouseMove}
      onClick={() => {
        if (!showSettings && !showEpisodeList) {
          handleMouseMove();
        }
      }}
    >
      {/* Top bar */}
      <div
        className={`absolute top-0 left-0 right-0 z-30 px-4 py-3 flex items-center justify-between transition-opacity duration-300 bg-gradient-to-b from-black/70 to-transparent ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/anime/${anime.id}`)}
            className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-sm font-medium text-white line-clamp-1">{title}</p>
            <p className="text-xs text-[#94a3b8]">Episode {epNum}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEpisodeList(!showEpisodeList)}
            className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate(`/anime/${anime.id}`)}
            className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Video */}
      <div className="flex-1 relative flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          className="w-full h-full max-h-screen"
          playsInline
          onClick={togglePlay}
          onDoubleClick={toggleFullscreen}
        />

        {/* Center play/pause button */}
        {!playing && !buffering && (
          <button
            onClick={togglePlay}
            className="absolute z-20 w-16 h-16 rounded-full bg-[#f43f5e]/90 hover:bg-[#f43f5e] flex items-center justify-center transition-transform hover:scale-110"
          >
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </button>
        )}

        {/* Buffering spinner */}
        {buffering && (
          <div className="absolute z-20">
            <Loader2 className="w-10 h-10 text-[#f43f5e] animate-spin" />
          </div>
        )}

        {/* Skip intro button */}
        {settings.autoSkipIntro && currentTime > 0 && currentTime < 90 && (
          <button
            onClick={() => seekTo(90)}
            className="absolute bottom-24 right-6 z-20 bg-[#f43f5e] hover:bg-[#e11d48] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Skip Intro
          </button>
        )}

        {/* Next episode countdown */}
        {nextEpCountdown > 0 && (
          <div className="absolute bottom-24 right-6 z-20 bg-[#0f172a] border border-[#1e293b] rounded-lg p-4 text-center">
            <p className="text-sm text-[#f8fafc] mb-2">Next episode in {nextEpCountdown}s</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setNextEpCountdown(0)}
                className="px-3 py-1.5 text-xs bg-[#1e293b] hover:bg-[#334155] text-[#94a3b8] rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => goToEpisode(epNum + 1)}
                className="px-3 py-1.5 text-xs bg-[#f43f5e] hover:bg-[#e11d48] text-white rounded transition-colors"
              >
                Watch Now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 transition-opacity duration-300 bg-gradient-to-t from-black/80 via-black/40 to-transparent ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress bar */}
        <div
          className="relative h-1.5 bg-white/20 cursor-pointer group mx-4 mb-2"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            seekTo(pct * duration);
          }}
        >
          <div
            className="absolute top-0 left-0 h-full bg-[#f43f5e] transition-all"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#f43f5e] rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:text-[#f43f5e] transition-colors">
              {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
            </button>

            <button
              onClick={() => goToEpisode(epNum - 1)}
              disabled={epNum <= 1}
              className="text-white hover:text-[#f43f5e] transition-colors disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => goToEpisode(epNum + 1)}
              disabled={epNum >= totalEpisodes}
              className="text-white hover:text-[#f43f5e] transition-colors disabled:opacity-30 flex items-center gap-1"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            <button onClick={toggleMute} className="text-white hover:text-[#f43f5e] transition-colors">
              {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setVolume(v);
                  if (videoRef.current) {
                    videoRef.current.volume = v;
                    videoRef.current.muted = v === 0;
                  }
                  setMuted(v === 0);
                }}
                className="w-20 accent-[#f43f5e]"
              />
              <span className="text-xs text-[#94a3b8] w-20">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`text-white hover:text-[#f43f5e] transition-colors ${showSettings ? 'text-[#f43f5e]' : ''}`}
            >
              <Settings className="w-5 h-5" />
            </button>
            <button onClick={toggleFullscreen} className="text-white hover:text-[#f43f5e] transition-colors">
              {fullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="absolute bottom-20 right-4 z-40 w-56 bg-[#0f172a] border border-[#1e293b] rounded-xl shadow-xl p-3">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1e293b]">
            <span className="text-sm font-semibold text-[#f8fafc]">Settings</span>
            <button onClick={() => setShowSettings(false)} className="text-[#94a3b8] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#94a3b8]">Quality</span>
              <span className="text-xs text-[#f8fafc] font-medium">Auto</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#94a3b8]">Subtitles</span>
              <Subtitles className="w-4 h-4 text-[#94a3b8]" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#94a3b8]">Playback Speed</span>
              <span className="text-xs text-[#f8fafc]">1.0x</span>
            </div>
          </div>
        </div>
      )}

      {/* Episode list sidebar */}
      {showEpisodeList && (
        <div className="absolute top-14 bottom-0 right-0 z-40 w-80 bg-[#030712]/95 backdrop-blur-md border-l border-[#1e293b] overflow-y-auto">
          <div className="sticky top-0 bg-[#030712]/95 backdrop-blur-md px-4 py-3 border-b border-[#1e293b] flex items-center justify-between">
            <span className="text-sm font-semibold text-[#f8fafc]">Episodes</span>
            <button onClick={() => setShowEpisodeList(false)} className="text-[#94a3b8] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-3 space-y-1">
            {Array.from({ length: totalEpisodes }, (_, i) => {
              const num = i + 1;
              const progress = storage.getProgressForEpisode(anime.id, num);
              const isActive = num === epNum;
              return (
                <button
                  key={num}
                  onClick={() => {
                    goToEpisode(num);
                    setShowEpisodeList(false);
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors text-left ${
                    isActive ? 'bg-[#f43f5e]/10 border border-[#f43f5e]/20' : 'hover:bg-[#0f172a]'
                  }`}
                >
                  <div className="relative w-16 aspect-video rounded overflow-hidden flex-shrink-0 bg-[#0f172a]">
                    <img src={anime.coverImage.medium} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20" />
                    {isActive && playing && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse" />
                      </div>
                    )}
                    {progress && progress.duration > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
                        <div
                          className="h-full bg-[#f43f5e]"
                          style={{ width: `${Math.min((progress.currentTime / progress.duration) * 100, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium line-clamp-1 ${isActive ? 'text-[#f43f5e]' : 'text-[#f8fafc]'}`}>
                      EP {num}
                    </p>
                    {progress && progress.currentTime > 0 && (
                      <p className="text-xs text-[#94a3b8]">
                        {Math.round((progress.currentTime / progress.duration) * 100)}%
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
