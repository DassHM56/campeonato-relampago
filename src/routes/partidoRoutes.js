const express = require('express');
const router = express.Router();
const {
  inicializarFixture,
  actualizarPartido,
  obtenerPartidos,
  limpiarPartido,
  resetearFixture,
} = require('../controllers/partidoController');

router.delete('/reset', resetearFixture);
router.post('/inicializar', inicializarFixture);
router.put('/limpiar/:id', limpiarPartido);
router.put('/:id_partido', actualizarPartido);
router.get('/', obtenerPartidos);

module.exports = router;
