/**
 * Image Placeholder Utilities
 * Generate blur placeholders for better perceived performance
 */

/**
 * Generate a simple blur data URL for image placeholders
 * This reduces CLS and improves perceived performance
 */
export function getImagePlaceholder(width: number = 10, height: number = 10): string {
  // Create a simple SVG blur placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#f3f4f6"/>
    </svg>
  `;
  
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Generate a shimmer effect placeholder
 */
export function getShimmerPlaceholder(width: number = 400, height: number = 400): string {
  const shimmer = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#e5e7eb;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f3f4f6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#shimmer)">
        <animate attributeName="x" from="-${width}" to="${width}" dur="1s" repeatCount="indefinite" />
      </rect>
    </svg>
  `;
  
  const base64 = Buffer.from(shimmer).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Product image placeholder with brand color
 */
export const PRODUCT_PLACEHOLDER = getImagePlaceholder(400, 400);

/**
 * Avatar placeholder
 */
export const AVATAR_PLACEHOLDER = getImagePlaceholder(100, 100);

/**
 * Banner placeholder
 */
export const BANNER_PLACEHOLDER = getImagePlaceholder(1200, 400);
