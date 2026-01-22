'use client';
import type { TGNMember } from '@/lib/types';

// List of hardcoded admin emails
const ADMIN_EMAILS = ['valentinoboss18@gmail.com'];

/**
 * Checks if a user is an admin based on their role or email.
 * @param profile The user's TGNMember profile.
 * @returns {boolean} True if the user is an admin, false otherwise.
 */
export const isUserAdmin = (profile: TGNMember | null | undefined): boolean => {
    if (!profile) return false;
    // Check if the user has the 'country-manager' role
    if (profile.role === 'country-manager') return true;
    // Check if the user's email is in the admin list
    if (profile.email && ADMIN_EMAILS.includes(profile.email)) return true;
    return false;
}
