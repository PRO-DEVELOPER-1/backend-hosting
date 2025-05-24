const { Project, Deployment } = require('../models');
const { runDeployment } = require('../utils/deploymentRunner');

exports.deployProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.projectId, userId: req.user.id }
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const deployment = await Deployment.create({
      projectId: project.id,
      status: 'queued'
    });
    
    // Run deployment in background
    runDeployment(project, deployment);
    
    res.json(deployment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getDeployments = async (req, res) => {
  try {
    const deployments = await Deployment.findAll({
      where: { projectId: req.params.projectId },
      include: [Project],
      order: [['createdAt', 'DESC']]
    });
    res.json(deployments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
