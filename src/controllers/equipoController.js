const pool = require('../config/db');

const registrarEquipo = async (req, res) => {
  try {
    const {
      nombre,
      nombre_responsable,
      celular_responsable,
      logo_url,
      metodo_pago,
      posicion_ranking,
    } = req.body;

    if (!nombre) {
      return res
        .status(400)
        .json({ ok: false, error: 'El campo nombre es obligatorio' });
    }

    const [result] = await pool.query(
      `INSERT INTO equipos
        (nombre, nombre_responsable, celular_responsable, logo_url, metodo_pago, posicion_ranking)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        nombre_responsable || null,
        celular_responsable || null,
        logo_url || null,
        metodo_pago || null,
        posicion_ranking || null,
      ]
    );

    res.status(201).json({
      ok: true,
      message: 'Equipo registrado correctamente',
      equipoId: result.insertId,
    });
  } catch (error) {
    console.error('Error en registrarEquipo:', error.message);
    res
      .status(500)
      .json({ ok: false, error: 'Error al registrar el equipo' });
  }
};

const obtenerEquipos = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM equipos ORDER BY posicion_ranking ASC'
    );

    res.json({ ok: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error en obtenerEquipos:', error.message);
    res
      .status(500)
      .json({ ok: false, error: 'Error al obtener los equipos' });
  }
};

const eliminarEquipo = async (req, res) => {
  try {
    const { id } = req.params;

    const [check] = await pool.query(
      'SELECT id_equipo FROM equipos WHERE id_equipo = ?',
      [id]
    );

    if (check.length === 0) {
      return res
        .status(404)
        .json({ ok: false, error: 'Equipo no encontrado' });
    }

    await pool.query('DELETE FROM jugadores WHERE id_equipo = ?', [id]);
    await pool.query('UPDATE partidos SET id_equipo_1 = NULL WHERE id_equipo_1 = ?', [id]);
    await pool.query('UPDATE partidos SET id_equipo_2 = NULL WHERE id_equipo_2 = ?', [id]);
    await pool.query('UPDATE partidos SET id_ganador = NULL WHERE id_ganador = ?', [id]);

    await pool.query('DELETE FROM equipos WHERE id_equipo = ?', [id]);

    res.json({ ok: true, message: 'Equipo eliminado correctamente' });
  } catch (error) {
    console.error('Error en eliminarEquipo:', error.message);
    res
      .status(500)
      .json({ ok: false, error: 'Error al eliminar el equipo' });
  }
};

module.exports = { registrarEquipo, obtenerEquipos, eliminarEquipo };
