# edmerix.github.io
An overhaul of my personal website, for those of a less nerdy persuasion. Also nice to get a bit of art up there.

The original pseudo-terminal version is still available at [edmerix.github.io/terminal.html](https://edmerix.github.io/terminal.html). Its original description is below:

## edmerix pseudo-terminal

My "terminal-esque" personal website. The design is based on my Terminal.js class.

This is the static version of the site, and so multiple features have been removed.

Core functions are auto-loaded from [core.js](core.js), while base programs are loaded from [programs.js](programs.js), and extra functions that can be installed during use are in the [pkg](pkg/) directory.

It is entirely class-based, so multiple terminals can run side-by-side with their own installations, and all functionality is easily extensible. See [eg_program.js](pkg/eg_program.js) for an example of how to code a "program" that can be installed, rather than just a function (only written for explanation purposes), and [notebook.js](pkg/notebook.js) for an example of an actual "windowed" program.

### Screenshot

![Emerix Terminal in action with multiple sessions](screenshots/EmerixTerminalScreenshot.png?raw=true "Emerix Terminal in action with multiple sessions")

### Credits

- Subway times are making use of [MTAPI](https://github.com/jonthornton/MTAPI)
- Weather forecast is making use of [OpenWeatherMap API](https://api.openweathermap.org)
- MLB live scores and data are using [MLB's shared data](https://gd2.mlb.com/components/game/mlb/)
- Math functionality is courtesy of [Math.js](https://mathjs.org)
- Currency conversion is using [exchangerate.host](https://exchangerate.host)
