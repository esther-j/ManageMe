var bg = chrome.extension.getBackgroundPage();
var timers = bg.timers;

function activeOptions() {
    location.hash = 'main';

    $('#title').html('Timers');

    $(`<button id='new-timer-button'>+ Add timer</button>`)
        .appendTo('#title-container')
        .click(() => { $('#modal').css('display', 'block'); });

    $('#main').append(
        `<div id='timer-heading-container' class='timer-format'>
            <div class='left-align'>Website</div>
            <div>Remaining</div>
            <div>Time Limit</div>
            <div>Off/On</div>
            <div> </div>
        </div>
        <div id='timer-container'></div>`
    );
    
    if (Object.keys(timers).length == 0) {
        blankSplash();
    } else {
        addExistingTimers();
    }
}

function blankSplash() {
    $('#timer-container').append(
        `<div id="blank">You don't have any timers!</div>`
    );
}

function closeOptions() {
    $('#new-timer-button').remove();
    $('#timer-heading-container').remove();
    $('#timer-container').remove();
}

function activeAbout() {
    location.hash = 'about';

    $('#title').html('About');
}

$(window).click(function(event) {
    if ($(event.target).is('#modal')) {
      $('#modal').css('display', 'none');
    }
});

function checkResponse() {
    var $hostnameInput = $('#hostname-input');
    var $timeInput = $('#time-input');
    var hostname = $hostnameInput.val().trim();
    var time = $timeInput.val().trim();

    if (!hostname || !time) {
        alert('Please fill in all blanks');
        return;
    }

    try {
        time = parseInt(time);
    } catch {
        alert('Please make minutes a valid integer');
        return;
    }

    if (time < 0) {
        alert('Please make minutes a non-negative integer');
        return;
    }

    if (time > 1440) {
        alert('Please make minutes less than or equal to 1440');
        return;
    }

    hostname = getDomain(hostname);
    if (hostname in bg.timers) {
        alert(`'${hostname}' already has a timer`);
        return;
    }

    console.log(`Success ${hostname} ${time}`);
    $hostnameInput.val('');
    $timeInput.val('');
    $('#modal').css('display', 'none');
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

    var $timerBlock = $('<div>')
        .attr('id', hostname)
        .addClass('timer-block timer-format');
    
    var $checkbox = $(`<input type='checkbox'>`)
        .prop('checked', timers[hostname].status)
        .change(() => { timers[hostname].status = !timers[hostname].status; });

    $timerBlock.append([
        $(`<div class='left-align'>${hostname}</div>`),
        $(`<div>${formatTime(timerObj.remaining)}</div>`),
        $(`<div>${formatTime(timerObj.limit)}</div>`),
        $(`<div>`).append(
            $(`<label class='switch'>`).append([
                $checkbox,
                $(`<span class='slider round'>`)
            ])
        )
    ]);

    $(`<div class='close delete-timer'>&times;</div>`)
        .click(deleteTimer)
        .appendTo($timerBlock);

    return $timerBlock;
}

function addTimerBlock(timerBlock) {
    if ($('#blank').length != 0) {
        $('#blank').remove();
    }
    $('#timer-container').append(timerBlock);
}

function addExistingTimers() {
    for (timer in timers) {
        let timerObj = timers[timer];
        addTimerBlock(createTimerBlock(timer, timerObj.remaining, timerObj.limit, timerObj.status));
    }
    $('.delete-timer').click(deleteTimer);
}

function deleteTimer() {
    var $timerBlock = $(this).parent();
    $timerBlock.slideUp(() => {
        $timerBlock.remove();
        delete timers[$timerBlock.attr('id')];

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

    if (!hours && !minutes && !seconds) { return 0; }
    timeStr = hours ? `${hours}:` : '00:';
    timeStr += minutes < 10 ? `0${minutes}:` : `${minutes}:`;
    timeStr += seconds < 10 ? `0${seconds}` : `${seconds}`;
    return timeStr;
}

$(document).ready(function() {
    $('#modal-close').click(() => { $('#modal').css('display', 'none'); });
    $('#modal-add-button').click(checkResponse);
    $('.nav-block').click(toggleTab)
    activeOptions();
});

function toggleTab() {
    var selected = $(this).attr('id');
    var active = $('.active').attr('id');

    if (selected == active) {
        return;
    }

    $('.active').removeClass('active')
    $(this).addClass('active');

    if (active == 'nav-options') {
        closeOptions();
    }

    if (selected == 'nav-options') {
        activeOptions();
    } else if (selected == 'nav-about') {
        activeAbout();
    }
}
