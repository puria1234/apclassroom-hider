"use strict";

// ── CSS that hides answer indicators ─────────────────────────────────────────
const HIDE_CSS = `
.mcq-option.--correct,
.mcq-option.--incorrect {
  background-color: rgba(255,255,255,1) !important;
  border: 0 !important;
}
.response-analysis-wrapper > .icon {
  display: none !important;
}
.--chosen {
  color: inherit !important;
  background-color: inherit !important;
}
.LearnosityDistractor {
  display: none !important;
}
`;

// ── CSS for the floating panel UI ────────────────────────────────────────────
const PANEL_CSS = `
.cbh-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 2147483647;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: #1e293b;
  color: #f1f5f9;
  border-radius: 14px;
  box-shadow: 0 4px 24px rgba(0,0,0,.25);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 13px;
  user-select: none;
  transition: all .25s ease;
}
.cbh-panel--collapsed { padding: 8px 12px; gap: 0; }
.cbh-panel--collapsed .cbh-title,
.cbh-panel--collapsed .cbh-switch,
.cbh-panel--collapsed .cbh-status { display: none; }
.cbh-title { font-weight: 600; white-space: nowrap; }
.cbh-switch {
  position: relative; display: inline-block;
  width: 40px; height: 22px; flex-shrink: 0; cursor: pointer;
}
.cbh-switch input { opacity: 0; width: 0; height: 0; }
.cbh-slider {
  position: absolute; inset: 0;
  background: #475569; border-radius: 22px; transition: background .2s;
}
.cbh-slider::after {
  content: ""; position: absolute; left: 3px; top: 3px;
  width: 16px; height: 16px; background: #fff;
  border-radius: 50%; transition: transform .2s;
}
.cbh-switch input:checked + .cbh-slider { background: #3b82f6; }
.cbh-switch input:checked + .cbh-slider::after { transform: translateX(18px); }
.cbh-status {
  padding: 2px 8px; border-radius: 6px; font-size: 11px;
  font-weight: 600; background: #3b82f6; color: #fff;
  white-space: nowrap; transition: background .2s;
}
.cbh-status--showing { background: #22c55e; }
.cbh-collapse-btn {
  display: flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border: none; border-radius: 6px;
  background: rgba(255,255,255,.1); color: #94a3b8;
  font-size: 16px; line-height: 1; cursor: pointer;
  transition: background .15s; flex-shrink: 0;
}
.cbh-collapse-btn:hover { background: rgba(255,255,255,.2); color: #fff; }
`;

// ── State ────────────────────────────────────────────────────────────────────
let hideStyleEl = null;
let panelStyleEl = null;
let hiding = true;
let panelBuilt = false;

function setHiding(on) {
  hiding = on;
  if (hideStyleEl) hideStyleEl.media = on ? "all" : "not all";
}

function injectStyles() {
  const head = document.head || document.documentElement;

  hideStyleEl = document.createElement("style");
  hideStyleEl.textContent = HIDE_CSS;
  head.appendChild(hideStyleEl);

  panelStyleEl = document.createElement("style");
  panelStyleEl.textContent = PANEL_CSS;
  head.appendChild(panelStyleEl);

  setHiding(true);
}

function buildPanel() {
  if (panelBuilt) return;
  panelBuilt = true;

  const panel = document.createElement("div");
  panel.className = "cbh-panel";

  const title = document.createElement("span");
  title.className = "cbh-title";
  title.textContent = "Answer Hider";
  panel.appendChild(title);

  const toggleWrap = document.createElement("label");
  toggleWrap.className = "cbh-switch";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = true;
  const slider = document.createElement("span");
  slider.className = "cbh-slider";
  toggleWrap.appendChild(checkbox);
  toggleWrap.appendChild(slider);
  panel.appendChild(toggleWrap);

  const status = document.createElement("span");
  status.className = "cbh-status";
  function updateStatus() {
    status.textContent = hiding ? "Hidden" : "Showing";
    status.classList.toggle("cbh-status--showing", !hiding);
  }
  updateStatus();

  checkbox.addEventListener("change", () => {
    setHiding(checkbox.checked);
    updateStatus();
  });
  panel.appendChild(status);

  let collapsed = false;
  const collapseBtn = document.createElement("button");
  collapseBtn.className = "cbh-collapse-btn";
  collapseBtn.textContent = "\u2212";
  collapseBtn.title = "Minimize";
  collapseBtn.addEventListener("click", () => {
    collapsed = !collapsed;
    panel.classList.toggle("cbh-panel--collapsed", collapsed);
    collapseBtn.textContent = collapsed ? "+" : "\u2212";
    collapseBtn.title = collapsed ? "Expand" : "Minimize";
  });
  panel.appendChild(collapseBtn);

  document.body.appendChild(panel);
}

// ── Bootstrap — nothing runs until body exists ───────────────────────────────
function boot() {
  try {
    if (!document.body) {
      // Extremely rare edge case; retry once.
      setTimeout(boot, 200);
      return;
    }
    injectStyles();
    buildPanel();
  } catch (e) {
    console.error("AP Answer Hider:", e);
  }
}

// document_idle guarantees DOM is ready, but be safe.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
