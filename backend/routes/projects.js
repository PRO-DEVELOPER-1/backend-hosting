const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { 
  createProject, 
  getProjects, 
  getProject 
} = require('../controllers/projectController');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProject);

module.exports = router;
