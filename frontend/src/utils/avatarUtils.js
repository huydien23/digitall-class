// Avatar utility functions
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8001";

/**
 * Get the complete avatar source URL
 * @param {Object} user - User object from Redux state
 * @returns {string|null} - Complete avatar URL or null if no avatar
 */
export const getAvatarSrc = (user) => {
  if (!user?.avatar) {
    return null;
  }

  // If the avatar is already a complete URL, return it
  if (user.avatar.startsWith("http")) {
    return user.avatar;
  }

  // If it's a relative path, construct the full URL
  return `${API_BASE_URL}${user.avatar}`;
};

/**
 * Get user initials for fallback avatar
 * @param {Object} user - User object
 * @returns {string} - User initials
 */
export const getUserInitials = (user) => {
  if (!user) return "";

  const firstName = user.first_name?.[0] || "";
  const lastName = user.last_name?.[0] || "";

  return `${firstName}${lastName}`;
};
