export type Member = {
  id: string;
  tgnId: string;
  name: string;
  role: 'Mentor' | 'Mentee' | 'Affiliate';
  location: string;
  country: string;
  sector: string;
  isVerified: boolean;
  profile: string;
  imageId: string;
};

export const members: Member[] = [
  {
    id: '1',
    tgnId: 'TGN-0001',
    name: 'Sarah Chen',
    role: 'Mentor',
    location: 'San Francisco, USA',
    country: 'USA',
    sector: 'Technology',
    isVerified: true,
    imageId: 'user-1',
    profile: "Seasoned product manager with 10+ years of experience in SaaS and mobile apps. Passionate about helping early-stage founders navigate product-market fit. Expertise in Agile methodologies, user research, and data-driven decision making."
  },
  {
    id: '2',
    tgnId: 'TGN-0002',
    name: 'David Lee',
    role: 'Mentee',
    location: 'Seoul, South Korea',
    country: 'South Korea',
    sector: 'Finance',
    isVerified: true,
    imageId: 'user-2',
    profile: "Aspiring FinTech entrepreneur, currently developing a mobile payment solution for emerging markets. Seeking guidance on fundraising, financial modeling, and scaling a business. Background in software engineering with a keen interest in blockchain technology."
  },
  {
    id: '3',
    tgnId: 'TGN-0003',
    name: 'Maria Garcia',
    role: 'Mentor',
    location: 'Madrid, Spain',
    country: 'Spain',
    sector: 'Healthcare',
    isVerified: true,
    imageId: 'user-3',
    profile: "Healthcare executive with expertise in digital health and hospital management. Co-founded two successful HealthTech startups. Enjoys mentoring professionals on leadership, strategic planning, and navigating regulatory landscapes."
  },
  {
    id: '4',
    tgnId: 'TGN-0004',
    name: 'Kenji Tanaka',
    role: 'Mentor',
    location: 'Tokyo, Japan',
    country: 'Japan',
    sector: 'Technology',
    isVerified: false,
    imageId: 'user-4',
    profile: "Venture Capitalist focused on deep tech and AI. Sits on the board of several high-growth startups. Offers mentorship on pitch deck refinement, venture fundraising, and corporate governance."
  },
  {
    id: '5',
    tgnId: 'TGN-0005',
    name: 'Chloe Kim',
    role: 'Mentee',
    location: 'Toronto, Canada',
    country: 'Canada',
    sector: 'Technology',
    isVerified: true,
    imageId: 'user-5',
    profile: "Recent computer science graduate with a passion for artificial intelligence and machine learning. Looking for a mentor to guide career path choices, from big tech to startups, and to gain practical project experience."
  },
  {
    id: '6',
    tgnId: 'TGN-0006',
    name: 'Alex Rodriguez',
    role: 'Affiliate',
    location: 'Mexico City, Mexico',
    country: 'Mexico',
    sector: 'Marketing',
    isVerified: true,
    imageId: 'user-6',
    profile: "Digital marketing consultant specializing in growth hacking for e-commerce brands. An active networker and affiliate partner, promoting valuable educational resources within their community."
  },
  {
    id: '7',
    tgnId: 'TGN-0007',
    name: 'Emily White',
    role: 'Mentor',
    location: 'London, UK',
    country: 'UK',
    sector: 'Finance',
    isVerified: true,
    imageId: 'user-7',
    profile: "Investment banker with 15 years of experience in M&A and capital markets. Provides mentorship on financial analysis, valuation, and career progression in the competitive finance industry."
  },
  {
    id: '8',
    tgnId: 'TGN-0008',
    name: 'Michael Brown',
    role: 'Mentee',
    location: 'Lagos, Nigeria',
    country: 'Nigeria',
    sector: 'Healthcare',
    isVerified: false,
    imageId: 'user-8',
    profile: "Young doctor building a telehealth platform to serve rural communities in Nigeria. Seeking mentorship on business development, securing partnerships with hospitals, and leveraging technology to improve healthcare access."
  },
];

export const sectors = [
    'Technology',
    'Finance',
    'Healthcare',
    'Marketing',
    'Education',
    'E-commerce',
    'Creative Industries',
    'Social Impact',
    'Legal',
    'Manufacturing',
    'Hospitality',
    'Real Estate',
    'Energy',
    'Telecommunications',
    'Transportation',
    'Agriculture',
    'Biotechnology',
    'Pharmaceuticals',
    'Retail',
    'Media & Entertainment',
    'Government',
    'Non-Profit',
    'Consulting',
    'Human Resources',
    'Sales',
    'Automotive',
    'Aerospace',
    'Construction',
    'Fashion',
    'Food & Beverage'
];

export const countries = [
  'USA',
  'South Korea',
  'Spain',
  'Japan',
  'Canada',
  'Mexico',
  'UK',
  'Nigeria',
];


export type Product = {
  id: string;
  title: string;
  author: string;
  price: number;
  type: 'Book' | 'Course' | 'Tool';
  imageId: string;
};

export const products: Product[] = [
  {
    id: '1',
    title: 'The Art of Mentorship',
    author: 'Sarah Chen',
    price: 29.99,
    type: 'Book',
    imageId: 'product-1',
  },
  {
    id: '2',
    title: 'Digital Marketing Pro',
    author: 'Alex Rodriguez',
    price: 199.99,
    type: 'Course',
    imageId: 'product-2',
  },
  {
    id: '3',
    title: 'Startup Scaling',
    author: 'Kenji Tanaka',
    price: 49.99,
    type: 'Book',
    imageId: 'product-3',
  },
  {
    id: '4',
    title: 'Leadership Essentials',
    author: 'Maria Garcia',
    price: 249.99,
    type: 'Course',
    imageId: 'product-4',
  },
];


export const continents = [
    "Africa",
    "Antarctica",
    "Asia",
    "Europe",
    "North America",
    "Oceania",
    "South America"
];
