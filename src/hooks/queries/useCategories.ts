import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService, type CreateCategoryParams } from '../../services/categories';

export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: categoryService.getAll,
    });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: CreateCategoryParams) => categoryService.create(params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => categoryService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};
