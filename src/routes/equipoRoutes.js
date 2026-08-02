const express = require('express');
const router = express.Router();
const {
  registrarEquipo,
  obtenerEquipos,
  eliminarEquipo,
} = require('../controllers/equipoController');

router.post('/', registrarEquipo);
router.get('/', obtenerEquipos);
router.delete('/:id', eliminarEquipo);

module.exports = router;
