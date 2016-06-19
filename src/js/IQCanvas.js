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
    // this.simElapsedTime = 0

    /** @type {int} */
    // this.simNextElapsedTime = 0

    /** @type {Array<object>} */
    this.simList = []

    /** @type {int} */
    this.simListIndex = -1

    /** @type {function} */
    this.simFrameCallback = null

    /** @type {function} */
    this.skipTimeCallback = null

    /** @type {boolean} */
    this.moveEnable = true

    /** @type {int} */
    this.mspf = null

    /** @type {int} */
    this.maxMSPF = 60
  }

  getMspf() {
    return this.mpsf
  }

  setMspf(mspf = 0) {
    this.mspf = mspf
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
      const nowTime = (new Date()).getTime()

      if(this.simulation){
        const diffTime = nowTime - this.simStartTime

        if(this.simFrameCallback){
          this.simFrameCallback(diffTime)
        }
        
        let simData = this.simList[this.simListIndex]
        while(simData && simData.time <= diffTime){
          if(simData.callback){
            simData.callback(simData, diffTime)
          }
          if(simData.type === 'control'){
            this.currentSimData = simData
            this.drawPicture(simData.elapsedTime, !this.moveEnable, true) // skipRender
          }
          this.simListIndex++
          simData = this.simList[this.simListIndex]
        }
        this._renderObjects()
      }else if(this.mspf > 0){
        this.drawPicture(this.mspf, !this.moveEnable)
      }else{
        let elapsedTime = nowTime - this._prevTime
        if(this._prevTime === null){
          elapsedTime = 0
        }else if(elapsedTime > this.maxMSPF){
          // if it's too slow, skip time not to move too much in one frame
          const skipTime = elapsedTime - this.maxMSPF
          if(this.skipTimeCallback){
            this.skipTimeCallback(skipTime)
          }
          elapsedTime = this.maxMSPF
        }

        this.drawPicture(elapsedTime, !this.moveEnable)
      }

      this._prevTime = nowTime
      if(this._animating){
        this._callNextFrame()
      }
    })
  }

  /**
   * draw one frame
   * @access public
   * @param {float} msec - elapsed time from previous frame
   * @param {boolean} skipMove - if skipMove is true, move() and animate() function will be not called.
   * @param {boolean} skipRender - if skipRender is true, render() function will be not called.
   * @returns {void}
   */
  //drawPicture(msec, skipMove = false, skipRender = false) {
  drawPicture(msec, skipMove = false, skipRender = false) {
    /*
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
    */
    let elapsedTime = msec * 0.001
    if(typeof msec !== 'number'){
      elapsedTime = 0
    }

    this.reshape()
    if(this._frameCallback){
      this._frameCallback(elapsedTime)
    }

    if(!skipMove){
      this._moveObjects(elapsedTime)
    }

    // render objects
    if(!skipRender){
      this._renderObjects()
    }
  }

  _moveObjects(elapsedTime = 0) {
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
  }

  _renderObjects() {
    this._2DContext.clearRect(0, 0, this._canvasWidth, this._canvasHeight)
    this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT | this._gl.STENCIL_BUFFER_BIT)

    if(this._mirrorOn){
      // render with mirror effect
      // FIXME: multipass

      // draw without mirror
      this._objs.forEach( (obj) => {
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

  startSimulation(startTime, simList, simFrameCallback) {
    this.simulation = true
    this.simStartTime = new Date(startTime.getTime())
    this.moveEnable = true
    this.simList = simList
    this.simListIndex = 0
    this.simFrameCallback = simFrameCallback
  }

  endSimulation() {
    this.simulation = false
    this.simStartTime = null
    this.simFrameCallback = null
    this.moveEnable = true
  }

  pauseSimulation() {
    this.moveEnable = false
  }

  resumeSimulation() {
    this.moveEnable = true
  }
}
