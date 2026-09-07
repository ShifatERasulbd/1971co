import { createContext, useCallback, useContext, useState } from 'react';

const AppContext = createContext(null);
const AUTH_USER_STORAGE_KEY = 'backend-auth-user-v1';

function readStoredUser() {
    try {
        const raw = sessionStorage.getItem(AUTH_USER_STORAGE_KEY);
        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
        return null;
    }
}

function writeStoredUser(user) {
    try {
        if (user && typeof user === 'object') {
            sessionStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
            return;
        }

        sessionStorage.removeItem(AUTH_USER_STORAGE_KEY);
    } catch {
        // Ignore session storage write failures.
    }
}

export function AppProvider({ children }) {
    const [user, setUserState] = useState(() => readStoredUser());
    const [pageTitle, setPageTitle] = useState('Dashboard');

    const setUser = useCallback((nextUser) => {
        setUserState((previousUser) => {
            const resolvedUser = typeof nextUser === 'function' ? nextUser(previousUser) : nextUser;
            const normalizedUser = resolvedUser && typeof resolvedUser === 'object' ? resolvedUser : null;

            writeStoredUser(normalizedUser);
            return normalizedUser;
        });
    }, []);

    return (
        <AppContext.Provider value={{ user, setUser, pageTitle, setPageTitle }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useAppContext must be used within AppProvider');
    return ctx;
}
