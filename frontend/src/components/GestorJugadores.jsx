import { useState, useEffect } from 'react';
import api from '../services/api';

function GestorJugadores() {
  const [equipos, setEquipos] = useState([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState('');
  const [jugadores, setJugadores] = useState([]);
  const [form, setForm] = useState({ nombre_completo: '', dni: '' });
  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const res = await api.get('/equipos');
        setEquipos(res.data.data);
      } catch (error) {
        console.error('Error al obtener equipos:', error);
      }
    };
    fetchEquipos();
  }, []);

  const fetchJugadores = async (idEquipo) => {
    if (!idEquipo) {
      setJugadores([]);
      return;
    }
    setCargando(true);
    try {
      const res = await api.get(`/jugadores/equipo/${idEquipo}`);
      setJugadores(res.data.data);
    } catch (error) {
      console.error('Error al obtener jugadores:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleSelectEquipo = (e) => {
    const id = e.target.value;
    setEquipoSeleccionado(id);
    fetchJugadores(id);
    setMensaje(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'dni') {
      const soloDigitos = value.replace(/\D/g, '').slice(0, 8);
      setForm((prev) => ({ ...prev, dni: soloDigitos }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!equipoSeleccionado) {
      setMensaje('Selecciona un equipo primero');
      return;
    }
    if (!form.nombre_completo || !form.dni) {
      setMensaje('Nombre y DNI son obligatorios');
      return;
    }

    try {
      await api.post('/jugadores', {
        id_equipo: Number(equipoSeleccionado),
        nombre_completo: form.nombre_completo,
        dni: form.dni,
      });
      setMensaje('Jugador registrado correctamente');
      setForm({ nombre_completo: '', dni: '' });
      fetchJugadores(equipoSeleccionado);
    } catch (error) {
      setMensaje(
        error.response?.data?.error || 'Error al registrar el jugador'
      );
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Gestión de Jugadores
      </h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Selecciona un equipo
        </label>
        <select
          value={equipoSeleccionado}
          onChange={handleSelectEquipo}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Elige un equipo --</option>
          {equipos.map((eq) => (
            <option key={eq.id_equipo} value={eq.id_equipo}>
              {eq.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-700 mb-3">
            Jugadores del equipo
          </h3>

          {cargando ? (
            <p className="text-gray-500 text-sm">Cargando...</p>
          ) : !equipoSeleccionado ? (
            <p className="text-gray-400 text-sm italic">
              Selecciona un equipo para ver sus jugadores.
            </p>
          ) : jugadores.length === 0 ? (
            <p className="text-gray-500 text-sm">
              Este equipo aun no tiene jugadores.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-600">
                    Nombre
                  </th>
                  <th className="text-left py-2 font-medium text-gray-600">
                    DNI
                  </th>
                </tr>
              </thead>
              <tbody>
                {jugadores.map((j) => (
                  <tr key={j.id_jugador} className="border-b border-gray-100">
                    <td className="py-2 text-gray-800">{j.nombre_completo}</td>
                    <td className="py-2 text-gray-600 font-mono">{j.dni}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-700 mb-3">
            Registrar nuevo jugador
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo
              </label>
              <input
                type="text"
                name="nombre_completo"
                value={form.nombre_completo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej. Carlos Gomez"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DNI (8 dígitos)
              </label>
              <input
                type="text"
                name="dni"
                value={form.dni}
                onChange={handleChange}
                maxLength="8"
                inputMode="numeric"
                pattern="[0-9]{8}"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="12345678"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
            >
              Agregar Jugador
            </button>
          </form>

          {mensaje && (
            <p
              className={`mt-3 text-center text-sm font-medium ${
                mensaje.includes('Error') || mensaje.includes('Selecciona')
                  ? 'text-red-600'
                  : 'text-green-600'
              }`}
            >
              {mensaje}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default GestorJugadores;
