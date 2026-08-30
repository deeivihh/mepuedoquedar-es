"use client";

import {
    createContext,
    useContext,
    useSyncExternalStore,
    useMemo,
    useCallback,
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

const STORAGE_KEY = "user_preferences_v1";

let memoryPrefs = DEFAULT_PREFERENCES;
let initialized = false;

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

function getSnapshot() {
    if (!initialized) {
        if (typeof window !== "undefined") {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    memoryPrefs = { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
                }
            } catch {}
        }
        initialized = true;
    }
    return memoryPrefs;
}

function getServerSnapshot() {
    return DEFAULT_PREFERENCES;
}

function setPreferencesAction(prefs: UserPreferences) {
    memoryPrefs = prefs;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {}
    listeners.forEach((l) => l());
}

const PreferencesContext = createContext<PreferencesContextValue>({
    preferences: DEFAULT_PREFERENCES,
    setPreferences: () => {},
    isDefault: true,
});

export function PreferencesProvider({ children }: { children: ReactNode }) {
    const preferences = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const setPreferences = useCallback((prefs: UserPreferences) => {
        setPreferencesAction(prefs);
    }, []);

    const isDefault = PREFERENCES_SCHEMA.every(
        (config) => preferences[config.id] === config.defaultValue
    );

    const value = useMemo(() => ({
        preferences,
        setPreferences,
        isDefault,
    }), [preferences, setPreferences, isDefault]);

    return (
        <PreferencesContext.Provider value={value}>
            {children}
        </PreferencesContext.Provider>
    );
}

export function usePreferences() {
    return useContext(PreferencesContext);
}
