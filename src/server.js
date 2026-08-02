const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');
const equipoRoutes = require('./routes/equipoRoutes');
const jugadorRoutes = require('./routes/jugadorRoutes');
const partidoRoutes = require('./routes/partidoRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/uploads', express.static('public/uploads'));

app.use('/api/equipos', equipoRoutes);
app.use('/api/jugadores', jugadorRoutes);
app.use('/api/partidos', partidoRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM equipos');
    res.json({ ok: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error en /api/test:', error.message);
    res.status(500).json({ ok: false, error: 'Error de conexion a la base de datos' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
