import chalk from 'chalk';

/**
 * AI Message Drafter using Gemini API.
 * Generates channel-appropriate messages:
 * - Email: Professional, detailed cold email (150-250 words)
 * - WhatsApp: Short, conversational, casual-professional (2-4 sentences)
 * - LinkedIn: Professional but concise connection message (100-150 words)
 *
 * Supports:
 * - Custom prompts for regeneration
 * - Tone controls (length, formality)
 * - Service type targeting
 */

const SYSTEM_CONTEXT = `You are an expert cold outreach specialist who helps freelance developers land clients.
The sender offers ALL digital services: websites, web apps, mobile apps, booking systems, CRMs, dashboards,
call center scripts, automation tools, e-commerce, student portals, teacher management systems —
anything that can be programmed.

YOUR EXPERTISE:
- Cold email copywriting that gets 15-30% reply rates
- You understand B2B sales psychology: pattern interrupt, value-first, social proof
- You write in the language that matches the market (French for France/Morocco, English for Dubai/international, Arabic only when specifically requested)
- You never sound like a template. Every message feels personal and researched.
- You focus on the prospect's PAIN POINT, not the sender's services.

KEY PRINCIPLES:
1. NEVER start with "I" — start with something about THEM (their business, a compliment, an observation)
2. Lead with the problem/opportunity you identified, not your pitch
3. Keep it conversational, not corporate
4. Include ONE clear call-to-action (not multiple)
5. No spam words: "amazing", "incredible", "revolutionary", "guaranteed"
6. Sound like a human who genuinely noticed something, not a mass emailer
7. If the business is in a French-speaking market, write in French. If in an Arabic market (Dubai, Saudi), write in English unless told otherwise.
8. Reference specific data points (rating, review count, speed score) to prove you actually looked at their business.
9. Match the service pitch to what the lead ACTUALLY NEEDS based on the data.`;

const CHANNEL_INSTRUCTIONS = {
  email: `CHANNEL: Cold Email
FORMAT RULES:
- Subject line: Short, curiosity-driven, no clickbait. Under 8 words.
- Body: 150-250 words max
- Structure: Hook (about them) → Problem/Opportunity → Your offer (1-2 sentences) → Soft CTA
- Sign off with sender's name and title
- Include portfolio link if available
- Professional but warm tone — like a smart colleague reaching out, not a salesperson
- NO attachments, NO bullet lists of services, NO "I hope this email finds you well"
OUTPUT FORMAT:
Subject: [subject line]

[email body]

[signature]`,

  whatsapp: `CHANNEL: WhatsApp Message
FORMAT RULES:
- 2-4 sentences MAXIMUM. This is a chat, not an email.
- Start with a greeting and immediately mention their business by name
- One key value proposition — the strongest pitch angle
- End with a simple question to start the conversation
- Casual-professional tone — friendly but not overly familiar
- NO greetings like "Dear Sir/Madam" — this is WhatsApp
- Can use 1-2 emojis if appropriate for the market
- If French market, write in French
OUTPUT FORMAT:
[just the message, nothing else]`,

  linkedin: `CHANNEL: LinkedIn Connection Message / DM
FORMAT RULES:
- 100-150 words max (LinkedIn has character limits for connection requests)
- Start by referencing something specific about their business or profile
- Mention ONE observation/insight about their digital presence
- Propose value, don't sell
- End with a soft ask (coffee chat, quick call, "would love to connect")
- Professional tone — this is LinkedIn, not WhatsApp
- NO "I came across your profile" (everyone says that)
- If French market, write in French
OUTPUT FORMAT:
[just the message, nothing else]`,
};

const TONE_MODIFIERS = {
  shorter: 'Make the message significantly shorter and more concise. Cut fluff ruthlessly.',
  longer: 'Expand the message with more detail, more value propositions, and a stronger pitch.',
  professional: 'Use a more formal, corporate tone. No slang, no casual language.',
  casual: 'Use a very casual, friendly tone. Like texting a friend who happens to be a business owner.',
  urgent: 'Add subtle urgency — their competitors are already doing this, they are missing out NOW.',
  friendly: 'Be extra warm, complimentary, and genuine. Focus on building rapport.',
};

const SERVICE_CONTEXTS = {
  website: 'Focus the pitch on building them a modern, fast, mobile-optimized website.',
  web_app: 'Focus on building them a custom web application — booking portal, client dashboard, management tool, or interactive platform.',
  mobile_app: 'Pitch a native mobile app for their business — customer engagement, bookings, loyalty programs.',
  booking_system: 'Pitch an online booking/appointment system that saves them time and reduces no-shows.',
  crm: 'Pitch a custom CRM, dashboard, or management tool tailored to their specific business workflow.',
  automation: 'Pitch automation scripts or tools — call center scripts, workflow automation, data processing.',
  ecommerce: 'Pitch an e-commerce solution — online store, payment integration, inventory management.',
  custom_software: 'Pitch custom software development — whatever specific tool or system they need.',
};

/**
 * Generate AI-drafted messages for a lead
 * @param {Object} lead - Lead data
 * @param {Object} config - Config with API keys and user info
 * @param {Object} options - Optional: { customPrompt, toneModifiers, serviceType, channels }
 */
