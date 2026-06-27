import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalIcon, Flame, Map, Sparkles, AlertCircle, Play,
  LogOut, Heart, Zap, Plus, Mic, MessageSquare, Send, Layout, BarChart, Settings, Activity
} from 'lucide-react';
import PriorityGalaxy from './PriorityGalaxy';
import SmartCalendar from './SmartCalendar';
import ZenFocusSpace from './ZenFocusSpace';
import GoalsHabitsTracker from './GoalsHabitsTracker';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { calculatePriority, calculateDeadlineRisk } from '../utils/priorityEngine';
import type { Task } from '../utils/priorityEngine';
import { getActionableNudges } from '../services/aiService';
import AddTaskModal from '../features/dashboard/components/AddTaskModal';

interface AppDashboardProps {
  onBackRequest: () => void;
  onSignOut: () => void;
}

export default function AppDashboard({ onBackRequest, onSignOut }: AppDashboardProps) {
  // Upgraded sidebar tabs
  const [activeTab, setActiveTab] = useState<'today' | 'plan' | 'galaxy' | 'calendar' | 'focus' | 'habits' | 'insights' | 'settings'>('today');
  
  // Dashboard tasks state
  const [tasks, setTasks] = useState<Task[]>([]);

  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // Chat panel state
  const [chatMessages, setChatMessages] = useState([
    { text: "Hey! Ready to block some focus windows today?", isAI: true }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Habit bloom count
  const [gardenBloom, setGardenBloom] = useState(4);
  const [habitId, setHabitId] = useState<number | null>(null);

  // Profile data
  const [profileName, setProfileName] = useState(() => {
    return localStorage.getItem('nudge_user_name') || 'Prajakta P.';
  });

  const [isListening, setIsListening] = useState(false);

  // Fetch from Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isSupabaseConfigured) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Fetch Profile Name
        const { data: profile } = await supabase.from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();
        if (profile?.full_name) {
          setProfileName(profile.full_name);
          localStorage.setItem('nudge_user_name', profile.full_name);
        } else {
          const metaName = user.user_metadata?.full_name || user.email?.split('@')[0] || '';
          if (metaName) {
            const formatted = metaName.charAt(0).toUpperCase() + metaName.slice(1);
            setProfileName(formatted);
            localStorage.setItem('nudge_user_name', formatted);
            await supabase.from('profiles').update({ full_name: formatted }).eq('id', user.id);
          }
        }

        // 2. Fetch Tasks
        const { data: dbTasks, error: tasksError } = await supabase.from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });
        
        if (dbTasks && !tasksError) {
          setTasks(dbTasks.map((t: any) => ({
            id: t.id,
            text: t.text,
            category: t.category,
            urgency: t.urgency,
            effort: t.effort,
            energy: t.energy,
            status: t.status || 'pending',
            due_date: t.due_date
          })));
        }

        // 3. Fetch Habits
        const { data: dbHabits, error: habitsError } = await supabase.from('habits')
          .select('*')
          .eq('user_id', user.id);
        
        if (dbHabits && !habitsError) {
          if (dbHabits.length > 0) {
            setGardenBloom(dbHabits[0].growth_level);
            setHabitId(dbHabits[0].id);
          } else {
            // Auto create default habit garden row
            const { data: newHabit, error: insertError } = await supabase.from('habits')
              .insert({
                name: 'My Habit Garden',
                growth_level: 4,
                user_id: user.id
              })
              .select()
              .single();
            if (newHabit && !insertError) {
              setGardenBloom(newHabit.growth_level);
              setHabitId(newHabit.id);
            }
          }
        }
      } catch (err) {
        console.error('Error loading Supabase data:', err);
      }
    };

    fetchUserData();
  }, []);

  // Central task addition
  const handleAddTask = async (
    text: string,
    category: string = 'Inbox',
    urgency: 'high' | 'medium' | 'low' = 'medium',
    effort: string = '15m',
    energy: string = 'Routine focus',
    due_date?: string
  ) => {
    const tempId = Date.now();
    const newTaskItem: Task = {
      id: tempId,
      text,
      category,
      urgency,
      effort,
      energy,
      status: 'pending',
      due_date
    };

    setTasks(prev => [...prev, newTaskItem]);

    if (isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: insertedTask, error } = await supabase.from('tasks')
            .insert({
              user_id: user.id,
              text,
              category,
              urgency,
              effort,
              energy,
              status: 'pending',
              due_date
            })
            .select()
            .single();

          if (insertedTask && !error) {
            setTasks(prev => prev.map(t => t.id === tempId ? {
              id: insertedTask.id,
              text: insertedTask.text,
              category: insertedTask.category,
              urgency: insertedTask.urgency as any,
              effort: insertedTask.effort,
              energy: insertedTask.energy,
              status: insertedTask.status || 'pending',
              due_date: insertedTask.due_date
            } : t));
          }
        }
      } catch (err) {
        console.error('Failed to sync added task to database:', err);
      }
    }
  };

  // Central delete task handler
  const handleDeleteTask = async (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('tasks').delete().eq('id', id);
      } catch (err) {
        console.error('Failed to delete task from database:', err);
      }
    }
  };

  const handleToggleStatus = async (id: number) => {
    const target = tasks.find(t => t.id === id);
    if (!target) return;
    const nextStatus = target.status === 'completed' ? 'pending' : 'completed';
    
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: nextStatus } : t));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('tasks').update({ status: nextStatus }).eq('id', id);
      } catch (err) {
        console.error('Failed to sync status toggle to database:', err);
      }
    }
  };

  // Central habit garden increment
  const handleHabitGardenClick = async () => {
    const nextLevel = gardenBloom < 6 ? gardenBloom + 1 : 1;
    setGardenBloom(nextLevel);

    if (isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          if (habitId) {
            await supabase.from('habits')
              .update({ growth_level: nextLevel })
              .eq('id', habitId);
          } else {
            const { data: existingHabits } = await supabase.from('habits')
              .select('id')
              .eq('user_id', user.id);

            if (existingHabits && existingHabits.length > 0) {
              const hId = existingHabits[0].id;
              setHabitId(hId);
              await supabase.from('habits')
                .update({ growth_level: nextLevel })
                .eq('id', hId);
            } else {
              const { data: newHabit } = await supabase.from('habits')
                .insert({
                  name: 'My Habit Garden',
                  growth_level: nextLevel,
                  user_id: user.id
                })
                .select()
                .single();
              if (newHabit) {
                setHabitId(newHabit.id);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to sync habit click in database:', err);
      }
    }
  };

  // Central log out handler
  const handleSignOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('nudge_user_name');
    onSignOut();
  };

  // Focus Timer Countdown state
  const [timerSecs, setTimerSecs] = useState(1500);
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSecs(s => (s > 0 ? s - 1 : 1500));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleVoiceCommand = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser. Please try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      let taskText = speechToText;
      if (speechToText.toLowerCase().startsWith('add task')) {
        taskText = speechToText.slice(8).trim();
      } else if (speechToText.toLowerCase().startsWith('add')) {
        taskText = speechToText.slice(3).trim();
      }

      if (taskText) {
        handleAddTask(
          taskText.charAt(0).toUpperCase() + taskText.slice(1),
          'Voice',
          'medium',
          '15m',
          'Routine focus',
          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        );
        alert(`Successfully added task: "${taskText}" via Voice Command!`);
      }
    };

    recognition.start();
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { text: chatInput, isAI: false }]);
    const query = chatInput;
    setChatInput('');
    setTimeout(() => {
      let reply = "Got it! Let me adjust your Priority Galaxy timeline to make room.";
      if (query.toLowerCase().includes('task') || query.toLowerCase().includes('add')) {
        reply = "Added that task! Check your Today Flow map.";
        
        let taskText = "Quick added from Chat";
        if (query.toLowerCase().startsWith('add task ')) {
          taskText = query.substring(9).trim();
        } else if (query.toLowerCase().startsWith('add ')) {
          taskText = query.substring(4).trim();
        }
        
        handleAddTask(taskText, "Inbox", "medium", "20m", "Low energy");
      }
      setChatMessages(prev => [...prev, { text: reply, isAI: true }]);
    }, 1000);
  };
  // 1. Calculate Priority Scores for all tasks
  const tasksWithPriority = tasks.map(t => {
    const priority = calculatePriority(t);
    return {
      ...t,
      priority
    };
  }).sort((a, b) => b.priority.score - a.priority.score);

  // 2. Identify Deadline Risks
  const deadlineRiskAlerts = tasksWithPriority.filter(t => {
    if (!t.due_date || t.status === 'completed') return false;
    const now = new Date();
    const due = new Date(t.due_date);
    const diffHours = Math.max(0.5, (due.getTime() - now.getTime()) / (1000 * 60 * 60));
    // Assume 25% of the time remaining is available free time
    const availableFreeHours = Math.round(diffHours * 0.25 * 10) / 10;
    const risk = calculateDeadlineRisk(t, availableFreeHours);
    return risk.isRisk;
  });

  // 3. Next Best Action (the pending task with highest score)
  const nextBestAction = tasksWithPriority.find(t => t.status !== 'completed');

  // 4. Actionable Nudges
  const currentNudges = getActionableNudges(tasks);

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 text-left bg-[#FFFDF9] dark:bg-[#131322] dark:border dark:border-[#8B6CFF]/15 p-4 rounded-3xl transition-colors duration-500">
      
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <div className="lg:col-span-3 glass-panel p-6 rounded-3xl flex flex-col justify-between bg-[#F3EEFF]/40 border border-[#8B6CFF]/15 min-h-[600px] shadow-sm">
        <div className="space-y-6">
          
          {/* Brand Header */}
          <div onClick={onBackRequest} className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#8B6CFF] to-[#F9A8D4] flex items-center justify-center text-white font-black text-sm shadow-md">
              N
            </div>
            <div>
              <h2 className="text-sm font-black text-[#312E5B] tracking-tight">Nudge AI Console</h2>
              <span className="text-[8px] font-mono text-zinc-400 font-extrabold uppercase tracking-wider">Workspace Live</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-1.5 pt-2">
            {[
              { id: 'today', label: 'Today Dashboard', icon: <Layout size={15} /> },
              { id: 'plan', label: 'Smart Plan Flow', icon: <Map size={15} /> },
              { id: 'galaxy', label: 'Priority Galaxy', icon: <Activity size={15} /> },
              { id: 'calendar', label: 'Dynamic Calendar', icon: <CalIcon size={15} /> },
              { id: 'focus', label: 'Zen Focus Room', icon: <Play size={15} /> },
              { id: 'habits', label: 'Goals & Habits', icon: <Flame size={15} /> },
              { id: 'insights', label: 'Insights Heatmap', icon: <BarChart size={15} /> },
              { id: 'settings', label: 'Portal Settings', icon: <Settings size={15} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#8B6CFF]/10 text-[#8B6CFF] border border-[#8B6CFF]/20 shadow-sm shadow-[#8B6CFF]/5'
                    : 'text-[#4B4B5C] hover:bg-[#F3EEFF]/40'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* User Info & Log Out */}
        <div className="space-y-3 pt-6 border-t border-zinc-200/50">
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-full bg-[#F9A8D4]/20 border border-[#F9A8D4]/30 flex items-center justify-center text-[#8B6CFF] font-black text-xs">
              {profileName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="text-xs font-black text-[#312E5B]">{profileName}</h4>
            </div>
          </div>
          
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-zinc-400 hover:text-[#FFAA8A] transition-colors cursor-pointer"
          >
            <LogOut size={13} />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN MODULAR CONTENT DISPLAY */}
      <div className="lg:col-span-9 space-y-6">
        <AnimatePresence mode="wait">
          
          {/* TAB: TODAY MODULAR DASHBOARD */}
          {activeTab === 'today' && (
            <motion.div
              key="today"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6"
            >
              {/* Welcome Header */}
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-[#312E5B] tracking-tight">Good morning, {profileName.split(' ')[0]}.</h2>
                  <p className="text-xs text-[#4B4B5C]">Here is your AI-orchestrated focus map and momentum planner.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowAddTaskModal(true)}
                    className="bg-[#8B6CFF] text-white text-[10px] font-bold px-3 py-2 rounded-xl hover:opacity-95 transition-all shadow-md shadow-[#8B6CFF]/15 active:scale-95 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Add Task</span>
                  </button>
                  <button 
                    onClick={handleVoiceCommand}
                    className={`border text-[10px] font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                      isListening 
                        ? 'bg-rose-500 text-white border-rose-500 animate-pulse'
                        : 'border-zinc-200 text-[#312E5B] hover:bg-zinc-50'
                    }`}
                  >
                    <Mic size={12} className={isListening ? 'text-white' : 'text-[#FFAA8A]'} />
                    <span>{isListening ? 'Listening...' : 'Voice Cmd'}</span>
                  </button>
                </div>
              </div>

              {/* Deadline Risk Alerts */}
              {deadlineRiskAlerts.length > 0 && (
                <div className="p-5 bg-rose-50/70 border border-rose-100 rounded-3xl space-y-3">
                  <div className="flex items-center gap-2 text-rose-600">
                    <AlertCircle size={15} className="animate-pulse" />
                    <h3 className="text-xs font-black uppercase tracking-wider">Deadline Risk Detected</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {deadlineRiskAlerts.map(t => {
                      const due = new Date(t.due_date!);
                      const remainingHours = Math.max(0.1, (due.getTime() - new Date().getTime()) / (1000 * 60 * 60));
                      const remainingDays = Math.ceil(remainingHours / 24);
                      return (
                        <div key={t.id} className="p-4 bg-white rounded-2xl border border-rose-100 flex flex-col justify-between shadow-xs">
                          <div>
                            <h4 className="text-xs font-bold text-zinc-800">{t.text}</h4>
                            <p className="text-[10px] text-zinc-500 mt-1">
                              Due in {remainingDays} day{remainingDays > 1 ? 's' : ''} • Estimated work: <span className="font-bold text-rose-600">{t.effort}</span>
                            </p>
                            <p className="text-[9px] text-rose-500 font-mono mt-1">
                              ⚠️ Work effort exceeds calculated available time slot windows.
                            </p>
                          </div>
                          <div className="flex gap-2 mt-3 pt-2.5 border-t border-zinc-100">
                            <button 
                              onClick={() => {
                                handleAddTask(t.text + ' (Prep Step)', t.category, 'high', '30m', 'High focus', new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString());
                              }}
                              className="text-[8.5px] bg-[#8B6CFF] text-white font-bold px-3 py-1 rounded-lg hover:opacity-95 transition-all cursor-pointer"
                            >
                              Break into subtasks
                            </button>
                            <button 
                              onClick={() => setActiveTab('focus')}
                              className="text-[8.5px] border border-[#8B6CFF]/20 text-[#8B6CFF] font-bold px-3 py-1 rounded-lg hover:bg-zinc-50 transition-all cursor-pointer"
                            >
                              Start Focus Block
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MODULAR GRID LAYOUT */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. AI RECOMMENDATIONS PANEL */}
                <div className="md:col-span-2 p-5 rounded-3xl bg-[#EAF4FF]/80 border border-[#67E8F9]/20 shadow-sm text-left flex flex-col justify-between min-h-[140px]">
                  <div>
                    <div className="flex items-center gap-1.5 text-[#8B6CFF]">
                      <Sparkles className="animate-pulse" size={14} />
                      <span className="text-[10px] font-black uppercase tracking-wider">Next Best Action Suggestion</span>
                    </div>
                    {nextBestAction ? (
                      <div className="space-y-1.5 mt-2.5">
                        <p className="text-xs font-semibold text-[#312E5B] leading-relaxed">
                          "Based on deadline proximity and effort score, I recommend starting <span className="text-indigo-600 font-bold">"{nextBestAction.text}"</span> now. It has a priority score of <span className="font-bold text-[#8B6CFF]">{nextBestAction.priority?.score}/100</span>."
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {nextBestAction.priority?.explanation.map((e, idx) => (
                            <span key={idx} className="text-[8px] bg-indigo-50/50 text-indigo-500 font-mono px-2 py-0.5 rounded-full border border-indigo-100">{e}</span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs font-semibold text-[#312E5B] mt-2.5 leading-relaxed">
                        "Fantastic work! All pending items are complete. Start a Zen Focus block to establish your tomorrow goals early."
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    {nextBestAction && (
                      <button onClick={() => setActiveTab('focus')} className="bg-[#8B6CFF] text-white text-[10px] font-bold px-4 py-2 rounded-xl hover:bg-opacity-95 transition-all cursor-pointer">
                        Start Focus Room
                      </button>
                    )}
                    <button className="bg-white/60 border border-[#8B6CFF]/10 text-[#8B6CFF] text-[10px] font-bold px-4 py-2 rounded-xl hover:bg-white transition-all">
                      Dismiss recommendation
                    </button>
                  </div>
                </div>

                {/* 2. FOCUS TIMER WIDGET */}
                <div className="p-5 rounded-3xl bg-[#FFFDF9] border border-zinc-150 shadow-sm text-left flex flex-col items-center justify-center min-h-[140px]">
                  <div className="relative w-18 h-18 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-zinc-100" strokeWidth="2.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <motion.path 
                        className="text-[#8B6CFF]" 
                        strokeWidth="2.5" 
                        strokeDasharray={`${(timerSecs / 1500) * 100}, 100`} 
                        strokeLinecap="round" 
                        stroke="currentColor" 
                        fill="none" 
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                      />
                    </svg>
                    <span className="absolute text-[11px] font-mono font-black text-[#312E5B]">{formatTime(timerSecs)}</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-[#8B6CFF] uppercase tracking-wider mt-2.5">Active Focus block</span>
                </div>

                {/* 3. TODAY'S MOMENTUM TIMELINE */}
                <div className="p-5 rounded-3xl bg-[#E7FFF4]/80 border border-[#6EE7B7]/25 shadow-sm text-left md:col-span-2 space-y-4">
                  <h3 className="text-xs font-black text-[#312E5B] uppercase tracking-wider flex items-center justify-between">
                    <span>Today's Momentum Timeline</span>
                    <span className="text-[9px] text-[#6EE7B7] lowercase font-bold">11:00 AM Active Marker</span>
                  </h3>
                  
                  <div className="relative pl-5 space-y-4 before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-200">
                    
                    {/* AM slot */}
                    <div className="relative space-y-2">
                      <span className="absolute left-[-21px] top-0.5 w-4.5 h-4.5 rounded-full bg-white border-2 border-[#8B6CFF] flex items-center justify-center text-[7px] font-black text-[#8B6CFF]">AM</span>
                      <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-2">Morning Session</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {tasksWithPriority.slice(0, 2).map(t => (
                          <div key={t.id} className="p-3 bg-white/90 border border-zinc-150 rounded-2xl flex items-center justify-between shadow-xs">
                            <div className="flex-1 min-w-0 mr-2">
                              <span className="block text-[10px] font-bold text-[#312E5B] truncate">{t.text}</span>
                              <span className="text-[8px] font-mono text-zinc-400 uppercase">{t.category} • {t.effort}</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className={`text-[7.5px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                                t.priority.level === 'Critical'
                                  ? 'bg-rose-50 border-rose-200 text-rose-500 font-extrabold'
                                  : t.priority.level === 'High'
                                    ? 'bg-orange-50 border-orange-200 text-orange-500'
                                    : t.priority.level === 'Important'
                                      ? 'bg-amber-50 border-amber-200 text-amber-500'
                                      : 'bg-zinc-50 border-zinc-200 text-zinc-500'
                              }`}>
                                {t.priority.level}
                              </span>
                              <button 
                                onClick={() => handleDeleteTask(t.id)}
                                className="text-[9px] text-zinc-400 hover:text-red-500 font-bold px-1.5 py-0.5 rounded cursor-pointer"
                                title="Delete task"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* PM slot */}
                    <div className="relative space-y-2">
                      <span className="absolute left-[-21px] top-0.5 w-4.5 h-4.5 rounded-full bg-white border-2 border-[#FFAA8A] flex items-center justify-center text-[7px] font-black text-[#FFAA8A]">PM</span>
                      <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-2">Afternoon Session</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {tasksWithPriority.slice(2, 4).map(t => (
                          <div key={t.id} className="p-3 bg-white/90 border border-zinc-150 rounded-2xl flex items-center justify-between shadow-xs">
                            <div className="flex-1 min-w-0 mr-2">
                              <span className="block text-[10px] font-bold text-[#312E5B] truncate">{t.text}</span>
                              <span className="text-[8px] font-mono text-zinc-400 uppercase">{t.category} • {t.effort}</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className={`text-[7.5px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                                t.priority.level === 'Critical'
                                  ? 'bg-rose-50 border-rose-200 text-rose-500 font-extrabold'
                                  : t.priority.level === 'High'
                                    ? 'bg-orange-50 border-orange-200 text-orange-500'
                                    : t.priority.level === 'Important'
                                      ? 'bg-amber-50 border-amber-200 text-amber-500'
                                      : 'bg-zinc-50 border-zinc-200 text-zinc-500'
                              }`}>
                                {t.priority.level}
                              </span>
                              <button 
                                onClick={() => handleDeleteTask(t.id)}
                                className="text-[9px] text-zinc-400 hover:text-red-500 font-bold px-1.5 py-0.5 rounded cursor-pointer"
                                title="Delete task"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* 4. DEADLINE RADAR WIDGET */}
                <div className="p-5 rounded-3xl bg-[#FFF0F6]/85 border border-[#F9A8D4]/25 shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] font-mono font-bold text-[#4B4B5C] uppercase tracking-widest mb-3">Deadline Radar</span>
                  <div className="relative w-18 h-18 rounded-full border border-[#312E5B]/10 flex items-center justify-center bg-white/35">
                    <div className="absolute w-12 h-12 rounded-full border border-dashed border-[#312E5B]/10" />
                    <div className="absolute w-6 h-6 rounded-full border border-[#312E5B]/10" />
                    
                    {/* Orbiting dots */}
                    <div className="absolute w-full h-full animate-[spin_6s_linear_infinite]">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#F9A8D4] shadow-[0_0_5px_#F9A8D4]" />
                    </div>
                    <div className="absolute w-[80%] h-[80%] animate-[spin_9s_linear_infinite_reverse]">
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#F6D365] shadow-[0_0_5px_#F6D365]" />
                    </div>
                    <div className="absolute w-[60%] h-[60%] animate-[spin_13s_linear_infinite]">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#6EE7B7] shadow-[0_0_5px_#6EE7B7]" />
                    </div>
                  </div>
                  <span className="text-[8px] font-bold text-zinc-400 mt-3 uppercase tracking-wider">4 tasks orbiting</span>
                </div>

                {/* 5. MOOD + ENERGY TRACKER */}
                <div className="p-5 rounded-3xl bg-[#FFF6CC]/70 border border-[#F6D365]/20 shadow-sm text-left space-y-3">
                  <h3 className="text-xs font-black text-[#312E5B] uppercase tracking-wider">Mood & Energy Indices</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-[#312E5B]">
                      <span className="flex items-center gap-1.5"><Flame size={12} className="text-[#FFAA8A]" /> Energy</span>
                      <span className="text-[#8B6CFF]">High (82%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/60 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#FFAA8A] to-[#8B6CFF] rounded-full" style={{ width: '82%' }} />
                    </div>

                    <div className="flex justify-between text-[10px] font-bold text-[#312E5B] pt-1">
                      <span className="flex items-center gap-1.5"><Zap size={12} className="text-[#F6D365]" /> Focus Level</span>
                      <span className="text-[#8B6CFF]">Building (75%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/60 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#F6D365] to-[#8B6CFF] rounded-full" style={{ width: '75%' }} />
                    </div>

                    <div className="flex justify-between text-[10px] font-bold text-[#312E5B] pt-1">
                      <span className="flex items-center gap-1.5"><Heart size={12} className="text-[#F9A8D4]" /> Stress</span>
                      <span className="text-[#6EE7B7]">Low (20%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/60 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#6EE7B7] to-[#F9A8D4] rounded-full" style={{ width: '20%' }} />
                    </div>
                  </div>
                </div>

                {/* 6. HABIT BLOOM GARDEN */}
                <div 
                  onClick={handleHabitGardenClick}
                  className="p-5 rounded-3xl bg-[#E7FFF4]/75 border border-[#6EE7B7]/20 shadow-sm flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#E7FFF4] transition-colors"
                >
                  <span className="text-[9px] font-mono font-bold text-[#4B4B5C] uppercase tracking-widest mb-2">Habit Bloom Garden</span>
                  <svg width="36" height="36" viewBox="0 0 32 32">
                    <path d="M16 28 Q 14 18 16 10" stroke="#6EE7B7" strokeWidth="2.5" fill="none" />
                    {gardenBloom >= 1 && <path d="M 15 21 Q 8 19 10 17" stroke="#6EE7B7" strokeWidth="2" fill="none" />}
                    {gardenBloom >= 2 && <path d="M 17 16 Q 24 15 22 13" stroke="#6EE7B7" strokeWidth="2" fill="none" />}
                    
                    {/* Flower Head */}
                    <circle cx="16" cy="10" r="3.5" fill="#F6D365" />
                    {gardenBloom >= 3 && <circle cx="11" cy="10" r="3.2" fill="#F9A8D4" className="animate-pulse" />}
                    {gardenBloom >= 4 && <circle cx="21" cy="10" r="3.2" fill="#F9A8D4" className="animate-pulse" />}
                    {gardenBloom >= 5 && <circle cx="16" cy="5" r="3.2" fill="#8B6CFF" />}
                    {gardenBloom >= 6 && <circle cx="16" cy="15" r="3.2" fill="#67E8F9" />}
                  </svg>
                  <span className="text-[8px] font-extrabold text-[#4B4B5C] mt-2.5 uppercase tracking-wider">Level {gardenBloom} Growth</span>
                </div>

                {/* 7. CALENDAR MINI VIEW */}
                <div className="p-5 rounded-3xl bg-[#FFFDF9] border border-zinc-150 shadow-sm text-left">
                  <div className="flex items-center justify-between text-[7px] font-mono text-zinc-400 font-bold mb-2">
                    <span>June 2026</span>
                    <CalIcon size={9} />
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center font-mono text-[7px] border-b border-zinc-100 pb-2 mb-2">
                    {['M','T','W','T','F','S','S'].map((d, i) => <span key={i} className="text-zinc-400 font-bold">{d}</span>)}
                    {[...Array(14)].map((_, i) => {
                      const d = i + 20;
                      const isDeadline = d === 26;
                      return (
                        <span key={i} className={`rounded py-0.5 font-bold ${isDeadline ? 'bg-[#FFAA8A]/20 text-[#FFAA8A] border border-[#FFAA8A]/35' : 'text-zinc-650'}`}>{d}</span>
                      );
                    })}
                  </div>
                  <span className="text-[8px] font-extrabold text-[#FFAA8A] block text-center">⚠️ 1 Upcoming Deadline</span>
                </div>

                {/* 8. AI NUDGE CENTER */}
                <div className="p-5 rounded-3xl bg-[#F3EEFF]/85 border border-[#8B6CFF]/20 shadow-sm text-left space-y-3">
                  <h3 className="text-xs font-black text-[#312E5B] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={13} className="text-[#8B6CFF] animate-pulse" />
                    <span>Nudge Center</span>
                  </h3>
                  <div className="space-y-2.5 max-h-[140px] overflow-y-auto pr-1">
                    {currentNudges.map((nudge, idx) => (
                      <div key={idx} className="p-2.5 bg-white/90 rounded-xl border border-zinc-150 space-y-1.5 shadow-xs">
                        <span className="block text-[9.5px] font-black text-indigo-700">{nudge.context}</span>
                        <p className="text-[9px] text-[#4B4B5C] font-semibold leading-relaxed">{nudge.whyItMatters}</p>
                        <p className="text-[9px] text-[#4B4B5C]/80 italic">Action: {nudge.suggestedAction}</p>
                        <button 
                          onClick={() => {
                            if (nudge.ctaText.includes('focus')) {
                              setActiveTab('focus');
                            } else if (nudge.ctaText.includes('habits')) {
                              setActiveTab('habits');
                            } else {
                              alert('Nudge Activated: ' + nudge.suggestedAction);
                            }
                          }}
                          className="w-full text-center py-1 text-[8px] font-extrabold text-[#8B6CFF] hover:text-[#7A5CEF] bg-[#8B6CFF]/5 hover:bg-[#8B6CFF]/10 rounded-lg border border-[#8B6CFF]/15 transition-all mt-1 cursor-pointer"
                        >
                          {nudge.ctaText}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 9. WEEKLY PROGRESS CARD */}
                <div className="p-5 rounded-3xl bg-[#FFFDF9] border border-zinc-150 shadow-sm text-left flex flex-col justify-between">
                  <h3 className="text-xs font-black text-[#312E5B] uppercase tracking-wider">Weekly Saved Index</h3>
                  <div className="text-center py-2">
                    <span className="text-2xl font-black text-[#8B6CFF]">12.5 hrs</span>
                    <span className="block text-[8px] font-mono text-zinc-400 font-bold uppercase mt-1">Saved this week</span>
                  </div>
                  <div className="w-full h-1 bg-[#6EE7B7] rounded-full overflow-hidden" />
                </div>

                {/* 10. PRODUCTIVITY HEATMAP */}
                <div className="p-5 rounded-3xl bg-[#EAF4FF]/80 border border-[#67E8F9]/20 shadow-sm text-left md:col-span-1">
                  <h3 className="text-xs font-black text-[#312E5B] uppercase tracking-wider mb-2">Focus Heatmap</h3>
                  <div className="grid grid-cols-7 gap-1">
                    {[...Array(28)].map((_, i) => {
                      const opacity = [0.15, 0.4, 0.75, 0.9, 0.3, 0.6][i % 6];
                      return (
                        <div 
                          key={i} 
                          className="aspect-square rounded"
                          style={{
                            backgroundColor: '#8B6CFF',
                            opacity: opacity
                          }}
                        />
                      );
                    })}
                  </div>
                  <span className="block text-[8px] font-bold text-zinc-400 mt-2 text-right">Focus Levels (Last 4 weeks)</span>
                </div>

                {/* 11. ASK NUDGE AI CHAT PANEL */}
                <div className="p-5 rounded-3xl bg-white/80 border border-zinc-150 shadow-sm md:col-span-2 flex flex-col justify-between min-h-[160px]">
                  <div className="flex items-center gap-1.5 border-b border-zinc-100 pb-2 mb-2 text-left">
                    <MessageSquare size={13} className="text-[#8B6CFF]" />
                    <span className="text-[10px] font-black text-[#312E5B] uppercase tracking-wider">Ask Nudge Companion</span>
                  </div>

                  <div className="flex-1 overflow-y-auto max-h-[88px] space-y-2 pr-1 mb-2 text-left">
                    {chatMessages.map((m, idx) => (
                      <div 
                        key={idx}
                        className={`p-2 rounded-xl text-[9.5px] leading-relaxed max-w-[85%] font-semibold ${
                          m.isAI 
                            ? 'bg-[#F3EEFF]/80 text-[#312E5B] border border-[#8B6CFF]/15' 
                            : 'bg-zinc-50 border border-zinc-200 text-[#4B4B5C] ml-auto'
                        }`}
                      >
                        {m.text}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-zinc-100">
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type 'add design task'..." 
                      className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-[10px] text-zinc-700 focus:outline-none focus:ring-1 focus:ring-[#8B6CFF]"
                      onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    />
                    <button 
                      onClick={handleSendChat}
                      className="p-1.5 bg-[#8B6CFF] text-white rounded-xl hover:opacity-95 transition-all cursor-pointer"
                    >
                      <Send size={12} />
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB: PLAN FLOW */}
          {activeTab === 'plan' && (
            <motion.div key="plan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="space-y-4">
                <h3 className="text-lg font-black text-[#312E5B]">Priority Smart Plan</h3>
                <div className="p-6 bg-white/70 border border-zinc-150 rounded-3xl">
                  <p className="text-xs text-[#4B4B5C] leading-relaxed">Your task pool is fully arranged in priority orders below.</p>
                  <div className="space-y-2 mt-4">
                    {tasks.map(t => (
                      <div key={t.id} className="p-4 bg-white border border-zinc-150 rounded-2xl flex items-center justify-between shadow-sm">
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-bold text-[#312E5B]">{t.text}</span>
                          <span className="text-[9px] text-zinc-400 font-mono mt-0.5">{t.category} • {t.effort}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[8.5px] font-bold px-2.5 py-0.5 rounded-full border bg-[#8B6CFF]/10 border-[#8B6CFF]/20 text-[#8B6CFF]">{t.urgency.toUpperCase()}</span>
                          <button 
                            onClick={() => handleDeleteTask(t.id)}
                            className="text-xs text-zinc-400 hover:text-red-500 font-bold px-2 py-1 rounded cursor-pointer transition-colors"
                            title="Delete task"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: PRIORITY GALAXY */}
          {activeTab === 'galaxy' && (
            <motion.div key="galaxy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <PriorityGalaxy tasks={tasks} onDeleteTask={handleDeleteTask} />
            </motion.div>
          )}

          {/* TAB: CALENDAR */}
          {activeTab === 'calendar' && (
            <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SmartCalendar tasks={tasks} onAddTask={handleAddTask} />
            </motion.div>
          )}

          {/* TAB: FOCUS ROOM */}
          {activeTab === 'focus' && (
            <motion.div key="focus" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ZenFocusSpace />
            </motion.div>
          )}

          {/* TAB: HABITS */}
          {activeTab === 'habits' && (
            <motion.div key="habits" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <GoalsHabitsTracker tasks={tasks} onToggleStatus={handleToggleStatus} />
            </motion.div>
          )}

          {/* TAB: INSIGHTS */}
          {activeTab === 'insights' && (
            <motion.div key="insights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-black text-[#312E5B]">Insights Heatmap</h3>
                    <p className="text-xs text-[#4B4B5C] mt-1">Weekly report highlights saved hours and momentum indices.</p>
                  </div>
                </div>
                
                {/* 3 Core Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 bg-[#F3EEFF]/60 border border-[#8B6CFF]/10 rounded-3xl text-left">
                    <span className="text-[9px] font-mono font-black text-[#8B6CFF] uppercase tracking-wider block">Productivity Index</span>
                    <h2 className="text-2xl font-black text-[#312E5B] mt-1">88.5%</h2>
                    <p className="text-[9px] text-[#4B4B5C] mt-2 font-semibold">↑ 4.2% increase vs last week's median focus intensity.</p>
                  </div>
                  <div className="p-5 bg-[#E7FFF4]/75 border border-[#6EE7B7]/10 rounded-3xl text-left">
                    <span className="text-[9px] font-mono font-black text-emerald-600 uppercase tracking-wider block">Estimated Hours Saved</span>
                    <h2 className="text-2xl font-black text-[#312E5B] mt-1">6.4 hrs</h2>
                    <p className="text-[9px] text-[#4B4B5C] mt-2 font-semibold">Calculated from AI priority unblocking and task delegation.</p>
                  </div>
                  <div className="p-5 bg-[#FFF6CC]/50 border border-[#F6D365]/10 rounded-3xl text-left">
                    <span className="text-[9px] font-mono font-black text-[#FFAA8A] uppercase tracking-wider block">Deep Work Cycles</span>
                    <h2 className="text-2xl font-black text-[#312E5B] mt-1">12 blocks</h2>
                    <p className="text-[9px] text-[#4B4B5C] mt-2 font-semibold">Streak maintained: 5 consecutive days of target focus.</p>
                  </div>
                </div>

                <div className="p-6 bg-white/70 border border-zinc-150 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Heatmap Grid */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-mono font-black text-[#312E5B] uppercase tracking-wider text-left">Daily Focus Density (June)</h4>
                    <div className="grid grid-cols-7 gap-2">
                      {[...Array(30)].map((_, i) => {
                        const density = [0.15, 0.45, 0.8, 0.95, 0.25, 0.6, 0.1, 0.35, 0.7, 0.9, 0.15, 0.5, 0.85, 0.3][i % 14];
                        return (
                          <div 
                            key={i} 
                            className="aspect-square rounded-lg shadow-xs transition-transform hover:scale-110 cursor-pointer flex flex-col justify-between p-1"
                            style={{
                              backgroundColor: '#8B6CFF',
                              opacity: density
                            }}
                            title={`June ${i+1}: ${(density * 100).toFixed(0)}% Focus density`}
                          >
                            <span className="text-[7px] text-white font-mono font-black">{i+1}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between items-center text-[7.5px] font-mono text-zinc-400 font-bold uppercase pt-1">
                      <span>Less Focus</span>
                      <div className="flex gap-0.5">
                        <span className="w-1.5 h-1.5 bg-[#8B6CFF] opacity-15 rounded-xs" />
                        <span className="w-1.5 h-1.5 bg-[#8B6CFF] opacity-45 rounded-xs" />
                        <span className="w-1.5 h-1.5 bg-[#8B6CFF] opacity-80 rounded-xs" />
                        <span className="w-1.5 h-1.5 bg-[#8B6CFF] opacity-95 rounded-xs" />
                      </div>
                      <span>Max Focus</span>
                    </div>
                  </div>

                  {/* Hourly Load */}
                  <div className="space-y-4 text-left">
                    <h4 className="text-xs font-mono font-black text-[#312E5B] uppercase tracking-wider">Hourly Concentration Wave</h4>
                    <div className="h-32 w-full relative pt-2">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="insights-wave-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8B6CFF" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#8B6CFF" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d="M 0 30 L 0 25 Q 15 10, 30 18 T 60 8 T 90 22 T 100 15 L 100 30 Z" fill="url(#insights-wave-grad)" />
                        <path d="M 0 25 Q 15 10, 30 18 T 60 8 T 90 22 T 100 15" stroke="#8B6CFF" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                        
                        <circle cx="60" cy="8" r="2.5" fill="#8B6CFF" className="animate-pulse" />
                      </svg>
                      
                      <div className="flex justify-between items-center text-[7.5px] font-mono text-zinc-400 font-bold uppercase pt-2.5">
                        <span>09:00 AM</span>
                        <span>01:00 PM (Spike)</span>
                        <span>06:00 PM</span>
                      </div>
                    </div>
                    <p className="text-[9.5px] text-[#4B4B5C] font-semibold leading-relaxed pt-2">
                      💡 Focus spikes consistently around 1:00 PM. Schedule your most critical, high-energy cognitive tasks during this peak window.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="space-y-4">
                <h3 className="text-lg font-black text-[#312E5B]">Portal Settings</h3>
                <div className="p-6 bg-white/70 border border-zinc-150 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#312E5B]">Mascot Notifications</span>
                    <input type="checkbox" defaultChecked className="rounded text-[#8B6CFF] focus:ring-[#8B6CFF]" />
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-zinc-100 pt-3">
                    <span className="font-bold text-[#312E5B]">Context Aware Sound Triggers</span>
                    <input type="checkbox" defaultChecked className="rounded text-[#8B6CFF] focus:ring-[#8B6CFF]" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <AddTaskModal 
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        onAdd={(task) => handleAddTask(task.text, task.category, task.urgency, task.effort, task.energy, task.due_date)}
      />
    </div>
  );
}
