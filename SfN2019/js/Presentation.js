class Presentation {
    // Presentation class.
    // The core object that contains all the handles and methods for the presentation
    // Usage:
    //      let pres = new Presentation(element, width, height);
    // where element is a handle to the element in your HTML where the presentation should be
    // inserted, and width and height are (optional) numbers in pixels for the preferred
    // dimension of the presentation. If none is given they default to 1920 and 1080.
    // Note that the Presentation class automatically scales the presentation to the window
    // size when live, but can be overridden to display at the original dimensions given in
    // width and height (see below keyboard shortcuts).
    //
    // Keyboard shortcuts:
    //      Arrow keys:     Advance (right, down) or go back (left, up) a slide
    //      Space:          Advance the slide
    //      Number keys:    Go to that slide number
    //      "a":            Activate "auto-play", which advances slide after a specified
    //                      number of seconds (default: 60). To change the number of
    //                      seconds between slides change pres.intervalSeconds
    //      "e":            Toggle between the main slide and its "extra" information
    //      "z":            Toggle whether the presentation is zoomed/scaled to the
    //                      current screen or displayed at original size
    //      Esc:            Stop "auto-play" feature if currently active. Presentation
    //                      highlights if auto-play is on, and the number of seconds
    //                      remaining, in red above the slide menu on the right.
    //
    // Presentations loop, so if you advance past the last slide it will go back to the
    // start automatically.
    //
    // Slides can also be selected by clicking on their menu item on the right (when using
    // the default styling).
    //
    // No edits to this code are necessary to make changes or get started--all settings are
    // contained in the "settings.js" file, and "functions.js" will automatically boot the
    // Presentation based on those settings.
    //
    // NOTE: this is designed to be run locally by someone designing their own presentation,
    //       and so it does not by default do any checking of the content at the endpoints
    //       given in the manifest of each slide (the HTML, CSS or JS). If planning to use
    //       this in a third-party user setting, add the appropriate checks to ensure user-
    //       uploaded files meet necessary criteria.

	constructor(frame, width, height){
		this.frame = frame;             // a handle to the element on the page where the presentation is inserted
		this.width = width;             // the requested width of the presentation in pixels
		this.height = height;           // the requested height of the presentation in pixels

		this.menu = document.createElement("menu");     // create the menu element and store a handle to it
		this.menuHead = document.createElement("div");  // create the title section for the menu
		this.menuHead.setAttribute("id","outlineHead"); // mark it as such
		this.menuHead.innerHTML = "Poster outline";     // label it with the default heading

		this.menu.appendChild(this.menuHead);   // actually add the above title section to the menu
		this.frame.appendChild(this.menu);      // actually add the menu to the presentation window

		this.slides = {};               // the object that holds the actual slides after they're loaded
		this.slideOrder = [];           // keeps track of what order the slides should be in

		this.activeSlide = null;        // identifies which slide is currently active once started
		this.maxSlide = 0;              // keeps track of how many slides are added to the presentation
		this.isRealSize = false;        // a flag for whether or not the presentation is scaled
		this.isAutoPlaying = false;     // a flag for whether or not autoplay is active
		this.autoHandle = null;         // a handle to a setInterval object to simplify starting and stopping autoplay
		this.countdownHandle = null;    // a handle to a setInterval object that runs the countdown on the menu
		this.intervalSeconds = 60;      // the number of seconds between slide advances when autoplay is active
		this.countdown = 60;            // the "live" version of the above, which keeps track of how long left

        this.extraOffset = Math.max(2000, this.width + 100); // ensure the extra panel is always off to the side
	}

	startup(){
	    // startup function: initiate the automatic functions and responses for specific user keypresses.
		// ensure the content gets auto-resized whenever the window size changes:
		window.addEventListener("resize", () => {
			this.resize();
		});
		// check for specific keypresses:
		document.addEventListener("keydown", (e) => {
            switch(e.key){
                // Standard input keys, used for changing slide or stopping auto-play
                case 'ArrowLeft': // go back a slide on left or up arrow keys
                case 'ArrowUp':
                    e.preventDefault();
                    this.previous();
                    break;
                case 'ArrowRight': // go forward a slide on right or down arrow keys or spacebar
                case 'ArrowDown':
                case ' ':
                    e.preventDefault();
                    this.advance();
                    break;
                case 'Escape': // stop auto-play on press of esc key
                    if (this.isAutoPlaying) {
                        this.stop();
                    }
                    e.preventDefault();
                    break;
                // letter hotkeys:
                case 'a': // start the auto-play function
                case 'A':
                    if (!this.isAutoPlaying) {
                        this.autoplay(this.intervalSeconds * 1000); // change every this.intervalSeconds seconds
                    }
                    break;
                case 'e': // toggle between main and extra screen
                case 'E':
                    this.toggleExtra();
                    break;
                case 'z': // toggle between full zoom and scaled display for screen size
                case 'Z':
                    if (!this.isRealSize) {
                        this.realSize();
                    } else {
                        this.isRealSize = false;
                        this.resize();
                    }
                    break;
                default:
                    // check if the input was a number, and if so, go to that slide, otherwise do nothing
                    const isNumber = /^[0-9]$/i.test(e.key);
                    if (isNumber){
                        const slideNum = parseInt(e.key)-1;
                        if(slideNum >= 0 && slideNum < this.slideOrder.length){
        					this.activate(this.slideOrder[slideNum]);
        				}
                    }
            }
		});
		// run resize to ensure correct scaling at startup:
		this.resize();
	}

	async addSlide(path, position = this.slideOrder.length){
		// fetch the manifest file for the slide at the given path, and follow its recipe
		console.log(`Loading slide at ${path}`);

		// grab the JSON data at the remote path, parse it, and create the metadata for the slide:
        const response = await this.xhrPromise(`${path}/manifest.json`,'GET','JSON');
        const data = JSON.parse(response);
        let name = data.name;                   // get the slide's identifying name to create its object under
        if (name === "" || name === undefined) {// if there was no name in the manifest or it was left blank:
            name = `slide${position}`;          // then try and create one for the user based on the slide position
        }
       	this.slides[name] = {};                 // instantiate an empty object in the slide array, under this one's name
		this.slides[name].name = name;          // name === name === name.  Delightful redundancy, but good for sanity checks
		this.slides[name].position = position;  // when this slide should occur (slide index, defaults to appending to the end)
		this.slides[name].loadCount = 0;        // flag for when different parts of the slide have been built and will be ready to display
		this.slides[name].isReady = false;      // automatically trips to mark ready once loadCount is sufficient.

		// create the physical slide in a new article tag:
		const article = document.createElement("article");
		article.classList.add("page"); // add the 'page' class so the default css knows what to do with it
		this.slides[name].article = article; // add a handle to the physical element to the internal structure
		this.frame.appendChild(article); // add it to the actual page

		// create the menu item object:
		const menuItem = document.createElement("section");
		menuItem.classList.add("menu");         // add the 'menu' class so the default css knows what to do with it
		menuItem.slide = article;               // add the handle to the newly create article object above to the new menu item
        let menuHTML = `<b>${data.title}</b>`;// build the menu item's content, starting with the slide title
        if (data.thumbnail !== '')              // and if there's a thumbnail in the manifest, add that below:
            menuHTML += `<br /><img class="right" src="${data.thumbnail}" />`;
        menuItem.innerHTML = menuHTML;          // add the content to the actual menu item on the page
        // create the response so this slide gets activated when the menu item is clicked:
		menuItem.addEventListener("click", () => {
			this.activate(name);
		});
		// add a handle to this menu item to the actual slide metadata:
		this.slides[name].menuItem = menuItem;
		// note that the actual menuItem doesn't get added to the page until the content has been loaded (in loadContent();)

		// now go through and load the relevant content as listed in the manifest file.
		// these are all asynchronous, so each increments the .isReady variable and the
		// last one to do so will trigger the .isReady to true:
		// (Note that, by default, "extra" content needn't finish loading for the slide to
		// be marked ready for use, since it's deemed supplemental.)
		this.loadCSS(`${path}/${data.styles}`, this.slides[name]);
		this.loadContent(`${path}/${data.main}`, this.slides[name]);
		this.loadExtra(`${path}/${data.extra}`, this.slides[name]);
	}

	async loadCSS(src, slide){
	    // fetch the CSS file at the given src, and notify the relevant slide when done
		console.log(`${slide.name} -> loading CSS`);
        const response = await this.xhrPromise(src);
        const style = document.createElement("style");  // create the style element
		style.innerHTML = response;                     // add the contents of the css file to the new element (see note at top)
		document.getElementsByTagName('head')[0].appendChild(style); // add the new style element to the head of the page
		if(++slide.loadCount >= 2){                     // increment the loadCount variable and if its new value reaches 2
			slide.isReady = true;                       // (both css and content loaded) mark the slide as ready
		}
	}

	async loadContent(src, slide){
	    // fetch the actual slide content from the given src, and notify the relevant slide when done
		console.log(`${slide.name} -> loading HTML`);
        const response = await this.xhrPromise(src,'GET','DOCUMENT');
        slide.article.innerHTML = response;             // add the content to the actual slide's article element (see note at top)
		this.slideOrder.splice(slide.position, 0, slide.name); // find the correct position for this slide, and reorder accordingly
		this.menu.appendChild(slide.menuItem);          // now the slide has content, add its button to the menu
		//TODO: MAJOR: on the above, need to insert the menu item at the right index based on slideOrder!
		this.maxSlide = this.slideOrder.length - 1;     // update the total number of slides
		//TODO: or this.maxSlide++, or perhaps best, get the number of fields in this.slides object

		if(++slide.loadCount >= 2){         // increment the loadCount variable and if its new value reaches 2
			slide.isReady = true;           // (both css and content loaded) mark the slide as ready
			if(slide.position == 0){        // if this is the first slide:
				this.activate(slide.name);  // activate it.
			}
		}
	}

	async loadExtra(src, slide){
	    // fetch any extra content from the given src, which will be added to the dedicate side panel to the relevant slide
		console.log(`${slide.name} -> loading extra panel`);
        const response = await this.xhrPromise(src,'GET','DOCUMENT');
        const aside = document.createElement('aside');  // create the new "aside" element to hold the extra content (off-screen)
		aside.classList.add("extra");                   // mark the new element with the "extra" class for the default styling
		aside.innerHTML = response;                     // add the content to the actual element (see note at top)
		slide.article.appendChild(aside);               // add the element to the actual slide
		if (this.extraOffset > 2000) {                  // if the user has a wider than usual presentation:
            aside.style.left = `${this.extraOffset}px`; // shift the extra panel further over accordingly
		}
	}

	activate(name){
		// check if the requested slide (by name) is ready to load, and if so, move to it
        if (!this.slides[name].isReady) {
            // if it's not ready, log it to the console and do nothing yet
            // TODO: feedback would be useful to the user
            console.log(`Slide ${name} isn't yet finished loading`);
        } else {
            // otherwise go through and mark all other slides as not active:
    		for(let child in this.slideOrder){
    			if(this.slideOrder[child] != name){
    				this.slides[this.slideOrder[child]].menuItem.classList.remove("active");
    				this.slides[this.slideOrder[child]].article.classList.remove("active");
    			}
    		}
    		this.slides[name].menuItem.classList.add("active"); // now mark the requested slide's menu item as active
    		this.slides[name].article.classList.add("active");  // and mark the requested slide itself as active
    		this.activeSlide = name;                            // and log it as the currently active slide at root of Presentation
        }
	}

	advance(){
	    // advance to the next slide, and loop if at the end
		const currentSlide = this.slideOrder.indexOf(this.activeSlide);             // find the current slide's position
		const newSlide = currentSlide > this.maxSlide - 1 ? 0 : +currentSlide + 1;  // if not at the end, add 1, otherwise drop back to slide 0
		this.activate(this.slideOrder[newSlide]);                                   // activate the new slide based on the above index
	}

	previous(){
	    // go back a slide, and loop if at the beginning
		const currentSlide = this.slideOrder.indexOf(this.activeSlide);         // find the current slide's position
		const newSlide = currentSlide < 1 ? this.maxSlide : currentSlide - 1;   // if not on the first slide, subtract 1, otherwise go to the end
		this.activate(this.slideOrder[newSlide]);                               // activate the new slide based on the above index
	}

	autoplay(delay){
	    // activate the autoplay function based on the requested delay
		this.intervalSeconds = Math.round(delay/1000);  // update the intervalSeconds field
		this.runCountdown();        // run the menu countdown to display number of secons left

		// set the autoHandle to an anonymous function to update the slide at the requested delay (in milliseconds)
		this.autoHandle = setInterval(() => {
			this.advance();         // actually advance the slide once the interval has finished
			this.runCountdown();    // then start the countdown again, since the handle hasn't been cleared yet
		},delay);
		this.isAutoPlaying = true;  // tell Presentation that autoplay is active
	}

	runCountdown(){
	    // update the menu item countdown timer every second until autoplay is turned off
		clearInterval(this.countdownHandle);        // clear the current interval via its handle
		this.countdown = this.intervalSeconds;      // update to keep them both in sync

		// update the menu title to show that it's in autoplay mode and how many seconds are left until the next slide:
		this.menuHead.innerHTML = `Poster outline <font style="color: red;">(auto-playing: ${this.countdown})</font>`;

		// set the countdownHandle to an anonymous function to repeat every second, updating the menu title accordingly:
		this.countdownHandle = setInterval(() => {
			this.countdown -= 1;
			this.menuHead.innerHTML = `Poster outline <font style="color: red;">(auto-playing: ${this.countdown})</font>`;
		}, 1000);
	}

	stop(){
	    // stop the autoplay function:
		clearInterval(this.countdownHandle);        // clear the handle running the interval updating the menut title timer
		clearInterval(this.autoHandle);             // clear the handle running the slide changes
		this.menuHead.innerHTML = "Poster outline"; // return the menu title to normal
		this.isAutoPlaying = false;                 // tell Presentation that autoplay is inactive
		this.countdown = 0;                         // reset the countdown until next slide change
	}

	resize(w = window.innerWidth, h = window.innerHeight){
	    // scale the presentation to fit the current window size, while keeping aspect ratio:
		let scale = Math.min(...[w/this.width, h/this.height]); // divide the requested dimensions by the available ones, and keep the smaller
		this.frame.style.transform = `scale(${scale})`;         // apply the transform to scale accordingly on the actual presentation element
		this.isRealSize = false;                                // mark the Presentation as being scaled
	}

	realSize(){
	    // reset the presentation to its true size (depending on size and window size, this may zoom in or out):
		this.frame.style.transform = 'scale(1)';  // reset to no scaling in the transform on the element holding the presentation
		this.isRealSize = true;                   // mark the Presentation as being real size
	}

	toggleExtra(){
	    // switch between the main slide and the extra content, depending on which is active
		// if currently in the extra slide, transform the active slide's article (i.e., the
		// slide content) back to the origin, and remove the class marking it as in extra:
		if(this.slides[this.activeSlide].article.classList.contains("inExtra")){
			this.slides[this.activeSlide].article.style.transform = "translateX(0) translateZ(0)";
			this.slides[this.activeSlide].article.classList.remove("inExtra");
		}else{
		// otherwise, translate the slide left by the calculated offset for the extra content
		// to bring that into view and the main content the same amount off to the left, while
		// marking the slide as being in the extra display by adding the inExtra class:
			this.slides[this.activeSlide].article.style.transform = `translateX(-${this.extraOffset}px) translateZ(0)`;
			this.slides[this.activeSlide].article.classList.add("inExtra");
		}
	}

	xhrPromise(url, method='GET', type='text', ...headers){
	    // a wrapper function to simplify XMLHttpRequest calls while also handling them
		// as Promises that are either resolved or rejected to keep loading asynchronous
		// by default it uses the 'GET' method, assumes the response type is 'text' and
		// sets no headers
		return new Promise(function(resolve, reject){
			let xhr = new XMLHttpRequest();         // create the request object
			xhr.open(method, url, true);            // open the requested URL using the requested method
			if(headers.length > 0){                 // if headers have been requested:
                xhr.setRequestHeader(...headers);   // spread them to keep name, value pairs, and set them
			}
			xhr.responseType = type;                // set the requested type of file for the response
			xhr.onload = function(){                // if the page loads and responds correctly:
				resolve(this.responseText);         // resolve the promise with the returned content
			};
			xhr.onerror = function(){               // or if there's an error loading the remote data:
				reject({                            // reject the promise and provide the standard information
					status: this.status,
					statusText: xhr.statusText
				});
			};
			xhr.send(null);                         // actually send the request
		});
	};
}
