import { motion } from 'framer-motion';

export default function MascotLogo() {
  return (
    <motion.div 
      whileHover={{ scale: 1.06, rotate: 2 }}
      className="relative flex items-center gap-2 cursor-pointer"
    >
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-md">
        <defs>
          <linearGradient id="mascot-body-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9A8D4" />
            <stop offset="45%" stopColor="#A78BFA" />
            <stop offset="90%" stopColor="#6EE7B7" />
            <stop offset="100%" stopColor="#F6D365" />
          </linearGradient>
        </defs>
        
        {/* Fluffy cloud body */}
        <motion.path 
          d="M12 26 C8 26 6 23 7 19 C8 15 11 13 15 14 C17 10 23 8 27 11 C31 14 33 18 31 22 C33 23 33 26 30 26 Z" 
          fill="url(#mascot-body-grad)" 
          animate={{
            d: [
              "M12 26 C8 26 6 23 7 19 C8 15 11 13 15 14 C17 10 23 8 27 11 C31 14 33 18 31 22 C33 23 33 26 30 26 Z",
              "M12 25 C7 25 5 22 6 18 C7 14 10 12 14 13 C16 9 22 7 26 10 C30 13 32 17 30 21 C32 22 32 25 29 25 Z",
              "M12 26 C8 26 6 23 7 19 C8 15 11 13 15 14 C17 10 23 8 27 11 C31 14 33 18 31 22 C33 23 33 26 30 26 Z"
            ]
          }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        />
        
        <g className="animate-mascot-blink">
          <circle cx="16" cy="18" r="1.5" fill="#312E5B" />
          <circle cx="23" cy="17.5" r="1.5" fill="#312E5B" />
        </g>
        
        <path d="M 18,21 Q 19.5,22.5 21,21" stroke="#312E5B" strokeWidth="1" fill="none" />
        
        <motion.path 
          d="M 19.5,3 L 20.5,5.5 L 23,6 L 20.5,6.5 L 19.5,9 L 18.5,6.5 L 16,6 L 18.5,5.5 Z" 
          fill="#F6D365"
          className="animate-sparkle"
          style={{ originX: '19.5px', originY: '6px' }}
        />
      </svg>
      <div className="flex flex-col items-start leading-none">
        <span className="text-lg font-black text-[#312E5B] tracking-tight">nudge</span>
        <span className="text-[7.5px] font-mono text-zinc-400 font-extrabold uppercase tracking-widest">AI Companion</span>
      </div>
    </motion.div>
  );
}
