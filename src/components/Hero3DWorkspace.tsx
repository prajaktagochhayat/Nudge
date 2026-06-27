import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  Flame, Zap, Heart, Compass, Play, Sparkles
} from 'lucide-react';

export default function Hero3DWorkspace() {
  // Floating properties linked directly to Framer Motion values to avoid React re-renders
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 85, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 85, damping: 22 });

  const rotateX = useTransform(springY, [-0.5, 0.5], [14, -14]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-14, 14]);

  // Widget states
  const [seconds, setSeconds] = useState(1469); // 24:29 Pomodoro
  const [nudgeIdx, setNudgeIdx] = useState(0);
  const [plantsGrowth, setPlantsGrowth] = useState([3, 4, 2]); // Habit plants bloom levels
  const [momentumRate, setMomentumRate] = useState(87);
  const [focusState, setFocusState] = useState<'idle' | 'focus'>('idle');
  const [suggestState, setSuggestState] = useState<'idle' | 'planned'>('idle');

  // Mouse move event tracking (attaches directly to motion values)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseX.set((e.clientX / innerWidth) - 0.5);
      mouseY.set((e.clientY / innerHeight) - 0.5);
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseX, mouseY]);

  // Countdown timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => (s > 0 ? s - 1 : 1469));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Quick nudges carousel
  const quickNudges = [
    "You have 25 free minutes",
    "Finish your assignment outline?",
    "Your focus is strongest right now",
    "You’re doing great today!"
  ];
  useEffect(() => {
    const interval = setInterval(() => {
      setNudgeIdx(idx => (idx + 1) % quickNudges.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Live momentum flux
  useEffect(() => {
    const interval = setInterval(() => {
      setMomentumRate(r => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = r + delta;
        return next > 96 ? 96 : next < 78 ? 78 : next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handlePlantClick = (index: number) => {
    setPlantsGrowth(prev => {
      const next = [...prev];
      next[index] = next[index] < 5 ? next[index] + 1 : 1;
      return next;
    });
  };

  // Format time display
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  const timeStr = `${min}:${sec < 10 ? '0' : ''}${sec}`;

  return (
    <div 
      className="relative w-full h-[620px] flex items-center justify-center pointer-events-auto select-none"
      style={{
        perspective: '1400px'
      }}
    >
      {/* Dynamic ambient color reflection spots behind card */}
      <div className="absolute top-10 left-[20%] w-80 h-80 rounded-full bg-[#FFF0F6]/70 blur-[100px] pointer-events-none animate-bg-glow" />
      <div className="absolute bottom-10 right-[25%] w-72 h-72 rounded-full bg-[#E7FFF4]/75 blur-[90px] pointer-events-none animate-bg-glow" style={{ animationDelay: '-6s' }} />

      {/* TILTED GLASS PORTAL CONTAINER */}
      <motion.div
        style={{
          rotateX, 
          rotateY,
          transformStyle: 'preserve-3d',
          boxShadow: '0 30px 70px rgba(139, 108, 255, 0.07), inset 0 0 20px rgba(255, 255, 255, 0.6)'
        }}
        animate={{
          y: [0, -6, 0]
        }}
        transition={{
          repeat: Infinity,
          duration: 6,
          ease: "easeInOut"
        }}
        className="relative w-full max-w-[550px] h-[570px] bg-gradient-to-tr from-[#F3EEFF]/40 via-white/50 to-[#EAF4FF]/40 rounded-[36px] p-5 border border-white/80 glass-reflection shadow-2xl gpu-accelerated"
      >
        
        {/* Portal Header Toolbar */}
        <div className="flex items-center justify-between border-b border-[#312E5B]/10 pb-2 mb-3.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F9A8D4] shadow-[0_0_5px_#F9A8D4]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#F6D365] shadow-[0_0_5px_#F6D365]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#6EE7B7] shadow-[0_0_5px_#6EE7B7]" />
            <span className="text-[8px] font-mono text-zinc-400 font-extrabold uppercase ml-2 tracking-widest">Nudge Portal v2.6</span>
          </div>
          <span className="text-[7.5px] bg-[#8B6CFF]/10 text-[#8B6CFF] font-bold px-2 py-0.5 rounded-full border border-[#8B6CFF]/20 uppercase">
            Active Space
          </span>
        </div>

        {/* 9 widgets grid */}
        <div className="grid grid-cols-12 gap-3">
          
          {/* 1. TODAY'S FOCUS */}
          <div className="col-span-6 p-3 bg-white/85 rounded-2xl border border-zinc-150 shadow-xs flex flex-col justify-between h-[120px] text-left">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[6.5px] font-mono text-zinc-400 font-bold uppercase">Today's Focus</span>
                <span className="text-[7px] text-[#FFAA8A] bg-[#FFAA8A]/15 px-1.5 rounded font-black uppercase">High Priority</span>
              </div>
              <h4 className="text-[10px] font-black text-[#312E5B] mt-1.5 leading-tight">
                Design Presentation for Client Review
              </h4>
              <span className="text-[8px] text-zinc-450 font-mono block mt-0.5">75 minutes · Deep Work</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setFocusState(s => s === 'idle' ? 'focus' : 'idle')}
                className="bg-[#8B6CFF] hover:bg-[#8B6CFF]/90 text-white text-[8px] font-black px-3 py-1 rounded-lg transition-all flex items-center gap-0.5 cursor-pointer active:scale-95"
              >
                <Play size={8} fill="currentColor" />
                <span>{focusState === 'focus' ? 'Active' : 'Start Now'}</span>
              </button>
              <button className="bg-white border border-zinc-200 text-zinc-500 hover:text-[#312E5B] text-[8px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer">
                Break it down
              </button>
            </div>
          </div>

          {/* 5. FOCUS TIMER */}
          <div className="col-span-6 p-3 bg-[#F3EEFF]/40 rounded-2xl border border-[#8B6CFF]/15 shadow-xs flex flex-col items-center justify-center h-[120px] relative overflow-hidden">
            {/* Background vector rings */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,168,212,0.06)_0%,transparent_70%)] pointer-events-none" />
            
            <div className="relative w-15 h-15 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-white/60" strokeWidth="2.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <motion.path 
                  className="text-[#8B6CFF]" 
                  strokeWidth="2.5" 
                  strokeDasharray={`${(seconds / 1469) * 100}, 100`} 
                  strokeLinecap="round" 
                  stroke="currentColor" 
                  fill="none" 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                />
              </svg>
              <span className="absolute text-[10px] font-mono font-black text-[#312E5B]">{timeStr}</span>
            </div>
            <span className="text-[7.5px] font-mono font-black text-[#8B6CFF] uppercase tracking-wider mt-1.5">Deep Work block</span>
          </div>

          {/* 2. AI SUGGESTION */}
          <div className="col-span-7 p-3 bg-[#EAF4FF]/85 border border-[#67E8F9]/25 rounded-2xl shadow-xs flex flex-col justify-between h-[110px] text-left">
            <div>
              <span className="text-[7px] font-mono font-black text-[#8B6CFF] uppercase tracking-wider flex items-center gap-1">
                <Compass size={10} className="animate-spin-slow text-[#8B6CFF]" />
                Nudge AI Suggestion
              </span>
              <p className="text-[9px] font-black text-[#312E5B] mt-1">
                Nudge found your best focus window.
              </p>
              <p className="text-[8px] text-[#4B4B5C] font-semibold">
                10:00 AM – 11:30 AM is ideal for deep work.
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setSuggestState('planned')}
                className="bg-[#8B6CFF] hover:bg-[#8B6CFF]/90 text-white text-[8px] font-bold px-3 py-1 rounded-lg cursor-pointer transition-all active:scale-95"
              >
                {suggestState === 'planned' ? 'Planned' : 'Plan it'}
              </button>
              <button className="bg-white/60 border border-[#8B6CFF]/15 text-[#8B6CFF] text-[8px] font-bold px-3 py-1 rounded-lg hover:bg-white cursor-pointer transition-colors">
                Maybe later
              </button>
            </div>
          </div>

          {/* 6. ENERGY + MOOD */}
          <div className="col-span-5 p-3 bg-white/85 rounded-2xl border border-zinc-150 shadow-xs flex flex-col justify-center gap-1.5 h-[110px] text-left">
            <span className="block text-[6.5px] font-mono text-zinc-400 font-bold uppercase mb-0.5">Energy & Mood</span>
            <div className="flex items-center justify-between text-[8px] font-bold text-[#312E5B]">
              <span className="flex items-center gap-1"><Flame size={10} className="text-[#FFAA8A] animate-pulse" /> Energy</span>
              <span className="text-[#FFAA8A]">High</span>
            </div>
            <div className="flex items-center justify-between text-[8px] font-bold text-[#312E5B]">
              <span className="flex items-center gap-1"><Zap size={10} className="text-[#F6D365]" /> Focus</span>
              <span className="text-[#F6D365]">Building</span>
            </div>
            <div className="flex items-center justify-between text-[8px] font-bold text-[#312E5B]">
              <span className="flex items-center gap-1"><Heart size={10} className="text-[#F9A8D4]" /> Stress</span>
              <span className="text-[#6EE7B7]">Low</span>
            </div>
          </div>

          {/* 3. DEADLINE RADAR */}
          <div className="col-span-4 p-3 bg-white/85 rounded-2xl border border-zinc-150 shadow-xs flex flex-col items-center justify-center h-[96px] relative">
            <span className="text-[7px] font-mono text-zinc-400 font-bold uppercase tracking-wider mb-1">Deadline Radar</span>
            <div className="relative w-11 h-11 rounded-full border border-zinc-100 flex items-center justify-center bg-zinc-55/20">
              <div className="absolute w-7.5 h-7.5 rounded-full border border-dashed border-zinc-200" />
              <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_50%,rgba(139,108,255,0.06))] animate-[spin_5s_linear_infinite] rounded-full" />
              
              <div className="absolute w-full h-full animate-[spin_6s_linear_infinite]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#F9A8D4] shadow-[0_0_4px_#F9A8D4]" />
              </div>
              <div className="absolute w-[80%] h-[80%] animate-[spin_9s_linear_infinite_reverse]">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#F6D365] shadow-[0_0_4px_#F6D365]" />
              </div>
            </div>
          </div>

          {/* 7. HABIT GARDEN */}
          <div className="col-span-4 p-2.5 bg-[#E7FFF4]/75 rounded-2xl border border-[#6EE7B7]/25 shadow-xs flex flex-col justify-between h-[96px] text-center">
            <span className="text-[7px] font-mono text-zinc-400 font-bold uppercase tracking-wider">Habit Garden</span>
            <div className="flex justify-center gap-1.5 mt-0.5">
              {[0, 1, 2].map(idx => (
                <div 
                  key={idx}
                  onClick={() => handlePlantClick(idx)}
                  className="w-5.5 h-8.5 rounded-lg bg-white/60 hover:bg-white border border-[#6EE7B7]/20 flex flex-col items-center justify-center cursor-pointer active:scale-90 transition-all"
                  title="Click to grow habit tree"
                >
                  <svg width="10" height="12" viewBox="0 0 16 24" className="overflow-visible">
                    <path d="M8 20 Q 7 14 8 8" stroke="#6EE7B7" strokeWidth="1.8" fill="none" />
                    {plantsGrowth[idx] >= 2 && <circle cx="8" cy="8" r="1.5" fill="#F9A8D4" />}
                    {plantsGrowth[idx] >= 3 && <circle cx="4" cy="11" r="1" fill="#F6D365" />}
                    {plantsGrowth[idx] >= 4 && <circle cx="12" cy="11" r="1" fill="#8B6CFF" />}
                    {plantsGrowth[idx] >= 5 && <circle cx="8" cy="4" r="1.2" fill="#67E8F9" />}
                  </svg>
                  <span className="text-[5.5px] font-mono text-zinc-400 font-bold">L{plantsGrowth[idx]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. LIVE MOMENTUM CHART */}
          <div className="col-span-4 p-3 bg-white/85 rounded-2xl border border-zinc-150 shadow-xs flex flex-col justify-between h-[96px] text-left">
            <div className="flex justify-between items-center text-[7px] font-mono text-zinc-400 font-bold uppercase">
              <span>Momentum</span>
              <span className="text-[#8B6CFF]">{momentumRate}%</span>
            </div>
            
            <svg viewBox="0 0 100 22" className="w-full h-6 overflow-visible mt-1">
              <motion.path 
                d="M 0 14 Q 20 4, 40 18 T 80 6 T 100 12" 
                fill="none" 
                stroke="url(#momentum-gradient-v3)" 
                strokeWidth="2"
                strokeLinecap="round"
                animate={{
                  d: [
                    "M 0 14 Q 20 4, 40 18 T 80 6 T 100 12",
                    "M 0 6 Q 20 18, 40 6 T 80 14 T 100 8",
                    "M 0 14 Q 20 4, 40 18 T 80 6 T 100 12"
                  ]
                }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              />
              <defs>
                <linearGradient id="momentum-gradient-v3" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8B6CFF" />
                  <stop offset="50%" stopColor="#F9A8D4" />
                  <stop offset="100%" stopColor="#6EE7B7" />
                </linearGradient>
              </defs>
            </svg>
            <span className="text-[6px] font-mono text-zinc-400 font-bold block text-right">Flow speed: Active</span>
          </div>

          {/* 9. METRICS ROW */}
          <div className="col-span-12 p-3 bg-white/80 rounded-2xl border border-zinc-150 shadow-xs grid grid-cols-4 gap-2 text-center h-[52px] items-center">
            <div className="space-y-0.5 border-r border-zinc-150 last:border-r-0 text-left pl-1">
              <span className="block text-[6.5px] font-mono text-zinc-400 font-bold uppercase tracking-wider">Completed</span>
              <span className="text-[9.5px] font-black text-[#312E5B]">3 / 6 tasks</span>
            </div>
            <div className="space-y-0.5 border-r border-zinc-150 last:border-r-0 text-left pl-1">
              <span className="block text-[6.5px] font-mono text-zinc-400 font-bold uppercase tracking-wider">Protected</span>
              <span className="text-[9.5px] font-black text-[#8B6CFF]">1h 40m</span>
            </div>
            <div className="space-y-0.5 border-r border-zinc-150 last:border-r-0 text-left pl-1">
              <span className="block text-[6.5px] font-mono text-zinc-400 font-bold uppercase tracking-wider">Focus Score</span>
              <span className="text-[9.5px] font-black text-[#6EE7B7]">87%</span>
            </div>
            <div className="space-y-0.5 text-left pl-1">
              <span className="block text-[6.5px] font-mono text-zinc-400 font-bold uppercase tracking-wider">Day Progress</span>
              <span className="text-[9.5px] font-black text-[#F6D365]">64%</span>
            </div>
          </div>

          {/* 8. QUICK NUDGES MARQUEE */}
          <div className="col-span-12 h-[34px] relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div 
                key={nudgeIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="p-2 bg-[#FFF6CC]/80 border border-[#F6D365]/35 rounded-xl text-left flex items-center justify-between px-4 shadow-xs"
              >
                <span className="text-[9px] font-extrabold text-[#312E5B] flex items-center gap-1.5">
                  <Sparkles size={10} className="text-[#8B6CFF] animate-pulse" />
                  <span>{quickNudges[nudgeIdx]}</span>
                </span>
                <span className="text-[6.5px] font-mono text-[#312E5B]/50 font-bold uppercase tracking-wider">Quick Nudge</span>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </motion.div>

      {/* Floating 3D ambient items in background */}
      {[...Array(6)].map((_, i) => {
        const delays = ['0s', '1.5s', '3s', '0.5s', '2.2s', '4s'];
        const positions = [
          { top: '10%', left: '10%' },
          { top: '30%', right: '8%' },
          { bottom: '10%', left: '5%' },
          { bottom: '25%', right: '12%' },
          { top: '55%', left: '8%' },
          { top: '80%', right: '15%' }
        ];
        return (
          <div 
            key={i}
            className="absolute w-1.5 h-1.5 bg-[#F9A8D4]/40 rounded-full animate-ping pointer-events-none z-0"
            style={{
              ...positions[i],
              animationDelay: delays[i],
              animationDuration: '3.5s'
            }}
          />
        );
      })}

    </div>
  );
}
