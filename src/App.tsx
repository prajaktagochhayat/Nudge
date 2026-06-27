import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  Compass, Target, Smile, Star, MousePointer, Sparkles, Play, Clock, Sun, Moon
} from 'lucide-react';
import CustomCursor from './components/CustomCursor';
import NudgeAIAssistant from './components/NudgeAIAssistant';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';

const Hero3DWorkspace = lazy(() => import('./components/Hero3DWorkspace'));
const AppDashboard = lazy(() => import('./components/AppDashboard'));
const CalmFocusRoom = lazy(() => import('./components/CalmFocusRoom'));
const FeaturesPage = lazy(() => import('./components/FeaturesPage'));
const SmartPlanPage = lazy(() => import('./components/SmartPlanPage'));
const SignInPage = lazy(() => import('./components/SignInPage'));
const SignUpPage = lazy(() => import('./components/SignUpPage'));

import MascotLogo from './components/ui/MascotLogo';
import FloatingObject from './components/ui/FloatingObject';

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleDarkMode = () => setIsDark(prev => !prev);

  // Custom router state synchronized with HTML5 History
  const [currentPath, setCurrentPath] = useState(() => {
    return window.location.pathname;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setIsAuthenticated(true);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(!!session);
        if (session) {
          if (window.location.pathname === '/signin' || window.location.pathname === '/signup') {
            navigate('/dashboard');
          }
        } else {
          if (window.location.pathname === '/dashboard') {
            navigate('/');
          }
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    setCurrentPath(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [isScrolled, setIsScrolled] = useState(false);
  const [btnPos, setBtnPos] = useState({ x: 0, y: 0 });
  const [time, setTime] = useState(0);

  // Throttled MotionValues to eliminate React re-renders on mousemove
  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);

  const springGlowX = useSpring(glowX, { stiffness: 60, damping: 20 });
  const springGlowY = useSpring(glowY, { stiffness: 60, damping: 20 });

  // Transforms for background layers
  const bgCloudX = useTransform(springGlowX, [-0.5, 0.5], [-25, 25]);
  const bgCloudY = useTransform(springGlowY, [-0.5, 0.5], [-25, 25]);

  const bgCloudInverseX = useTransform(springGlowX, [-0.5, 0.5], [25, -25]);
  const bgCloudInverseY = useTransform(springGlowY, [-0.5, 0.5], [25, -25]);

  const bgPathX = useTransform(springGlowX, [-0.5, 0.5], [-6, 6]);
  const bgPathY = useTransform(springGlowY, [-0.5, 0.5], [-6, 6]);

  const bgPathInverseX = useTransform(springGlowX, [-0.5, 0.5], [5, -5]);
  const bgPathInverseY = useTransform(springGlowY, [-0.5, 0.5], [5, -5]);

  // Ticker loop pauses automatically when browser tab is inactive to optimize performance
  useEffect(() => {
    let animId: number;
    let isActive = true;

    const handleVisibility = () => {
      isActive = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const tick = () => {
      if (isActive) {
        setTime(t => t + 0.015);
      }
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Monitor scroll for shrink effect in navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Direct set on MotionValues bypasses React's virtual DOM diffing entirely
  useEffect(() => {
    const handleMouseMoveGlow = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      glowX.set((e.clientX / innerWidth) - 0.5);
      glowY.set((e.clientY / innerHeight) - 0.5);
    };
    window.addEventListener('mousemove', handleMouseMoveGlow, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMoveGlow);
    };
  }, [glowX, glowY]);

  const handleMouseMoveBtn = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setBtnPos({ x: x * 0.45, y: y * 0.45 });
  };

  const handleMouseLeaveBtn = () => {
    setBtnPos({ x: 0, y: 0 });
  };

  const handleNavClick = (sectionId: string) => {
    if (currentPath !== '/') {
      window.history.pushState({}, '', '/');
      setCurrentPath('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Coordinates shifted outward to avoid overlapping headings
  const floatingObjects = [
    {
      id: 'mascot-orb',
      content: (
        <svg width="28" height="28" viewBox="0 0 40 40" fill="none" className="filter drop-shadow-md">
          <path d="M12 26 C8 26 6 23 7 19 C8 15 11 13 15 14 C17 10 23 8 27 11 C31 14 33 18 31 22 C33 23 33 26 30 26 Z" fill="url(#mascot-body-grad)" />
          <circle cx="16" cy="18" r="1.5" fill="#312E5B" />
          <circle cx="23" cy="17.5" r="1.5" fill="#312E5B" />
          <path d="M 18,21 Q 19.5,22 21,21" stroke="#312E5B" strokeWidth="1" fill="none" />
        </svg>
      ),
      xOffset: 0.3, yOffset: 0.3, baseLeft: '38%', baseTop: '16%',
      animation: { y: [0, -8, 0] }, duration: 4.5
    },
    {
      id: 'planet-orb',
      content: (
        <svg width="36" height="36" viewBox="0 0 40 40" className="filter drop-shadow-md overflow-visible">
          <ellipse cx="20" cy="20" rx="16" ry="5" stroke="#A78BFA" strokeWidth="1.5" fill="none" transform="rotate(-15 20 20)" />
          <circle cx="20" cy="20" r="8" fill="url(#planet-body-grad)" />
          <defs>
            <linearGradient id="planet-body-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B6CFF" />
              <stop offset="100%" stopColor="#F9A8D4" />
            </linearGradient>
          </defs>
        </svg>
      ),
      xOffset: -0.35, yOffset: -0.3, baseLeft: '84%', baseTop: '18%',
      animation: { y: [0, -8, 0], rotate: [0, 5, -5, 0] }, duration: 5.5
    },
    {
      id: 'calendar-cube',
      content: (
        <div className="w-8 h-8 rounded-lg bg-[#FFFDF9] border border-[#F9A8D4]/25 shadow-md flex flex-col items-center justify-center font-mono leading-none">
          <span className="text-[6px] text-white bg-[#F9A8D4] w-full text-center py-0.5 rounded-t-lg font-bold">JUNE</span>
          <span className="text-[12px] font-black text-[#312E5B] py-0.5">25</span>
        </div>
      ),
      xOffset: -0.25, yOffset: -0.3, baseLeft: '6%', baseTop: '15%',
      animation: { rotate: [0, 8, -8, 0] }, duration: 6
    },
    {
      id: '3d-clock',
      content: (
        <div className="p-1.5 bg-[#EAF4FF] border border-[#67E8F9]/20 rounded-xl shadow-md flex items-center gap-1.5 text-[8.5px] font-bold text-[#312E5B]">
          <Clock size={11} className="text-[#8B6CFF] animate-spin-slow" />
          <span>10:15 AM</span>
        </div>
      ),
      xOffset: -0.2, yOffset: -0.15, baseLeft: '4%', baseTop: '74%',
      animation: { y: [0, -6, 0] }, duration: 5
    },
    {
      id: 'paper-plane',
      content: (
        <div className="p-1.5 bg-[#E7FFF4]/95 border border-[#6EE7B7]/20 rounded-xl shadow-md flex items-center gap-1.5 text-[8px] font-bold text-[#312E5B]">
          <span>✈️</span>
          <span>Design Presentation</span>
          <span className="bg-[#6EE7B7]/25 text-[#312E5B] px-1 rounded text-[7px] font-bold">25m</span>
        </div>
      ),
      xOffset: 0.35, yOffset: 0.35, baseLeft: '48%', baseTop: '34%',
      animation: { x: [0, 10, 0], y: [0, -5, 0] }, duration: 7
    },
    {
      id: 'sticky-note',
      content: (
        <div className="w-16 h-16 bg-[#FFF0F6] border border-[#F9A8D4]/35 shadow-md flex items-center justify-center p-1.5 rounded-xl rotate-[6deg]">
          <span className="text-[7.5px] font-bold text-[#312E5B] text-center leading-tight">Review slides at 11:30</span>
        </div>
      ),
      xOffset: -0.2, yOffset: 0.25, baseLeft: '28%', baseTop: '80%',
      animation: { rotate: [6, 12, 6] }, duration: 5.5
    },
    {
      id: 'goal-plant',
      content: (
        <div className="p-1.5 bg-[#E7FFF4] border border-[#6EE7B7]/20 rounded-xl shadow-md flex items-center gap-1 text-[8px] font-bold text-[#312E5B]">
          <svg width="10" height="14" viewBox="0 0 16 24" className="overflow-visible">
            <path d="M8 20 Q 7 14 8 8" stroke="#6EE7B7" strokeWidth="2" fill="none" />
            <circle cx="8" cy="8" r="2.5" fill="#F9A8D4" />
          </svg>
          <span>Bloom Level 4</span>
        </div>
      ),
      xOffset: 0.3, yOffset: -0.2, baseLeft: '78%', baseTop: '10%',
      animation: { scale: [1, 1.06, 1] }, duration: 6
    },
    {
      id: 'timer-ring',
      content: (
        <div className="p-1.5 bg-[#EAF4FF] border border-[#67E8F9]/20 rounded-xl shadow-md flex items-center gap-1.5 text-[8.5px] font-bold text-[#312E5B]">
          <div className="w-4 h-4 rounded-full border border-dashed border-[#8B6CFF] animate-spin-slow" />
          <span>25:00</span>
        </div>
      ),
      xOffset: 0.2, yOffset: 0.4, baseLeft: '85%', baseTop: '75%',
      animation: { y: [0, -5, 0] }, duration: 4.8
    },
    {
      id: 'checkmark-bubble',
      content: (
        <div className="w-6 h-6 rounded-full bg-[#E7FFF4] border border-[#6EE7B7]/20 shadow-md flex items-center justify-center text-[#6EE7B7] text-[10px] font-bold">
          ✓
        </div>
      ),
      xOffset: -0.3, yOffset: 0.2, baseLeft: '5%', baseTop: '45%',
      animation: { scale: [0.9, 1.1, 0.9] }, duration: 5.8
    },
    {
      id: 'checklist-card',
      content: (
        <div className="p-2 bg-white/90 border border-zinc-150 rounded-xl shadow-md flex flex-col gap-1 text-[7.5px] font-bold text-[#312E5B] w-20 text-left">
          <span className="text-[6px] text-zinc-400 font-mono font-black uppercase">TODO</span>
          <div className="flex items-center gap-1 border-b border-zinc-100 pb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="truncate">Design Slides</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
            <span className="truncate text-zinc-400">Client Call</span>
          </div>
        </div>
      ),
      xOffset: -0.25, yOffset: 0.2, baseLeft: '8%', baseTop: '30%',
      animation: { y: [0, -5, 0] }, duration: 4.8
    },
    {
      id: 'deadline-dot',
      content: (
        <div className="flex items-center gap-1 p-1 bg-[#FFF0F6]/90 border border-[#F9A8D4]/20 rounded-lg shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F9A8D4] animate-ping" />
          <span className="text-[6.5px] font-mono text-[#312E5B] font-bold">3h left</span>
        </div>
      ),
      xOffset: 0.4, yOffset: -0.25, baseLeft: '88%', baseTop: '44%',
      animation: { y: [0, 4, 0] }, duration: 5
    }
  ];

  const cameraScale = 1 + Math.sin(time * 0.3) * 0.012;

  const handleLaunchConsole = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="relative min-h-screen pb-12 bg-[#FFFDF9] text-[#312E5B] dark:bg-[#09090F] dark:text-zinc-100 overflow-x-hidden transition-colors duration-500">
      {/* Custom follower cursor */}
      <CustomCursor />

      {/* Skip to Main Content Link for WCAG 2.1 AA Keyboard Nav */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-white focus:text-[#8B6CFF] focus:px-4 focus:py-2 focus:rounded-xl focus:shadow-md focus:z-50 font-bold text-xs"
      >
        Skip to Main Content
      </a>

      {/* ====================================================
          ROOT-LEVEL IMMERSIVE BACKGROUND SKY (Top to Bottom)
          ==================================================== */}
      {currentPath === '/' && (
        <div className="absolute inset-0 z-0 pointer-events-none w-full min-h-screen overflow-hidden opacity-90">
          <div className="absolute inset-0 animate-liquid-sky" />
          
          {/* Drifting gradient clouds */}
          <motion.div 
            style={{ x: bgCloudX, y: bgCloudY }}
            className="absolute top-10 left-[10%] w-[380px] h-[280px] bg-gradient-to-r from-[#FFF0F6] to-[#F3EEFF] rounded-full blur-[95px] opacity-75" 
          />
          <motion.div 
            style={{ x: bgCloudInverseX, y: bgCloudInverseY }}
            className="absolute bottom-20 right-[15%] w-[420px] h-[320px] bg-gradient-to-r from-[#E7FFF4] to-[#FFF6CC] rounded-full blur-[110px] opacity-80" 
          />

          {/* Glowing SVG connection trails */}
          <svg className="absolute inset-0 w-full h-full opacity-55">
            <defs>
              <linearGradient id="ai-path-grad-1-root" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8B6CFF" />
                <stop offset="50%" stopColor="#F9A8D4" />
                <stop offset="100%" stopColor="#67E8F9" />
              </linearGradient>
              <linearGradient id="ai-path-grad-2-root" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6EE7B7" />
                <stop offset="100%" stopColor="#F6D365" />
              </linearGradient>
            </defs>
            
            <motion.path 
              d="M 150,110 Q 320,250 490,190 T 890,280"
              stroke="url(#ai-path-grad-1-root)"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              strokeDasharray="6 6"
              animate={{ strokeDashoffset: [0, -60] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: 'linear' }}
              style={{
                x: bgPathX,
                y: bgPathY
              }}
            />
            <motion.path 
              d="M 80,480 Q 380,410 680,440 T 980,260"
              stroke="url(#ai-path-grad-2-root)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              strokeDasharray="8 8"
              animate={{ strokeDashoffset: [0, 80] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
              style={{
                x: bgPathInverseX,
                y: bgPathInverseY
              }}
            />
          </svg>
        </div>
      )}

      {/* Mascot Assistant */}
      <NudgeAIAssistant 
        onPlanRequest={() => navigate('/dashboard')} 
        onFocusRequest={() => navigate('/focus-mode')} 
      />

      {/* Floating Translucent Glass Navbar */}
      {['/dashboard', '/signin', '/signup'].indexOf(currentPath) === -1 && (
        <nav className={`fixed top-4 left-6 right-6 z-50 transition-all duration-300 rounded-3xl border border-white/60 backdrop-blur-xl ${
          isScrolled 
            ? 'bg-white/70 py-2.5 shadow-lg shadow-[#8B6CFF]/5' 
            : 'bg-[#FFFDF9]/40 py-4.5'
        }`}>
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
            
            {/* Mascot Logo & Dark Mode Toggle */}
            <div className="flex items-center gap-3">
              <div onClick={() => navigate('/')} className="cursor-pointer">
                <MascotLogo />
              </div>
              <button 
                onClick={toggleDarkMode}
                className="p-1.5 rounded-full hover:bg-zinc-150/50 dark:hover:bg-zinc-800 transition-colors text-zinc-500 dark:text-zinc-400 cursor-pointer"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? (
                  <Sun size={15} className="text-[#F6D365] animate-[spin_12s_linear_infinite]" />
                ) : (
                  <Moon size={15} className="text-[#8B6CFF]" />
                )}
              </button>
            </div>
            
            {/* Center Navigation Links with active style indicators */}
            <div className="hidden md:flex items-center gap-8 text-xs font-bold text-[#4B4B5C]/75">
              <button 
                onClick={() => handleNavClick('about')} 
                className="hover:text-[#8B6CFF] transition-colors cursor-pointer"
              >
                How It Works
              </button>
              <button 
                onClick={() => navigate('/features')} 
                className={`hover:text-[#8B6CFF] transition-colors cursor-pointer ${
                  currentPath === '/features' ? 'text-[#8B6CFF] underline decoration-[#8B6CFF] decoration-2 underline-offset-4' : ''
                }`}
              >
                Features
              </button>
              <button 
                onClick={() => navigate('/smart-plan')} 
                className={`hover:text-[#8B6CFF] transition-colors cursor-pointer ${
                  currentPath === '/smart-plan' ? 'text-[#8B6CFF] underline decoration-[#8B6CFF] decoration-2 underline-offset-4' : ''
                }`}
              >
                Smart Plan
              </button>
              <button 
                onClick={() => navigate('/focus-mode')} 
                className={`hover:text-[#8B6CFF] transition-colors cursor-pointer ${
                  currentPath === '/focus-mode' ? 'text-[#8B6CFF] underline decoration-[#8B6CFF] decoration-2 underline-offset-4' : ''
                }`}
              >
                Focus Mode
              </button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-4">
              {!isAuthenticated ? (
                <button 
                  onClick={() => navigate('/signin')} 
                  className={`text-xs font-extrabold text-[#4B4B5C] hover:text-[#8B6CFF] transition-colors cursor-pointer ${
                    currentPath === '/signin' ? 'text-[#8B6CFF]' : ''
                  }`}
                >
                  Sign In
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setIsAuthenticated(false);
                    if (isSupabaseConfigured) {
                      supabase.auth.signOut().then();
                    }
                    localStorage.removeItem('nudge_user_name');
                    navigate('/');
                  }}
                  className="text-xs font-extrabold text-[#4B4B5C] hover:text-rose-500 transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              )}
              
              {['/dashboard', '/signin', '/signup'].indexOf(currentPath) === -1 ? (
                <button
                  onClick={handleLaunchConsole}
                  className="bg-gradient-to-r from-[#8B6CFF] to-[#F9A8D4] hover:opacity-95 text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-md shadow-[#8B6CFF]/15 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Launch Console</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate('/')}
                  className="border border-[#8B6CFF]/20 text-[#312E5B] text-xs font-bold px-5 py-2.5 rounded-full hover:bg-white/60 transition-all flex items-center gap-1 cursor-pointer"
                >
                  ← Back to Site
                </button>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* Main content view switcher */}
      <main id="main-content" tabIndex={-1} className={`outline-none px-6 md:px-12 max-w-7xl mx-auto relative z-10 ${
        ['/dashboard', '/signin', '/signup'].indexOf(currentPath) !== -1 ? 'pt-8' : 'pt-28'
      }`}>
        <Suspense fallback={
          <div className="w-full min-h-[400px] flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-6 h-6 rounded-full border-2 border-indigo-100 border-t-[#8B6CFF] animate-spin mx-auto" />
              <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase tracking-widest">Initialising Nudge Neural Deck...</span>
            </div>
          </div>
        }>
          <AnimatePresence mode="wait">
          
          {/* LANDING PAGE VIEW */}
          {currentPath === '/' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-24"
            >
              {/* Cinematic Full-Hero Section (Removed local background to allow root background flow) */}
              <motion.section 
                style={{ scale: cameraScale }}
                className="min-h-[85vh] flex flex-col lg:flex-row items-center justify-between gap-12 py-8 relative"
              >
                {/* Floating objects mapped behind the writings at z-10 */}
                {floatingObjects.map((obj) => (
                  <FloatingObject 
                    key={obj.id} 
                    obj={obj} 
                    springX={springGlowX} 
                    springY={springGlowY} 
                  />
                ))}

                {/* LEFT COLUMN: Cinematic Text Details - Layered at z-20 to sit on top of floaters */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-1 space-y-6 text-left relative z-20"
                >
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#8B6CFF] bg-[#8B6CFF]/10 px-3.5 py-1.5 rounded-full border border-[#8B6CFF]/20">
                    <Sparkles size={11} className="animate-spin-slow text-[#8B6CFF]" />
                    AI PRODUCTIVITY COMPANION
                  </span>
                  
                  <h1 className="text-5xl md:text-[64px] font-extrabold text-[#312E5B] leading-[1.05] tracking-tight relative overflow-hidden">
                    Your day doesn’t need <br />more reminders. <br />
                    It needs a <span className="text-gradient-blue-violet relative">
                      Nudge.
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] animate-[reflection-sweep_6s_ease-in-out_infinite]" />
                    </span>
                  </h1>
                  
                  <p className="text-base md:text-lg text-[#4B4B5C] max-w-lg leading-relaxed font-semibold">
                    Nudge understands your deadlines, energy levels, and priorities — then turns your day into a plan you can actually follow.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4 relative z-25">
                    {/* Magnetic CTA button */}
                    <motion.button
                      onClick={handleLaunchConsole}
                      onMouseMove={handleMouseMoveBtn}
                      onMouseLeave={handleMouseLeaveBtn}
                      animate={{ x: btnPos.x, y: btnPos.y }}
                      transition={{ type: 'spring', stiffness: 160, damping: 14 }}
                      className="bg-gradient-to-r from-[#8B6CFF] to-[#F9A8D4] text-white text-xs font-bold px-8 py-4 rounded-full shadow-lg shadow-[#8B6CFF]/15 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer border border-white/20"
                    >
                      <span>Plan My Day →</span>
                    </motion.button>
                    
                    <button
                      onClick={() => navigate('/focus-mode')}
                      className="glass-panel bg-white/50 px-8 py-4 rounded-full text-xs font-bold text-[#312E5B] hover:bg-white/80 transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/40"
                    >
                      <Play size={12} fill="currentColor" className="text-[#8B6CFF]" />
                      <span>Watch Nudge in Action</span>
                    </button>
                  </div>

                  {/* Trust indicator row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-6 border-t border-[#312E5B]/10 text-[10px] font-bold text-[#4B4B5C]/80">
                    <span className="flex items-center gap-1.5">
                      <Star size={11} className="text-[#F6D365]" fill="currentColor" /> AI-powered planning
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[#312E5B]/20" />
                    <span className="flex items-center gap-1.5">
                      <Star size={11} className="text-[#FFAA8A]" fill="currentColor" /> Context-aware nudges
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[#312E5B]/20" />
                    <span className="flex items-center gap-1.5">
                      <Star size={11} className="text-[#6EE7B7]" fill="currentColor" /> Built for real deadlines
                    </span>
                  </div>
                </motion.div>

                {/* RIGHT COLUMN: Tilted Glass Workspace Portal - Layered at z-20 to sit on top of floaters */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-1 w-full relative min-h-[500px] rounded-3xl overflow-visible z-20"
                >
                  <Suspense fallback={
                    <div className="w-full h-[500px] rounded-3xl bg-[#F3EEFF]/20 border border-[#8B6CFF]/15 flex items-center justify-center backdrop-blur-md">
                      <div className="text-center space-y-3">
                        <div className="w-6 h-6 rounded-full border-2 border-indigo-100 border-t-[#8B6CFF] animate-spin mx-auto" />
                        <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase tracking-wider">Calibrating 3D Workspace...</span>
                      </div>
                    </div>
                  }>
                    <Hero3DWorkspace />
                  </Suspense>
                </motion.div>

              </motion.section>

              {/* SECTION TRANSITION */}
              <div className="flex flex-col items-center justify-center gap-2 py-4">
                <span className="text-[10px] font-mono font-bold text-[#4B4B5C]/60 uppercase tracking-widest">
                  Scroll to see how Nudge plans your day
                </span>
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 1.6 }}
                  className="p-1 rounded-full border border-[#312E5B]/20 flex items-center justify-center text-[#4B4B5C]/60"
                >
                  <MousePointer size={14} className="rotate-90" />
                </motion.div>
              </div>

              {/* Informational explanations */}
              <section id="about" className="py-12 border-t border-[#312E5B]/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  
                  <div className="space-y-3 p-6 glass-panel rounded-3xl text-left bg-white/70">
                    <Compass className="text-[#8B6CFF]" size={24} />
                    <h3 className="text-base font-extrabold text-[#312E5B]">Intelligent Workspace</h3>
                    <p className="text-xs text-[#4B4B5C] leading-relaxed font-semibold">
                      Time, tasks, focus, and goals are physically mapped as objects in a cohesive 3D digital workspace environment.
                    </p>
                  </div>

                  <div className="space-y-3 p-6 glass-panel rounded-3xl text-left bg-white/70">
                    <Target className="text-[#FFAA8A]" size={24} />
                    <h3 className="text-base font-extrabold text-[#312E5B]">Priority Galaxy</h3>
                    <p className="text-xs text-[#4B4B5C] leading-relaxed font-semibold">
                      Visualize scheduling logic transparently. Tasks map to an orbital space based on estimated effort and priority score.
                    </p>
                  </div>

                  <div className="space-y-3 p-6 glass-panel rounded-3xl text-left bg-white/70">
                    <Smile className="text-[#6EE7B7]" size={24} />
                    <h3 className="text-base font-extrabold text-[#312E5B]">Playful Consistency</h3>
                    <p className="text-xs text-[#4B4B5C] leading-relaxed font-semibold">
                      Grow habit trees, track milestones through glowing checkpoints, and complete streaks with gamified visual triggers.
                    </p>
                  </div>

                </div>
              </section>

            </motion.div>
          )}

          {/* DEDICATED FEATURES VIEW */}
          {currentPath === '/features' && (
            <motion.div
              key="features"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="py-6"
            >
              <FeaturesPage 
                onBackToSite={() => navigate('/')} 
                onLaunchConsole={() => navigate('/dashboard')} 
              />
            </motion.div>
          )}

          {/* DEDICATED SMART PLAN VIEW */}
          {currentPath === '/smart-plan' && (
            <motion.div
              key="smart-plan"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="py-6"
            >
              <SmartPlanPage 
                onBackToSite={() => navigate('/')} 
              />
            </motion.div>
          )}

          {/* DEDICATED FOCUS MODE VIEW */}
          {currentPath === '/focus-mode' && (
            <motion.div
              key="focus-mode"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="py-6"
            >
              <CalmFocusRoom 
                onBackToSite={() => navigate('/')} 
                onLaunchConsole={() => navigate('/dashboard')} 
              />
            </motion.div>
          )}

          {/* APPLICATION CONSOLE VIEW */}
          {currentPath === '/dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="py-6"
            >
              {isAuthenticated ? (
                <AppDashboard 
                  onBackRequest={() => navigate('/')} 
                  onSignOut={() => {
                    setIsAuthenticated(false);
                    navigate('/');
                  }}
                />
              ) : (
                <SignInPage 
                  onSignUpClick={() => navigate('/signup')} 
                  onSuccess={() => {
                    setIsAuthenticated(true);
                    navigate('/dashboard');
                  }} 
                  onBackToSite={() => navigate('/')} 
                />
              )}
            </motion.div>
          )}

          {/* SIGN IN VIEW */}
          {currentPath === '/signin' && (
            <motion.div
              key="signin"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="py-6"
            >
              <SignInPage 
                onSignUpClick={() => navigate('/signup')} 
                onSuccess={() => {
                  setIsAuthenticated(true);
                  navigate('/dashboard');
                }} 
                onBackToSite={() => navigate('/')} 
              />
            </motion.div>
          )}

          {/* SIGN UP VIEW */}
          {currentPath === '/signup' && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="py-6"
            >
              <SignUpPage 
                onSignInClick={() => navigate('/signin')} 
                onSuccess={() => {
                  setIsAuthenticated(true);
                  navigate('/dashboard');
                }} 
                onBackToSite={() => navigate('/')} 
              />
            </motion.div>
          )}

          {/* FALLBACK ROUTE */}
          {['/', '/features', '/smart-plan', '/focus-mode', '/dashboard', '/signin', '/signup'].indexOf(currentPath) === -1 && (
            <motion.div
              key="fallback"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center space-y-4"
            >
              <h2 className="text-xl font-bold">Page Not Found</h2>
              <p className="text-xs text-zinc-550">The requested route does not exist.</p>
              <button 
                onClick={() => navigate('/')} 
                className="bg-[#8B6CFF] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-95 transition-all cursor-pointer"
              >
                Go Home
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </Suspense>
    </main>

      {/* Footer copyright */}
      <footer className="max-w-7xl mx-auto px-6 md:px-12 mt-20 pt-8 border-t border-[#312E5B]/10 text-center text-[#4B4B5C]/60 text-[11px] font-mono">
        <p>© 2026 Nudge platform. Proactive execution support. All rights reserved.</p>
      </footer>
    </div>
  );
}
