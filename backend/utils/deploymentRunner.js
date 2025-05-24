const Docker = require('dockerode');
const git = require('git-clone');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { Deployment } = require('../models');

const docker = new Docker();
const PROJECTS_DIR = process.env.PROJECTS_DIR || '/tmp/bera-tech-projects';

// Language-specific build configurations
const BUILD_CONFIGS = {
  node: {
    dockerfile: `FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]`,
    port: 3000
  },
  python: {
    dockerfile: `FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]`,
    port: 8000
  },
  static: {
    dockerfile: `FROM nginx:alpine
COPY . /usr/share/nginx/html`,
    port: 80
  }
};

async function runDeployment(project, deployment) {
  try {
    const projectDir = path.join(PROJECTS_DIR, project.id);
    const repoDir = path.join(projectDir, 'repo');
    
    // Ensure projects directory exists
    if (!fs.existsSync(PROJECTS_DIR)) fs.mkdirSync(PROJECTS_DIR);
    if (!fs.existsSync(projectDir)) fs.mkdirSync(projectDir);
    
    // Update deployment status
    await deployment.update({ status: 'building', logs: 'Cloning repository...' });
    
    // Clone repository
    await new Promise((resolve, reject) => {
      git(project.repoUrl, repoDir, { checkout: project.branch }, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Create Dockerfile if not exists
    const dockerfilePath = path.join(repoDir, 'Dockerfile');
    if (!fs.existsSync(dockerfilePath)) {
      const config = BUILD_CONFIGS[project.language] || BUILD_CONFIGS.node;
      fs.writeFileSync(dockerfilePath, config.dockerfile);
    }
    
    // Build Docker image
    await deployment.update({ status: 'building', logs: 'Building Docker image...' });
    const imageName = `bera-tech-${project.id}:${deployment.id}`;
    const stream = await docker.buildImage({
      context: repoDir,
      src: ['.']
    }, { t: imageName });
    
    await new Promise((resolve, reject) => {
      docker.modem.followProgress(stream, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });
    
    // Run container
    await deployment.update({ status: 'deploying', logs: 'Starting container...' });
    const port = BUILD_CONFIGS[project.language]?.port || 3000;
    const hostPort = 40000 + Math.floor(Math.random() * 10000);
    
    const container = await docker.createContainer({
      Image: imageName,
      name: `bera-tech-${project.id}-${deployment.id}`,
      ExposedPorts: { [`${port}/tcp`]: {} },
      HostConfig: {
        PortBindings: { [`${port}/tcp`]: [{ HostPort: `${hostPort}` }] }
    });
    
    await container.start();
    
    // Update deployment with URL
    const url = process.env.BASE_URL 
      ? `${process.env.BASE_URL}/proxy/${hostPort}` 
      : `http://localhost:${hostPort}`;
    
    await deployment.update({
      status: 'live',
      url,
      port: hostPort,
      logs: 'Deployment successful!'
    });
    
    // Update project status
    await project.update({ status: 'active' });
    
  } catch (error) {
    console.error('Deployment error:', error);
    await deployment.update({
      status: 'failed',
      logs: error.message
    });
    await project.update({ status: 'error' });
  }
}

module.exports = { runDeployment };
