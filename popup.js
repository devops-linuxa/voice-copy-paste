document.getElementById("open").addEventListener("click", async () => {
  const language = document.getElementById("language").value;
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  const target = tab?.id ?? -1;
  const url = chrome.runtime.getURL(
    "dictation.html?lang=" + encodeURIComponent(language) +
    "&target=" + target
  );

  await chrome.tabs.create({ url });
  window.close();
});
