
const dictationUrl = chrome.runtime.getURL("dictation.html");

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "toggle-dictation") return;

  try {
    const tabs = await chrome.tabs.query({});
    const dictationTab = tabs.find(
      tab => tab.url?.startsWith(dictationUrl)
    );

    // Повторный хоткей — остановить запись.
    if (dictationTab?.id != null) {
      await chrome.tabs.sendMessage(dictationTab.id, {
        type: "STOP_DICTATION"
      });
      return;
    }

    const { language = "ru-RU" } =
      await chrome.storage.local.get("language");

    // Открываем техническую вкладку в фоне.
    await chrome.tabs.create({
      url: dictationUrl +
        "?lang=" + encodeURIComponent(language) +
        "&hotkey=1",
      active: false,
      pinned: true
    });
  } catch (error) {
    console.error("Dictation error:", error);
  }
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (
    message.type === "DICTATION_STOPPED" &&
    sender.tab?.id != null
  ) {
    chrome.tabs.remove(sender.tab.id).catch(error => {
      console.error("Не удалось закрыть вкладку:", error);
    });
  }
});