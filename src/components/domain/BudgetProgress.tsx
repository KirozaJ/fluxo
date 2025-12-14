import { useCategories } from '../../hooks/queries/useCategories';
import { useTransactions } from '../../hooks/queries/useTransactions';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { isSameMonth, parseISO } from 'date-fns';

export const BudgetProgress = () => {
    const { data: categories } = useCategories();
    const { data: transactions } = useTransactions();

    // Filter categories that have a budget limit
    const budgetCategories = categories?.filter(c => c.monthly_limit && c.monthly_limit > 0 && c.type === 'expense') || [];

    if (budgetCategories.length === 0) return null;

    // Calculate spending per category for current month
    const currentMonth = new Date();
    const spendingMap = new Map<string, number>();

    transactions?.forEach(t => {
        if (t.type === 'expense' && t.category_id && isSameMonth(parseISO(t.date), currentMonth)) {
            const current = spendingMap.get(t.category_id) || 0;
            spendingMap.set(t.category_id, current + Number(t.amount));
        }
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Monthly Budgets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {budgetCategories.map(cat => {
                    const spent = spendingMap.get(cat.id) || 0;
                    const limit = cat.monthly_limit!;
                    const percentage = Math.min((spent / limit) * 100, 100);

                    let colorClass = 'bg-primary';
                    if (percentage > 90) colorClass = 'bg-red-500';
                    else if (percentage > 75) colorClass = 'bg-yellow-500';

                    return (
                        <div key={cat.id} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-text-main">{cat.name}</span>
                                <span className="text-text-muted">
                                    ${spent.toFixed(0)} / ${limit}
                                </span>
                            </div>
                            <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${colorClass} transition-all duration-500`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
};
