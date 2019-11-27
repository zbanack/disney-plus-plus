const chk_closed_captions = document.getElementById("closed-captions");
const chk_fullscreen = document.getElementById("fullscreen");
const chk_quick_hide = document.getElementById("quick-hide");
const chk_unmute = document.getElementById("force-unmute");

// load
window.onload = function() {

  // captions
  chrome.storage.sync.get("captions", function(items) {
    chk_closed_captions.checked = items["captions"] === undefined ? false : items["captions"];
  });

  //  fullscreen
  chrome.storage.sync.get("fullscreen", function(items) {
    chk_fullscreen.checked = items["fullscreen"] === undefined ? false : items["fullscreen"];
  });

  // quick hide
  chrome.storage.sync.get("quick_hide", function(items) {
    chk_quick_hide.checked = items["quick_hide"] === undefined ? false : items["quick_hide"];
  });

  // unmute
  chrome.storage.sync.get("unmute", function(items) {
    chk_unmute.checked = items["unmute"] === undefined ? false : items["unmute"];
  });
}

// save
document.getElementById("set").onclick = function() {

  chrome.storage.sync.set({ "captions" : chk_closed_captions.checked });
  chrome.storage.sync.set({ "fullscreen" : chk_fullscreen.checked });
  chrome.storage.sync.set({ "quick_hide" : chk_quick_hide.checked });
  chrome.storage.sync.set({ "unmute" : chk_unmute.checked });

  // window.close();
  popup();
}

// open links
document.addEventListener("DOMContentLoaded", function () {
    const links = document.getElementsByTagName("a");
    for (let i = 0; i < links.length; i++) {
        (function () {
            let ln = links[i];
            let location = ln.href;
            ln.onclick = function () {
                chrome.tabs.create({active: true, url: location});
            };
        })();
    }
});

function popup() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": "start"});
   });
}
