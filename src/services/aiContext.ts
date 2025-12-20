import { transactionService, type Transaction } from './transactions';
import { categoryService, type Category } from './categories';

export const aiContextService = {
    async gatherContext() {
        // Fetch recent data
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString();

        const [transactions, categories] = await Promise.all([
            transactionService.getAll(firstDayOfMonth, lastDayOfMonth),
            categoryService.getAll()
        ]);

        // Filter budgets
        const budgets = categories.filter(c => c.monthly_limit && c.monthly_limit > 0 && c.type === 'expense');

        // Calculate summary stats
        const totalSpent = transactions.reduce((sum: number, t: Transaction) => t.type === 'expense' ? sum + Number(t.amount) : sum, 0);
        const totalIncome = transactions.reduce((sum: number, t: Transaction) => t.type === 'income' ? sum + Number(t.amount) : sum, 0);

        // Calculate budget spending
        // Ideally we sum up transactions per category.
        const spendingMap = new Map<string, number>();
        transactions.forEach((t: Transaction) => {
            if (t.type === 'expense' && t.category_id) {
                const current = spendingMap.get(t.category_id) || 0;
                spendingMap.set(t.category_id, current + Number(t.amount));
            }
        });

        // Format for LLM
        return `
Current Financial Context (Month to Date):
- Total Income: ${totalIncome}
- Total Expenses: ${totalSpent}
- Net Cash Flow: ${totalIncome - totalSpent}

Budgets:
${budgets.map((b: Category) => `- ${b.name}: ${spendingMap.get(b.id) || 0} / ${b.monthly_limit}`).join('\n')}

Recent Transactions (Last 5):
${transactions.slice(0, 5).map((t: Transaction) => `- ${t.date}: ${t.description} (${t.amount} ${t.currency || 'USD'})`).join('\n')}
        `.trim();
    }
};
