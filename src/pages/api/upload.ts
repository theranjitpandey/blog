import type { APIRoute } from "astro";
import { supabase, UPDATES_BUCKET } from "@lib/supabase";

export const prerender = false;

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export const POST: APIRoute = async ({ request }) => {
	const form = await request.formData();
	const file = form.get("file");

	if (!(file instanceof File)) {
		return new Response(JSON.stringify({ error: "Photo nahi mili." }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	if (!ALLOWED_TYPES.has(file.type)) {
		return new Response(JSON.stringify({ error: "Sirf JPG, PNG, WEBP ya GIF chalega." }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	if (file.size > MAX_BYTES) {
		return new Response(JSON.stringify({ error: "Photo 8MB se badi nahi honi chahiye." }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const ext = file.name.split(".").pop() || "jpg";
	const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

	const { error } = await supabase.storage
		.from(UPDATES_BUCKET)
		.upload(path, file, { contentType: file.type, upsert: false });

	if (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}

	const { data } = supabase.storage.from(UPDATES_BUCKET).getPublicUrl(path);

	return new Response(JSON.stringify({ url: data.publicUrl }), {
		status: 200,
		headers: { "Content-Type": "application/json" },
	});
};
