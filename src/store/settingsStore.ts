import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
    baseCurrency: string;
    setBaseCurrency: (currency: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            baseCurrency: 'USD',
            setBaseCurrency: (currency) => set({ baseCurrency: currency }),
        }),
        {
            name: 'fluxo-settings',
        }
    )
);
