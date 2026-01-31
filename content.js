let floatingBtn = null;
let lastText = "";
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

function createFloatingButton() {
  if (floatingBtn) return;

  floatingBtn = document.createElement("div");
  floatingBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 
        10 10 10-4.48 10-10S17.52 2 12 2z"
        stroke="white" stroke-width="2"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"
        stroke="white" stroke-width="2"
        stroke-linecap="round"/>
      <circle cx="9" cy="10" r="1" fill="white"/>
      <circle cx="15" cy="10" r="1" fill="white"/>
    </svg>
  `;

  Object.assign(floatingBtn.style, {
    position: "fixed",
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "#111",
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    cursor: "grab",
    zIndex: "2147483647",
    boxShadow: "0 6px 18px rgba(0,0,0,0.5)",
    userSelect: "none"
  });

  document.documentElement.appendChild(floatingBtn);

  floatingBtn.addEventListener("click", (e) => {
    if (isDragging) return;
    e.stopPropagation();

    floatingBtn.style.display = "none";

    if (!chrome.runtime?.id) return;

    chrome.runtime.sendMessage({
      type: "OPEN_POPUP",
      payload: lastText
    });
  });

  floatingBtn.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - floatingBtn.getBoundingClientRect().left;
    offsetY = e.clientY - floatingBtn.getBoundingClientRect().top;
    floatingBtn.style.cursor = "grabbing";
    e.preventDefault();
  });
}

setInterval(() => {
  if (document.documentElement) createFloatingButton();
}, 300);

document.addEventListener("selectionchange", () => {
  if (!floatingBtn || isDragging) return;

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const text = selection.toString().trim();
  if (!text || text === lastText) return;

  lastText = text;

  const rect = selection.getRangeAt(0).getBoundingClientRect();
  floatingBtn.style.left = `${rect.right - 18}px`;
  floatingBtn.style.top = `${rect.bottom + 8}px`;
  floatingBtn.style.display = "flex";
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging || !floatingBtn) return;

  floatingBtn.style.left = `${e.clientX - offsetX}px`;
  floatingBtn.style.top = `${e.clientY - offsetY}px`;
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  if (floatingBtn) floatingBtn.style.cursor = "grab";
});
