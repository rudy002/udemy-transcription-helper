// ============================================
// UDEMY TRANSCRIPTION HELPER - content.js
// ============================================

function tryAddButtons() {
  if (document.getElementById('udemy-helper-buttons')) return;

  const transcript = document.querySelector('[data-purpose="transcript-cue-active"]') ||
                     document.querySelector('[data-purpose="transcript-cue"]') ||
                     document.querySelector('[class*="transcript-cue"]');

  if (transcript) {
    addButtons();
    console.log('[Udemy Helper] ✅ Buttons added!');
  }
}

function addButtons() {
  if (document.getElementById('udemy-helper-buttons')) return;

  const container = document.createElement('div');
  container.id = 'udemy-helper-buttons';
  container.style.cssText = `
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 10px 12px;
    background: rgba(13, 17, 23, 0.85);
    border: 0.5px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    position: fixed;
    bottom: 80px;
    right: 20px;
    z-index: 99999;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  `;

  const copyBtn = createButton('Copy transcript', 'ti-clipboard', 'rgba(255,255,255,0.06)', 'rgba(255,255,255,0.1)', '#a1a1aa');
  copyBtn.addEventListener('click', copyTranscript);

  const summarizeBtn = createButton('Summarize', 'ti-sparkles', 'rgba(167,139,250,0.08)', 'rgba(167,139,250,0.2)', '#a78bfa');
  summarizeBtn.addEventListener('click', summarizeTranscript);

  container.appendChild(copyBtn);
  container.appendChild(summarizeBtn);
  document.body.appendChild(container);

  injectTablerIcons();
}

function injectTablerIcons() {
  if (document.getElementById('tabler-icons-css')) return;
  const link = document.createElement('link');
  link.id = 'tabler-icons-css';
  link.rel = 'stylesheet';
  link.href = 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css';
  document.head.appendChild(link);
}

function createButton(label, icon, bg, borderColor, color) {
  const btn = document.createElement('button');
  btn.style.cssText = `
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 8px 14px;
    background: ${bg};
    border: 0.5px solid ${borderColor};
    border-radius: 7px;
    color: ${color};
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    transition: background 0.2s;
    white-space: nowrap;
  `;
  btn.innerHTML = `<i class="ti ${icon}" style="font-size:14px;"></i>${label}`;
  btn.addEventListener('mouseover', () => btn.style.background = borderColor);
  btn.addEventListener('mouseout', () => btn.style.background = bg);
  return btn;
}

// ============================================
// EXTRACTION DE LA TRANSCRIPTION
// ============================================
function getTranscription() {
  const selectors = [
    '[data-purpose="transcript-cue"]',
    '[class*="transcript-cue"]',
    '[class*="transcript"] span',
  ];

  for (const selector of selectors) {
    const lines = document.querySelectorAll(selector);
    if (lines.length > 0) {
      return Array.from(lines).map(el => el.innerText.trim()).join(' ');
    }
  }
  return null;
}

// ============================================
// BOUTON 1 : COPIER
// ============================================
function copyTranscript() {
  const transcript = getTranscription();
  if (!transcript) {
    showNotification('Transcript not found.', 'error');
    return;
  }
  navigator.clipboard.writeText(transcript).then(() => {
    showNotification('Transcript copied!', 'success');
  });
}

// ============================================
// BOUTON 2 : RÉSUMER
// ============================================
async function summarizeTranscript() {
  const transcript = getTranscription();
  if (!transcript) {
    showNotification('Transcript not found.', 'error');
    return;
  }

  chrome.storage.sync.get(['apiKey', 'customPrompt', 'language'], async (settings) => {
    if (!settings.apiKey) {
      showNotification('Please enter your Groq API key in settings.', 'error');
      chrome.runtime.sendMessage({ action: 'openOptions' });
      return;
    }

    const prompt = settings.customPrompt || 'Summarize this transcript in clear, concise bullet points.';
    const language = settings.language || 'english';

    showNotification('Summarizing...', 'loading');

    const summary = await callGroq(settings.apiKey, transcript, prompt, language);
    document.getElementById('udemy-helper-notif')?.remove();

    if (summary) showSummaryPanel(summary);
    else showNotification('Error generating summary.', 'error');
  });
}

