"use strict";

const CHECK_INTERVAL_MS = 1000;
const PAD = 20;

const DEF_CAPTIONS = true;
const DEF_FULLSCREEN = false;
const DEF_QUICK_HIDE = true;
const DEF_UNMUTE = true;

let x, y, w, h, video_divs, video_div, inside, divRect, opacity, overlays, overlay, caption_eng_div, fullscreen_divs, fullscreen_div, mute_div, mute_divs, scan_interval, failsafe_interval;
let this_url = undefined;
let prev_url = undefined;
let attempts = 0;
let success = false;

let pref_captions = false;
let pref_force_fullscreen = false;
let pref_quick_hide_UI = false;
let pref_unmute = false;

// init
window.onload = function() {

	console.log("D Plus Plus started");

	load_preferences();

	// call main function every x ms
	scan_interval = setInterval(main, CHECK_INTERVAL_MS);
}

/**
 * Quick hide UI on mouse move
 */
document.addEventListener('mousemove', e => {
	if (pref_quick_hide_UI) {
		video_divs = document.getElementsByClassName("btm-media-overlays-container");

		x = e.clientX;
		y = e.clientY;
		w = undefined;
		h = undefined;

		if (video_divs.length>0) {
			video_div = video_divs[0];

			divRect = video_div.getBoundingClientRect();

		  	inside = (x >= divRect.left + PAD && x <= divRect.right - PAD &&
		      y >= divRect.top + PAD && y <= divRect.bottom - PAD);
		}

		overlays = document.getElementsByClassName("overlay__controls");

		opacity = inside ? 1 : 0;
		
		if (overlays.length>0) {
			overlay = overlays[0];

			if (overlay!==null) {
				overlay.style.opacity = opacity;
			}
		}
	}
});

/**
 * Main call to see if user preferences need to be applied
 */
function main() {

	this_url = window.location.href;

	// if url changed
	if (this_url!=prev_url) {

		success = false;
		attempts = 0;
		
		// apply unique preferences
		apply_preferences();

		// call again several seconds later as a fail-safe (e.g. maybe page didn't completely load)
		failsafe_interval = setInterval(apply_preferences, 5000);
	}

	prev_url = this_url;

	return;
}

/**
 * Intermittently called to set user preferences upon page change
 */
function apply_preferences() {

	// all set, no need to try again
	if (success) return;

	attempts++;

	// no updates to apply
	if (!pref_captions && !pref_force_fullscreen && !pref_unmute) success = true;

	if (!success) {

		let media_player_classes = document.getElementsByClassName("btm-media-player");

		if (media_player_classes.length>0) {
			let media_player_class = media_player_classes[0];
			media_player_class.focus();
			console.log("In focus");
		}


		let labels = document.getElementsByTagName("label");

		caption_eng_div = null;

		for(var i = 0; i < labels.length; i++) {
			let association = labels[i].getAttribute("for");
			if (labels[i].textContent.indexOf("English")>-1 && labels[i].textContent.indexOf("CC")>-1) {
				caption_eng_div = document.getElementById(association);
				console.log("Located English CC @ ", association)
				break;
			}
		}

		if (caption_eng_div == null) {
			console.log("Failed to locate English CC");
		}

		fullscreen_divs = document.getElementsByClassName("fullscreen-icon");
		mute_divs = document.getElementsByClassName("mute-btn");

		// locate and simulate click of English captions
		if (caption_eng_div!==null && pref_captions) {
			caption_eng_div.click();
			success = true;
		}

		// isolate fullscreen button from class, simulate press
		if (fullscreen_divs.length>0 && pref_force_fullscreen) {
			fullscreen_div = fullscreen_divs[0];
			if (fullscreen_div!==null) {
				fullscreen_div.click();
				success = true;
			}
		}

		// isolate volume button
		if (pref_unmute) {

			let volume_is_zero = false;

			// get slider value
			let volume_divs = document.getElementsByClassName("slider-container");

			if (volume_divs.length>0 && pref_unmute) {
				let volume_div = volume_divs[0];

				if (volume_div.getAttribute("aria-valuenow") == "0") {
					volume_is_zero = true;
				}
			}

			mute_div = document.querySelector('[aria-label="Volume"]');
			if (mute_div!==null) {
				console.log("Located volume button");
				if (volume_is_zero) {
					console.log("Volume is zero");
					mute_div.click();
				}
			}
		}
	}



	// stop interval calling if successful
	if (success) {
		clearInterval(failsafe_interval);
		console.log("Successfully applied changes after", attempts, "attempts");
	}
	else {
		console.log("Failed to apply changes. Retrying.");
	}

	return;
}

/**
 * Load preferences
 */

function load_preferences() {
	chrome.storage.sync.get("captions", function(items) {
		pref_captions = items["captions"] === undefined ? DEF_CAPTIONS : items["captions"];
		console.log("pref_captions", pref_captions);
	});

	chrome.storage.sync.get("fullscreen", function(items) {
		pref_force_fullscreen = items["fullscreen"] === undefined ? DEF_FULLSCREEN : items["fullscreen"];
		console.log("pref_force_fullscreen", pref_force_fullscreen);
	});

	chrome.storage.sync.get("quick_hide", function(items) {
		pref_quick_hide_UI = items["quick_hide"] === undefined ? DEF_QUICK_HIDE : items["quick_hide"];
		console.log("pref_quick_hide_UI", pref_quick_hide_UI);
	});

	chrome.storage.sync.get("unmute", function(items) {
		pref_unmute = items["unmute"] === undefined ? DEF_UNMUTE : items["unmute"];
		console.log("pref_unmute", pref_unmute);
	});

	// simulate page refresh; apply_preferences main hook re-enabled
	prev_url = undefined;
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "start" ) {
     load_preferences();
 	}
  }
);