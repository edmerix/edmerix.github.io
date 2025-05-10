let pres; // allow for user interaction within console while "live" by setting scope here

// once the DOM has loaded fully, start the boot process for the Presentation object:
document.addEventListener("DOMContentLoaded", function(){
	boot();
});

const boot = function(){
    // make a new Presentation object, using the user supplied settings (in settings.js):
	pres = new Presentation(document.getElementById(container), width, height);

	// loop through the slides that the user listed in settings.js, and add them in turn:
	// (Note that the position here just defaults to "s", i.e., the order they came in,
	// but the order can be adjusted however you wish)
	for(let s = 0; s < slides.length; s++){
		pres.addSlide(slides[s], s);
	}

	// update the Presentation's automatic advancer to the value supplied in settings.js:
	pres.interval_seconds = autoSpeed;

	/*
    N.B. The addSlide() method above is asynchronous, so you may want to move this
	call to run the startup into the callback of the last addSlide to ensure it's
	fully loaded if running remotely or loading large files.
	*/
	pres.startup();

};
