'use strict'

import {
  DH3DObject,
  ModelBank,
  TextureBank
} from '../../modules/DH3DLibrary/src/js/main'
import IQGameData from './IQGameData'

/**
 * IQEffectPlate class
 * @access public
 */
export default class IQEffectPlate extends DH3DObject {
  /**
   * constructor
   * @access public
   * @constructor
   * @param {float} wide - width of plate
   * @param {float} z - Z position
   * @param {float} x - X position
   * @param {float} delay - delation to start an effect animation
   */
  constructor(wide, z, x, delay) {
    super()

    /** @type {Date} */
    this.startTime = null

    /** @type {float} */
    this.endTime = 850

    /** @type {float} */
    this.delay = 0

    /** @type {Image} */
    this._dynamicTexture = null

    if(delay){
      this.delay = delay
    }

    this.setModel(IQEffectPlate.model_plate.clone())
    this.setScale(IQGameData.cubeSize)
    this.setAnimating(false)
    this.setRenderer(IQGameData.renderer)

    let posX
    let posZ
    if(wide){
      this.setRotateAxis(IQGameData.yaxis, 0)
      posX = (x + 0.5 - IQGameData.stageWidth * 0.5) * IQGameData.cubeSize
      posZ = (z - 0.5) * IQGameData.cubeSize
    }else{
      this.setRotateAxis(IQGameData.yaxis, Math.PI * 0.5)
      posX = (x - IQGameData.stageWidth * 0.5) * IQGameData.cubeSize
      posZ = z * IQGameData.cubeSize
    }
    this.setPosition(posX, 0, posZ)

    const obj = this
    this.addMoveCallback(() => {
      obj.update()
    })
    this.startTime = new Date()

    IQGameData.canvasField.addObject(this, true)
    IQGameData.effectArray.push(this)
  }

  /**
   * update plate animation
   * @access public
   * @returns {void}
   */
  update() {
    const diffTime = IQGameData.getElapsedTime(this.startTime) - this.delay
    const frames = IQEffectPlate.upFrames + IQEffectPlate.downFrames

    if(diffTime < 0){
      this._dynamicTexture = IQEffectPlate.transparentTexture
      return
    }
    if(diffTime >= this.endTime){
      this.erase()
      return
    }

    const peek = this.endTime * IQEffectPlate.upFrames / frames
    const num = IQEffectPlate.numTextures
    let step
    if(diffTime < peek){
      step = Math.floor(num * diffTime / peek)
    }else{
      step = num - 1 - Math.floor(num * (diffTime - peek) / (this.endTime - peek))
    }
    
    if(step < 0)
      step = 0
    if(step >= num)
      step = num - 1

    // FIXME
    this._dynamicTexture = IQEffectPlate.textures[step]
  }

  /**
   * erase this plate
   * @access public
   * @returns {void}
   */
  erase() {
    IQGameData.effectArray = IQGameData.effectArray.filter((effect) => { return effect !== this })
    IQGameData.canvasField.removeObject(this)
  }
}

/** @type {boolean} */
IQEffectPlate.initialized = false

/** @type {string} */
IQEffectPlate.file_plate = 'x/effect_plate.x'

// color definition
/** @type {string} */
IQEffectPlate.whiteColor  = 'rgba(255, 255, 255, 0.2)'
/** @type {string} */
IQEffectPlate.transparent = 'rgba(0, 0, 0, 0)'

// texture
/** @type {Array<Image>} */
IQEffectPlate.textures = []

/** @type {Image} */
IQEffectPlate.transparentTexture = null
/** @type {int} */
IQEffectPlate.numTextures = 20
/** @type {int} */
IQEffectPlate.upFrames = 5
/** @type {int} */
IQEffectPlate.downFrames = 20

/**
 * setup IQEffectPlate data
 * @access public
 * @returns {Promise} - resolved when setup is completed
 */
IQEffectPlate.setup = function() {
  const w = 64
  const h = 64

  const textures = []
  const num = IQEffectPlate.numTextures
  let y0 = 0
  const yGrad = 20
  const yStep = 1.0 * (h - yGrad) / (num - 1)

  for(let i=0; i<num; i++){
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    //canvas.toString = () => { return 'effectPlate_' + i }

    const c = canvas.getContext('2d')
    const grad = c.createLinearGradient(0, y0, 0, y0 + yGrad)

    grad.addColorStop(0.0, IQEffectPlate.whiteColor)
    grad.addColorStop(1.0, IQEffectPlate.transparent)
    c.fillStyle = grad
    c.clearRect(0, 0, w, h+1)
    c.fillRect(0, 0, w, h+1)

    textures[i] = TextureBank.getTexture(canvas)

    y0 += yStep
  }
  IQEffectPlate.textures = textures

  {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h

    const c = canvas.getContext('2d')
    c.clearRect(0, 0, w, h+1)

    IQEffectPlate.transparentTexture = TextureBank.getTexture(canvas)
  }
  
  const promise = Promise.all([
    ModelBank.getModel(IQEffectPlate.file_plate)
  ])
  .catch((error) => {
    console.error(`Plate model loading error: ${error}`)
  })
  .then((result) => {
    return ModelBank.getModelForRenderer(IQEffectPlate.file_plate, IQGameData.renderer)
  })
  .catch((error) => {
    console.error(`Plate model loading for renderer error: ${error}`)
  })
  .then((result) => {
    IQEffectPlate.model_plate = result
    IQEffectPlate.initialized = true
  })

  return promise
}

