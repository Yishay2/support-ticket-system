import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { logEvent } from "@/app/utils/sentry";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
const cookieName = 'auth-token';

export async function SignAuthToken(payload: any) {
    try {
        const token = await new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(secret);
        return token;
    } catch (error) {
        logEvent('Token signing failed', 'auth', { payload }, 'error', error);
        throw new Error('Token signing failed');
    }
}

export async function verifyAuthToken<T>(token: string): Promise<T> {
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload as T;
    } catch (error) {
        logEvent('Token decryption failed', 'auth', { tokenSnippet: token.slice(0, 10) }, 'error', error);
        throw new Error('Token decryption failed');
    }
}

export async function setAuthCookie(token: string) {
    try {
        const cookieStore = await cookies();
        cookieStore.set(cookieName, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 7 });
    } catch (error) {
        logEvent('Failed to set cookie', 'auth', { token }, 'error', error);
    }
}

export async function getAuthCookie() {
    const cookieStore = await cookies();
    const token = cookieStore.get(cookieName);
    return token?.value;
}

export async function removeAuthCookie() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete(cookieName);
    } catch (error) {
        logEvent('Failed to remove auth cookie', 'auth', {}, 'error', error);
    }
}