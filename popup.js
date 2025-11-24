//* config settins
// ? maby use local storage for settings as json files cannot be changed in runtime
// document.addEventListener('DOMContentLoaded', ()=> {
//     const url = (typeof chrome !== 'undefined' && chrome.runtime?.getURL)
//     ? chrome.runtime.getURL('config.json')
//     : 'config.json';

//   return fetch(url, { cache: 'no-cache' })
//     .then(r => r.json())
//     .then(cfg => Number(cfg?.settings?.popup_size) || 16)
//     .then(size => {
//     document.documentElement.style.fontSize = `${size}px`})
// });

// ! no longer used
// document.addEventListener('DOMContentLoaded', () => {
//   const root = document.documentElement;

//   if (typeof chrome !== 'undefined' && chrome.storage?.local) {
//     chrome.storage.local.get({ popup_size: null }, ({ popup_size }) => {
//       const size = Number.isFinite(popup_size) ? popup_size : 16;
//       root.style.fontSize = `${size}px`;
//     });
//   } else {
//     // If not running as an extension, just use the default
//     root.style.fontSize = '16px';
//   }
// });

function computeSiteScore(results) {
  if (!results.length) return 0;

  const total = results.length;
  const violations = results.filter(r => !r.passed).length;

  return Math.round((violations / total) * 100);
}

function updateScoreCircle(score) {
  const circle = document.querySelector('.score_container circle:nth-of-type(2)');
  const text = document.querySelector('.score_container text');

  const max = 477;
  const offset = max - (score / 100) * max;

  circle.style.strokeDashoffset = `${offset}px`;
  text.textContent = score;

  if (score >= 67) {
    circle.style.stroke = "#e74c3c"; // red
    text.style.fill = "#e74c3c";
  } else if (score >= 34) {
    circle.style.stroke = "#f1c40f"; // yellow
    text.style.fill = "#f1c40f";
  } else {
    circle.style.stroke = "#27ae60"; // green
    text.style.fill = "#27ae60";
  }
}

chrome.storage.local.get(["latestResults"], ({ latestResults }) => {
  if (latestResults) {
    const score = computeSiteScore(latestResults);
    updateScoreCircle(score);
  }
});

// on of func
document.getElementById("on_off").addEventListener("click", () => {

  document.querySelector("main").classList.toggle("hidden");
  document.getElementById("section2").classList.toggle("hidden");


  document.querySelector("header").classList.toggle("gray");
  document.querySelector(".spacer_1").classList.toggle("gray");
  document.querySelectorAll(".transition").forEach(el => el.classList.toggle("gray"));


  document.querySelector("#on_off button").classList.toggle("active");
});

// settigns open site
document.getElementById("settings_icon").addEventListener("click", () => {
  document.querySelector("main").classList.toggle("hidden");
  document.querySelector("header svg").classList.toggle("active");
  document.getElementById("section3").classList.toggle("hidden");

});
// settings back menu
document.getElementById("exit_settings").addEventListener("click", () => {
  document.querySelector("main").classList.toggle("hidden");
  document.querySelector("header svg").classList.toggle("active");
  document.getElementById("section3").classList.toggle("hidden");

});

document.getElementById('exit_settings').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    document.querySelector("main").classList.toggle("hidden");
    document.querySelector("header svg").classList.toggle("active");
    document.getElementById("section3").classList.toggle("hidden");
  }
});

// settigns open site for keyboard
document.getElementById('settings_icon').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    document.querySelector("main").classList.toggle("hidden");
    document.querySelector("header svg").classList.toggle("active");
    document.getElementById("section3").classList.toggle("hidden");
  }
});

// Settings functionality
function saveSettings(settings) {
  chrome.storage.sync.set({ settings }, () => {
    console.log('Settings saved:', settings);
  });
}

function loadSettings() {
  chrome.storage.sync.get(['settings'], (result) => {
    const settings = result.settings || {
      deactivated: false,
      autoPopup: true,
      autoReport: false
    };

    // Update toggle states
    document.getElementById("whitelist_button").classList.toggle("active", settings.deactivated);
    document.getElementById("automatic_popup_button").classList.toggle("active", settings.autoPopup);
    document.getElementById("report_button").classList.toggle("active", settings.autoReport);
  });
}

// Load settings when popup opens
document.addEventListener('DOMContentLoaded', loadSettings);

// Deactivate for this site
document.getElementById("whitelist_button").addEventListener("click", async () => {
  const button = document.querySelector("#whitelist_button");
  button.classList.toggle("active");

  // Get current tab URL
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const hostname = new URL(tab.url).hostname;

  chrome.storage.sync.get(['deactivatedSites'], (result) => {
    let deactivatedSites = result.deactivatedSites || [];
    if (button.classList.contains("active")) {
      if (!deactivatedSites.includes(hostname)) {
        deactivatedSites.push(hostname);
      }
    } else {
      deactivatedSites = deactivatedSites.filter(site => site !== hostname);
    }
    chrome.storage.sync.set({ deactivatedSites });
  });
});

