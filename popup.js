var bg = chrome.extension.getBackgroundPage();

// update hostname and time in popup html every 500ms
function updatePopup() {
    var timeDiv = document.getElementById('time');
    var hostnameDiv = document.getElementById('hostname');

    if (!(bg.activeHostname)) {
        return;
    }

    hostnameDiv.innerHTML = bg.activeHostname;

    // check for blocked site
    if (bg.blocked.has(bg.activeHostname)) {
        timeDiv.innerHTML = 'Ran out of time';
        timeDiv.style.fontFamily = 'Roboto';
    // check for time managed site
    } else if (bg.time) {
        timeDiv.innerHTML = bg.time;
        timeDiv.style.fontFamily = 'Roboto Mono';
    // unmanaged site
    } else {
        timeDiv.innerHTML = 'Not timed';
        timeDiv.style.fontFamily = 'Roboto';
    }
    setTimeout(updatePopup, 100);
}

function openOptions() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tab) {
        chrome.tabs.update(tab.id, {url: 'options.html'});
    });
}

document.addEventListener('DOMContentLoaded', function(event) { 
    updatePopup();
});

document.getElementById('settings').addEventListener('click', openOptions);
