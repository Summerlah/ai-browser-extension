
const GROQ_API_KEY = "YOUR_GROQ_API_KEY_HERE";

async function callAI(prompt) {
  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        })
      }
    );

    const data = await response.json();
    console.log("Groq response:", data);

    return (
      data.choices?.[0]?.message?.content ||
      "No response from AI."
    );

  } catch (error) {
    console.error("Groq error:", error);
    return "Error contacting AI service.";
  }
}

document.addEventListener("DOMContentLoaded", async () => {

  const messages = document.getElementById("messages");
  const input = document.getElementById("input");
  const send = document.getElementById("send");
  const closeBtn = document.getElementById("close");
  const minimizeBtn = document.getElementById("minimize");
  const chat = document.getElementById("chat");
  const dragBar = document.getElementById("drag-bar");

  closeBtn.onclick = () => window.close();
  minimizeBtn.onclick = () => {
    chat.style.display = chat.style.display === "none" ? "flex" : "none";
  };

  let isDragging = false;
  let startX, startY;

  dragBar.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.screenX;
    startY = e.screenY;
  });

  document.addEventListener("mouseup", () => isDragging = false);

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    window.moveBy(e.screenX - startX, e.screenY - startY);
    startX = e.screenX;
    startY = e.screenY;
  });

  chrome.storage.session.get("selectedText", (data) => {
    if (data.selectedText) input.value = data.selectedText;
  });

  send.onclick = sendMessage;
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage("user", text);
    input.value = "";

    const thinking = addMessage("ai", "Thinking...");

    const aiReply = await callAI(text);
    thinking.remove();
    addMessage("ai", aiReply);

  }

  function addMessage(role, text) {
    const msg = document.createElement("div");
    msg.className = `msg ${role}`;
    msg.innerHTML = `<div class="bubble">${text}</div>`;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
    return msg;
  }
});
