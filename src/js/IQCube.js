'use strict'

import {
  DH3DObject,
  ModelBank,
  TextureBank
} from '../../modules/DH3DLibrary/src/js/main'
import IQGameData from './IQGameData'

/**
 * IQCube class
 * @access public
 */
export default class IQCube extends DH3DObject {
  /**
   * constructor
   * @access public
   * @constructor
   * @param {string} type - Cube type: 'advantage', 'forbidden', 'normal'
   */
  constructor(type){
    super()
    
    /** @type {float} */
    this.size = IQGameData.cubeSize

    /** @type {string} */
    this.state = ''

    /** @type {string} */
    this.type = ''

    /** @type {Date} */
    this.startTime = null

    /** @type {int} */
    this.moveTime = 0

    /** @type {Date} */
    this.deleteStartTime = null

    /** @type {float} */
    this.rotateCount = 0

    /** @type {boolean} */
    this.deleteStarted = false

    /** @type {boolean} */
    this.paused = false

    switch(type){
      case 'advantage':
        this.setType('advantage')
        break
      case 'forbidden':
        this.setType('forbidden')
        break
      case 'normal':
      default:
        this.setType('normal')
        break
    }
    this.setModel(IQCube.model_n.clone())
    this.setAnimating(false)
    this.setRenderer(IQGameData.renderer)
    this.setRotate(0, 1, 0, 0)
  }

  /**
   * set cube type
   * @access public
   * @param {string} type - cube type: 'advantage', 'forbidden', 'normal'
   * @returns {void}
   */
  setType(type) {
    if(this.type === type){
      return 0
    }

    switch(type){
      case 'normal':
        this.setModel(IQCube.model_n.clone())
        break
      case 'advantage':
        this.setModel(IQCube.model_a.clone())
        break
      case 'forbidden':
        this.setModel(IQCube.model_f.clone())
        break
      default:
        return -1
    }
    this.type = type
    this.setScale(this.size)

    return 0
  }

  /**
   * erase cube by given marker
   * @access public
   * @param {IQMarker} marker - marker which erases this cube
   * @returns {void}
   */
  eraseWithMarker(marker) {
    // FIXME: wait before delete
    this.marker = marker

    //IQGameData.canvasField.removeObject(this)
    const obj = this
    IQGameData.aCubeArray.forEach( (cubeLine) => {
      const index = cubeLine.indexOf(obj)
      if(index >= 0){
        cubeLine[index] = null
      }
    })

    if(this.type === 'forbidden'){
      // penalty
    }else{
      // get point
      if(marker.advantage){
        IQGameData.score += IQGameData.pointAdvantage
      }else{
        IQGameData.score += IQGameData.pointNormal
      }
    }

    IQGameData.deleteCubeArray.push(this)
    //this.deleteStartTime = new Date()
    this.deleteStartTime = new Date(IQGameData.nowTime.getTime())
  }

  pause() {
    if(this.paused){
      return
    }
    this.paused = true

    if(this.type !== 'normal'){
      this.getModel().materialArray[0].texture = IQCube.model_n.materialArray[0].texture
    }
  }

  resume(pausedTime = 0) {
    if(!this.paused){
      return
    }
    this.paused = false

    IQCube.resetTexture()

    const timerArray = [
      this.startTime,
      this.deleteStartTime
    ]
    timerArray.forEach((timer) => {
      if(timer){
        timer.setMilliseconds(timer.getMilliseconds() + pausedTime)
      }
    })
  }

  resetTexture() {
    if(this.type === 'forbidden'){
      this.getModel().materialArray[0].texture = TextureBank.getTexture(IQCube.texture_f)
    }else if(this.type === 'advantage'){
      this.getModel().materialArray[0].texture = TextureBank.getTexture(IQCube.texture_a)
    }
  }
}

/** @type {boolean} */
IQCube.initialized = false

// FIXME
/** @type {string} */
IQCube.file_n = './x/cube_n.x'
/** @type {string} */
IQCube.file_f = './x/cube_f.x'
/** @type {string} */
IQCube.file_a = './x/cube_a.x'

// FIXME
IQCube.texture_f = './x/cube_tex_f.bmp'
IQCube.texture_a = './x/cube_tex_a.bmp'

/**
 * setup IQCube data
 * @access public
 * @returns {Promise} - resolved when setup is completed
 */
