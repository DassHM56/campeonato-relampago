import { useMemo } from 'react';
import { Bracket, Seed, SeedItem } from 'react-brackets';
import { AnimatePresence, motion } from 'framer-motion';
import TeamCard from './TeamCard';
import FireParticles from './FireParticles';
import { getFullImageUrl } from '../utils/imageUrl';

const NEON_CYAN = 'shadow-[0_0_8px_#22d3ee,0_0_16px_rgba(34,211,238,0.5)]';
const NEON_RED = 'shadow-[0_0_8px_#ef4444,0_0_16px_rgba(239,68,68,0.4)]';

function WaitingSlot({ label = 'Esperando rival...' }) {
  return (
    <div className="w-48 h-64 rounded-2xl overflow-hidden bg-slate-900/60 backdrop-blur-md border-2 border-white/10 flex flex-col items-center justify-center gap-4">
      <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
        <span className="text-5xl text-white/20 font-bold">⚽</span>
      </div>
      <span className="text-white/50 text-sm font-semibold">{label}</span>
    </div>
  );
}

function ResultCard({ match, getEquipo }) {
  const eq1 = getEquipo(match.id_equipo_1);
  const eq2 = getEquipo(match.id_equipo_2);
  const winnerIs1 = match.id_ganador === match.id_equipo_1;

  return (
    <div className="flex flex-col gap-3 bg-slate-900/70 backdrop-blur-sm rounded-xl p-4 border border-white/10 shadow-xl w-48">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
          {eq1?.logo_url ? (
            <img src={getFullImageUrl(eq1?.logo_url)} alt={eq1?.nombre} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-slate-700" />
          )}
        </div>
        <span className={`text-sm truncate ${winnerIs1 ? 'text-white font-bold' : 'text-white/40'}`}>
          {eq1?.nombre || 'Esperando...'}
        </span>
        <span className={`text-lg font-bold ml-auto ${winnerIs1 ? 'text-green-400' : 'text-white/30'}`}>
          {match.goles_equipo_1 ?? 0}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
          {eq2?.logo_url ? (
            <img src={getFullImageUrl(eq2?.logo_url)} alt={eq2?.nombre} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-slate-700" />
          )}
        </div>
        <span className={`text-sm truncate ${!winnerIs1 ? 'text-white font-bold' : 'text-white/40'}`}>
          {eq2?.nombre || 'Esperando...'}
        </span>
        <span className={`text-lg font-bold ml-auto ${!winnerIs1 ? 'text-green-400' : 'text-white/30'}`}>
          {match.goles_equipo_2 ?? 0}
        </span>
      </div>
    </div>
  );
}

