import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContextProvider.tsx";
import type { ReactNode } from 'react'; // Explicit type import

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole?: 'user' | 'serviceProvider';
    redirectTo?: string;
    unauthorizedRedirectTo?: string;
    additionalState?: Record<string, unknown>;
}

export const ProtectedRoute = ({
                                   children,
                                   requiredRole,
                                   redirectTo = '/service-provider-details',
                                   unauthorizedRedirectTo = '/',
                                   additionalState = {}
                               }: ProtectedRouteProps) => {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return (
            <Navigate
                to={redirectTo}
                state={{
                    from: location.pathname,
                    ...additionalState
                }}
                replace
            />
        );
    }

    if (requiredRole && user?.accountType !== requiredRole) {
        return (
            <Navigate
                to={unauthorizedRedirectTo}
                state={{
                    from: location.pathname,
                    attemptedRole: requiredRole,
                    ...additionalState
                }}
                replace
            />
        );
    }

    return <>{children}</>;
};

ProtectedRoute.displayName = 'ProtectedRoute';