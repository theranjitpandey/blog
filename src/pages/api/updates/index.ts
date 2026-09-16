import type { APIRoute } from "astro";
import { supabase } from "@lib/supabase";

export const prerender = false;

const PAGE_SIZE = 20;

export const GET: APIRoute = async ({ url }) => {
	const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
	const from = (page - 1) * PAGE_SIZE;
	const to = from + PAGE_SIZE - 1;

	const { data, error, count } = await supabase
		.from("updates")
		.select("*", { count: "exact" })
		.order("created_at", { ascending: false })
		.range(from, to);

	if (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}

	return new Response(
		JSON.stringify({ updates: data, total: count ?? 0, page, pageSize: PAGE_SIZE }),
		{ status: 200, headers: { "Content-Type": "application/json" } },
	);
};

export const POST: APIRoute = async ({ request }) => {
	let body: { content?: string; image_url?: string };
	try {
		body = await request.json();
	} catch {
		return new Response(JSON.stringify({ error: "Invalid request" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const content = (body.content ?? "").trim();
	const image_url = body.image_url ?? null;

	if (!content && !image_url) {
		return new Response(
			JSON.stringify({ error: "Post me kuch likhna ya photo lagana zaroori hai." }),
			{ status: 400, headers: { "Content-Type": "application/json" } },
		);
	}

	const { data, error } = await supabase
		.from("updates")
		.insert({ content, image_url })
		.select("*")
		.single();

	if (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}

	return new Response(JSON.stringify({ update: data }), {
		status: 201,
		headers: { "Content-Type": "application/json" },
	});
};
