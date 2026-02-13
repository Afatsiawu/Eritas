// This file connects the Admin panel to the real backend API.

import { User, Driver } from './definitions';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// --- User Management ---

export async function listUsers(): Promise<User[]> {
    const response = await fetch(`${API_URL}/admin/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    const users = await response.json();
    return users.map((u: any) => ({
        ...u,
        id: u.id.toString(), // Ensure string ID
    }));
}

export async function makeAdmin(email: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/admin/make-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update admin permissions');
    }
    return response.json();
}

export async function deleteUser({ userId }: { userId: string }): Promise<{ success: boolean }> {
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete user');
    return { success: true };
}


// --- Driver Management ---

export async function generateDriverCode(driverDetails: Omit<Driver, 'id' | 'registrationCode'>): Promise<{ registrationCode: string }> {
    const response = await fetch(`${API_URL}/admin/drivers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driverDetails),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create driver');
    }
    const result = await response.json();
    // Assuming backend returns registrationCode or we use their ID
    return { registrationCode: result.user.registrationCode || 'GEN-' + result.user.id.slice(-6) };
}


export async function listDrivers(): Promise<Driver[]> {
    const response = await fetch(`${API_URL}/admin/drivers`);
    if (!response.ok) throw new Error('Failed to fetch drivers');
    const drivers = await response.json();
    return drivers.map((d: any) => ({
        ...d,
        id: d.id.toString(),
    }));
}

export async function deleteDriver({ driverId }: { driverId: string }): Promise<{ success: boolean }> {
    // Backend uses same endpoint for user/driver deletion by ID
    return deleteUser({ userId: driverId });
}
