import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Clock, Check, HelpCircle } from 'lucide-react';
import type { Task } from '../utils/priorityEngine';

interface SmartCalendarProps {
  tasks: Task[];
  onAddTask: (
    text: string,
    category: string,
    urgency: 'high' | 'medium' | 'low',
    effort: string,
    energy: string,
    due_date?: string
  ) => void;
}

export default function SmartCalendar({ tasks, onAddTask }: SmartCalendarProps) {
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [suggestedDay, setSuggestedDay] = useState<number | null>(null);

  // June 2026 has exactly 30 days and starts on a Monday
  const daysInJune = 30;
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const findBestTime = () => {
    setRecommendation('scanning');
    setTimeout(() => {
      // Find the first day of June with 0 tasks
      let bestDay = 3; // default fallback
      for (let d = 1; d <= daysInJune; d++) {
        const hasTasks = tasks.some(t => {
          if (!t.due_date) return false;
          const due = new Date(t.due_date);
          return due.getDate() === d && due.getMonth() === 5; // Month 5 is June
        });
        if (!hasTasks) {
          bestDay = d;
          break;
        }
      }
      setSuggestedDay(bestDay);
      setRecommendation('found');
    }, 1500);
  };

  const handleAddSuggested = () => {
    if (suggestedDay) {
      const targetDate = new Date(2026, 5, suggestedDay, 15, 0).toISOString();
      onAddTask(
        '⭐ Suggested Focus block',
        'Study',
        'medium',
        '1 hr',
        'Medium focus',
        targetDate
      );
      setRecommendation(null);
      setSuggestedDay(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Explanation text card */}
      <div className="p-5 rounded-3xl bg-[#F3EEFF]/55 border border-[#8B6CFF]/15 text-left space-y-2">
        <h4 className="text-[10px] font-mono font-black text-[#8B6CFF] uppercase tracking-wider flex items-center gap-1">
          <HelpCircle size={12} />
          <span>Nudge Calendar Explanation</span>
        </h4>
        <p className="text-[9.5px] text-[#4B4B5C] font-semibold leading-relaxed">
          The **Dynamic Calendar** aligns all task items to their specific deadline cells in June 2026.
          Rather than repeating events weekly, this maps live database records. Click **"Find Best Slot"** to let the AI search for zero-load days to schedule high-priority commitments.
        </p>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#8B6CFF] uppercase">June 2026</span>
          <h2 className="text-xl font-bold text-zinc-800">Dynamic Slots</h2>
        </div>
        
        <button
          onClick={findBestTime}
          disabled={recommendation === 'scanning'}
          className="bg-gradient-to-r from-[#8B6CFF] to-[#F9A8D4] text-white text-[10px] font-bold px-4 py-2.5 rounded-xl hover:opacity-95 transition-all flex items-center gap-1.5 shadow-md shadow-[#8B6CFF]/15 cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <Bot size={13} />
          <span>Find Best Slot</span>
        </button>
      </div>

      {/* Grid calendar slots */}
      <div className="border border-zinc-150 rounded-3xl overflow-hidden bg-white/80 shadow-xs">
        <div className="grid grid-cols-7 border-b border-zinc-150 bg-zinc-50/50 p-3 text-center text-[10px] font-mono font-bold text-zinc-400">
          {daysOfWeek.map(d => <span key={d}>{d}</span>)}
        </div>
        
        <div className="grid grid-cols-7 gap-2 p-4 min-h-[220px]">
          {[...Array(daysInJune)].map((_, i) => {
            const dayNum = i + 1;
            // Filter tasks due on this specific day of June 2026
            const dayTasks = tasks.filter(t => {
              if (t.status === 'completed' || !t.due_date) return false;
              const due = new Date(t.due_date);
              return due.getFullYear() === 2026 && due.getMonth() === 5 && due.getDate() === dayNum;
            });
            
            return (
              <div 
                key={i} 
                className="p-2 border border-zinc-100 rounded-2xl min-h-[85px] bg-white flex flex-col justify-between"
              >
                <span className="text-[10px] font-mono font-bold text-zinc-400">{dayNum}</span>
                
                <div className="space-y-1 mt-1">
                  {dayTasks.map(t => (
                    <div 
                      key={t.id}
                      className={`p-1 rounded text-[8px] leading-tight font-bold text-left border ${
                        t.urgency === 'high' 
                          ? 'bg-rose-50 border-rose-100 text-rose-700' 
                          : t.urgency === 'medium'
                            ? 'bg-[#F3EEFF]/60 border-[#8B6CFF]/15 text-[#8B6CFF]'
                            : 'bg-[#E7FFF4]/75 border-[#6EE7B7]/15 text-[#3B7A57]'
                      }`}
                    >
                      <span className="block truncate" title={t.text}>{t.text}</span>
                      <span className="text-[7px] text-zinc-400 font-mono font-medium">{t.effort}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Recommendation Panel */}
      <AnimatePresence mode="wait">
        {recommendation === 'scanning' && (
          <motion.div 
            key="scanning"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-[#F3EEFF]/60 border border-[#8B6CFF]/15 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-[#8B6CFF]"
          >
            <Clock className="animate-spin" size={14} />
            <span>Nudge AI scanning empty calendar voids...</span>
          </motion.div>
        )}
        
        {recommendation === 'found' && (
          <motion.div 
            key="found"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-teal-50 border border-teal-150 rounded-2xl flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2 text-teal-900 font-bold">
              <Check size={14} className="text-teal-600" />
              <span>Recommended Slot Locked: June {suggestedDay} (15:00 - 16:00 Focus Block)</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleAddSuggested}
                className="bg-emerald-500 text-white text-[9px] font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-600 cursor-pointer active:scale-95"
              >
                Add Slot
              </button>
              <button 
                onClick={() => setRecommendation(null)}
                className="text-[9px] text-zinc-400 hover:text-zinc-650 font-bold"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
