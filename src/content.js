let x, y, w, h, video_divs, inside, divRect, opacity, overlays, overlay, caption_eng_div, fullscreen_divs, scan_interval, failsafe_interval;
let CAPTIONS = false;
let FORCE_FULL = false;
let QUICK_HIDE_UI = false;
let this_url = undefined;
let prev_url = undefined;
let attempts = 0;
let success = false;

const PAD = 10;

// init
window.onload = function() {

	console.log("D Plus Plus started");

	// load forced captions
	chrome.storage.sync.get("captions", function(items) {
		CAPTIONS = items["captions"] || false;
	});

	// load forced fullscreen
	chrome.storage.sync.get("fullscreen", function(items) {
		FORCE_FULL = items["fullscreen"] || false;
	});

	// quick hide UI
	chrome.storage.sync.get("quick_hide", function(items) {
		QUICK_HIDE_UI = items["quick_hide"] || false;
	});

	// call main function every n second
	scan_interval = setInterval(main, 1000);
}

/**
 * Quick hide UI on mouse move
 */
document.addEventListener('mousemove', e => {
	if (QUICK_HIDE_UI) {
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
	if (success) {
		console.log("Preferences already applied, returning");
		return;
	}

	attempts++;

	// no updates to apply
	if (!CAPTIONS && !FORCE_FULL) success = true;

	if (!success) {
		caption_eng_div = document.getElementById("captionTrackPicker-0");
		fullscreen_divs = document.getElementsByClassName("fullscreen-icon");

		// locate and simulate click of English captions
		if (caption_eng_div!==null && CAPTIONS) {
			caption_eng_div.click();
			success = true;
		}

		// isolate fullscreen button from class, simulate press
		if (fullscreen_divs.length>0 && FORCE_FULL) {
			fullscreen_div = fullscreen_divs[0];
			if (fullscreen_div!==null) {
				fullscreen_div.click();
				success = true;
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