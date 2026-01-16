import type { Member, Product, Program, ChatConversation, Event, Wallet, Transaction, SavedCard, Cause } from './types';

export const sectors = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
    'Retail', 'Real Estate', 'Agriculture', 'Energy', 'Media',
    'Non-Profit', 'Government'
].map((name, i) => ({ id: `sec-${i}`, name }));

export const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo, Democratic Republic of the", "Congo, Republic of the", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe"
];


export const regions = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", 
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", 
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", 
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", 
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

export const globalRegions = [
  { name: "Africa", members: 12500, hubs: 45 },
  { name: "North America", members: 8200, hubs: 32 },
  { name: "Europe", members: 6800, hubs: 28 },
  { name: "Asia Pacific", members: 9400, hubs: 38 },
  { name: "Latin America", members: 5600, hubs: 22 },
];


export const products: Product[] = [
  {
    id: '1',
    title: 'The Art of Mentorship',
    price: 29.99,
    type: 'Book',
    imageId: 'product-1',
    sellerMemberId: 'mock-seller-1',
    sellerName: 'Sarah Chen',
    sellerImageId: 'user-1',
    approvalStatus: 'approved',
    description: 'A book about mentorship.',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Digital Marketing Pro',
    price: 199.99,
    type: 'Course',
    imageId: 'product-2',
    sellerMemberId: 'mock-seller-2',
    sellerName: 'Alex Rodriguez',
    sellerImageId: 'user-6',
    approvalStatus: 'approved',
    description: 'A course on digital marketing.',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Startup Scaling',
    price: 49.99,
    type: 'Book',
    imageId: 'product-3',
    sellerMemberId: 'mock-seller-3',
    sellerName: 'Kenji Tanaka',
    sellerImageId: 'user-4',
    approvalStatus: 'approved',
    description: 'A book about scaling startups.',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Leadership Essentials',
    price: 249.99,
    type: 'Course',
    imageId: 'product-4',
    sellerMemberId: 'mock-seller-4',
    sellerName: 'Maria Garcia',
    sellerImageId: 'user-3',
    approvalStatus: 'approved',
    description: 'A course on leadership.',
    createdAt: new Date().toISOString(),
  },
];

export const events: Event[] = [
  {
    id: 'evt1',
    name: 'Global Tech Summit 2026',
    description: 'A summit for tech leaders and innovators.',
    startDate: '2026-03-10T09:00:00Z',
    endDate: '2026-03-12T17:00:00Z',
    location: 'Virtual',
    price: 499,
    type: 'Conference',
  },
  {
    id: 'evt2',
    name: 'Financial Inclusion Forum - Africa',
    description: 'Discussing the future of finance in Africa.',
    startDate: '2025-11-05T10:00:00Z',
    endDate: '2025-11-05T16:00:00Z',
    location: 'Lagos, Nigeria',
    price: 150,
    type: 'Conference',
  },
  {
    id: 'evt3',
    name: 'Intro to AI Mentorship Webinar',
    description: 'A free webinar on how to get started with AI.',
    startDate: '2025-09-20T14:00:00Z',
    endDate: '2025-09-20T15:00:00Z',
    location: 'Online',
    price: 0,
    type: 'Webinar',
  }
];

export const continents = [
    "Africa",
    "Asia",
    "Europe",
    "North America",
    "South America",
    "Oceania"
];

export const roles = [
  { id: "mentee", title: "Mentee", description: "Learn and receive mentorship.", icon: "🎓" },
  { id: "mentor-candidate", title: "Mentor Candidate", description: "Begin the journey to become a certified mentor.", icon: "🌱" },
  { id: "associate-mentor", title: "Associate (High-Pedigree Mentor)", description: "Apply for verification as an experienced mentor.", icon: "✨" },
  { id: "collaborator", title: "Collaborator", description: "Support TGN programs and projects.", icon: "🤝" },
  { id: "sponsor", title: "Sponsor", description: "Fund or partner with TGN initiatives.", icon: "💎" },
  { id: "country-manager", title: "Country Manager", description: "Coordinate regional network growth.", icon: "🌍" },
  { id: "volunteer", title: "Volunteer", description: "Support community operations and events.", icon: "❤️" },
  { id: "media", title: "Media", description: "Share our impact and stories with the world.", icon: "📢" },
];

