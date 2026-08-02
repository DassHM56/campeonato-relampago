import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import api from '../services/api';
import LadderBracket from '../components/LadderBracket';

function Home() {
  const [equipos, setEquipos] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resEquipos, resPartidos] = await Promise.all([
          api.get('/equipos'),
          api.get('/partidos'),
        ]);
        setEquipos(resEquipos.data.data);
        setPartidos(resPartidos.data.data);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      } finally {
        setCargando(false);
      }
    };
    fetchData();
  }, []);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Cargando campeonato...</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <LadderBracket equipos={equipos} partidos={partidos} />
    </AnimatePresence>
  );
}

export default Home;
