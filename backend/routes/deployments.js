const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { 
  deployProject, 
  getDeployments 
} = require('../controllers/deploymentController');

const router = express.Router();

router.use(authMiddleware);

router.post('/:projectId/deploy', deployProject);
router.get('/:projectId', getDeployments);

module.exports = router;
