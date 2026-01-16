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
