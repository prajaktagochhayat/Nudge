import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Flame, Clock } from 'lucide-react';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: {
    text: string;
    category: string;
    urgency: 'high' | 'medium' | 'low';
    effort: string;
    energy: string;
    due_date?: string;
  }) => void;
}

export default function AddTaskModal({ isOpen, onClose, onAdd }: AddTaskModalProps) {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('Work');
  const [urgency, setUrgency] = useState<'high' | 'medium' | 'low'>('medium');
  const [effort, setEffort] = useState('30m');
  const [energy, setEnergy] = useState('Routine focus');
  const [dueDate, setDueDate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd({
      text,
      category,
      urgency,
      effort,
      energy,
      due_date: dueDate ? new Date(dueDate).toISOString() : undefined
    });
    setText('');
    setDueDate('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-white p-6 rounded-3xl border border-zinc-150 shadow-xl space-y-4 text-left"
      >
        <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
          <h3 className="text-sm font-black text-[#312E5B] uppercase tracking-wider">Add Priority Task</h3>
          <button onClick={onClose} className="p-1 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-600 transition-colors">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Task Name */}
          <div className="space-y-1">
            <label className="text-[9.5px] font-black text-[#312E5B] uppercase tracking-wider">Task Title</label>
            <input 
              type="text" 
              placeholder="e.g. Prep slide deck outline"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#8B6CFF]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {/* Category */}
            <div className="space-y-1">
              <label className="text-[9.5px] font-black text-[#312E5B] uppercase tracking-wider">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none"
              >
                <option value="Work">Work</option>
                <option value="Academics">Academics</option>
                <option value="Finance">Finance</option>
                <option value="Personal">Personal</option>
              </select>
            </div>

            {/* Urgency */}
            <div className="space-y-1">
              <label className="text-[9.5px] font-black text-[#312E5B] uppercase tracking-wider">Urgency</label>
              <select 
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none"
              >
                <option value="low">Low urgency</option>
                <option value="medium">Medium urgency</option>
                <option value="high">High urgency</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {/* Effort */}
            <div className="space-y-1">
              <label className="text-[9.5px] font-black text-[#312E5B] uppercase tracking-wider flex items-center gap-1"><Clock size={11} /> Effort</label>
              <select 
                value={effort}
                onChange={(e) => setEffort(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none"
              >
                <option value="15m">15 mins</option>
                <option value="30m">30 mins</option>
                <option value="1 hr">1 hr</option>
                <option value="2 hrs">2 hrs</option>
                <option value="3 hrs">3 hrs</option>
              </select>
            </div>

            {/* Energy */}
            <div className="space-y-1">
              <label className="text-[9.5px] font-black text-[#312E5B] uppercase tracking-wider flex items-center gap-1"><Flame size={11} /> Energy Level</label>
              <select 
                value={energy}
                onChange={(e) => setEnergy(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none"
              >
                <option value="Low effort">Low effort</option>
                <option value="Routine focus">Routine focus</option>
                <option value="Medium focus">Medium focus</option>
                <option value="High focus">High focus</option>
              </select>
            </div>
          </div>

          {/* Due date */}
          <div className="space-y-1">
            <label className="text-[9.5px] font-black text-[#312E5B] uppercase tracking-wider flex items-center gap-1"><Calendar size={11} /> Due Date & Time</label>
            <input 
              type="datetime-local" 
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#8B6CFF]"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-gradient-to-r from-[#8B6CFF] to-[#F9A8D4] text-white text-xs font-bold py-3.5 rounded-2xl shadow-md hover:opacity-95 transition-all flex items-center justify-center cursor-pointer active:scale-98"
          >
            Create Task
          </button>
        </form>
      </motion.div>
    </div>
  );
}
