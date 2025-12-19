// Core state
const state = {
  style: "imessage",
  profile: { me: "", them: "" },
  messages: [
    { id: crypto.randomUUID(), sender: "them", type: "text", text: "Hey there!" },
    { id: crypto.randomUUID(), sender: "me", type: "text", text: "Testing Message Log Generator." }
  ]
};

let editingState = { id: null, text: "", type: "text" };
let htmlEditorDirty = false;

// Style tokens
const STYLE_PRESETS = {
  imessage: {
    label: "iMessage",
    vars: {
      "--mlg-bg": "#ffffff",
      "--mlg-text": "#000000",
      "--mlg-me-bg": "#007aff",
      "--mlg-me-color": "#ffffff",
      "--mlg-them-bg": "#e9e9eb",
      "--mlg-them-color": "#000000",
      "--mlg-radius": "18px",
      "--mlg-shadow": "none",
      "--mlg-font": "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
    }
  },
  kakao: {
    label: "KakaoTalk",
    vars: {
      "--mlg-bg": "#b2c7d9",
      "--mlg-text": "#000000",
      "--mlg-me-bg": "#fee500",
      "--mlg-me-color": "#000000",
      "--mlg-them-bg": "#ffffff",
      "--mlg-them-color": "#000000",
      "--mlg-radius": "16px",
      "--mlg-shadow": "none",
      "--mlg-font": "'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif"
    }
  },
  instagram: {
    label: "Instagram DM",
    vars: {
      "--mlg-bg": "#0b0b0b",
      "--mlg-text": "#f5f5f5",
      "--mlg-me-bg": "linear-gradient(135deg, #4c68d7 0%, #c56cd6 100%)",
      "--mlg-me-color": "#ffffff",
      "--mlg-them-bg": "#262626",
      "--mlg-them-color": "#f5f5f5",
      "--mlg-radius": "18px",
      "--mlg-shadow": "0 16px 34px rgba(0, 0, 0, 0.38)",
      "--mlg-border": "1px solid rgba(255, 255, 255, 0.08)",
      "--mlg-bubble-border": "1px solid rgba(255, 255, 255, 0.06)",
      "--mlg-font": "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif"
    }
  },
  twitter: {
    label: "Twitter DM",
    vars: {
      "--mlg-bg": "#15202b",
      "--mlg-text": "#ffffff",
      "--mlg-me-bg": "#1d9bf0",
      "--mlg-me-color": "#ffffff",
      "--mlg-them-bg": "#253341",
      "--mlg-them-color": "#ffffff",
      "--mlg-radius": "16px",
      "--mlg-shadow": "none",
      "--mlg-font": "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif"
    }
  },
  line: {
    label: "LINE",
    vars: {
      "--mlg-bg": "#7494a5",
      "--mlg-text": "#000000",
      "--mlg-me-bg": "#06c755",
      "--mlg-me-color": "#ffffff",
      "--mlg-them-bg": "#ffffff",
      "--mlg-them-color": "#000000",
      "--mlg-radius": "18px",
      "--mlg-shadow": "none",
      "--mlg-font": "'Hiragino Kaku Gothic Pro', 'Meiryo', sans-serif"
    }
  }
};

const baseCss = `
.mlg-wrap { display: flex; justify-content: center; padding: 14px; box-sizing: border-box; overflow: hidden; }
.mlg { width: 100%; max-width: 560px; background: var(--mlg-bg); color: var(--mlg-text); border-radius: 22px; padding: 18px 16px; box-shadow: var(--mlg-shadow); box-sizing: border-box; font-family: var(--mlg-font, 'Inter', sans-serif); border: var(--mlg-border, 1px solid rgba(0, 0, 0, 0.06)); overflow: hidden; }
.mlg-thread { display: flex; flex-direction: column; gap: 14px; width: 100%; }
.mlg-message { display: flex; gap: 10px; align-items: flex-start; font-size: 15px; line-height: 1.5; width: 100%; }
.mlg-message:last-child { margin-bottom: 0; }
.mlg-message.mlg-me { flex-direction: row-reverse; }
.mlg-avatar { width: 36px; height: 36px; min-width: 36px; min-height: 36px; border-radius: 50%; object-fit: cover; object-position: center; background: #cbd5e1; border: 1px solid rgba(255, 255, 255, 0.12); flex: 0 0 36px; margin-top: 2px; aspect-ratio: 1 / 1; }
.mlg-bubble { flex: 0 1 auto; width: auto; max-width: 80%; padding: 12px 15px; border-radius: var(--mlg-radius); background: var(--mlg-them-bg); color: var(--mlg-them-color); box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12); word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; border: var(--mlg-bubble-border, 1px solid rgba(0, 0, 0, 0.04)); }
.mlg-message.mlg-me .mlg-bubble { background: var(--mlg-me-bg); color: var(--mlg-me-color); }
.mlg-bubble a { color: inherit; text-decoration: underline; }
.mlg-bubble--image { padding: 4px; background: transparent; box-shadow: none; border: none; }
.mlg-bubble-img { max-width: 220px; max-height: 280px; border-radius: var(--mlg-radius); display: block; object-fit: cover; }
@media (max-width: 720px) {
  .mlg-wrap { padding: 10px; }
  .mlg { max-width: 100%; border-radius: 18px; padding: 14px 12px; }
  .mlg-message { gap: 8px; font-size: 14px; }
  .mlg-bubble { max-width: 85%; padding: 11px 13px; line-height: 1.45; }
  .mlg-avatar { width: 32px; height: 32px; min-width: 32px; min-height: 32px; flex: 0 0 32px; aspect-ratio: 1 / 1; }
}
`;

