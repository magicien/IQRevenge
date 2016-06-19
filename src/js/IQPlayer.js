'use strict'

/*
import {
  DH3DObject,
  ModelBank
} from '../../modules/DH3DLibrary/src/js/main'
import IQGameData from './IQGameData'
*/
import {
  DH3DObject
} from '../../modules/DH3DLibrary/src/js/main'

/**
 * IQPlayer class
 * @access public
 */
export default class IQPlayer extends DH3DObject {
}

/*
IQPlayer.file_x = ''
IQPlayer.setup = () => {
  const promise = Promise.all([
    ModelBank.getModel(IQPlayer.file_x)
  ])
  .catch((error) => {
    console.error(`Player model loading error: ${error}`)
  })
  .then(() => {
    return Promise.all([
      ModelBank.getModelForRenderer(IQPlayer.file_x, IQGameData.renderer)
    ])
  })
  .catch((error) => {
    console.error(`Player model loading for renderer error: ${error}`)
  })
  .then((result) => {
    IQPlayer.model_x = result[0]
    IQPlayer.initialized = true
  })

  return promise
}
*/

