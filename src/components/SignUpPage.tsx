import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, ChevronRight, Check, Award } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

interface SignUpPageProps {
  onSignInClick: () => void;
  onSuccess: () => void;
  onBackToSite: () => void;
}

type OnboardingData = {
  purpose: string;
  focusTime: string;
  needs: string[];
};

export default function SignUpPage({ onSignInClick, onSuccess, onBackToSite }: SignUpPageProps) {
  // Wizard steps: 0 = Form, 1 = Purpose, 2 = Focus Time, 3 = Needs, 4 = Complete
  const [step, setStep] = useState(0);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Onboarding data state
  const [onboarding, setOnboarding] = useState<OnboardingData>({
    purpose: '',
    focusTime: '',
    needs: []
  });

  // Calculate password strength rating (0 to 4)
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreedTerms) {
      setError('You must agree to the Terms and Privacy Policy.');
      return;
    }

    setIsSubmitting(true);

    if (isSupabaseConfigured) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        setIsSubmitting(false);
      } else {
        localStorage.setItem('nudge_user_name', fullName);
        setIsSubmitting(false);
        setStep(1);
      }
    } else {
      localStorage.setItem('nudge_user_name', fullName);
      setTimeout(() => {
        setIsSubmitting(false);
        setStep(1);
      }, 1500);
    }
  };

  const handleComplete = async () => {
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({
          purpose: onboarding.purpose,
          focus_time: onboarding.focusTime,
          needs: onboarding.needs
        }).eq('id', user.id);
      }
    }
    onSuccess();
  };

  const handleNeedsSelect = (need: string) => {
    setOnboarding(prev => {
      const active = prev.needs.includes(need)
        ? prev.needs.filter(n => n !== need)
        : [...prev.needs, need];
      return { ...prev, needs: active };
    });
  };

  const score = getPasswordStrength();
  const strengthColors = ['bg-zinc-200', 'bg-rose-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-400'];
  const strengthLabels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="relative min-h-[85vh] w-full flex flex-col items-center justify-center p-4 overflow-hidden rounded-[40px] border border-white/60 dark:border-zinc-800 shadow-xl bg-[#FFFDF9]/60 dark:bg-[#131322]/60 glass-reflection gpu-accelerated">
      
      {/* Background drifting ribbons */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[40px] opacity-70">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#FFF0F6] via-[#FFF6CC] to-[#E7FFF4] dark:from-[#1F122C] dark:via-[#221F11] dark:to-[#0C1B1A] opacity-80" />
        <div className="absolute top-[-10%] right-[-10%] w-[120%] h-[120%] bg-gradient-to-br from-[#F9A8D4]/5 via-[#F6D365]/4 to-[#6EE7B7]/5 rounded-full blur-[100px] animate-aurora pointer-events-none" />
      </div>

      {/* Top back site actions */}
      <div className="absolute top-6 left-8 right-8 z-20 flex justify-between items-center w-full max-w-5xl px-4">
        <button 
          onClick={onBackToSite}
          className="text-xs font-black text-zinc-400 hover:text-[#8B6CFF] transition-colors cursor-pointer"
        >
          ← Back to Site
        </button>
        
        {step > 0 && step < 4 && (
          <span className="text-[10px] font-mono font-black text-[#8B6CFF]">
            Onboarding Step {step} of 3
          </span>
        )}
      </div>

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mt-8">
        
        {/* LEFT COLUMN: Welcome Message & Mascot (Visible on registration) */}
        {step === 0 && (
          <div className="hidden lg:flex lg:col-span-6 flex-col items-center justify-center text-center space-y-8 p-6">
            
            <div className="relative w-36 h-36 flex items-center justify-center">
              <div className="absolute w-full h-full rounded-full bg-gradient-to-tr from-[#6EE7B7]/15 to-[#F6D365]/20 blur-md animate-pulse" />
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="relative z-10"
              >
                <svg width="100" height="100" viewBox="0 0 40 40" fill="none" className="filter drop-shadow-lg">
                  <defs>
                    <linearGradient id="mascot-body-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8B6CFF" />
                      <stop offset="100%" stopColor="#F9A8D4" />
                    </linearGradient>
                  </defs>
                  <path d="M12 26 C8 26 6 23 7 19 C8 15 11 13 15 14 C17 10 23 8 27 11 C31 14 33 18 31 22 C33 23 33 26 30 26 Z" fill="url(#mascot-body-grad)" />
                  <g className="animate-mascot-blink">
                    <circle cx="16" cy="18" r="1.5" fill="#312E5B" />
                    <circle cx="23" cy="17.5" r="1.5" fill="#312E5B" />
                  </g>
                  <path d="M 18,21 Q 19.5,22.5 21,21" stroke="#312E5B" strokeWidth="1.2" fill="none" />
                  <path d="M 19.5,3 L 20.5,5.5 L 23,6 L 20.5,6.5 L 19.5,9 L 18.5,6.5 L 16,6 L 18.5,5.5 Z" fill="#F6D365" className="animate-sparkle" />
                </svg>
              </motion.div>
            </div>

            <div className="space-y-3.5">
              <h2 className="text-2xl font-black text-[#312E5B] tracking-tight">
                Build a day that works with you.
              </h2>
              <p className="text-xs text-[#4B4B5C]/80 leading-relaxed font-semibold max-w-sm">
                Create your Nudge account and let AI plan your day with zero pressure, matching your natural energy levels.
              </p>
            </div>

            <div className="p-4 bg-[#E7FFF4]/80 border border-[#6EE7B7]/20 rounded-2xl max-w-sm text-left shadow-xs">
              <p className="text-[10px] font-bold text-emerald-600 uppercase font-mono mb-1">Friendly Promise</p>
              <p className="text-[9.5px] text-[#4B4B5C] font-semibold leading-relaxed">
                Nudge does not use strict alarm rings. We analyze scheduling logic to give you calm focus intervals.
              </p>
            </div>
          </div>
        )}

        {/* RIGHT COLUMN / MIDDLE AREA: State switching wizard */}
        <div className={`col-span-12 ${step === 0 ? 'lg:col-span-6' : 'lg:col-span-12'} flex items-center justify-center p-2`}>
          <div className="w-full max-w-lg glass-panel p-8 rounded-[32px] bg-white/70 border border-white/60 shadow-lg space-y-6">
            
            <AnimatePresence mode="wait">
              
              {/* STEP 0: REGISTRATION FORM */}
              {step === 0 && (
                <motion.div
                  key="reg-form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-5"
                >
                  <div className="text-center space-y-1.5">
                    <span className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-widest block">Create Account</span>
                    <h3 className="text-xl font-black text-[#312E5B]">Let's Plan Smarter</h3>
                  </div>

                  {error && (
                    <div className="p-3 bg-[#FFF0F6]/85 border border-red-200 text-red-500 rounded-xl text-[10.5px] font-bold text-center">
                      ⚠️ {error}
                    </div>
                  )}

                  <form onSubmit={handleRegister} className="space-y-4 text-left">
                    {/* Full name */}
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-black text-[#312E5B] uppercase tracking-wider">Full Name</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400"><User size={13} /></span>
                        <input 
                          type="text"
                          placeholder="Prajakta P."
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          disabled={isSubmitting}
                          className="w-full bg-white/80 border border-zinc-200 rounded-2xl pl-9 pr-4 py-2 text-xs text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#8B6CFF]/20 focus:border-[#8B6CFF]"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-black text-[#312E5B] uppercase tracking-wider">Email Address</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400"><Mail size={13} /></span>
                        <input 
                          type="email"
                          placeholder="you@domain.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isSubmitting}
                          className="w-full bg-white/80 border border-zinc-200 rounded-2xl pl-9 pr-4 py-2 text-xs text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#8B6CFF]/20 focus:border-[#8B6CFF]"
                        />
                      </div>
                    </div>

                    {/* Passwords */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9.5px] font-black text-[#312E5B] uppercase tracking-wider">Password</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400"><Lock size={13} /></span>
                          <input 
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Min 6 chars"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isSubmitting}
                            className="w-full bg-white/80 border border-zinc-200 rounded-2xl pl-9 pr-4 py-2 text-xs text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#8B6CFF]/20 focus:border-[#8B6CFF]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9.5px] font-black text-[#312E5B] uppercase tracking-wider">Confirm Password</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400"><Lock size={13} /></span>
                          <input 
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Re-enter password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isSubmitting}
                            className="w-full bg-white/80 border border-zinc-200 rounded-2xl pl-9 pr-4 py-2 text-xs text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#8B6CFF]/20 focus:border-[#8B6CFF]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Password strength indicator */}
                    {password && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[8px] font-bold text-zinc-450 uppercase font-mono">
                          <span>Password Strength:</span>
                          <span className="text-[#8B6CFF]">{strengthLabels[score]}</span>
                        </div>
                        <div className="w-full h-1 bg-zinc-150 rounded-full flex overflow-hidden">
                          {[...Array(4)].map((_, i) => (
                            <div 
                              key={i} 
                              className={`flex-1 h-full mr-0.5 last:mr-0 transition-all ${
                                i < score ? strengthColors[score] : 'bg-zinc-200'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Show password and terms checkmarks */}
                    <div className="flex flex-col gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox"
                          id="show-pass"
                          checked={showPassword}
                          onChange={(e) => setShowPassword(e.target.checked)}
                          className="rounded border-zinc-250 text-[#8B6CFF] focus:ring-[#8B6CFF]"
                        />
                        <label htmlFor="show-pass" className="text-[10.5px] font-bold text-[#4B4B5C] cursor-pointer">
                          Show Password text
                        </label>
                      </div>

                      <div className="flex items-start gap-2">
                        <input 
                          type="checkbox"
                          id="agree"
                          checked={agreedTerms}
                          onChange={(e) => setAgreedTerms(e.target.checked)}
                          className="rounded border-zinc-250 mt-0.5 text-[#8B6CFF] focus:ring-[#8B6CFF]"
                        />
                        <label htmlFor="agree" className="text-[10.5px] font-semibold text-[#4B4B5C] cursor-pointer leading-tight">
                          I agree to the <a href="#terms" className="text-[#8B6CFF] font-bold hover:underline">Terms of Service</a> and <a href="#privacy" className="text-[#8B6CFF] font-bold hover:underline">Privacy Policy</a>
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-2 bg-gradient-to-r from-[#8B6CFF] to-[#F9A8D4] text-white text-xs font-bold py-3.5 rounded-2xl shadow-md flex items-center justify-center gap-1 cursor-pointer active:scale-98 transition-all"
                    >
                      {isSubmitting ? (
                        <span>Setting up credentials...</span>
                      ) : (
                        <>
                          <span>Create My Nudge Account</span>
                          <ChevronRight size={13} />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Dividers */}
                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-zinc-150"></div>
                    <span className="flex-shrink mx-3 text-[8.5px] font-mono font-bold text-zinc-400 uppercase tracking-widest">or register via</span>
                    <div className="flex-grow border-t border-zinc-150"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <button 
                      onClick={() => setStep(1)}
                      className="bg-white/60 hover:bg-white border border-zinc-200 text-[#312E5B] text-[10.5px] font-bold py-2 rounded-2xl cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span className="font-bold text-[#397BFF]">G</span>
                      <span>Google Sync</span>
                    </button>
                    <button 
                      onClick={() => setStep(1)}
                      className="bg-white/60 hover:bg-white border border-zinc-200 text-[#312E5B] text-[10.5px] font-bold py-2 rounded-2xl cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>GitHub</span>
                    </button>
                  </div>

                  <div className="text-center pt-2">
                    <span className="text-[11px] font-medium text-zinc-450">
                      Already have an account?{' '}
                      <button onClick={onSignInClick} className="font-black text-[#8B6CFF] hover:underline cursor-pointer">
                        Sign in
                      </button>
                    </span>
                  </div>
                </motion.div>
              )}

              {/* STEP 1: ONBOARDING PURPOSE */}
              {step === 1 && (
                <motion.div
                  key="onboarding-1"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="space-y-6 text-center"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-black text-[#8B6CFF] uppercase tracking-wider block">ONBOARDING PROFILE</span>
                    <h3 className="text-lg font-black text-[#312E5B]">What are you planning for?</h3>
                    <p className="text-xs text-[#4B4B5C]/80 font-medium">Select the primary focus area for your Nudge timeline.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'study', title: 'Study & Academics', icon: '🎓' },
                      { id: 'work', title: 'Professional Work', icon: '💼' },
                      { id: 'personal', title: 'Personal Goals', icon: '🌱' },
                      { id: 'everything', title: 'Everything Mixed', icon: '⚡' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setOnboarding(p => ({ ...p, purpose: opt.id }))}
                        className={`p-5 rounded-3xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 hover:scale-[1.02] ${
                          onboarding.purpose === opt.id
                            ? 'bg-[#8B6CFF]/10 border-[#8B6CFF] text-[#8B6CFF] shadow-sm'
                            : 'bg-white/60 border-zinc-200 hover:bg-white text-[#312E5B]'
                        }`}
                      >
                        <span className="text-2xl">{opt.icon}</span>
                        <span className="text-xs font-black">{opt.title}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => onboarding.purpose && setStep(2)}
                    disabled={!onboarding.purpose}
                    className="w-full bg-[#312E5B] text-white text-xs font-bold py-3 rounded-2xl flex items-center justify-center gap-1 disabled:opacity-30 cursor-pointer active:scale-98 transition-all"
                  >
                    <span>Continue Onboarding</span>
                    <ChevronRight size={13} />
                  </button>
                </motion.div>
              )}

              {/* STEP 2: FOCUS TIME CHRONOTYPE */}
              {step === 2 && (
                <motion.div
                  key="onboarding-2"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="space-y-6 text-center"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-black text-[#8B6CFF] uppercase tracking-wider block">ONBOARDING SCHEDULE</span>
                    <h3 className="text-lg font-black text-[#312E5B]">When do you focus best?</h3>
                    <p className="text-xs text-[#4B4B5C]/80 font-medium">This aligns scheduling algorithms to match your highest energy levels.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'morning', title: 'Morning', sub: '8:00 AM - 12:00 PM', icon: '☀️' },
                      { id: 'afternoon', title: 'Afternoon', sub: '12:00 PM - 4:00 PM', icon: '🌤️' },
                      { id: 'evening', title: 'Evening', sub: '4:00 PM - 8:00 PM', icon: '🌇' },
                      { id: 'night', title: 'Night Owl', sub: '8:00 PM - 12:00 AM', icon: '🌙' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setOnboarding(p => ({ ...p, focusTime: opt.id }))}
                        className={`p-4 rounded-3xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 hover:scale-[1.02] ${
                          onboarding.focusTime === opt.id
                            ? 'bg-[#8B6CFF]/10 border-[#8B6CFF] text-[#8B6CFF] shadow-sm'
                            : 'bg-white/60 border-zinc-200 hover:bg-white text-[#312E5B]'
                        }`}
                      >
                        <span className="text-2xl">{opt.icon}</span>
                        <span className="text-xs font-black">{opt.title}</span>
                        <span className="text-[8.5px] text-zinc-400 font-mono">{opt.sub}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => setStep(1)}
                      className="flex-1 bg-zinc-100 hover:bg-zinc-150 text-[#312E5B] text-xs font-bold py-3 rounded-2xl cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => onboarding.focusTime && setStep(3)}
                      disabled={!onboarding.focusTime}
                      className="flex-1 bg-[#312E5B] text-white text-xs font-bold py-3 rounded-2xl flex items-center justify-center gap-1 disabled:opacity-30 cursor-pointer active:scale-98 transition-all"
                    >
                      <span>Next Step</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: WORKSPACE NEEDS (Multi-select) */}
              {step === 3 && (
                <motion.div
                  key="onboarding-3"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="space-y-6 text-center"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-black text-[#8B6CFF] uppercase tracking-wider block">ONBOARDING PREFERENCES</span>
                    <h3 className="text-lg font-black text-[#312E5B]">What would you like help with?</h3>
                    <p className="text-xs text-[#4B4B5C]/80 font-medium">Select all helpers you want active in your console.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'deadlines', title: 'Radar Deadlines', icon: '📡' },
                      { id: 'planning', title: 'Schedule Planning', icon: '🗺️' },
                      { id: 'focus', title: 'Focus Protecting', icon: '🛡️' },
                      { id: 'habits', title: 'Habits Bloom Garden', icon: '🌸' }
                    ].map(opt => {
                      const isSelected = onboarding.needs.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleNeedsSelect(opt.id)}
                          className={`p-4 rounded-3xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 hover:scale-[1.02] relative ${
                            isSelected
                              ? 'bg-[#8B6CFF]/10 border-[#8B6CFF] text-[#8B6CFF] shadow-sm'
                              : 'bg-white/60 border-zinc-200 hover:bg-white text-[#312E5B]'
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#8B6CFF] text-white flex items-center justify-center text-[7px]">
                              <Check size={8} strokeWidth={3} />
                            </span>
                          )}
                          <span className="text-xl">{opt.icon}</span>
                          <span className="text-xs font-black">{opt.title}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => setStep(2)}
                      className="flex-1 bg-zinc-100 hover:bg-zinc-150 text-[#312E5B] text-xs font-bold py-3 rounded-2xl cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(4)}
                      className="flex-1 bg-[#312E5B] text-white text-xs font-bold py-3 rounded-2xl flex items-center justify-center gap-1 cursor-pointer active:scale-98 transition-all"
                    >
                      <span>Complete Plan</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: ONBOARDING COMPLETE */}
              {step === 4 && (
                <motion.div
                  key="onboarding-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 text-center py-4"
                >
                  <div className="w-16 h-16 rounded-full bg-[#E7FFF4] text-emerald-500 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                    <Award size={36} className="animate-bounce" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9.5px] font-mono font-black text-[#6EE7B7] bg-[#6EE7B7]/10 px-3 py-1 rounded-full border border-[#6EE7B7]/20 uppercase tracking-widest">
                      PLAN ESTABLISHED
                    </span>
                    <h3 className="text-xl font-black text-[#312E5B]">Your first smart plan is ready.</h3>
                    <p className="text-xs text-[#4B4B5C]/80 leading-relaxed font-semibold max-w-sm mx-auto">
                      "I've analyzed your chronotype parameters and queued Focus Mode slots for your morning work blocks successfully."
                    </p>
                  </div>

                  <button
                    onClick={handleComplete}
                    className="w-full bg-gradient-to-r from-[#8B6CFF] to-[#6EE7B7] text-white text-xs font-bold py-3.5 rounded-2xl shadow-lg shadow-[#8B6CFF]/15 cursor-pointer active:scale-98 transition-all"
                  >
                    Launch Console
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

      </div>
      
    </div>
  );
}
