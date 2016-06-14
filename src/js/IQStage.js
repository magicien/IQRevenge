'use strict'

import {
  Bone,
  DH3DObject,
  Vector3,
  Model,
  RenderGroup,
  Skin,
  TextureUV
} from '../../modules/DH3DLibrary/src/js/main'
import IQCube from './IQCube'
import IQEffectPlate from './IQEffectPlate'
import IQGameData from './IQGameData'

/**
 * IQStage class
 * @access public
 */
export default class IQStage extends DH3DObject {
  /**
   * constructor
   * @access public
   * @constructor
   * @param {int} height - number of cubes of stage height (Y axis)
   * @param {int} width - number of cubes of stage width (X axis)
   * @param {int} length - number of cubes of stage length (Z axis)
   */
  constructor(height, width, length) {
    super()

    this.numFrontSkins = 0
    this.numLineSkins = 0
    this.numLineIndices = 0
    this.numFloorSkins = 0
    this.numFloorIndices = 0

    this._floor = null
    this._waitCube = null

    this.height = height
    this.width  = width
    this.length = length

    this._createStage()
    this._createFloor()

    this.setScale(IQGameData.cubeSize)
    this.setAnimating(false)
    this.setRenderer(IQGameData.renderer)
    this.setRotateAxis(IQGameData.yaxis, 0)

    const x = -0.5 * IQGameData.cubeSize * width
    const z = -0.5 * IQGameData.cubeSize
    this.setPosition(x, 0, z)

    // floor
    const f = this._floor
    f.setScale(IQGameData.cubeSize)
    f.setAnimating(false)
    f.setRenderer(IQGameData.renderer)
    f.setRotateAxis(IQGameData.yaxis, 0)
    f.setPosition(x, 0, z)
  }


  _createFloor() {
    const baseModel = IQCube.model_n
    const f = new DH3DObject()
    const m = new Model()
    this._floor = f
    this._floor._model = m

    m.renderer = IQGameData.renderer
    m.hashName = 'IQFloor'

    const topNormal    = new Vector3(0, 1, 0)

    const uvArr = this.getTextureUV(IQGameData.stage)
    const uv00 = uvArr[0]
    const uv01 = uvArr[1]
    const uv10 = uvArr[2]
    const uv11 = uvArr[3]

    const skinArray = []
    let s = null

    for(let z=0; z<this.length; z++){
      for(let x=0; x<this.width; x++){
        s = new Skin()
        s.position  = new Vector3(x, 0, z)
        s.normal    = topNormal
        s.textureUV = uv00
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(x, 0, z+1)
        s.normal    = topNormal
        s.textureUV = uv01
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(x+1, 0, z)
        s.normal    = topNormal
        s.textureUV = uv10
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(x+1, 0, z+1)
        s.normal    = topNormal
        s.textureUV = uv11
        skinArray.push(s)
      }
    }

    // set bone
    skinArray.forEach( (skin) => {
      skin.boneIndex[0] = 0
      skin.boneIndex[1] = -1
      skin.boneIndex[2] = -1
      skin.boneIndex[3] = -1

      skin.skinWeight[0] = 1.0
      skin.skinWeight[1] = 0.0
      skin.skinWeight[2] = 0.0
      skin.skinWeight[3] = 0.0
    })

    m.skinArray = skinArray

    const baseBone = new Bone()
    const group = new RenderGroup()
    group.boneArray = []
    group.boneArray[0] = baseBone
    group.material = baseModel.renderGroupArray[0].material
    m.materialArray[0] = group.material

    m.renderGroupArray = [group]
    m.boneArray.push(baseBone)
    m.rootBone.addChild(baseBone)

    const arr = []
    for(let index=0; index<skinArray.length; index+=4){
      arr.push(index + 0)
      arr.push(index + 1)
      arr.push(index + 2)
      arr.push(index + 1)
      arr.push(index + 2)
      arr.push(index + 3)
    }
    m.indexArray = arr
    group.indices = arr

    // vertex buffer
    const gl = IQGameData.canvasField._gl
    m.vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, m.vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, IQGameData.renderer.getVertexData(m), gl.DYNAMIC_DRAW)

