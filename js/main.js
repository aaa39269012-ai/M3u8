const urlInput = document.getElementById("urlInput");
const parseBtn = document.getElementById("parseBtn");
const qualitySection = document.getElementById("qualitySection");
const qualitySelect = document.getElementById("qualitySelect");
const startBtn = document.getElementById("startBtn");
const progressSection = document.getElementById("progressSection");
const progressFill = document.getElementById("progressFill");
const statusText = document.getElementById("statusText");
const resultSection = document.getElementById("resultSection");
const preview = document.getElementById("preview");
const downloadBtn = document.getElementById("downloadBtn");
const errorText = document.getElementById("errorText");

let currentQualities = [];

function showError(msg) {
  errorText.textContent = msg;
}

function updateProgress(percent, text) {
  progressFill.style.width = percent + "%";
  statusText.textContent = text;
}

parseBtn.addEventListener("click", async () => {
  errorText.textContent = "";
  qualitySection.classList.add("hidden");
  resultSection.classList.add("hidden");

  const url = urlInput.value.trim();
  if (!url) return showError("Please paste a valid m3u8 URL");

  parseBtn.disabled = true;
  try {
    currentQualities = await parsePlaylist(url);
    qualitySelect.innerHTML = "";
    currentQualities.forEach((q, i) => {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = q.label;
      qualitySelect.appendChild(opt);
    });
    qualitySection.classList.remove("hidden");
  } catch (err) {
    showError(err.message);
  } finally {
    parseBtn.disabled = false;
  }
});

startBtn.addEventListener("click", async () => {
  errorText.textContent = "";
  progressSection.classList.remove("hidden");
  resultSection.classList.add("hidden");
  startBtn.disabled = true;

  try {
    const selected = currentQualities[qualitySelect.value];
    updateProgress(0, "Starting download...");

    const data = await downloadSegments(selected.url, updateProgress);
    const blob = await convertToMp4(data, (msg) => updateProgress(95, msg));

    const objectUrl = URL.createObjectURL(blob);
    preview.src = objectUrl;
    downloadBtn.href = objectUrl;

    resultSection.classList.remove("hidden");
    updateProgress(100, "Done!");
  } catch (err) {
    showError(err.message);
  } finally {
    startBtn.disabled = false;
  }
});
