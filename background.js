var timed = {'www.google.com': 3};
var blocked = new Set();
var activeHostname;
var time;

// update time
function updateTimer() {
    if (blocked.has(activeHostname)) {
        chrome.tabs.query({currentWindow: true, active: true}, function (tab) {
            chrome.tabs.update(tab.id, {url: "blocked.html"});
        });
    }

    time = "";
    if (activeHostname in timed) {
        if (timed[activeHostname] == 0) {
            alert(`Ran out of time at ${activeHostname}`);
            delete timed[activeHostname];
            blocked.add(activeHostname);
        } else {
            timed[activeHostname]--;
            time = formatTime(timed[activeHostname]);
        }
    }
}

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

// query and retrieve current hostname of active tab 
function getActiveHostname() {
    chrome.tabs.query({
        'active': true, 
        'windowId': chrome.windows.WINDOW_ID_CURRENT},
        function(tabs){
            // get current URL and parse out hostname
            var currentUrl = tabs[0].url;
            var hostname = (new URL(currentUrl)).hostname;
            updateActiveHostname(hostname);
        }
    );
}

// update timer every 1s
document.addEventListener("DOMContentLoaded", function(event) { 
    setInterval(updateTimer, 1000);
});

function updateActiveHostname(hostname) {
    activeHostname = hostname;
}

// listener for when the url changes in active tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        var hostname = (new URL(changeInfo.url)).hostname;
        updateActiveHostname(hostname);
    }
});

// listener for when tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
    getActiveHostname();
});

// listener for when installed
chrome.runtime.onInstalled.addListener((details) => {
    getActiveHostname();
});