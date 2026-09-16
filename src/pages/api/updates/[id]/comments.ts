import type { APIRoute } from "astro";
import { supabase } from "@lib/supabase";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
	const id = params.id;
	const { data, error } = await supabase
		.from("update_comments")
		.select("*")
		.eq("update_id", id)
		.order("created_at", { ascending: true });

	if (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}

	return new Response(JSON.stringify({ comments: data }), {
		status: 200,
		headers: { "Content-Type": "application/json" },
	});
};

export const POST: APIRoute = async ({ params, request }) => {
	const id = params.id;
	let body: { author_name?: string; content?: string };
	try {
		body = await request.json();
	} catch {
		return new Response(JSON.stringify({ error: "Invalid request" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const author_name = (body.author_name ?? "").trim().slice(0, 60) || "Anonymous";
	const content = (body.content ?? "").trim().slice(0, 1000);

	if (!content) {
		return new Response(JSON.stringify({ error: "Comment khaali nahi ho sakta." }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const { data, error } = await supabase
		.from("update_comments")
		.insert({ update_id: id, author_name, content })
		.select("*")
		.single();

	if (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}

	// Keep the denormalized comment counter on the post in sync.
	const { data: post } = await supabase
		.from("updates")
		.select("comments_count")
		.eq("id", id)
		.single();
	if (post) {
		await supabase
			.from("updates")
			.update({ comments_count: post.comments_count + 1 })
			.eq("id", id);
	}

	return new Response(JSON.stringify({ comment: data }), {
		status: 201,
		headers: { "Content-Type": "application/json" },
	});
};
