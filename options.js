if (!chrome.extension) {
    var timers = {'www.google.com': {limit: 1000, remaining: 1000, status: true, blocked: false}};
} else {
    var bg = chrome.extension.getBackgroundPage();
    var timers = bg.timers;
}
var modal = document.getElementById("modal");
var addButton = document.getElementById("add-button");
var modalCloseButton = document.getElementById("modal-close");

addButton.addEventListener('click', () => {modal.style.display = "block";});
modalCloseButton.addEventListener('click', () => {modal.style.display = "none";});
document.getElementById('modal-add-button').addEventListener('click', checkResponse);

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

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
    modal.style.display = 'none';
    newTimer(hostname, time);
}

function newTimer(hostname, time) {
    // time *= 60;
    timers[hostname] = {
        limit: time,
        remaining: time,
        status: true,
        blocked: false
    };
    
    addTimerBlock(createTimerBlock(hostname));
}

function createTimerBlock(hostname) {
    var timerObj = timers[hostname];
    var timerBlock = document.createElement("div"); 
    timerBlock.className = "timer-block timer-format";
    timerBlock.id = hostname;

    var timerSite = document.createElement("div");
    timerSite.className = "timer-site left-align";
    timerSite.innerHTML = hostname;

    var timerRemaining = document.createElement("div");
    timerRemaining.innerHTML = formatTime(timerObj.remaining);

    var timerLimit = document.createElement("div");
    timerLimit.innerHTML = formatTime(timerObj.limit);

    var timerStatus = document.createElement("div");
    timerStatus.innerHTML = timerObj.status;

    var timerClose = document.createElement("div");
    timerClose.className = "close delete-timer";
    timerClose.innerHTML = "&times;";
    timerClose.addEventListener('click', deleteTimer);

    timerBlock.appendChild(timerSite);
    timerBlock.appendChild(timerRemaining);
    timerBlock.appendChild(timerLimit);
    timerBlock.appendChild(timerStatus);
    timerBlock.appendChild(timerClose);

    return timerBlock;
}

function addTimerBlock(timerBlock) {
    var timerContainer = document.getElementById("timer-container");
    timerContainer.appendChild(timerBlock);
}

function addExistingTimers() {
    for (timer in timers) {
        let timerObj = timers[timer];
        addTimerBlock(createTimerBlock(timer, timerObj.remaining, timerObj.limit, timerObj.status));
    }
    var deleteTimers = document.getElementsByClassName("delete-timer")
    for (var i = 0; i < deleteTimers.length; i++) {
        deleteTimers[i].addEventListener('click', deleteTimer);
    }
}

function deleteTimer() {
    var timerBlock = this.parentElement;
    var site = timerBlock.id;
    timerBlock.parentElement.removeChild(timerBlock);
    delete timers[site];
}

// formats a given number of seconds into a hh:mm:ss/mm:ss format 
function formatTime(seconds) {
    var hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    var minutes = Math.floor(seconds / 60);
    seconds %= 60;

    if (!hours && !minutes && !seconds) { return 0; }
    timeStr = hours ? `${hours}:` : '00:';
    timeStr += minutes < 10 ? `0${minutes}:` : `${minutes}:`;
    timeStr += seconds < 10 ? `0${seconds}` : `${seconds}`;
    return timeStr;
}

addExistingTimers();