import { NextResponse } from 'next/server';

import { verifyRoutinaIntegrationSecret } from '@/features/integrations/routina/auth';
import { buildRoutinaWorkNowSummary } from '@/features/integrations/routina/build-routina-work-summary';

export const runtime = 'nodejs';

export async function GET(request: Request) {
	if (!verifyRoutinaIntegrationSecret(request)) {
		return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
	}

	const { searchParams } = new URL(request.url);
	const userId = searchParams.get('userId');

	if (!userId) {
		return NextResponse.json({ error: 'userId is required' }, { status: 400 });
	}

	try {
		const summary = await buildRoutinaWorkNowSummary(userId);
		return NextResponse.json({ ok: true, data: summary });
	} catch (error) {
		console.error(error);
		return NextResponse.json({ error: 'Failed to build work summary' }, { status: 500 });
	}
}
