
const params = new URLSearchParams(location.search);
const languageSelect = document.getElementById("language");
const textArea = document.getElementById("text");
const status = document.getElementById("status");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");

const autoStart = params.get("hotkey") === "1";
languageSelect.value = params.get("lang") || "ru-RU";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;
let running = false;
let stopping = false;
let finalText = "";
let restartTimer = null;
let stopPromise = null;

function setStatus(message) {
  status.textContent = message;
}

function startRecognition() {
  if (!SpeechRecognition) {
    setStatus("Web Speech API не поддерживается.");
    return;
  }

  if (running || stopping) return;

  finalText = "";
  textArea.value = "";
  running = true;
  startButton.disabled = true;
  stopButton.disabled = false;
  setStatus("Запускаю распознавание...");

  createRecognition();
}

function createRecognition() {
  if (!running || stopping) return;

  const current = new SpeechRecognition();
  recognition = current;
  current.lang = languageSelect.value;
  current.continuous = true;
  current.interimResults = true;

  current.onstart = () => {
    setStatus("Идёт запись...");
  };

  current.onresult = (event) => {
    let interim = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];

      if (result.isFinal) {
        finalText += result[0].transcript + " ";
      } else {
        interim += result[0].transcript;
      }
    }

    textArea.value = finalText + interim;
  };

  current.onerror = (event) => {
    setStatus("Ошибка распознавания: " + event.error);

    if ([
      "not-allowed",
      "service-not-allowed",
      "audio-capture",
      "language-not-supported"
    ].includes(event.error)) {
      running = false;
      startButton.disabled = false;
      stopButton.disabled = true;
    }
  };

  current.onend = () => {
    if (running && !stopping) {
      restartTimer = setTimeout(() => {
        createRecognition();
      }, 300);
    }
  };

  try {
    current.start();
  } catch (error) {
    running = false;
    startButton.disabled = false;
    stopButton.disabled = true;
    setStatus("Не удалось запустить: " + error.message);
  }
}

function copyText(text) {
  return new Promise((resolve) => {
    if (!text) {
      resolve(true);
      return;
    }

    textArea.value = text;
    textArea.focus();
    textArea.select();

    let copied = false;

    try {
      copied = document.execCommand("copy");
    } catch (error) {
      console.error("execCommand copy:", error);
    }

    if (copied) {
      resolve(true);
      return;
    }

    navigator.clipboard.writeText(text)
      .then(() => resolve(true))
      .catch((error) => {
        console.error("Clipboard API:", error);
        resolve(false);
      });
  });
}

async function stopRecognition() {
  if (stopPromise) return stopPromise;

  stopPromise = (async () => {
    stopping = true;
    running = false;
    clearTimeout(restartTimer);

    const current = recognition;

    if (current) {
      try {
        current.stop();
      } catch (_) {}
    }

    // Ждём финальные результаты речи.
    await new Promise(resolve => setTimeout(resolve, 1200));

    const text = textArea.value.trim();
    const copied = await copyText(text);

    if (!copied) {
      setStatus("Ошибка копирования. Текст оставлен на странице.");
      stopping = false;
      stopPromise = null;
      return;
    }

    setStatus("Текст скопирован. Закрываю вкладку...");

    chrome.runtime.sendMessage(
      { type: "DICTATION_STOPPED" },
      () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
        }
      }
    );
  })();

  return stopPromise;
}

startButton.addEventListener("click", startRecognition);
stopButton.addEventListener("click", stopRecognition);

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "STOP_DICTATION") {
    stopRecognition();
  }
});

document.getElementById("copy").addEventListener("click", async () => {
  const copied = await copyText(textArea.value.trim());
  setStatus(copied ? "Текст скопирован." : "Ошибка копирования.");
});

window.addEventListener("beforeunload", () => {
  running = false;
  clearTimeout(restartTimer);

  try {
    recognition?.abort();
  } catch (_) {}
});

if (autoStart) {
  setTimeout(startRecognition, 1000);
}