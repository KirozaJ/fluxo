import { useTransactions } from '../../hooks/queries/useTransactions';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { ArrowUpIcon, ArrowDownIcon, WalletIcon } from 'lucide-react';

export const DashboardStats = () => {
    const { data: transactions, isLoading } = useTransactions();

    if (isLoading) {
        return <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 dark:bg-white/5 animate-pulse rounded-xl"></div>)}
        </div>;
    }

    const income = transactions
        ?.filter(t => t.type === 'income')
        .reduce((acc, t) => acc + Number(t.amount), 0) || 0;

    const expense = transactions
        ?.filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + Number(t.amount), 0) || 0;

    const balance = income - expense;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--color-text-muted)]">Total Balance</CardTitle>
                    <div className="p-2 bg-primary/10 rounded-full">
                        <WalletIcon className="h-4 w-4 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-[var(--color-text-main)]">${balance.toFixed(2)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--color-text-muted)]">Income</CardTitle>
                    <div className="p-2 bg-success/10 rounded-full">
                        <ArrowUpIcon className="h-4 w-4 text-success" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-success">+${income.toFixed(2)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--color-text-muted)]">Expenses</CardTitle>
                    <div className="p-2 bg-error/10 rounded-full">
                        <ArrowDownIcon className="h-4 w-4 text-error" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-rose-600">-${expense.toFixed(2)}</div>
                </CardContent>
            </Card>
        </div>
    );
};
