import { defineMiddleware } from "astro:middleware";
import { isAdminRequest } from "./lib/auth";

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// API paths that are always public, even for write methods
// (liking a post, and posting a comment, are visitor actions).
const PUBLIC_WRITE_PATH_PATTERNS = [
	/^\/api\/updates\/[^/]+\/like\/?$/,
	/^\/api\/updates\/[^/]+\/comments\/?$/,
	/^\/api\/auth\/login\/?$/,
];

export const onRequest = defineMiddleware(async (context, next) => {
	const { pathname } = context.url;

	// Protect every /admin page except the login page itself.
	if (pathname.startsWith("/admin") && pathname !== "/admin/login/" && pathname !== "/admin/login") {
		if (!isAdminRequest(context.cookies)) {
			return context.redirect("/admin/login/");
		}
	}

	// Protect write requests to the updates API, unless explicitly public.
	if (
		pathname.startsWith("/api/updates") &&
		WRITE_METHODS.has(context.request.method) &&
		!PUBLIC_WRITE_PATH_PATTERNS.some((re) => re.test(pathname))
	) {
		if (!isAdminRequest(context.cookies)) {
			return new Response(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			});
		}
	}

	// Protect image uploads — admin only.
	if (pathname.startsWith("/api/upload") && !isAdminRequest(context.cookies)) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	return next();
});
