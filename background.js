var timers = {};
var activeHostname;

// update time
function updateTimer() {
    if (!(activeHostname in timers) || !timers[activeHostname].status) {
		chrome.browserAction.setBadgeText({text: ''}, () => {});
		setTimeout(updateTimer, 1000);
        return;
    }
    if (timers[activeHostname].blocked) {
        chrome.tabs.query({currentWindow: true, active: true}, function (tab) {
			// fix async bug
			if (timers[activeHostname].remaining < 0) {
				timers[activeHostname].remaining = 0;
			} 
			chrome.tabs.update(tab.id, {url: "blocked.html"});
		});
		setTimeout(updateTimer, 1000);
		return;
    }

	let hostnameInfo = timers[activeHostname];
	if (hostnameInfo.remaining == 0) {
		var options = {
			type: "basic",
			title: "ManageMe",
			message: `Ran out of time at ${activeHostname}`,
			iconUrl: "images/icon48.png",
			priority: 2
		};
		chrome.notifications.create("", options, (notificationId) => {});
		hostnameInfo.blocked = true;
	} else {
		hostnameInfo.remaining--;
	}
	chrome.storage.local.set({'timers': JSON.stringify(timers)}, () => {});
	setBadge(hostnameInfo.remaining);
	makeTimeNotification(hostnameInfo.remaining);
	setTimeout(updateTimer, 1000);
}

function setBadge(remainingTime) {
	var badgeText;
	if (remainingTime == 0) {
		badgeText = ''
	} else if ((hrs = Math.floor(remainingTime / 3600)) > 0) {
		badgeText = `${hrs}hr`;
	} else if ((min = Math.floor(remainingTime / 60)) > 60) {
		badgeText = `${min}m`;
	} else {
		badgeText = `${remainingTime}s`;
	}
	chrome.browserAction.setBadgeText({text: badgeText});
}

function makeTimeNotification(remaining) {
	if (remaining != 60 && 
		remaining != 300 &&
		remaining != 600) {
		return;
	}

	var options = {
		type: "basic",
		title: "ManageMe",
		iconUrl: "images/icon48.png",
		priority: 2
	};
	switch (remaining) {
		case 600:
			options.message = `10 minutes remaining on ${activeHostname}`;
			break;
		case 300:
			options.message = `5 minutes remaining on ${activeHostname}`;
			break;
		case 60: 
			options.message = `1 minute remaining on ${activeHostname}`;
			break;
	}
	chrome.notifications.create("", options, (notificationId) => {});
}

function getDomain(url) {
	try { 
		var optionsWindows = chrome.extension.getViews({type: "tab"}).filter(
			function(win) {
				return win.location.href == url && 
					win.location.pathname == "/options.html" && 
					win.location.hash == "#main";
		});

		for (optionsWin of optionsWindows) {
			optionsWin.refreshTimers();
		}
	} catch {
		// ignore case where the options page is not open
	}
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
			chrome.browserAction.setBadgeText({text: ''}, function() {
				updateActiveHostname(hostname);
			});
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
})


// listener for when tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
    getActiveHostname();
});

// listener for when installed
chrome.runtime.onInstalled.addListener((details) => {
	chrome.storage.local.get('timers', function(result) {
		timers = JSON.parse(result.timers);
		chrome.tabs.create({url: 'options.html' });
		getActiveHostname();
	});
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
    resetTimers();
    chrome.alarms.clearAll(() => {
        createMidnightAlarm();
    });
})

function resetTimers() {
	for (let timer of Object.keys(timers)) {
		timers[timer].remaining = timers[timer].limit;
	}
	chrome.storage.local.set({'timers': JSON.stringify(timers)}, () => {});
}

// update timer every 1s
document.addEventListener("DOMContentLoaded", function(event) { 
    createMidnightAlarm();
    setTimeout(updateTimer, 1000);
});
