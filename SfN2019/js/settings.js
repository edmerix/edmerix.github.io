// SETTINGS file for this presentation. No code should be necessary to edit outside of this file

// list the paths to the slides folders that you have created for the presentation, in order:
// Each should be a directory that contains a "manifest.json" file. The remainder of the
// content can be called whatever you wish, and the "manifest.json" file tells Presentation.js
// what items to display and how. Options inside the "manifest.json" file are:
//      {
//          "name": "aUniqueIDforTheSlide",
//	        "title": "A title for the slide",
//      	"thumbnail": "an image file to act as the thumbnail for the slide",
//      	"main": "the HTML page containing the main slide",
//      	"styles": "the CSS file containing any required extra styling for the slide",
//      	"extra": "an HTML page containing any secondary information (toggled with E)"
//      }
// (note that the name attribute should be appropriate for a javascript fieldname, i.e., cannot
// start with a number or have spaces or hyphens, etc., and it must be unique for each slide.
// If it is left blank or not included in the manifest, then the Presentation class will
// automatically name it based on its position.)
const slides = [
	"slides/slide0",
	"slides/slide1",
	"slides/slide2",
	"slides/slide3"
];

// Provide the ID of the element in your HTML to inject the presentation into:
const container = "main";

// set the default width and height of your presentation in pixels (Presentation will auto-scale
// based on screen size, but also allows you to toggle forcing these dimensions by pressing F):
const width = 1920;
const height = 1080;

// set the number of seconds between automatically advancing slide when auto is activated:
const autoSpeed = 45;
