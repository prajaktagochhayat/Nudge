import { motion } from 'framer-motion';
import { 
  Sparkles, Activity, Shield, Play, AlertCircle, 
  Flame, Mic, BarChart, Calendar, ChevronRight
} from 'lucide-react';

interface FeaturesPageProps {
  onBackToSite: () => void;
  onLaunchConsole: () => void;
}

export default function FeaturesPage({ onBackToSite, onLaunchConsole }: FeaturesPageProps) {
  const features = [
    {
      title: 'Smart Planning',
      description: 'Nudge learns your energy patterns to lock in deep work when your focus is highest, not just when your calendar is empty.',
      icon: <Sparkles className="text-[#8B6CFF]" />,
      bgColor: 'bg-[#F3EEFF]/80',
      borderColor: 'border-[#8B6CFF]/20',
      preview: (
        <div className="w-full p-3 bg-white/80 rounded-2xl border border-zinc-100 flex flex-col gap-1.5 text-[9px] font-semibold text-[#312E5B]">
          <div className="flex justify-between items-center text-zinc-450 text-[8px] font-mono">
            <span>SUGGESTED SESSION</span>
            <span className="text-[#8B6CFF]">High Energy</span>
          </div>
          <div className="flex items-center justify-between border-l-2 border-[#8B6CFF] pl-2 py-0.5">
            <div>
              <span className="block font-black">Design Presentation</span>
              <span className="text-zinc-450">10:00 AM - 11:30 AM</span>
            </div>
            <span className="bg-[#8B6CFF]/15 text-[#8B6CFF] px-1.5 py-0.5 rounded text-[7px] font-bold">Lock In</span>
          </div>
        </div>
      )
    },
    {
      title: 'Priority Galaxy',
      description: 'Task lists are flat. Galaxy maps your work in 3D orbit based on urgency, effort, and impact so you instantly see what matters.',
      icon: <Activity className="text-[#67E8F9]" />,
      bgColor: 'bg-[#EAF4FF]/80',
      borderColor: 'border-[#67E8F9]/20',
      preview: (
        <div className="w-full h-16 bg-zinc-950 rounded-2xl relative flex items-center justify-center overflow-hidden border border-zinc-800">
          <div className="absolute w-12 h-12 rounded-full border border-dashed border-zinc-800" />
          <div className="absolute w-6 h-6 rounded-full border border-dashed border-zinc-850" />
          <div className="w-1.5 h-1.5 bg-[#8B6CFF] rounded-full shadow-[0_0_6px_#8B6CFF] absolute top-2 animate-pulse" />
          <div className="w-1 h-1 bg-[#FFAA8A] rounded-full shadow-[0_0_4px_#FFAA8A] absolute right-4 bottom-3" />
          <div className="w-2 h-2 bg-[#6EE7B7] rounded-full shadow-[0_0_6px_#6EE7B7] absolute left-3 top-6" />
        </div>
      )
    },
    {
      title: 'Context-Aware Nudges',
      description: 'Gentle, proactive notifications that nudge you to take breaks, start focus sessions, or wrap up tasks to match your energy level.',
      icon: <Shield className="text-[#FFAA8A]" />,
      bgColor: 'bg-[#FFF0F6]/80',
      borderColor: 'border-[#FFAA8A]/20',
      preview: (
        <div className="w-full p-2.5 bg-[#FFF6CC]/80 border border-[#F6D365]/35 rounded-xl text-[8.5px] font-semibold text-[#312E5B] flex items-start gap-2">
          <span>💡</span>
          <div>
            <span className="block font-black text-[9px] text-[#FFAA8A]">Quick Nudge</span>
            <span>You have 25 free minutes. Finish your project brief outline?</span>
          </div>
        </div>
      )
    },
    {
      title: 'Focus Room',
      description: 'Calm immersive space that protects your attention. Masks distracting notifications, plays soft lofi/rain sounds, and loops focus timers.',
      icon: <Play className="text-[#8B6CFF]" fill="currentColor" />,
      bgColor: 'bg-[#F3EEFF]/80',
      borderColor: 'border-[#8B6CFF]/20',
      preview: (
        <div className="w-full p-3 bg-white/95 rounded-2xl border border-zinc-150 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-450 animate-ping" />
            <span className="text-[10px] font-black text-[#312E5B]">Lo-Fi Focus</span>
          </div>
          <span className="text-[9px] font-mono text-zinc-405 font-bold">25:00</span>
        </div>
      )
    },
    {
      title: 'Deadline Radar',
      description: 'Never get blindsided. Radar calculates task trajectories, tracking deadlines as orbiting satellites that pull closer as they approach.',
      icon: <AlertCircle className="text-[#F9A8D4]" />,
      bgColor: 'bg-[#FFF0F6]/80',
      borderColor: 'border-[#F9A8D4]/20',
      preview: (
        <div className="w-full p-3 bg-white/80 rounded-2xl border border-zinc-100 flex items-center justify-between text-[9px] font-bold">
          <span className="text-[#FFAA8A]">⚠️ Urgent</span>
          <span className="text-[#312E5B]">Assignment draft due in 3h</span>
        </div>
      )
    },
    {
      title: 'Habit Bloom',
      description: 'Track daily micro-habits. For every completion, watch plants inside your Workspace Garden grow petals and bloom leaves.',
      icon: <Flame className="text-[#6EE7B7]" />,
      bgColor: 'bg-[#E7FFF4]/80',
      borderColor: 'border-[#6EE7B7]/20',
      preview: (
        <div className="w-full h-14 bg-white/70 border border-zinc-150 rounded-2xl flex items-center justify-center gap-1.5">
          <svg width="24" height="24" viewBox="0 0 24 24" className="overflow-visible">
            <path d="M12 20 Q10 13 12 7" stroke="#6EE7B7" strokeWidth="2" fill="none" />
            <circle cx="12" cy="7" r="3.5" fill="#F6D365" />
            <circle cx="8" cy="7" r="2.5" fill="#F9A8D4" className="animate-pulse" />
            <circle cx="16" cy="7" r="2.5" fill="#F9A8D4" className="animate-pulse" />
          </svg>
          <span className="text-[8px] font-extrabold text-zinc-450 uppercase font-mono">Habits Synchronized</span>
        </div>
      )
    },
    {
      title: 'Voice Commands',
      description: 'Add tasks organically. Say "I need to prepare client review tomorrow morning" and Nudge automatically parses dates, categories, and energy levels.',
      icon: <Mic className="text-[#FFAA8A]" />,
      bgColor: 'bg-[#FFF6CC]/80',
      borderColor: 'border-[#FFAA8A]/20',
      preview: (
        <div className="w-full p-2.5 bg-white/80 rounded-2xl border border-zinc-100 flex items-center gap-2 text-[9px]">
          <span className="w-3.5 h-3.5 rounded-full bg-red-100 flex items-center justify-center text-red-500 animate-pulse">🎤</span>
          <span className="text-zinc-450 italic">"Plan weekly goals after lunch..."</span>
        </div>
      )
    },
    {
      title: 'Productivity Insights',
      description: 'Analyze energy patterns, calendar congestion, and focus streaks over time to optimize your daily deep work thresholds.',
      icon: <BarChart className="text-[#8B6CFF]" />,
      bgColor: 'bg-[#F3EEFF]/80',
      borderColor: 'border-[#8B6CFF]/20',
      preview: (
        <div className="w-full h-14 flex items-end gap-1 px-3 pb-1 border border-zinc-150 rounded-2xl bg-white/80 overflow-hidden">
          <div className="flex-1 h-[30%] bg-[#8B6CFF]/30 rounded-t" />
          <div className="flex-1 h-[75%] bg-[#8B6CFF]/70 rounded-t" />
          <div className="flex-1 h-[55%] bg-[#F9A8D4]/75 rounded-t" />
          <div className="flex-1 h-[90%] bg-[#6EE7B7]/80 rounded-t" />
        </div>
      )
    },
    {
      title: 'Calendar Sync',
      description: 'Zero-touch synchronization. Connect Google Calendar, Outlook, and Apple Calendar instantly to auto-fill work blocks.',
      icon: <Calendar className="text-[#67E8F9]" />,
      bgColor: 'bg-[#EAF4FF]/80',
      borderColor: 'border-[#67E8F9]/20',
      preview: (
        <div className="w-full flex justify-center gap-2.5 py-2.5">
          <span className="w-6 h-6 rounded-lg bg-[#EAF4FF] flex items-center justify-center font-bold text-xs text-[#397BFF]">G</span>
          <span className="w-6 h-6 rounded-lg bg-[#FFF0F6] flex items-center justify-center font-bold text-xs text-[#F9A8D4]">O</span>
          <span className="w-6 h-6 rounded-lg bg-[#F3EEFF] flex items-center justify-center font-bold text-xs text-[#8B6CFF]">N</span>
        </div>
      )
    }
  ];

  return (
    <div className="w-full py-8 text-left space-y-12">
      {/* Back Button & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#312E5B]/10">
        <div>
          <button 
            onClick={onBackToSite}
            className="text-xs font-black text-zinc-400 hover:text-[#8B6CFF] transition-colors cursor-pointer mb-2 block"
          >
            ← Back to Site
          </button>
          <span className="text-[10px] font-mono font-black tracking-widest text-[#8B6CFF] uppercase bg-[#8B6CFF]/10 px-3 py-1.5 rounded-full border border-[#8B6CFF]/20">
            Nudge Core Features
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-[#312E5B] tracking-tight mt-4 max-w-2xl leading-none">
            More than reminders. <br />
            A smarter way to move through your day.
          </h1>
        </div>
        
        <button 
          onClick={onLaunchConsole}
          className="bg-gradient-to-r from-[#8B6CFF] to-[#F9A8D4] text-white text-xs font-bold px-7 py-3.5 rounded-full shadow-lg shadow-[#8B6CFF]/15 hover:opacity-95 transition-all flex items-center gap-1 cursor-pointer self-start md:self-end"
        >
          <span>Launch Workspace Console</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feat, idx) => (
          <motion.div
            key={feat.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -5 }}
            className={`glass-panel p-6 rounded-3xl border ${feat.bgColor} ${feat.borderColor} flex flex-col justify-between min-h-[300px] hover:shadow-lg hover:shadow-[#8B6CFF]/5 transition-all duration-300`}
          >
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                {feat.icon}
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-extrabold text-[#312E5B]">{feat.title}</h3>
                <p className="text-xs text-[#4B4B5C] leading-relaxed font-semibold">{feat.description}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-white/40 mt-6">
              <div className="text-[7.5px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-2">Live UI Preview</div>
              {feat.preview}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
