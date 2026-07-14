const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const selectBtn = document.getElementById("select-btn");
const statusText = document.getElementById("status-text");

const uploadView = document.getElementById("upload-view");
const chatView = document.getElementById("chat-view");
const docName = document.getElementById("doc-name");
const newDocBtn = document.getElementById("new-doc-btn");

const questionInput = document.getElementById("question-input");
const askBtn = document.getElementById("ask-btn");
const answerArea = document.getElementById("answer-area");

selectBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) {
    uploadFile(fileInput.files[0]);
  }
});

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  if (e.dataTransfer.files.length > 0) {
    uploadFile(e.dataTransfer.files[0]);
  }
});

async function uploadFile(file) {
  statusText.textContent = "Processing document...";

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (res.ok) {
      statusText.textContent = "";
      docName.textContent = `Document: ${data.filename} (${data.chunks_created} chunks)`;
      uploadView.classList.add("hidden");
      chatView.classList.remove("hidden");
    } else {
      statusText.textContent = "Something went wrong while processing the file.";
    }
  } catch (err) {
    statusText.textContent = "Could not reach the server. Is the backend running?";
  }
}

newDocBtn.addEventListener("click", () => {
  chatView.classList.add("hidden");
  uploadView.classList.remove("hidden");
  answerArea.innerHTML = "";
  fileInput.value = "";
});

askBtn.addEventListener("click", askQuestion);
questionInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") askQuestion();
});

async function askQuestion() {
  const question = questionInput.value.trim();
  if (!question) return;

  askBtn.disabled = true;
  askBtn.textContent = "Thinking...";

  try {
    const res = await fetch("/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });
    const data = await res.json();

    const card = document.createElement("div");
    card.className = "answer-card";

    const sourcesHtml = data.sources.map(s =>
      `<div class="source-chunk">Page ${s.page}: ${s.content}</div>`
    ).join("");

    card.innerHTML = `
      <div class="answer-question">${question}</div>
      <div class="answer-text">${res.ok ? data.answer : "Something went wrong while fetching the answer."}</div>
      ${res.ok ? `<details class="sources"><summary>View source chunks used</summary>${sourcesHtml}</details>` : ""}
    `;

    answerArea.prepend(card);
    questionInput.value = "";
  } catch (err) {
    statusText.textContent = "Could not reach the server.";
  } finally {
    askBtn.disabled = false;
    askBtn.textContent = "Ask";
  }
}
