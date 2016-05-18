'use strict'

import Bone from '../../modules/DH3DLibrary/src/js/base/Bone'
import DH2DObject from '../../modules/DH3DLibrary/src/js/base/DH2DObject'
import DH3DObject from '../../modules/DH3DLibrary/src/js/base/DH3DObject'
import Vector3 from '../../modules/DH3DLibrary/src/js/base/Vector3'
import Vector4 from '../../modules/DH3DLibrary/src/js/base/Vector4'
import Material from '../../modules/DH3DLibrary/src/js/base/Material'
import Model from '../../modules/DH3DLibrary/src/js/base/Model'
import ModelBank from '../../modules/DH3DLibrary/src/js/base/ModelBank'
import RenderGroup from '../../modules/DH3DLibrary/src/js/base/RenderGroup'
import Skin from '../../modules/DH3DLibrary/src/js/base/Skin'
import TextureBank from '../../modules/DH3DLibrary/src/js/base/TextureBank'
import TextureUV from '../../modules/DH3DLibrary/src/js/base/TextureUV'
import IQPlayer from './IQPlayer'
import IQGameData from './IQGameData'

/**
 * IQMenu class
 * @access public
 */
export default class IQMenu extends DH2DObject {
  /**
   * constructor
   * @access public
   * @constructor
   * @param {string} menu -
   */
  constructor(menu) {
    super()

    this._gameData = null
    this._menu = 0
    this._cursor = 0
    this._subCursor = 0
    this._subSubCursor = 0
    
    this._upTileZ = -40

    // folding
    this._folding = false
    this._foldingTime = null
    this._foldingTiles = null

    // moveTopLeft
    this._moveTopLeft = false
    this._moveTopLeftTime = null
    this._cubeSrcX = 0
    this._cubeSrcY = 0
    this._cubeDstX = 0
    this._cubeDstY = 0

    // expanding
    this._expanding = false
    this._expandingTime = null
    this._expandingSrcRot = 0
    this._expandingDstRot = 0
    this._expandingStartTime = 0
    this._expandingRotFinished = false
    this._expandingSrcTileX = 0
    this._expandingSrcTileY = 0

    // show sub menu
    this._showSubMenu = false
    this._showSubMenuReady = false
    this._showSubMenuTime = null

    // sub menu
    this._subMenuSX = 100
    this._subMenuSY = 130
    this._subMenuDY = 30
    this._moveSubMenuTime = null

    // sub menu = SCORE
    this._scoreSubMenus = [
      'Character', 'Level', '', '', '', '', 'return'
    ]
    this._scoreSubMenuEnable = [true, true, false, false, false, false, true]
    this._subScoreCharacter = ''
    this._subScoreLevel = ''

    // sub menu = OPTION
    /*
    this._optionSubMenus = $A([
      'Level'
      'Character'
      'KeyConfig'
      'SoundVolume'
      'Language'
      ''
      'return'
    ])
    this._optionSubMenuEnable = $A([true, true, true, true, true, false, true])
    */
    this._optionSubMenus = [
      'Level',
      'Character',
      'Volume',
      'Language',
      '',
      '',
      'return'
    ]
    this._optionSubMenuEnable = [true, true, true, true, false, false, true]

    // sub menu = SHARE
    /*
    this._shareSubMenus = $A([
      'Twitter'
      'Facebook'
      'Google+'
      'mixi'
      ''
      'return'
    ])
    this._shareSubMenuEnable = $A([true, true, true, true, false, true])
    */
    this._shareSubMenus = [
      'Twitter',
      'Facebook',
      '',
      '',
      '',
      'return'
    ]
    this._shareSubMenuEnable = [true, true, false, false, false, true]

    // moving
    this._moving = false
    this._srcCursor = 0
    this._srcX = 0
    this._srcY = 0
    this._dstCursor = 0
    this._dstX = 0
    this._dstY = 0


    this._cubeScale = 20.0
    this._opMovie = null
    //this._opMovieURL = '../movie/iq_cm.webm'
    //this._opMovieURL = '../movie/miracle_paint.mp4'
    this._opMovieMP4URL = './movie/iq_opening.mp4'
    this._opMovieWebMURL = './movie/iq_opening.webm'

    //               0         1         2         3
    //               01234567890123456789012345678901234567
    this._opStrs =  'SCOPEA*AT*OP*A*NRE*HREXITARTIOULESC*TR'
    this._opChars = ' ACEHILNOPRSTUX'
    this._opTileWidth = 16
    this._opTileHeight = 13
    this._opTileScale = 20
    this._opTiles = null
    this._opTileObj = null
    this._opMenus = new Map([
      [0, 'START'],
      [1, 'OPTION'],
      [2, 'SCORE'],
      [3, 'RULES'],
      [4, 'CREATE'],
      [5, 'SHARE'],
      [6, 'EXTRA'],
      [7, 'EXIT']
    ])
    this._opPosX = [100, 150, 110, 140, 130, 100, 160, 160, 220]
    this._opPosY = [190, 190, 160, 130, 100,  90,  70,  90,  90]
    this._opActiveTiles = [
      [ [3, 8], [3, 9], [ 4, 9], [ 5, 9], [ 6, 9], [ 5, 10],
        [9, 3], [9, 4], [10, 4], [11, 4], [12, 4], [11,  5] ],
      [ [5, 8], [6, 8], [ 6, 9], [ 7, 9], [ 8, 9], [ 8, 10] ],
      [ [3, 8], [4, 8], [ 5, 8], [ 5, 7], [ 6, 7], [ 7,  7] ],
      [ [5, 7], [5, 6], [ 6, 6], [ 7, 6], [ 8, 6], [ 5,  5] ],
      [ [5, 3], [5, 4], [ 6, 4], [ 6, 5], [ 7, 5], [ 7,  6] ],
      [ [4, 3], [4, 4], [ 4, 5], [ 5, 4], [ 6, 4], [ 3,  4] ],
      [ [6, 4], [7, 4], [ 7, 3], [ 8, 3], [ 8, 2], [ 9,  2] ],
      [ [6, 4], [7, 4], [ 8, 4], [ 9, 4], [ 6, 3], [ 8,  5],
        [0, 9], [1, 9], [ 2, 9], [ 3, 9], [ 0, 8], [ 2, 10] ]
    ]
    this._opActiveTileObjArray = []
    this._opStayTiles = []
    this._opUpTiles = []
    this._opDownTiles = []
    this._opMenuEnable = [true, true, true, false, false, true, false, true, true]

    this._opSubMenus = null
    this._opSubMenuEnable = []
    this._opSubSubMenus = null
    this._opSubSubMenuEnable = []

    this._tileSize = 64

    this._fadeTileObj = null

    this.initOpeningMovie()
    this.initMenuTile()
    this.initMenuParams()
    if(!menu)
      menu = 'opening'

    this.initMenuPlayerObj()

    this.setMenu(menu)
  }

