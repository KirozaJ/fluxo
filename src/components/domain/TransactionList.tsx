import { useTransactions, useDeleteTransaction } from '../../hooks/queries/useTransactions';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { format } from 'date-fns';
import { Trash2Icon } from 'lucide-react';
import { Button } from '../ui/Button';

export const TransactionList = () => {
    const { data: transactions, isLoading } = useTransactions();
    const deleteMutation = useDeleteTransaction();

    if (isLoading) return <div>Loading transactions...</div>;

    if (!transactions?.length) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-500 text-sm">No transactions found.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {transactions.map((t) => (
                        <div key={t.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition shadow-sm">
                            <div className="flex flex-col">
                                <span className="font-medium text-gray-900">{t.description || 'Untitled Transaction'}</span>
                                <span className="text-xs text-gray-500">{format(new Date(t.date), 'MMM d, yyyy')} • {t.categories?.name || 'Uncategorized'}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                    {t.type === 'income' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-400 hover:text-red-500"
                                    onClick={() => {
                                        if (confirm('Are you sure?')) deleteMutation.mutate(t.id);
                                    }}
                                >
                                    <Trash2Icon className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