function CopaContainer({ finalGanador }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider bg-yellow-400/10 px-4 py-1.5 rounded-full">
        Campeon
      </span>
      <motion.img
        src="/copa.png"
        alt="Copa del Campeonato"
        className="w-64 h-auto object-contain drop-shadow-[0_0_50px_rgba(255,215,0,0.6)]"
        animate={finalGanador ? { scale: [1, 1.08, 1] } : {}}
        transition={finalGanador ? { repeat: Infinity, duration: 2.5 } : {}}
      />
      <AnimatePresence mode="wait">
        {finalGanador ? (
          <motion.div
            key={`campeon-${finalGanador.id_equipo}`}
            initial={{ opacity: 0, y: 20, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="flex flex-col items-center"
          >
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-yellow-400 shadow-[0_0_25px_rgba(255,215,0,0.5)]">
              {finalGanador.logo_url ? (
                <img src={getFullImageUrl(finalGanador.logo_url)} alt={finalGanador.nombre} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-amber-500" />
              )}
            </div>
            <p className="text-white font-bold text-lg mt-3 text-center drop-shadow-lg">
              {finalGanador.nombre}
            </p>
            <span className="text-yellow-400 text-sm font-semibold mt-1">¡CAMPEON!</span>
          </motion.div>
        ) : (
          <motion.p
            key="esperando-campeon"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-white/40 text-sm text-center italic"
          >
            Esperando campeon...
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function CustomSeed({ seed, breakpoint, roundIndex, seedIndex }) {
  const { match, team1, team2, esperando2, getEquipo, isBye } = seed;

  if (isBye) {
    return (
      <Seed mobileBreakpoint={breakpoint}>
        <SeedItem>
          <div className="w-48 h-[560px] flex items-center justify-center">
            <span className="text-white/20 text-xs italic uppercase tracking-widest">Bye</span>
          </div>
        </SeedItem>
      </Seed>
    );
  }

  const finalizado = match && match.estado === 'Finalizado';

  if (finalizado) {
    return (
      <Seed mobileBreakpoint={breakpoint}>
        <SeedItem>
          <ResultCard match={match} getEquipo={getEquipo} />
        </SeedItem>
      </Seed>
    );
  }

  return (
    <Seed mobileBreakpoint={breakpoint}>
      <SeedItem>
        <div className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {team2 ? (
              <TeamCard key={`t2-${team2.id_equipo}`} equipo={team2} esperando={esperando2} />
            ) : (
              <WaitingSlot key={`slot2-${seedIndex}`} />
            )}
          </AnimatePresence>
          <span className="text-white/50 font-bold text-xs tracking-widest uppercase drop-shadow-lg text-center">
            VS
          </span>
          <AnimatePresence mode="popLayout">
            {team1 ? (
              <TeamCard key={`t1-${team1.id_equipo}`} equipo={team1} esperando={esperando2} />
            ) : (
              <WaitingSlot key={`slot1-${seedIndex}`} />
            )}
          </AnimatePresence>
        </div>
      </SeedItem>
    </Seed>
  );
}

function CampalMatchBox({ label, match, team1, team2, getEquipo, labelColor = 'text-white/70' }) {
  const finalizado = match && match.estado === 'Finalizado';
  const esperando = match ? (match.id_equipo_1 === null || match.id_equipo_2 === null) : true;

  return (
    <div className="flex flex-col items-center gap-2 w-48">
      <span className={`text-[10px] font-bold uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full ${labelColor}`}>
        {label}
      </span>

      <div className="min-h-[420px] flex items-center justify-center">
        {finalizado ? (
          <ResultCard match={match} getEquipo={getEquipo} />
        ) : (
          <div className="flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
              {team2 ? (
                <TeamCard key={`t2-${team2.id_equipo}`} equipo={team2} esperando={esperando} />
              ) : (
                <WaitingSlot key={`slot2-${label}`} />
              )}
            </AnimatePresence>
            <span className="text-white/50 font-bold text-xs tracking-widest uppercase drop-shadow-lg text-center">
              VS
            </span>
            <AnimatePresence mode="popLayout">
              {team1 ? (
                <TeamCard key={`t1-${team1.id_equipo}`} equipo={team1} esperando={esperando} />
              ) : (
                <WaitingSlot key={`slot1-${label}`} />
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

function HConnector() {
  return <div className={`h-0.5 w-12 bg-cyan-400 ${NEON_CYAN} flex-shrink-0`} />;
}

function VConnector({ color = 'cyan' }) {
  const cls = color === 'red' ? `w-0.5 bg-red-500 ${NEON_RED}` : `w-0.5 bg-cyan-400 ${NEON_CYAN}`;
  return <div className={`${cls} flex-shrink-0`} />;
}

function CampalLayout({ partidos, equipos, getEquipo, finalGanador }) {
  const p1 = partidos.find((p) => p.orden_partido === 1);
  const p2 = partidos.find((p) => p.orden_partido === 2);
  const p3 = partidos.find((p) => p.orden_partido === 3);
  const p4 = partidos.find((p) => p.orden_partido === 4);
  const p5 = partidos.find((p) => p.orden_partido === 5);
  const p6 = partidos.find((p) => p.orden_partido === 6);

  const p1t1 = p1 ? getEquipo(p1.id_equipo_1) : getEquipo(equipos[0]?.id_equipo);
  const p1t2 = p1 ? getEquipo(p1.id_equipo_2) : getEquipo(equipos[1]?.id_equipo);
  const p2t1 = p2 ? getEquipo(p2.id_equipo_1) : getEquipo(equipos[2]?.id_equipo);
  const p2t2 = p2 ? getEquipo(p2.id_equipo_2) : getEquipo(equipos[3]?.id_equipo);
  const p3t1 = p3 ? getEquipo(p3.id_equipo_1) : null;
  const p3t2 = p3 ? getEquipo(p3.id_equipo_2) : null;
  const p4t1 = p4 ? getEquipo(p4.id_equipo_1) : null;
  const p4t2 = p4 ? getEquipo(p4.id_equipo_2) : getEquipo(equipos[4]?.id_equipo);
  const p5t1 = p5 ? getEquipo(p5.id_equipo_1) : null;
  const p5t2 = p5 ? getEquipo(p5.id_equipo_2) : null;
  const p6t1 = p6 ? getEquipo(p6.id_equipo_1) : null;
  const p6t2 = p6 ? getEquipo(p6.id_equipo_2) : null;

  return (
    <div className="campal-layout px-2">
      {/* ====================== LLAVE PRINCIPAL ====================== */}
      <div className="mb-2">
        <h2
          className="text-center text-lg font-black uppercase tracking-widest mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-white to-blue-500"
          style={{ filter: 'drop-shadow(0 0 10px rgba(34,211,238,0.6))' }}
        >
          Llave Principal
        </h2>

        <div className="flex items-center justify-center">
          {/* Columna Izquierda: M1 + M2 */}
          <div className="flex flex-col gap-6">
            <CampalMatchBox label="Ronda 1A" match={p1} team1={p1t1} team2={p1t2} getEquipo={getEquipo} />
            <CampalMatchBox label="Ronda 1B" match={p2} team1={p2t1} team2={p2t2} getEquipo={getEquipo} />
          </div>

          {/* Conector M1/M2 -> M5 (dos líneas cian + vertical) */}
          <div className="flex flex-col justify-around self-stretch relative" style={{ minHeight: '450px' }}>
            <div className="h-0.5 w-10 bg-cyan-400 shadow-[0_0_8px_#22d3ee,0_0_16px_rgba(34,211,238,0.5)]" />
            <div className="h-0.5 w-10 bg-cyan-400 shadow-[0_0_8px_#22d3ee,0_0_16px_rgba(34,211,238,0.5)]" />
          </div>

          {/* Columna Centro: M5 */}
          <CampalMatchBox label="Final Ganadores" match={p5} team1={p5t1} team2={p5t2} getEquipo={getEquipo} />

          {/* Conector M5 -> M6 */}
          <div className="flex items-center">
            <HConnector />
          </div>

          {/* Columna Derecha: M6 + Copa */}
          <div className="flex items-center gap-4">
            <CampalMatchBox label="Gran Final" match={p6} team1={p6t1} team2={p6t2} getEquipo={getEquipo} labelColor="text-yellow-400" />
            <CopaContainer finalGanador={finalGanador} />
          </div>
        </div>
      </div>

      {/* ====================== ZONA DE CONEXIÓN ROJA ====================== */}
      <div className="flex items-center justify-center gap-16 py-1">
        <div className="flex flex-col items-center gap-1">
          <span className="text-red-400 text-[10px] font-bold uppercase tracking-wider drop-shadow-[0_0_4px_#ef4444]">
            Perdedor M1
          </span>
          <div className="w-0.5 h-6 bg-red-500 shadow-[0_0_8px_#ef4444,0_0_16px_rgba(239,68,68,0.4)]" />
          <span className="text-red-400 text-sm">↓</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-red-400 text-[10px] font-bold uppercase tracking-wider drop-shadow-[0_0_4px_#ef4444]">
            Perdedor M2
          </span>
          <div className="w-0.5 h-6 bg-red-500 shadow-[0_0_8px_#ef4444,0_0_16px_rgba(239,68,68,0.4)]" />
          <span className="text-red-400 text-sm">↓</span>
        </div>
      </div>

      {/* ====================== LLAVE DE REPECHAJE ====================== */}
      <div className="rounded-2xl border-2 border-red-500/20 bg-red-950/10 backdrop-blur-sm p-3">
        <h2
          className="text-center text-lg font-black uppercase tracking-widest mb-2 bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-orange-300 to-red-500"
          style={{ filter: 'drop-shadow(0 0 10px rgba(239,68,68,0.5))' }}
        >
          Llave de Repechaje
        </h2>

        <div className="flex items-center justify-center">
          {/* M3 */}
          <CampalMatchBox
            label="Repechaje"
            match={p3}
            team1={p3t1}
            team2={p3t2}
            getEquipo={getEquipo}
            labelColor="text-red-400"
          />

          {/* Conector M3 -> M4 */}
          <div className="flex items-center">
            <HConnector />
          </div>

          {/* M4 */}
          <CampalMatchBox
            label="Retador"
            match={p4}
            team1={p4t1}
            team2={p4t2}
            getEquipo={getEquipo}
            labelColor="text-red-400"
          />

          {/* Indicador: Ganador M4 sube a Gran Final */}
          <div className="flex flex-col items-center gap-1 ml-4">
            <span className="text-cyan-400 text-[10px] font-bold uppercase tracking-wider drop-shadow-[0_0_4px_#22d3ee]">
              Ganador
            </span>
            <span className="text-cyan-400 text-xl">↑</span>
            <span className="text-cyan-400 text-[10px] font-semibold text-center max-w-[80px]">
              sube a Gran Final
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LadderBracket({ equipos, partidos = [] }) {
  if (!equipos || equipos.length < 5) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-700 to-green-900 flex items-center justify-center p-8">
        <p className="text-white text-xl text-center">
          Se necesitan 5 equipos para mostrar la escalera.
        </p>
      </div>
    );
  }

  const getEquipo = (id) =>
    id === null ? null : equipos.find((e) => e.id_equipo === id) || null;

  const isCampal = partidos.length === 6;

  const [eq1, eq2, eq3, eq4, eq5] = equipos;

  const escalonadoRounds = useMemo(() => {
    if (isCampal) return [];

    const tienePartidos = partidos.length >= 4;
    const p = tienePartidos ? partidos : [null, null, null, null];
    const [p1, p2, p3, p4] = p;

    return [
      {
        title: 'Ronda 1',
        seeds: [{ id: 1, match: p1, team1: p1 ? getEquipo(p1.id_equipo_1) : eq4, team2: p1 ? getEquipo(p1.id_equipo_2) : eq5, esperando2: false, getEquipo }],
      },
      {
        title: 'Cuartos',
        seeds: [{ id: 2, match: p2, team1: p2 ? getEquipo(p2.id_equipo_1) : eq3, team2: p2 ? getEquipo(p2.id_equipo_2) : null, esperando2: p2 ? p2.id_equipo_2 === null : true, getEquipo }],
      },
      {
        title: 'Semifinal',
        seeds: [{ id: 3, match: p3, team1: p3 ? getEquipo(p3.id_equipo_1) : eq2, team2: p3 ? getEquipo(p3.id_equipo_2) : null, esperando2: p3 ? p3.id_equipo_2 === null : true, getEquipo }],
      },
      {
        title: 'Final',
        seeds: [{ id: 4, match: p4, team1: p4 ? getEquipo(p4.id_equipo_1) : eq1, team2: p4 ? getEquipo(p4.id_equipo_2) : null, esperando2: p4 ? p4.id_equipo_2 === null : true, getEquipo }],
      },
    ];
  }, [equipos, partidos, isCampal]);

  const finalGanador = isCampal
    ? (partidos.find((p) => p.orden_partido === 6)?.estado === 'Finalizado'
      ? getEquipo(partidos.find((p) => p.orden_partido === 6).id_ganador)
      : null)
    : (partidos.length >= 4 && partidos[3]?.estado === 'Finalizado'
      ? getEquipo(partidos[3].id_ganador)
      : null);

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900">
      {/* Fondo fijo extendido que cubre todo el área scrolleable */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/fondo.jpg')", zIndex: 0 }}
        aria-hidden="true"
      />
      <div className="fixed inset-0 bg-black/60" style={{ zIndex: 1 }} aria-hidden="true" />

      {/* Contenido scrolleable horizontalmente */}
      <div
        className="relative z-10 overflow-x-auto overflow-y-hidden"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="min-w-[900px]">
          <div className="relative z-10">
            <motion.h1
              className="text-center text-5xl md:text-6xl font-black mb-1 tracking-tight pt-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-white to-blue-500"
              style={{ filter: 'drop-shadow(0 0 15px rgba(34,211,238,0.8))' }}
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              Campeonato Relampago
            </motion.h1>
            <p className="text-center text-green-200 mb-4 text-lg">
              {isCampal ? 'Doble Eliminacion - Modo Campal' : 'Bracket de Eliminacion'}
            </p>

            {isCampal ? (
              <div className="w-full h-[calc(100vh-140px)] flex items-center justify-center overflow-hidden">
                <div className="w-full h-full flex flex-col items-center justify-center transform scale-[0.78] origin-center">
                  <CampalLayout partidos={partidos} equipos={equipos} getEquipo={getEquipo} finalGanador={finalGanador} />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-[calc(100vh-140px)] px-6 gap-0">
                <div className="bracket-container relative">
                  <Bracket
                    rounds={escalonadoRounds}
                    renderSeedComponent={CustomSeed}
                    roundTitleComponent={(title) => (
                      <span className="text-xs font-bold text-white/70 uppercase tracking-wider bg-white/10 px-4 py-1.5 rounded-full block text-center mb-4">
                        {title}
                      </span>
                    )}
                    mobileBreakpoint={0}
                  />
                </div>
                <CopaContainer finalGanador={finalGanador} />
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .bracket-container > div > div { margin: 0 1.5rem; }
        .bracket-container [class*="sc-imWYAI"],
        .bracket-container [class*="sc-fqkvVR"] > div {
          padding: 0 !important;
          min-width: auto !important;
          margin: 1.5rem 0 !important;
        }
        .bracket-container [class*="sc-dcJsrY"] {
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          box-shadow: none !important;
        }
        .bracket-container [class*="sc-dcJsrY"]:hover { background: transparent !important; }
        .bracket-container [class*="sc-imWYAI"]::after,
        .bracket-container [class*="sc-imWYAI"]::before {
          display: none !important;
          content: none !important;
          border: none !important;
          box-shadow: none !important;
        }
        .bracket-container > div > div > span { margin-bottom: 1rem !important; }
      `}</style>
    </div>
  );
}

export default LadderBracket;
