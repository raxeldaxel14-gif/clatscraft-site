
// This runs on Vercel's servers, not in the browser — so the webhook URL
// stays private (set as an environment variable, never in client-side code).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('DISCORD_WEBHOOK_URL is not set in environment variables');
    return res.status(500).json({ error: 'Server is not configured yet' });
  }

  const { minecraftUsername, hasDiscord, discordUsername, email, heardFrom } = req.body || {};

  // Basic validation — Minecraft username is the only required field
  if (!minecraftUsername || typeof minecraftUsername !== 'string' || !minecraftUsername.trim()) {
    return res.status(400).json({ error: 'Minecraft username is required' });
  }

  // Build a Discord embed so applications are easy to scan in the channel
  const fields = [
    { name: 'Minecraft Username', value: minecraftUsername.trim(), inline: true },
  ];

  if (hasDiscord && discordUsername) {
    fields.push({ name: 'Discord Username', value: discordUsername.trim(), inline: true });
  } else if (email) {
    fields.push({ name: 'Email', value: email.trim(), inline: true });
  }

  if (heardFrom && heardFrom.trim()) {
    fields.push({ name: 'How they heard about us', value: heardFrom.trim(), inline: false });
  }

  const payload = {
    embeds: [
      {
        title: 'New ClatsCraft Application',
        color: 0x5CC77E,
        fields,
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    const discordRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!discordRes.ok) {
      const errText = await discordRes.text();
      console.error('Discord webhook failed:', discordRes.status, errText);
      return res.status(502).json({ error: 'Failed to submit application, try again later' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error sending to Discord:', err);
    return res.status(500).json({ error: 'Something went wrong, try again later' });
  }
}
