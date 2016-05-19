IQ Revenge
==========
WebGL game using [DH3DLibrary](http://github.com/magicien/DH3DLibrary)

How to play
-----------
 - J: Move Left
 - L: Move Right
 - I: Move Forward
 - K: Move Backward
 - Z: Decision, Marking
 - X: Trigger an Advantage Cube
 - C: Fast Forward cubes
 - Esc: Pause/Resume

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

