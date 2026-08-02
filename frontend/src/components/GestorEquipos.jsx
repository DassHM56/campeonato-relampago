import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import JugadoresModal from './JugadoresModal';

function GestorEquipos() {
  const [form, setForm] = useState({
    nombre: '',
    nombre_responsable: '',
    celular_responsable: '',
    logo_url: '',
    metodo_pago: 'Yape',
    posicion_ranking: 1,
  });
  const [logoFile, setLogoFile] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [equipoModal, setEquipoModal] = useState(null);

  useEffect(() => {
    fetchEquipos();
  }, []);

  const fetchEquipos = async () => {
    try {
      const res = await api.get('/equipos');
      setEquipos(res.data.data);
    } catch (error) {
      console.error('Error al obtener equipos:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setForm((prev) => ({ ...prev, logo_url: file.name }));
    }
  };

  const subirLogo = async () => {
    if (!logoFile) return null;
    const formData = new FormData();
    formData.append('logo', logoFile);
    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.logo_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setMensaje(null);
    try {
      const urlLogo = await subirLogo();
      const payload = { ...form };
      if (urlLogo) {
        payload.logo_url = urlLogo;
      } else {
        payload.logo_url = '';
      }
      await api.post('/equipos', payload);
      setMensaje('Equipo registrado correctamente');
      setForm({
        nombre: '',
        nombre_responsable: '',
        celular_responsable: '',
        logo_url: '',
        metodo_pago: 'Yape',
        posicion_ranking: 1,
      });
      setLogoFile(null);
      fetchEquipos();
    } catch (error) {
      console.error(error);
      setMensaje('Error al registrar el equipo');
    } finally {
      setEnviando(false);
    }
  };

  const eliminarEquipo = async (id) => {
    if (!window.confirm('¿Estas seguro de eliminar este equipo?')) return;
    try {
      await api.delete(`/equipos/${id}`);
      setMensaje('Equipo eliminado');
      fetchEquipos();
    } catch (error) {
      setMensaje(
        error.response?.data?.error || 'Error al eliminar el equipo'
      );
    }
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row items-start gap-8 w-full max-w-7xl mx-auto">
        <div className="w-full lg:w-1/3 mt-6">
          <div className="bg-white shadow-lg rounded-2xl p-8 w-full border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
              Registrar Nuevo Equipo
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Equipo
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Responsable
                </label>
                <input
                  type="text"
                  name="nombre_responsable"
                  value={form.nombre_responsable}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Celular del Responsable
                </label>
                <input
                  type="text"
                  name="celular_responsable"
                  value={form.celular_responsable}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo del Equipo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {logoFile && (
                  <p className="mt-1 text-xs text-gray-500">
                    Archivo: {logoFile.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pago
                </label>
                <select
                  name="metodo_pago"
                  value={form.metodo_pago}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Yape">Yape</option>
                  <option value="Efectivo">Efectivo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Posición en Ranking
                </label>
                <input
                  type="number"
                  name="posicion_ranking"
                  value={form.posicion_ranking}
                  onChange={handleChange}
                  min="1"
                  max="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {enviando ? 'Registrando...' : 'Registrar Equipo'}
              </button>
            </form>

            {mensaje && (
              <p className="mt-4 text-center text-green-600 font-medium">
                {mensaje}
              </p>
            )}
          </div>
        </div>

        <div className="w-full lg:w-2/3 mt-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Equipos Inscritos ({equipos.length})
          </h3>

          {cargando ? (
            <p className="text-center text-gray-500">Cargando equipos...</p>
          ) : equipos.length === 0 ? (
            <p className="text-center text-gray-400 italic py-4">
              No hay equipos registrados aun.
            </p>
          ) : (
            <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100 border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">
                      Logo
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">
                      Equipo
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">
                      Ranking
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {equipos.map((eq) => (
                    <tr
                      key={eq.id_equipo}
                      className="border-b border-gray-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                          {eq.logo_url ? (
                            <img
                              src={eq.logo_url}
                              alt={eq.nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-800">{eq.nombre}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[180px]">
                          {eq.nombre_responsable || 'Sin responsable'}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                          {eq.posicion_ranking}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEquipoModal(eq)}
                            className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                          >
                            Ver Jugadores
                          </button>
                          <button
                            onClick={() => eliminarEquipo(eq.id_equipo)}
                            className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors font-medium"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <JugadoresModal
        equipo={equipoModal}
        onClose={() => setEquipoModal(null)}
      />
    </>
  );
}

export default GestorEquipos;
