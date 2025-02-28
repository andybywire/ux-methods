import { createClient } from '@sanity/client';

export const client = createClient({
	projectId: '4g5tw1k0',
	dataset: 'production',
	useCdn: false, // bypasses edge cache
	apiVersion: '2025-02-01', // current date targets the latest version
});
