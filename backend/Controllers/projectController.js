const { Project, Deployment } = require('../models');

exports.createProject = async (req, res) => {
  try {
    const { name, repoUrl, branch, language } = req.body;
    const project = await Project.create({
      name,
      repoUrl,
      branch,
      language,
      userId: req.user.id
    });
    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Deployment,
        order: [['createdAt', 'DESC']],
        limit: 1
      }]
    });
    res.json(projects);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{
        model: Deployment,
        order: [['createdAt', 'DESC']]
      }]
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
