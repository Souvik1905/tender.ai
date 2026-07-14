require('dotenv').config();
const mongoose = require('mongoose');
const { runCrawlJob } = require('./services/scheduler');
const logger = require('./utils/logger');
async function triggerScrape() {
  try {
    logger.info('Scrape Exec: Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    logger.info('Scrape Exec: Invoking tender crawler pipelines...');
    const result = await runCrawlJob();
    
    if (result.success) {
      logger.info(`Scrape Exec: Success! Execution completed in ${result.duration}s.`);
      logger.info(`Scrape Exec: Assam Tenders: ${result.assamCount}, GeM Bids: ${result.gemCount}`);
      process.exit(0);
    } else {
      logger.error(`Scrape Exec: Crawling failed: ${result.error}`);
      process.exit(1);
    }
  } catch (error) {
    logger.error('Scrape Exec: Execution exception: %O', error);
    process.exit(1);
  }
}
triggerScrape();
