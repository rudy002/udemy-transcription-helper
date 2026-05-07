# 🎓 Udemy Transcription Helper

A Chrome extension that adds two powerful buttons to Udemy video lessons:
- 📋 **Copy** the full transcript in one click
- ✨ **Summarize** the transcript using Groq AI

---

## ✨ Features

- One-click transcript copy
- AI-powered summarization using Groq (free)
- Customizable prompt and language
- Each user uses their own free Groq API key
- Works on all Udemy video lessons

---

## 🚀 Installation

### Option 1 : Chrome Web Store (coming soon)

### Option 2 : Manual installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (top right toggle)
4. Click **"Load unpacked"**
5. Select the `extension-udemy` folder
6. The extension is now installed ✅

---

## 🔑 Setup — Get your free Groq API key

1. Go to [console.groq.com](https://console.groq.com) and create a free account
2. Click **"API Keys"** → **"Create API Key"**
3. Copy the key (starts with `gsk_`)
4. Click the extension settings icon in Chrome
5. Paste your key and click **Save**

---

## 📖 How to use

1. Go to any Udemy video lesson
2. Open the **"Transcript"** panel on Udemy
3. Two buttons will appear at the bottom right of the page
4. Click **📋 Copy** to copy the full transcript
5. Click **✨ Summarize** to get an AI summary

---

## ⚙️ Settings

In the extension settings you can customize:
- **Groq API Key** — your personal free API key
- **Summary language** — French, English, Spanish, German, Arabic
- **Custom prompt** — tell the AI exactly how you want the summary

---

## 🛠️ Tech Stack

- Vanilla JavaScript
- Chrome Extensions Manifest V3
- Groq API (llama-3.3-70b-versatile)

---

## 📄 License

MIT License — free to use, modify and distribute.

---

## 🙏 Contributing

Pull requests are welcome! Feel free to open an issue if you find a bug or want to suggest a feature.