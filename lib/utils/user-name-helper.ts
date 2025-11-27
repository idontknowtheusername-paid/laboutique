/**
 * Helper functions to extract and format user names
 */

/**
 * Extract a readable first name from an email address
 * Examples:
 * - "jean.dupont@example.com" -> "Jean"
 * - "marie_claire123@example.com" -> "Marie"
 * - "john.doe@example.com" -> "John"
 * - "user123@example.com" -> "User"
 */
export function extractNameFromEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return 'Client';
  }

  try {
    // Extract part before @
    const localPart = email.split('@')[0];
    
    if (!localPart) {
      return 'Client';
    }

    // Remove numbers and special characters, split by dots/underscores/hyphens
    const nameParts = localPart
      .replace(/[0-9]/g, '') // Remove numbers
      .split(/[._-]/) // Split by common separators
      .filter(part => part.length > 1); // Keep only parts with 2+ chars
    
    if (nameParts.length === 0) {
      return 'Client';
    }
    
    // Take the first part and capitalize it
    const firstName = nameParts[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  } catch (error) {
    console.error('Error extracting name from email:', error);
    return 'Client';
  }
}

/**
 * Get a display name for a user with fallback logic
 * Priority: full_name > extracted from email > fallback
 */
export function getUserDisplayName(
  fullName: string | null | undefined,
  email: string | null | undefined,
  fallback: string = 'Client'
): string {
  // Priority 1: Use full_name if available and not empty
  if (fullName && fullName.trim() !== '') {
    return fullName.trim();
  }

  // Priority 2: Extract from email
  if (email) {
    const extracted = extractNameFromEmail(email);
    if (extracted !== 'Client') {
      return extracted;
    }
  }

  // Priority 3: Fallback
  return fallback;
}

/**
 * Format a full name to display only first name + last initial
 * Example: "Jean Dupont" -> "Jean D."
 */
export function formatNameWithInitial(fullName: string): string {
  if (!fullName || fullName.trim() === '') {
    return 'Client';
  }

  const parts = fullName.trim().split(/\s+/);
  
  if (parts.length === 1) {
    return parts[0];
  }

  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  
  return `${firstName} ${lastInitial}.`;
}

/**
 * Get initials from a name for avatar display
 * Example: "Jean Dupont" -> "JD"
 */
export function getInitials(name: string): string {
  if (!name || name.trim() === '') {
    return 'C';
  }

  const parts = name.trim().split(/\s+/);
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
