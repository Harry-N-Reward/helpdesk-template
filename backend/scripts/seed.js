const { User, Ticket, sequelize } = require('../models');
const logger = require('../utils/logger');

const seedDatabase = async () => {
  try {
    logger.info('Starting database seeding...');
    
    // Clear existing data (be careful in production!)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ force: true });
      logger.info('Database cleared and recreated');
    }

    // Create users
    const users = await User.bulkCreate([
      {
        email: 'admin@company.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'it_admin',
        department: 'IT',
        phone: '+1234567890',
      },
      {
        email: 'ituser@company.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'ITSupport',
        role: 'it_user',
        department: 'IT',
        phone: '+1234567891',
      },
      {
        email: 'user1@company.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'end_user',
        department: 'Sales',
        phone: '+1234567892',
      },
      {
        email: 'user2@company.com',
        password: 'password123',
        firstName: 'Bob',
        lastName: 'Smith',
        role: 'end_user',
        department: 'Marketing',
        phone: '+1234567893',
      },
      {
        email: 'user3@company.com',
        password: 'password123',
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'end_user',
        department: 'HR',
        phone: '+1234567894',
      },
    ], {
      individualHooks: true, // This ensures password hashing works
    });

    logger.info(`Created ${users.length} users`);

    // Create sample tickets
    const tickets = await Ticket.bulkCreate([
      {
        title: 'Computer won\'t start',
        description: 'My computer doesn\'t turn on when I press the power button. I\'ve tried plugging it into different outlets but nothing happens. The power light doesn\'t come on at all.',
        category: 'hardware',
        priority: 'high',
        status: 'open',
        requesterId: users[2].id, // Jane Doe
      },
      {
        title: 'Cannot access email',
        description: 'I can\'t log into my email account. It keeps saying my password is incorrect, but I\'m sure it\'s right. I need access to my email for important client communications.',
        category: 'software',
        priority: 'medium',
        status: 'in_progress',
        requesterId: users[3].id, // Bob Smith
        assignedTo: users[1].id, // John ITSupport
      },
      {
        title: 'Printer not working',
        description: 'The office printer is showing an error message "Paper Jam" but I don\'t see any paper stuck. I\'ve tried turning it off and on again.',
        category: 'hardware',
        priority: 'low',
        status: 'open',
        requesterId: users[4].id, // Alice Johnson
      },
      {
        title: 'Software installation request',
        description: 'I need Adobe Photoshop installed on my workstation for the new marketing campaign. My manager has approved this request.',
        category: 'software',
        priority: 'medium',
        status: 'resolved',
        requesterId: users[3].id, // Bob Smith
        assignedTo: users[0].id, // Admin User
        resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        title: 'Network connectivity issues',
        description: 'My internet connection keeps dropping every few minutes. It\'s affecting my ability to work on cloud-based applications.',
        category: 'network',
        priority: 'high',
        status: 'in_progress',
        requesterId: users[2].id, // Jane Doe
        assignedTo: users[1].id, // John ITSupport
      },
      {
        title: 'Access to shared drive',
        description: 'I need access to the Finance shared drive to complete my monthly reports. I\'m getting an "Access Denied" error.',
        category: 'access',
        priority: 'medium',
        status: 'closed',
        requesterId: users[4].id, // Alice Johnson
        assignedTo: users[0].id, // Admin User
        resolvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        closedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        title: 'Monitor display issues',
        description: 'My second monitor is flickering and sometimes goes completely black. It\'s very distracting and hurting my productivity.',
        category: 'hardware',
        priority: 'medium',
        status: 'open',
        requesterId: users[3].id, // Bob Smith
      },
      {
        title: 'Password reset for CRM system',
        description: 'I forgot my password for the CRM system and the reset link isn\'t working. I urgently need access to update client information.',
        category: 'access',
        priority: 'high',
        status: 'open',
        requesterId: users[2].id, // Jane Doe
      },
    ]);

    logger.info(`Created ${tickets.length} tickets`);

    logger.info('Database seeding completed successfully!');
    logger.info('\nDefault users created:');
    logger.info('IT Admin: admin@company.com / password123');
    logger.info('IT User: ituser@company.com / password123');
    logger.info('End User 1: user1@company.com / password123');
    logger.info('End User 2: user2@company.com / password123');
    logger.info('End User 3: user3@company.com / password123');

    process.exit(0);
  } catch (error) {
    logger.error('Database seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
