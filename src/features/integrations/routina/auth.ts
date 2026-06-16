export function verifyRoutinaIntegrationSecret(request: Request): boolean {
	const secret = process.env.ROUTINA_INTEGRATION_SECRET;

	if (!secret) {
		return false;
	}

	const auth = request.headers.get('authorization');
	return auth === `Bearer ${secret}`;
}
