import { motion } from 'framer-motion';

const sparks = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  delay: Math.random() * 8,
  duration: 3 + Math.random() * 5,
  size: 2 + Math.random() * 4,
  opacity: 0.3 + Math.random() * 0.7,
  xSwing: -30 + Math.random() * 60,
  color: ['bg-cyan-400', 'bg-blue-500', 'bg-white', 'bg-sky-400'][
    Math.floor(Math.random() * 4)
  ],
}));

function FireParticles() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {sparks.map((s) => (
        <motion.div
          key={s.id}
          className={`absolute rounded-full blur-sm ${s.color}`}
          style={{
            left: s.left,
            bottom: 0,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
          }}
          animate={{
            y: ['100vh', '-10vh'],
            x: [0, s.xSwing, -s.xSwing, 0],
            opacity: [s.opacity, s.opacity * 0.5, s.opacity, 0],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

export default FireParticles;
