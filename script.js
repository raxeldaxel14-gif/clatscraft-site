// ============================================
// Mobile nav toggle
// ============================================
const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');

navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

mainNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ============================================
// Live server status via mcsrvstat.us (free, no API key needed)
// Docs: https://api.mcsrvstat.us
// ============================================

const SERVER_ADDRESS = 'clatscraft.minehut.gg';

const statusDot = document.getElementById('status-dot');
const statusLabel = document.getElementById('status-label');
const statusMotd = document.getElementById('status-motd');
const statusIp = document.getElementById('status-ip');
const statusPlayers = document.getElementById('status-players');
const statusVersion = document.getElementById('status-version');

async function fetchServerStatus() {
  try {
    const res = await fetch(`https://api.mcsrvstat.us/3/${SERVER_ADDRESS}`);
    if (!res.ok) throw new Error('Status API request failed');
    const data = await res.json();

    if (data.online) {
      statusDot.classList.add('online');
      statusLabel.textContent = 'Online';
      statusMotd.textContent = data.motd?.clean?.[0] || 'ClatsCraft';
      statusIp.textContent = SERVER_ADDRESS;
      statusPlayers.textContent = `${data.players?.online ?? 0} / ${data.players?.max ?? '?'}`;
      statusVersion.textContent = data.version || '—';
    } else {
      statusDot.classList.add('offline');
      statusLabel.textContent = 'Offline';
      statusMotd.textContent = 'ClatsCraft';
      statusIp.textContent = SERVER_ADDRESS;
      statusPlayers.textContent = '—';
      statusVersion.textContent = '—';
    }
  } catch (err) {
    // Server address not set up yet, or the request failed — fail quietly with a clear label
    statusLabel.textContent = 'Status unavailable';
    statusMotd.textContent = 'ClatsCraft';
    statusIp.textContent = SERVER_ADDRESS;
    statusPlayers.textContent = '—';
    statusVersion.textContent = '—';
  }
}

fetchServerStatus();

// ============================================
// Discord live stats via the public widget API
// Requires "Enable Server Widget" turned on in Discord's
// Server Settings → Engagement → Widget
// ============================================
const DISCORD_SERVER_ID = '1532535962549223444';

const discordCountEl = document.getElementById('discord-online-count');
const discordLabelEl = document.getElementById('discord-stats-label');

async function fetchDiscordStats() {
  try {
    const res = await fetch(`https://discord.com/api/guilds/${DISCORD_SERVER_ID}/widget.json`);
    if (!res.ok) throw new Error('Discord widget API request failed');
    const data = await res.json();

    const onlineCount = data.presence_count ?? 0;
    const inVoice = Array.isArray(data.members) ? data.members.length : 0;

    discordCountEl.textContent = onlineCount;

    if (onlineCount === 0) {
      discordLabelEl.textContent = "Be the first one online today — hop in and say hey.";
    } else if (inVoice > 0) {
      discordLabelEl.textContent = `${onlineCount} online right now, and ${inVoice} ${inVoice === 1 ? 'person is' : 'people are'} already hanging out in voice.`;
    } else if (onlineCount === 1) {
      discordLabelEl.textContent = "1 person is online right now — go say hi.";
    } else {
      discordLabelEl.textContent = `${onlineCount} people are online right now — come hang out.`;
    }
  } catch (err) {
    discordCountEl.textContent = '—';
    discordLabelEl.textContent = "Join the community and see who's around.";
  }
}

fetchDiscordStats();

// ============================================
// Apply form: Discord/email toggle + submission
// ============================================
const applyForm = document.getElementById('apply-form');
const discordField = document.getElementById('discord-field');
const emailField = document.getElementById('email-field');
const otherField = document.getElementById('other-field');
const contactRadios = document.querySelectorAll('input[name="contactMethod"]');
const formStatus = document.getElementById('form-status');
const submitBtn = document.getElementById('apply-submit');

const contactFieldsByValue = {
  discord: discordField,
  email: emailField,
  other: otherField,
};

contactRadios.forEach((radio) => {
  radio.addEventListener('change', (e) => {
    Object.values(contactFieldsByValue).forEach((field) => { field.hidden = true; });
    contactFieldsByValue[e.target.value].hidden = false;
  });
});

applyForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  formStatus.textContent = '';
  formStatus.className = 'form-status';

  const minecraftUsername = document.getElementById('minecraft-username').value.trim();
  if (!minecraftUsername) {
    formStatus.textContent = 'Minecraft username is required.';
    formStatus.className = 'form-status error';
    return;
  }

  const contactMethod = document.querySelector('input[name="contactMethod"]:checked').value;
  const discordUsername = document.getElementById('discord-username').value.trim();
  const email = document.getElementById('email').value.trim();
  const otherContact = document.getElementById('other-contact').value.trim();
  const heardFrom = document.getElementById('heard-from').value.trim();

  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting…';

  try {
    const res = await fetch('/api/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minecraftUsername, contactMethod, discordUsername, email, otherContact, heardFrom }),
    });
    const data = await res.json();

    if (res.ok && data.success) {
      formStatus.textContent = "Application sent! We'll be in touch.";
      formStatus.className = 'form-status success';
      applyForm.reset();
      Object.values(contactFieldsByValue).forEach((field) => { field.hidden = true; });
      discordField.hidden = false;
    } else {
      formStatus.textContent = data.error || 'Something went wrong, try again later.';
      formStatus.className = 'form-status error';
    }
  } catch (err) {
    formStatus.textContent = 'Could not reach the server, check your connection and try again.';
    formStatus.className = 'form-status error';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit application';
  }
});
