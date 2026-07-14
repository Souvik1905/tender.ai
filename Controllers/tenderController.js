const Tender = require('../models/Tender');
const { runCrawlJob } = require('../services/scheduler');
const logger = require('../utils/logger');

const getTenders = async (req, res, next) => {
  try {
    const {
      search,
      source,
      category,
      minValue,
      maxValue,
      closingBefore,
      closingAfter,
      status,
      sort,
      page = 1,
      limit = 10
    } = req.query;

    const mongoQuery = {};

    if (search) {
      mongoQuery.$text = { $search: search };
    }
    if (source) {
      mongoQuery.source = source;
    }
    if (category) {
      mongoQuery.category = category;
    }
    if (status) {
      mongoQuery.status = status;
    } else {
      mongoQuery.status = 'Active';
    }
    if (minValue || maxValue) {
      mongoQuery.estimatedValue = {};
      if (minValue) mongoQuery.estimatedValue.$gte = parseFloat(minValue);
      if (maxValue) mongoQuery.estimatedValue.$lte = parseFloat(maxValue);
    }
    if (closingBefore || closingAfter) {
      mongoQuery.bidSubmissionEndDate = {};
      if (closingBefore) mongoQuery.bidSubmissionEndDate.$lte = new Date(closingBefore);
      if (closingAfter) mongoQuery.bidSubmissionEndDate.$gte = new Date(closingAfter);
    }

    let sortOption = { publishDate: -1 };
    if (sort) {
      const parts = sort.split(':');
      if (parts.length === 2) {
        const field = parts[0];
        const order = parts[1] === 'desc' ? -1 : 1;
        if (field === 'relevance' && search) {
          sortOption = { score: { $meta: 'textScore' } };
        } else {
          sortOption = { [field]: order };
        }
      }
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    const projection = search ? { score: { $meta: 'textScore' } } : {};
    const tenders = await Tender.find(mongoQuery, projection)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);
    const total = await Tender.countDocuments(mongoQuery);

    res.json({
      success: true,
      count: tenders.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      },
      data: tenders
    });
  } catch (error) {
    next(error);
  }
};

const getTenderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let tender = await Tender.findOne({ tenderId: id });
    if (!tender && id.match(/^[0-9a-fA-F]{24}$/)) {
      tender = await Tender.findById(id);
    }
    if (!tender) {
      res.status(404);
      throw new Error(`Tender not found with key: ${id}`);
    }
    res.json({
      success: true,
      data: tender
    });
  } catch (error) {
    next(error);
  }
};

const triggerCrawl = async (req, res, next) => {
  try {
    logger.info(`On-demand crawl triggered by admin user: ${req.user.email}`);
    const crawlSummary = await runCrawlJob();

    if (crawlSummary.success) {
      res.json({
        success: true,
        message: 'On-demand crawl completed successfully.',
        summary: crawlSummary
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'On-demand crawl job failed.',
        error: crawlSummary.error
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTenders,
  getTenderById,
  triggerCrawl
};
