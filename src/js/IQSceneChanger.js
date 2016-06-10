'use strict'

import {
  DH2DObject
} from '../../modules/DH3DLibrary/src/js/main'
import IQGameData from './IQGameData'

/**
 * IQSceneChanger class
 * @access public
 */
export default class IQSceneChanger extends DH2DObject {
  /**
   * constructor
   * @access public
   * @constructor
   * @param {Date} changeTime -
   * @param {boolean} blackOut -
   * @param {Audio} beforeBGM -
   * @param {Audio} afterBGM -
   * @param {Function} afterLoop -
   * @param {Function} sceneChangeCallback -
   */
  constructor(changeTime, blackOut, beforeBGM, afterBGM, afterLoop, sceneChangeCallback) {
    super()

    /** @type {boolean} */
    this._sceneChanged = false

    /** @type {Date} */
    this._changeTime = changeTime
    this._blackOut = blackOut
    this._beforeBGM = beforeBGM
    this._afterBGM = afterBGM
    this._afterLoop = afterLoop
    this._sceneChangeCallback = sceneChangeCallback
    this._startTime = new Date(IQGameData.nowTime.getTime())
    this._sceneChanged = false

    IQGameData.sceneChanging = true
    IQGameData.canvasField.addObject(this)
  }

  render() {
    const c = IQGameData.canvasField.get2DContext()
    const diffTime = IQGameData.getElapsedTime(this._startTime) * 0.001
    let r = 0
    if(this._changeTime > 0){
      r = 2.0 * diffTime / this._changeTime
    }else{
      r = 2.0
    }
    let alpha = 0

    if(r < 1.0){
      const s = r * r
      alpha = s

      if(this._beforeBGM){
        this._beforeBGM.volume = (1.0 - s) * IQGameData.soundVolume
      }
    }else if(!this._sceneChanged){
      /*
      const s = r * (r - 4) + 4
      if(s > 1.0)
        s = 1.0
      */
      const s = 1.0
      alpha = s

      this._sceneChanged = true
      if(this._afterLoop){
        IQGameData.canvasField.setFrameCallback(this._afterLoop)
      }
      if(this._beforeBGM){
        this._beforeBGM.pause()
        IQGameData.current_bgm = null
      }
      if(this._afterBGM){
        this._afterBGM.pause()
        this._afterBGM.currentTime = 0
        this._afterBGM.volume = 0
        this._afterBGM.play()
        IQGameData.current_bgm = this._afterBGM
      }
      if(this._sceneChangeCallback){
        this._sceneChangeCallback()
      }

      IQGameData.canvasField.addObject(this)
    }else if(r < 2.0){
      const s = r * (r - 4) + 4
      alpha = s

      if(this._afterBGM){
        this._afterBGM.volume = (1 - s) * IQGameData.soundVolume
      }
    }else{
      // finish changing scene
      IQGameData.canvasField.removeObject(this)
      if(this._afterBGM){
        // FIXME
        this._afterBGM.volume = 1.0 * Number(IQGameData.soundVolume)
      }
      IQGameData.sceneChanging = false
      return
    }

    if(this._blackOut){
      c.fillStyle = 'rgba(0, 0, 0, ' + alpha + ')'
      c.fillRect(0, 0, IQGameData.canvasWidth, IQGameData.canvasHeight)
    }
  }
}

