var bg = chrome.extension.getBackgroundPage();

// update hostname and time in popup html every 500ms
function updatePopup() {
    var timeDiv = document.getElementById('time');
    var hostnameDiv = document.getElementById('hostname');

    if (!(bg.activeHostname)) {
        setTimeout(updatePopup, 100);
        return;
    }
    
    hostnameDiv.innerHTML = bg.activeHostname;

    if (bg.activeHostname in bg.timers) {
        // check for blocked site
        if (bg.timers[bg.activeHostname].blocked) {
            timeDiv.innerHTML = 'Ran out of time';
            timeDiv.style.fontFamily = 'Roboto';
        // check for time managed site
        } else {
            timeDiv.innerHTML = formatTime(bg.timers[bg.activeHostname].remaining);
            timeDiv.style.fontFamily = 'Roboto Mono';
        }
    // unmanaged site
    } else {
        timeDiv.innerHTML = 'Not timed';
        timeDiv.style.fontFamily = 'Roboto';
    }
    setTimeout(updatePopup, 100);
}

// function openOptions() {
//     chrome.tabs.query({currentWindow: true, active: true}, function (tab) {
//         chrome.tabs.update(tab.id, {url: 'options.html'});
//     });
// }

document.addEventListener('DOMContentLoaded', function(event) { 
    updatePopup();
});

// document.getElementById('settings').addEventListener('click', openOptions);

// formats a given number of seconds into a hh:mm:ss/mm:ss format 
function formatTime(seconds) {
    var hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    var minutes = Math.floor(seconds / 60);
    seconds %= 60;
    
    timeStr = hours ? `${hours}:` : '';
    timeStr += minutes < 10 ? `0${minutes}:` : `${minutes}:`;
    timeStr += seconds < 10 ? `0${seconds}` : `${seconds}`;
    return timeStr;
}