import { Settings, RotateCcw, Monitor, Volume2, SkipForward, ListVideo, Eye, Gauge, Globe, Play } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettings();

  return (
    <div className="min-h-screen pt-20 lg:pt-6 pb-20 px-4 lg:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-6 h-6 text-[#f43f5e]" />
          <h1 className="text-2xl font-bold text-[#f8fafc]">Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Playback Section */}
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1e293b]">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-[#f43f5e]" />
                <h2 className="text-sm font-semibold text-[#f8fafc] uppercase tracking-wider">Playback</h2>
              </div>
            </div>
            <div className="p-5 space-y-5">
              <SettingToggle
                icon={<ListVideo className="w-5 h-5" />}
                label="Autoplay Next Episode"
                description="Automatically play the next episode when current one ends"
                enabled={settings.autoplayNext}
                onChange={(v) => updateSettings({ autoplayNext: v })}
              />
              <SettingToggle
                icon={<SkipForward className="w-5 h-5" />}
                label="Auto Skip Intro"
                description="Skip anime opening sequences automatically"
                enabled={settings.autoSkipIntro}
                onChange={(v) => updateSettings({ autoSkipIntro: v })}
              />
            </div>
          </div>

          {/* Quality Section */}
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1e293b]">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-[#f43f5e]" />
                <h2 className="text-sm font-semibold text-[#f8fafc] uppercase tracking-wider">Quality & Language</h2>
              </div>
            </div>
            <div className="p-5 space-y-5">
              <SettingSelect
                icon={<Monitor className="w-5 h-5" />}
                label="Default Quality"
                value={settings.defaultQuality}
                options={['Auto', '1080p', '720p', '480p', '360p']}
                onChange={(v) => updateSettings({ defaultQuality: v })}
              />
              <SettingSelect
                icon={<Globe className="w-5 h-5" />}
                label="Preferred Language"
                value={settings.preferredLanguage === 'sub' ? 'Subtitled' : 'Dubbed'}
                options={['Subtitled', 'Dubbed']}
                onChange={(v) => updateSettings({ preferredLanguage: v === 'Subtitled' ? 'sub' : 'dub' })}
              />
            </div>
          </div>

          {/* Display Section */}
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1e293b]">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#f43f5e]" />
                <h2 className="text-sm font-semibold text-[#f8fafc] uppercase tracking-wider">Display</h2>
              </div>
            </div>
            <div className="p-5 space-y-5">
              <SettingToggle
                icon={<Volume2 className="w-5 h-5" />}
                label="Show Spoilers"
                description="Display episode descriptions that may contain spoilers"
                enabled={settings.showSpoilers}
                onChange={(v) => updateSettings({ showSpoilers: v })}
              />
              <SettingToggle
                icon={<ListVideo className="w-5 h-5" />}
                label="Compact Episode List"
                description="Use a more compact layout for episode lists"
                enabled={settings.compactEpisodeList}
                onChange={(v) => updateSettings({ compactEpisodeList: v })}
              />
              <SettingSelect
                icon={<Monitor className="w-5 h-5" />}
                label="Theme"
                value={settings.theme === 'dark' ? 'Dark' : 'Darker'}
                options={['Dark', 'Darker']}
                onChange={(v) => updateSettings({ theme: v === 'Dark' ? 'dark' : 'darker' })}
              />
            </div>
          </div>

          {/* Reset */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                if (confirm('Reset all settings to defaults?')) {
                  resetSettings();
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0f172a] hover:bg-red-500/10 border border-[#1e293b] hover:border-red-500/30 rounded-lg text-sm text-[#94a3b8] hover:text-red-400 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingToggle({
  icon,
  label,
  description,
  enabled,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-[#94a3b8]">{icon}</div>
        <div>
          <p className="text-sm font-medium text-[#f8fafc]">{label}</p>
          <p className="text-xs text-[#94a3b8] mt-0.5">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 mt-1 ${
          enabled ? 'bg-[#f43f5e]' : 'bg-[#334155]'
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

function SettingSelect({
  icon,
  label,
  value,
  options,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="text-[#94a3b8]">{icon}</div>
        <p className="text-sm font-medium text-[#f8fafc]">{label}</p>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#030712] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#f8fafc] focus:outline-none focus:border-[#f43f5e] flex-shrink-0"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
