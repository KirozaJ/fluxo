import { TransactionForm } from './TransactionForm';
import type { Transaction } from '../../services/transactions';

interface TransactionEditModalProps {
    transaction: Transaction;
    onClose: () => void;
}

export const TransactionEditModal = ({ transaction, onClose }: TransactionEditModalProps) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg bg-white rounded-xl shadow-xl">
                <TransactionForm initialData={transaction} onClose={onClose} />
            </div>
        </div>
    );
};
