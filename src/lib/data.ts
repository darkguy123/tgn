import type { Member, Product, Program, Story, ChatConversation } from './types';

export const members: Member[] = [
    { id: '9', name: "Dr. Amara Obi", role: "Executive Mentor", country: "Nigeria", sector: "Technology", badge: 7, connections: 234, tgnId: 'TGN-0009', location: 'Lagos, Nigeria', isVerified: true, profile: 'Executive mentor specializing in tech leadership.', imageId: 'user-1', joinDate: 'May 2022', bannerImageId: 'profile-banner-1' },
    { id: '10', name: "James Chen", role: "Certified Mentor", country: "United States", sector: "Finance", badge: 5, connections: 156, tgnId: 'TGN-0010', location: 'New York, USA', isVerified: true, profile: 'Certified mentor with a background in investment banking.', imageId: 'default-male-avatar', joinDate: 'June 2023', bannerImageId: 'profile-banner-2' },
    { id: '11', name: "Maria Santos", role: "Mentee", country: "Brazil", sector: "Healthcare", badge: 3, connections: 45, tgnId: 'TGN-0011', location: 'São Paulo, Brazil', isVerified: false, profile: 'Healthcare professional seeking mentorship.', imageId: 'user-3', joinDate: 'Jan 2024', bannerImageId: 'profile-banner-default' },
    { id: '12', name: "David Okonkwo", role: "Associate Mentor", country: "Kenya", sector: "Agriculture", badge: 4, connections: 89, tgnId: 'TGN-0012', location: 'Nairobi, Kenya', isVerified: true, profile: 'Associate mentor in the agriculture sector.', imageId: 'default-male-avatar', joinDate: 'Feb 2023', bannerImageId: 'profile-banner-default' },
    { id: '13', name: "Sarah Williams", role: "Certified Mentor", country: "United Kingdom", sector: "Education", badge: 6, connections: 178, tgnId: 'TGN-0013', location: 'London, UK', isVerified: true, profile: 'Certified mentor in the education technology space.', imageId: 'user-5', joinDate: 'Sep 2022', bannerImageId: 'profile-banner-default' },
    { id: '14', name: "Raj Patel", role: "Mentee", country: "India", sector: "Technology", badge: 2, connections: 32, tgnId: 'TGN-0014', location: 'Bangalore, India', isVerified: false, profile: 'Tech mentee looking for guidance.', imageId: 'default-male-avatar', joinDate: 'Mar 2024', bannerImageId: 'profile-banner-1' },
    { id: '15', name: "Elena Rodriguez", role: "Executive Mentor", country: "United States", sector: "Energy", badge: 7, connections: 312, tgnId: 'TGN-0015', location: 'Houston, USA', isVerified: true, profile: 'Executive in the energy sector.', imageId: 'user-7', joinDate: 'Apr 2021', bannerImageId: 'profile-banner-default' },
    { id: '16', name: "Michael Adebayo", role: "Certified Mentor", country: "South Africa", sector: "Finance", badge: 5, connections: 145, tgnId: 'TGN-0016', location: 'Johannesburg, South Africa', isVerified: true, profile: 'Finance mentor from South Africa.', imageId: 'default-male-avatar', joinDate: 'Nov 2023', bannerImageId: 'profile-banner-2' },
    { id: '5', tgnId: 'TGN-0005', name: 'Chloe Kim', role: 'Mentee', location: 'Toronto, Canada', country: 'Canada', sector: 'Technology', isVerified: true, imageId: 'user-5', profile: "Recent computer science graduate with a passion for artificial intelligence and machine learning. Looking for a mentor to guide career path choices, from big tech to startups, and to gain practical project experience.", badge: 4, connections: 55, joinDate: 'Oct 2023', bannerImageId: 'profile-banner-1'},
    { id: '1', tgnId: 'TGN-0001', name: 'Sarah Chen', role: 'Executive Mentor', location: 'San Francisco, USA', country: 'United States', sector: 'Technology', isVerified: true, imageId: 'user-1', profile: "Seasoned product manager with 10+ years of experience in SaaS and mobile apps. Passionate about helping early-stage founders navigate product-market fit. Expertise in Agile methodologies, user research, and data-driven decision making.", badge: 7, connections: 212, joinDate: 'Jan 2022', bannerImageId: 'profile-banner-1' },
];

export const stories: Story[] = [
  {
    id: 's1',
    author: members.find(m => m.id === '9')!,
    items: [{ id: 's1i1', type: 'image', mediaId: 'story-1', duration: 7 }]
  },
  {
    id: 's2',
    author: members.find(m => m.id === '10')!,
    items: [
      { id: 's2i1', type: 'image', mediaId: 'story-2', duration: 5 },
      { id: 's2i2', type: 'image', mediaId: 'story-3', duration: 8 }
    ]
  },
  {
    id: 's3',
    author: members.find(m => m.id === '11')!,
    items: [{ id: 's3i1', type: 'image', mediaId: 'product-4', duration: 6 }]
  },
  {
    id: 's4',
    author: members.find(m => m.id === '12')!,
    items: [{ id: 's4i1', type: 'image', mediaId: 'product-2', duration: 5 }]
  },
  {
    id: 's5',
    author: members.find(m => m.id === '13')!,
    items: [{ id: 's5i1', type: 'image', mediaId: 'program-global-business', duration: 7 }]
  },
  {
    id: 's6',
    author: members.find(m => m.id === '14')!,
    items: [{ id: 's6i1', type: 'image', mediaId: 'program-business-strategy', duration: 5 }]
  }
];


export const sectors = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
    'Retail', 'Real Estate', 'Agriculture', 'Energy', 'Media',
    'Non-Profit', 'Government'
];

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

const currentUser = members.find(m => m.id === '5'); // Assuming Chloe Kim is the current user

export const conversations: ChatConversation[] = [
    {
      id: 'conv1',
      participants: [members.find(m => m.id === '10')!, currentUser!],
      messages: [
        { id: 'msg1', senderId: '10', text: 'Hey Chloe, how are you finding the mentorship program?', timestamp: '10:40 AM' },
        { id: 'msg2', senderId: '5', text: 'Hi James! It\'s been great, learning a lot. Thanks for checking in.', timestamp: '10:42 AM' },
      ],
      unreadCount: 2,
    },
    {
      id: 'conv2',
      participants: [members.find(m => m.id === '12')!, currentUser!],
      messages: [
        { id: 'msg3', senderId: '12', text: 'Just saw your post on the community feed, great insights!', timestamp: 'Yesterday' },
      ],
    },
    {
      id: 'conv3',
      participants: [members.find(m => m.id === '1')!, currentUser!],
      messages: [
        { id: 'msg4', senderId: '1', text: 'Let\'s schedule our next check-in.', timestamp: '2 days ago' },
      ],
      unreadCount: 0,
    },
     {
      id: 'conv4',
      participants: [members.find(m => m.id === '11')!, currentUser!],
      messages: [
        { id: 'msg5', senderId: '11', text: 'Can you review my project proposal?', timestamp: '4 days ago' },
      ],
    }
  ].filter(c => c.participants.every(p => p)); // Ensure no conversations with undefined participants
