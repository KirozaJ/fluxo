import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../hooks/queries/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const loginMutation = useLogin();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loginMutation.mutate({ email, password });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background transition-colors duration-300">
            <Card className="w-full max-w-md p-8 shadow-2xl shadow-purple-200/50 dark:shadow-purple-900/20 border-white/40 dark:border-white/10 bg-white/60 dark:bg-surface/60 backdrop-blur-xl">
                <div className="flex justify-center mb-8">
                    <img src="/logo.ico" alt="Fluxo" className="w-24 h-24 rounded-3xl drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] dark:drop-shadow-[0_0_15px_rgba(139,92,246,0.5)] object-cover" />
                </div>
                <h2 className="text-2xl font-bold text-center text-[var(--color-text-main)] mb-8">Welcome Back</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                    {loginMutation.isError && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                            {loginMutation.error?.message || 'Failed to login'}
                        </div>
                    )}
                    <Button
                        type="submit"
                        className="w-full h-12 text-lg shadow-purple-300/50"
                        isLoading={loginMutation.isPending}
                    >
                        Sign In
                    </Button>
                </form>
                <div className="mt-6 text-center text-sm text-gray-500">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-semibold text-[var(--color-primary)] hover:text-purple-700">
                        Sign up
                    </Link>
                </div>
            </Card>
        </div>
    );
}
