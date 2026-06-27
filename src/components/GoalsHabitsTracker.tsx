import { motion } from 'framer-motion';
import { Award, CheckCircle2, Flame, Sprout, ClipboardList } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Task } from '../utils/priorityEngine';

interface GoalsHabitsTrackerProps {
  tasks: Task[];
  onToggleStatus: (id: number) => void;
}

export default function GoalsHabitsTracker({ tasks, onToggleStatus }: GoalsHabitsTrackerProps) {


  // Map first 4 tasks as habits
  const activeHabits = tasks.slice(0, 4).map(t => ({
    id: t.id,
    name: t.text,
    streak: t.urgency === 'high' ? 6 : t.urgency === 'medium' ? 3 : 1,
    completed: t.status === 'completed'
  }));

  // Map all tasks as roadmap steps
  const roadmapSteps = tasks.map(t => ({
    id: t.id,
    title: t.text,
    done: t.status === 'completed'
  }));

  const handleToggleHabit = (id: number, completed: boolean) => {
    onToggleStatus(id);
    if (!completed) {
      // Fire confetti celebration on completion!
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.85 },
        colors: ['#8B6CFF', '#F9A8D4', '#6EE7B7']
      });
    }
  };

  const completedCount = activeHabits.filter(h => h.completed).length;

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#8B6CFF] uppercase">Consistency Deck</span>
          <h2 className="text-xl font-bold text-zinc-800">Goals & Habits</h2>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="p-8 bg-white/70 border border-zinc-150 rounded-[32px] text-center space-y-4 flex flex-col items-center justify-center min-h-[300px]">
          <ClipboardList size={40} className="text-zinc-300 animate-bounce" />
          <h3 className="text-sm font-black text-[#312E5B]">Consistency Deck Empty</h3>
          <p className="text-[10.5px] text-zinc-550 max-w-sm leading-relaxed">
            "Your habit plant and roadmap milestones are fully linked to your active task dashboard. Add your first task to begin tracking growth streaks."
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Habit plant growing visual */}
          <div className="glass-panel p-6 bg-white/95 rounded-3xl space-y-4">
            <div className="flex justify-between items-center text-left">
              <h3 className="text-xs font-extrabold text-[#312E5B] flex items-center gap-1.5">
                <Sprout className="text-emerald-500 animate-bounce" size={15} /> 
                <span>Growing Habit Tree</span>
              </h3>
              <span className="text-[9px] text-[#8B6CFF] font-bold uppercase">Consistency: {completedCount > 0 ? Math.round((completedCount / activeHabits.length) * 100) : 0}%</span>
            </div>

            <div className="flex items-center gap-6 justify-center py-4 bg-zinc-50 border border-zinc-100 rounded-2xl">
              {/* Visual growing plant leaf structure */}
              <div className="relative w-20 h-24 flex items-end justify-center">
                {/* Stem line */}
                <div className="w-1 bg-emerald-600 h-16 rounded-full relative z-0">
                  {completedCount >= 1 && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute left-1 top-4 w-4 h-2 bg-emerald-500 rounded-full origin-left rotate-[-30deg]" 
                    />
                  )}
                  {completedCount >= 2 && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-1 top-8 w-4 h-2 bg-emerald-500 rounded-full origin-right rotate-[30deg]" 
                    />
                  )}
                  {completedCount >= 3 && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute left-1 top-10 w-4 h-2 bg-emerald-500 rounded-full origin-left rotate-[-30deg]" 
                    />
                  )}
                  {completedCount >= 4 && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-1 top-12 w-4 h-2 bg-emerald-500 rounded-full origin-right rotate-[30deg]" 
                    />
                  )}
                </div>
              </div>
              
              <div className="text-left space-y-0.5">
                <h4 className="text-xs font-bold text-zinc-800">
                  {completedCount === 0 ? 'Seedling Stage' : completedCount === activeHabits.length ? 'Fully Bloomed' : 'Growing Sprout'}
                </h4>
                <p className="text-[10px] text-zinc-450 leading-relaxed max-w-[130px]">
                  Complete active tasks checklist to feed nutrients to your plant.
                </p>
              </div>
            </div>

            {/* Habit checkboxes */}
            <div className="space-y-2 text-left">
              {activeHabits.map(h => (
                <div 
                  key={h.id} 
                  className="flex items-center justify-between p-3 rounded-2xl border border-zinc-100 bg-white hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-2.5">
                    <button 
                      onClick={() => handleToggleHabit(h.id, h.completed)}
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                        h.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-200 hover:border-zinc-350'
                      }`}
                    >
                      {h.completed && <CheckCircle2 size={12} />}
                    </button>
                    <span className={`text-xs font-semibold ${h.completed ? 'text-zinc-400 line-through font-normal' : 'text-[#312E5B]'}`}>
                      {h.name}
                    </span>
                  </div>
                  
                  <span className="text-[9px] text-orange-500 font-bold flex items-center gap-0.5">
                    <Flame size={11} fill="currentColor" /> {h.streak}d
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Goals roadmap path layout */}
          <div className="glass-panel p-6 bg-white/95 rounded-3xl space-y-4">
            <div className="flex justify-between items-center text-left">
              <h3 className="text-xs font-extrabold text-[#312E5B] flex items-center gap-1.5">
                <Award className="text-[#8B6CFF]" size={15} /> 
                <span>Smart Goals Roadmap</span>
              </h3>
              <span className="text-[10px] text-[#8B6CFF] font-bold uppercase font-mono">Milestones</span>
            </div>

            {/* Connected dot progress step line */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-100 text-left">
              {roadmapSteps.map(step => (
                <div 
                  key={step.id}
                  className="relative flex items-center gap-4 cursor-pointer"
                  onClick={() => onToggleStatus(step.id)}
                >
                  {/* Node Dot */}
                  <div className={`absolute left-[-21px] w-4 h-4 rounded-full border-4 transition-all z-10 ${
                    step.done 
                      ? 'bg-emerald-500 border-emerald-100' 
                      : 'bg-white border-zinc-200'
                  }`} />

                  <div>
                    <h4 className={`text-xs font-bold ${
                      step.done ? 'text-zinc-450 line-through' : 'text-[#312E5B]'
                    }`}>
                      {step.title}
                    </h4>
                    <span className={`text-[8.5px] font-mono font-black uppercase ${
                      step.done ? 'text-emerald-500' : 'text-zinc-400'
                    }`}>
                      {step.done ? 'Completed' : 'Pending Target'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
