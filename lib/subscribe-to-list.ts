/**
 * Auto-subscribe a website signup into the client's Beehiiv email list.
 *
 * "Set and forget": reads BEEHIIV_API_KEY + BEEHIIV_PUBLICATION_ID from env.
 * If either is missing it silently no-ops, and it NEVER throws — so the
 * inquiry form keeps working no matter what. The client owns the Beehiiv
 * account and sends his own campaigns; this just keeps his list growing.
 *
 * Beehiiv v2: POST /publications/{id}/subscriptions
 */
export async function subscribeToList(params: {
  email: string;
  name?: string;
  source?: string;
}): Promise<void> {
  const apiKey = process.env.BEEHIIV_API_KEY;
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;
  if (!apiKey || !publicationId) return;

  const email = params.email?.trim().toLowerCase();
  if (!email || !email.includes('@')) return;

  try {
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          reactivate_existing: true,
          send_welcome_email: true,
          utm_source: 'paidville.com',
          utm_medium: params.source ?? 'website',
          ...(params.name ? {custom_fields: [{name: 'Name', value: params.name}]} : {}),
        }),
      },
    );
    if (!res.ok) {
      console.warn('[subscribeToList] beehiiv responded', res.status, await res.text().catch(() => ''));
    }
  } catch (err) {
    console.warn('[subscribeToList] failed', err);
  }
}
