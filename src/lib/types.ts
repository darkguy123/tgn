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
    avatarUrl?: string;
    isVerifiedMentor?: boolean;
    createdAt?: any;
    connections?: string[];
    subscription?: {
        planName: string;
        renewsAt: any; // Firestore Timestamp
    };
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
    sellerAvatarUrl: string; 

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
  preRecordedVideoUrl?: string;
  createdAt: any;
  updatedAt?: any;
  deactivatedAt?: any;
};

export type Post = {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string;
  authorRole: string;
  content: string;
  imageUrls?: string[];
  likes: number;
  commentsCount: number;
  createdAt: any; // Firestore Timestamp
};

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string;
  content: string;
  createdAt: any; // Firestore Timestamp
}

export type ChatMessage = {
  id: string;
  senderId: string;
  type: 'text' | 'image' | 'video' | 'document';
  content: string; // for text messages
  mediaUrl?: string; // for media
  fileName?: string;
  fileSize?: number;
  createdAt: any; // Firestore Timestamp
};

export interface Chat {
  id: string;
  participantIds: string[];
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: any;
  };
  typing?: {
      [key: string]: boolean;
  };
}

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
  startDate: any; // Firestore Timestamp
  endDate: any; // Firestore Timestamp
  location: string;
  price?: number;
  type: 'Conference' | 'Webinar' | 'Workshop' | 'Meetup';
  imageUrl?: string;
  deactivatedAt?: any; // Firestore Timestamp
  googleMeetUrl?: string;
  createdAt?: any;
  updatedAt?: any;
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
    createdAt: any; // Firestore Timestamp
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
    creatorAvatarUrl: string;
    title: string;
    description: string;
    goalAmount: number;
    currentAmount: number;
    backersCount?: number;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: any; // Allow Firestore ServerTimestamp
}

export interface AdCampaign {
    id: string;
    creatorMemberId: string;
    creatorName: string;
    creatorAvatarUrl: string;
    name: string;
    status: 'pending' | 'active' | 'paused' | 'rejected';
    budget: number;
    amountSpent?: number;
    headline: string;
    bodyText: string;
    imageUrl: string;
    callToActionText: string;
    callToActionUrl: string;
    createdAt: any; // Firestore Timestamp
    rejectionReason?: string;
}

export interface AffiliateReferral {
    id: string;
    referrerMemberId: string;
    referredMemberId: string;
    level: number;
    commissionPercentage: number;
}

export interface FriendRequest {
    id: string;
    senderId: string;
    recipientId: string;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: any; // Firestore Timestamp
}
