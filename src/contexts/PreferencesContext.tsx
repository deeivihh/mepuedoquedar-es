"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import {
    UserPreferences,
    DEFAULT_PREFERENCES,
} from "@/lib/scores/userPreferences";
import { PREFERENCES_SCHEMA } from "@/lib/scores/preferencesSchema";

interface PreferencesContextValue {
    preferences: UserPreferences;
    setPreferences: (prefs: UserPreferences) => void;
    isDefault: boolean;
}

const PreferencesContext = createContext<PreferencesContextValue>({
    preferences: DEFAULT_PREFERENCES,
    setPreferences: () => { },
    isDefault: true,
});

const STORAGE_KEY = "user_preferences_v1";

export function PreferencesProvider({ children }: { children: ReactNode }) {
    const [preferences, setPreferencesState] = useState<UserPreferences>(DEFAULT_PREFERENCES);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setPreferencesState({ ...DEFAULT_PREFERENCES, ...JSON.parse(stored) });
            }
        } catch {

        }
        setHydrated(true);
    }, []);

    function setPreferences(prefs: UserPreferences) {
        setPreferencesState(prefs);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
        } catch {
        }
    }

    const isDefault = hydrated && PREFERENCES_SCHEMA.every(
        (config) => preferences[config.id] === config.defaultValue
    );

    return (
        <PreferencesContext.Provider value={{ preferences, setPreferences, isDefault }}>
            {children}
        </PreferencesContext.Provider>
    );
}

export function usePreferences() {
    return useContext(PreferencesContext);
}
