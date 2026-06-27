import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send } from 'lucide-react';

interface NudgeAIAssistantProps {
  onPlanRequest: () => void;
  onFocusRequest: () => void;
}

export default function NudgeAIAssistant({ onPlanRequest, onFocusRequest }: NudgeAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi Prajakta! I've slot-allocated your priority deep-work tasks based on your highest energy indices. What shall we tackle next?", isAI: true }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    // Add user message
    const userMsg = { text: inputText, isAI: false };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = inputText;
    setInputText('');

    // Generate AI response
    setTimeout(() => {
      let reply = "I am processing that. Let's start a quick focus block to stay ahead of your timeline.";
      const lower = currentInput.toLowerCase();
      if (lower.includes('plan') || lower.includes('day')) {
        reply = "I've structured a custom plan for you. Check your Today Flow Momentum Map!";
        onPlanRequest();
      } else if (lower.includes('focus') || lower.includes('timer')) {
        reply = "Focus session initialized. Protecting you from notification interruptions now.";
        onFocusRequest();
      } else if (lower.includes('bill') || lower.includes('due')) {
        reply = "I detected your Electricity Bill is due tomorrow. I can help automate the payout task in 1-click.";
      }
      setMessages(prev => [...prev, { text: reply, isAI: true }]);
    }, 1200);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Expanded Chat Dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[340px] h-[400px] glass-panel bg-white/95 rounded-3xl p-4 shadow-2xl flex flex-col justify-between mb-4 border border-indigo-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center text-white text-[10px] font-extrabold animate-pulse">
                  N
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-zinc-800">Nudge AI Assistant</h4>
                  <span className="text-[8px] font-mono text-zinc-400 font-bold uppercase tracking-wider">Active</span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-xs text-zinc-400 hover:text-zinc-600 font-bold px-2 py-1 rounded"
              >
                Close
              </button>
            </div>

            {/* Conversation Log */}
            <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
              {messages.map((msg, idx) => (
                <div 
                  key={idx}
                  className={`p-3 rounded-2xl text-[11px] leading-relaxed max-w-[85%] font-medium ${
                    msg.isAI 
                      ? 'bg-indigo-50 text-indigo-950 border border-indigo-100' 
                      : 'bg-white border border-zinc-150 text-zinc-800 self-end ml-auto'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Input fields and suggestions */}
            <div className="space-y-3 border-t border-zinc-100 pt-3">
              {/* Reply Chips */}
              <div className="flex flex-wrap gap-1.5">
                {['Plan my day', 'Help me focus'].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => {
                      setInputText(chip);
                      setTimeout(handleSend, 100);
                    }}
                    className="text-[9px] bg-zinc-50 border border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-indigo-600 font-bold px-2.5 py-1 rounded-full transition-all"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Text Input area */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask Nudge to schedule deep work..."
                  className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-800"
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={handleSend}
                  className="p-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Orb button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 relative overflow-hidden group border border-indigo-300"
      >
        {/* Breathing backdrop effect */}
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute w-20 h-20 rounded-full border border-white/20 animate-ping pointer-events-none" />
        
        <MessageSquare size={20} className="relative z-10" />
      </motion.button>
    </div>
  );
}
