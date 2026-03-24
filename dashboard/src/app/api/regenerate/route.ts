import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_CONTEXT = `You are an expert cold outreach specialist who helps freelance developers land clients.
The sender offers ALL digital services: websites, web apps, mobile apps, booking systems, CRMs, dashboards,
call center scripts, automation tools, e-commerce, student portals, teacher management systems —
anything that can be programmed.

KEY PRINCIPLES:
1. NEVER start with "I" — start with something about THEM
2. Lead with the problem/opportunity you identified, not your pitch
3. Keep it conversational, not corporate
4. Include ONE clear call-to-action
5. No spam words
6. Sound like a human who genuinely noticed something
7. Match language to market (French for France/Morocco, English for Dubai/international)
8. Reference specific data points to prove you actually looked at their business.`;

const CHANNEL_INSTRUCTIONS: Record<string, string> = {
  email: `CHANNEL: Cold Email\nFORMAT: Subject line (under 8 words) then body (150-250 words). Hook → Problem → Offer → Soft CTA. Sign off with sender name.\nOUTPUT FORMAT:\nSubject: [subject]\n\n[body]\n\n[signature]`,
  whatsapp: `CHANNEL: WhatsApp\nFORMAT: 2-4 sentences MAX. Greeting + business name → value prop → question. Casual-professional. 1-2 emojis ok.\nOUTPUT FORMAT:\n[just the message]`,
  linkedin: `CHANNEL: LinkedIn\nFORMAT: 100-150 words. Reference their business → ONE insight → propose value → soft ask.\nOUTPUT FORMAT:\n[just the message]`,
};

const TONE_MODIFIERS: Record<string, string> = {
  shorter: 'Make the message significantly shorter and more concise.',
  longer: 'Expand with more detail and stronger pitch.',
  professional: 'Use a more formal, corporate tone.',
  casual: 'Use a very casual, friendly tone.',
  urgent: 'Add subtle urgency — competitors are ahead.',
  friendly: 'Be extra warm and genuine.',
};

const SERVICE_CONTEXTS: Record<string, string> = {
  website: 'Focus on building a modern, fast website.',
  web_app: 'Focus on a custom web application — portal, dashboard, tool.',
  mobile_app: 'Pitch a native mobile app.',
  booking_system: 'Pitch an online booking/appointment system.',
  crm: 'Pitch a custom CRM or management dashboard.',
  automation: 'Pitch automation scripts or workflow tools.',
  ecommerce: 'Pitch an e-commerce solution.',
  custom_software: 'Pitch custom software development.',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lead, channel, customPrompt, toneModifiers, serviceType, settings } = body;

    const apiKey = settings?.gemini_api_key;
    if (!apiKey) {
      return NextResponse.json({ error: 'No Gemini API key configured' }, { status: 400 });
    }

    const model = settings?.gemini_model || 'gemini-2.5-flash';

    // Build lead context
    const leadParts = [
      `Business: ${lead.business_name}`,
      `Rating: ${lead.rating || 'N/A'} (${lead.review_count} reviews)`,
      `Website: ${lead.has_website ? lead.website_url || 'Yes' : 'No'}`,
    ];
    if (lead.address) leadParts.push(`Location: ${lead.address}`);
    if (lead.page_speed_score !== null) leadParts.push(`Speed: ${lead.page_speed_score}/100`);
    if (lead.tech_stack?.length) leadParts.push(`Tech: ${lead.tech_stack.join(', ')}`);
    if (lead.opportunity_score) leadParts.push(`Opportunity Score: ${lead.opportunity_score}/100`);
    if (lead.service_opportunities?.length) leadParts.push(`Opportunities: ${lead.service_opportunities.join(', ')}`);
    if (lead.pitch_summary) leadParts.push(`Summary: ${lead.pitch_summary}`);

    // Build sender info
    const senderParts = [];
    if (settings?.user_name) senderParts.push(`Name: ${settings.user_name}`);
    if (settings?.user_title) senderParts.push(`Title: ${settings.user_title}`);
    if (settings?.user_email) senderParts.push(`Email: ${settings.user_email}`);
    if (settings?.user_website) senderParts.push(`Portfolio: ${settings.user_website}`);

    let prompt = `${SYSTEM_CONTEXT}\n\n${CHANNEL_INSTRUCTIONS[channel] || CHANNEL_INSTRUCTIONS.email}`;

    if (toneModifiers?.length) {
      const tones = toneModifiers.filter((t: string) => TONE_MODIFIERS[t]).map((t: string) => TONE_MODIFIERS[t]).join('\n');
      if (tones) prompt += `\n\nTONE:\n${tones}`;
    }

    if (serviceType && SERVICE_CONTEXTS[serviceType]) {
      prompt += `\n\nSERVICE FOCUS:\n${SERVICE_CONTEXTS[serviceType]}`;
    }

    if (customPrompt) {
      prompt += `\n\nUSER INSTRUCTIONS:\n${customPrompt}`;
    }

    prompt += `\n\n---\n\nPROSPECT:\n${leadParts.join('\n')}\n\nSENDER:\n${senderParts.join('\n') || 'Freelance Developer'}\n\nGenerate the ${channel} message now.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.85, maxOutputTokens: 1024, topP: 0.9 },
      }),
      signal: AbortSignal.timeout(30000),
    });

    const data = await response.json();
    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return NextResponse.json({ error: 'No content in response' }, { status: 500 });
    }

    return NextResponse.json({ message: text.trim() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
