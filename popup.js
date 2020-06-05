var bg = chrome.extension.getBackgroundPage();

function hideElement(element) {
    element.innerHTML = '';
    element.style.display = 'none';
}

function showElement(element, text) {
    element.innerHTML = text;
    element.style.display = 'inline-block';
}

// update hostname and time in popup html every 500ms
function updatePopup() {
    var timeDiv = document.getElementById("time");
    var hostnameDiv = document.getElementById("hostname");

    if (!(bg.activeHostname)) {
        return;
    }

    // check for blocked site
    if (bg.blocked.has(bg.activeHostname)) {
        hostnameDiv.innerHTML = `'${bg.activeHostname}' is blocked`;
        hideElement(timeDiv);
    // check for time managed site
    } else if (bg.time) {
        hostnameDiv.innerHTML = `Time left on '${bg.activeHostname}'`;
        showElement(timeDiv, bg.time);
    // non-regulated site
    } else {
        hostnameDiv.innerHTML = `'${bg.activeHostname}' is not time-managed`;
        hideElement(timeDiv);
    }

    setTimeout(updatePopup, 100);
}

document.addEventListener("DOMContentLoaded", function(event) { 
    updatePopup();
});