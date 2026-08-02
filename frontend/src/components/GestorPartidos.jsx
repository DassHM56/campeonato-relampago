import { useState, useEffect } from 'react';
import api from '../services/api';

function GestorPartidos() {
  const [partidos, setPartidos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [resultados, setResultados] = useState({});
  const [mensaje, setMensaje] = useState(null);
  const [limpiando, setLimpiando] = useState(null);
  const [modoTorneo, setModoTorneo] = useState('escalonado');

  const fetchData = async () => {
    try {
      const [resPartidos, resEquipos] = await Promise.all([
        api.get('/partidos'),
        api.get('/equipos'),
      ]);
      setPartidos(resPartidos.data.data);
      setEquipos(resEquipos.data.data);
    } catch (error) {
      console.error('Error al obtener datos:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getEquipo = (id) => equipos.find((e) => e.id_equipo === id) || null;

  const inicializar = async () => {
    try {
      await api.post('/partidos/inicializar', { modo: modoTorneo });
      fetchData();
    } catch (error) {
      setMensaje('Error al inicializar el fixture');
    }
  };

  const resetearTodo = async () => {
    if (
      !window.confirm(
        '¿Seguro que deseas borrar todo el fixture y empezar de cero?'
      )
    )
      return;
    try {
      await api.delete('/partidos/reset');
      setMensaje('Fixture completamente reseteado');
      setResultados({});
      fetchData();
    } catch (error) {
      setMensaje('Error al resetear el fixture');
    }
  };

  const handleGoalChange = (idPartido, campo, value) => {
    setResultados((prev) => ({
      ...prev,
      [idPartido]: {
        ...prev[idPartido],
        [campo]: value,
      },
    }));
  };

  const guardarResultado = async (idPartido) => {
    const r = resultados[idPartido];
    if (
      r === undefined ||
      r.goles_equipo_1 === undefined ||
      r.goles_equipo_2 === undefined ||
      r.goles_equipo_1 === '' ||
      r.goles_equipo_2 === ''
    ) {
      setMensaje('Ingresa los goles de ambos equipos');
      return;
    }

    try {
      await api.put(`/partidos/${idPartido}`, {
        goles_equipo_1: Number(r.goles_equipo_1),
        goles_equipo_2: Number(r.goles_equipo_2),
      });
      setMensaje('Resultado guardado correctamente');
      setResultados((prev) => ({ ...prev, [idPartido]: undefined }));
      fetchData();
    } catch (error) {
      setMensaje(
        error.response?.data?.error || 'Error al guardar el resultado'
      );
    }
  };

  const limpiarPartido = async (idPartido) => {
    if (
      !window.confirm(
        '¿Reiniciar este partido? Se revertirá el avance del ganador.'
      )
    )
      return;
    setLimpiando(idPartido);
    try {
      await api.put(`/partidos/limpiar/${idPartido}`);
      setMensaje('Partido reiniciado correctamente');
      setResultados((prev) => ({ ...prev, [idPartido]: undefined }));
      fetchData();
    } catch (error) {
      setMensaje('Error al limpiar el partido');
    } finally {
      setLimpiando(null);
    }
  };

  if (cargando) {
    return (
      <p className="text-center text-gray-600 mt-8">Cargando partidos...</p>
    );
  }

  // REGLA DE NEGOCIO: exactamente 5 equipos
  if (equipos.length !== 5) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Gestión de Partidos
        </h2>
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 text-center">
          <div className="text-3xl mb-3">🔒</div>
          <h3 className="text-lg font-bold text-amber-800 mb-2">
            Apartado Cerrado
          </h3>
          <p className="text-amber-700 text-sm">
            Debes inscribir exactamente 5 equipos para habilitar la gestión de
            partidos.
          </p>
          <p className="text-amber-600 text-sm font-semibold mt-2">
            Equipos actuales: {equipos.length}/5
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Gestión de Partidos</h2>

        {partidos.length > 0 && (
          <button
            onClick={resetearTodo}
            className="bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            ⚠️ Resetear Todo el Torneo
          </button>
        )}
      </div>

      {mensaje && (
        <p className="text-center text-sm font-medium mb-4 text-blue-600">
          {mensaje}
        </p>
      )}

      {partidos.length === 0 ? (
        <div className="text-center py-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            No hay partidos creados
          </h3>

          <div className="mb-6 max-w-xs mx-auto">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Modo de Torneo
            </label>
            <select
              value={modoTorneo}
              onChange={(e) => setModoTorneo(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="escalonado">Modo Escalonado (Stepladder)</option>
              <option value="campal">Modo Campal (Clasico + Repechaje)</option>
            </select>
          </div>

          <button
            onClick={inicializar}
            className="bg-green-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors text-lg"
          >
            Inicializar Fixture del Torneo
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {partidos.map((p) => {
            const eq1 = getEquipo(p.id_equipo_1);
            const eq2 = getEquipo(p.id_equipo_2);
            const finalizado = p.estado === 'Finalizado';
            const listoParaJugar =
              p.id_equipo_1 && p.id_equipo_2 && !finalizado;

            return (
              <div
                key={p.id_partido}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-gray-700">
                    {p.fase}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      finalizado
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {p.estado}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 text-right">
                    <p className="font-medium text-gray-800 truncate">
                      {eq1 ? eq1.nombre : 'Esperando rival'}
                    </p>
                  </div>

                  <input
                    type="number"
                    min="0"
                    disabled={finalizado}
                    value={
                      finalizado
                        ? p.goles_equipo_1 ?? 0
                        : resultados[p.id_partido]?.goles_equipo_1 ?? ''
                    }
                    onChange={(e) =>
                      handleGoalChange(
                        p.id_partido,
                        'goles_equipo_1',
                        e.target.value
                      )
                    }
                    className="w-14 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="-"
                  />

                  <span className="text-gray-400 font-bold">vs</span>

                  <input
                    type="number"
                    min="0"
                    disabled={finalizado}
                    value={
                      finalizado
                        ? p.goles_equipo_2 ?? 0
                        : resultados[p.id_partido]?.goles_equipo_2 ?? ''
                    }
                    onChange={(e) =>
                      handleGoalChange(
                        p.id_partido,
                        'goles_equipo_2',
                        e.target.value
                      )
                    }
                    className="w-14 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="-"
                  />

                  <div className="flex-1">
                    <p className="font-medium text-gray-800 truncate">
                      {eq2 ? eq2.nombre : 'Esperando rival'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  {listoParaJugar && (
                    <button
                      onClick={() => guardarResultado(p.id_partido)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                    >
                      Guardar Resultado
                    </button>
                  )}

                  {finalizado && (
                    <button
                      onClick={() => limpiarPartido(p.id_partido)}
                      disabled={limpiando === p.id_partido}
                      className="flex-1 bg-orange-100 text-orange-700 py-2 rounded-lg hover:bg-orange-200 transition-colors text-sm font-semibold disabled:opacity-60"
                    >
                      {limpiando === p.id_partido
                        ? 'Limpiando...'
                        : 'Limpiar Goles'}
                    </button>
                  )}
                </div>

                {finalizado && (
                  <p className="mt-2 text-center text-xs text-green-600 font-medium">
                    Resultado finalizado
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default GestorPartidos;
