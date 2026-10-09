
const dictationUrl = chrome.runtime.getURL("dictation.html");

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "toggle-dictation") return;

  try {
    const tabs = await chrome.tabs.query({});
    const dictationTab = tabs.find(
      tab => tab.url?.startsWith(dictationUrl)
    );

    if (dictationTab?.id != null) {
      await chrome.tabs.sendMessage(dictationTab.id, {
        type: "STOP_DICTATION"
      });
      return;
    }

    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    const { language = "ru-RU" } =
      await chrome.storage.local.get("language");

    const targetTabId = activeTab?.id ?? -1;

    if (targetTabId >= 0) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: targetTabId },
          files: ["overlay.js"]
        });

        await chrome.tabs.sendMessage(targetTabId, {
          type: "SHOW_DICTATION_OVERLAY"
        });
      } catch (error) {
        console.error(
          "Не удалось открыть панель на этой вкладке:",
          error
        );
      }
    }

    await chrome.tabs.create({
      url: dictationUrl +
        "?lang=" + encodeURIComponent(language) +
        "&hotkey=1" +
        "&target=" + targetTabId,
      active: false,
      pinned: true
    });
  } catch (error) {
    console.error("Ошибка диктовки:", error);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "DICTATION_OVERLAY_UPDATE") {
    const targetTabId = message.targetTabId;

    if (Number.isInteger(targetTabId) && targetTabId >= 0) {
      chrome.tabs.sendMessage(targetTabId, {
        type: "DICTATION_OVERLAY_UPDATE",
        text: message.text || "",
        status: message.status || "Идёт запись..."
      }).catch(error => {
        console.warn("Не удалось обновить текст панели:", error);
      });
    }

    return;
  }

  if (message.type === "DICTATION_STOPPED") {
    const targetTabId = message.targetTabId;

    sendResponse({ ok: true });

    if (Number.isInteger(targetTabId) && targetTabId >= 0) {
      chrome.tabs.sendMessage(targetTabId, {
        type: "DICTATION_OVERLAY_HIDE"
      }).catch(() => {});
    }

    if (sender.tab?.id != null) {
      chrome.tabs.remove(sender.tab.id).catch(error => {
        console.error("Не удалось закрыть вкладку:", error);
      });
    }
  }
});