const { sequelize } = require('../models');
const logger = require('../utils/logger');

const migrate = async () => {
  try {
    logger.info('Starting database migration...');
    
    // Sync all models (creates tables if they don't exist)
    await sequelize.sync({ force: false });
    
    logger.info('Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Database migration failed:', error);
    process.exit(1);
  }
};

migrate();
