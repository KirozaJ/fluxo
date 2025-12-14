import { useState } from 'react';
import { useCategories, useCreateCategory, useDeleteCategory } from '../../hooks/queries/useCategories';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { PlusIcon, Trash2Icon, XIcon } from 'lucide-react';

export const CategoryManager = ({ onClose }: { onClose?: () => void }) => {
    const { data: categories, isLoading } = useCategories();
    const createMutation = useCreateCategory();
    const deleteMutation = useDeleteCategory();

    const [name, setName] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({ name, type }, {
            onSuccess: () => setName('')
        });
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Manage Categories</CardTitle>
                {onClose && (
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <XIcon className="h-4 w-4" />
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                <form onSubmit={handleCreate} className="flex gap-2 mb-6">
                    <select
                        className="h-10 rounded-md border border-white/10 bg-background text-text-main px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        value={type}
                        onChange={e => setType(e.target.value as 'income' | 'expense')}
                    >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                    </select>
                    <Input
                        placeholder="New Category Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        className="flex-1"
                    />
                    <Button type="submit" isLoading={createMutation.isPending}>
                        <PlusIcon className="h-4 w-4" />
                    </Button>
                </form>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {isLoading ? <p>Loading...</p> : categories?.map(cat => (
                        <div key={cat.id} className="flex justify-between items-center p-2 border border-white/10 rounded hover:bg-secondary/10 transition-colors">
                            <span className="flex items-center gap-2 text-text-main">
                                <span className={`w-2 h-2 rounded-full ${cat.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                                {cat.name}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:text-red-500"
                                onClick={() => deleteMutation.mutate(cat.id)}
                            >
                                <Trash2Icon className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    {!isLoading && categories?.length === 0 && (
                        <p className="text-sm text-text-muted text-center">No categories yet.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
