IQ Revenge
==========
WebGL game using [DH3DLibrary](http://github.com/magicien/DH3DLibrary)

[Online Page](http://darkhorse2.0spec.jp/dh3d/sample/iq.php)

![ScreenShot](https://raw.githubusercontent.com/magicien/IQRevenge/master/screenshot.png)

How to play
-----------

### mac/PC

 - J: Move Left
 - L: Move Right
 - I: Move Forward
 - K: Move Backward
 - Z: Decision, Marking
 - X: Trigger an Advantage Cube
 - C: Fast Forward cubes
 - Esc: Pause/Resume

### iPhone

![ScreenShot_iPhone](https://raw.githubusercontent.com/magicien/IQRevenge/master/screenshot_ios.png)

 - Swipe the Circle at bottom left: Move
 - Tap the blue botton: Marking
 - Tap the green button: Trigger an Advantage Cube
 - Tap the Fast Foward button: Fast Forward cubes
 - Tap the pause button: Pause
 
Rules
-----------
Rules of this game look like [this](https://en.wikipedia.org/wiki/I.Q.:_Intelligent_Qube)

How to build
------------
```bash
git clone git://github.com/magicien/IQRevenge
cd IQRevenge
git submodule init
git submodule update
npm install
npm run build
```
Then you can find `IQRevenge.js` in `build/js/` directory.

How to run this game on a local server
--------------------------------------
After the build commands above,
```bash
npm run webserver
```
Then access http://localhost:8000 with your modern web browser.

