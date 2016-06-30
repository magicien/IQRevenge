'use strict'

import {
  Bone,
  DH3DObject,
  ModelBank,
  Vector3,
  Vector4
} from '../../modules/DH3DLibrary/src/js/main'
import IQGameData from './IQGameData'

/**
 * IQFaceCube class
 * @access public
 */
export default class IQFaceCube extends DH3DObject {
  /**
   * constructor
   * @access public
   * @constructor
   */
  constructor(){
    super()

    this._boxModel = IQFaceCube.model_box.clone()
    this._lidModel = IQFaceCube.model_lid.clone()

    // setup box
    this.setModel(this._boxModel)
    this.setAnimating(false)
    this.setRenderer(IQGameData.renderer)
    this.setRotate(0, 1, 0, 0)

    // setup lid
    this._lidObj = new DH3DObject()
    this._lidObj.setModel(this._lidModel)
    this._lidObj.setAnimating(false)
    this._lidObj.setRenderer(IQGameData.renderer)
    this._lidObj.setRotate(0, 1, 0, 0)

    // create bone for lid
    this._lidBone = new Bone()
    this._lidBone.rotate = new Vector4(0, 0, 0, 1)
    this._lidBone.offset = new Vector3(0, 0.5, -0.5)

    // connect box and lid
    this._boxModel.rootBone.childBoneArray[0].addChild(this._lidBone)
    this._lidBone.addChild(this._lidModel.rootBone)
    this._lidObj.setPosition(0, -0.5, 0.5)

    // rotate axis
    this._lidAxis = new Vector3(-1.0, 0.0, 0.0)
  }

  /**
   * set angle of the lid
   * @access public
   * @param {float} angle - angle of the lid; 0: close, Math.PI * 0.5: open
   * @returns {void}
   */
  setLidAngle(angle) {
    this._lidBone.rotate.createAxis(this._lidAxis, angle)
  }
}

/** @type {boolean} */
IQFaceCube.initialized = false

/** @type {string} */
IQFaceCube.file_box = './x/cube_face_box.x'
/** @type {string} */
IQFaceCube.file_lid = './x/cube_face_lid.x'

/**
 * setup IQFaceCube data
 * @access public
 * @returns {Promise} - resolved when setup is completed
 */
IQFaceCube.setup = () => {
  // preload models
  const promise = Promise.all([
    ModelBank.getModel(IQFaceCube.file_box),
    ModelBank.getModel(IQFaceCube.file_lid)
  ])
  .catch((error) => {
    console.error(`IQFaceCube model loading error: ${error}`)
  })
  .then(() => {
    return Promise.all([
      ModelBank.getModelForRenderer(IQFaceCube.file_box, IQGameData.renderer),
      ModelBank.getModelForRenderer(IQFaceCube.file_lid, IQGameData.renderer)
    ])
  })
  .catch((error) => {
    console.error(`IQFaceCube model loading for renderer error: ${error}`)
  })
  .then((result) => {
    IQFaceCube.model_box = result[0]
    IQFaceCube.model_lid = result[1]
    IQFaceCube.initialized = true
  })

  return promise
}