  initOpeningMovie() {
    const mov = document.createElement('video')
    document.body.appendChild(mov)
    mov.setAttribute('style', 'display:none')

    const obj = this
    this._opMovie = mov
    mov.addEventListener('canplaythrough', () => { obj.movieLoadedCallback() }, false)
    if(navigator.userAgent.match(/Chrome/)){
      if(mov.canPlayType('video/webm')){
        mov.setAttribute('src', this._opMovieWebMURL)
      }else if(mov.canPlayType('video/mp4')){
        mov.setAttribute('src', this._opMovieMP4URL)
      }else{
        console.error("error: car't play movie")
      }
    }else{
      if(mov.canPlayType('video/mp4')){
        mov.setAttribute('src', this._opMovieMP4URL)
      }else if(mov.canPlayType('video/webm')){
        mov.setAttribute('src', this._opMovieWebMURL)
      }else{
        console.error("error: car't play movie")
      }
    }
  }

  movieLoadedCallback() {
    this._opMovie.play()
  }

  initMenuTile() {
    // init opTiles
    let arr = []
    let index = 33
    const step = 24
    for(let i=0; i<this._opTileHeight; i++){
      arr[i] = index
      index = (index + step) % this._opStrs.length
    }
    this._opTiles = arr

    // craete opTileTexture
    const canvas = document.createElement('canvas')
    const tileSize = this._tileSize
    const tileW = 16
    const tileH = 1
    const w = tileSize * tileW
    const h = tileSize * tileH
    canvas.width  = w
    canvas.height = h
    const c = canvas.getContext('2d')
    c.clearRect(0, 0, w, h)
    const img = IQMenu.bgImage
    let x = 0
    for(let i=0; i<tileW; i++){
      c.drawImage(img, 0, 0, img.width, img.height,
                       x, 0, tileSize,  tileSize)
      x += tileSize
    }
    c.clearRect((tileW - 1) * tileSize, 0, tileSize, tileSize)

    c.textAlign    = 'center'
    c.textBaseline = 'middle'
    c.font         = '48px bold ' + IQGameData.fontFamily
    c.fillStyle    = IQGameData.whiteColor
    c.strokeStyle  = IQGameData.blackColor
    x = tileSize * 0.5
    let y = h * 0.5
    for(let i=0; i<this._opChars.length; i++){
      const drawChar = this._opChars.charAt(i)
      c.fillText(drawChar, x, y)
      c.strokeText(drawChar, x, y)
      x += tileSize
    }

    this._opTileTexture = TextureBank.getTexture(canvas)

    // create opTileObj
    let obj = new DH3DObject()
    const m = new Model()
    obj._model = m

    m.renderer = IQGameData.renderer
    m.hashName = 'IQTopMenu'

    //var normal    = new Vector3(0, 0, 1)
    const normal    = new Vector3(0, 0, -1)
    const uvTopLeftArr = []
    const uvBottomLeftArr = []
    const uvTopRightArr = []
    const uvBottomRightArr = []
    for(let i=0; i<=tileW; i++){
      uvTopLeftArr[i]     = new TextureUV(i / tileW + 0.001, 0)
      uvBottomLeftArr[i]  = new TextureUV(i / tileW + 0.001, 1)
      uvTopRightArr[i]    = new TextureUV((i+1) / tileW - 0.001, 0)
      uvBottomRightArr[i] = new TextureUV((i+1) / tileW - 0.001, 1)
    }
    const skinArray = []

    const movableTiles = []
    for(let i=0; i<this._opTileHeight; i++){
      movableTiles[i] = []
      for(let j=0; j<this._opTileWidth; j++){
        movableTiles[i][j] = false
      }
    }
    this._opActiveTiles.forEach( (menu) => {
      menu.forEach( (pos) => {
        movableTiles[pos[1]][pos[0]] = true
      })
    })

    for(y=0; y<this._opTileHeight; y++){
      index = this._opTiles[y]
      for(x=0; x<this._opTileWidth; x++){
        let num = 0
        if(movableTiles[y][x]){
          num = tileW - 1
        }else{
          let drawChar = this._opStrs.charAt(index)
          num = this._opChars.indexOf(drawChar)
          if(num < 0){
            num = 0
            drawChar = this._opChars.charAt(num)
          }
        }

        let s = new Skin()
        s.position  = new Vector3(x, y, 0)
        s.normal    = normal
        s.textureUV = uvTopLeftArr[num]
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(x, y+1, 0)
        s.normal    = normal
        s.textureUV = uvBottomLeftArr[num]
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(x+1, y, 0)
        s.normal    = normal
        s.textureUV = uvTopRightArr[num]
        skinArray.push(s)

        s = new Skin()
        s.position  = new Vector3(x+1, y+1, 0)
        s.normal    = normal
        s.textureUV = uvBottomRightArr[num]
        skinArray.push(s)

        index = (index + 1) % this._opStrs.length
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

    const material = new Material()
    material.ambient  = new Vector4(0.80, 0.80, 0.80, 1.0)
    material.diffuse  = new Vector4(0.34, 0.34, 0.34, 1.0)
    material.specular = new Vector4(0.00, 0.00, 0.00, 1.0)
    material.shininess = 13.0
    material.emission = new Vector4(0, 0, 0, 0)
    material.toonIndex = 0
    material.edge = 0
    material.texture = this._opTileTexture

    group.material = material
    m.materialArray[0] = material

    m.renderGroupArray = [group]
    m.boneArray.push(baseBone)
    m.rootBone.addChild(baseBone)

    arr = []
    for(index=0; index<skinArray.length; index+=4){
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

    obj.setScale(this._cubeScale)
    obj.setAnimating(false)
    obj.setRenderer(IQGameData.renderer)
    obj.setRotateAxis(IQGameData.zaxis, 0)
    obj.setPosition(0, 0, 0)
    this._opTileObj = obj

    this._opActiveTileObjArray = []
    for(let i=0; i<this._opTileHeight; i++){
      this._opActiveTileObjArray[i] = []
    }
    arr = this._opActiveTileObjArray

    obj = this
    this._opActiveTiles.forEach( (menu) => {
      menu.forEach( (pos) => {
        x = pos[0]
        y = pos[1]

        let tile = arr[y][x]
        if(tile)
          return

        tile = obj._createOneTile(x, y)
        arr[y][x] = tile
      })
    })

    // create fadeTileObj
    this._fadeTileObj = this._createFadeTile()

    this.addTilesToCanvas()
  }

  _createOneTile(x, y) {
    const obj = new DH3DObject()
    const m = new Model()
    obj._model = m

    const tileChar = this._opStrs.charAt((this._opTiles[y] + x) % this._opStrs.length)
    let index = this._opChars.indexOf(tileChar)
    if(index < 0){
      index = 0
    }
    const tileW = 16
    const uvTop    = 0
    const uvBottom = 1
    const uvLeft   = index / tileW
    const uvRight  = (index + 1) / tileW

    m.renderer = IQGameData.renderer
    m.hashName = 'IQMenuTile'

    //var normal = new Vector3(0, 0, 1)
    const normal = new Vector3(0, 0, -1)
    const skinArray = []
    let s

    // top-left
    s = new Skin()
    s.position  = new Vector3(-0.5, -0.5, 0)
    s.normal    = normal
    s.textureUV = new TextureUV(uvLeft, uvTop)
    skinArray.push(s)

    // bottom-left
    s = new Skin()
    s.position  = new Vector3(-0.5, 0.5, 0)
    s.normal    = normal
    s.textureUV = new TextureUV(uvLeft, uvBottom)
    skinArray.push(s)

    // top-right
    s = new Skin()
    s.position  = new Vector3(0.5, -0.5, 0)
    s.normal    = normal
    s.textureUV = new TextureUV(uvRight, uvTop)
    skinArray.push(s)

    // bottom-right
    s = new Skin()
    s.position  = new Vector3(0.5, 0.5, 0)
    s.normal    = normal
    s.textureUV = new TextureUV(uvRight, uvBottom)
    skinArray.push(s)

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

    const material = new Material()
    material.ambient  = new Vector4(0.80, 0.80, 0.80, 1.0)
    material.diffuse  = new Vector4(0.34, 0.34, 0.34, 1.0)
    material.specular = new Vector4(0.00, 0.00, 0.00, 1.0)
    material.shininess = 13.0
    material.emission = new Vector4(0, 0, 0, 0)
    material.toonIndex = 0
    material.edge = 0
    material.texture = this._opTileTexture

    group.material = material
    m.materialArray[0] = material

    m.renderGroupArray = [group]
    m.boneArray.push(baseBone)
    m.rootBone.addChild(baseBone)

    const arr = [0, 1, 2, 1, 2, 3]
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

/*
    const scale = this._opTileScale
    const posX = (x + 0.5) * scale
    const posY = (y + 0.5) * scale
    obj.setScale(scale)
    obj.setAnimating(false)
    obj.setRenderer(IQGameData.renderer)
    obj.setRotateAxis(IQGameData.zaxis, 0)
    obj.setPosition(posX, posY, 0)
    */
    obj.setAnimating(false)
    obj.setRenderer(IQGameData.renderer)

    obj._tileX = x
    obj._tileY = y

    return obj
  }

  _createFadeTile() {
    const obj = new DH3DObject()
    const m = new Model()
    obj._model = m

    m.renderer = IQGameData.renderer
    m.hashName = 'IQMenuFadeTile'

    //var normal = new Vector3(0, 0, 1)
    const normal = new Vector3(0, 0, -1)
    const skinArray = []
    let s
    const dummyUV = new TextureUV(0, 0)

    // top-left
    s = new Skin()
    s.position  = new Vector3(-0.5, -0.5, 0)
    s.normal    = normal
    s.textureUV = dummyUV
    skinArray.push(s)

    // bottom-left
    s = new Skin()
    s.position  = new Vector3(-0.5, 0.5, 0)
    s.normal    = normal
    s.textureUV = dummyUV
    skinArray.push(s)

    // top-right
    s = new Skin()
    s.position  = new Vector3(0.5, -0.5, 0)
    s.normal    = normal
    s.textureUV = dummyUV
    skinArray.push(s)

    // bottom-right
    s = new Skin()
    s.position  = new Vector3(0.5, 0.5, 0)
    s.normal    = normal
    s.textureUV = dummyUV
    skinArray.push(s)

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

    const material = new Material()
    const blackColor = new Vector4(0.00, 0.00, 0.00, 1.0)
    material.ambient  = blackColor
    material.diffuse  = blackColor
    material.specular = blackColor
    material.shininess = 1.0
    material.emission = blackColor
    material.toonIndex = 0
    material.edge = 0
    material.texture = null

    group.material = material
    m.materialArray[0] = material

    m.renderGroupArray = [group]
    m.boneArray.push(baseBone)
    m.rootBone.addChild(baseBone)

    const arr = [0, 1, 2, 1, 2, 3]
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

    obj.setAnimating(false)
    obj.setRenderer(IQGameData.renderer)
    obj.setScale(300)

    return obj
  }
  
  showFadeTile() {
    const x = IQGameData.camera.position.x
    const y = IQGameData.camera.position.y
    const z = -10.0
    this._fadeTileObj.setPosition(x, y, z)
    this.setFadeTileAlpha(0)

    IQGameData.canvasField.addObject(this._fadeTileObj, true)
  }
  hideFadeTile() {
    IQGameData.canvasField.removeObject(this._fadeTileObj)
  }
  setFadeTileAlpha(alpha) {
    const material = this._fadeTileObj._model.materialArray[0]
    /*
    material.ambient.w = alpha
    material.diffuse.w = alpha
    material.specular.w = alpha
    material.emission.w = alpha
    */
    material.alpha = alpha

    //this._fadeTileObj.updateMaterial()
  }
  removeWithoutMenuCube() {
    const cf = IQGameData.canvasField

    cf.removeObject(this._opTileObj)

    const arr = this._opActiveTileObjArray
    arr.forEach( (arry) => {
      arry.forEach( (tile) => {
        if(tile && !tile._marked){
          cf.removeObject(tile)
        }
      })
    })
    this.hideFadeTile()
  }

  initMenuParams() {
    // init flags
    this._folding = false
    this._moveTopLeft = false
    this._expanding = false
    this._expandingRotFinished = false
    this._showSubMenu = false
    this._showSubMenuReady = false
    this._moving = false

    // FIXME
    IQGameData.menuNext = false
    IQGameData.selectedMenu = null

    // set tiles position
    const scale = this._opTileScale

    const arr = this._opActiveTileObjArray
    arr.forEach( (arry) => {
      arry.forEach( (tile) => {
        if(tile){
          const posX = (tile._tileX + 0.5) * scale
          const posY = (tile._tileY + 0.5) * scale
          tile.setScale(scale)
          tile.setRotateAxis(IQGameData.zaxis, 0)
          tile.setPosition(posX, posY, 0)
          tile._marked = false

          // FIXME
          const rootBone = tile._model.rootBone
          const tileBone = rootBone.childBoneArray[0]
          const childBones = tileBone.childBoneArray
          childBones.forEach( (bone) => {
            bone.childBoneArray.length = 0
            tileBone.removeChild(bone)
          })
          rootBone.parentBone = null

          tileBone.offset.z = 0
        }
      })
    })
  }

  initMenuPlayerObj() {
    const player = new IQPlayer()
    IQGameData.menuPlayerObj = player
  }

  setupMenuPlayerObj() {
    // camera
    /*
    g.camera.bind(null)
    g.camera.setBindOffset(0, 15.0, 0)
    g.camera.perspective(45.0, g.canvasWidth / g.canvasHeight, g.cameraNear, g.cameraFar)
    g.camera.projMat.translate(g.camera.projMat, 0, 0, 0)
    g.camera.distance = 250.0
    g.cameraYAngleGoal = g.cameraYAngle = Math.PI
    g.cameraXAngleGoal = g.cameraXAngle = -0.9
    g.canvasField.setCamera(g.camera)
    */

    // renderer
    //g.renderer.setClearColor(0,0,0,1)

    // light
    //g.light.setPosition(30, 70, -100)
    /*
    g.light.setPosition(-50, 0, -100)
    g.light.setAmbient(0.6, 0.6, 0.6, 0.0)
    g.light.setDiffuse(0.7, 0.7, 0.7, 0.0)
    g.light.setSpecular(0.9, 0.9, 0.9, 0.0)
    g.renderer.setLight(g.light)
    */

    // player
    if(IQGameData.character == 'Miku'){
      IQGameData.menuPlayerObj.setModel(IQGameData.model_miku)
    }
    IQGameData.menuPlayerObj.setMotion(IQGameData.running)
    //g.menuPlayerObj.setAnimationTime(0)
    //g.menuPlayerObj.setState('running')
    IQGameData.menuPlayerObj.setAnimator(IQGameData.animator)
    IQGameData.menuPlayerObj.setAnimating(true)
    IQGameData.menuPlayerObj.setLoop(true)
    //g.menuPlayerObj.setMaxSpeed(100)
    IQGameData.menuPlayerObj.setRenderer(IQGameData.renderer)
    IQGameData.menuPlayerObj.setRotateAxis(IQGameData.xaxis, Math.PI)
    IQGameData.menuPlayerObj.setAutoDirection(false)
    IQGameData.menuPlayerObj.setPosition(170, 200, -80)
    IQGameData.canvasField.addObject(IQGameData.menuPlayerObj)
  }

  addTilesToCanvas() {
    const arr = this._opActiveTileObjArray
    arr.forEach( (arry) => {
      arry.forEach( (tile) => {
        if(tile){
          IQGameData.canvasField.addObject(tile)
        }
      })
    })
  }

  getMenuTiles(index) {
    const arr = this._opActiveTiles[index]
    // DEBUG
    //IQGameData.hoge = arr
    const tiles = []
    const obj = this
    arr.forEach( (pos) => {
      tiles.push( obj._opActiveTileObjArray[pos[1]][pos[0]] )
    })
    return tiles
  }

  setMenu(menu){
    this._menu = menu
    if(this._opMovie && menu != 'opening'){
      this._opMovie.pause()
    }
    this._cursor = 0
    this._moving = false

    // FIXME
    const g = IQGameData
    IQGameData.camera.perspective(45.0, IQGameData.canvasWidth / IQGameData.canvasHeight, IQGameData.cameraNear, IQGameData.cameraFar)
  }

  getOptionName() {
    let c = this._cursor
    if(c == this._opMenus.size)
      c = 0

    return this._opMenus.get(c)
  }

  getSubOptionName() {
    const c = this._subCursor
    return this._opSubMenus[c]
  }

  setSubMenu() {
    const opMenuName = this.getOptionName()
    switch(opMenuName){
      case 'SCORE':
        this._opSubMenus = this._scoreSubMenus
        this._opSubMenuEnable = this._scoreSubMenuEnable
        break
      case 'OPTION':
        this._opSubMenus = this._optionSubMenus
        this._opSubMenuEnable = this._optionSubMenuEnable
        break
      case 'SHARE':
        this._opSubMenus = this._shareSubMenus
        this._opSubMenuEnable = this._shareSubMenuEnable
        break
    }
  }

  subCursorInit() {
    let c = 0
    while(!this._opSubMenuEnable[c]){
      c++
    }
    this._subCursor = c

    const name = this.getOptionName()
    if(name == 'OPTION'){
      IQGameData.menu._opSubSubMenus = IQGameData.levelList
      IQGameData.menu._opSubSubMenuEnable = IQGameData.levelListEnable
      IQGameData.menu._subSubCursor = IQGameData.levelList.indexOf(IQGameData.level)
    }else if(name == 'SCORE'){
      IQGameData.menu._opSubSubMenus = IQGameData.characterList
      IQGameData.menu._opSubSubMenuEnable = IQGameData.characterListEnable
      IQGameData.menu._subSubCursor = IQGameData.levelList.indexOf(IQGameData.character)

      IQGameData.menu._subScoreCharacter = IQGameData.character
      IQGameData.menu._subScoreLevel = IQGameData.level
    }
  }

  render() {
    const c = IQGameData.canvasField.get2DContext()

    if(this._menu == 'opening'){
      // opening movie
      c.drawImage(this._opMovie, 0, 0)
    }else if(this._menu == 'top'){
      // FIXME: showMenuLoopからこっちに移動する？
      // setup context

      if(IQGameData.menu._showSubMenu){
        const menuDiffTime = IQGameData.nowTime - IQGameData.menu._showSubMenuTime
        const opName = IQGameData.menu.getOptionName()

        c.textAlign    = 'left'
        c.textBaseline = 'middle'
        c.font         = '24px bold ' + IQGameData.fontFamily
        c.fillStyle    = IQGameData.whiteColor
        c.strokeStyle  = IQGameData.blackColor

        const sx = this._subMenuSX
        const sy = this._subMenuSY
        const dy = this._subMenuDY
        if(menuDiffTime < IQGameData.showSubMenuTimeMax){
          let s = 0
          const t = 2.0 * menuDiffTime / IQGameData.showSubMenuTimeMax
          if(t < 1){
            s = 0.5 * t * t
          }else{
            s = -0.5 * (t * (t - 4) + 2)
          }

          if(opName == 'OPTION'){
            const params = []
            /*
            params[0] = IQGameData.level
            params[1] = IQGameData.character
            params[2] = ''
            params[3] = Math.floor(IQGameData.soundVolume * 100)
            params[4] = IQGameData.languageNameList.get(IQGameData.language)
            */
            params[0] = IQGameData.level
            params[1] = IQGameData.character
            params[2] = Math.floor(IQGameData.soundVolume * 100)
            params[3] = IQGameData.languageNameList.get(IQGameData.language)

            const x = sx + 200
            let y = sy
            for(let i=0; i<params.length; i++){
              c.fillText(params[i], x, y)
              y += dy * s
            }
          }else if(opName == 'SCORE'){
            // alpha値を変える？
            /*
            const headX = sx
            const headY = sy
            const x1 = sx +  50
            const x2 = sx + 200
            const x3 = sx + 350
            const x4 = sx + 500
            const y1 = sy +  50 * s
            const y2 = sy + 100 * s
            const y3 = sy + 150 * s
            const dx = 10

            c.font = '24px bold ' + IQGameData.fontFamily
            c.fillText('Best I.Q', headX, headY)
            c.fillText('Daily',  x1 + dx, y2)
            c.fillText('Weekly', x1 + dx, y3)

            c.fillText('WorldBest',    x2 + dx, y1)
            c.fillText('PersonalBest', x3 + dx, y1)

            c.textAlign = 'right'
            c.fillText(IQGameData.worldDailyBest,     x3 - dx, y2)
            c.fillText(IQGameData.worldWeeklyBest,    x3 - dx, y3)
            c.fillText(IQGameData.personalDailyBest,  x4 - dx, y2)
            c.fillText(g.personalWeeklyBest, x4 - dx, y3)

            c.textAlign    = 'left'
            */
          }else if(opName == 'RULES'){
            /* TODO: implement */
          }else if(opName == 'SHARE'){
            /* TODO: implement */
          }

          const x = sx
          let y = sy
          for(let i=0; i<this._opSubMenus.length; i++){
            c.fillText(this._opSubMenus[i], x, y)
            y += dy * s
          }

        }else{
          if(!this._showSubMenuReady){
            this._showSubMenuReady = true
          }

          if(opName == 'OPTION'){
            const params = []
            /*
            params[0] = g.level
            params[1] = g.character
            params[2] = ''
            params[3] = Math.floor(g.soundVolume * 100)
            params[4] = g.languageNameList.get(g.language)
            */
            params[0] = IQGameData.level
            params[1] = IQGameData.character
            params[2] = Math.floor(IQGameData.soundVolume * 100)
            params[3] = IQGameData.languageNameList.get(IQGameData.language)

            const x = sx + 200
            let y = sy
            for(let i=0; i<params.length; i++){
              c.fillText(params[i], x, y)
              y += dy
            }
          }else if(opName == 'SCORE'){
            const headX = sx
            const headY = sy

            const x1 = sx + 180
            const x2 = sx + 280
            const x3 = sx + 390
            const x4 = sx + 500
            const xpad = 40

            const y1 = sy +  80
            const y2 = sy + 110
            const y3 = sy + 140

            // line
            const lx1 = x1 - 5
            const lx2 = x2
            const lx3 = x3
            const lx4 = x4 + 5
            const ly1 = y1 - 15
            const ly2 = y1 + 15
            const ly3 = y2 + 15
            const ly4 = y3 + 15
            c.strokeStyle  = IQGameData.whiteColor
            c.strokeRect(lx1, ly1, (lx4 - lx1), (ly4 - ly1))
            c.strokeRect(lx1, ly2, (lx4 - lx1),           0)
            c.strokeRect(lx1, ly3, (lx4 - lx1),           0)
            c.strokeRect(lx2, ly1,           0, (ly4 - ly1))
            c.strokeRect(lx3, ly1,           0, (ly4 - ly1))

            // string
            c.font = '24px bold ' + IQGameData.fontFamily

            const scoreCharacter = this._subScoreCharacter
            const scoreLevel = this._subScoreLevel
            c.fillText(scoreCharacter, x1, sy     )
            c.fillText(scoreLevel,     x1, sy + 30)

            c.fillText('Best I.Q', x1, y1)
            c.fillText('Daily',    x1, y2)
            c.fillText('Weekly',   x1, y3)

            c.textAlign = 'center'
            c.fillText('World',    (x2 + x3) / 2, y1)
            c.fillText('Personal', (x3 + x4) / 2, y1)

            c.textAlign = 'right'
            //c.fillText(g.worldDailyBest,     x3 - dx, y2)
            //c.fillText(g.worldWeeklyBest,    x3 - dx, y3)
            //c.fillText(g.personalDailyBest,  x4 - dx, y2)
            //c.fillText(g.personalWeeklyBest, x4 - dx, y3)
            c.fillText(IQGameData.worldDailyBest[scoreCharacter][scoreLevel],     x3 - xpad, y2)
            c.fillText(IQGameData.worldWeeklyBest[scoreCharacter][scoreLevel],    x3 - xpad, y3)
            c.fillText(IQGameData.personalDailyBest[scoreCharacter][scoreLevel],  x4 - xpad, y2)
            c.fillText(IQGameData.personalWeeklyBest[scoreCharacter][scoreLevel], x4 - xpad, y3)

            c.textAlign    = 'left'
          }else if(opName == 'RULES'){
            /* TODO: implement */
          }else if(opName == 'SHARE'){
            /* TODO: implement */
          }

          let x = sx
          let y = sy
          for(let i=0; i<this._opSubMenus.length; i++){
            c.fillText(this._opSubMenus[i], x, y)
            y += dy
          }

          // drawCursor
          c.strokeStyle = IQGameData.redColor
          x = sx - 10
          const width = 170
          const height = dy
          if(IQGameData.menu._moving){
            const cursorDiffTime = IQGameData.nowTime - IQGameData.menu._moveSubMenuTime
            const maxTime = IQGameData.menuMoveTime
            let s = 0
            const t = 2.0 * cursorDiffTime / maxTime
            if(t < 1){
              s = 0.5 * t * t
            }else{
              s = -0.5 * (t * (t - 4) + 2)
            }
            y = s * this._dstY + (1 - s) * this._srcY
          }else{
            y = sy + dy * (this._subCursor - 0.5)
          }
          c.strokeRect(x, y, width, height)

        }
      }
    }else if(this._menu == 'continue'){
      // game over
      c.textAlign    = 'center'
      c.textBaseline = 'middle'
      c.font         = '24px bold sans-serif'
      c.fillStyle    = IQGameData.whiteColor
      c.strokeStyle  = IQGameData.whiteColor

      this.drawText('CONTINUE?', IQGameData.canvasWidth * 0.5, 50)

      c.textAlign    = 'center'
      c.font         = '20px bold sans-serif'
      const fy = 150
      const dy = 35
      let x = IQGameData.canvasWidth * 0.5
      let y = fy
      this.drawText('Tweet', x, y); y+= dy
      this.drawText('Yes',   x, y); y+= dy
      this.drawText('No',    x, y); y+= dy

      // drawCursor
      c.strokeStyle = IQGameData.redColor
      y = fy + dy * (this._cursor - 0.5)
      const width = 200
      const height = dy
      x = (IQGameData.canvasWidth - width) * 0.5
      c.strokeRect(x, y, width, height)
    }else if(this._menu == 'endtweet'){
      // game completed
      c.textAlign    = 'center'
      c.textBaseline = 'middle'
      c.font         = '24px bold sans-serif'
      c.fillStyle    = IQGameData.whiteColor
      c.strokeStyle  = IQGameData.whiteColor

      this.drawText('', IQGameData.canvasWidth * 0.5, 50)

      c.textAlign    = 'center'
      c.font         = '20px bold sans-serif'
      const fy = 150
      const dy = 35
      let x = IQGameData.canvasWidth * 0.5
      let y = fy
      this.drawText('Tweet',        x, y); y+= dy
      this.drawText('Back To Menu', x, y); y+= dy

      // drawCursor
      c.strokeStyle = IQGameData.redColor
      y = fy + dy * (this._cursor - 0.5)
      const width = 300
      const height = dy
      x = (IQGameData.canvasWidth - width) * 0.5
      c.strokeRect(x, y, width, height)
    }

  }

  drawText(str, x, y) {
    const c = IQGameData.canvasField.get2DContext()
    c.fillText(str, x, y)
    //c.strokeText(str, x, y)
  }
}

IQMenu.initialized = false
// FIXME
IQMenu.file_cube = 'x/cube_n.x'
IQMenu.file_bg = 'x/cube_tex_1n.bmp'

IQMenu.setup = () => {
  IQMenu.bgImage = new Image()
  var imgPromise = new Promise((resolve, reject) => {
    IQMenu.bgImage.addEventListener('load',  () => { resolve() })
    IQMenu.bgImage.addEventListener('error', (e) => { reject(e) })
  })
  IQMenu.bgImage.src = IQMenu.file_bg
  
  const promise = Promise.all([
    ModelBank.getModel(IQMenu.file_cube),
    imgPromise
  ])
  .catch((error) => {
    console.error(`IQMenu Cube model loading error: ${error}`)
  })
  .then((result) => {
    return Promise.all([
      ModelBank.getModelForRenderer(IQMenu.file_cube, IQGameData.renderer)
    ])
  })
  .catch((error) => {
    console.error(`IQMenu Cube model loading for renderer error: ${error}`)
  })
  .then((result) => {
    IQMenu.model_cube = result[0]
    IQMenu.initialized = true
  })

  return promise
}

