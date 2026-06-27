import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Flame, Sparkles, BarChart, 
  CheckCircle, ShieldAlert, TrendingUp, HelpCircle, AlertTriangle
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { Task } from '../utils/priorityEngine';
import { calculatePriority } from '../utils/priorityEngine';
import { getRecoveryPlan } from '../services/aiService';

interface SmartPlanPageProps {
  onBackToSite: () => void;
}

export default function SmartPlanPage({ onBackToSite }: SmartPlanPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'schedule' | 'metrics'>('schedule');

  // Central task state
  const [tasks, setTasks] = useState<Task[]>([]);

  // Sync tasks from Supabase
  useEffect(() => {
    const loadDbTasks = async () => {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: dbTasks } = await supabase.from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });
          
          if (dbTasks) {
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
        }
      } catch (err) {
        console.error('Error loading schedule from database:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isSupabaseConfigured) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      loadDbTasks();
    }
  }, []);

  // Update task completion status
  const handleToggleTaskStatus = async (id: string | number) => {
    const currentItem = tasks.find(item => item.id === id);
    if (!currentItem) return;

    const nextStatus = currentItem.status === 'completed' ? 'pending' : 'completed';
    setTasks(prev => prev.map(item => item.id === id ? { ...item, status: nextStatus } : item));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('tasks')
          .update({ status: nextStatus })
          .eq('id', id);
      } catch (err) {
        console.error('Failed to update task status in Supabase:', err);
      }
    }
  };



  // 1. Calculate Priority Scores for all tasks
  const tasksWithPriority = tasks.map(t => {
    const priority = calculatePriority(t);
    return {
      ...t,
      priority
    };
  }).sort((a, b) => b.priority.score - a.priority.score);

  // 2. Identify Overdue tasks
  const overdueTasks = tasksWithPriority.filter(t => {
    if (t.status === 'completed' || !t.due_date) return false;
    return new Date(t.due_date) < new Date();
  });

  const recoveryPlans = overdueTasks.map(t => ({
    task: t,
    plan: getRecoveryPlan(t)
  }));

  // 3. Generate dynamic deadlines
  const deadlines = tasksWithPriority
    .filter(t => t.status !== 'completed' && t.due_date)
    .slice(0, 3)
    .map(t => {
      const due = new Date(t.due_date!);
      return {
        title: t.text,
        due: due.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        urgency: t.urgency
      };
    });

  // 4. Generate dynamic recommendations
  const recommendations = tasksWithPriority
    .filter(t => t.status !== 'completed')
    .slice(0, 2)
    .map(t => ({
      title: t.text,
      duration: t.effort,
      reason: `Matches your energy parameter: "${t.energy}". Calculated Priority score is ${t.priority.score}/100.`
    }));

  const insights = [
    'Your focus is historically strongest between 10 AM and 11:30 AM.',
    'Shifting weekly goal planning to afternoons saved you 45 minutes of context-switching lag yesterday.',
    'You are on a 5-day habit streak! Your habit plant has reached Level 4 growth.'
  ];

  // Skeletons
  const renderSkeleton = () => (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 bg-white/40 border border-zinc-150 rounded-3xl space-y-4 animate-pulse">
            <div className="h-5 bg-zinc-200 rounded w-1/3" />
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex justify-between items-center h-14 bg-zinc-100/50 rounded-2xl px-4">
                  <div className="space-y-1.5 w-1/2">
                    <div className="h-3.5 bg-zinc-200 rounded w-3/4" />
                    <div className="h-2.5 bg-zinc-200 rounded w-1/2" />
                  </div>
                  <div className="h-6 bg-zinc-250 rounded-full w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 bg-white/40 border border-zinc-150 rounded-3xl h-48 animate-pulse">
            <div className="h-4 bg-zinc-200 rounded w-1/2 mb-4" />
            <div className="h-2.5 bg-zinc-200 rounded w-full mb-2" />
            <div className="h-2.5 bg-zinc-200 rounded w-[90%] mb-2" />
            <div className="h-2.5 bg-zinc-200 rounded w-[80%]" />
          </div>
          <div className="p-6 bg-white/40 border border-zinc-150 rounded-3xl h-60 animate-pulse">
            <div className="h-4 bg-zinc-200 rounded w-2/3 mb-4" />
            <div className="grid grid-cols-7 gap-2">
              {[...Array(21)].map((_, i) => (
                <div key={i} className="aspect-square bg-zinc-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full py-8 text-left space-y-8">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#312E5B]/10">
        <div>
          <button 
            onClick={onBackToSite}
            className="text-xs font-black text-zinc-400 hover:text-[#8B6CFF] transition-colors cursor-pointer mb-2 block"
          >
            ← Back to Site
          </button>
          <span className="text-[10px] font-mono font-black tracking-widest text-[#8B6CFF] uppercase bg-[#8B6CFF]/10 px-3 py-1.5 rounded-full border border-[#8B6CFF]/20">
            Smart Plan Dashboard
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-[#312E5B] tracking-tight mt-4">
            AI Smart Planner & Analytics
          </h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-zinc-100 p-1.5 rounded-2xl gap-1.5 self-start md:self-end">
          <button 
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'schedule' 
                ? 'bg-white text-[#312E5B] shadow-sm' 
                : 'text-zinc-500 hover:text-[#312E5B]'
            }`}
          >
            Schedule Flow
          </button>
          <button 
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'metrics' 
                ? 'bg-white text-[#312E5B] shadow-sm' 
                : 'text-zinc-500 hover:text-[#312E5B]'
            }`}
          >
            Analytics & Charts
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
          >
            {renderSkeleton()}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {activeTab === 'schedule' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* 1. DAILY SCHEDULE TIMELINE */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="glass-panel p-6 rounded-[32px] bg-white/70 border border-[#8B6CFF]/10 shadow-sm text-left">
                    <h3 className="text-base font-extrabold text-[#312E5B] flex items-center gap-2 mb-6">
                      <Calendar size={18} className="text-[#8B6CFF]" />
                      <span>Today's Plan Flow</span>
                    </h3>

                    {/* AI Overdue Recovery Path */}
                    {recoveryPlans.length > 0 && (
                      <div className="p-5 bg-rose-50/70 border border-rose-100 rounded-3xl space-y-4 mb-6">
                        <div className="flex items-center gap-2 text-rose-600">
                          <AlertTriangle size={15} className="animate-bounce" />
                          <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1">AI Overdue Recovery Plan Active</h3>
                        </div>
                        <div className="space-y-4">
                          {recoveryPlans.map(({ task, plan }: { task: Task; plan: any }) => (
                            <div key={task.id} className="p-4 bg-white border border-rose-100 rounded-2xl space-y-2">
                              <span className="text-[10px] font-mono text-zinc-400 font-bold">
                                Overdue Target: <span className="text-rose-500 font-black">"{task.text}"</span>
                              </span>
                              <div className="bg-amber-50/50 border border-amber-200/50 p-2.5 rounded-xl text-[9.5px] text-zinc-650 italic">
                                "This task is past its deadline. Nudge recommends dividing the backlog into the following 3-day recovery flow to prevent further delays."
                              </div>
                              <div className="space-y-1.5 pt-1">
                                <span className="block text-[8.5px] font-extrabold text-zinc-700 uppercase tracking-wide">Suggested Recovery Flow:</span>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  {plan.map((step: any, idx: number) => (
                                    <div key={idx} className="p-2 bg-rose-50/20 border border-rose-100/50 rounded-lg flex flex-col justify-between">
                                      <span className="text-[7.5px] text-rose-500 font-extrabold uppercase">Step {idx + 1} ({step.day})</span>
                                      <p className="text-[8.5px] font-bold text-zinc-700 leading-tight my-1">{step.action}</p>
                                      <span className="text-[7px] text-zinc-400 font-mono">Cost: {step.duration}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-200">
                      
                      {tasksWithPriority.map((t, idx) => {
                        const isOverdue = t.status !== 'completed' && t.due_date && new Date(t.due_date) < new Date();
                        return (
                          <div key={t.id || idx} className="relative group">
                            {/* Circle dot on line */}
                            <div className={`absolute left-[-22px] top-1.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center transition-all ${
                              t.status === 'completed' 
                                ? 'border-[#6EE7B7] text-[#6EE7B7]' 
                                : isOverdue
                                  ? 'border-rose-500 text-rose-500'
                                  : t.priority.level === 'Critical' || t.priority.level === 'High'
                                    ? 'border-[#FFAA8A] text-[#FFAA8A]'
                                    : 'border-[#8B6CFF] text-[#8B6CFF]'
                            }`}>
                              {t.status === 'completed' && <CheckCircle size={10} fill="currentColor" className="text-white" />}
                            </div>

                            <div className="p-4 bg-white hover:bg-zinc-50/50 rounded-2xl border border-zinc-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
                              <div className="space-y-1">
                                <span className="text-[10px] font-mono text-zinc-400 font-bold">
                                  {t.due_date 
                                    ? `Due: ${new Date(t.due_date).toLocaleDateString()} @ ${new Date(t.due_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
                                    : 'No deadline set'}
                                </span>
                                <h4 className="text-xs font-black text-[#312E5B] flex items-center gap-1.5">
                                  <span>{t.text}</span>
                                  {isOverdue && (
                                    <span className="text-[8.5px] bg-rose-50 border border-rose-200 text-rose-500 px-1.5 py-0.5 rounded-md font-extrabold uppercase animate-pulse flex items-center gap-0.5">
                                      <AlertTriangle size={8} /> Overdue
                                    </span>
                                  )}
                                </h4>
                                <div className="flex flex-wrap gap-x-2 gap-y-1 items-center">
                                  <span className="text-[8px] text-zinc-500 font-bold uppercase">{t.category}</span>
                                  <span className="text-zinc-300">•</span>
                                  <span className="text-[8px] text-zinc-500 font-bold uppercase">{t.energy}</span>
                                  <span className="text-zinc-300">•</span>
                                  <span className="text-[8px] text-zinc-500 font-bold uppercase">{t.effort}</span>
                                  <span className="text-zinc-300">•</span>
                                  <span className="text-[8.5px] text-[#8B6CFF] font-mono font-bold">Priority Score: {t.priority?.score}/100</span>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1 pt-1 border-t border-zinc-100/50">
                                  {t.priority?.explanation.map((exp, expIdx) => (
                                    <span key={expIdx} className="text-[7.5px] bg-zinc-50 text-zinc-450 font-mono px-1.5 py-0.2 rounded border border-zinc-200/55">{exp}</span>
                                  ))}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border ${
                                  t.priority.level === 'Critical'
                                    ? 'bg-rose-50 border-rose-200 text-rose-500'
                                    : t.priority.level === 'High'
                                      ? 'bg-orange-50 border-orange-200 text-orange-500'
                                      : t.priority.level === 'Important'
                                        ? 'bg-amber-50 border-amber-200 text-amber-500'
                                        : 'bg-zinc-100 border-zinc-200 text-zinc-500'
                                }`}>
                                  {t.priority.level}
                                </span>
                                {t.status === 'completed' ? (
                                  <span className="text-[8px] font-extrabold text-[#6EE7B7] bg-[#6EE7B7]/10 px-2 py-0.5 rounded border border-[#6EE7B7]/30 uppercase">Done</span>
                                ) : (
                                  <button 
                                    onClick={() => handleToggleTaskStatus(t.id)}
                                    className="text-[8px] font-extrabold text-white bg-[#8B6CFF] hover:opacity-95 px-3 py-1 rounded-xl transition-all cursor-pointer"
                                  >
                                    Complete
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 2. SIDEBAR DETAILS: RECOMMENDATIONS, INSIGHTS & DEADLINES */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* AI Energy recommendations */}
                  <div className="glass-panel p-5 bg-[#EAF4FF]/80 border border-[#67E8F9]/20 rounded-3xl text-left space-y-3.5 shadow-sm">
                    <h4 className="text-xs font-black text-[#312E5B] uppercase tracking-wider flex items-center gap-2">
                      <Flame size={14} className="text-[#FFAA8A] animate-pulse" />
                      <span>Energy Task Matching</span>
                    </h4>
                    
                    <div className="space-y-3">
                      {recommendations.map((rec, i) => (
                        <div key={i} className="p-3 bg-white/90 rounded-2xl border border-zinc-100 space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-black text-[#312E5B]">
                            <span>{rec.title}</span>
                            <span className="text-[8px] text-[#8B6CFF] font-mono">{rec.duration}</span>
                          </div>
                          <p className="text-[9.5px] text-[#4B4B5C]/80 font-medium leading-relaxed">{rec.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Insights */}
                  <div className="glass-panel p-5 bg-[#F3EEFF]/85 border border-[#8B6CFF]/15 rounded-3xl text-left space-y-3 shadow-sm">
                    <h4 className="text-xs font-black text-[#312E5B] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={14} className="text-[#8B6CFF]" />
                      <span>AI Insights Panel</span>
                    </h4>
                    
                    <ul className="space-y-2 text-[10px] font-semibold text-[#4B4B5C] leading-relaxed">
                      {insights.map((ins, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-[#8B6CFF]">•</span>
                          <span>{ins}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Deadline list */}
                  <div className="glass-panel p-5 bg-[#FFF0F6]/85 border border-[#F9A8D4]/25 rounded-3xl text-left space-y-3 shadow-sm">
                    <h4 className="text-xs font-black text-[#312E5B] uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert size={14} className="text-[#FFAA8A]" />
                      <span>Upcoming Deadlines</span>
                    </h4>

                    <div className="space-y-2">
                      {deadlines.map((dl, i) => (
                        <div key={i} className="p-2.5 bg-white/70 border border-zinc-100 rounded-xl flex flex-col text-[9.5px] font-semibold text-[#312E5B]">
                          <span className="font-black truncate">{dl.title}</span>
                          <span className="text-zinc-400 font-mono text-[8px] mt-0.5">Due: {dl.due}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* 1. PRODUCTIVITY CHARTS */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Focus hours chart */}
                  <div className="glass-panel p-6 rounded-[32px] bg-white/70 border border-zinc-150 shadow-sm text-left">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">Focus Allocation</h4>
                        <h3 className="text-base font-black text-[#312E5B] mt-1">Weekly Focus Hours</h3>
                      </div>
                      <span className="text-[10px] font-mono text-[#8B6CFF] bg-[#8B6CFF]/10 px-2 py-0.5 rounded border border-[#8B6CFF]/20 font-bold">AVG: 4.8 H/DAY</span>
                    </div>

                    {/* Chart area */}
                    <div className="h-44 w-full relative flex items-end justify-between px-4 pb-2 border-b border-zinc-200">
                      {/* Grid background lines */}
                      <div className="absolute inset-x-0 top-0 border-t border-dashed border-zinc-100 h-0 w-full" />
                      <div className="absolute inset-x-0 top-1/3 border-t border-dashed border-zinc-100 h-0 w-full" />
                      <div className="absolute inset-x-0 top-2/3 border-t border-dashed border-zinc-100 h-0 w-full" />
                      
                      {/* Responsive chart columns */}
                      {[
                        { day: 'Mon', hours: 4.5, color: '#8B6CFF' },
                        { day: 'Tue', hours: 5.8, color: '#8B6CFF' },
                        { day: 'Wed', hours: 3.2, color: '#F9A8D4' },
                        { day: 'Thu', hours: 6.5, color: '#8B6CFF' },
                        { day: 'Fri', hours: 4.0, color: '#6EE7B7' },
                        { day: 'Sat', hours: 2.1, color: '#F6D365' },
                        { day: 'Sun', hours: 1.5, color: '#F6D365' }
                      ].map((item, idx) => {
                        const pct = (item.hours / 7) * 100;
                        return (
                          <div key={idx} className="flex flex-col items-center flex-1 group">
                            {/* Hover tooltip */}
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#312E5B] text-white text-[8px] font-bold px-1.5 py-0.5 rounded mb-1 absolute bottom-[180px] pointer-events-none">
                              {item.hours}h
                            </span>
                            <div 
                              className="w-8 md:w-10 rounded-t-lg transition-all duration-500 hover:brightness-95 relative overflow-hidden" 
                              style={{ 
                                height: `${pct}%`, 
                                backgroundColor: item.color,
                                minHeight: '10px'
                              }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                            </div>
                            <span className="text-[9px] font-mono text-zinc-400 font-bold mt-2">{item.day}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Task completion trend line */}
                  <div className="glass-panel p-6 rounded-[32px] bg-white/70 border border-zinc-150 shadow-sm text-left">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">Progress Chart</h4>
                        <h3 className="text-base font-black text-[#312E5B] mt-1">Task Completion Trend</h3>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] text-[#6EE7B7] font-bold">
                        <TrendingUp size={12} />
                        <span>+12.5% vs last week</span>
                      </span>
                    </div>

                    <div className="h-32 w-full relative">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="trend-line-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#67E8F9" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#67E8F9" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        
                        {/* Area fill */}
                        <path d="M 0 30 L 0 25 Q 16 10, 33 22 T 66 8 T 100 15 L 100 30 Z" fill="url(#trend-line-grad)" />
                        
                        {/* Line */}
                        <motion.path 
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1 }}
                          d="M 0 25 Q 16 10, 33 22 T 66 8 T 100 15" 
                          fill="none" 
                          stroke="#67E8F9" 
                          strokeWidth="1.2" 
                          strokeLinecap="round" 
                        />

                        {/* Dot markers */}
                        <circle cx="0" cy="25" r="1" fill="#67E8F9" />
                        <circle cx="33" cy="22" r="1" fill="#67E8F9" />
                        <circle cx="66" cy="8" r="1" fill="#67E8F9" />
                        <circle cx="100" cy="15" r="1" fill="#67E8F9" />
                      </svg>
                      
                      {/* Grid X Labels */}
                      <div className="flex justify-between text-[8px] font-mono text-zinc-400 font-bold mt-2">
                        <span>W1</span>
                        <span>W2</span>
                        <span>W3</span>
                        <span>Active Week (W4)</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* 2. HEATMAP COLUMN */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Heatmap Widget */}
                  <div className="glass-panel p-5 bg-white/70 border border-zinc-150 rounded-3xl text-left space-y-3.5 shadow-sm">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black text-[#312E5B] uppercase tracking-wider flex items-center gap-1.5">
                        <BarChart size={14} className="text-[#8B6CFF]" />
                        <span>Productivity Heatmap</span>
                      </h4>
                      <span title="Focus intensity grid">
                        <HelpCircle size={12} className="text-zinc-300 cursor-pointer" />
                      </span>
                    </div>

                    <div className="grid grid-cols-7 gap-1.5">
                      {[...Array(28)].map((_, i) => {
                        const opacity = [0.15, 0.45, 0.8, 0.95, 0.25, 0.6][i % 6];
                        return (
                          <div 
                            key={i} 
                            className="aspect-square rounded-md shadow-xs transition-transform hover:scale-110 cursor-pointer"
                            style={{
                              backgroundColor: '#8B6CFF',
                              opacity: opacity
                            }}
                            title={`Focus Day ${i+1}: ${(opacity * 100).toFixed(0)}%`}
                          />
                        );
                      })}
                    </div>

                    <div className="flex justify-between items-center text-[7.5px] font-mono text-zinc-400 font-bold uppercase border-t border-zinc-100 pt-2.5 mt-2.5">
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

                  {/* Fallback & Empty State Panel */}
                  <div className="p-5 rounded-3xl bg-[#FFF6CC]/45 border border-[#F6D365]/20 text-left space-y-2 shadow-xs">
                    <h4 className="text-[10px] font-mono font-black text-[#FFAA8A] uppercase tracking-wider">Insight Status</h4>
                    <p className="text-[9px] text-[#4B4B5C] font-semibold leading-relaxed">
                      "No activity data yet — complete a task to unlock trend forecasts. Your daily insights report is currently building."
                    </p>
                  </div>

                </div>

              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
