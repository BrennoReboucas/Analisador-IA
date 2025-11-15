
import { User } from '../types';

// This is a mock user database. In a real application, this would come from a secure backend.
export const users: User[] = [
    {
        id: 'user-admin-001',
        username: 'admin',
        password: 'admin123',
        role: 'admin',
    },
    {
        id: 'user-analyst-002',
        username: 'analista',
        password: 'analista123',
        role: 'user',
    }
];