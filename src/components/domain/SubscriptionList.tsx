import { useTransactions } from '../../hooks/queries/useTransactions';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { CalendarIcon, CreditCardIcon } from 'lucide-react';
import type { Transaction } from '../../services/transactions';

export const SubscriptionList = () => {
    const { data: transactions, isLoading } = useTransactions();

    if (isLoading) return null;

    // Logic to find unique active subscriptions
    // Group by description (lower cased) and take the latest one
    const subMap = new Map<string, Transaction>();

    transactions?.filter(t => t.is_recurring && t.type === 'expense').forEach(t => {
        const key = t.description?.toLowerCase().trim() || 'unknown';
        const existing = subMap.get(key);
        if (!existing || new Date(t.date) > new Date(existing.date)) {
            subMap.set(key, t);
        }
    });

    const subscriptions = Array.from(subMap.values()).sort((a, b) => (a.recurring_day || 0) - (b.recurring_day || 0));
    const totalMonthly = subscriptions.reduce((sum, sub) => sum + Number(sub.amount), 0);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-text-muted">
                    Fixed Monthly Costs
                </CardTitle>
                <CalendarIcon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-text-main mb-4">
                    ${totalMonthly.toFixed(2)}
                </div>
                <div className="space-y-3">
                    {subscriptions.length === 0 ? (
                        <p className="text-sm text-text-muted">No recurring subscriptions yet.</p>
                    ) : (
                        subscriptions.map(sub => (
                            <div key={sub.id} className="flex items-center justify-between p-2 rounded-lg bg-surface border border-white/5 dark:border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${sub.category_id ? 'bg-primary/20 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                                        <CreditCardIcon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-text-main text-sm">{sub.description}</p>
                                        <p className="text-xs text-text-muted">
                                            {sub.recurring_day ? `Renews on day ${sub.recurring_day}` : 'Monthly'}
                                        </p>
                                    </div>
                                </div>
                                <span className="font-semibold text-text-main">
                                    ${sub.amount.toFixed(2)}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
