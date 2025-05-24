require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('backend/models');
const authRoutes = require('backend/routes/auth');
const projectRoutes = require('backend/routes/projects');
const deploymentRoutes = require('backend/routes/deployments');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Test DB connection
sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection error:', err));

// Sync models
sequelize.sync({ alter: true })
  .then(() => console.log('Models synced'))
  .catch(err => console.error('Model sync error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/deployments', deploymentRoutes);

// Health check
app.get('/health', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bera Tech Backend running on port ${PORT}`);
});
