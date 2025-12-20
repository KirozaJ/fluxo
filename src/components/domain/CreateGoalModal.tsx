import { useState } from 'react';
import { Card, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { XIcon } from 'lucide-react';
import { savingsService } from '../../services/savings';
import { useQueryClient } from '@tanstack/react-query';

interface CreateGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const COLORS = [
    { name: 'Blue', value: 'blue-500' },
    { name: 'Green', value: 'green-500' },
    { name: 'Purple', value: 'purple-500' },
    { name: 'Pink', value: 'pink-500' },
    { name: 'Yellow', value: 'yellow-500' },
    { name: 'Red', value: 'red-500' },
];

const ICONS = ['💰', '🏝️', '🚗', '🏠', '🎁', '🎓', '💍', '💻', '🚲', '🐶'];

export const CreateGoalModal = ({ isOpen, onClose }: CreateGoalModalProps) => {
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [color, setColor] = useState(COLORS[0].value);
    const [icon, setIcon] = useState(ICONS[0]);
    const [isLoading, setIsLoading] = useState(false);

    const queryClient = useQueryClient();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await savingsService.create({
                name,
                target_amount: Number(targetAmount),
                color,
                icon
            });
            await queryClient.invalidateQueries({ queryKey: ['savings_goals'] });
            onClose();
            // Reset form
            setName('');
            setTargetAmount('');
            setColor(COLORS[0].value);
            setIcon(ICONS[0]);
        } catch (error) {
            console.error('Failed to create goal:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-md bg-background border-border shadow-xl">
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <CardTitle>New Savings Pot</CardTitle>
                    <button onClick={onClose} className="text-text-muted hover:text-text-main">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">
                                Goal Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 bg-secondary/10 border border-secondary/20 rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="e.g. Vacation"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">
                                Target Amount
                            </label>
                            <input
                                type="number"
                                value={targetAmount}
                                onChange={(e) => setTargetAmount(e.target.value)}
                                className="w-full px-3 py-2 bg-secondary/10 border border-secondary/20 rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="1000.00"
                                step="0.01"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">
                                Color
                            </label>
                            <div className="flex gap-2">
                                {COLORS.map((c) => (
                                    <button
                                        key={c.value}
                                        type="button"
                                        onClick={() => setColor(c.value)}
                                        className={`w-8 h-8 rounded-full bg-${c.value} transition-transform ${color === c.value ? 'ring-2 ring-offset-2 ring-text-main scale-110' : 'hover:scale-105'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">
                                Icon
                            </label>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                                {ICONS.map((i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setIcon(i)}
                                        className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl border transition-colors ${icon === i
                                            ? 'bg-primary/20 border-primary text-primary'
                                            : 'bg-secondary/10 border-transparent text-text-muted hover:bg-secondary/20'
                                            }`}
                                    >
                                        {i}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                className="flex-1"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                className="flex-1"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Creating...' : 'Create Pot'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
