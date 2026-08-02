const express = require('express');
const router = express.Router();
const {
  registrarJugador,
  obtenerJugadoresPorEquipo,
  buscarPorDNI,
} = require('../controllers/jugadorController');

router.post('/', registrarJugador);
router.get('/buscar/:dni', buscarPorDNI);
router.get('/equipo/:id_equipo', obtenerJugadoresPorEquipo);

module.exports = router;
