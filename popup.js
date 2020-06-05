var currentHostname;

function updatePopup() {
    var port = chrome.extension.connect({

    });
    port.postMessage("Hi BackGround");
    port.onMessage.addListener((msg) => {
        if (msg.hostname != currentHostname) {
            document.getElementById("hostname").innerHTML = msg.hostname;
            currentHostname = msg.hostname;
        }
        var post = document.getElementById("here");
        post.innerHTML = msg.time;
        console.log("message recieved" + msg);
    });
    setTimeout(updatePopup, 1000);
}

document.addEventListener("DOMContentLoaded", function(event) { 
    updatePopup();

});
