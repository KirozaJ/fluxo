import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService, type CreateTransactionParams, type UpdateTransactionParams } from '../../services/transactions';

import { useDashboardStore } from '../../store/dashboardStore';

export const useTransactions = () => {
    const { getDateRange } = useDashboardStore();
    const { startDate, endDate } = getDateRange();

    return useQuery({
        queryKey: ['transactions', startDate, endDate],
        queryFn: () => transactionService.getAll(startDate, endDate),
    });
};

export const useCreateTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: CreateTransactionParams) => transactionService.create(params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }); // For if we separate calls
        },
    });
};

export const useUpdateTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: UpdateTransactionParams) => transactionService.update(params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
    });
};

export const useDeleteTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => transactionService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
    });
};
