const pool = require('../config/db');

const inicializarFixture = async (req, res) => {
  try {
    const { modo = 'escalonado' } = req.body;

    const [existing] = await pool.query(
      'SELECT COUNT(*) as count FROM partidos'
    );

    if (existing[0].count > 0) {
      return res
        .status(400)
        .json({ ok: false, error: 'El fixture ya fue inicializado' });
    }

    const [equipos] = await pool.query(
      'SELECT * FROM equipos ORDER BY posicion_ranking ASC LIMIT 5'
    );

    if (equipos.length < 5) {
      return res
        .status(400)
        .json({ ok: false, error: 'Se necesitan al menos 5 equipos' });
    }

    const [eq1, eq2, eq3, eq4, eq5] = equipos;

    if (modo === 'campal') {
      await pool.query(
        `INSERT INTO partidos (orden_partido, fase, id_equipo_1, id_equipo_2, estado)
         VALUES (1, 'Ronda 1A', ?, ?, 'Por jugar')`,
        [eq1.id_equipo, eq2.id_equipo]
      );

      await pool.query(
        `INSERT INTO partidos (orden_partido, fase, id_equipo_1, id_equipo_2, estado)
         VALUES (2, 'Ronda 1B', ?, ?, 'Por jugar')`,
        [eq3.id_equipo, eq4.id_equipo]
      );

      await pool.query(
        `INSERT INTO partidos (orden_partido, fase, id_equipo_1, id_equipo_2, estado)
         VALUES (3, 'Repechaje', NULL, NULL, 'Por jugar')`
      );

      await pool.query(
        `INSERT INTO partidos (orden_partido, fase, id_equipo_1, id_equipo_2, estado)
         VALUES (4, 'Retador', NULL, ?, 'Por jugar')`,
        [eq5.id_equipo]
      );

      await pool.query(
        `INSERT INTO partidos (orden_partido, fase, id_equipo_1, id_equipo_2, estado)
         VALUES (5, 'Final Ganadores', NULL, NULL, 'Por jugar')`
      );

      await pool.query(
        `INSERT INTO partidos (orden_partido, fase, id_equipo_1, id_equipo_2, estado)
         VALUES (6, 'Gran Final', NULL, NULL, 'Por jugar')`
      );

      return res.status(201).json({
        ok: true,
        message: 'Fixture campal (doble eliminacion) inicializado correctamente',
      });
    }

    await pool.query(
      `INSERT INTO partidos (orden_partido, fase, id_equipo_1, id_equipo_2, estado)
       VALUES (1, 'Ronda 1', ?, ?, 'Por jugar')`,
      [eq4.id_equipo, eq5.id_equipo]
    );

    await pool.query(
      `INSERT INTO partidos (orden_partido, fase, id_equipo_1, id_equipo_2, estado)
       VALUES (2, 'Cuartos', ?, NULL, 'Por jugar')`,
      [eq3.id_equipo]
    );

    await pool.query(
      `INSERT INTO partidos (orden_partido, fase, id_equipo_1, id_equipo_2, estado)
       VALUES (3, 'Semifinal', ?, NULL, 'Por jugar')`,
      [eq2.id_equipo]
    );

    await pool.query(
      `INSERT INTO partidos (orden_partido, fase, id_equipo_1, id_equipo_2, estado)
       VALUES (4, 'Final', ?, NULL, 'Por jugar')`,
      [eq1.id_equipo]
    );

    res.status(201).json({
      ok: true,
      message: 'Fixture escalonado inicializado correctamente',
    });
  } catch (error) {
    console.error('Error en inicializarFixture:', error.message);
    res
      .status(500)
      .json({ ok: false, error: 'Error al inicializar el fixture' });
  }
};

