import { useState, useEffect } from 'react';
import { useTransactions } from '../../hooks/queries/useTransactions';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { useSettingsStore } from '../../store/settingsStore';
import { exchangeRateService } from '../../services/exchangeRates';
import { parseLocalDate } from '../../lib/date';

export const CashFlowChart = () => {
    const { data: transactions } = useTransactions();
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
        return amount; // Fallback
    };

    // Aggregate by Date
    const dataMap = new Map<string, { date: string; income: number; expense: number }>();

    transactions?.forEach(t => {
        const dateKey = t.date;
        if (!dataMap.has(dateKey)) {
            dataMap.set(dateKey, { date: dateKey, income: 0, expense: 0 });
        }
        const entry = dataMap.get(dateKey)!;
        const convertedAmount = convert(Number(t.amount), t.currency || 'USD');

        if (t.type === 'income') entry.income += convertedAmount;
        if (t.type === 'expense') entry.expense += convertedAmount;
    });

    const data = Array.from(dataMap.values())
        .sort((a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime())
        .map(d => ({
            ...d,
            displayDate: format(parseLocalDate(d.date), 'dd MMM')
        }));

    if (data.length === 0) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Cash Flow</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center text-gray-500">
                    No data for this period
                </CardContent>
            </Card>
        );
    }

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

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Cash Flow</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                formatter={(value: number) => formatCurrency(value)}
                                contentStyle={{
                                    backgroundColor: 'var(--color-surface)',
                                    borderColor: 'var(--color-border)',
                                    color: 'var(--color-text-main)',
                                    borderRadius: '0.75rem',
                                }}
                                labelStyle={{ color: 'var(--color-text-muted)' }}
                            />
                            <Bar dataKey="income" fill="#22c55e" name="Income" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
