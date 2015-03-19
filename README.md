# Luggage

## Installation

```
# Install development Jade/SCSS server
sudo npm install wvbe/otf-server#develop -g

# Install the game
git clone git@git.crossfrontal.com:wvbe/luggage.git
cd luggage
npm install
bower install

# Serve the game with develop server
npm start
```

## @TODO:
- Describe the following concepts and their responsibilities:
	- Player
	- World
	- Tile
	- Renderer
	- Notification...
	    -  ...Service
	    -  ...Channel
- Describe the different coordinate systems
	- Tile coordinates (x,y,z)
	- Pixel coordinates (x,y)
- Performance improvements
    - Might want to use Trigger instead of Tiny-Emitter: http://jsperf.com/trigger-vs-tinyemitter