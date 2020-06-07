var bg = chrome.extension.getBackgroundPage();

document.getElementById('add-btn').addEventListener('click', checkResponse);

function checkResponse() {
    var hostnameElement = document.getElementById('hostname-input');
    var timeElement = document.getElementById('time-input');
    var hostname = hostnameElement.value.trim();
    var time = timeElement.value.trim();

    if (!hostname || !time) {
        alert('Please fill in all blanks');
        return;
    }

    if (!(time = parseInt(time)) || time < 0) {
        alert('Please make minutes a valid integer');
        return;
    }

    if (time == 0) {
        alert('Please make minutes a non-zero integer');
        return;
    }

    if (time > 1440) {
        alert('Please make minutes less than or equal to 1440');
        return;
    }

    console.log(`Success ${hostname} ${time}`);
    hostnameElement.value = '';
    timeElement.value = '';
    addTimer(hostname, time);
}

function addTimer(hostname, time) {
    time *= 60;
    bg.timers[hostname] = time;
    bg.originalTimers[hostname] = time;
    console.log('timers' + JSON.stringify(bg.timers));
    console.log('original timers' + JSON.stringify(bg.originalTimers));
}