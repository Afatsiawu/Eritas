'use server';
import { z } from 'zod';

export const UserSchema = z.object({
    id: z.string(),
    fullName: z.string(),
    email: z.string(),
    isAdmin: z.boolean(),
    walletBalance: z.number(),
});
export type User = z.infer<typeof UserSchema>;


export const DriverSchema = z.object({
    id: z.string(),
    fullName: z.string(),
    email: z.string(),
    licenseNumber: z.string(),
    ghanaCardNumber: z.string(),
    busPlateNumber: z.string(),
    registrationCode: z.string(),
});
export type Driver = z.infer<typeof DriverSchema>;


// Types for generateDriverCode action
export const GenerateDriverCodeInputSchema = z.object({
  fullName: z.string().min(3, 'Full name is required.'),
  email: z.string().email('A valid email is required.'),
  licenseNumber: z.string().min(1, 'License number is required.'),
  ghanaCardNumber: z.string().min(1, 'Ghana card number is required.'),
  busPlateNumber: z.string().min(1, 'Bus plate number is required.'),
});
export type GenerateDriverCodeInput = z.infer<typeof GenerateDriverCodeInputSchema>;

export const GenerateDriverCodeOutputSchema = z.object({
  registrationCode: z.string(),
});
export type GenerateDriverCodeOutput = z.infer<typeof GenerateDriverCodeOutputSchema>;

// Types for listUsers action
export const ListUsersOutputSchema = z.object({
  users: z.array(z.object({
    id: z.string(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    walletBalance: z.number().optional(),
  })),
});
export type ListUsersOutput = z.infer<typeof ListUsersOutputSchema>;

// Types for deleteUser action
export const DeleteUserInputSchema = z.object({
  userId: z.string(),
});
export type DeleteUserInput = z.infer<typeof DeleteUserInputSchema>;

export const DeleteUserOutputSchema = z.object({
  message: z.string(),
});
export type DeleteUserOutput = z.infer<typeof DeleteUserOutputSchema>;


// Types for listDrivers action
export const ListDriversOutputSchema = z.array(DriverSchema);
export type ListDriversOutput = z.infer<typeof ListDriversOutputSchema>;


// Types for deleteDriver action
export const DeleteDriverInputSchema = z.object({
  driverId: z.string(),
});
export type DeleteDriverInput = z.infer<typeof DeleteDriverInputSchema>;

export const DeleteDriverOutputSchema = z.object({
  message: z.string(),
});
export type DeleteDriverOutput = z.infer<typeof DeleteDriverOutputSchema>;


// Types for makeAdmin action
export const MakeAdminInputSchema = z.object({
    email: z.string().email(),
});
export type MakeAdminInput = z.infer<typeof MakeAdminInputSchema>;

export const MakeAdminOutputSchema = z.object({
    message: z.string(),
});
export type MakeAdminOutput = z.infer<typeof MakeAdminOutputSchema>;