export const goals = [
  "Find a mentor", "Become a mentor", "Grow my network", 
  "Learn new skills", "Start a business", "Career transition",
  "Give back to community", "Find collaborators"
];

export const badgeLevels = ["All Levels", "★ 1", "★ 2", "★ 3", "★ 4", "★ 5", "★ 6", "★ 7"];

export const mentorTypes = ["All Types", "Associate Mentor", "Certified Mentor", "Executive Mentor"];

export const userWallet: Wallet = {
    memberId: 'Leonardo', // Corresponds to Chloe Kim
    currency: 'USD',
    balance: 81910.00,
};

export const transactions: Transaction[] = [
  {
    id: 'txn1',
    type: 'commission',
    status: 'completed',
    amount: 15.00,
    currency: 'USD',
    description: 'Referral commission from James Chen',
    createdAt: '2024-07-20T10:00:00Z',
  },
  {
    id: 'txn2',
    type: 'commission',
    status: 'completed',
    amount: 25.00,
    currency: 'USD',
    description: 'Commission from "Leadership Essentials" sale',
    createdAt: '2024-07-18T14:30:00Z',
  },
  {
    id: 'txn3',
    type: 'withdrawal',
    status: 'pending',
    amount: -50.00,
    currency: 'USD',
    description: 'Withdrawal to bank account',
    createdAt: '2024-07-15T09:00:00Z',
  },
    {
    id: 'txn4',
    type: 'deposit',
    status: 'completed',
    amount: 100.00,
    currency: 'USD',
    description: 'Initial wallet funding',
    createdAt: '2024-07-01T12:00:00Z',
    },
     {
    id: 'txn5',
    type: 'purchase',
    status: 'completed',
    amount: -29.99,
    currency: 'USD',
    description: 'Purchase: "The Art of Mentorship" Book',
    createdAt: '2024-07-21T11:00:00Z',
  },
];

export const savedCards: SavedCard[] = [
    {
        id: 'card1',
        brand: 'Visa',
        last4: '1890',
        expiryMonth: '05',
        expiryYear: '2026',
        isDefault: true,
    },
    {
        id: 'card2',
        brand: 'Mastercard',
        last4: '5555',
        expiryMonth: '08',
        expiryYear: '2028',
        isDefault: false,
    },
];

export const chartData = [
  { name: '3 July', amount: 45.00 },
  { name: '4 July', amount: 48.00 },
  { name: '5 July', amount: 40.00 },
  { name: '6 July', amount: 55.00 },
  { name: '7 July', amount: 58.75 },
  { name: '8 July', amount: 52.00 },
  { name: '9 July', amount: 50.00 },
];

export const causes: Cause[] = [
    {
        id: 'cause1',
        creatorMemberId: '12',
        creatorName: 'David Okonkwo',
        creatorImageId: 'default-male-avatar',
        title: 'Support Young Farmers in Kenya',
        description: 'Providing seeds and tools for young farmers in rural Kenya to start their own sustainable farms.',
        goalAmount: 5000,
        currentAmount: 1250,
        status: 'approved',
        createdAt: '2024-07-15T09:00:00Z',
    },
    {
        id: 'cause2',
        creatorMemberId: '13',
        creatorName: 'Sarah Williams',
        creatorImageId: 'default-female-avatar',
        title: 'Digital Literacy for Children in the UK',
        description: 'Funding coding bootcamps for underprivileged children to bridge the digital divide.',
        goalAmount: 10000,
        currentAmount: 8500,
        status: 'approved',
        createdAt: '2024-06-20T11:00:00Z',
    },
    {
        id: 'cause3',
        creatorMemberId: '11',
        creatorName: 'Maria Santos',
        creatorImageId: 'default-female-avatar',
        title: 'Mobile Health Clinic for Amazonian Villages',
        description: 'Help us purchase a boat and medical supplies to create a mobile clinic that can reach remote villages along the Amazon River.',
        goalAmount: 25000,
        currentAmount: 2500,
        status: 'pending',
        createdAt: '2024-07-22T15:00:00Z',
    },
];
