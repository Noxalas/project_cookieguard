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




