import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ChevronRight, Sparkles } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

interface SignInPageProps {
  onSignUpClick: () => void;
  onSuccess: () => void;
  onBackToSite: () => void;
}

export default function SignInPage({ onSignUpClick, onSuccess, onBackToSite }: SignInPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all credentials.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    if (isSupabaseConfigured) {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        setError(authError.message);
        setIsSubmitting(false);
      } else {
        const defaultName = email.split('@')[0];
        const formatted = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
        localStorage.setItem('nudge_user_name', formatted);
        setIsSubmitting(false);
        onSuccess();
      }
    } else {
      // Fallback mock login response
      if (!localStorage.getItem('nudge_user_name')) {
        const defaultName = email.split('@')[0];
        const formatted = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
        localStorage.setItem('nudge_user_name', formatted);
      }
      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess();
      }, 1500);
    }
  };

  return (
    <div className="relative min-h-[85vh] w-full flex flex-col items-center justify-center p-4 overflow-hidden rounded-[40px] border border-white/60 dark:border-zinc-800 shadow-xl bg-[#FFFDF9]/60 dark:bg-[#131322]/60 glass-reflection gpu-accelerated">
      
      {/* Dynamic drifting background ribbons */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[40px] opacity-70">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#F3EEFF] via-[#FFF0F6] to-[#E7FFF4] dark:from-[#110C24] dark:via-[#1F122C] dark:to-[#0C1B1A] opacity-80" />
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-gradient-to-tr from-[#8B6CFF]/5 via-[#F9A8D4]/5 to-[#67E8F9]/6 rounded-full blur-[100px] animate-aurora pointer-events-none" />
      </div>

      {/* Top navbar controls */}
      <div className="absolute top-6 left-8 right-8 z-20 flex justify-between items-center w-full max-w-5xl px-4">
        <button 
          onClick={onBackToSite}
          className="text-xs font-black text-zinc-400 hover:text-[#8B6CFF] transition-colors cursor-pointer"
        >
          ← Back to Site
        </button>
        <span className="text-[10px] font-mono font-black text-[#8B6CFF] bg-[#8B6CFF]/10 px-3 py-1 rounded-full border border-[#8B6CFF]/20 uppercase">
          Secure Authorization Portal
        </span>
      </div>

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mt-8">
        
        {/* LEFT COLUMN: Mascot & Branding (Hidden on mobile) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col items-center justify-center text-center space-y-8 p-6">
          
          {/* Animated floating mascot orb */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Drifting glow rings */}
            <div className="absolute w-full h-full rounded-full bg-gradient-to-tr from-[#8B6CFF]/15 to-[#F9A8D4]/20 blur-md animate-pulse" />
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="relative z-10"
            >
              <svg width="100" height="100" viewBox="0 0 40 40" fill="none" className="filter drop-shadow-lg">
                <defs>
                  <linearGradient id="signin-mascot-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F9A8D4" />
                    <stop offset="45%" stopColor="#A78BFA" />
                    <stop offset="90%" stopColor="#6EE7B7" />
                    <stop offset="100%" stopColor="#F6D365" />
                  </linearGradient>
                </defs>
                <path d="M12 26 C8 26 6 23 7 19 C8 15 11 13 15 14 C17 10 23 8 27 11 C31 14 33 18 31 22 C33 23 33 26 30 26 Z" fill="url(#signin-mascot-grad)" />
                <g className="animate-mascot-blink">
                  <circle cx="16" cy="18" r="1.5" fill="#312E5B" />
                  <circle cx="23" cy="17.5" r="1.5" fill="#312E5B" />
                </g>
                <path d="M 18,21 Q 19.5,22.5 21,21" stroke="#312E5B" strokeWidth="1.2" fill="none" />
                <motion.path 
                  d="M 19.5,3 L 20.5,5.5 L 23,6 L 20.5,6.5 L 19.5,9 L 18.5,6.5 L 16,6 L 18.5,5.5 Z" 
                  fill="#F6D365"
                  className="animate-sparkle"
                  style={{ originX: '19.5px', originY: '6px' }}
                />
              </svg>
            </motion.div>

            {/* Drifting task indicators around mascot */}
            <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-[#E7FFF4] flex items-center justify-center text-[8px] border border-[#6EE7B7]/30 shadow-sm animate-bounce">✓</div>
            <div className="absolute bottom-4 right-2 w-5 h-5 rounded-lg bg-[#FFF6CC] flex items-center justify-center text-[10px] border border-[#F6D365]/35 shadow-sm rotate-[12deg] animate-pulse">⏰</div>
          </div>

          <div className="space-y-3.5">
            <h2 className="text-2xl font-black text-[#312E5B] tracking-tight">
              Welcome back to your calmer, smarter day.
            </h2>
            <p className="text-xs text-[#4B4B5C]/80 leading-relaxed font-semibold max-w-sm">
              Sign in to resume tracking habits, organizing priority blocks, and protecting focus sessions.
            </p>
          </div>

          {/* Inspirational Quote Card */}
          <div className="p-4 bg-[#F3EEFF]/85 border border-[#8B6CFF]/15 rounded-2xl max-w-sm text-left shadow-xs relative">
            <span className="absolute top-[-8px] left-4 bg-[#8B6CFF] text-white text-[7px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider">Focus Insight</span>
            <p className="text-[10px] italic text-[#312E5B] leading-relaxed font-semibold">
              "One thoughtful nudge can change your whole day."
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Sign-in Glass Form Card */}
        <div className="col-span-12 lg:col-span-6 flex items-center justify-center p-2">
          
          <div className="w-full max-w-md glass-panel p-8 rounded-[32px] bg-white/70 border border-white/60 shadow-lg space-y-6">
            
            {/* Header and Brand */}
            <div className="text-center space-y-2">
              <span className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-widest block">Nudge AI platform</span>
              <h3 className="text-2xl font-black text-[#312E5B] tracking-tight">Welcome Back</h3>
              <p className="text-xs text-[#4B4B5C] font-semibold">Sign in to continue your momentum.</p>
            </div>

            {/* Error messaging */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-[#FFF0F6]/85 border border-red-200 text-red-500 rounded-xl text-[10.5px] font-bold text-center"
                >
                  ⚠️ {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#312E5B] uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                    <Mail size={13} />
                  </span>
                  <input 
                    type="email"
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-white/80 border border-zinc-200 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#8B6CFF]/20 focus:border-[#8B6CFF] transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-[#312E5B] uppercase tracking-wider">Password</label>
                  <a href="#forgot" className="text-[9.5px] font-bold text-[#8B6CFF] hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                    <Lock size={13} />
                  </span>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-white/80 border border-zinc-200 rounded-2xl pl-9 pr-10 py-2.5 text-xs text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#8B6CFF]/20 focus:border-[#8B6CFF] transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-650"
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              {/* Remember me checkbox */}
              <div className="flex items-center gap-2 pt-1.5">
                <input 
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isSubmitting}
                  className="rounded border-zinc-250 text-[#8B6CFF] focus:ring-[#8B6CFF]"
                />
                <label htmlFor="remember" className="text-[10.5px] font-bold text-[#4B4B5C] cursor-pointer">
                  Remember my session details
                </label>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-gradient-to-r from-[#8B6CFF] to-[#F9A8D4] text-white text-xs font-bold py-3.5 rounded-2xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    {/* Tiny spinning cloud mascot */}
                    <div className="w-4 h-4 rounded-full border-2 border-dashed border-white animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ChevronRight size={13} />
                  </>
                )}
              </button>

            </form>

            {/* Divider */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-zinc-150"></div>
              <span className="flex-shrink mx-3 text-[8.5px] font-mono font-bold text-zinc-400 uppercase tracking-widest">or sync with</span>
              <div className="flex-grow border-t border-zinc-150"></div>
            </div>

            {/* Third-party Sync buttons */}
            <div className="grid grid-cols-2 gap-3.5">
              <button 
                type="button" 
                onClick={onSuccess}
                className="bg-white/60 hover:bg-white border border-zinc-200 text-[#312E5B] text-[10.5px] font-bold py-2.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="text-[11px] font-bold text-[#397BFF]">G</span>
                <span>Google</span>
              </button>
              <button 
                type="button" 
                onClick={onSuccess}
                className="bg-white/60 hover:bg-white border border-zinc-200 text-[#312E5B] text-[10.5px] font-bold py-2.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles size={11} className="text-zinc-650" />
                <span>GitHub</span>
              </button>
            </div>

            {/* Redirect to sign up */}
            <div className="text-center pt-2">
              <span className="text-[11px] font-medium text-zinc-450">
                New to Nudge?{' '}
                <button 
                  onClick={onSignUpClick}
                  className="font-black text-[#8B6CFF] hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
