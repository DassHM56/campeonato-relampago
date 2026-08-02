import { useState } from 'react';
import api from '../services/api';

function VerificadorDNI() {
  const [dni, setDni] = useState('');
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [buscando, setBuscando] = useState(false);

  const handleChange = (e) => {
    const soloDigitos = e.target.value.replace(/\D/g, '').slice(0, 8);
    setDni(soloDigitos);
    setResultado(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (dni.length !== 8) {
      setError('El DNI debe tener 8 dígitos');
      setResultado(null);
      return;
    }

    setBuscando(true);
    setResultado(null);
    setError(null);

    try {
      const res = await api.get(`/jugadores/buscar/${dni}`);
      setResultado(res.data.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('ALERTA: DNI NO REGISTRADO EN NINGÚN EQUIPO');
      } else {
        setError('Error al consultar el servidor');
      }
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-1 text-center">
        Verificador de DNI
      </h2>
      <p className="text-sm text-gray-500 mb-4 text-center">
        Mesa de control - Verificación rápida de jugadores
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={dni}
          onChange={handleChange}
          maxLength="8"
          inputMode="numeric"
          pattern="[0-9]{8}"
          placeholder="Ingrese DNI (8 dígitos)"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-wider"
        />
        <button
          type="submit"
          disabled={buscando || dni.length !== 8}
          className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {buscando ? 'Verificando...' : 'Verificar Jugador'}
        </button>
      </form>

      {error && (
        <div
          className={`mt-4 p-4 rounded-lg border-2 text-center font-bold animate-pulse ${
            error.startsWith('ALERTA')
              ? 'bg-red-50 border-red-500 text-red-700'
              : 'bg-amber-50 border-amber-400 text-amber-700'
          }`}
        >
          {error}
        </div>
      )}

      {resultado && (
        <div className="mt-4 p-5 rounded-xl border-2 border-green-500 bg-green-50 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-green-300 flex-shrink-0">
              {resultado.logo_url ? (
                <img
                  src={resultado.logo_url}
                  alt={resultado.nombre_equipo}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-300 to-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                Jugador Verificado
              </p>
              <h3 className="text-lg font-bold text-gray-800 truncate">
                {resultado.nombre_completo}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                Equipo: <span className="font-semibold">{resultado.nombre_equipo}</span>
              </p>
              {resultado.numero_camiseta !== null && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Camiseta N° {resultado.numero_camiseta}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VerificadorDNI;
