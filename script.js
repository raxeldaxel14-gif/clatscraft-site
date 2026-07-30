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

// TODO: replace with your real server address (IP or domain), e.g. "play.clatskanie.net"
const SERVER_ADDRESS = 'play.clatskanie.craft';

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
