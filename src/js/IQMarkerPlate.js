'use strict'

import {
  DH3DObject,
  TextureBank,
  ModelBank
} from '../../modules/DH3DLibrary/src/js/main'
import IQGameData from './IQGameData'

/**
 * IQMarkerPlate class
 * @access public
 */
export default class IQMarkerPlate extends DH3DObject {
  /**
   * constructor
   * @access public
   * @constructor
   * @param {string} type - marker type ('red' or 'green' or 'blue')
   */
  constructor(type) {
    super()

    /** @type {int} */
    this.size = IQGameData.cubeSize

    /** @type {string} */
    this.type = ''

    /** @type {string} */
    this.state = ''

    /** @type {Array<Image>} */
    this.textures = null

    /** @type {Date} */
    this.startTime = null

    /** @type {int} */
    this.endTime = 120

    /** @type {int} */
    this.cubeX = -1

    /** @type {int} */
    this.cubeZ = -1

    /** @type {Date} */
    this.startTime = null

    this.setModel(IQMarkerPlate.model_plate.clone())
    this.setScale(IQGameData.cubeSize)
    this.setAnimating(false)
    this.setRenderer(IQGameData.renderer)
    this.setRotateAxis(IQGameData.xaxis, -Math.PI * 0.5)

    if(type){
      this.setType(type)
    }else{
      this.setType('blue')
    }

    const obj = this
    this.addMoveCallback( () => {
      obj.update()
    })
    this.startTime = new Date()
  }

  /**
   * update marker plate state
   * @access public
   * @returns {void}
   */
  update() {
    const diffTime = IQGameData.getElapsedTime(this.startTime)
    let step = 0

    if(diffTime < this.endTime){
      step = Math.floor(IQMarkerPlate.frames * diffTime / this.endTime)
    }else{
      step = IQMarkerPlate.frames - 1
    }

    if(step < 0)
      step = 0
    if(step >= IQMarkerPlate.frames)
      step = IQMarkerPlate.frames - 1

    this._dynamicTexture = this.textures[step]
  }

  setType(type) {
    if(this.type === type){
      return
    }

    switch(type){
      case 'red':
        this.type = 'red'
        this.textures = IQMarkerPlate.redTextures
        this.startTime = new Date()
        break
      case 'green':
        this.type = 'green'
        this.textures = IQMarkerPlate.greenTextures
        this.startTime = new Date()
        break
      case 'blue':
      default:
        this.type = 'blue'
        this.textures = IQMarkerPlate.blueTextures
        break
    }
  }

  /**
   * erase marker plate
   * @access public
   * @returns {void}
   */
  erase() {
    IQGameData.canvasField.removeObject(this)
  }

  /**
   * set position
   * @access public
   * @param {int} cubeZ - Z position
   * @param {int} cubeX - X position
   * @returns {void}
   */
  setPositionWithCube(cubeZ, cubeX) {
    const x = (cubeX - IQGameData.stageWidth * 0.5 + 0.5) * IQGameData.cubeSize
    const y = 0.1
    const z = cubeZ * IQGameData.cubeSize

    this.setPosition(x, y, z)
    this.cubeX = cubeX
    this.cubeZ = cubeZ
  }
  
}

/** @type {boolean} */
IQMarkerPlate.initialized = false
/** @type {string} */
IQMarkerPlate.file_plate = 'x/marker_plate.x'

// color definition
IQMarkerPlate.redColor    = 'rgba(255, 0, 0, 0.5)'
IQMarkerPlate.greenColor  = 'rgba(0, 255, 0, 0.5)'
IQMarkerPlate.blueColor   = 'rgba(0, 0, 255, 0.5)'
IQMarkerPlate.transparent = 'rgba(0, 0, 0, 0)'

// texture
IQMarkerPlate.redTextures   = []
IQMarkerPlate.greenTextures = []
IQMarkerPlate.blueTextures  = []

IQMarkerPlate.frames = 7

IQMarkerPlate.setup = function() {
  const w = 64
  const h = 64

  // initialize textures
  const colors = [
    IQMarkerPlate.redColor,
    IQMarkerPlate.greenColor,
    IQMarkerPlate.blueColor
  ]
  const colorTextures = [
    IQMarkerPlate.redTextures,
    IQMarkerPlate.greenTextures,
    IQMarkerPlate.blueTextures
  ]
  const frames = IQMarkerPlate.frames
  const step = w * 0.5 * Math.sqrt(2) / frames
  const x0 = w * 0.5
  const y0 = h * 0.5
  let r0 = step
  for(let i=0; i<frames; i++){
    for(let color=0; color<3; color++){
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      //canvas.toString = () => { return 'markerPlate_' + color + '_' + i }

      const c = canvas.getContext('2d')
      if(i === frames - 1){
        c.fillStyle = colors[color]
      }else{
        const grad = c.createRadialGradient(x0, y0, r0, x0, y0, r0 + step)
        grad.addColorStop(0.0, colors[color])
        grad.addColorStop(1.0, IQMarkerPlate.transparent)
        c.fillStyle = grad
      }
      c.clearRect(0, 0, w, h)
      c.fillRect(0, 0, w, h)

      //IQMarkerPlate.texture = TextureBank.getTexture(IQMarkerPlate.canvas)
      colorTextures[color][i] = TextureBank.getTexture(canvas)
    }
    r0 += step
  }

  const promise = Promise.all([
    ModelBank.getModel(IQMarkerPlate.file_plate)
  ])
  .catch((error) => {
    console.error(`MarkerPlate model loading error: ${error}`)
  })
  .then(() => {
    return ModelBank.getModelForRenderer(IQMarkerPlate.file_plate, IQGameData.renderer)
  })
  .catch((error) => {
    console.error(`MarkerPlate model loading for renderer error: ${error}`)
  })
  .then((result) => {
    IQMarkerPlate.model_plate = result
    IQMarkerPlate.initialized = true
  })

  return promise
}