IQCube.setup = () => {
  // preload models
  const promise = Promise.all([
    ModelBank.getModel(IQCube.file_n),
    ModelBank.getModel(IQCube.file_f),
    ModelBank.getModel(IQCube.file_a)
  ])
  .catch((error) => {
    console.error(`IQCube model loading error: ${error}`)
  })
  .then(() => {
    return Promise.all([
      ModelBank.getModelForRenderer(IQCube.file_n, IQGameData.renderer),
      ModelBank.getModelForRenderer(IQCube.file_f, IQGameData.renderer),
      ModelBank.getModelForRenderer(IQCube.file_a, IQGameData.renderer)
    ])
  })
  .catch((error) => {
    console.error(`IQCube model loading for renderer error: ${error}`)
  })
  .then((result) => {
    IQCube.model_n = result[0]
    IQCube.model_f = result[1]
    IQCube.model_a = result[2]
    IQCube.initialized = true
  })

  return promise
}

/**
 * set texture image of normal cube
 * @access public
 * @param {int} stage - stage number
 * @returns {void}
 */
IQCube.setNormalCubeTextureForStage = (stage) => {
  const textureDir = './x/'
  let textureName = ''
  switch(stage) {
    case 2:
      textureName = 'cube_tex_2n.bmp'
      break
    case 3:
      textureName = 'cube_tex_3n.bmp'
      break
    case 4:
      textureName = 'cube_tex_4n.bmp'
      break
    case 5:
      textureName = 'cube_tex_5n.bmp'
      break
    case 6:
      textureName = 'cube_tex_6n.bmp'
      break
    case 7:
      textureName = 'cube_tex_7n.bmp'
      break
    case 8:
      textureName = 'cube_tex_8n.bmp'
      break
    case 9:
      textureName = 'cube_tex_9n.bmp'
      break
    case 1:
    default:
      textureName = 'cube_tex_1n.bmp'
      break
  }
  IQCube.model_n.materialArray[0].texture = TextureBank.getTexture(textureDir + textureName)
}

IQCube.resetTexture = () => {
  //IQCube.model_n.materialArray[0].texture = TextureBank.getTexture(IQCube.texture_n)
  IQCube.model_a.materialArray[0].texture = TextureBank.getTexture(IQCube.texture_a)
  IQCube.model_f.materialArray[0].texture = TextureBank.getTexture(IQCube.texture_f)
}

/** @type {boolean} */
IQCube.initialized = false

// FIXME
/** @type {string} */
IQCube.file_n = './x/cube_n.x'
/** @type {string} */
IQCube.file_f = './x/cube_f.x'
/** @type {string} */
IQCube.file_a = './x/cube_a.x'

// FIXME
IQCube.texture_f = './x/cube_tex_f.bmp'
IQCube.texture_a = './x/cube_tex_a.bmp'

/**
 * setup IQCube data
 * @access public
 * @returns {Promise} - resolved when setup is completed
 */
IQCube.setup = () => {
  // preload models
  const promise = Promise.all([
    ModelBank.getModel(IQCube.file_n),
    ModelBank.getModel(IQCube.file_f),
    ModelBank.getModel(IQCube.file_a)
  ])
  .catch((error) => {
    console.error(`IQCube model loading error: ${error}`)
  })
  .then(() => {
    return Promise.all([
      ModelBank.getModelForRenderer(IQCube.file_n, IQGameData.renderer),
      ModelBank.getModelForRenderer(IQCube.file_f, IQGameData.renderer),
      ModelBank.getModelForRenderer(IQCube.file_a, IQGameData.renderer)
    ])
  })
  .catch((error) => {
    console.error(`IQCube model loading for renderer error: ${error}`)
  })
  .then((result) => {
    IQCube.model_n = result[0]
    IQCube.model_f = result[1]
    IQCube.model_a = result[2]
    IQCube.initialized = true
  })

  return promise
}

/**
 * set texture image of normal cube
 * @access public
 * @param {int} stage - stage number
 * @returns {void}
 */
IQCube.setNormalCubeTextureForStage = (stage) => {
  const textureDir = './x/'
  let textureName = ''
  switch(stage) {
    case 2:
      textureName = 'cube_tex_2n.bmp'
      break
    case 3:
      textureName = 'cube_tex_3n.bmp'
      break
    case 4:
      textureName = 'cube_tex_4n.bmp'
      break
    case 5:
      textureName = 'cube_tex_5n.bmp'
      break
    case 6:
      textureName = 'cube_tex_6n.bmp'
      break
    case 7:
      textureName = 'cube_tex_7n.bmp'
      break
    case 8:
      textureName = 'cube_tex_8n.bmp'
      break
    case 9:
      textureName = 'cube_tex_9n.bmp'
      break
    case 1:
    default:
      textureName = 'cube_tex_1n.bmp'
      break
  }
  IQCube.model_n.materialArray[0].texture = TextureBank.getTexture(textureDir + textureName)
}