function buildStyleCss(styleKey) {
  const preset = STYLE_PRESETS[styleKey] || STYLE_PRESETS.imessage;
  const vars = Object.entries(preset.vars)
    .map(([k, v]) => `${k}: ${v};`)
    .join(" ");
  return `.mlg.mlg-${styleKey} { ${vars} }`;
}

// Sanitizer helpers
function escapeText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/\//g, "&#47;");
}

function escapeAttr(value) {
  return escapeText(value);
}

function safeImageUrl(url) {
  if (!url) return "";
  try {
    // Allow data:image/* for embedded local picks; otherwise only http/https.
    if (url.startsWith("data:image/")) return url;
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? url : "";
  } catch (_) {
    return "";
  }
}

function buildMessageHtml(msg, avatars) {
  const senderClass = msg.sender === "me" ? "mlg-me" : "mlg-them";
  const avatarUrl = safeImageUrl(avatars[msg.sender]);
  const avatarMarkup = avatarUrl
    ? `<img class="mlg-avatar" src="${avatarUrl}" alt="${msg.sender} avatar">`
    : "";
  let bubbleContent;
  if (msg.type === "image") {
    const imgUrl = safeImageUrl(msg.text);
    bubbleContent = imgUrl
      ? `<div class="mlg-bubble mlg-bubble--image"><img class="mlg-bubble-img" src="${imgUrl}" alt="image" /></div>`
      : `<p class="mlg-bubble">[Invalid image URL]</p>`;
  } else {
    const text = escapeText(msg.text);
    bubbleContent = `<p class="mlg-bubble">${text}</p>`;
  }
  return `<article class="mlg-message ${senderClass}">${avatarMarkup}${bubbleContent}</article>`;
}

function renderExportHTML(snapshot) {
  const styleCss = `${baseCss}${buildStyleCss(snapshot.style)}`;
  const messages = snapshot.messages
    .map((msg) => buildMessageHtml(msg, snapshot.profile))
    .join("");
  return `
<style>
${styleCss}
</style>
<div class="mlg-wrap">
  <section class="mlg mlg-${snapshot.style}">
    <div class="mlg-thread">
      ${messages}
    </div>
  </section>
</div>
  `.trim();
}

function renderPreview() {
  const previewEl = document.getElementById("preview");
  const html = htmlEditorDirty && htmlEditor ? htmlEditor.value : renderExportHTML(state);
  if (!htmlEditorDirty && htmlEditor) {
    htmlEditor.value = html;
  }
  previewEl.innerHTML = sanitizePreviewHtml(html);
}

function sanitizePreviewHtml(html) {
  return String(html || "").replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
}

// UI bindings
const messageListEl = document.getElementById("message-list");
const styleSelect = document.getElementById("style-select");
const senderSelect = document.getElementById("sender-select");
const typeSelect = document.getElementById("type-select");
const messageInput = document.getElementById("message-text");
const imageInput = document.getElementById("message-image");
const addMessageBtn = document.getElementById("add-message");
const copyBtn = document.getElementById("copy-export");
const avatarMeInput = document.getElementById("avatar-me");
const avatarThemInput = document.getElementById("avatar-them");
const htmlEditor = document.getElementById("html-editor");
const resetHtmlBtn = document.getElementById("reset-html");