// ============================================
// APPEL GROQ
// ============================================
async function callGroq(apiKey, transcript, prompt, language) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'user',
          content: `${prompt}\n\nRespond in ${language}.\n\nTranscript:\n${transcript.slice(0, 10000)}`
        }],
        max_tokens: 1000
      })
    });

    const data = await response.json();
    console.log('[Udemy Helper] Groq response:', data);

    if (data.error) {
      console.error('[Udemy Helper] API error:', data.error.message);
      return null;
    }

    return data.choices?.[0]?.message?.content || null;

  } catch (error) {
    console.error('[Udemy Helper] Groq error:', error);
    return null;
  }
}

// ============================================
// PANNEAU RÉSUMÉ — SLATE GLASSMORPHISM
// ============================================
function showSummaryPanel(summary) {
  document.getElementById('udemy-summary-panel')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'udemy-summary-panel';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  `;

  const panel = document.createElement('div');
  panel.style.cssText = `
    background: rgba(13,17,23,0.92);
    border: 0.5px solid rgba(255,255,255,0.1);
    border-radius: 14px;
    padding: 28px;
    width: 520px;
    max-width: 90vw;
    max-height: 80vh;
    overflow-y: auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    box-shadow: 0 24px 64px rgba(0,0,0,0.6);
  `;

  const formattedSummary = summary
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<span style="color:#e4e4e7;font-weight:500;">$1</span>')
    .replace(/^[-•·]\s(.+)/gm, '<div style="display:flex;gap:8px;margin-bottom:6px;"><span style="color:#a78bfa;margin-top:2px;">·</span><span>$1</span></div>')
    .replace(/\n/g, '<br>');

  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding-bottom:16px;border-bottom:0.5px solid rgba(255,255,255,0.08);">
      <div style="display:flex;align-items:center;gap:8px;">
        <i class="ti ti-sparkles" style="font-size:16px;color:#a78bfa;"></i>
        <span style="font-size:15px;font-weight:500;color:#e4e4e7;">AI Summary</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="font-size:11px;color:#52525b;background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.08);padding:3px 10px;border-radius:20px;">Llama 3.3 · Groq</span>
        <button id="close-panel" style="background:rgba(255,255,255,0.05);border:0.5px solid rgba(255,255,255,0.08);border-radius:6px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#71717a;">
          <i class="ti ti-x" style="font-size:13px;"></i>
        </button>
      </div>
    </div>

    <div style="font-size:13px;line-height:1.8;color:#71717a;">
      ${formattedSummary}
    </div>

    <button id="copy-summary" style="
      width:100%;
      margin-top:20px;
      padding:10px;
      background:rgba(255,255,255,0.04);
      border:0.5px solid rgba(255,255,255,0.08);
      border-radius:8px;
      color:#a1a1aa;
      font-size:12px;
      font-weight:500;
      cursor:pointer;
      display:flex;
      align-items:center;
      justify-content:center;
      gap:8px;
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      transition:background 0.2s;
    ">
      <i class="ti ti-clipboard" style="font-size:14px;"></i>
      Copy summary
    </button>
  `;

  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  document.getElementById('close-panel').addEventListener('click', () => overlay.remove());
  document.getElementById('copy-summary').addEventListener('click', () => {
    navigator.clipboard.writeText(summary);
    showNotification('Summary copied!', 'success');
  });
}

// ============================================
// NOTIFICATIONS — SLATE
// ============================================
function showNotification(message, type) {
  document.getElementById('udemy-helper-notif')?.remove();

  const notif = document.createElement('div');
  notif.id = 'udemy-helper-notif';

  const styles = {
    success: { bg: 'rgba(13,17,23,0.9)', border: 'rgba(110,231,183,0.2)', color: '#6ee7b7', icon: 'ti-check' },
    error:   { bg: 'rgba(13,17,23,0.9)', border: 'rgba(248,113,113,0.2)', color: '#f87171', icon: 'ti-alert-circle' },
    loading: { bg: 'rgba(13,17,23,0.9)', border: 'rgba(167,139,250,0.2)', color: '#a78bfa', icon: 'ti-loader' }
  };

  const s = styles[type];

  notif.style.cssText = `
    position: fixed;
    bottom: 140px;
    right: 20px;
    background: ${s.bg};
    border: 0.5px solid ${s.border};
    border-radius: 8px;
    padding: 10px 16px;
    z-index: 999999;
    font-size: 12px;
    font-weight: 500;
    color: ${s.color};
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  `;

  notif.innerHTML = `<i class="ti ${s.icon}" style="font-size:14px;"></i>${message}`;
  document.body.appendChild(notif);

  if (type !== 'loading') setTimeout(() => notif.remove(), 3000);
}

// ============================================
// DÉMARRAGE
// ============================================
setInterval(tryAddButtons, 1000);
tryAddButtons();