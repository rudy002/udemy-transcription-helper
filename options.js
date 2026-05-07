// ============================================
// UDEMY TRANSCRIPTION HELPER - options.js
// ============================================

const defaultPrompt = `Summarize this course transcription in clear, concise key points.
Use bullet points.
Highlight the important concepts.
Add a short overall summary at the end.`;

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();

  document.getElementById('btn-save').addEventListener('click', saveSettings);
  document.getElementById('toggle-key').addEventListener('click', toggleKeyVisibility);
});

function loadSettings() {
  chrome.storage.sync.get(['apiKey', 'customPrompt', 'language'], (settings) => {
    document.getElementById('apiKey').value = settings.apiKey || '';
    document.getElementById('customPrompt').value = settings.customPrompt || defaultPrompt;
    document.getElementById('language').value = settings.language || 'english';
    updateKeyStatus(!!settings.apiKey);
  });
}

function saveSettings() {
  const apiKey = document.getElementById('apiKey').value.trim();
  const customPrompt = document.getElementById('customPrompt').value.trim();
  const language = document.getElementById('language').value;

  if (!apiKey) {
    showStatus('❌ Please enter your Groq API key.', 'error');
    return;
  }

  if (!apiKey.startsWith('gsk_')) {
    showStatus('❌ Groq API keys must start with "gsk_".', 'error');
    return;
  }

  chrome.storage.sync.set({ apiKey, customPrompt, language }, () => {
    updateKeyStatus(true);
    showStatus('✅ Settings saved!', 'success');
  });
}

function updateKeyStatus(hasKey) {
  const dot = document.getElementById('key-dot');
  const text = document.getElementById('key-status-text');

  if (hasKey) {
    dot.classList.add('ok');
    text.innerText = 'Groq API key configured ✅';
  } else {
    dot.classList.remove('ok');
    text.innerText = 'No key configured';
  }
}

function toggleKeyVisibility() {
  const input = document.getElementById('apiKey');
  const btn = document.getElementById('toggle-key');

  if (input.type === 'password') {
    input.type = 'text';
    btn.innerText = 'Hide';
  } else {
    input.type = 'password';
    btn.innerText = 'Show';
  }
}

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.innerText = message;
  status.className = `status ${type}`;
  setTimeout(() => {
    status.innerText = '';
    status.className = 'status';
  }, 3000);
}