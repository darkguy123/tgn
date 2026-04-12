'use server';

/**
 * Fallback recommendation system that uses profile-based matching
 * when AI recommendations are unavailable.
 */

import type { TGNMember, Program, Product, Event, Sector } from '@/lib/types';
import type { RecommendationDetails } from './actions';

const KEYWORDS_BY_ROLE = {
  mentor: ['leadership', 'guide', 'mentoring', 'develop', 'coaching', 'expert', 'advis'],
  mentee: ['learn', 'growth', 'skill', 'career', 'develop', 'upskill', 'foundation'],
};

const KEYWORDS_BY_SECTOR = {
  'Technology': ['tech', 'software', 'ai', 'ml', 'data', 'development', 'coding', 'digital'],
  'Finance': ['finance', 'banking', 'investment', 'accounting', 'crypto', 'trading'],
  'Healthcare': ['health', 'medical', 'nursing', 'pharma', 'wellness', 'clinical'],
  'Education': ['education', 'learning', 'training', 'teaching', 'course', 'school'],
  'Business': ['business', 'entrepreneurship', 'startup', 'management', 'sales'],
};

function scoreStringMatch(userText: string, targetText: string): number {
  if (!userText || !targetText) return 0;
  
  const userLower = userText.toLowerCase();
  const targetLower = targetText.toLowerCase();
  
  // Exact match
  if (userLower.includes(targetLower) || targetLower.includes(userLower)) {
    return 100;
  }
  
  // Keyword overlap
  const userWords = userLower.split(/\s+/);
  const targetWords = targetLower.split(/\s+/);
  const matchCount = userWords.filter(w => targetWords.some(t => t.includes(w) || w.includes(t))).length;
  
  return Math.round((matchCount / Math.max(userWords.length, 1)) * 80);
}

function sectorScore(userSectors: string[] | undefined, targetSectors: string[] | undefined): number {
  if (!userSectors?.length || !targetSectors?.length) return 0;
  
  const matches = userSectors.filter(s => targetSectors.some(t => t.toLowerCase() === s.toLowerCase())).length;
  return Math.round((matches / userSectors.length) * 100);
}

function calculateMentorMatch(member: TGNMember, mentor: TGNMember): number {
  let score = 0;
  
  // Sector alignment
  const sectorScore_ = sectorScore(member.sectorPreferences, mentor.sectorPreferences);
  score += sectorScore_ * 0.35;
  
  // Purpose/role alignment
  const purposeMatch = scoreStringMatch(member.purpose || '', mentor.purpose || '');
  score += purposeMatch * 0.25;
  
  // Location proximity bonus
  if (member.locationCountry === mentor.locationCountry) {
    score += 20;
  }
  
  // Mentor verification bonus
  if (mentor.isVerifiedMentor) {
    score += 15;
  }
  
  return Math.min(Math.round(score), 95);
}

function calculateProgramMatch(member: TGNMember, program: Program): number {
  let score = 0;
  
  // Purpose alignment
  const purposeMatch = scoreStringMatch(member.purpose || '', program.description || '');
  score += purposeMatch * 0.4;
  
  // Sector alignment
  if (member.sectorPreferences?.length) {
    const sectorKeywords = member.sectorPreferences.flatMap(s => KEYWORDS_BY_SECTOR[s as keyof typeof KEYWORDS_BY_SECTOR] || []);
    const programLower = `${program.title} ${program.description}`.toLowerCase();
    const sectorMatches = sectorKeywords.filter(k => programLower.includes(k)).length;
    score += (sectorMatches / Math.max(sectorKeywords.length, 1)) * 60;
  }
  
  // Title match
  const titleMatch = scoreStringMatch(member.purpose || '', program.title || '');
  score += titleMatch * 0.35;
  
  return Math.min(Math.round(score), 90);
}

function calculateProductMatch(member: TGNMember, product: Product): number {
  let score = 0;
  
  // Role relevance
  const roleMatch = scoreStringMatch(member.role, product.description || '');
  score += roleMatch * 0.3;
  
  // Purpose alignment
  const purposeMatch = scoreStringMatch(member.purpose || '', product.description || '');
  score += purposeMatch * 0.4;
  
  // Sector match if applicable
  if (member.sectorPreferences?.length) {
    const sectorKeywords = member.sectorPreferences.flatMap(s => KEYWORDS_BY_SECTOR[s as keyof typeof KEYWORDS_BY_SECTOR] || []);
    const productLower = `${product.name} ${product.description}`.toLowerCase();
    const sectorMatches = sectorKeywords.filter(k => productLower.includes(k)).length;
    score += (sectorMatches / Math.max(sectorKeywords.length, 1)) * 30;
  }
  
  return Math.min(Math.round(score), 85);
}

