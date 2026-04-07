/**
 * Parses a duration string produced by addDurations (e.g. "2h 30m", "45m", "1h 0m")
 * into total minutes. Returns 0 for missing or unparseable values.
 */
export const parseDurationToMinutes = (duration?: string): number => {
    if (!duration) return 0;
    const hoursMatch = duration.match(/(\d+)h/);
    const minutesMatch = duration.match(/(\d+)\s*m/);
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
    return hours * 60 + minutes;
};
