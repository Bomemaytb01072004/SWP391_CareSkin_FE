/**
 * Utility functions for handling SEO-friendly URLs
 */

/**
 * Generates an SEO-friendly URL slug for a product
 * @param {Object} productData - Product object with ProductName and ProductId
 * @returns {string} URL-friendly slug
 */
export const generateProductSlug = (productData) => {
  if (!productData || !productData.ProductName) {
    return productData?.ProductId || '';
  }

  // Create URL-friendly string from product name
  const nameSlug = productData.ProductName.toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Trim hyphens from start and end

  // Combine name and ID for uniqueness
  return `${nameSlug}-${productData.ProductId}`;
};

/**
 * Extracts the product ID from a URL slug
 * @param {string} slug - The URL slug (e.g., "cerave-moisturizing-cream-123")
 * @returns {string|null} The product ID or null if not found
 */
export const extractProductId = (slug) => {
  if (!slug) return null;

  // Try to extract ID from the end of the slug (after the last hyphen)
  const matches = slug.match(/-(\d+)$/);
  if (matches && matches[1]) {
    return matches[1];
  }

  // Fallback: check if the entire slug is a number
  if (!isNaN(slug) && parseInt(slug) > 0) {
    return slug;
  }

  // Additional fallback for any numeric part at the end
  const numericPart = slug.match(/(\d+)$/);
  if (numericPart && numericPart[1]) {
    return numericPart[1];
  }

  return null;
};

/**
 * Generates an SEO-friendly URL slug for a blog post
 * @param {Object} blogData - Blog object with Title and BlogId
 * @returns {string} URL-friendly slug
 */
export const generateBlogSlug = (blogData) => {
  if (!blogData || !blogData.Title || blogData.Title === 'string') {
    return blogData?.BlogId || '';
  }

  // Create URL-friendly string from blog title
  const titleSlug = blogData.Title.toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Trim hyphens from start and end

  // Combine title and ID for uniqueness
  return `${titleSlug}-${blogData.BlogId}`;
};

/**
 * Extracts the blog ID from a URL slug
 * @param {string} slug - The URL slug (e.g., "skincare-tips-for-winter-123")
 * @returns {string|null} The blog ID or null if not found
 */
export const extractBlogId = (slug) => {
  if (!slug) return null;

  // Try to extract ID from the end of the slug (after the last hyphen)
  const matches = slug.match(/-(\d+)$/);
  if (matches && matches[1]) {
    return matches[1];
  }

  // Fallback: check if the entire slug is a number
  if (!isNaN(slug) && parseInt(slug) > 0) {
    return slug;
  }

  // Additional fallback for any numeric part at the end
  const numericPart = slug.match(/(\d+)$/);
  if (numericPart && numericPart[1]) {
    return numericPart[1];
  }

  return null;
};
