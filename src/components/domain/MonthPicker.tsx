import { format } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';
import { Button } from '../ui/Button';

export const MonthPicker = () => {
    const { currentDate, nextMonth, prevMonth } = useDashboardStore();

    return (
        <div className="flex items-center justify-between bg-surface text-[var(--color-text-main)] p-1.5 rounded-full border border-white/20 shadow-lg shadow-purple-100/50 dark:shadow-none max-w-xs transition-transform hover:scale-[1.02]">
            <Button variant="ghost" size="sm" onClick={prevMonth} className="rounded-full hover:bg-[var(--color-secondary)] hover:text-[var(--color-secondary-foreground)] w-8 h-8 p-0">
                <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <span className="font-semibold px-4 min-w-[140px] text-center select-none">
                {format(currentDate, 'MMMM yyyy')}
            </span>
            <Button variant="ghost" size="sm" onClick={nextMonth} className="rounded-full hover:bg-[var(--color-secondary)] hover:text-[var(--color-secondary-foreground)] w-8 h-8 p-0">
                <ChevronRightIcon className="h-4 w-4" />
            </Button>
        </div>
    );
};
