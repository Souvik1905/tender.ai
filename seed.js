require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Tender = require('./models/Tender');
const Alert = require('./models/Alert');
const { generateMockTender } = require('./services/mockDataGenerator');
const logger = require('./utils/logger');
async function seedDatabase() {
  try {
    logger.info('Database Seeder: Starting seed process...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Database Seeder: MongoDB Connected.');
    // Clear existing data
    logger.info('Database Seeder: Cleaning existing collections...');
    await User.deleteMany({});
    await Tender.deleteMany({});
    await Alert.deleteMany({});
    // Create Test Admin User
    logger.info('Database Seeder: Creating admin user...');
    const adminUser = await User.create({
      name: 'Rohan Das',
      email: 'rohan@tender.ai',
      password: 'password123',
      role: 'admin',
      emailAlertsEnabled: true
    });
    logger.info(`Database Seeder: Test user created: ${adminUser.email} / password123`);
    // Create a Custom Alert for the user
    logger.info('Database Seeder: Creating custom alert preferences...');
    const alert1 = await Alert.create({
      user: adminUser._id,
      name: 'Brahmaputra construction alerts',
      keywords: ['Brahmaputra', 'Bridge', 'Road', 'Highway'],
      minVal: 5000000, // 50 Lakhs INR
      categories: ['Works'],
      sources: ['Assam Tenders']
    });
    const alert2 = await Alert.create({
      user: adminUser._id,
      name: 'School computer hardware alerts',
      keywords: ['Laptops', 'Desktops', 'Computer', 'IT'],
      categories: ['Goods'],
      sources: ['GeM']
    });
    logger.info('Database Seeder: Alerts registered.');
    // Generate and Insert Tenders
    logger.info('Database Seeder: Seeding tenders...');
    const mockTenders = [];
    
    // Seed 10 Assam Tenders
    for (let i = 0; i < 10; i++) {
      mockTenders.push(generateMockTender('Assam Tenders'));
    }
    
    // Seed 10 GeM Tenders
    for (let i = 0; i < 10; i++) {
      mockTenders.push(generateMockTender('GeM'));
    }
    // Insert to DB
    const insertedTenders = await Tender.insertMany(mockTenders);
    logger.info(`Database Seeder: Successfully seeded ${insertedTenders.length} tenders.`);
    // Add matching triggers logic check
    logger.info('Database Seeder: Testing alert notification matching...');
    // Log if any seeded tender matches user alerts
    for (const alert of [alert1, alert2]) {
      const matches = insertedTenders.filter(t => {
        if (alert.sources.length > 0 && !alert.sources.includes(t.source)) return false;
        if (alert.categories.length > 0 && !alert.categories.includes(t.category)) return false;
        if (alert.minVal && t.estimatedValue < alert.minVal) return false;
        
        const content = `${t.title} ${t.description}`.toLowerCase();
        const kwMatch = alert.keywords.some(kw => content.includes(kw.toLowerCase()));
        return kwMatch;
      });
      logger.info(`Alert "${alert.name}" matched ${matches.length} seeded tenders.`);
    }
    logger.info('Database Seeder: Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Database Seeder: Seeding failed: %O', error);
    process.exit(1);
  }
}
seedDatabase();
