// Core assistant
(() => {
  const root = document.querySelector(".core-chat");
  if (!root) return;
  const launcher = root.querySelector(".core-chat-launcher");
  const panel = root.querySelector(".core-chat-panel");
  const header = root.querySelector(".core-chat-header");
  const close = root.querySelector(".core-chat-close");
  const minimize = root.querySelector(".core-chat-minimize");
  const form = root.querySelector(".core-chat-form");
  const input = root.querySelector("textarea");
  const messages = root.querySelector(".core-chat-messages");
  const homeChatButton = document.querySelector(".home-side-chat");
  const history = [];
  let minimized = false;

  function setOpen(open) {
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));
    if (open && !minimized) input.focus();
  }
  function setMinimized(value) {
    minimized = value;
    panel.classList.toggle("is-minimized", value);
    minimize.setAttribute("aria-label", value ? "Restore chat" : "Minimize chat");
    minimize.textContent = value ? "+" : "−";
    if (!value) input.focus();
  }
  function addMessage(text, role) {
    const item = document.createElement("div");
    item.className = `core-chat-message ${role}`;
    item.textContent = text;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
    return item;
  }

  launcher.addEventListener("click", () => setOpen(panel.hidden));
  homeChatButton?.addEventListener("click", () => launcher.click());
  close.addEventListener("click", (event) => {
    event.stopPropagation();
    setOpen(false);
  });
  minimize.addEventListener("click", (event) => {
    event.stopPropagation();
    setMinimized(!minimized);
  });

  let drag = null;
  header.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) return;
    const rect = root.getBoundingClientRect();
    drag = {
      id: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };
    root.classList.add("is-dragging");
    header.setPointerCapture(event.pointerId);
  });
  header.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const maxX = Math.max(8, window.innerWidth - root.offsetWidth - 8);
    const maxY = Math.max(8, window.innerHeight - root.offsetHeight - 8);
    const left = Math.min(maxX, Math.max(8, event.clientX - drag.offsetX));
    const top = Math.min(maxY, Math.max(8, event.clientY - drag.offsetY));
    root.style.left = `${left}px`;
    root.style.top = `${top}px`;
    root.style.right = "auto";
    root.style.bottom = "auto";
  });
  function stopDrag(event) {
    if (!drag || event.pointerId !== drag.id) return;
    try {
      header.releasePointerCapture(event.pointerId);
    } catch (_) {}
    localStorage.setItem("coreChatPosition", JSON.stringify({ left: root.style.left, top: root.style.top }));
    drag = null;
    root.classList.remove("is-dragging");
  }
  header.addEventListener("pointerup", stopDrag);
  header.addEventListener("pointercancel", stopDrag);
  try {
    const saved = JSON.parse(localStorage.getItem("coreChatPosition") || "null");
    if (saved?.left && saved?.top) {
      root.style.left = saved.left;
      root.style.top = saved.top;
      root.style.right = "auto";
      root.style.bottom = "auto";
    }
  } catch (_) {}

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    addMessage(text, "user");
    history.push({ role: "user", content: text });
    const pending = addMessage("Thinking...", "assistant");
    form.querySelector("button").disabled = true;
    try {
      const selected = JSON.parse(localStorage.getItem("renderShopBuild") || "[]")
        .map((part) => `${part.brand} ${part.name}`)
        .join(", ");
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...history,
            ...(selected
              ? [
                  {
                    role: "user",
                    content: `Current selected parts: ${selected}`,
                  },
                ]
              : []),
          ],
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Server returned HTTP ${response.status}.`);
      pending.textContent = data.text;
      history.push({ role: "assistant", content: data.text });
    } catch (error) {
      pending.textContent = `Assistant error: ${error.message || "Unknown error."}`;
    } finally {
      form.querySelector("button").disabled = false;
      input.focus();
    }
  });
})();
