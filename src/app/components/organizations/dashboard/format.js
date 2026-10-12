// Display helpers for the /organizations dashboard.

export function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getFirstName(user) {
  if (!user) return '';
  const first = user.first_name || user.firstName;
  if (first) return first;
  if (user.name) return user.name.split(' ')[0];
  return user.email ? user.email.split('@')[0] : '';
}

// "15 min ago", "2 hours ago", "3 days ago", then a short date past a month.
export function formatLastActive(iso, now = Date.now()) {
  if (!iso) return 'No activity yet';
  const minutes = Math.floor((now - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// "Next in 25 min", "Next in 2h 10m" — null when there's nothing upcoming.
export function formatNextIn(iso, now = Date.now()) {
  if (!iso) return null;
  const minutes = Math.max(0, Math.round((new Date(iso).getTime() - now) / 60000));
  if (minutes < 1) return 'Starting now';
  if (minutes < 60) return `Next in ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `Next in ${hours}h ${rest}m` : `Next in ${hours}h`;
}