// Automatic popup settings
document.getElementById("automatic_popup_button").addEventListener("click", () => {
  const button = document.querySelector("#automatic_popup_button");
  button.classList.toggle("active");

  chrome.storage.sync.get(['settings'], (result) => {
    const settings = result.settings || {};
    settings.autoPopup = button.classList.contains("active");
    saveSettings(settings);
  });
});

// Automatic report settings
document.getElementById("report_button").addEventListener("click", () => {
  const button = document.querySelector("#report_button");
  button.classList.toggle("active");

  chrome.storage.sync.get(['settings'], (result) => {
    const settings = result.settings || {};
    settings.autoReport = button.classList.contains("active");
    saveSettings(settings);
  });
});

// open new page for read more page
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.text_underscore').forEach((el) => {
    el.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {

        // Build URL (extension-safe if available)
        const url = (typeof chrome !== 'undefined' && chrome.runtime?.getURL)
          ? chrome.runtime.getURL('readmore/readmore.html')
          : './readmore/readmore.html';

        // Open in a new tab
        if (typeof chrome !== 'undefined' && chrome.tabs?.create) {
          chrome.tabs.create({ url });        // extension context
        } else {
          window.open(url, '_blank', 'noopener,noreferrer'); // web page
        }
      }
    });
  });
});

// Open new page for read more with keyboard
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.text_underscore').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();

      // Build URL (extension-safe if available)
      const url = (typeof chrome !== 'undefined' && chrome.runtime?.getURL)
        ? chrome.runtime.getURL('readmore/readmore.html')
        : './readmore/readmore.html';

      // Open in a new tab
      if (typeof chrome !== 'undefined' && chrome.tabs?.create) {
        chrome.tabs.create({ url });        // extension context
      } else {
        window.open(url, '_blank', 'noopener,noreferrer'); // web page
      }
    });
  });
});


// resize popup script
const root = document.documentElement;
const dragEl = document.querySelector('.resize_container');

const PX_PER_FONT_PX = 20;
const MIN_F = 16;
const MAX_F = 30;
const DEADZONE = 1;

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const getPx = () => parseFloat(getComputedStyle(root).fontSize) || 16;
const applyAndSave = (px) => {
  const next = clamp(Math.round(px), MIN_F, MAX_F);
  root.style.fontSize = `${next}px`;
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    chrome.storage.local.set({ popup_size: next });
  }
};

// --- Apply saved size on load ---
document.addEventListener('DOMContentLoaded', () => {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    chrome.storage.local.get({ popup_size: null }, ({ popup_size }) => {
      const size = Number.isFinite(popup_size) ? clamp(popup_size, MIN_F, MAX_F) : 16;
      root.style.fontSize = `${size}px`;
    });
  } else {
    root.style.fontSize = '16px';
  }
});

// --- Keyboard: Ctrl/Cmd + and Ctrl/Cmd - ---
document.addEventListener('keydown', (e) => {
  if (!(e.ctrlKey || e.metaKey)) return;

  // Normalize which key pressed
  const incKey = e.key === '+' || e.key === '=' || e.code === 'NumpadAdd';
  const decKey = e.key === '-' || e.key === '_' || e.code === 'NumpadSubtract';

  if (!incKey && !decKey) return;

  e.preventDefault(); // stop browser zoom in the extension UI

  const step = 1; // px per keypress
  const current = getPx();
  applyAndSave(current + (incKey ? step : -step));
});

// --- Drag-to-resize (your existing logic) ---
let dragging = false;
let startX = 0, startY = 0, startFontPx = 16;
let raf = null;

if (dragEl) {
  dragEl.style.cursor = 'ne-resize';

  dragEl.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();

    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startFontPx = getPx();

    document.body.style.userSelect = 'none';

    const onMove = (ev) => {
      if (!dragging) return;

      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      if (Math.hypot(dx, dy) < DEADZONE) return;

      // Allowed shrink (up, up-right) vs grow (down, down-left)
      const projUp = Math.max(0, -dy);
      const projUpRight = Math.max(0, (dx - dy) / Math.SQRT2);
      const projDown = Math.max(0, dy);
      const projDownLeft = Math.max(0, (-dx + dy) / Math.SQRT2);

      const shrinkMag = Math.max(projUp, projUpRight);
      const growMag = Math.max(projDown, projDownLeft);
      const net = growMag - shrinkMag;

      const proposed = startFontPx + (net / PX_PER_FONT_PX);
      const next = clamp(proposed, MIN_F, MAX_F);

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        root.style.fontSize = `${next}px`;
      });
    };

    const onUp = () => {
      dragging = false;
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);

      // persist final size
      applyAndSave(getPx());
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  });
} else {
  console.warn('Resize handle ".resize_container" not found.');
}

