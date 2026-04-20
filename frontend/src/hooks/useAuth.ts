'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

export function useAuth(requireAuth: boolean = true) {
    const router = useRouter();
    const { user, token, hydrated } = useAppSelector((state) => state.auth);

    useEffect(() => {
        // Only redirect after auth state has been hydrated from localStorage
        if (requireAuth && hydrated && !token) {
            router.push('/login');
        }
    }, [token, requireAuth, router, hydrated]);

    return { user, token, isAuthenticated: !!token, hydrated };
}

export function useRole(allowedRoles: string[]) {
    const { user } = useAppSelector((state) => state.auth);

    if (!user) return false;
    return allowedRoles.includes(user.role);
}
