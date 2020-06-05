var timers = {'www.google.com': 10};
var originalTimers = {'www.google.com': 10};
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
    if (activeHostname in timers) {
        if (timers[activeHostname] == 0) {
            alert(`Ran out of time at ${activeHostname}`);
            delete timers[activeHostname];
            blocked.add(activeHostname);
        } else {
            timers[activeHostname]--;
            time = formatTime(timers[activeHostname]);
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

function createMidnightAlarm() {
    var midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    midnight = midnight.getTime();
    chrome.alarms.create({when: midnight});
}

chrome.alarms.onAlarm.addListener(() => {
    alert("alarm");
    timers = originalTimers;
    chrome.alarms.clearAll(() => {
        createMidnightAlarm();
    });
})


// update timer every 1s
document.addEventListener("DOMContentLoaded", function(event) { 
    createMidnightAlarm();
    setInterval(updateTimer, 1000);
});