export async function generateMessages(lead, config, options = {}) {
  const apiKey = config.gemini_api_key;
  if (!apiKey) {
    return { email: null, whatsapp: null, linkedin: null };
  }

  const model = config.gemini_model || 'gemini-2.5-flash';
  const senderInfo = buildSenderInfo(config);
  const leadContext = buildLeadContext(lead);
  const channels = options.channels || ['email', 'whatsapp', 'linkedin'];

  const messages = {};

  for (const channel of channels) {
    try {
      const prompt = buildPrompt(channel, leadContext, senderInfo, options);
      const response = await callGemini(apiKey, model, prompt);
      messages[channel] = response;
    } catch (err) {
      console.log(chalk.gray(`    AI draft (${channel}) failed: ${err.message}`));
      messages[channel] = null;
    }

    // Small delay between API calls to respect rate limits
    if (channels.indexOf(channel) < channels.length - 1) {
      await sleep(1500);
    }
  }

  return messages;
}

/**
 * Regenerate a single channel message with custom instructions
 */
export async function regenerateMessage(lead, config, channel, options = {}) {
  const apiKey = config.gemini_api_key;
  if (!apiKey) return null;

  const model = config.gemini_model || 'gemini-2.5-flash';
  const senderInfo = buildSenderInfo(config);
  const leadContext = buildLeadContext(lead);

  try {
    const prompt = buildPrompt(channel, leadContext, senderInfo, options);
    return await callGemini(apiKey, model, prompt);
  } catch (err) {
    console.log(chalk.gray(`    AI regeneration (${channel}) failed: ${err.message}`));
    return null;
  }
}

function buildSenderInfo(config) {
  const parts = [];
  if (config.user_name) parts.push(`Name: ${config.user_name}`);
  if (config.user_title) parts.push(`Title/Service: ${config.user_title}`);
  if (config.user_email) parts.push(`Email: ${config.user_email}`);
  if (config.user_website) parts.push(`Portfolio: ${config.user_website}`);
  parts.push('Services: Websites, Web Apps, Mobile Apps, Booking Systems, CRMs, Dashboards, Automation Scripts, E-Commerce, Custom Software — anything that can be programmed.');
  return parts.join('\n');
}

function buildLeadContext(lead) {
  const parts = [
    `Business Name: ${lead.business_name}`,
    `Rating: ${lead.rating || 'N/A'} stars (${lead.review_count} reviews)`,
    `Has Website: ${lead.has_website ? 'Yes' : 'No'}`,
  ];

  if (lead.website_url) parts.push(`Website: ${lead.website_url}`);
  if (lead.address) parts.push(`Location: ${lead.address}`);
  if (lead.page_speed_score !== null) parts.push(`Page Speed Score: ${lead.page_speed_score}/100`);
  if (lead.mobile_friendly !== null) parts.push(`Mobile Friendly: ${lead.mobile_friendly ? 'Yes' : 'No'}`);
  if (lead.fcp_ms) parts.push(`First Contentful Paint: ${lead.fcp_ms}ms`);
  if (lead.lcp_ms) parts.push(`Largest Contentful Paint: ${lead.lcp_ms}ms`);
  if (lead.cls_score !== null && lead.cls_score !== undefined) parts.push(`Layout Shift Score: ${lead.cls_score}`);
  if (lead.tech_stack && lead.tech_stack.length > 0) parts.push(`Tech Stack: ${lead.tech_stack.join(', ')}`);
  if (lead.has_mobile_app) parts.push('Has Mobile App: Yes');
  else parts.push('Has Mobile App: No');
  if (lead.has_ssl === false) parts.push('Has SSL: No (security issue!)');
  if (lead.has_online_booking === false) parts.push('Has Online Booking: No');
  if (lead.opportunity_score) parts.push(`Opportunity Score: ${lead.opportunity_score}/100`);
  if (lead.service_opportunities && lead.service_opportunities.length > 0) {
    parts.push(`Recommended Services: ${lead.service_opportunities.join(', ')}`);
  }
  if (lead.pitch_angles && lead.pitch_angles.length > 0) parts.push(`Identified Pitch Angles: ${lead.pitch_angles.join(', ')}`);
  if (lead.pitch_summary) parts.push(`Pitch Summary: ${lead.pitch_summary}`);

  return parts.join('\n');
}

function buildPrompt(channel, leadContext, senderInfo, options = {}) {
  let prompt = `${SYSTEM_CONTEXT}\n\n${CHANNEL_INSTRUCTIONS[channel]}`;

  // Add tone modifiers
  if (options.toneModifiers && options.toneModifiers.length > 0) {
    const toneInstructions = options.toneModifiers
      .filter(t => TONE_MODIFIERS[t])
      .map(t => TONE_MODIFIERS[t])
      .join('\n');
    if (toneInstructions) {
      prompt += `\n\nTONE ADJUSTMENTS:\n${toneInstructions}`;
    }
  }

  // Add service type focus
  if (options.serviceType && SERVICE_CONTEXTS[options.serviceType]) {
    prompt += `\n\nSERVICE FOCUS:\n${SERVICE_CONTEXTS[options.serviceType]}`;
  }

  // Add custom prompt
  if (options.customPrompt) {
    prompt += `\n\nADDITIONAL INSTRUCTIONS FROM USER:\n${options.customPrompt}`;
  }

  prompt += `\n\n---\n\nPROSPECT INFORMATION:\n${leadContext}\n\nSENDER INFORMATION:\n${senderInfo}\n\nGenerate the ${channel} message now. Follow all format rules exactly.`;

  return prompt;
}

async function callGemini(apiKey, model, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 4096,
        topP: 0.9,
      },
    }),
    signal: AbortSignal.timeout(30000),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No content in response');

  return text.trim();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
