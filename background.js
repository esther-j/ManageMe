var timers = {};
var activeHostname;

// update time
function updateTimer() {
    if (!(activeHostname in timers)) {
        return;
    }
    if (timers[activeHostname].blocked) {
        chrome.tabs.query({currentWindow: true, active: true}, function (tab) {
            chrome.tabs.update(tab.id, {url: "blocked.html"});
        });
    }

    if (timers[activeHostname].status) {
        let hostnameInfo = timers[activeHostname];
        if (hostnameInfo.remaining == 0 && !hostnameInfo.blocked) {
            alert(`Ran out of time at ${activeHostname}`);
            hostnameInfo.blocked = true;
        } else {
            hostnameInfo.remaining--;
        }
    }
}

function getDomain(url) {
	var urlObj = new URL(url);
	var hostname = urlObj.hostname;
	var domain = psl.parse(hostname).domain;

	return domain ? domain : hostname;
}

// query and retrieve current hostname of active tab 
function getActiveHostname() {
    chrome.tabs.query({
        'active': true, 
        'windowId': chrome.windows.WINDOW_ID_CURRENT},
        function(tabs){
            // get current URL and parse out hostname
            var currentUrl = tabs[0].url;
            var hostname = getDomain(currentUrl);
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
        var hostname = getDomain(changeInfo.url);
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

// makes an alarm for midnight
function createMidnightAlarm() {
    var midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    midnight = midnight.getTime();
    chrome.alarms.create({when: midnight});
}

// listens for alarm and resets it for next midnight
chrome.alarms.onAlarm.addListener(() => {
    alert("alarm");
    resetTimers();
    chrome.alarms.clearAll(() => {
        createMidnightAlarm();
    });
})

function resetTimers() {
	for (let timer of Object.keys(timers)) {
		timers[timer].remaining = timers[timer].limit;
	}
}

// update timer every 1s
document.addEventListener("DOMContentLoaded", function(event) { 
    createMidnightAlarm();
    setInterval(updateTimer, 1000);
});