function calculateEventMatch(member: TGNMember, event: Event): number {
  let score = 0;
  
  // Purpose/topic alignment
  const topicMatch = scoreStringMatch(member.purpose || '', event.description || '');
  score += topicMatch * 0.4;
  
  // Title match
  const titleMatch = scoreStringMatch(member.purpose || '', event.name || '');
  score += titleMatch * 0.35;
  
  // Location proximity bonus
  if (member.locationCountry && event.description?.includes(member.locationCountry)) {
    score += 15;
  }
  
  return Math.min(Math.round(score), 85);
}

function calculateSectorMatch(member: TGNMember, sector: Sector): number {
  if (member.sectorPreferences?.some(s => s.toLowerCase() === sector.name.toLowerCase())) {
    return 40; // Already interested in this sector
  }
  
  // Match based on purpose description
  const purposeMatch = scoreStringMatch(member.purpose || '', sector.description || '');
  return Math.min(purposeMatch * 0.7, 80);
}

export function generateProfileBasedRecommendations(
  member: TGNMember,
  allMembers: TGNMember[],
  allPrograms: Program[],
  allProducts: Product[],
  allEvents: Event[],
  allSectors: Sector[]
): RecommendationDetails[] {
  const recommendations: RecommendationDetails[] = [];
  
  // Find mentor recommendations
  const mentors = allMembers.filter(m => m.role.includes('mentor') && m.id !== member.id);
  const mentorRecs = mentors
    .map(mentor => ({
      recommendedType: 'Mentor' as const,
      recommendedId: mentor.id,
      matchScore: calculateMentorMatch(member, mentor),
      explanation: `Aligned sectors and experience match well with your growth goals.`,
      id: mentor.id,
      name: mentor.name || mentor.email?.split('@')[0] || 'Mentor',
      tgnMemberId: mentor.tgnMemberId,
    }))
    .filter(r => r.matchScore >= 50)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 2);
  
  recommendations.push(...mentorRecs);
  
  // Find program recommendations
  const programRecs = allPrograms
    .map(program => ({
      recommendedType: 'Program' as const,
      recommendedId: program.id,
      matchScore: calculateProgramMatch(member, program),
      explanation: `Designed to develop skills aligned with your interests.`,
      id: program.id,
      name: program.title,
    }))
    .filter(r => r.matchScore >= 50)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 1);
  
  recommendations.push(...programRecs);
  
  // Find product recommendations
  const productRecs = allProducts
    .map(product => ({
      recommendedType: 'Product' as const,
      recommendedId: product.id,
      matchScore: calculateProductMatch(member, product),
      explanation: `Resource that supports your professional development.`,
      id: product.id,
      name: product.name,
    }))
    .filter(r => r.matchScore >= 50)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 1);
  
  recommendations.push(...productRecs);
  
  // Find event recommendations
  const eventRecs = allEvents
    .map(event => ({
      recommendedType: 'Event' as const,
      recommendedId: event.id,
      matchScore: calculateEventMatch(member, event),
      explanation: `Networking opportunity related to your area of interest.`,
      id: event.id,
      name: event.name,
    }))
    .filter(r => r.matchScore >= 45)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 1);
  
  recommendations.push(...eventRecs);
  
  // Find sector recommendations for those without many preferences
  if (!member.sectorPreferences || member.sectorPreferences.length < 2) {
    const sectorRecs = allSectors
      .map(sector => ({
        recommendedType: 'Sector' as const,
        recommendedId: sector.id,
        matchScore: calculateSectorMatch(member, sector),
        explanation: `Growing sector aligned with your professional interests.`,
        id: sector.id,
        name: sector.name,
      }))
      .filter(r => r.matchScore >= 40)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 1);
    
    recommendations.push(...sectorRecs);
  }
  
  // Return up to 5 recommendations, sorted by score
  return recommendations.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
}
