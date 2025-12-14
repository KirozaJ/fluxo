import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../hooks/queries/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const loginMutation = useLogin();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loginMutation.mutate({ email, password });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
                    <p className="text-gray-600 mt-2">Sign in to manage your finances</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="you@example.com"
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                    />

                    <Button
                        type="submit"
                        className="w-full"
                        isLoading={loginMutation.isPending}
                    >
                        Sign In
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
}
