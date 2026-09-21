'use client';

export const FALLBACK_COLOR = '#4F46E5';

const getInitials = (name) => {
  const words = (name || '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const SIZE_CLASSES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-20 h-20 text-2xl',
};

// Neutral border used wherever a per-org colored ring would look inconsistent
// across a grid/list of many organizations (e.g. clashing with each org's own color).
export const COMMON_BORDER_COLOR = '#E5E7EB'; // Tailwind gray-200

/**
 * Round organization logo. Falls back to a colored circle with the
 * organization's initials when no logo has been uploaded.
 */
const OrgLogo = ({ org, size = 'md', className = '', ring = true, ringColor }) => {
  const sizeCls = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  if (org?.logo_url) {
    return (
      <img
        src={org.logo_url}
        alt={`${org.name || 'Organization'} logo`}
        className={`${sizeCls} rounded-full object-contain bg-white shrink-0 ${className}`}
        style={ring ? { boxShadow: `0 0 0 2px ${ringColor || org?.color || FALLBACK_COLOR}` } : undefined}
      />
    );
  }

  return (
    <div
      className={`${sizeCls} rounded-full shrink-0 flex items-center justify-center font-semibold text-white ${className}`}
      style={{ backgroundColor: org?.color || FALLBACK_COLOR }}
    >
      {getInitials(org?.name)}
    </div>
  );
};

export default OrgLogo;
