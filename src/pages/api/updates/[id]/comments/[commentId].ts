import type { APIRoute } from "astro";
import { supabase } from "@lib/supabase";

export const prerender = false;

export const DELETE: APIRoute = async ({ params }) => {
	const { id, commentId } = params;

	const { error } = await supabase
		.from("update_comments")
		.delete()
		.eq("id", commentId)
		.eq("update_id", id);

	if (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}

	const { data: post } = await supabase
		.from("updates")
		.select("comments_count")
		.eq("id", id)
		.single();
	if (post) {
		await supabase
			.from("updates")
			.update({ comments_count: Math.max(0, post.comments_count - 1) })
			.eq("id", id);
	}

	return new Response(JSON.stringify({ ok: true }), {
		status: 200,
		headers: { "Content-Type": "application/json" },
	});
};
