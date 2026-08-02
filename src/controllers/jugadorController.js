const pool = require('../config/db');

const registrarJugador = async (req, res) => {
  try {
    const { id_equipo, nombre_completo, dni, numero_camiseta } = req.body;

    if (!id_equipo || !nombre_completo) {
      return res
        .status(400)
        .json({ ok: false, error: 'Los campos id_equipo y nombre_completo son obligatorios' });
    }

    const [result] = await pool.query(
      `INSERT INTO jugadores
        (id_equipo, nombre_completo, dni, numero_camiseta)
       VALUES (?, ?, ?, ?)`,
      [id_equipo, nombre_completo, dni || null, numero_camiseta || null]
    );

    res.status(201).json({
      ok: true,
      message: 'Jugador registrado correctamente',
      jugadorId: result.insertId,
    });
  } catch (error) {
    console.error('Error en registrarJugador:', error.message);
    res
      .status(500)
      .json({ ok: false, error: 'Error al registrar el jugador' });
  }
};

const obtenerJugadoresPorEquipo = async (req, res) => {
  try {
    const { id_equipo } = req.params;

    const [rows] = await pool.query(
      'SELECT * FROM jugadores WHERE id_equipo = ?',
      [id_equipo]
    );

    res.json({ ok: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error en obtenerJugadoresPorEquipo:', error.message);
    res
      .status(500)
      .json({ ok: false, error: 'Error al obtener los jugadores' });
  }
};

const buscarPorDNI = async (req, res) => {
  try {
    const { dni } = req.params;

    const [rows] = await pool.query(
      `SELECT j.nombre_completo, j.numero_camiseta, j.dni,
              e.nombre AS nombre_equipo, e.logo_url
       FROM jugadores j
       INNER JOIN equipos e ON j.id_equipo = e.id_equipo
       WHERE j.dni = ?
       LIMIT 1`,
      [dni]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ ok: false, error: 'Jugador no encontrado' });
    }

    res.json({ ok: true, data: rows[0] });
  } catch (error) {
    console.error('Error en buscarPorDNI:', error.message);
    res
      .status(500)
      .json({ ok: false, error: 'Error al buscar el jugador' });
  }
};

module.exports = { registrarJugador, obtenerJugadoresPorEquipo, buscarPorDNI };
