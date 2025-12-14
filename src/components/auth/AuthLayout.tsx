import { useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth';
import { supabase } from '../../lib/supabase';

export const AuthLayout = () => {
    const { user, setUser, isLoading, setIsLoading } = useAuthStore();
    const location = useLocation();

    useEffect(() => {
        let mounted = true;

        const initSession = async () => {
            try {
                const session = await authService.getSession();
                if (mounted) {
                    setUser(session?.user ?? null);
                }
            } catch (error) {
                console.error('Error checking session:', error);
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        initSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) {
                setUser(session?.user ?? null);
                setIsLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [setUser, setIsLoading]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
            </div>
        );
    }

    // If we are on an auth page (login/register) and have a user, redirect to dashboard
    const isAuthPage = ['/login', '/register'].includes(location.pathname);
    if (user && isAuthPage) {
        return <Navigate to="/dashboard" replace />;
    }

    // If we are on a protected page and don't have a user, redirect to login
    const isProtectedPage = !isAuthPage && location.pathname !== '/';
    if (!user && isProtectedPage) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