    // index buffer
    group.indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, group.indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, group.getIndexData(m), gl.DYNAMIC_DRAW)

    this.numFloorSkins = this.width * 4
    this.numFloorIndices = this.width * 6

    m.loaded = true
  }

  _createStage() {
    const baseModel = IQCube.model_n
    const m = new Model()
    this._model = m

    m.renderer = IQGameData.renderer
    m.hashName = 'IQStage'

    const leftNormal   = new Vector3(-1, 0, 0)
    const rightNormal  = new Vector3(1, 0, 0)
    //var topNormal    = new Vector3(0, 1, 0)
    const bottomNormal = new Vector3(0, -1, 0)
    const frontNormal  = new Vector3(0, 0, 1)

    const uvArr = this.getTextureUV(IQGameData.stage)
    const uv00 = uvArr[0]
    const uv01 = uvArr[1]
    const uv10 = uvArr[2]
    const uv11 = uvArr[3]
    
    const skinArray = []
    let s = null

    // front
    for(let x=0; x<this.width; x++){
      for(let y=0; y<this.height; y++){
        s = new Skin()
        s.position  = new Vector3(x+1, -y, this.length)
        s.normal    = frontNormal
        s.textureUV = uv00
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(x, -y, this.length)
        s.normal    = frontNormal
        s.textureUV = uv01
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(x+1, -y-1, this.length)
        s.normal    = frontNormal
        s.textureUV = uv10
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(x, -y-1, this.length)
        s.normal    = frontNormal
        s.textureUV = uv11
        skinArray.push(s)
      }
    }

    for(let z=0; z<this.length; z++){
      // left
      for(let y=0; y<this.height; y++){
        s = new Skin()
        s.position  = new Vector3(0, -y, z+1)
        s.normal    = leftNormal
        s.textureUV = uv00
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(0, -y, z)
        s.normal    = leftNormal
        s.textureUV = uv01
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(0, -y-1, z+1)
        s.normal    = leftNormal
        s.textureUV = uv10
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(0, -y-1, z)
        s.normal    = leftNormal
        s.textureUV = uv11
        skinArray.push(s)
      }

      // right
      for(let y=0; y<this.height; y++){
        s = new Skin()
        s.position  = new Vector3(this.width, -y, z+1)
        s.normal    = rightNormal
        s.textureUV = uv00
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(this.width, -y-1, z+1)
        s.normal    = rightNormal
        s.textureUV = uv01
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(this.width, -y, z)
        s.normal    = rightNormal
        s.textureUV = uv10
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(this.width, -y-1, z)
        s.normal    = rightNormal
        s.textureUV = uv11
        skinArray.push(s)
      }

      // top
      /*
      for(let x=0; x<this.width; x++){
        s = new Skin()
        s.position  = new Vector3(x, 0, z)
        s.normal    = topNormal
        s.textureUV = uv00
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(x, 0, z+1)
        s.normal    = topNormal
        s.textureUV = uv01
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(x+1, 0, z)
        s.normal    = topNormal
        s.textureUV = uv10
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(x+1, 0, z+1)
        s.normal    = topNormal
        s.textureUV = uv11
        skinArray.push(s)
      }
      */

      // bottom
      for(let x=0; x<this.width; x++){
        s = new Skin()
        s.position  = new Vector3(x+1, -this.height, z)
        s.normal    = bottomNormal
        s.textureUV = uv00
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(x+1, -this.height, z+1)
        s.normal    = bottomNormal
        s.textureUV = uv01
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(x, -this.height, z)
        s.normal    = bottomNormal
        s.textureUV = uv10
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(x, -this.height, z+1)
        s.normal    = bottomNormal
        s.textureUV = uv11
        skinArray.push(s)
      }
    }

    // set bone
    skinArray.forEach( (skin) => {
      skin.boneIndex[0] = 0
      skin.boneIndex[1] = -1
      skin.boneIndex[2] = -1
      skin.boneIndex[3] = -1

      skin.skinWeight[0] = 1.0
      skin.skinWeight[1] = 0.0
      skin.skinWeight[2] = 0.0
      skin.skinWeight[3] = 0.0
    })

    m.skinArray = skinArray

    const baseBone = new Bone()
    const group = new RenderGroup()
    group.boneArray = []
    group.boneArray[0] = baseBone
    group.material = baseModel.renderGroupArray[0].material
    m.materialArray[0] = group.material

    m.renderGroupArray = [group]
    m.boneArray.push(baseBone)
    m.rootBone.addChild(baseBone)

    const arr = []
    for(let index=0; index<skinArray.length; index+=4){
      arr.push(index + 0)
      arr.push(index + 1)
      arr.push(index + 2)
      arr.push(index + 1)
      arr.push(index + 2)
      arr.push(index + 3)
    }
    m.indexArray = arr
    group.indices = arr

    // vertex buffer
    const gl = IQGameData.canvasField._gl
    m.vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, m.vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, IQGameData.renderer.getVertexData(m), gl.DYNAMIC_DRAW)

    // index buffer
    group.indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, group.indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, group.getIndexData(m), gl.DYNAMIC_DRAW)

    this.numFrontSkins = this.width * this.height * 4
    this.numLineSkins = (this.width + this.height * 2) * 4
    this.numLineIndices = (this.width + this.height * 2) * 6

    m.loaded = true
  }

  breakOneLine(breakByPenaltyMax) {
    if(IQGameData.gameOver){
      return
    }

    if(IQGameData.breaking){
      if(!breakByPenaltyMax){
        IQGameData.penaltyQueue++
      }
      return
    }

    if(breakByPenaltyMax){
      IQGameData.penalty -= IQGameData.penaltyMax
    }

    // create one line
    const posZ = (IQGameData.stageLength - 1) * IQGameData.cubeSize
    let posY = -IQGameData.cubeSize * 0.5
    const delay = 200
    for(let y=0; y<IQGameData.stageHeight; y++){
      let posX = (-IQGameData.stageWidth * 0.5 + 0.5) * IQGameData.cubeSize
      for(let x=0; x<IQGameData.stageWidth; x++){
        const cube = new IQCube('normal')
        cube.setRotateAxis(IQGameData.xaxis, 0.0)
        cube.setPosition(posX, posY, posZ)
        cube.fallStartTime = ((IQGameData.stageHeight - 1 - y) + (IQGameData.stageWidth - 1 - x)) * 100 + delay
        cube.baseY = posY
        cube.baseZ = posZ
        IQGameData.canvasField.addObject(cube)
        IQGameData.breakCubeArray.push(cube)

        posX += IQGameData.cubeSize

        if(y === 0){
          cube.isTopCube = true
        }
      }
      posY -= IQGameData.cubeSize
    }
    // add effect
    for(let x=0; x<IQGameData.stageWidth; x++){
      // FIXME: Do not use 'new' for side effects
      new IQEffectPlate(true, IQGameData.stageLength - 1, x)
    }

    // shrink stage
    let group = this._model.renderGroupArray[0]
    let skins = this._model.skinArray
    let indices = group.indices
    for(let i=0; i<this.numFrontSkins; i++){
      skins[i].position.z -= 1.0
    }
    for(let i=0; i<this.numLineSkins; i++){
      skins.pop()
    }
    for(let i=0; i<this.numLineIndices; i++){
      indices.pop()
    }
    // FIXME
    group._indexDataCache = null

    // FIXME
    // vertex buffer
    const gl = IQGameData.canvasField._gl
    gl.bindBuffer(gl.ARRAY_BUFFER, this._model.vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, IQGameData.renderer.getVertexData(this._model), gl.DYNAMIC_DRAW)

    // index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, group.indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, group.getIndexData(this._model), gl.DYNAMIC_DRAW)


    // shrink floor
    group = this._floor._model.renderGroupArray[0]
    skins = this._floor._model.skinArray
    indices = group.indices
    for(let i=0; i<this.numFloorSkins; i++){
      skins.pop()
    }
    for(let i=0; i<this.numFloorIndices; i++){
      indices.pop()
    }
    // FIXME
    group._indexDataCache = null
    // FIXME
    // vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this._floor._model.vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, IQGameData.renderer.getVertexData(this._floor._model), gl.DYNAMIC_DRAW)

    // index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, group.indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, group.getIndexData(this._floor._model), gl.DYNAMIC_DRAW)


    this.length--
    IQGameData.stageLength--
    IQGameData.breakTopCubeX = IQGameData.stageWidth

    //IQGameData.breakStartTime = new Date()
    IQGameData.breakStartTime = new Date(IQGameData.nowTime.getTime())
    IQGameData.breaking = true
  }

  addOneLine() {
    let group = this._model.renderGroupArray[0]
    let skins = this._model.skinArray
    let indices = group.indices

    const leftNormal   = new Vector3(-1, 0, 0)
    const rightNormal  = new Vector3(1, 0, 0)
    const topNormal    = new Vector3(0, 1, 0)
    const bottomNormal = new Vector3(0, -1, 0)
    //const frontNormal  = new Vector3(0, 0, 1)

    const uvArr = this.getTextureUV(IQGameData.stage)
    const uv00 = uvArr[0]
    const uv01 = uvArr[1]
    const uv10 = uvArr[2]
    const uv11 = uvArr[3]

    let skinArray = []
    let s = null

    const z = this.length
    // left
    for(let y=0; y<this.height; y++){
      s = new Skin()
      s.position  = new Vector3(0, -y, z+1)
      s.normal    = leftNormal
      s.textureUV = uv00
      skinArray.push(s)

      s = new Skin()
      s.position  = new Vector3(0, -y, z)
      s.normal    = leftNormal
      s.textureUV = uv01
      skinArray.push(s)

      s = new Skin()
      s.position  = new Vector3(0, -y-1, z+1)
      s.normal    = leftNormal
      s.textureUV = uv10
      skinArray.push(s)

      s = new Skin()
      s.position  = new Vector3(0, -y-1, z)
      s.normal    = leftNormal
      s.textureUV = uv11
      skinArray.push(s)
    }

    // right
    for(let y=0; y<this.height; y++){
      s = new Skin()
      s.position  = new Vector3(this.width, -y, z+1)
      s.normal    = rightNormal
      s.textureUV = uv00
      skinArray.push(s)

      s = new Skin()
      s.position  = new Vector3(this.width, -y-1, z+1)
      s.normal    = rightNormal
      s.textureUV = uv01
      skinArray.push(s)

      s = new Skin()
      s.position  = new Vector3(this.width, -y, z)
      s.normal    = rightNormal
      s.textureUV = uv10
      skinArray.push(s)

      s = new Skin()
      s.position  = new Vector3(this.width, -y-1, z)
      s.normal    = rightNormal
      s.textureUV = uv11
      skinArray.push(s)
    }

    // top
    /*
    for(let x=0; x<this.width; x++){
      s = new Skin()
      s.position  = new Vector3(x, 0, z)
      s.normal    = topNormal
      s.textureUV = uv00
      skinArray.push(s)

      s = new Skin()
      s.position  = new Vector3(x, 0, z+1)
      s.normal    = topNormal
      s.textureUV = uv01
      skinArray.push(s)

      s = new Skin()
      s.position  = new Vector3(x+1, 0, z)
      s.normal    = topNormal
      s.textureUV = uv10
      skinArray.push(s)

      s = new Skin()
      s.position  = new Vector3(x+1, 0, z+1)
      s.normal    = topNormal
      s.textureUV = uv11
      skinArray.push(s)
    }
    */

    // bottom
    for(let x=0; x<this.width; x++){
      s = new Skin()
      s.position  = new Vector3(x+1, -this.height, z)
      s.normal    = bottomNormal
      s.textureUV = uv00
      skinArray.push(s)

      s = new Skin()
      s.position  = new Vector3(x+1, -this.height, z+1)
      s.normal    = bottomNormal
      s.textureUV = uv01
      skinArray.push(s)

      s = new Skin()
      s.position  = new Vector3(x, -this.height, z)
      s.normal    = bottomNormal
      s.textureUV = uv10
      skinArray.push(s)

      s = new Skin()
      s.position  = new Vector3(x, -this.height, z+1)
      s.normal    = bottomNormal
      s.textureUV = uv11
      skinArray.push(s)
    }

    let numSkins = skins.length
    // set bone
    skinArray.forEach( (skin) => {
      skin.boneIndex[0] = 0
      skin.boneIndex[1] = -1
      skin.boneIndex[2] = -1
      skin.boneIndex[3] = -1

      skin.skinWeight[0] = 1.0
      skin.skinWeight[1] = 0.0
      skin.skinWeight[2] = 0.0
      skin.skinWeight[3] = 0.0

      skins.push(skin)
    })

    // index
    for(let index=0; index<skinArray.length; index+=4){
      indices.push(numSkins + index + 0)
      indices.push(numSkins + index + 1)
      indices.push(numSkins + index + 2)
      indices.push(numSkins + index + 1)
      indices.push(numSkins + index + 2)
      indices.push(numSkins + index + 3)
    }
    // FIXME
    group._indexDataCache = null

    for(let i=0; i<this.numFrontSkins; i++){
      skins[i].position.z += 1.0
    }


    // FIXME
    // vertex buffer
    const gl = IQGameData.canvasField._gl
    gl.bindBuffer(gl.ARRAY_BUFFER, this._model.vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, IQGameData.renderer.getVertexData(this._model), gl.DYNAMIC_DRAW)

    // index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, group.indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, group.getIndexData(this._model), gl.DYNAMIC_DRAW)


    ////////////////////////////////////////////////////
    // floor
    group = this._floor._model.renderGroupArray[0]
    skins = this._floor._model.skinArray
    indices = group.indices
    skinArray = []
    for(let x=0; x<this.width; x++){
      s = new Skin()
      s.position  = new Vector3(x, 0, z)
      s.normal    = topNormal
      s.textureUV = uv00
      skinArray.push(s)

      s = new Skin()
      s.position  = new Vector3(x, 0, z+1)
      s.normal    = topNormal
      s.textureUV = uv01
      skinArray.push(s)

      s = new Skin()
      s.position  = new Vector3(x+1, 0, z)
      s.normal    = topNormal
      s.textureUV = uv10
      skinArray.push(s)

      s = new Skin()
      s.position  = new Vector3(x+1, 0, z+1)
      s.normal    = topNormal
      s.textureUV = uv11
      skinArray.push(s)
    }

    numSkins = skins.length
    // set bone
    skinArray.forEach( (skin) => {
      skin.boneIndex[0] = 0
      skin.boneIndex[1] = -1
      skin.boneIndex[2] = -1
      skin.boneIndex[3] = -1

      skin.skinWeight[0] = 1.0
      skin.skinWeight[1] = 0.0
      skin.skinWeight[2] = 0.0
      skin.skinWeight[3] = 0.0

      skins.push(skin)
    })

    // index
    for(let index=0; index<skinArray.length; index+=4){
      indices.push(numSkins + index + 0)
      indices.push(numSkins + index + 1)
      indices.push(numSkins + index + 2)
      indices.push(numSkins + index + 1)
      indices.push(numSkins + index + 2)
      indices.push(numSkins + index + 3)
    }
    // FIXME
    group._indexDataCache = null

    // vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this._floor._model.vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, IQGameData.renderer.getVertexData(this._floor._model), gl.DYNAMIC_DRAW)

    // index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, group.indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, group.getIndexData(this._floor._model), gl.DYNAMIC_DRAW)


    this.length++
    IQGameData.stageLength++
  }

  createOneLine() {
    const baseModel = IQCube.model_n
    const line = new DH3DObject()
    const m = new Model()

    line._model = m

    m.renderer = IQGameData.renderer
    m.hashName = 'IQLine'

    const rightNormal  = new Vector3(1, 0, 0)
    const leftNormal   = new Vector3(-1, 0, 0)
    const topNormal    = new Vector3(0, 1, 0)
    const bottomNormal = new Vector3(0, -1, 0)
    const frontNormal  = new Vector3(0, 0, 1)
    //const backNormal   = new Vector3(0, 0, -1)

    const uvArr = this.getTextureUV(IQGameData.stage)
    const uv00 = uvArr[0]
    const uv01 = uvArr[1]
    const uv10 = uvArr[2]
    const uv11 = uvArr[3]

    const skinArray = []
    let s = null

    // front
    for(let x=0; x<this.width; x++){
      for(let y=0; y<this.height; y++){
        s = new Skin()
        s.position  = new Vector3(x+1, -y, 1)
        s.normal    = frontNormal
        s.textureUV = uv00
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(x, -y, 1)
        s.normal    = frontNormal
        s.textureUV = uv01
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(x+1, -y-1, 1)
        s.normal    = frontNormal
        s.textureUV = uv10
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(x, -y-1, 1)
        s.normal    = frontNormal
        s.textureUV = uv11
        skinArray.push(s)
      }
    }

    // left
    for(let y=0; y<this.height; y++){
      s = new Skin()
      s.position  = new Vector3(0, -y, 1)
      s.normal    = leftNormal
      s.textureUV = uv00
      skinArray.push(s)

      s = new Skin()
      s.position  = new Vector3(0, -y, 0)
      s.normal    = leftNormal
      s.textureUV = uv01
      skinArray.push(s)

      s = new Skin()
      s.position  = new Vector3(0, -y-1, 1)
      s.normal    = leftNormal
      s.textureUV = uv10
      skinArray.push(s)

      s = new Skin()
      s.position  = new Vector3(0, -y-1, 0)
      s.normal    = leftNormal
      s.textureUV = uv11
      skinArray.push(s)
    }

    // right
    for(let y=0; y<this.height; y++){
      s = new Skin()
      s.position  = new Vector3(this.width, -y, 1)
      s.normal    = rightNormal
      s.textureUV = uv00
      skinArray.push(s)

      s = new Skin()
      s.position  = new Vector3(this.width, -y-1, 1)
      s.normal    = rightNormal
      s.textureUV = uv01
      skinArray.push(s)

      s = new Skin()
      s.position  = new Vector3(this.width, -y, 0)
      s.normal    = rightNormal
      s.textureUV = uv10
      skinArray.push(s)

      s = new Skin()
      s.position  = new Vector3(this.width, -y-1, 0)
      s.normal    = rightNormal
      s.textureUV = uv11
      skinArray.push(s)
    }

    // top
    for(let x=0; x<this.width; x++){
      s = new Skin()
      s.position  = new Vector3(x, 0, 0)
      s.normal    = topNormal
      s.textureUV = uv00
      skinArray.push(s)

      s = new Skin()
      s.position  = new Vector3(x, 0, 1)
      s.normal    = topNormal
      s.textureUV = uv01
      skinArray.push(s)

      s = new Skin()
      s.position  = new Vector3(x+1, 0, 0)
      s.normal    = topNormal
      s.textureUV = uv10
      skinArray.push(s)

      s = new Skin()
      s.position  = new Vector3(x+1, 0, 1)
      s.normal    = topNormal
      s.textureUV = uv11
      skinArray.push(s)
    }

    // bottom
    for(let x=0; x<this.width; x++){
      s = new Skin()
      s.position  = new Vector3(x+1, -this.height, 0)
      s.normal    = bottomNormal
      s.textureUV = uv00
      skinArray.push(s)

      s = new Skin()
      s.position  = new Vector3(x+1, -this.height, 1)
      s.normal    = bottomNormal
      s.textureUV = uv01
      skinArray.push(s)

      s = new Skin()
      s.position  = new Vector3(x, -this.height, 0)
      s.normal    = bottomNormal
      s.textureUV = uv10
      skinArray.push(s)

      s = new Skin()
      s.position  = new Vector3(x, -this.height, 1)
      s.normal    = bottomNormal
      s.textureUV = uv11
      skinArray.push(s)
    }

    // set bone
    skinArray.forEach( (skin) => {
      skin.boneIndex[0] = 0
      skin.boneIndex[1] = -1
      skin.boneIndex[2] = -1
      skin.boneIndex[3] = -1

      skin.skinWeight[0] = 1.0
      skin.skinWeight[1] = 0.0
      skin.skinWeight[2] = 0.0
      skin.skinWeight[3] = 0.0
    })

    m.skinArray = skinArray

    const baseBone = new Bone()
    const group = new RenderGroup()
    group.boneArray = []
    group.boneArray[0] = baseBone
    group.material = baseModel.renderGroupArray[0].material
    m.materialArray[0] = group.material

    m.renderGroupArray = [group]
    m.boneArray.push(baseBone)
    m.rootBone.addChild(baseBone)

    const arr = []
    for(let index=0; index<skinArray.length; index+=4){
      arr.push(index + 0)
      arr.push(index + 1)
      arr.push(index + 2)
      arr.push(index + 1)
      arr.push(index + 2)
      arr.push(index + 3)
    }
    m.indexArray = arr
    group.indices = arr

    // vertex buffer
    const gl = IQGameData.canvasField._gl
    m.vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, m.vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, IQGameData.renderer.getVertexData(m), gl.DYNAMIC_DRAW)

    // index buffer
    group.indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, group.indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, group.getIndexData(m), gl.DYNAMIC_DRAW)

    // set options
    line.setScale(IQGameData.cubeSize)
    line.setAnimating(false)
    line.setRenderer(IQGameData.renderer)
    line.setRotateAxis(IQGameData.yaxis, 0)

    const x = -0.5 * IQGameData.cubeSize * this.width
    const z = -0.5 * IQGameData.cubeSize
    line.setPosition(x, 0, z)

    return line
  }

  createWaitCube(length) {
    const baseModel = IQCube.model_n
    const waitCube = new DH3DObject()
    const m = new Model()

    waitCube._model = m

    m.renderer = IQGameData.renderer
    m.hashName = 'IQLine'

    const rightNormal  = new Vector3(1, 0, 0)
    const leftNormal   = new Vector3(-1, 0, 0)
    const topNormal    = new Vector3(0, 1, 0)
    //const bottomNormal = new Vector3(0, -1, 0)
    const frontNormal  = new Vector3(0, 0, 1)
    //const backNormal   = new Vector3(0, 0, -1)

    const uvArr = this.getTextureUV(IQGameData.stage)
    const uv00 = uvArr[0]
    const uv01 = uvArr[1]
    const uv10 = uvArr[2]
    const uv11 = uvArr[3]

    const skinArray = []
    let s = null

    // front
    for(let x=0; x<this.width; x++){
      for(let y=0; y<1; y++){
        s = new Skin()
        s.position  = new Vector3(x+1, -y, length)
        s.normal    = frontNormal
        s.textureUV = uv00
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(x, -y, length)
        s.normal    = frontNormal
        s.textureUV = uv01
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(x+1, -y-1, length)
        s.normal    = frontNormal
        s.textureUV = uv10
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(x, -y-1, length)
        s.normal    = frontNormal
        s.textureUV = uv11
        skinArray.push(s)
      }
    }

    // left
    for(let y=0; y<1; y++){
      for(let z=0; z<length; z++){
        s = new Skin()
        s.position  = new Vector3(0, -y, z+1)
        s.normal    = leftNormal
        s.textureUV = uv00
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(0, -y, z)
        s.normal    = leftNormal
        s.textureUV = uv01
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(0, -y-1, z+1)
        s.normal    = leftNormal
        s.textureUV = uv10
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(0, -y-1, z)
        s.normal    = leftNormal
        s.textureUV = uv11
        skinArray.push(s)
      }
    }

    // right
    for(let y=0; y<1; y++){
      for(let z=0; z<length; z++){
        s = new Skin()
        s.position  = new Vector3(this.width, -y, z+1)
        s.normal    = rightNormal
        s.textureUV = uv00
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(this.width, -y-1, z+1)
        s.normal    = rightNormal
        s.textureUV = uv01
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(this.width, -y, z)
        s.normal    = rightNormal
        s.textureUV = uv10
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(this.width, -y-1, z)
        s.normal    = rightNormal
        s.textureUV = uv11
        skinArray.push(s)
      }
    }

    // top
    for(let z=0; z<length; z++){
      for(let x=0; x<this.width; x++){
        s = new Skin()
        s.position  = new Vector3(x, 0, z)
        s.normal    = topNormal
        s.textureUV = uv00
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(x, 0, z+1)
        s.normal    = topNormal
        s.textureUV = uv01
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(x+1, 0, z)
        s.normal    = topNormal
        s.textureUV = uv10
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(x+1, 0, z+1)
        s.normal    = topNormal
        s.textureUV = uv11
        skinArray.push(s)
      }
    }

    // set bone
    skinArray.forEach( (skin) => {
      skin.boneIndex[0] = 0
      skin.boneIndex[1] = -1
      skin.boneIndex[2] = -1
      skin.boneIndex[3] = -1

      skin.skinWeight[0] = 1.0
      skin.skinWeight[1] = 0.0
      skin.skinWeight[2] = 0.0
      skin.skinWeight[3] = 0.0
    })

    m.skinArray = skinArray

    const baseBone = new Bone()
    const group = new RenderGroup()
    group.boneArray = []
    group.boneArray[0] = baseBone
    group.material = baseModel.renderGroupArray[0].material
    m.materialArray[0] = group.material

    m.renderGroupArray = [group]
    m.boneArray.push(baseBone)
    m.rootBone.addChild(baseBone)

    const arr = []
    for(let index=0; index<skinArray.length; index+=4){
      arr.push(index + 0)
      arr.push(index + 1)
      arr.push(index + 2)
      arr.push(index + 1)
      arr.push(index + 2)
      arr.push(index + 3)
    }
    m.indexArray = arr
    group.indices = arr

    // vertex buffer
    const gl = IQGameData.canvasField._gl
    m.vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, m.vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, IQGameData.renderer.getVertexData(m), gl.DYNAMIC_DRAW)

    // index buffer
    group.indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, group.indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, group.getIndexData(m), gl.DYNAMIC_DRAW)

    // set options
    waitCube.setScale(IQGameData.cubeSize)
    waitCube.setAnimating(false)
    waitCube.setRenderer(IQGameData.renderer)
    waitCube.setRotateAxis(IQGameData.yaxis, 0)

    const x = -0.5 * IQGameData.cubeSize * this.width
    const y = IQGameData.cubeSize
    const z = -0.5 * IQGameData.cubeSize
    waitCube.setPosition(x, y, z)

    this._waitCube = waitCube

    return waitCube
  }

  getTextureUV() {
    const arr = []
    const x0 = 0
    const x1 = 1
    const y0 = 0
    const y1 = 1

    arr[0] = new TextureUV(x0, y0)
    arr[1] = new TextureUV(x0, y1)
    arr[2] = new TextureUV(x1, y0)
    arr[3] = new TextureUV(x1, y1)

    return arr
  }
}

IQStage.setup = () => { /* nothing to do */ }

