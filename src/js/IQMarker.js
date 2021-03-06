'use strict'

import {
  DH3DObject,
  ModelBank
} from '../../modules/DH3DLibrary/src/js/main'
import IQGameData from './IQGameData'

/**
 * IQMarker class
 * @access public
 */
export default class IQMarker extends DH3DObject {
  /**
   * constructor
   * @access public
   * @constructor
   * @param {string} type - marker type ('red' or 'green' or 'blue')
   */
  constructor(type){
    super()

    /** @type {int} */
    this.size = IQGameData.markerSize

    /** @type {string} */
    this.type = ''

    /** @type {string} */
    this.state = ''

    /** @type {boolean} */
    this.advantage = false

    /** @type {Date} */
    this.startTime = null

    /** @type {Date} */
    this.moveTime = null

    /** @type {int} */
    this.rotateCount = 0

    /** @type {Date} */
    this.deleteStartTime = null

    /** @type {int} */
    this.cubeX = -1
    /** @type {int} */
    this.cubeZ = -1

    /** @type {IQPlate} */
    this.markerPlate = null

    /** @type {boolean} */
    this.paused = false

    switch(type){
      case 'red':
        this.setType('red')
        break
      case 'green':
        this.setType('green')
        break
      case 'blue':
      default:
        this.setType('blue')
        break
    }
    this.setAnimating(false)
    this.setRenderer(IQGameData.renderer)
    this.setRotateAxis(IQGameData.yaxis, 0)
  }

  /**
   * set type of this marker
   * @access public
   * @param {string} type - type of marker ('red' or 'green' or 'blue')
   * @returns {int} - if it is unknown type, it reutrns -1. otherwise 0.
   */
  setType(type) {
    if(this.type === type){
      return 0
    }

    switch(type){
      case 'red':
        this.setModel(IQMarker.model_r.clone())
        if(!IQGameData.rotating && !this._getCube()){
          this.startTime = new Date(IQGameData.nowTime.getTime())
        }else if(IQGameData.rotating && !this._getNextCube()){
          this.startTime = new Date(IQGameData.nowTime.getTime())
        }else{
          this.startTime = null
        }
        break
      case 'green':
        this.setModel(IQMarker.model_g.clone())
        this.startTime = null
        this.advantage = true
        break
      case 'blue':
        this.setModel(IQMarker.model_b.clone())
        this.startTime = null
        this.advantage = false
        break
      default:
        return -1
    }
    this.type = type
    this.setScale(this.size)

    if(this.markerPlate){
      this.markerPlate.setType(type)
    }

    return 0
  }

  /**
   * erase this marker
   * @access public
   * @returns {void}
   */
  erase() {
    IQGameData.canvasField.removeObject(this)
    IQGameData.markerArray = IQGameData.markerArray.filter((marker) => { return marker !== this })
    IQGameData.plateMarkerArray[this.cubeZ][this.cubeX] = null

    if(this.markerPlate){
      this.markerPlate.erase()
    }
  }

  /**
   * set position
   * @access public
   * @param {int} cubeZ - Z position
   * @param {int} cubeX - X position
   * @returns {void}
   */
  setPositionWithCube(cubeZ, cubeX) {
    const yPadding = 2.0
    const x = (cubeX - IQGameData.stageWidth * 0.5 + 0.5) * IQGameData.cubeSize
    const y = IQGameData.cubeSize + yPadding
    const z = cubeZ * IQGameData.cubeSize

    this.setPosition(x, y, z)
    this.cubeX = cubeX
    this.cubeZ = cubeZ

    IQGameData.plateMarkerArray[cubeZ][cubeX] = this

    if(this.markerPlate){
      this.markerPlate.setPositionWithCube(cubeZ, cubeX)
    }
  }

  _getCubeAt(z, x) {
    const cubeZ = z - IQGameData.aCubeZ
    if(cubeZ < 0)
      return null

    const cubeLine = IQGameData.aCubeArray[cubeZ]
    if(cubeLine){
      return cubeLine[x]
    }
    return null
  }

  _getCube() {
    return this._getCubeAt(this.cubeZ, this.cubeX)
  }

  _getNextCube() {
    return this._getCubeAt(this.cubeZ - 1, this.cubeX)
  }

  pause() {
    if(!this.paused){
      return
    }
    this.paused = false
  }

  resume(pausedTime = 0) {
    if(!this.paused){
      return
    }
    this.paused = false

    this.addTime(pausedTime, true)
  }

  addTime(msec, resume = false) {
    const timers = [
      this.startTime,
      this.moveTime,
      this.deleteStartTime
    ]
    
    timers.forEach((timer) => {
      if(timer){
        timer.setMilliseconds(timer.getMilliseconds() + msec)
      }
    })

    if(this.markerPlate){
      if(resume){
        this.markerPlate.resume(msec)
      }else{
        this.markerPlate.addTime(msec)
      }
    }
  }
}

IQMarker.initialized = false

IQMarker.file_r = 'x/red_marker.x'
IQMarker.file_g = 'x/green_marker.x'
IQMarker.file_b = 'x/blue_marker.x'
IQMarker.setupSub = function() {
  IQMarker.model_r = ModelBank.getModel(IQMarker.file_r, IQGameData.renderer)
  IQMarker.model_g = ModelBank.getModel(IQMarker.file_g, IQGameData.renderer)
  IQMarker.model_b = ModelBank.getModel(IQMarker.file_b, IQGameData.renderer)
  IQMarker.initialized = true
}
IQMarker.setup = () => {
  const promise = Promise.all([
    ModelBank.getModel(IQMarker.file_r),
    ModelBank.getModel(IQMarker.file_g),
    ModelBank.getModel(IQMarker.file_b)
  ])
  .catch((error) => {
    console.error(`Marker model loading error: ${error}`)
  })
  .then(() => {
    return Promise.all([
      ModelBank.getModelForRenderer(IQMarker.file_r, IQGameData.renderer),
      ModelBank.getModelForRenderer(IQMarker.file_g, IQGameData.renderer),
      ModelBank.getModelForRenderer(IQMarker.file_b, IQGameData.renderer)
    ])
  })
  .catch((error) => {
    console.error(`Marker model loading for renderer error: ${error}`)
  })
  .then((result) => {
    IQMarker.model_r = result[0]
    IQMarker.model_g = result[1]
    IQMarker.model_b = result[2]
    IQMarker.initialized = true
  })

  return promise
}

