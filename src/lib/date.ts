export const parseLocalDate = (dateString: string): Date => {
    if (!dateString) return new Date();

    // Split by 'T' to ignore time/timezone info and just get YYYY-MM-DD
    // This effectively ignores the "server time" aspect and treats the date part as absolute "User Local Date"
    const datePart = dateString.split('T')[0];

    if (!datePart.includes('-')) return new Date(dateString); // Fallback for weird formats

    const [year, month, day] = datePart.split('-').map(Number);

    // new Date(year, monthIndex, day) creates a date at Local Midnight
    return new Date(year, month - 1, day);
};
