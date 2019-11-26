// load
window.onload = function() {

  // captions
  chrome.storage.sync.get("captions", function(items) {
    if (!chrome.runtime.error)
      document.getElementById("closed-captions").checked = items["captions"];
  });

  //  fullscreen
  chrome.storage.sync.get("fullscreen", function(items) {
    if (!chrome.runtime.error)
      document.getElementById("fullscreen").checked = items["fullscreen"];
  });

  // quick hide
  chrome.storage.sync.get("quick_hide", function(items) {
    if (!chrome.runtime.error)
      document.getElementById("quick-hide").checked = items["quick_hide"];
  });
}

// save
document.getElementById("set").onclick = function() {

  // caption
  const c = document.getElementById("closed-captions").checked;
  chrome.storage.sync.set({ "captions" : c }, function() {});

  // fullscreen
  const f = document.getElementById("fullscreen").checked;
  chrome.storage.sync.set({ "fullscreen" : f }, function() {});

  // quick hide
  const q = document.getElementById("quick-hide").checked;
  chrome.storage.sync.set({ "quick_hide" : q }, function() {});

  window.close();
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