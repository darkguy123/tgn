export interface TGNMember {
    id: string;
    tgnMemberId: string;
    signInType: string;
    email: string;
    locationContinent: string;
    locationCountry: string;
    locationRegion?: string;
    sectorPreferences?: string[];
    role: 'mentee' | 'mentor-candidate' | 'associate-mentor' | 'collaborator' | 'sponsor' | 'country-manager' | 'volunteer' | 'media';
    purpose?: string;
    identityProfile?: string;
    createdAt?: string;
}

export type Member = {
  id: string;
  tgnId: string;
  name: string;
  role: string;
  location: string;
  country: string;
  sector: string;
  isVerified: boolean;
  profile: string;
  imageId: string;
  bannerImageId?: string;
  joinDate?: string;
  badge: number;
  connections: number;
};


export type Product = {
  id: string;
  title: string;
  author: string;
  price: number;
  type: 'Book' | 'Course' | 'Tool';
  imageId: string;
};

export type Program = {
  id: string;
  title: string;
  mentor: string;
  duration: string;
  enrolled: number;
  rating: number;
  certified: boolean;
  price?: number;
  imageId: string;
  description: string;
  format: 'Live' | 'Pre-recorded' | 'Self-paced' | 'Hybrid';
  type: 'Free' | 'Paid' | 'Executive';
  googleMeetUrl?: string;
  createdAt: string;
  updatedAt?: string;
  deactivatedAt?: string;
};

export type StoryItem = {
  id: string;
  type: 'image' | 'video';
  mediaId: string; // reference to placeholder-images.json
  duration: number; // in seconds
};

export type Story = {
  id: string;
  author: Member;
  items: StoryItem[];
};

export type ChatMessage = {
  id: string;
  senderId: string; // Member['id']
  text: string;
  timestamp: string;
};

export type ChatConversation = {
  id: string;
  participants: Member[];
  messages: ChatMessage[];
  unreadCount?: number;
};

export interface MentorCertification {
  memberId: string;
  paidProgramsCompleted: number;
  accountAgeInMonths: number;
  menteeBadgeLevel: number;
  curriculumCompleted: boolean;
  evaluationPassed: boolean;
  isCertified: boolean;
  certificationDate?: string;
}

export interface Sector {
    id: string;
    name: string;
    description?: string;
}

export interface Event {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    price?: number;
    type?: 'Conference' | 'Webinar' | 'Workshop' | 'Meetup';
}

export interface Wallet {
    memberId: string;
    currency: string;
    balance: number;
}

export interface Transaction {
    id: string;
    type: 'commission' | 'withdrawal' | 'deposit' | 'purchase';
    status: 'pending' | 'completed' | 'failed';
    amount: number;
    currency: string;
    description: string;
    createdAt: string;
}

export interface SavedCard {
    id: string;
    brand: 'Visa' | 'Mastercard' | 'Amex';
    last4: string;
    expiryMonth: string;
    expiryYear: string;
    isDefault: boolean;
}

    