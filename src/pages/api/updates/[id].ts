import type { APIRoute } from "astro";
import { supabase, UPDATES_BUCKET } from "@lib/supabase";

export const prerender = false;

export const PUT: APIRoute = async ({ params, request }) => {
	const id = params.id;
	let body: { content?: string; image_url?: string | null };
	try {
		body = await request.json();
	} catch {
		return new Response(JSON.stringify({ error: "Invalid request" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
	if (typeof body.content === "string") update.content = body.content.trim();
	if (body.image_url !== undefined) update.image_url = body.image_url;

	const { data, error } = await supabase
		.from("updates")
		.update(update)
		.eq("id", id)
		.select("*")
		.single();

	if (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}

	return new Response(JSON.stringify({ update: data }), {
		status: 200,
		headers: { "Content-Type": "application/json" },
	});
};

export const DELETE: APIRoute = async ({ params }) => {
	const id = params.id;

	// Best-effort: remove the uploaded image from storage too.
	const { data: existing } = await supabase
		.from("updates")
		.select("image_url")
		.eq("id", id)
		.single();

	if (existing?.image_url) {
		const marker = `/storage/v1/object/public/${UPDATES_BUCKET}/`;
		const idx = existing.image_url.indexOf(marker);
		if (idx !== -1) {
			const path = existing.image_url.slice(idx + marker.length);
			await supabase.storage.from(UPDATES_BUCKET).remove([path]);
		}
	}

	const { error } = await supabase.from("updates").delete().eq("id", id);

	if (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}

	return new Response(JSON.stringify({ ok: true }), {
		status: 200,
		headers: { "Content-Type": "application/json" },
	});
};
