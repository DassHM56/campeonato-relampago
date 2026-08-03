import { useState } from 'react';
import { motion } from 'framer-motion';
import { getFullImageUrl } from '../utils/imageUrl';
import JugadoresModal from './JugadoresModal';

function TeamCard({ equipo, esperando = false }) {
  const [modalOpen, setModalOpen] = useState(false);

  if (!equipo) {
    return (
      <div className="relative w-40 h-52 md:w-44 md:h-56 lg:w-48 lg:h-60 rounded-2xl overflow-hidden bg-slate-900/60 backdrop-blur-md border-2 border-white/10 flex flex-col items-center justify-center gap-4">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/5 flex items-center justify-center">
          <span className="text-4xl md:text-5xl text-white/20 font-bold">⚽</span>
        </div>
        <span className="text-white/50 text-xs md:text-sm font-semibold">
          Esperando rival...
        </span>
      </div>
    );
  }

  return (
    <>
      <motion.div
        layoutId={`equipo-${equipo.id_equipo}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.5, filter: 'grayscale(100%)' }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        layout
        onClick={() => setModalOpen(true)}
        className={`relative w-40 h-52 md:w-44 md:h-56 lg:w-48 lg:h-60 rounded-2xl overflow-hidden shadow-2xl cursor-pointer group ${
          esperando ? 'ring-2 ring-amber-400/80' : ''
        }`}
      >
        {/* Full image background */}
        {equipo.logo_url ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-500 group-hover:scale-110"
            style={{ backgroundImage: `url(${getFullImageUrl(equipo.logo_url)})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <span className="text-6xl text-white/20 font-bold">⚽</span>
          </div>
        )}

        {/* Radial dark overlay - centered */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300" />

        {/* Name centered absolute */}
        <div className="absolute inset-0 flex items-center justify-center px-3">
          <h3
            className="uppercase text-xl font-black text-white text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-tight"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,1)' }}
          >
            {equipo.nombre}
          </h3>
        </div>

        {/* Ranking badge */}
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-blue-600/90 backdrop-blur-sm text-white text-sm font-bold flex items-center justify-center shadow-lg border border-white/20">
          {equipo.posicion_ranking}
        </div>

        {esperando && (
          <div className="absolute top-3 left-3">
            <span className="text-[10px] text-amber-900 font-bold bg-amber-400/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow">
              ESPERA
            </span>
          </div>
        )}
      </motion.div>

      <JugadoresModal
        equipo={modalOpen ? equipo : null}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

export default TeamCard;
