// ============================================
// UDEMY TRANSCRIPTION HELPER - content.js
// ============================================

function tryAddButtons() {
  if (document.getElementById('udemy-helper-buttons')) return;

  const transcript =
    document.querySelector('[data-purpose="transcript-cue-active"]') ||
    document.querySelector('[data-purpose="transcript-cue"]') ||
    document.querySelector('[class*="transcript-cue"]');

  if (transcript) {
    addButtons();
    console.log('[Udemy Helper] ✅ Transcript detected, buttons added!');
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
    padding: 10px;
    background: rgba(0,0,0,0.85);
    border-radius: 10px;
    position: fixed;
    bottom: 80px;
    right: 20px;
    z-index: 99999;
    backdrop-filter: blur(6px);
    border: 1px solid rgba(255,255,255,0.1);
  `;

  const copyBtn = document.createElement('button');
  copyBtn.innerText = '📋 Copy';
  copyBtn.style.cssText = getButtonStyle('#2563eb');
  copyBtn.addEventListener('click', copyTranscript);
  copyBtn.addEventListener('mouseover', () => (copyBtn.style.opacity = '0.8'));
  copyBtn.addEventListener('mouseout', () => (copyBtn.style.opacity = '1'));

  const summarizeBtn = document.createElement('button');
  summarizeBtn.innerText = '✨ Summarize';
  summarizeBtn.style.cssText = getButtonStyle('#7c3aed');
  summarizeBtn.addEventListener('click', summarizeTranscript);
  summarizeBtn.addEventListener(
    'mouseover',
    () => (summarizeBtn.style.opacity = '0.8'),
  );
  summarizeBtn.addEventListener(
    'mouseout',
    () => (summarizeBtn.style.opacity = '1'),
  );

  container.appendChild(copyBtn);
  container.appendChild(summarizeBtn);
  document.body.appendChild(container);
}

function getButtonStyle(color) {
  return `
    background: ${color};
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    opacity: 1;
    transition: opacity 0.2s;
  `;
}

// ============================================
// TRANSCRIPT EXTRACTION
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
      return Array.from(lines)
        .map((el) => el.innerText.trim())
        .join(' ');
    }
  }
  return null;
}

// ============================================
// BUTTON 1: COPY
// ============================================
function copyTranscript() {
  const transcript = getTranscription();
  if (!transcript) {
    showNotification('❌ Transcript not found.', 'error');
    return;
  }
  navigator.clipboard.writeText(transcript).then(() => {
    showNotification('✅ Transcript copied!', 'success');
  });
}

// ============================================
// BUTTON 2: SUMMARIZE
// ============================================
async function summarizeTranscript() {
  const transcript = getTranscription();
  if (!transcript) {
    showNotification('❌ Transcript not found.', 'error');
    return;
  }

  chrome.storage.sync.get(
    ['apiKey', 'customPrompt', 'language'],
    async (settings) => {
      if (!settings.apiKey) {
        showNotification('❌ Configure your API key in settings!', 'error');
        chrome.runtime.sendMessage({ action: 'openOptions' });
        return;
      }

      const prompt =
        settings.customPrompt ||
        'Summarize this transcript in clear, concise key points.';
      const language = settings.language || 'english';

      showNotification('⏳ Summarizing...', 'loading');

      const summary = await callGroq(
        settings.apiKey,
        transcript,
        prompt,
        language,
      );
      document.getElementById('udemy-helper-notif')?.remove();

      if (summary) showSummaryPanel(summary);
      else showNotification('❌ Error while summarizing.', 'error');
    },
  );
}

// ============================================
// GROQ API CALL
// ============================================
async function callGroq(apiKey, transcript, prompt, language) {
  try {
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'user',
              content: `${prompt}\n\nReply in ${language}.\n\nTranscript:\n${transcript.slice(0, 10000)}`,
            },
          ],
          max_tokens: 1000,
        }),
      },
    );

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
// SUMMARY PANEL
// ============================================
function showSummaryPanel(summary) {
  document.getElementById('udemy-summary-panel')?.remove();

  const panel = document.createElement('div');
  panel.id = 'udemy-summary-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #1e1e2e;
    color: #cdd6f4;
    border-radius: 12px;
    padding: 24px;
    width: 520px;
    max-height: 75vh;
    overflow-y: auto;
    z-index: 999999;
    box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    font-family: sans-serif;
    line-height: 1.6;
    border: 1px solid #313244;
  `;

  const safeContent = summary
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');

  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <h2 style="margin:0;color:#cba6f7;font-size:18px;">✨ AI Summary</h2>
      <button id="close-summary-panel" style="background:none;border:none;color:#cdd6f4;font-size:22px;cursor:pointer;">✕</button>
    </div>
    <div style="white-space:pre-wrap;font-size:14px;">${safeContent}</div>
    <button id="copy-summary-btn" style="margin-top:16px;background:#7c3aed;color:white;border:none;padding:10px 16px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;width:100%;">
      📋 Copy summary
    </button>
  `;

  document.body.appendChild(panel);
  document
    .getElementById('close-summary-panel')
    .addEventListener('click', () => panel.remove());
  document.getElementById('copy-summary-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(summary);
    showNotification('✅ Summary copied!', 'success');
  });
}

// ============================================
// NOTIFICATIONS
// ============================================
function showNotification(message, type) {
  document.getElementById('udemy-helper-notif')?.remove();

  const notif = document.createElement('div');
  notif.id = 'udemy-helper-notif';
  const colors = { success: '#16a34a', error: '#dc2626', loading: '#2563eb' };

  notif.style.cssText = `
    position: fixed;
    bottom: 140px;
    right: 20px;
    background: ${colors[type]};
    color: white;
    padding: 10px 16px;
    border-radius: 8px;
    z-index: 999999;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;

  notif.innerText = message;
  document.body.appendChild(notif);
  if (type !== 'loading') setTimeout(() => notif.remove(), 3000);
}

// ============================================
// STARTUP
// ============================================
setInterval(tryAddButtons, 1000);
tryAddButtons();
