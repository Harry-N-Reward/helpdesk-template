const { sequelize } = require('../models');
const logger = require('../utils/logger');

const resetDatabase = async () => {
  try {
    logger.info('Resetting database...');
    
    // Drop all tables and recreate them
    await sequelize.sync({ force: true });
    
    logger.info('Database reset completed successfully!');
    logger.info('All tables have been dropped and recreated.');
    logger.info('Run "npm run seed" to populate with sample data.');
    
    process.exit(0);
  } catch (error) {
    logger.error('Database reset failed:', error);
    process.exit(1);
  }
};

resetDatabase();
