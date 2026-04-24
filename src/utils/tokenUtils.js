/**
 * Check if tokens should be reset (different day from tokenDate)
 */
export function shouldResetTokens(tokenDate) {
  if (!tokenDate) return true;
  const today = new Date().toISOString().split("T")[0];
  return tokenDate !== today;
}

/**
 * Get today's date string in YYYY-MM-DD format
 */
export function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

/**
 * Calculate estimated wait time in minutes
 */
export function calculateEstimatedTime(tokenNumber, currentToken, timePerToken) {
  if (tokenNumber <= currentToken) return 0;
  const tokensAhead = tokenNumber - currentToken;
  return tokensAhead * timePerToken;
}

/**
 * Format minutes into human-readable string
 */
export function formatWaitTime(minutes) {
  if (minutes <= 0) return "Your turn!";
  if (minutes < 60) return `~${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `~${hours}h ${mins}m`;
}

/**
 * Request browser notification permission
 */
export async function requestNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  const permission = await Notification.requestPermission();
  return permission === "granted";
}

/**
 * Send a browser notification
 */
export function sendTokenNotification(companyName, minutes) {
  if (Notification.permission !== "granted") return;
  new Notification("Que — Your Token is Coming Up!", {
    body: `Your token at ${companyName} is approximately ${minutes} minutes away. Please be ready!`,
    icon: "/favicon.svg",
    tag: `que-token-${companyName}`,
  });
}
