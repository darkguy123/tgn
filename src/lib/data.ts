import type { Product, Event, Wallet, Transaction, SavedCard, Cause } from './types';

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

export const products: Product[] = [];
export const events: Event[] = [];
