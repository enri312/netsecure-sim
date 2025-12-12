import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

// Types
export type UserRole = 'admin' | 'technician';

export interface User {
    id: string;
    username: string;
    role: UserRole;
    token: string;
}

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    hasPermission: (permission: string) => boolean;
}

// Permissions by role
const rolePermissions: Record<UserRole, string[]> = {
    admin: [
        'view:topology',
        'view:logs',
        'simulate:traffic',
        'manage:vlans',
        'manage:devices',
        'manage:acls',
        'export:data',
        'analyze:ai'
    ],
    technician: [
        'view:topology',
        'view:logs',
        'simulate:traffic',
        'manage:devices',
        'analyze:ai'
    ]
};

// Mock users (will be replaced by backend API)
const MOCK_USERS = [
    { id: '1', username: 'CENV', password: '8994C', role: 'admin' as UserRole }
];

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const AUTH_STORAGE_KEY = 'netsecure_auth';

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load stored auth on mount
    useEffect(() => {
        const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedAuth) {
            try {
                const parsedUser = JSON.parse(storedAuth) as User;
                setUser(parsedUser);
            } catch (error) {
                console.error('Error parsing stored auth:', error);
                localStorage.removeItem(AUTH_STORAGE_KEY);
            }
        }
        setIsLoading(false);
    }, []);

    // Login function
    const login = useCallback(async (username: string, password: string): Promise<boolean> => {
        setIsLoading(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5009/api';

            const response = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                console.error('Login failed:', response.statusText);
                return false;
            }

            const data = await response.json();

            // Map API response to User object
            const authenticatedUser: User = {
                id: '1', // The backend calculates ID via JWT claims usually, or we can use the one returned
                username: data.username,
                role: data.role as UserRole,
                token: data.token
            };

            setUser(authenticatedUser);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
            return true;

        } catch (error) {
            console.error('Login error:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Logout function
    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
    }, []);

    // Check permission
    const hasPermission = useCallback((permission: string): boolean => {
        if (!user) return false;
        return rolePermissions[user.role]?.includes(permission) ?? false;
    }, [user]);

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
