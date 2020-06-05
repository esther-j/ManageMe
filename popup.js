var background = chrome.extension.getBackgroundPage();

// update hostname and time in popup html every 500ms
function updatePopup() {
    if (background.time) {
        document.getElementById("time").innerHTML = background.time;
    }
    if (background.activeHostname) {
        document.getElementById("hostname").innerHTML = background.activeHostname;
    }
    setTimeout(updatePopup, 500);
}

document.addEventListener("DOMContentLoaded", function(event) { 
    updatePopup();
});