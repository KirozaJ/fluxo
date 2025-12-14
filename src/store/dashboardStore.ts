import { create } from 'zustand';
import { startOfMonth, endOfMonth, format } from 'date-fns';

interface DashboardState {
    currentDate: Date;
    setCurrentDate: (date: Date) => void;
    getDateRange: () => { startDate: string; endDate: string };
    nextMonth: () => void;
    prevMonth: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
    currentDate: new Date(),
    setCurrentDate: (date) => set({ currentDate: date }),

    getDateRange: () => {
        const { currentDate } = get();
        return {
            startDate: format(startOfMonth(currentDate), 'yyyy-MM-dd'),
            endDate: format(endOfMonth(currentDate), 'yyyy-MM-dd'),
        };
    },

    nextMonth: () => set((state) => ({
        currentDate: new Date(state.currentDate.getFullYear(), state.currentDate.getMonth() + 1, 1)
    })),

    prevMonth: () => set((state) => ({
        currentDate: new Date(state.currentDate.getFullYear(), state.currentDate.getMonth() - 1, 1)
    })),
}));
