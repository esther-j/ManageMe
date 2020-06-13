var bg = chrome.extension.getBackgroundPage();
var timers = bg.timers;

function activeTimers() {
    location.hash = "main";

    $("#title").html("Timers");

    $("#main").append(
        `<div id="add-timer-container">
            <input type="text" id="hostname-input" name="hostname" placeholder="Website" title="Website link">
            <input type="number" id="time-input" name="time" placeholder="Minutes" title="Time limit">
            <button id="add-button">+ Add timer</button>
        </div>`
    );
    $('#hostname-input, #time-input').keydown(function(event) {
        if (event.key == 'Enter') {
            checkResponse();
        }
    });
    $("#add-button").click(checkResponse);

    if (Object.keys(timers).length == 0) {
        blankSplash();
    } else {
        addExistingTimers();
    }
}

function closeTimers() {
    if ($("#blank").length) {
        $("#blank").remove();
    }
    $("#add-button").remove();
    $("#timer-heading-container").remove();
    $("#add-timer-container").remove();
    $("#timer-container").remove();
}

function activeHelp() {
    location.hash = "help";

    $("#title").html("Help/FAQ");

    $("#main").append(
        `<div id="help-content">
            <div class="help-container">
                <div class="accordion">
                    <div>What is ManageMe?</div>
                    <div class="dropdown-icon">+</div>
                </div>
                <div class="panel">
                    ManageMe is a chrome extension that allows you to time-manage 
                    how much time you spend on websites. Simply add a website and 
                    the number of minutes daily you will spend on the site. The 
                    domain of that site will be blocked for the remainder of the 
                    day once your limit is reached. All timers are automatically 
                    reset at midnight.
                </div>
            </div>
            <div class="help-container">
                <div class="accordion">
                    <div>What should I put in the 'Website' and 'Minutes' text inputs?</div>
                    <div class="dropdown-icon">+</div>
                </div>
                <div class="panel">
                    &#8226; <b>Website</b>: URL (preferably just the domain) of the site
                    you would like to be time-managed (e.g. google.com, wikipedia.org).
                    <br><br>
                    &#8226; <b>Minutes</b>: amount of minutes daily allowed on the site before it
                    is blocked (must be an integer).
                </div>
            </div>
            <div class="help-container">
                <div class="accordion">
                    <div>What happens when a timer reaches its limit?</div>
                    <div class="dropdown-icon">+</div>
                </div>
                <div class="panel">
                    Timers that had a limit greater than 0 minutes are disabled 
                    and no longer deletable once the remaining time is 0. <br>
                    They will be enabled again at midnight when the timers are reset.
                </div>
            </div>
            <div class="help-container">
                <div class="accordion">
                    <div>Why did my website input get shortened?</div>
                    <div class="dropdown-icon">+</div>
                </div>
                <div class="panel">
                    ManageMe only tracks websites by their domain, so website inputs
                    are automatically adjusted to just their domain.
                </div>
            </div>
            <div class="help-container">
                <div class="accordion">
                    <div>Can I block specific websites instead of the entire domain?</div>
                    <div class="dropdown-icon">+</div>
                </div>
                <div class="panel">
                    Unfortunately, that is not a feature as of now.
                </div>
            </div>
            <div class="help-container">
                <div class="accordion">
                    <div>When do the timers reset?</div>
                    <div class="dropdown-icon">+</div>
                </div>
                <div class="panel">
                    The timers reset at midnight (currently not adjustable).
                </div>
            </div>
            <div class="help-container">
                <div class="accordion">
                    <div>How can I block a website entirely?</div>
                    <div class="dropdown-icon">+</div>
                </div>
                <div class="panel">
                    Set the 'Minutes' input to 0.
                    <i>Note: sites blocked in this fashion are pausable and deletable</i>
                </div>
            </div>
        </div>`
    );

    $(".accordion").click(function () {
        $(this).toggleClass("active-faq");
        $(this).next().slideToggle();
        var $icon = $(this).children(".dropdown-icon");
        $icon.html() == "+" ? $icon.html("&#8722;") : $icon.html("+");
    });
}

function closeHelp() {
    $("#help-content").remove();
}

function blankSplash() {
    $("#timer-heading-container, #timer-container").remove();
    $("#main").append(`<div id="blank">You don't have any timers!</div>`);
}

function refreshTimers() {
    closeTimers();
    activeTimers();
}

