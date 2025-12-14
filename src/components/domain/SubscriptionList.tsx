import { useState, useEffect } from 'react';
import { useTransactions } from '../../hooks/queries/useTransactions';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { CreditCardIcon, Loader2Icon } from 'lucide-react';
import { format } from 'date-fns';
import { useSettingsStore } from '../../store/settingsStore';
import { exchangeRateService } from '../../services/exchangeRates';
import type { Transaction } from '../../services/transactions';

export const SubscriptionList = () => {
    const { data: transactions, isLoading } = useTransactions();
    const { baseCurrency } = useSettingsStore();
    const [rates, setRates] = useState<Record<string, number>>({});

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const fetchedRates = await exchangeRateService.getRates(baseCurrency.toLowerCase());
                setRates(fetchedRates);
            } catch (error) {
                console.error("Failed to load rates", error);
            }
        };
        fetchRates();
    }, [baseCurrency]);

    const convert = (amount: number, currency: string = 'USD') => {
        if (currency === baseCurrency) return amount;
        const rate = rates[currency] || rates[currency.toUpperCase()];
        if (rate) return amount * rate;
        if (currency.toUpperCase() === 'USD' && baseCurrency === 'USD') return amount;
        return amount;
    };

    const formatCurrency = (value: number) => {
        try {
            return new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: baseCurrency,
                currencyDisplay: 'symbol',
            }).format(value);
        } catch {
            return `${baseCurrency} ${value.toFixed(2)}`;
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recurring</CardTitle>
                </CardHeader>
                <CardContent className="h-40 flex items-center justify-center">
                    <Loader2Icon className="h-6 w-6 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    // Filter for recurring expenses
    // We want unique subscriptions based on description to avoid duplicates if multiple transactions exists
    // But typically useTransactions returns a list. If we have 12 transactions for Netflix in the year, we only want to show the 'Subscription' item once?
    // The previous logic (in my diff) showed grouped by description.
    // Let's replicate that logic: Group by lowercase description, take the latest one.

    const subMap = new Map<string, Transaction>();
    transactions?.filter((t: Transaction) => t.is_recurring && t.type === 'expense').forEach((t: Transaction) => {
        const key = t.description?.toLowerCase().trim() || 'unknown';
        const existing = subMap.get(key);
        // Keep the one with the latest date to calculate next due date correctly? 
        // Or if we have future recurring transactions generated, we want the next one.
        // Assuming transactions are historical + maybe some future?
        if (!existing || t.date > existing.date) {
            subMap.set(key, t);
        }
    });

    const subscriptions = Array.from(subMap.values());

    // Calculate total monthly cost in base currency
    const totalMonthly = subscriptions.reduce((sum: number, sub: Transaction) => {
        return sum + convert(Number(sub.amount), sub.currency || 'USD');
    }, 0);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-text-muted">
                    Fixed Monthly Costs
                </CardTitle>
                <div className="p-2 bg-primary/10 rounded-full">
                    <CreditCardIcon className="h-4 w-4 text-primary" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-text-main mb-4">
                    {formatCurrency(totalMonthly)}
                </div>
                <div className="space-y-3">
                    {subscriptions.length === 0 ? (
                        <p className="text-sm text-text-muted">No recurring subscriptions yet.</p>
                    ) : (
                        subscriptions.map((sub: Transaction) => {
                            const now = new Date();

                            let nextDate: Date;
                            let daysUntil: number;

                            if (sub.recurring_day) {
                                let day = sub.recurring_day;
                                const currentMonth = now.getMonth();
                                const currentYear = now.getFullYear();

                                const lastDayOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                                if (day > lastDayOfCurrentMonth) day = lastDayOfCurrentMonth;

                                let candidateDate = new Date(currentYear, currentMonth, day);

                                if (candidateDate < now) {
                                    candidateDate = new Date(currentYear, currentMonth + 1, day);
                                    const lastDayOfNextMonth = new Date(currentYear, currentMonth + 2, 0).getDate();
                                    if (day > lastDayOfNextMonth) {
                                        candidateDate = new Date(currentYear, currentMonth + 1, lastDayOfNextMonth);
                                    }
                                }
                                nextDate = candidateDate;
                            } else {
                                nextDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                            }

                            const diffTime = Math.abs(nextDate.getTime() - now.getTime());
                            daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                            return (
                                <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg bg-surface border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${sub.category_id ? 'bg-primary/20 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                                            <CreditCardIcon className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{sub.description}</span>
                                            <span className="text-xs text-text-muted">
                                                Next: {format(nextDate, 'MMM d')} • {daysUntil} days
                                            </span>
                                        </div>
                                    </div>
                                    <span className="font-semibold text-text-main">
                                        {formatCurrency(convert(Number(sub.amount), sub.currency || 'USD'))}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
