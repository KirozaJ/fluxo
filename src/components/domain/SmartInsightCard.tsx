import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { LightbulbIcon, TrendingUpIcon, TrendingDownIcon, AlertCircleIcon } from 'lucide-react';
import { useTransactions } from '../../hooks/queries/useTransactions';
import { useCategories } from '../../hooks/queries/useCategories';

export const SmartInsightCard = () => {
    const { data: transactions } = useTransactions();
    const { data: categories } = useCategories();

    if (!transactions || !categories) return null;

    // Insight Logic
    // 1. Spending Trend: Compare this month's spending vs last month's spending (prorated or absolute)

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const getMonthlySpending = (month: number, year: number) => {
        return transactions
            .filter(t => {
                const d = new Date(t.date);
                return d.getMonth() === month && d.getFullYear() === year && t.type === 'expense';
            })
            .reduce((acc, t) => acc + Number(t.amount), 0);
    };

    const currentSpending = getMonthlySpending(currentMonth, currentYear);
    const lastMonthSpending = getMonthlySpending(lastMonth, lastMonthYear);

    // Calculate percentage change
    // Avoid division by zero
    const percentChange = lastMonthSpending === 0
        ? 100
        : ((currentSpending - lastMonthSpending) / lastMonthSpending) * 100;

    const isSpendingMore = percentChange > 0;

    // 2. Budget Alert
    // Check if any category is over 80% limit
    // We already have budget progress bars, so maybe a holistic "You are over budget in X categories"
    const overBudgetCategories = categories.filter(c => {
        if (!c.monthly_limit) return false;
        const spent = transactions
            .filter(t => t.category_id === c.id && t.type === 'expense' && new Date(t.date).getMonth() === currentMonth)
            .reduce((acc, t) => acc + Number(t.amount), 0);
        return spent > c.monthly_limit;
    });

    return (
        <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-indigo-400">
                    <LightbulbIcon className="w-4 h-4" /> Smart Insights
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Trend Insight */}
                <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${isSpendingMore ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                        {isSpendingMore ? <TrendingUpIcon className="w-4 h-4" /> : <TrendingDownIcon className="w-4 h-4" />}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-text-main">
                            Spending is {isSpendingMore ? 'up' : 'down'} by {Math.abs(Math.round(percentChange))}%
                        </p>
                        <p className="text-xs text-text-muted">
                            vs. last month ({lastMonthSpending.toFixed(0)} vs {currentSpending.toFixed(0)})
                        </p>
                    </div>
                </div>

                {/* Budget Insight */}
                {overBudgetCategories.length > 0 && (
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-orange-500/20 text-orange-400">
                            <AlertCircleIcon className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-main">
                                Attention Needed
                            </p>
                            <p className="text-xs text-text-muted">
                                You've exceeded the budget for <span className="text-text-main font-semibold">{overBudgetCategories.length} categories</span>.
                            </p>
                        </div>
                    </div>
                )}

                {overBudgetCategories.length === 0 && (
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-blue-500/20 text-blue-400">
                            <AlertCircleIcon className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-main">
                                On Track
                            </p>
                            <p className="text-xs text-text-muted">
                                You are within budget for all categories. Great job!
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
