const Alert = require('../models/Alert');
const logger = require('../utils/logger');

async function processNewTenders(tenders) {
  if (!tenders || tenders.length === 0) return;
  logger.info(`Notification Service: Matching ${tenders.length} new tenders against user alerts...`);
  try {
    const activeAlerts = await Alert.find().populate('user');
    logger.info(`Found ${activeAlerts.length} active alerts in database.`);
    for (const alert of activeAlerts) {
      if (!alert.user || !alert.user.emailAlertsEnabled) continue;
      const matchingTenders = [];
      for (const tender of tenders) {
        if (alert.sources && alert.sources.length > 0 && !alert.sources.includes(tender.source)) continue;
        if (alert.categories && alert.categories.length > 0 && !alert.categories.includes(tender.category)) continue;
        if (alert.minVal && tender.estimatedValue < alert.minVal) continue;
        if (alert.maxVal && tender.estimatedValue > alert.maxVal) continue;

        if (alert.keywords && alert.keywords.length > 0) {
          const contentToSearch = `${tender.title} ${tender.description} ${tender.organization}`.toLowerCase();
          const keywordMatched = alert.keywords.some((kw) => contentToSearch.includes(kw.toLowerCase()));
          if (!keywordMatched) continue;
        }

        matchingTenders.push(tender);
      }

      if (matchingTenders.length > 0) {
        logger.info(`Alert Alert! "${alert.name}" triggered for user ${alert.user.email} with ${matchingTenders.length} tenders.`);
        await sendSimulatedEmail(alert.user, alert.name, matchingTenders);
        alert.lastTriggered = new Date();
        await alert.save();
      }
    }
  } catch (error) {
    logger.error('Error processing notifications for tenders: %O', error);
  }
}

async function sendSimulatedEmail(user, alertName, tenders) {
  const emailBody = `
=========================================
EMAIL DISPATCH SIMULATION
To: ${user.name} (${user.email})
Subject: Tender.ai Alert: New tenders matching your filter "${alertName}"
-----------------------------------------
Hello ${user.name},
The following new tenders matching your alert settings have been crawled:
${tenders.map((t) => `- [${t.source}] ${t.title} (Value: INR ${t.estimatedValue})`).join('\n')}
Log in to your Tender.ai dashboard to view more details.
Best,
Tender.ai Automation Team
=========================================
  `;
  logger.info(emailBody);
}

module.exports = {
  processNewTenders
};
