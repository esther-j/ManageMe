// Time is stored as seconds
var blocked = {'www.google.com': 10};
var hostname;

function updateTimer() {
    chrome.tabs.query({
        'active': true, 
        'windowId': chrome.windows.WINDOW_ID_CURRENT},
        function(tabs){
            // get current URL and parse out hostname
            var currentUrl = tabs[0].url;
            var hostname = (new URL(currentUrl)).hostname;
            var timeStr;

            // get hostname
            if (hostname in blocked) {
                if (blocked[hostname] == 0) {
                    alert(`Ran out of time at ${hostname}`);
                }
                blocked[hostname]--;
                timeStr = `${blocked[hostname]}`;
            } else {
                timeStr = "";
            }

            // relay to popup
            chrome.extension.onConnect.addListener(function(port) {
                port.onMessage.addListener(function(msg) {
                    port.postMessage({
                        hostname: hostname,
                        time: timeStr
                    });
                });
            })

        }
    );
}

function getActiveUrl() {
    chrome.tabs.query({
        'active': true, 
        'windowId': chrome.windows.WINDOW_ID_CURRENT},
        function(tabs){
            // get current URL and parse out hostname
            var currentUrl = tabs[0].url;
            var hostname = (new URL(currentUrl)).hostname;
            alert(hostname);
            return hostname;
        }
    );
}

document.addEventListener("DOMContentLoaded", function(event) { 
    setInterval(updateTimer, 1000);
});

// listener for when the url changes in active tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        var hostname = (new URL(changeInfo.url)).hostname;
        alert(hostname);
    }
});

// listener for when tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
    getActiveUrl();
});

// listener for when installed
chrome.runtime.onInstalled.addListener((details) => {
    getActiveUrl();
});
