import { createHmac, timingSafeEqual } from "node:crypto";
import type { AstroCookies } from "astro";

export const SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getSecret(): string {
	const secret = import.meta.env.SESSION_SECRET;
	if (!secret) {
		throw new Error(
			"SESSION_SECRET is not set. Add it to your .env file and Vercel project settings.",
		);
	}
	return secret;
}

function sign(value: string): string {
	return createHmac("sha256", getSecret()).update(value).digest("hex");
}

/** Creates a signed session token: "<expiryTimestamp>.<hmacSignature>" */
export function createSessionToken(): string {
	const expires = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
	const payload = String(expires);
	const signature = sign(payload);
	return `${payload}.${signature}`;
}

function isValidToken(token: string | undefined): boolean {
	if (!token) return false;
	const [payload, signature] = token.split(".");
	if (!payload || !signature) return false;

	const expected = sign(payload);
	const a = new Uint8Array(Buffer.from(signature));
	const b = new Uint8Array(Buffer.from(expected));
	if (a.length !== b.length) return false;
	if (!timingSafeEqual(a, b)) return false;

	const expires = Number(payload);
	if (Number.isNaN(expires) || Date.now() > expires) return false;

	return true;
}

export function isAdminRequest(cookies: AstroCookies): boolean {
	return isValidToken(cookies.get(SESSION_COOKIE)?.value);
}

export function setSessionCookie(cookies: AstroCookies): void {
	cookies.set(SESSION_COOKIE, createSessionToken(), {
		path: "/",
		httpOnly: true,
		secure: import.meta.env.PROD,
		sameSite: "lax",
		maxAge: SESSION_MAX_AGE_SECONDS,
	});
}

export function clearSessionCookie(cookies: AstroCookies): void {
	cookies.delete(SESSION_COOKIE, { path: "/" });
}

export function checkPassword(password: string): boolean {
	const adminPassword = import.meta.env.ADMIN_PASSWORD;
	if (!adminPassword) {
		throw new Error(
			"ADMIN_PASSWORD is not set. Add it to your .env file and Vercel project settings.",
		);
	}
	const a = new Uint8Array(Buffer.from(password));
	const b = new Uint8Array(Buffer.from(adminPassword));
	if (a.length !== b.length) return false;
	return timingSafeEqual(a, b);
}
