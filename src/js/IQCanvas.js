'use strict'

import { 
  CanvasField
} from '../../modules/DH3DLibrary/src/js/main'

/**
 * CanvasField class expanded to be able to record and replay the player's move
 * @access public
 */
export default class IQCanvas extends CanvasField {
  /**
   * constructor
   * @access public
   * @constructor
   * @param {HTMLCanvasElement} canvasElement -
   * @param {Map} options -
   */
  constructor(canvasElement, options = {}) {
    super(canvasElement, options)

    /** @type {boolean} */
    this.simulation = false

    /** @type {Date} */
    this.simStartTime = null

    /** @type {int} */
    this.simElapsedTime = 0

    /** @type {int} */
    this.simNextElapsedTime = 0

    /** @type {function} */
    this.simGetElapsedTimeFunc = null
  }

  /**
   * callback to draw next frame
   * @override
   * @access private
   * @returns {void}
   */
  _callNextFrame() {
    // "Reflect" is not yet implemented...
    this._requestAnimationFrame.call(window, () => {
      if(this.simulation){
        const nowTime = new Date()
        const diffTime = nowTime - this.simStartTime

        if(diffTime < this.simNextElapsedTime){
          console.log('callNextFrame skip')
          if(this._animating){
            this._callNextFrame()
          }
          return
        }

        let canvasTime = this.simNextElapsedTime - this.simElapsedTime
        this.simElapsedTime = this.simNextElapsedTime
        this.simNextElapsedTime = this.simGetElapsedTimeFunc()
        
        while(this.simNextElapsedTime <= diffTime){
          this.drawPicture(canvasTime, true) 
          //this.drawPicture(canvasTime, false) 
          canvasTime = this.simNextElapsedTime - this.simElapsedTime
          this.simElapsedTime = this.simNextElapsedTime
          this.simNextElapsedTime = this.simGetElapsedTimeFunc()
        }
        this.drawPicture(canvasTime)
      }else{
        this.drawPicture()
      }

      if(this._animating){
        this._callNextFrame()
      }
    })
    //Reflect.apply(this._requestAnimationFrame, window, () => { obj.drawPicture() } )
  }

  /**
   * draw one frame
   * @access public
   * @param {float} msec - if msec is set, use the given time (ms) to calc physics instead of real time
   * @param {boolean} skipRender - if skipRender is true, render() function will be not called. (only calc physics)
   * @returns {void}
   */
  drawPicture(msec, skipRender = false) {
    let elapsedTime = 0
    const nowTime = (new Date()).getTime()

    if(typeof msec === 'number'){
      elapsedTime = msec * 0.001
    }else if(this._prevTime === null){
      elapsedTime = 0.0
    }else{
      elapsedTime = (nowTime - this._prevTime) * 0.001
    }
    this._prevTime = nowTime

    this.reshape()
    if(this._frameCallback){
      this._frameCallback(elapsedTime)
    }

    // update objects position and call callback function
    this._objs.forEach((obj) => {
      obj.move(elapsedTime)
    })
    this._alphaObjs.forEach((obj) => {
      obj.move(elapsedTime)
    })
    // FIXME: z-sort of alpha objects

    this._cameras.forEach((camera) => { camera.update(elapsedTime) })

    // update object animation
    this._objs.forEach((obj) => {
      obj.animate(elapsedTime)
    })
    this._alphaObjs.forEach((obj) => {
      obj.animate(elapsedTime)
    })

    // render objects
    if(!skipRender){
      this._2DContext.clearRect(0, 0, this._canvasWidth, this._canvasHeight)
      this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT | this._gl.STENCIL_BUFFER_BIT)

      if(this._mirrorOn){
        // render with mirror effect
        // FIXME: multipass

        // draw without mirror
        this._objs.forEach( (obj) => {
          // FIXME
          if(obj._renderer){
            const gl = obj._renderer._gl
            obj._renderer.enableStencil()
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE)
            if(obj._mirror){
              // fill 16 to mirror area
              gl.stencilFunc(gl.ALWAYS, 16, obj._renderer._stencilMask)
            }else{
              // fill 0 to not mirror area
              gl.stencilFunc(gl.ALWAYS,  0, obj._renderer._stencilMask)
            }
          }
          obj.render()
        })

        // update stencil buffer
        const refObjs = this._refObjs
        this._objs.forEach((obj) => {
          if(obj._mirror){
            // FIXME
            obj._renderer.enableStencil()
            obj.renderMirror(refObjs)
          }
        })

        this._alphaObjs.forEach((obj) => {
          obj._renderer.disableStencil()
          obj.render()
        })
      }else{
        // render without mirror effect
        this._objs.forEach( (obj) => {
          obj.render()
        })
        this._alphaObjs.forEach( (obj) => {
          obj.render()
        })
      }

      this._gl.flush()
    }

    //if(this._animating){
    //  this._callNextFrame()
    //}
  }

  startSimulation(startTime, getElapsedTimeCallback) {
    this.simulation = true
    this.simStartTime = startTime
    this.simGetElapsedTimeFunc = getElapsedTimeCallback
  }
}
