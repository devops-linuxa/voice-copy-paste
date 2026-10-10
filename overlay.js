(() => {
  const oldHost = document.getElementById("speech-to-text-overlay");
  if (oldHost) oldHost.remove();

  const host = document.createElement("div");
  host.id = "speech-to-text-overlay";

  Object.assign(host.style, {
    all: "initial",
    position: "fixed",
    top: "16px",
    right: "16px",
    zIndex: "2147483647",
    width: "320px",
    display: "none"
  });

  const shadow = host.attachShadow({ mode: "open" });

  shadow.innerHTML = `
    <style>
      .panel {
        box-sizing: border-box;
        width: 100%;
        padding: 18px;
        border-radius: 12px;
        border: 1px solid #475569;
        background: #1e293b;
        color: white;
        font: 15px Arial, sans-serif;
        box-shadow: 0 8px 30px rgba(0,0,0,.35);
      }

      .header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
        color: #cbd5e1;
        font-size: 13px;
      }

      .dot {
        width: 10px;
        height: 10px;
        flex: 0 0 10px;
        border-radius: 50%;
        background: #ef4444;
      }

      .text {
        overflow-wrap: anywhere;
        white-space: pre-wrap;
        line-height: 1.5;
        max-height: calc(50vh - 75px);
        overflow-y: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .text::-webkit-scrollbar {
        display: none;
      }

      .text:empty {
        display: none;
      }
    </style>

    <div class="panel">
      <div class="header">
        <span class="dot"></span>
        <span id="status">Идёт запись...</span>
      </div>
      <div class="text" id="text"></div>
    </div>
  `;

  document.documentElement.appendChild(host);

  const statusElement = shadow.getElementById("status");
  const textElement = shadow.getElementById("text");

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "SHOW_DICTATION_OVERLAY") {
      host.style.display = "none";
      statusElement.textContent = "Идёт запись...";
      textElement.textContent = "";
      textElement.scrollTop = 0;
      return;
    }

    if (message.type === "DICTATION_OVERLAY_UPDATE") {
      const text = message.text || "";
      const status = message.status || "";

      if (status !== "Идёт запись..." && !text.trim()) {
        host.style.display = "none";
        return;
      }

      statusElement.textContent = "Идёт запись...";
      textElement.textContent = text;
      host.style.display = "block";

      // Держим последнюю строку видимой, автоматически сдвигая текст вверх.
      textElement.scrollTop = textElement.scrollHeight;
    }

    if (message.type === "DICTATION_OVERLAY_HIDE") {
      host.style.display = "none";
      textElement.textContent = "";
      textElement.scrollTop = 0;
    }
  });
})();