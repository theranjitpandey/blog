import { createClient } from "@supabase/supabase-js";

// These must be set as environment variables (Vercel project settings, and a
// local .env file for `astro dev`). The SERVICE ROLE key must never be
// exposed to the browser — it is only ever used inside server-side API
// routes (src/pages/api/**), never imported into a .svelte/client script.
const SUPABASE_URL = import.meta.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
	console.warn(
		"[supabase] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set. " +
			"Set them in your .env file (local) and in Vercel project settings (production).",
	);
}

export const supabase = createClient(
	SUPABASE_URL ?? "",
	SUPABASE_SERVICE_ROLE_KEY ?? "",
	{
		auth: { persistSession: false },
	},
);

export const UPDATES_BUCKET = "updates";
