/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
	readonly SUPABASE_URL: string;
	readonly SUPABASE_SERVICE_ROLE_KEY: string;
	readonly ADMIN_PASSWORD: string;
	readonly SESSION_SECRET: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
