import {NextResponse} from 'next/server';
import {Resend} from 'resend';
import {getSanityWriteClient} from '@/lib/sanity-write';

export const runtime = 'nodejs';

type SubmissionType = 'event' | 'branding';

function plainTextBlock(title: string, data: Record<string, unknown>) {
  const lines = Object.entries(data)
    .filter(([, v]) => v !== undefined && v !== '' && v !== null)
    .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`);
  return `${title}\n${lines.join('\n')}\n`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      submissionType: SubmissionType;
      name: string;
      email: string;
      phone: string;
      formData: Record<string, unknown>;
    };

    const {submissionType, name, email, phone, formData} = body;
    if (!submissionType || !name || !email || !phone) {
      return NextResponse.json({message: 'Missing required fields'}, {status: 400});
    }

    const submittedAt = new Date().toISOString();

    const write = getSanityWriteClient();
    await write.create({
      _type: 'inquirySubmission',
      submissionType,
      name,
      email,
      phone,
      submittedAt,
      formData: {
        json: JSON.stringify(formData, null, 2),
      },
    });

    const resendKey = process.env.RESEND_API_KEY;
    const to = process.env.RESEND_TO_EMAIL;
    if (resendKey && to) {
      const resend = new Resend(resendKey);
      const label = submissionType === 'event' ? 'Event' : 'Branding';
      const textBody =
        plainTextBlock('Contact', {name, email, phone, submittedAt}) +
        '\n' +
        plainTextBlock('Details', formData as Record<string, unknown>);

      const from = process.env.RESEND_FROM_EMAIL ?? 'PaidVille <onboarding@resend.dev>';
      await resend.emails.send({
        from,
        to: [to],
        subject: `New ${label} Inquiry — ${name}`,
        text: textBody,
      });
    }

    return NextResponse.json({ok: true});
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {message: e instanceof Error ? e.message : 'Server error'},
      {status: 500}
    );
  }
}
