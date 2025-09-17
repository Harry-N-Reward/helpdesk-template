const { sequelize } = require('../models');

// Set test environment
process.env.NODE_ENV = 'test';

// Setup and teardown for tests
beforeAll(async () => {
  // Connect to test database
  await sequelize.authenticate();
  
  // Sync database (create tables)
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  // Close database connection
  await sequelize.close();
});

// Clear database between tests
beforeEach(async () => {
  // Truncate all tables
  await sequelize.truncate({ cascade: true });
});
