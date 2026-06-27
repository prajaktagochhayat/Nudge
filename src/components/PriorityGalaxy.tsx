import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, AlertCircle, Zap } from 'lucide-react';
import type { Task } from '../utils/priorityEngine';
import { calculatePriority } from '../utils/priorityEngine';

interface PriorityGalaxyProps {
  tasks: Task[];
  onDeleteTask: (id: number) => void;
}

export default function PriorityGalaxy({ tasks, onDeleteTask }: PriorityGalaxyProps) {
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // Reset selected task if it gets deleted from parent tasks list
  useEffect(() => {
    if (selectedTask && !tasks.some(t => t.id === selectedTask.id)) {
      setSelectedTask(null);
    }
  }, [tasks, selectedTask]);

  // Map user tasks to Galaxy orbital bubbles dynamically
  const priorityTasks = tasks.filter(t => t.status !== 'completed').map((t) => {
    const priority = calculatePriority(t);
    let color = 'bg-rose-500 text-white';
    let type: 'critical' | 'deep' | 'quick' = 'critical';
    
    if (t.urgency === 'high' || priority.level === 'Critical') {
      color = 'bg-rose-500 text-white';
      type = 'critical';
    } else if (priority.level === 'High' || priority.level === 'Important') {
      color = 'bg-[#8B6CFF] text-white';
      type = 'deep';
    } else {
      color = 'bg-[#6EE7B7] text-white';
      type = 'quick';
    }
    
    return {
      id: t.id,
      text: t.text,
      category: t.category,
      urgency: t.urgency,
      type,
      impact: priority.explanation[0] || 'Due and requires attention',
      effort: t.effort,
      size: 1 + priority.score / 200,
      color,
      glow: type === 'critical' ? 'shadow-rose' : type === 'deep' ? 'shadow-indigo' : 'shadow-mint'
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-500 uppercase">Interactive Priority Galaxy</span>
          <h2 className="text-xl font-bold text-zinc-800">Why This Matters Now</h2>
        </div>
        <div className="flex gap-4 text-[10px] font-mono font-bold text-zinc-400">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-rose-500 rounded-full" /> Critical</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-indigo-500 rounded-full" /> Deep Work</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-teal-500 rounded-full" /> Quick Bubble</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Galaxy mapping canvas space */}
        <div className="lg:col-span-2 h-[340px] rounded-3xl bg-zinc-950 border border-zinc-800 relative overflow-hidden flex items-center justify-center p-4">
          
          {/* Orbital grid rings */}
          <div className="absolute w-[280px] h-[280px] rounded-full border border-dashed border-zinc-800/60" />
          <div className="absolute w-[180px] h-[180px] rounded-full border border-dashed border-zinc-800/40" />
          <div className="absolute w-[80px] h-[80px] rounded-full border border-dashed border-zinc-850" />
          
          {/* Sonar sweep overlay */}
          <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_40%,rgba(99,102,241,0.08))] animate-[spin_8s_linear_infinite] pointer-events-none" />

          {/* Galaxy center anchor */}
          <div className="w-2 h-2 bg-indigo-500 rounded-full z-10 shadow-lg shadow-indigo-400" />

          {/* Floating Galaxy Tasks */}
          {priorityTasks.map((task, idx) => {
            // Dynamically distribute items in orbit based on number of active items
            const angle = (idx * (2 * Math.PI)) / priorityTasks.length + Math.PI / 6;
            const radius = 65 + (idx % 3) * 30;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <motion.button
                key={task.id}
                onClick={() => setSelectedTask(task)}
                whileHover={{ scale: 1.15 }}
                className={`absolute w-12 h-12 rounded-full flex items-center justify-center font-black text-sm shadow-lg transition-shadow cursor-pointer z-10 ${task.color}`}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                  boxShadow: `0 0 20px ${task.urgency === 'high' ? 'rgba(251,113,133,0.4)' : 'rgba(99,102,241,0.3)'}`
                }}
              >
                !
              </motion.button>
            );
          })}
        </div>

        {/* Task Explanation Panel */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-3xl flex flex-col justify-between min-h-[300px]">
          <AnimatePresence mode="wait">
            {selectedTask ? (
              <motion.div
                key={selectedTask.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-rose-500 bg-rose-50 px-2 py-0.5 rounded">
                    Priority Rank #{selectedTask.id}
                  </span>
                  <h3 className="text-md font-extrabold text-[#1E1B4B] mt-2">
                    {selectedTask.text}
                  </h3>
                </div>
                
                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex gap-2">
                    <AlertCircle size={14} className="text-rose-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-zinc-700">Immediate Impact</h4>
                      <p className="text-zinc-500 text-[11px] mt-0.5 leading-relaxed">{selectedTask.impact}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Zap size={14} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-zinc-700">Estimated Effort</h4>
                      <p className="text-zinc-500 text-[11px] font-mono mt-0.5">{selectedTask.effort}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 flex gap-2">
                  <button 
                    onClick={() => {
                      onDeleteTask(selectedTask.id);
                      setSelectedTask(null);
                    }}
                    className="flex-1 bg-zinc-950 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-zinc-800 transition-colors"
                  >
                    Mark Resolve
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center p-4">
                <Target size={32} className="text-zinc-300 mb-2 animate-bounce" />
                <h4 className="text-xs font-bold text-zinc-650">Galaxy Insights</h4>
                <p className="text-[10px] text-zinc-400 mt-1 max-w-[200px]">
                  Click orbit tags inside the Priority map to audit AI scheduling explanations.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
