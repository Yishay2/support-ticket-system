"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { logEvent } from "@/app/utils/sentry";
import { SignAuthToken, removeAuthCookie, setAuthCookie } from "@/lib/auth";

type ResponeResult = {
    success: boolean,
    message: string
}

export async function RegisterUser(prevState: ResponeResult, formData: FormData): Promise<ResponeResult> {
    try {
        const name = formData.get('name') as string;
        const password = formData.get('password') as string;
        const email = formData.get('email') as string;

        if (!name || !email || !password) {
            logEvent('Validation error: missing registration fields', 'auth', { formData }, 'warning');
            return { success: false, message: 'All fields are required!' }
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            logEvent(`Registration failed: User already exist - ${email}`, 'auth', { email }, 'warning');
            return { success: false, message: 'User already exists!' }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name, email, password: hashedPassword,
            }
        })

        const token = await SignAuthToken({ userId: user.id });
        await setAuthCookie(token);
        logEvent(`User registered successfully: ${email}`, 'auth', { userId: user.id, email }, 'info')
        return { success: true, message: 'Registration successful' }
    } catch (error) {
        logEvent('Unexpected error during registration', 'auth', {}, 'error', error);
        return { success: false, message: 'Something went wrong, please try again..' }
    }
}

export async function logOutUser(): Promise<ResponeResult> {
    try {
        await removeAuthCookie();
        logEvent('User log out successfully!', 'auth', {}, 'info');
        return { success: true, message: 'Logout successful' }
    } catch (error) {
        logEvent('Unexpected Error during logout', 'auth', {}, 'error', error);
        return { success: false, message: 'Logout failed, please try again..' }
    }
}

export async function loginUser(prevState: ResponeResult, formData: FormData): Promise<ResponeResult> {
    try {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!email || !password) {
            logEvent('Validation error: missing login fields', 'auth', { email }, 'warning');
            return { success: false, message: 'Email and password are required' }
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.password) {
            logEvent(`Login failed: User not found - ${email}`, 'auth', { email }, 'warning');
            return { success: false, message: 'Invalid email or password' }
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            logEvent(`Login failed: Incorrect password`, 'auth', { email }, 'warning');
            return { success: false, message: 'Invalid email or password' }
        }

        const token = await SignAuthToken({ userId: user.id });
        await setAuthCookie(token);
        return { success: true, message: 'Login successful' };
    } catch (error) {
        logEvent("Unexpected error during login", 'auth', {}, 'error', error);
        return { success: false, message: 'Error during login!'}
    }
}