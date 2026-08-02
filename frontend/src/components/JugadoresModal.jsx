import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

function JugadoresModal({ equipo, onClose }) {
  const [jugadores, setJugadores] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (equipo) {
      setCargando(true);
      api
        .get(`/jugadores/equipo/${equipo.id_equipo}`)
        .then((res) => setJugadores(res.data.data))
        .catch(() => setJugadores([]))
        .finally(() => setCargando(false));
    }
  }, [equipo]);

  return (
    <AnimatePresence>
      {equipo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 overflow-hidden flex-shrink-0">
                  {equipo.logo_url ? (
                    <img
                      src={equipo.logo_url}
                      alt={equipo.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-600" />
                  )}
                </div>
                <h3 className="text-white font-bold text-lg truncate">
                  {equipo.nombre}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white transition-colors text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-4 max-h-80 overflow-y-auto">
              {cargando ? (
                <p className="text-center text-gray-500 py-4">Cargando...</p>
              ) : jugadores.length === 0 ? (
                <p className="text-center text-gray-400 py-4 italic">
                  Este equipo aun no tiene jugadores registrados.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-semibold text-gray-600">
                        #
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-600">
                        Jugador
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-600">
                        DNI
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {jugadores.map((j, i) => (
                      <tr
                        key={j.id_jugador}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-2 px-3 text-gray-400 font-mono text-xs">
                          {j.numero_camiseta || '-'}
                        </td>
                        <td className="py-2 px-3 text-gray-800 font-medium">
                          {j.nombre_completo}
                        </td>
                        <td className="py-2 px-3 text-gray-500 font-mono text-xs">
                          {j.dni || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default JugadoresModal;
