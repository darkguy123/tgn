export interface TGNMember {
    id: string;
    tgnMemberId: string;
    name?: string;
    signInType: string;
    email: string;
    phone?: string;
    locationContinent: string;
    locationCountry: string;
    locationRegion?: string;
    timezone?: string;
    sectorPreferences?: string[];
    role: 'mentee' | 'mentor-candidate' | 'associate-mentor' | 'collaborator' | 'sponsor' | 'country-manager' | 'volunteer' | 'media';
    purpose?: string;
    identityProfile?: string;
    imageId?: string;
    isVerifiedMentor?: boolean;
    createdAt?: any;
}

export interface MentorKYC {
  id: string;
  memberId: string;
  status: 'pending' | 'approved' | 'rejected';
  nin: string;
  bvn: string;
  medicalLicenseNumber?: string;
  certificateUrl: string;
  degreeUrl: string;
  avatarUrl: string;
  faceScanFrontUrl?: string;
  faceScanLeftUrl?: string;
  faceScanRightUrl?: string;
  submittedAt: any; // Firestore Timestamp
  reviewedAt?: any; // Firestore Timestamp
  rejectionReason?: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    type: 'Book' | 'Course' | 'Tool' | 'Digital Asset';
    imageUrl: string;
    
    sellerMemberId: string;
    sellerName: string; 
    sellerImageId: string; 

    approvalStatus: 'pending' | 'approved' | 'rejected';
    createdAt: any; 
}

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
  createdAt: any;
  updatedAt?: any;
  deactivatedAt?: any;
};

export type Post = {
  id: string;
  authorId: string;
  authorName: string;
  authorImageId: string;
  authorRole: string;
  content: string;
  images?: string[];
  likes: number;
  commentsCount: number;
  createdAt: any; // Firestore Timestamp
};

export type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isCurrentUser: boolean;
};

export type ChatConversation = {
  id: string;
  participants: TGNMember[];
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

export interface Cause {
    id: string;
    creatorMemberId: string;
    creatorName: string;
    creatorImageId: string;
    title: string;
    description: string;
    goalAmount: number;
    currentAmount: number;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: any; // Allow Firestore ServerTimestamp
}

export interface AffiliateReferral {
    id: string;
    referrerMemberId: string;
    referredMemberId: string;
    level: number;
    commissionPercentage: number;
}

    