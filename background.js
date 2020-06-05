// Time is stored as seconds
var blocked = {'www.google.com': 10};

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

document.addEventListener("DOMContentLoaded", function(event) { 
    setInterval(updateTimer, 1000);
});

