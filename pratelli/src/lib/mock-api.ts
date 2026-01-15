// This file mocks a backend API for demonstration purposes.
// In a real application, these functions would make network requests to a server.

import { User, Driver } from './definitions';

const mockApi = (delay = 500) => new Promise(resolve => setTimeout(resolve, delay));

// --- User Management ---

export async function listUsers(): Promise<User[]> {
  await mockApi();
  const allUsers = JSON.parse(localStorage.getItem('allUsers') || '{}');
  // Ensure each user object has an 'id' property matching its key (email) and default walletBalance
  return Object.keys(allUsers).map(email => ({
    id: email,
    walletBalance: 0, // Default wallet balance if not present
    ...allUsers[email]
  }));
}

export async function makeAdmin(email: string): Promise<{ message: string }> {
    await mockApi();
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '{}');
    if (!allUsers[email]) {
        throw new Error(`User with email ${email} not found.`);
    }
    if (allUsers[email].isAdmin) {
        return { message: `${email} is already an admin.` };
    }
    allUsers[email].isAdmin = true;
    localStorage.setItem('allUsers', JSON.stringify(allUsers));

    // also update current user if they are the one being made admin
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    if(currentUser && currentUser.email === email) {
        currentUser.isAdmin = true;
        localStorage.setItem('user', JSON.stringify(currentUser));
    }

    return { message: `Successfully made ${email} an admin.` };
}

export async function deleteUser({ userId }: { userId: string }): Promise<{ success: boolean }> {
    await mockApi();
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '{}');
    if (allUsers[userId]) {
        delete allUsers[userId];
        localStorage.setItem('allUsers', JSON.stringify(allUsers));
    }
    return { success: true };
}


// --- Driver Management ---

export async function generateDriverCode(driverDetails: Omit<Driver, 'id' | 'registrationCode'>): Promise<{ registrationCode: string }> {
    await mockApi();
    const drivers = JSON.parse(localStorage.getItem('drivers') || '[]');
    const registrationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newDriver: Driver = {
        ...driverDetails,
        id: driverDetails.email, // using email as ID for simplicity
        registrationCode,
    };
    drivers.push(newDriver);
    localStorage.setItem('drivers', JSON.stringify(drivers));
    return { registrationCode };
}


export async function listDrivers(): Promise<Driver[]> {
    await mockApi();
    const drivers = JSON.parse(localStorage.getItem('drivers') || '[]');
    return drivers;
}

export async function deleteDriver({ driverId }: { driverId: string }): Promise<{ success: boolean }> {
    await mockApi();
    let drivers: Driver[] = JSON.parse(localStorage.getItem('drivers') || '[]');
    drivers = drivers.filter(driver => driver.id !== driverId);
    localStorage.setItem('drivers', JSON.stringify(drivers));
    return { success: true };
}
