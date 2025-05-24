const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Deployment = sequelize.define('Deployment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    status: {
      type: DataTypes.ENUM('queued', 'building', 'deploying', 'live', 'failed'),
      defaultValue: 'queued'
    },
    logs: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    port: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    timestamps: true
  });

  Deployment.associate = (models) => {
    Deployment.belongsTo(models.Project, { foreignKey: 'projectId' });
  };

  return Deployment;
};
