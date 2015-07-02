var $ = function(x) { return document.getElementById(x) };

// Send a command to the content.
function sendCommand(cmd, broadcast, fn) {
    var qry = broadcast ? {} : {active: true, currentWindow: true}; 
    chrome.tabs.query(qry, function(tabs) {
        tabs.forEach(function(tab) {
            chrome.tabs.sendMessage(tab.id, {command: cmd}, fn || function(r) {});
        });
    });
}

// Update buttons state.
var updateState = function(state) {
    $("modKey0").className = (state.modKey == 0) ? "in" : "";
    $("modKey1").className = (state.modKey == 1) ? "in" : "";
    $("mCopy").className = state.canCopy ? "" : "disabled";
    $("mFind").className = state.hasTables ? "" : "disabled";
}

// Init the popup.
var init = function(state) {

    document.addEventListener("click", function(e) {
        
        var cmd = e.target.getAttribute("data-command");
        if(!cmd)
            return;

        sendCommand("updateOptions", true);

        sendCommand(cmd, false, function(state) {
            updateState(state);
            if(e.target.getAttribute("data-noclose") !== "1")
                window.close();
        });
    
    });

    if(navigator.userAgent.indexOf("Macintosh") > 0) {
        $("modKey0").innerHTML = "&#8997;";
        $("modKey1").innerHTML = "&#8984;";
    }

    updateState(state);
}

window.onload = function() {
    sendCommand("openPopup", false, init);
};
