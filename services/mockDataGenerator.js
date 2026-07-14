const crypto = require('crypto');

const ASSAM_ORGANIZATIONS = [
  'Public Works Department (PWD) Assam',
  'Public Health Engineering Department (PHED) Assam',
  'Assam Power Distribution Company Limited (APDCL)',
  'Directorate of Agriculture Assam',
  'Guwahati Municipal Corporation (GMC)',
  'Water Resources Department Assam',
  'Assam State Disaster Management Authority'
];

const GEM_ORGANIZATIONS = [
  'Ministry of Defence, Indian Army',
  'Ministry of Railways, Northern Railway',
  'Bharat Heavy Electricals Limited (BHEL)',
  'Indian Institute of Technology Guwahati',
  'Oil and Natural Gas Corporation (ONGC)',
  'Assam University Silchar',
  'Employees State Insurance Corporation (ESIC)'
];

const TENDER_TITLES = {
  Works: [
    'Construction of RCC Bridge over River Brahmaputra at Location X',
    'Improvement and Widening of State Highway SH-12 (Guwahati to Tezpur)',
    'Construction of Multi-Storeyed Administrative Block at Assam Secretariat',
    'Renovation and Modernization of Government Hospital Buildings in Dibrugarh',
    'Drilling and Commissioning of Deep Tube Wells for Rural Water Supply Scheme',
    'Installation and Commissioning of 10MW Ground Mounted Solar Power Plant'
  ],
  Goods: [
    'Supply and Delivery of Medical Equipment and ICU Beds',
    'Procurement of Laptops and Desktops for Government Higher Secondary Schools',
    'Supply of Uniforms and Safety Boots for State Police Force',
    'Supply of High-Density Polyethylene (HDPE) Pipes for Jal Jeevan Mission',
    'Procurement of Scientific Lab Equipment for State Universities',
    'Supply of Office Furniture and Modular Workstations for New GMC Building'
  ],
  Services: [
    'Engagement of Security Agency for Secretariat Campus (1 Year)',
    'Hiring of Agency for IT Helpdesk Support and Facility Management Services',
    'Annual Maintenance Contract (AMC) of Central HVAC Systems',
    'Consultancy Services for Environmental Impact Assessment (EIA) of Highway Project',
    'Outsourcing of Housekeeping and Sanitation Services for Government Hospitals',
    'Third-Party Quality Monitoring Audit of State Highway Infrastructure Projects'
  ]
};

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMockTender(source) {
  const category = getRandomElement(['Works', 'Goods', 'Services']);
  const titlesList = TENDER_TITLES[category];
  const baseTitle = getRandomElement(titlesList);

  const value = getRandomRange(50000, 50000000);
  const emd = Math.round(value * 0.02);
  const fee = getRandomRange(500, 10000);

  const org = source === 'Assam Tenders'
    ? getRandomElement(ASSAM_ORGANIZATIONS)
    : getRandomElement(GEM_ORGANIZATIONS);
  const dept = source === 'Assam Tenders'
    ? 'State Procurement Cell'
    : 'Central Procurement Board';

  const now = new Date();
  const publishOffset = getRandomRange(-15, -1);
  const publishDate = new Date(now.getTime() + publishOffset * 24 * 60 * 60 * 1000);

  const submitStartOffset = publishOffset + getRandomRange(1, 3);
  const submitStartDate = new Date(now.getTime() + submitStartOffset * 24 * 60 * 60 * 1000);

  const submitEndOffset = submitStartOffset + getRandomRange(10, 30);
  const submitEndDate = new Date(now.getTime() + submitEndOffset * 24 * 60 * 60 * 1000);

  const openingOffset = submitEndOffset + getRandomRange(1, 3);
  const openingDate = new Date(now.getTime() + openingOffset * 24 * 60 * 60 * 1000);
  const idSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  const year = now.getFullYear();
  const tenderId = source === 'Assam Tenders'
    ? `ASSAM-${year}-${idSuffix}-${getRandomRange(100, 999)}`
    : `GEM-${year}-B-${getRandomRange(100000, 999999)}`;
  const refNo = source === 'Assam Tenders'
    ? `NIT/GMC/ENGG/${year}/${getRandomRange(10, 99)}`
    : `GEM/BID/${year}/R/${getRandomRange(10000, 99999)}`;

  return {
    tenderId,
    referenceNumber: refNo,
    title: `${baseTitle} - Phase ${getRandomRange(1, 5)}`,
    description: `Detailed description for: ${baseTitle}. The work must be executed in accordance with general conditions of contract and engineering guidelines. Eligible contractors are invited to submit competitive bids.`,
    organization: org,
    department: dept,
    category,
    estimatedValue: value,
    emd,
    tenderFee: fee,
    publishDate,
    bidSubmissionStartDate: submitStartDate,
    bidSubmissionEndDate: submitEndDate,
    bidOpeningDate: openingDate,
    documentUrls: [
      {
        title: 'Tender Notice (NIT)',
        url: source === 'Assam Tenders'
          ? `https://assamtenders.gov.in/tenders/notice_${idSuffix}.pdf`
          : `https://bidplus.gem.gov.in/showbiddocument/${idSuffix}.pdf`
      },
      {
        title: 'Tender BOQ (Bill of Quantities)',
        url: source === 'Assam Tenders'
          ? `https://assamtenders.gov.in/tenders/boq_${idSuffix}.xls`
          : `https://bidplus.gem.gov.in/showboqdocument/${idSuffix}.xls`
      }
    ],
    status: 'Active',
    source,
    rawScrapedData: {
      generatedAt: new Date(),
      hash: crypto.createHash('md5').update(tenderId).digest('hex')
    }
  };
}

module.exports = {
  generateMockTender
};