function renderMessageList() {
  messageListEl.innerHTML = state.messages
    .map((msg) => {
      const badgeClass = msg.sender === "me" ? "badge badge--me" : "badge badge--them";
      const badgeLabel = msg.sender === "me" ? "Me" : "Them";
      const isImage = msg.type === "image";
      const displayText = isImage ? "[Image]" : escapeText(msg.text);
      if (editingState.id === msg.id) {
        return `
<li class="message-list__item message-list__item--editing">
  <div class="message-list__meta">
    <span class="message-list__sender"><span class="${badgeClass}">${badgeLabel}</span></span>
    <input class="message-edit-input" type="text" data-edit-id="${msg.id}" value="${escapeAttr(editingState.text)}" placeholder="${isImage ? 'Image URL' : 'Message text'}" />
  </div>
  <div class="message-list__actions">
    <button class="btn" data-action="save" data-id="${msg.id}">Save</button>
    <button class="btn btn--ghost" data-action="cancel" data-id="${msg.id}">Cancel</button>
  </div>
</li>`;
      }
      const textOrThumb = isImage
        ? `<span class="message-list__text"><img class="message-list__thumb" src="${safeImageUrl(msg.text)}" alt="thumb" onerror="this.style.display='none'" /> [Image]</span>`
        : `<span class="message-list__text">${displayText}</span>`;
      return `
<li class="message-list__item">
  <div class="message-list__meta">
    <span class="message-list__sender"><span class="${badgeClass}">${badgeLabel}</span></span>
    ${textOrThumb}
  </div>
  <div class="message-list__actions">
    <button class="btn" data-action="edit" data-id="${msg.id}">Edit</button>
    <button class="btn" data-action="toggle" data-id="${msg.id}">Swap</button>
    <button class="btn" data-action="delete" data-id="${msg.id}">Delete</button>
  </div>
</li>`;
    })
    .join("");
}

function addMessage(text, sender, type = "text") {
  if (!text.trim()) return;
  state.messages.push({ id: crypto.randomUUID(), sender, type, text });
  messageInput.value = "";
  if (imageInput) imageInput.value = "";
  renderMessageList();
  renderPreview();
}

function startEdit(id) {
  const msg = state.messages.find((m) => m.id === id);
  if (!msg) return;
  editingState = { id, text: msg.text };
  renderMessageList();
}

function saveEdit(id) {
  const msg = state.messages.find((m) => m.id === id);
  if (!msg) return;
  msg.text = editingState.text;
  editingState = { id: null, text: "" };
  renderMessageList();
  renderPreview();
}

function cancelEdit() {
  editingState = { id: null, text: "" };
  renderMessageList();
}

function swapSender(id) {
  const msg = state.messages.find((m) => m.id === id);
  if (!msg) return;
  msg.sender = msg.sender === "me" ? "them" : "me";
  renderMessageList();
  renderPreview();
}

function deleteMessage(id) {
  state.messages = state.messages.filter((m) => m.id !== id);
  if (editingState.id === id) {
    editingState = { id: null, text: "" };
  }
  renderMessageList();
  renderPreview();
}

messageListEl.addEventListener("click", (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  const action = target.getAttribute("data-action");
  const id = target.getAttribute("data-id");
  if (!action || !id) return;
  if (action === "edit") startEdit(id);
  if (action === "save") saveEdit(id);
  if (action === "cancel") cancelEdit();
  if (action === "toggle") swapSender(id);
  if (action === "delete") deleteMessage(id);
});

messageListEl.addEventListener("input", (e) => {
  const target = e.target;
  if (!(target instanceof HTMLInputElement)) return;
  const editId = target.getAttribute("data-edit-id");
  if (!editId) return;
  editingState = { id: editId, text: target.value };
});

addMessageBtn.addEventListener("click", () => {
  const type = typeSelect ? typeSelect.value : "text";
  const value = type === "image" ? (imageInput ? imageInput.value : "") : messageInput.value;
  addMessage(value, senderSelect.value, type);
});

messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const type = typeSelect ? typeSelect.value : "text";
    addMessage(messageInput.value, senderSelect.value, type);
  }
});

if (imageInput) {
  imageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addMessage(imageInput.value, senderSelect.value, "image");
    }
  });
}

if (typeSelect) {
  typeSelect.addEventListener("change", (e) => {
    const isImage = e.target.value === "image";
    if (messageInput) messageInput.style.display = isImage ? "none" : "";
    if (imageInput) imageInput.style.display = isImage ? "" : "none";
  });
}

styleSelect.addEventListener("change", (e) => {
  state.style = e.target.value;
  renderPreview();
});

avatarMeInput.addEventListener("input", (e) => {
  state.profile.me = e.target.value;
  renderPreview();
});

avatarThemInput.addEventListener("input", (e) => {
  state.profile.them = e.target.value;
  renderPreview();
});

copyBtn.addEventListener("click", async () => {
  const html = htmlEditorDirty && htmlEditor ? htmlEditor.value : renderExportHTML(state);
  try {
    await navigator.clipboard.writeText(html);
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = "Copy export HTML"), 1400);
  } catch (_) {
    copyBtn.textContent = "Copy failed";
    setTimeout(() => (copyBtn.textContent = "Copy export HTML"), 1400);
  }
});

if (htmlEditor) {
  htmlEditor.addEventListener("input", () => {
    htmlEditorDirty = true;
    renderPreview();
  });
}

if (resetHtmlBtn) {
  resetHtmlBtn.addEventListener("click", () => {
    htmlEditorDirty = false;
    if (htmlEditor) {
      htmlEditor.value = renderExportHTML(state);
    }
    renderPreview();
  });
}

function init() {
  styleSelect.value = state.style;
  renderMessageList();
  renderPreview();
}

init();
