import type { APIRoute } from "astro";
import { checkPassword, setSessionCookie } from "@lib/auth";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
	let password = "";
	try {
		const body = await request.json();
		password = String(body?.password ?? "");
	} catch {
		return new Response(JSON.stringify({ error: "Invalid request" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	if (!password || !checkPassword(password)) {
		return new Response(JSON.stringify({ error: "Galat password" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	setSessionCookie(cookies);
	return new Response(JSON.stringify({ ok: true }), {
		status: 200,
		headers: { "Content-Type": "application/json" },
	});
};
