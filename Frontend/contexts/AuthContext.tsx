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
    login: (username: string, password: string) => Promise<string | null>;
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
    const login = useCallback(async (username: string, password: string): Promise<string | null> => {
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
                if (response.status === 401) return 'Usuario o contraseña incorrectos';
                if (response.status === 404) return 'Servidor no encontrado (404)';
                return `Error del servidor: ${response.status}`;
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
            return null; // Success (no error message)

        } catch (error) {
            console.error('Login error:', error);
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                return 'No se pudo conectar con el servidor. Verifique que el Backend esté encendido.';
            }
            return 'Error de conexión desconocido.';
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
