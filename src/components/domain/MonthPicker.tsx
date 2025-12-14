import { format } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';
import { Button } from '../ui/Button';

export const MonthPicker = () => {
    const { currentDate, nextMonth, prevMonth } = useDashboardStore();

    return (
        <div className="flex items-center justify-between bg-white p-2 rounded-lg border shadow-sm max-w-xs">
            <Button variant="ghost" size="sm" onClick={prevMonth}>
                <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <span className="font-semibold text-gray-900 min-w-[120px] text-center">
                {format(currentDate, 'MMMM yyyy')}
            </span>
            <Button variant="ghost" size="sm" onClick={nextMonth}>
                <ChevronRightIcon className="h-4 w-4" />
            </Button>
        </div>
    );
};