const actualizarPartido = async (req, res) => {
  try {
    const { id_partido } = req.params;
    const { goles_equipo_1, goles_equipo_2 } = req.body;

    const [rows] = await pool.query(
      'SELECT * FROM partidos WHERE id_partido = ?',
      [id_partido]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ ok: false, error: 'No se encontro el partido' });
    }

    const partido = rows[0];

    let id_ganador = null;
    let id_perdedor = null;
    if (goles_equipo_1 > goles_equipo_2) {
      id_ganador = partido.id_equipo_1;
      id_perdedor = partido.id_equipo_2;
    } else if (goles_equipo_2 > goles_equipo_1) {
      id_ganador = partido.id_equipo_2;
      id_perdedor = partido.id_equipo_1;
    } else {
      return res
        .status(400)
        .json({ ok: false, error: 'No puede haber empate en una eliminatoria' });
    }

    await pool.query(
      `UPDATE partidos
       SET goles_equipo_1 = ?, goles_equipo_2 = ?, id_ganador = ?, estado = 'Finalizado'
       WHERE id_partido = ?`,
      [goles_equipo_1, goles_equipo_2, id_ganador, id_partido]
    );

    const [allPartidos] = await pool.query(
      'SELECT * FROM partidos ORDER BY orden_partido ASC'
    );

    const isCampal = allPartidos.length === 6;

    if (isCampal) {
      const orden = partido.orden_partido;
      const avanceMap = {
        1: [
          { target: 5, field: 'id_equipo_1', value: id_ganador },
          { target: 3, field: 'id_equipo_1', value: id_perdedor },
        ],
        2: [
          { target: 5, field: 'id_equipo_2', value: id_ganador },
          { target: 3, field: 'id_equipo_2', value: id_perdedor },
        ],
        3: [
          { target: 4, field: 'id_equipo_1', value: id_ganador },
        ],
        4: [
          { target: 6, field: 'id_equipo_2', value: id_ganador },
        ],
        5: [
          { target: 6, field: 'id_equipo_1', value: id_ganador },
        ],
      };

      const actualizaciones = avanceMap[orden] || [];
      for (const u of actualizaciones) {
        await pool.query(
          `UPDATE partidos SET ${u.field} = ? WHERE orden_partido = ?`,
          [u.value, u.target]
        );
      }
    } else {
      const ordenSiguiente = partido.orden_partido + 1;
      await pool.query(
        `UPDATE partidos
         SET id_equipo_2 = ?
         WHERE orden_partido = ?`,
        [id_ganador, ordenSiguiente]
      );
    }

    res.json({
      ok: true,
      message: 'Partido finalizado y ganador ascendido',
      partidoId: id_partido,
      id_ganador,
    });
  } catch (error) {
    console.error('Error en actualizarPartido:', error.message);
    res
      .status(500)
      .json({ ok: false, error: 'Error al actualizar el partido' });
  }
};

const obtenerPartidos = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM partidos ORDER BY orden_partido ASC'
    );

    res.json({ ok: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error en obtenerPartidos:', error.message);
    res
      .status(500)
      .json({ ok: false, error: 'Error al obtener los partidos' });
  }
};

const limpiarPartido = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      'SELECT * FROM partidos WHERE id_partido = ?',
      [id]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ ok: false, error: 'No se encontro el partido' });
    }

    const partido = rows[0];

    await pool.query(
      `UPDATE partidos
       SET goles_equipo_1 = 0, goles_equipo_2 = 0, id_ganador = NULL, estado = 'Por jugar'
       WHERE id_partido = ?`,
      [id]
    );

    const [allPartidos] = await pool.query(
      'SELECT * FROM partidos ORDER BY orden_partido ASC'
    );

    const isCampal = allPartidos.length === 6;

    if (isCampal) {
      const orden = partido.orden_partido;
      const limpiezaMap = {
        1: [
          { target: 5, field: 'id_equipo_1' },
          { target: 3, field: 'id_equipo_1' },
        ],
        2: [
          { target: 5, field: 'id_equipo_2' },
          { target: 3, field: 'id_equipo_2' },
        ],
        3: [
          { target: 4, field: 'id_equipo_1' },
        ],
        4: [
          { target: 6, field: 'id_equipo_2' },
        ],
        5: [
          { target: 6, field: 'id_equipo_1' },
        ],
      };

      const limpiezas = limpiezaMap[orden] || [];
      for (const c of limpiezas) {
        await pool.query(
          `UPDATE partidos SET ${c.field} = NULL WHERE orden_partido = ?`,
          [c.target]
        );
      }
    } else {
      const ordenSiguiente = partido.orden_partido + 1;
      await pool.query(
        `UPDATE partidos SET id_equipo_2 = NULL WHERE orden_partido = ?`,
        [ordenSiguiente]
      );
    }

    res.json({
      ok: true,
      message: 'Partido limpiado y avance revertido',
    });
  } catch (error) {
    console.error('Error en limpiarPartido:', error.message);
    res
      .status(500)
      .json({ ok: false, error: 'Error al limpiar el partido' });
  }
};

const resetearFixture = async (req, res) => {
  try {
    await pool.query('DELETE FROM partidos');
    res.json({ ok: true, message: 'Fixture completamente reseteado' });
  } catch (error) {
    console.error('Error en resetearFixture:', error.message);
    res
      .status(500)
      .json({ ok: false, error: 'Error al resetear el fixture' });
  }
};

module.exports = { inicializarFixture, actualizarPartido, obtenerPartidos, limpiarPartido, resetearFixture };
