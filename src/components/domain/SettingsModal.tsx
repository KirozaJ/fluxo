import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../hooks/useTheme';
import { useSettingsStore } from '../../store/settingsStore';
import { XIcon, SmartphoneIcon, UserIcon, InfoIcon, MonitorIcon, SettingsIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';

interface SettingsModalProps {
    onClose: () => void;
}

type Tab = 'account' | 'appearance' | 'preferences' | 'about';

export function SettingsModal({ onClose }: SettingsModalProps) {
    const { user } = useAuthStore();
    const { theme, setTheme } = useTheme();
    const { baseCurrency, setBaseCurrency } = useSettingsStore();
    const [activeTab, setActiveTab] = useState<Tab>('account');
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div ref={modalRef} className="bg-surface text-text-main rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col md:flex-row border border-white/10">

                {/* Sidebar */}
                <div className="w-full md:w-64 bg-secondary/10 border-r border-white/10 p-4 flex flex-col gap-2">
                    <h2 className="text-xl font-bold px-4 mb-4">Settings</h2>

                    <button
                        onClick={() => setActiveTab('account')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${activeTab === 'account' ? 'bg-primary text-white shadow-md' : 'hover:bg-white/10'}`}
                    >
                        <UserIcon className="w-4 h-4" /> Account
                    </button>
                    <button
                        onClick={() => setActiveTab('appearance')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${activeTab === 'appearance' ? 'bg-primary text-white shadow-md' : 'hover:bg-white/10'}`}
                    >
                        <SmartphoneIcon className="w-4 h-4" /> Appearance
                    </button>
                    <button
                        onClick={() => setActiveTab('preferences')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${activeTab === 'preferences' ? 'bg-primary text-white shadow-md' : 'hover:bg-white/10'}`}
                    >
                        <SettingsIcon className="w-4 h-4" /> Preferences
                    </button>
                    <button
                        onClick={() => setActiveTab('about')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${activeTab === 'about' ? 'bg-primary text-white shadow-md' : 'hover:bg-white/10'}`}
                    >
                        <InfoIcon className="w-4 h-4" /> About
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-surface">
                    <div className="flex justify-between items-center mb-6 md:hidden">
                        <h3 className="text-lg font-bold capitalize">{activeTab}</h3>
                        <Button variant="ghost" size="icon" onClick={onClose}><XIcon className="w-5 h-5" /></Button>
                    </div>
                    {/* Desktop Close Button */}
                    <div className="hidden md:flex justify-end mb-2">
                        <Button variant="ghost" size="icon" onClick={onClose}><XIcon className="w-5 h-5" /></Button>
                    </div>

                    {activeTab === 'account' && (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center p-6 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
                                <div className="w-20 h-20 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-lg">
                                    {user?.email?.charAt(0).toUpperCase()}
                                </div>
                                <h3 className="text-lg font-bold">{user?.email}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Personal Account</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'appearance' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Theme</h3>
                                <p className="text-sm text-gray-500 mb-6">Choose how Fluxo looks on your device.</p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Light Mode Card */}
                                    <button
                                        onClick={() => setTheme('light')}
                                        className={`relative group rounded-xl border-2 p-1 transition-all ${theme === 'light' ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-gray-200'}`}
                                    >
                                        <div className="bg-[#F5F3FF] rounded-lg h-24 w-full mb-2 border border-gray-200 flex items-center justify-center">
                                            <div className="bg-white p-2 rounded shadow-sm"><div className="w-8 h-2 bg-gray-200 rounded"></div></div>
                                        </div>
                                        <span className="text-sm font-medium block text-center">Light</span>
                                        {theme === 'light' && <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full text-white flex items-center justify-center text-[10px]">✓</div>}
                                    </button>

                                    {/* Dark Mode Card */}
                                    <button
                                        onClick={() => setTheme('dark')}
                                        className={`relative group rounded-xl border-2 p-1 transition-all ${theme === 'dark' ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-gray-700'}`}
                                    >
                                        <div className="bg-[#0F0720] rounded-lg h-24 w-full mb-2 border border-gray-800 flex items-center justify-center">
                                            <div className="bg-[#1E1B2E] p-2 rounded shadow-sm border border-gray-700"><div className="w-8 h-2 bg-gray-600 rounded"></div></div>
                                        </div>
                                        <span className="text-sm font-medium block text-center">Dark</span>
                                        {theme === 'dark' && <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full text-white flex items-center justify-center text-[10px]">✓</div>}
                                    </button>

                                    {/* System Mode Card */}
                                    <button
                                        onClick={() => setTheme('system')}
                                        className={`relative group rounded-xl border-2 p-1 transition-all ${theme === 'system' ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'}`}
                                    >
                                        <div className="bg-gradient-to-r from-[#F5F3FF] to-[#0F0720] rounded-lg h-24 w-full mb-2 border border-gray-200 dark:border-gray-800 flex items-center justify-center opacity-80">
                                            <MonitorIcon className="text-gray-500 dark:text-gray-300" />
                                        </div>
                                        <span className="text-sm font-medium block text-center">System</span>
                                        {theme === 'system' && <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full text-white flex items-center justify-center text-[10px]">✓</div>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Currency</h3>
                                <p className="text-sm text-gray-500 mb-6">Set your primary currency for reporting.</p>
                                <div className="max-w-xs">
                                    <Select
                                        label="Base Currency"
                                        value={baseCurrency}
                                        onChange={setBaseCurrency}
                                        options={[
                                            { value: 'USD', label: 'USD - United States Dollar' },
                                            { value: 'EUR', label: 'EUR - Euro' },
                                            { value: 'BRL', label: 'BRL - Brazilian Real' },
                                            { value: 'GBP', label: 'GBP - British Pound' },
                                            { value: 'BTC', label: 'BTC - Bitcoin' },
                                            { value: 'ETH', label: 'ETH - Ethereum' },
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'about' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-secondary/10 rounded-xl">
                                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">F</div>
                                <div>
                                    <h4 className="font-bold">Fluxo</h4>
                                    <p className="text-sm opacity-70">Version 1.0.0 (Beta)</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Fluxo is a modern financial management tool designed to help you track your income and expenses with ease.
                                Built with React, Tailwind CSS, and Supabase.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
