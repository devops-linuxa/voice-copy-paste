
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "INSERT_TEXT") return;

  const text = message.text;
  const el = document.activeElement;

  if (!el) {
    sendResponse({ ok: false });
    return;
  }

  // Поля ввода и текстовые области
  if (
    el instanceof HTMLTextAreaElement ||
    (el instanceof HTMLInputElement &&
      ["text", "search", "email", "url", "tel"].includes(el.type))
  ) {
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;

    const setter = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(el),
      "value"
    )?.set;

    if (setter) {
      setter.call(
        el,
        el.value.slice(0, start) +
        text +
        el.value.slice(end)
      );
    } else {
      el.value =
        el.value.slice(0, start) +
        text +
        el.value.slice(end);
    }

    const pos = start + text.length;
    el.setSelectionRange(pos, pos);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    sendResponse({ ok: true });
    return;
  }

  // Редакторы с contenteditable
  if (el.isContentEditable) {
    const ok = document.execCommand("insertText", false, text);
    sendResponse({ ok });
    return;
  }

  sendResponse({
    ok: false,
    reason: "no-editable-field"
  });
});