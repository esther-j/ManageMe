var bg = chrome.extension.getBackgroundPage();

// update hostname and time in popup html every 500ms
function updatePopup() {
    var $timeDiv = $("#time");
    var $hostnameDiv = $("#hostname");

    if (!bg.activeHostname) {
        setTimeout(updatePopup, 100);
        return;
    }

    $hostnameDiv.html(bg.activeHostname);

    if (bg.activeHostname in bg.timers) {
        // check for blocked site
        if (bg.timers[bg.activeHostname].blocked) {
            $timeDiv.html("Ran out of time");
            $timeDiv.css("font-family", "Roboto");
        // check for off status
        } else if (!bg.timers[bg.activeHostname].status) {
            $timeDiv.html("Timing paused");
            $timeDiv.css("font-family", "Roboto");
        // check for time managed site
        } else {
            $timeDiv.html(formatTime(bg.timers[bg.activeHostname].remaining));
            $timeDiv.css("font-family", "Roboto Mono");
        }
    // unmanaged site
    } else {
        $timeDiv.html("Not timed");
        $timeDiv.css("font-family", "Roboto");
    }
    setTimeout(updatePopup, 200);
}

// formats a given number of seconds into a hh:mm:ss/mm:ss format
function formatTime(seconds) {
    var hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    var minutes = Math.floor(seconds / 60);
    seconds %= 60;

    timeStr = hours ? `${hours}:` : "";
    timeStr += minutes < 10 ? `0${minutes}:` : `${minutes}:`;
    timeStr += seconds < 10 ? `0${seconds}` : `${seconds}`;
    return timeStr;
}

$(document).ready(updatePopup);