function checkResponse() {
    var $hostnameInput = $("#hostname-input");
    var $timeInput = $("#time-input");
    var hostname = $hostnameInput.val().trim();
    var time = $timeInput.val().trim();

    if (!hostname || !time) {
        alert("Please fill in all blanks");
        return;
    }

    try {
        time = parseInt(time);
    } catch {
        alert("Please make minutes a valid integer");
        return;
    }

    if (time < 0) {
        alert("Please make minutes a non-negative integer");
        return;
    }

    if (time > 1440) {
        alert("Please make minutes less than or equal to 1440");
        return;
    }

    hostname = getDomain(hostname);
    if (hostname in bg.timers) {
        alert(`'${hostname}' already has a timer`);
        return;
    }

    console.log(`Success ${hostname} ${time}`);
    $hostnameInput.val("");
    $timeInput.val("");
    newTimer(hostname, time);
}

function getDomain(url) {
    var hostname;
    try {
        var urlObj = new URL(url);
        hostname = urlObj.hostname;
    } catch {
        hostname = url;
    }
    var domain = psl.parse(hostname).domain;

    return domain ? domain : hostname;
}

function newTimer(hostname, time) {
    time *= 60;
    timers[hostname] = {
        limit: time,
        remaining: time,
        status: true,
        blocked: false,
    };

    chrome.storage.local.set({ timers: JSON.stringify(timers) }, function () {
        addTimerBlock(createTimerBlock(hostname));
    });
}

function createTimerBlock(hostname) {
    var timerObj = timers[hostname];

    var $timerBlock = $("<div>")
        .attr("id", hostname)
        .addClass("timer-block timer-format");

    var $checkbox = $(`<input type='checkbox'>`)
        .prop("checked", timers[hostname].status)
        .change(() => {
            timers[hostname].status = !timers[hostname].status;
            chrome.storage.local.set({ timers: JSON.stringify(timers) }, () => {});
        });

    $timerBlock.append([
        $(`<div class='left-align'>${hostname}</div>`),
        $(`<div>${formatTime(timerObj.remaining)}</div>`),
        $(`<div>${formatTime(timerObj.limit)}</div>`),
        $(`<div>`).append(
            $(`<label class='switch'>`).append([
                $checkbox,
                $(`<span class='slider round'>`),
            ])
        ),
    ]);

    if (timerObj.remaining == 0 && timerObj.limit > 0) {
        $checkbox.parent().addClass("disabled");
        $checkbox.attr("disabled", true);
    } else {
        $(`<div class='close'>&times;</div>`)
            .click(deleteTimer)
            .appendTo($timerBlock);
    }

    return $timerBlock;
}

function makeTimerContainer() {
    $("#main").append(
        `<div id='timer-heading-container' class='timer-format'>
            <div class='left-align'>Website</div>
            <div>Remaining</div>
            <div>Time Limit</div>
            <div>Off/On</div>
            <div> </div>
        </div>
        <div id='timer-container'></div>`
    );
}

function addTimerBlock(timerBlock) {
    if ($("#blank").length != 0) {
        $("#blank").remove();
        makeTimerContainer();
    }

    $("#timer-container").append(timerBlock);
}

function addExistingTimers() {
    makeTimerContainer();

    for (timer in timers) {
        let timerObj = timers[timer];
        addTimerBlock(
            createTimerBlock(
                timer,
                timerObj.remaining,
                timerObj.limit,
                timerObj.status
            )
        );
    }
    $(".close").click(deleteTimer);
}

function deleteTimer() {
    var $timerBlock = $(this).parent();
    $timerBlock.slideUp(() => {
        $timerBlock.remove();
        const site = $timerBlock.attr("id");
        delete timers[site];
        chrome.storage.local.set({ timers: JSON.stringify(timers) }, () => {});

        if (Object.keys(timers).length == 0) {
            blankSplash();
        }
    });
}

// formats a given number of seconds into a hh:mm:ss/mm:ss format
function formatTime(seconds) {
    var hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    var minutes = Math.floor(seconds / 60);
    seconds %= 60;

    if (!hours && !minutes && !seconds) {
        return 0;
    }
    timeStr = hours ? `${hours}:` : "00:";
    timeStr += minutes < 10 ? `0${minutes}:` : `${minutes}:`;
    timeStr += seconds < 10 ? `0${seconds}` : `${seconds}`;
    return timeStr;
}

$(document).ready(function () {
    $(".nav-block").click(toggleTab);
    activeTimers();
});

function toggleTab() {
    var selected = $(this).attr("id");
    var active = $(".active").attr("id");

    if (selected == active) {
        return;
    }

    $(".active").removeClass("active");
    $(this).addClass("active");

    if (active == "nav-options") {
        closeTimers();
    } else if (active == "nav-help") {
        closeHelp();
    }

    if (selected == "nav-options") {
        activeTimers();
    } else if (selected == "nav-help") {
        activeHelp();
    }
}
