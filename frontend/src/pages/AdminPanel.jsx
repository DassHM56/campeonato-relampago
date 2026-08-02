import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VerificadorDNI from '../components/VerificadorDNI';
import GestorPartidos from '../components/GestorPartidos';
import GestorJugadores from '../components/GestorJugadores';
import GestorEquipos from '../components/GestorEquipos';

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('verificador');
  const navigate = useNavigate();

  const cerrarSesion = () => {
    localStorage.removeItem('adminAuth');
    navigate('/login');
  };

  const tabs = [
    { id: 'verificador', label: 'Verificador DNI' },
    { id: 'equipos', label: 'Equipos' },
    { id: 'jugadores', label: 'Jugadores' },
    { id: 'fixture', label: 'Fixture y Partidos' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">
            Panel de Administrador
          </h1>
          <button
            onClick={cerrarSesion}
            className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline"
          >
            Cerrar sesión
          </button>
        </div>

        <nav className="max-w-5xl mx-auto px-4">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium -mb-px border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto p-4">
        {activeTab === 'verificador' && (
          <div className="max-w-lg mx-auto mt-6">
            <VerificadorDNI />
          </div>
        )}
        {activeTab === 'equipos' && <GestorEquipos />}
        {activeTab === 'jugadores' && (
          <div className="max-w-3xl mx-auto mt-6">
            <GestorJugadores />
          </div>
        )}
        {activeTab === 'fixture' && (
          <div className="max-w-lg mx-auto mt-6">
            <GestorPartidos />
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminPanel;
