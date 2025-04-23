
export function getAestDate(): string {
  const now = new Date();
  const aestOffset = 10 * 60; // +10:00 hours in minutes
  const utcOffset = now.getTimezoneOffset();
  const totalOffsetMinutes = utcOffset + aestOffset;
  const aestNow = new Date(now.getTime() + totalOffsetMinutes * 60000);
  return aestNow.toISOString().split('T')[0];
}
