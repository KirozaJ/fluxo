import { useTransactions } from '../../hooks/queries/useTransactions';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

export const CashFlowChart = () => {
    const { data: transactions } = useTransactions();

    // Aggregate by Date
    // We want to show a daily bar chart for the month

    const dataMap = new Map<string, { date: string; income: number; expense: number }>();

    transactions?.forEach(t => {
        const dateKey = t.date;
        if (!dataMap.has(dateKey)) {
            dataMap.set(dateKey, { date: dateKey, income: 0, expense: 0 });
        }
        const entry = dataMap.get(dateKey)!;
        if (t.type === 'income') entry.income += Number(t.amount);
        if (t.type === 'expense') entry.expense += Number(t.amount);
    });

    const data = Array.from(dataMap.values())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(d => ({
            ...d,
            displayDate: format(parseISO(d.date), 'dd MMM')
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
                                formatter={(value: number) => `$${value.toFixed(2)}`}
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
