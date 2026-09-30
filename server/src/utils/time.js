/**
 * Utilities for time manipulation in Asia/Kolkata timezone (UTC+05:30).
 */

export function getKolkataDayBounds() {
  const now = new Date();
  
  // Calculate offset for Asia/Kolkata (+5:30 = +330 mins)
  const kolkataOffsetMs = (5 * 60 + 30) * 60 * 1000;
  const kolkataTime = new Date(now.getTime() + kolkataOffsetMs);
  
  // Start of day in Kolkata
  const startOfDayKolkata = new Date(kolkataTime);
  startOfDayKolkata.setUTCHours(0, 0, 0, 0);
  const startOfDayUtc = new Date(startOfDayKolkata.getTime() - kolkataOffsetMs);
  
  // End of day in Kolkata (midnight next day)
  const endOfDayKolkata = new Date(kolkataTime);
  endOfDayKolkata.setUTCHours(24, 0, 0, 0);
  const endOfDayUtc = new Date(endOfDayKolkata.getTime() - kolkataOffsetMs);
  
  return {
    startUtcIso: startOfDayUtc.toISOString(),
    endUtcIso: endOfDayUtc.toISOString(),
    resetsAt: endOfDayUtc.toISOString()
  };
}
