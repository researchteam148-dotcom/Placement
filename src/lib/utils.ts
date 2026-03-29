/**
 * Robustly formats a date or Firestore Timestamp into a human-readable string.
 * @param date - The date to format (Date, string, number, or Firestore Timestamp)
 * @param fallback - The string to return if formatting fails
 * @returns Formatted date string or fallback
 */
export const formatDate = (date: any, fallback: string = "—"): string => {
  if (!date) return fallback;

  try {
    let d: Date;

    // Handle Firestore Timestamp { seconds, nanoseconds }
    if (date && typeof date === 'object' && 'seconds' in date) {
      d = new Date(date.seconds * 1000);
    } 
    // Handle Firestore Timestamp toDate() method (if available)
    else if (date && typeof date === 'object' && typeof date.toDate === 'function') {
      d = date.toDate();
    }
    // Handle standard Date object or parseable string/number
    else {
      d = new Date(date);
    }

    if (isNaN(d.getTime())) return fallback;

    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (err) {
    console.error("Error formatting date:", err);
    return fallback;
  }
};
