const params = new URLSearchParams(location.search);
const languageSelect = document.getElementById("language");
const textArea = document.getElementById("text");
const status = document.getElementById("status");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");

const targetTab = Number(params.get("target") ?? -1);
languageSelect.value = params.get("lang") || "ru-RU";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;
let running = false;
let finalText = "";
let restartTimer = null;

function setStatus(message) {
  status.textContent = message;
}

function stopRecognition() {
  running = false;
  clearTimeout(restartTimer);

  if (recognition) {
    try {
      recognition.stop();
    } catch (_) {}
  }

  startButton.disabled = false;
  stopButton.disabled = true;
  setStatus("Распознавание остановлено.");
}

function startRecognition() {
  if (!SpeechRecognition) {
    setStatus("Этот браузер не поддерживает Web Speech API.");
    return;
  }

  if (running) return;

  running = true;
  startButton.disabled = true;
  stopButton.disabled = false;
  setStatus("Запуск распознавания...");

  try {
    recognition = new SpeechRecognition();
    recognition.lang = languageSelect.value;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setStatus("Слушаю. Говори в микрофон.");
    };

    recognition.onresult = (event) => {
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalText += transcript + " ";
        } else {
          interimText += transcript;
        }
      }

      textArea.value = finalText + interimText;
    };

    recognition.onerror = (event) => {
      const messages = {
        "not-allowed": "Нет доступа к микрофону. Проверь разрешения Chrome.",
        "service-not-allowed": "Служба распознавания речи запрещена.",
        "audio-capture": "Не найден микрофон или он занят.",
        "network": "Ошибка сети при распознавании речи.",
        "no-speech": "Речь не обнаружена. Продолжаю слушать.",
        "language-not-supported": "Этот язык не поддерживается."
      };

      setStatus(messages[event.error] || ("Ошибка распознавания: " + event.error));

      if (["not-allowed", "service-not-allowed", "audio-capture",
           "language-not-supported"].includes(event.error)) {
        stopRecognition();
      }
    };

    recognition.onend = () => {
      if (running) {
        setStatus("Перезапуск распознавания...");
        restartTimer = setTimeout(() => {
          if (running) {
            try {
              recognition.start();
            } catch (_) {
              // Если повторный запуск пока невозможен,
              // следующая попытка будет сделана после нового завершения.
            }
          }
        }, 500);
      } else {
        startButton.disabled = false;
        stopButton.disabled = true;
      }
    };

    recognition.start();
  } catch (error) {
    running = false;
    startButton.disabled = false;
    stopButton.disabled = true;
    setStatus("Не удалось запустить распознавание: " + error.message);
  }
}

startButton.addEventListener("click", startRecognition);
stopButton.addEventListener("click", stopRecognition);

languageSelect.addEventListener("change", () => {
  if (running) {
    stopRecognition();
    setStatus("Язык изменён. Нажми «Начать» снова.");
  }
});

document.getElementById("copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(textArea.value);
    setStatus("Текст скопирован.");
  } catch (_) {
    textArea.select();
    setStatus("Выделил текст — скопируй его сочетанием Ctrl+C.");
  }
});

document.getElementById("insert").addEventListener("click", async () => {
  if (targetTab < 0) {
    setStatus("Не найдена исходная вкладка. Скопируй текст вручную.");
    return;
  }

  try {
    await chrome.tabs.sendMessage(targetTab, {
      type: "INSERT_TEXT",
      text: textArea.value
    });
    setStatus("Команда вставки отправлена.");
  } catch (_) {
    setStatus("Не удалось вставить. На этой странице вставка может быть запрещена; скопируй текст вручную.");
  }
});

window.addEventListener("beforeunload", () => {
  running = false;
  clearTimeout(restartTimer);
  if (recognition) {
    try { recognition.abort(); } catch (_) {}
  }
});
