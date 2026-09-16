import type { APIRoute } from "astro";
import { supabase } from "@lib/supabase";

export const prerender = false;

const LIKED_COOKIE = "liked_updates";

function readLikedIds(cookieValue: string | undefined): Set<string> {
	if (!cookieValue) return new Set();
	return new Set(cookieValue.split(",").filter(Boolean));
}

export const POST: APIRoute = async ({ params, cookies }) => {
	const id = params.id;
	if (!id) {
		return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });
	}

	const liked = readLikedIds(cookies.get(LIKED_COOKIE)?.value);
	const alreadyLiked = liked.has(id);

	// Read-modify-write the counter. Fine at this traffic scale; for very
	// high concurrency a Postgres RPC with an atomic increment would be safer.
	const { data: current, error: readError } = await supabase
		.from("updates")
		.select("likes_count")
		.eq("id", id)
		.single();

	if (readError || !current) {
		return new Response(JSON.stringify({ error: readError?.message ?? "Not found" }), {
			status: 404,
			headers: { "Content-Type": "application/json" },
		});
	}

	const nextCount = Math.max(0, current.likes_count + (alreadyLiked ? -1 : 1));

	const { error: writeError } = await supabase
		.from("updates")
		.update({ likes_count: nextCount })
		.eq("id", id);

	if (writeError) {
		return new Response(JSON.stringify({ error: writeError.message }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}

	if (alreadyLiked) {
		liked.delete(id);
	} else {
		liked.add(id);
	}
	cookies.set(LIKED_COOKIE, Array.from(liked).join(","), {
		path: "/",
		httpOnly: true,
		sameSite: "lax",
		maxAge: 60 * 60 * 24 * 365,
	});

	return new Response(
		JSON.stringify({ liked: !alreadyLiked, likes_count: nextCount }),
		{ status: 200, headers: { "Content-Type": "application/json" } },
	);
};
