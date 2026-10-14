/**
 * Formats an ISO date string into beautifully localized Arabic date-time text
 */
export function formatArabicDate(dateString: string): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (e) {
    console.error("Error formatting localized Arabic date:", e);
    return dateString;
  }
}
