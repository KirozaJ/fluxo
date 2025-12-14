import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../services/auth';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const useLogin = () => {
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);

    return useMutation({
        mutationFn: authService.signIn,
        onSuccess: (data) => {
            setUser(data.user);
            navigate('/dashboard');
        },
        onError: (error) => {
            console.error('Login failed:', error);
            // Ideally show a toast notification here
        }
    });
};

export const useRegister = () => {
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);

    return useMutation({
        mutationFn: authService.signUp,
        onSuccess: (data) => {
            if (data.user) {
                setUser(data.user);
                navigate('/dashboard');
            }
        },
        onError: (error) => {
            console.error('Registration failed:', error);
        }
    });
};

export const useLogout = () => {
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authService.signOut,
        onSuccess: () => {
            setUser(null);
            queryClient.clear();
            navigate('/login');
        },
    });
};
