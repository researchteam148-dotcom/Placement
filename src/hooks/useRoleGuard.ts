'use client';

import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useRoleGuard(allowedRoles: UserRole[], redirectTo: string = '/auth/login') {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push(redirectTo);
            } else if (!allowedRoles.includes(user.role)) {
                // Redirect to their respective dashboard if they match another role
                router.push(`/dashboard/${user.role}`);
            }
        }
    }, [user, loading, allowedRoles, router, redirectTo]);

    return { user, loading };
}
