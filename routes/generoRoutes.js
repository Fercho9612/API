const { Router } = require('express');
const { getGeneros, createGenero, updateGenero, deleteGenero } = require('../controllers/generoController');

const router = Router();

router.get('/', getGeneros);         // GET /api/generos
router.post('/', createGenero);     // POST /api/generos
router.put('/:id', updateGenero);   // PUT /api/generos/:id
router.delete('/:id', deleteGenero); // DELETE /api/generos/:id

module.exports = router;