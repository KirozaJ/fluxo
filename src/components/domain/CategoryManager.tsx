import { useState } from 'react';
import { useCategories, useCreateCategory, useDeleteCategory } from '../../hooks/queries/useCategories';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { PlusIcon, Trash2Icon, XIcon } from 'lucide-react';
import { z } from 'zod';

const categorySchema = z.object({
    name: z.string()
        .min(1, "Name is required")
        .regex(/^[a-zA-Z0-9\s]+$/, "Name must be text/numbers only (no special characters)"),
    monthly_limit: z.number().positive("Limit must be positive").optional(),
});

export const CategoryManager = ({ onClose }: { onClose?: () => void }) => {
    const { data: categories, isLoading } = useCategories();
    const createMutation = useCreateCategory();
    const deleteMutation = useDeleteCategory();

    const [name, setName] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [monthlyLimit, setMonthlyLimit] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();

        const limitNum = monthlyLimit ? Number(monthlyLimit) : undefined;

        const result = categorySchema.safeParse({
            name,
            monthly_limit: limitNum
        });

        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach(issue => {
                newErrors[issue.path[0] as string] = issue.message;
            });
            setErrors(newErrors);
            return;
        }

        setErrors({});

        createMutation.mutate({
            name,
            type,
            monthly_limit: limitNum
        }, {
            onSuccess: () => {
                setName('');
                setMonthlyLimit('');
            }
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
                <form onSubmit={handleCreate} className="flex flex-col gap-4 mb-6">
                    <div className="flex gap-2 items-start">
                        <div className="w-32">
                            <Select
                                value={type}
                                onChange={(val) => setType(val as 'income' | 'expense')}
                                options={[
                                    { value: 'expense', label: 'Expense' },
                                    { value: 'income', label: 'Income' }
                                ]}
                            />
                        </div>
                        <div className="flex-1">
                            <Input
                                placeholder="Category Name"
                                value={name}
                                onChange={e => {
                                    setName(e.target.value);
                                    if (errors.name) setErrors({ ...errors, name: '' });
                                }}
                                required
                                error={errors.name}
                            />
                        </div>
                    </div>
                    {type === 'expense' && (
                        <div className="flex gap-2 items-start">
                            <div className="flex-1">
                                <Input
                                    type="number"
                                    placeholder="Monthly Limit ($)"
                                    value={monthlyLimit}
                                    onChange={e => {
                                        setMonthlyLimit(e.target.value);
                                        if (errors.monthly_limit) setErrors({ ...errors, monthly_limit: '' });
                                    }}
                                    error={errors.monthly_limit}
                                />
                            </div>
                            <div className="text-xs text-text-muted w-32">
                                (Optional)
                            </div>
                        </div>
                    )}
                    <Button type="submit" isLoading={createMutation.isPending} className="w-full">
                        <PlusIcon className="mr-2 h-4 w-4" /> Add Category
                    </Button>
                </form>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {isLoading ? <p>Loading...</p> : categories?.map(cat => (
                        <div key={cat.id} className="flex justify-between items-center p-2 border border-white/10 rounded hover:bg-secondary/10 transition-colors">
                            <span className="flex items-center gap-2 text-text-main">
                                <span className={`w-2 h-2 rounded-full ${cat.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                                {cat.name}
                                {cat.monthly_limit && (
                                    <span className="text-xs text-text-muted ml-2 px-2 py-0.5 rounded-full bg-surface border border-white/10">
                                        Limit: ${cat.monthly_limit}
                                    </span>
                                )}
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
