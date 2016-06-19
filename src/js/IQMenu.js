'use strict'

import {
  Bone,
  DH2DObject,
  DH3DObject,
  Vector3,
  Vector4,
  Material,
  Model,
  ModelBank,
  RenderGroup,
  Skin,
  TextureBank,
  TextureUV
} from '../../modules/DH3DLibrary/src/js/main'
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

    this._editCursorSX = 0
    this._editCursorSY = 0
    this._editCursorX = 0
    this._editCursorY = 0
    
    this._upTileZ = -40

    // main menu
    const triangleSize = 30
    const trianglePadding = 30
    this._leftButtonP1X = IQGameData.menuLeftButtonX + IQGameData.menuButtonWidth - trianglePadding - triangleSize
    this._leftButtonP1Y = IQGameData.canvasHeight * 0.5

    this._leftButtonP2X = this._leftButtonP1X + triangleSize
    this._leftButtonP2Y = this._leftButtonP1Y + triangleSize

    this._leftButtonP3X = this._leftButtonP2X
    this._leftButtonP3Y = this._leftButtonP1Y - triangleSize
    
    this._rightButtonP1X = IQGameData.menuRightButtonX + trianglePadding + triangleSize
    this._rightButtonP1Y = this._leftButtonP1Y

    this._rightButtonP2X = this._rightButtonP1X - triangleSize
    this._rightButtonP2Y = this._rightButtonP1Y - triangleSize

    this._rightButtonP3X = this._rightButtonP2X
    this._rightButtonP3Y = this._rightButtonP1Y + triangleSize

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

    this._topLeftDX = 55
    this._topLeftDY = 25
    this._topLeftDZ = 155
    this._topLeftTiltRot = Math.atan2(
      this._topLeftDY,
      Math.sqrt(this._topLeftDX * this._topLeftDX + this._topLeftDZ * this._topLeftDZ)
    )
    this._topLeftTiltAxis = new Vector3(this._topLeftDZ, 0, this._topLeftDX)
    this._topLeftTiltAxis.normalize()

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
    this._subMenuDX = 170
    this._subMenuDY = 30
    this._subMenuParamX = 275
    this._subMenuParamPadding = this._subMenuParamX - (this._subMenuSX + this._subMenuDX)
    this._moveSubMenuTime = null
    this._menuItem = []
    this._subMenuHoverFillStyle = 'rgba(255, 255, 255, 0.5)'
    this._subMenuHoverStrokeStyle = 'rgba(255, 0, 0, 1.0)'

    // sub menu = SCORE
    this._scoreSubMenus = [
      'Character', 'Level', '', '', '', '', 'return'
    ]
    this._scoreSubMenuEnable = [true, true, false, false, false, false, true]
    this._subScoreCharacter = ''
    this._subScoreLevel = ''

    // sub menu = OPTION
    this._optionSubMenus = [
      'Level',
      'Stage',
      'Character',
      'Volume',
      'Language',
      '',
      'return'
    ]
    this._optionSubMenuEnable = [true, true, true, true, true, false, true]

    // sub menu = SHARE
    this._shareSubMenus = [
      'Twitter',
      'Facebook',
      '',
      '',
      '',
      '',
      'return'
    ]
    this._shareSubMenuEnable = [true, true, false, false, false, false, true]

    // stage edit
    this._createSubMenus = [
      'Size',
      'Step',
      'Edit',
      'Play',
      'Save',
      '',
      'return'
    ]
    this._createSubMenuEnable = [true, true, true, true, true, false, true]
    this._subCreateSize = ''
    this._subCreateStep = 1

    if(IQGameData.device.isMobile || IQGameData.device.isTablet){
      // disable Edit menu for mobile/tablet
      this._createSubMenus[2] = ''
      this._createSubMenuEnable[2] = false
    }

    // rules
    this._rulesSubMenus = [
      'Basic Rules 1',
      'Basic Rules 2',
      '',
      '',
      '',
      '',
      'return'
    ]
    this._rulesSubMenuEnable = [true, true, false, false, false, false, true]

    // moving
    this._moving = false
    this._srcCursor = 0
    this._srcX = 0
    this._srcY = 0
    this._dstCursor = 0
    this._dstX = 0
    this._dstY = 0
    this._srcMenuItem = 0
    this._dstMenuItem = 0


    this._cubeScale = 20.0
    this._opMovie = null
    this._opMovieAudio = null
    this._opMovieMP4URL = './movie/iq_opening.mp4'
    this._opMovieWebMURL = './movie/iq_opening.webm'
    this._opMovieReady = false
    this._opMovieStarted = false
    this._opMoviePlayCallback = () => { this.moviePlayStart() }

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
    this._opMenuEnable = [true, true, true, true, true, true, false, true, true]
    if(IQGameData.device.isMobile || IQGameData.device.isTablet){
      // window.close() doesn't work for mobile, so disable exit menu
      this._opMenuEnable[7] = false
    }

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

    this._opSubMenus = []
    this._opSubMenuEnable = []
    this._opSubSubMenus = []
    this._opSubSubMenuEnable = []

    this._tileSize = 64

    this._fadeTileObj = null

    this.initOpeningMovie()
    this.initMenuTile()
    this.initMenuParams()

    let menuName = menu
    if(!menuName){
      menuName = 'opening'
    }

    this.initMenuPlayerObj()

    this.setMenu(menuName)
  }

  initOpeningMovie() {
    const mov = document.createElement('video')
    const audio = new Audio()
    document.body.appendChild(mov)
    mov.setAttribute('style', 'display:none')

    this._opMovie = mov
    this._opMovieAudio = audio

    const audioPromise = new Promise((resolve, reject) => {
      audio.addEventListener('canplaythrough', () => { resolve() }, false)
      audio.addEventListener('error', (error) => { reject(error) }, false)
    })
    const videoPromise = new Promise((resolve, reject) => {
      mov.addEventListener('canplaythrough', () => { resolve() }, false)
      mov.addEventListener('error', (error) => { reject(error) }, false)
    })

    const obj = this
    Promise.all([audioPromise, videoPromise]).then(() => {
      obj.movieLoadedCallback()
    }).catch((error) => {
      console.log('Movie loading error: ' + error)
      // maybe the video codec is not supported... just skip the video
      IQGameData.openingMovieError = true
    })

    if(navigator.userAgent.match(/Chrome/)){
      if(mov.canPlayType('video/webm')){
        audio.setAttribute('src', this._opMovieWebMURL)
        audio.load()
        mov.setAttribute('src', this._opMovieWebMURL)
        mov.load()
      }else if(mov.canPlayType('video/mp4')){
        audio.setAttribute('src', this._opMovieMP4URL)
        audio.load()
        mov.setAttribute('src', this._opMovieMP4URL)
        mov.load()
      }else{
        console.error('error: cannot play movie')
      }
    }else{
      if(mov.canPlayType('video/mp4')){
        audio.setAttribute('src', this._opMovieMP4URL)
        audio.load()
        mov.setAttribute('src', this._opMovieMP4URL)
        mov.load()
      }else if(mov.canPlayType('video/webm')){
        audio.setAttribute('src', this._opMovieWebMURL)
        audio.load()
        mov.setAttribute('src', this._opMovieWebMURL)
        mov.load()
      }else{
        console.error('error: cannot play movie')
      }
    }
  }

  movieLoadedCallback() {
    this._opMovie.volume = IQGameData.soundVolume
    this._opMovieReady = true
    //if(IQGameData.device.isMobile){
    if(IQGameData.device.isMobile || IQGameData.device.isTablet){
      // iPhone can't play a video automatically.
      document.addEventListener('touchstart', this._opMoviePlayCallback, false)
    }else{
      this._opMovie.play()
      this._opMovieStarted = true
    }
  }

  /**
   * callback function for mobile to play movie
   * @access public
   * @returns {void}
   */
  moviePlayStart() {
    document.removeEventListener('touchstart', this._opMoviePlayCallback, false)
    this._opMovieAudio.play()
    this._opMovieStarted = true
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
    let s = null

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
    let s = null
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
    material.alpha = alpha
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

          // FIXME: need API
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

    this.resetMenuItem()
  }

  initMenuPlayerObj() {
    const player = new IQPlayer()
    IQGameData.menuPlayerObj = player
  }

  setupMenuPlayerObj() {
    // player
    if(IQGameData.character === 'Miku'){
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
    const tiles = []
    const obj = this
    arr.forEach( (pos) => {
      tiles.push( obj._opActiveTileObjArray[pos[1]][pos[0]] )
    })
    return tiles
  }

  setMenu(menu){
    this._menu = menu
    if(this._opMovie && menu !== 'opening'){
      this._opMovie.pause()
      this._opMovieAudio.pause()
    }
    this._cursor = 0
    this._moving = false
    this.resetMenuItem()

    if(menu !== 'pause'){
      IQGameData.camera.perspective(45.0, IQGameData.canvasWidth / IQGameData.canvasHeight, IQGameData.cameraNear, IQGameData.cameraFar)
    }

    switch(menu){
      case 'pause': {
        const width = 200
        const menuItems = ['Yes', 'No']
        this._subCursor = 1
        for(let i=0; i<menuItems.length; i++){
          this.setMenuItem(i, {
            x: (IQGameData.canvasWidth - width) * 0.5,
            y: 135 + i * this._subMenuDY,
            width: width,
            height: this._subMenuDY,
            textAlign: 'center',
            font: '20px bold sans-serif',
            text: menuItems[i]
          })
        }

        break
      }
      case 'continue': {
        const width = 200
        const menuItems = ['Tweet', 'Yes', 'No']
        this._subCursor = 0
        for(let i=0; i<menuItems.length; i++){
          this.setMenuItem(i, {
            x: (IQGameData.canvasWidth - width) * 0.5,
            y: 135 + i * this._subMenuDY,
            width: width,
            height: this._subMenuDY,
            textAlign: 'center',
            font: '20px bold sans-serif',
            text: menuItems[i]
          })
        }
        break
      }
      default: {
        // nothing to do
      }
    }

    if(this._subCursor >= this._menuItem.length){
      this._subCursor = 0
    }
  }

  getOptionName() {
    let c = this._cursor
    if(c === this._opMenus.size){
      c = 0
    }

    return this._opMenus.get(c)
  }

  /**
   * reset menu item
   * @access public
   * @returns {void}
   */
  resetMenuItem() {
    this._menuItem.length = 0
  }

  /**
   * set menu item
   * @access public
   * @param {int} index - index of menu item
   * @param {Object} item - menu item parameters
   * @returns {void}
   */
  setMenuItem(index, item) {
    const menuItem = {
      x: item.x || 0,
      y: item.y || 0,
      width: typeof item.width !== 'undefined' ? item.width : 100,
      height: typeof item.height !== 'undefined' ? item.height : 30,
      padding: typeof item.padding !== 'undefined' ? item.padding : 10,
      textAlign: typeof item.textAlign !== 'undefined' ? item.textAlign : 'center',
      textBaseline: typeof item.textBaseline !== 'undefined' ? item.textBaseline : 'middle',
      font: typeof item.font !== 'undefined' ? item.font : '20px bold sans-serif',
      fillStyle: typeof item.fillStyle !== 'undefined' ? item.fillStyle : IQGameData.whiteColor,
      strokeStyle: typeof item.strokeStyle !== 'undefined' ? item.strokeStyle : IQGameData.whiteColor,
      text: typeof item.text !== 'undefined' ? item.text : '',
      enable: typeof item.enable !== 'undefined' ? item.enable : true,
      onTouch: item.onTouch,
      onDecision: item.onDecision,
      onLeft: item.onLeft,
      onRight: item.onRight
    }

    switch(menuItem.textAlign){
      case 'left': {
        menuItem.tx = menuItem.x + menuItem.padding
        break
      }
      case 'right': {
        break
      }
      case 'center': 
      default: {
        menuItem.tx = menuItem.x + menuItem.width * 0.5
        break
      }
    }

    menuItem.ty = menuItem.y + menuItem.height * 0.5

    this._menuItem[index] = menuItem
  }

  drawMenuItem(canvas) {
    const c = canvas

    if(this._menuItem.length === 0){
      // nothing to draw
      return
    }
    if(this._menu === 'top'){
      if(!this._showSubMenu){
        // don't draw menu
        return
      }

      const menuDiffTime = IQGameData.getElapsedTime(this._showSubMenuTime)
      if(menuDiffTime < IQGameData.showSubMenuTimeMax){
        let s = 0
        const t = 2.0 * menuDiffTime / IQGameData.showSubMenuTimeMax
        if(t < 1){
          s = 0.5 * t * t
        }else{
          s = -0.5 * (t * (t - 4) + 2)
        }
        const sy = this._subMenuSY - this._subMenuDY * 0.5

        this._menuItem.forEach((item) => {
          if(item){
            c.textAlign = item.textAlign
            c.textBaseline = item.textBaseline
            c.font = item.font
            c.fillStyle = item.fillStyle
            c.strokeStyle = item.strokeStyle

            let text = item.text
            if(typeof item.text === 'function'){
              text = item.text()
            }

            this.drawText(text, item.tx, item.ty * s + sy * (1 - s))
          }
        })
        return
      }
    }

    this._menuItem.forEach((item) => {
      if(item){
        c.textAlign = item.textAlign
        c.textBaseline = item.textBaseline
        c.font = item.font
        c.fillStyle = item.fillStyle
        c.strokeStyle = item.strokeStyle

        let text = item.text
        if(typeof item.text === 'function'){
          text = item.text()
        }

        this.drawText(text, item.tx, item.ty)
      }
    })

    if(IQGameData.device.isMobile || IQGameData.device.isTablet){
      // draw frame
      this._menuItem.forEach((item) => {
        if(item && item.enable){
          if(IQGameData.controller.hoverWithinRect(item.x, item.y, item.width, item.height).length > 0){
            c.fillStyle = this._subMenuHoverFillStyle
            c.strokeStyle = this._subMenuHoverStrokeStyle
            c.fillRect(item.x, item.y, item.width, item.height)
            c.strokeRect(item.x, item.y, item.width, item.height)
          }else{
            c.strokeStyle = IQGameData.whiteColor
            c.strokeRect(item.x, item.y, item.width, item.height)
          }
        }
      })
    }
  }

  handleMenuItemAction() {
    const menuNo = this.getTouchedMenuNumber()
    const touchedItem = this._menuItem[menuNo]
    
    if(menuNo >= 0 && touchedItem.onTouch){
      touchedItem.onTouch()
    }

    const listener = IQGameData.keyListener
    const selectedItem = this._menuItem[this._subCursor]
    if(listener.getKeyNewState(IQGameData.keyMark) && selectedItem.onDecision){
      selectedItem.onDecision()
    }
    
    if(listener.getKeyNewState(IQGameData.keyLeft) && selectedItem.onLeft){
      selectedItem.onLeft()
    }

    if(listener.getKeyNewState(IQGameData.keyRight) && selectedItem.onRight){
      selectedItem.onRight()
    }
  }

  /**
   * draw cursor
   * @access public
   * @param {CanvasRenderingContext2D} canvas - canvas context
   * @returns {void}
   */
  drawCursor(canvas) {
    if(IQGameData.device.isMobile || IQGameData.device.isTablet){
      // don't use cursor for mobile/tablet
      return
    }
    if(this._menuItem.length === 0){
      // nothing to draw
      return
    }
    if(this._menu === 'top' && !this._showSubMenu){
      // don't draw while expanding menu
      return
    }
    if(IQGameData.editing){
      this.drawEditCursor(canvas)
      return
    }

    let x = 0
    let y = 0
    let width = 0
    let height = 0

    if(this._moving){
      const cursorDiffTime = (new Date()) - this._moveSubMenuTime
      const maxTime = IQGameData.menuMoveTime
      let s = 0
      const t = 2.0 * cursorDiffTime / maxTime
      if(t < 1){
        s = 0.5 * t * t
      }else{
        s = -0.5 * (t * (t - 4) + 2)
      }

      if(cursorDiffTime > maxTime){
        this._moving = false
        s = 1
      }

      const srcItem = this._menuItem[this._srcMenuItem]
      const dstItem = this._menuItem[this._dstMenuItem]
      x = srcItem.x * (1 - s) + dstItem.x * s
      y = srcItem.y * (1 - s) + dstItem.y * s
      width = srcItem.width * (1 - s) + dstItem.width * s
      height = srcItem.height * (1 - s) + dstItem.height * s
    }else{
      const item = this._menuItem[this._subCursor]
      x = item.x
      y = item.y
      width = item.width
      height = item.height
    }

    canvas.strokeStyle = IQGameData.redColor
    canvas.strokeRect(x, y, width, height)
  }

  /**
   * draw cursor for edit menu
   * @access public
   * @param {CanvasRenderingContext2D} canvas - canvas context
   * @returns {void}
   */
  drawEditCursor(canvas) {
    const imgLeft = this._subMenuSX + 255
    const imgTop = 45
    const imgSize = 30
    const strokeWidth = 4
    const width = imgSize + strokeWidth
    const height = imgSize + strokeWidth
    let x = imgLeft + imgSize * this._editCursorX - strokeWidth * 0.5
    let y = imgTop  + imgSize * this._editCursorY - strokeWidth * 0.5

    if(this._moving){
      const cursorDiffTime = IQGameData.getElapsedTime(this._moveSubMenuTime)
      const maxTime = IQGameData.menuMoveTime
      const srcX = imgLeft + imgSize * this._editCursorSX - strokeWidth * 0.5
      const srcY = imgTop  + imgSize * this._editCursorSY - strokeWidth * 0.5
      let s = 0
      const t = 2.0 * cursorDiffTime / maxTime
      if(t < 1){
        s = 0.5 * t * t
      }else{
        s = -0.5 * (t * (t - 4) + 2)
      }

      x = s * x + (1 - s) * srcX
      y = s * y + (1 - s) * srcY
    }

    canvas.save()
    canvas.strokeStyle = IQGameData.redColor
    canvas.lineWidth = strokeWidth
    canvas.strokeRect(x, y, width, height)
    canvas.restore()
  }

  /**
   * get touched menu number
   * @access public
   * @returns {int} - touhed menu number. -1 if there's no touch.
   */
  getTouchedMenuNumber() {
    for(let i=0; i<this._menuItem.length; i++){
      const item = this._menuItem[i]
      if(item && item.enable){
        if(IQGameData.controller.touchEndWithinRect(item.x, item.y, item.width, item.height).length > 0){
          return i
        }
      }
    }
    return -1
  }

  getSubOptionName(number) {
    let c = this._subCursor
    if(typeof number !== 'undefined'){
      c = number
    }
      
    return this._opSubMenus[c]
  }

  setSubMenu() {
    const opMenuName = this.getOptionName()
    const params = []
    const callbacks = []
    let width = this._subMenuDX
    let paramWidth = 0

    switch(opMenuName){
      case 'SCORE': {
        this._opSubMenus = this._scoreSubMenus
        this._opSubMenuEnable = this._scoreSubMenuEnable
        params[0] = () => this._subScoreCharacter
        params[1] = () => this._subScoreLevel
        paramWidth = 110
        break
      }
      case 'OPTION': {
        this._opSubMenus = this._optionSubMenus
        this._opSubMenuEnable = this._optionSubMenuEnable
        params[0] = () => IQGameData.level
        params[1] = () => IQGameData.stageNameList.get(IQGameData.selectedStage)
        params[2] = () => IQGameData.character
        params[3] = () => Math.floor(IQGameData.soundVolume * 100)
        params[4] = () => IQGameData.languageNameList.get(IQGameData.language)
        paramWidth = 110
        break
      }
      case 'RULES': {
        this._opSubMenus = this._rulesSubMenus
        this._opSubMenuEnable = this._rulesSubMenuEnable
        width = 180
        break
      }
      case 'SHARE': {
        this._opSubMenus = this._shareSubMenus
        this._opSubMenuEnable = this._shareSubMenuEnable
        break
      }
      case 'CREATE': {
        this._opSubMenus = this._createSubMenus
        this._opSubMenuEnable = this._createSubMenuEnable
        params[0] = () => IQGameData.editStageSize
        params[1] = () => IQGameData.editStageStep
        paramWidth = 75
        break
      }
      default: {
        console.log(`unknown menu: ${opMenuName}`)
      }
    }

    this.resetMenuItem()
    for(let i=0; i<this._opSubMenus.length; i++){
      const itemY = this._subMenuSY + (i - 0.5) * this._subMenuDY
      let menuWidth = width
      if(params[i]){
        menuWidth += this._subMenuParamPadding + paramWidth

        this.setMenuItem(10 + i, {
          x: this._subMenuParamX - 10,
          y: itemY,
          width: paramWidth,
          height: this._subMenuDY,
          textAlign: 'left',
          font: '24px bold ' + IQGameData.fontFamily,
          fillStyle: IQGameData.whiteColor,
          text: params[i],
          enable: false
        })
      }

      let callback = callbacks[i]
      if(!callback){
        callback = {}
      }

      this.setMenuItem(i, {
        x: this._subMenuSX - 10,
        y: itemY,
        width: menuWidth,
        height: this._subMenuDY,
        textAlign: 'left',
        font: '24px bold ' + IQGameData.fontFamily,
        fillStyle: IQGameData.whiteColor,
        text: this._opSubMenus[i],
        enable: this._opSubMenuEnable[i],

        onTouch: callback.onTouch,
        onDecision: callback.onDecision,
        onLeft: callback.onLeft,
        onRight: callback.onRight
      })
    }
  }

  subCursorInit() {
    let c = 0
    while(!this._opSubMenuEnable[c]){
      c++
    }
    this._subCursor = c

    const name = this.getOptionName()
    if(name === 'OPTION'){
      this._opSubSubMenus = IQGameData.levelList
      this._opSubSubMenuEnable = IQGameData.levelListEnable
      this._subSubCursor = IQGameData.levelList.indexOf(IQGameData.level)
    }else if(name === 'SCORE'){
      this._opSubSubMenus = IQGameData.characterList
      this._opSubSubMenuEnable = IQGameData.characterListEnable
      this._subSubCursor = IQGameData.levelList.indexOf(IQGameData.character)

      this._subScoreCharacter = IQGameData.character
      this._subScoreLevel = IQGameData.level
    }else if(name === 'CREATE'){
      this._opSubSubMenus = IQGameData.stageSizeList
      this._opSubSubMenuEnable = IQGameData.stageSizeListEnable
      this._subSubCursor = IQGameData.stageSizeList.indexOf(IQGameData.editStageSize)
    }else if(name === 'RULES'){
      // nothing to do
    }
  }

  render() {
    const c = IQGameData.canvasField.get2DContext()

    c.textAlign    = 'center'
    c.textBaseline = 'middle'
    c.font         = '24px bold ' + IQGameData.fontFamily
    c.fillStyle    = IQGameData.whiteColor
    c.strokeStyle  = IQGameData.blackColor

    if(this._menu === 'opening'){
      if(!this._opMovieReady){
        let loadingStr = 'Loading.'
        const dotMax = 3
        const dotNum = Math.floor((new Date()).getMilliseconds() / 300) % dotMax
        for(let i=0; i<dotNum; i++){
          loadingStr += '.'
        }
        for(let i=dotNum; i<dotMax; i++){
          loadingStr += ' '
        }

        // loading movie
        c.fillText(loadingStr, IQGameData.canvasWidth / 2, IQGameData.canvasHeight / 2)
      }else if(this._opMovieReady && !this._opMovieStarted){
        // waiting to play movie
        c.fillText('Touch to start', IQGameData.canvasWidth / 2, IQGameData.canvasHeight / 2)
      }else{
        // opening movie
        //if(IQGameData.device.isMobile){
        if(IQGameData.device.isMobile || IQGameData.device.isTablet){
          this._opMovie.currentTime = this._opMovieAudio.currentTime
        }
        c.drawImage(this._opMovie, 0, 0)
      }
    }else if(this._menu === 'top'){
      // setup context

      if(!this._showSubMenu){
        //if(IQGameData.device.isMobile || IQGameData.dvice.isTablet){
        if(!this._folding && !this._moveTopLeft && !this._expanding){
          // main menu
          const gradWidth = 40
          const dxWidth = 15
          const dx = (Math.abs(Math.sin(IQGameData.nowTime * 0.004)) - 0.5) * dxWidth
          const gradStop = gradWidth / IQGameData.menuButtonWidth

          // left
          const leftGrad = c.createLinearGradient(IQGameData.menuButtonWidth, 0, 0, 0)
          leftGrad.addColorStop(0.0, IQGameData.transparent)
          leftGrad.addColorStop(gradStop, IQGameData.menuButtonColor)
          //leftGrad.addColorStop(1.0, IQGameData.menuButtonColor)
          c.fillStyle = leftGrad
          c.clearRect(
            IQGameData.menuLeftButtonX, IQGameData.menuLeftButtonY,
            IQGameData.menuButtonWidth, IQGameData.menuButtonHeight
          )
          c.fillRect(
            IQGameData.menuLeftButtonX, IQGameData.menuLeftButtonY,
            IQGameData.menuButtonWidth, IQGameData.menuButtonHeight
          )

          c.fillStyle = IQGameData.whiteColor
          c.beginPath()
          c.moveTo(this._leftButtonP1X + dx, this._leftButtonP1Y)
          c.lineTo(this._leftButtonP2X + dx, this._leftButtonP2Y)
          c.lineTo(this._leftButtonP3X + dx, this._leftButtonP3Y)
          c.fill()

          // right
          const rightGrad = c.createLinearGradient(0, 0, IQGameData.menuButtonWidth, 0)
          rightGrad.addColorStop(0.0, IQGameData.transparent)
          rightGrad.addColorStop(gradStop, IQGameData.menuButtonColor)
          rightGrad.addColorStop(1.0, IQGameData.menuButtonColor)
          c.fillStyle = rightGrad
          c.clearRect(
            IQGameData.menuRightButtonX, IQGameData.menuRightButtonY,
            IQGameData.menuButtonWidth, IQGameData.menuButtonHeight
          )
          c.fillRect(
            IQGameData.menuRightButtonX, IQGameData.menuRightButtonY,
            IQGameData.menuButtonWidth, IQGameData.menuButtonHeight
          )

          c.fillStyle = IQGameData.whiteColor
          c.beginPath()
          c.moveTo(this._rightButtonP1X - dx, this._rightButtonP1Y)
          c.lineTo(this._rightButtonP2X - dx, this._rightButtonP2Y)
          c.lineTo(this._rightButtonP3X - dx, this._rightButtonP3Y)
          c.fill()
        }
      }else{
        // sub menu
        const menuDiffTime = IQGameData.getElapsedTime(this._showSubMenuTime)
        const opName = this.getOptionName()

        c.textAlign    = 'left'
        c.textBaseline = 'middle'
        c.font         = '24px bold ' + IQGameData.fontFamily
        c.fillStyle    = IQGameData.whiteColor
        c.strokeStyle  = IQGameData.blackColor

        const sx = this._subMenuSX
        const sy = this._subMenuSY
        //const dy = this._subMenuDY
        if(menuDiffTime < IQGameData.showSubMenuTimeMax){
          /*
          let s = 0
          const t = 2.0 * menuDiffTime / IQGameData.showSubMenuTimeMax
          if(t < 1){
            s = 0.5 * t * t
          }else{
            s = -0.5 * (t * (t - 4) + 2)
          }
          */

          if(opName === 'OPTION'){
            // nothing to do
          }else if(opName === 'SCORE'){
            // nothing to do
          }else if(opName === 'RULES'){
            // nothing to do
          }else if(opName === 'SHARE'){
            // nothing to do
          }else if(opName === 'CREATE'){
            // nothing to do
          }
        }else{
          if(!this._showSubMenuReady){
            this._showSubMenuReady = true
          }

          if(opName === 'OPTION'){
            // nothing to do
          }else if(opName === 'SCORE'){
            //const headX = sx
            //const headY = sy

            // draw score table
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

            c.fillText('Best I.Q', x1, y1)
            c.fillText('Daily',    x1, y2)
            c.fillText('Weekly',   x1, y3)

            c.textAlign = 'center'
            c.fillText('World',    (x2 + x3) / 2, y1)
            c.fillText('Personal', (x3 + x4) / 2, y1)

            c.textAlign = 'right'
            c.fillText(IQGameData.worldDailyBest[scoreCharacter][scoreLevel],     x3 - xpad, y2)
            c.fillText(IQGameData.worldWeeklyBest[scoreCharacter][scoreLevel],    x3 - xpad, y3)
            c.fillText(IQGameData.personalDailyBest[scoreCharacter][scoreLevel],  x4 - xpad, y2)
            c.fillText(IQGameData.personalWeeklyBest[scoreCharacter][scoreLevel], x4 - xpad, y3)

            c.textAlign    = 'left'
          }else if(opName === 'RULES'){
            // nothing to do
          }else if(opName === 'SHARE'){
            // nothing to do
          }else if(opName === 'CREATE'){
            // stage editor
            const x = sx + 250
            const y = 40
            const w = 280
            const h = 310
            c.strokeStyle = IQGameData.whiteColor
            c.strokeRect(x, y, w, h)

            const sizeIndex = IQGameData.stageSizeList.indexOf(IQGameData.editStageSize)
            const editStageSizeValue = IQGameData.stageSizeValues[sizeIndex]
            const editWidth = editStageSizeValue[0]
            const editLength = editStageSizeValue[1]

            const imgLeft = x + 5
            const imgTop = y + 5
            const imgSize = 30
            let imgX = imgLeft
            let imgY = imgTop
            for(let ey=0; ey<editLength; ey++){
              imgX = imgLeft
              for(let ex=0; ex<editWidth; ex++){
                let img = IQMenu.cubeNImage
                if(IQGameData.editStageData[ex][ey] === 'f'){
                  img = IQMenu.cubeFImage
                }else if(IQGameData.editStageData[ex][ey] === 'a'){
                  img = IQMenu.cubeAImage
                }

                c.drawImage(img, 0, 0, img.width, img.height,
                                 imgX, imgY, imgSize, imgSize)     
                imgX += imgSize
              }
              imgY += imgSize
            }
          }
        }
      }
    }else if(this._menu === 'pause'){
      // game over
      c.textAlign    = 'center'
      c.textBaseline = 'middle'
      c.font         = '24px bold sans-serif'
      c.fillStyle    = IQGameData.whiteColor
      c.strokeStyle  = IQGameData.whiteColor

      this.drawText('GIVE UP?', IQGameData.canvasWidth * 0.5, 50)

    }else if(this._menu === 'continue'){
      // game over
      c.textAlign    = 'center'
      c.textBaseline = 'middle'
      c.font         = '24px bold sans-serif'
      c.fillStyle    = IQGameData.whiteColor
      c.strokeStyle  = IQGameData.whiteColor

      this.drawText('CONTINUE?', IQGameData.canvasWidth * 0.5, 50)

    }else if(this._menu === 'endtweet'){
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
      const x = IQGameData.canvasWidth * 0.5
      let y = fy
      this.drawText('Tweet',        x, y); y+= dy
      this.drawText('Back To Menu', x, y); y+= dy
    }

    this.drawMenuItem(c)
    this.drawCursor(c)
  }

  drawText(str, x, y) {
    const c = IQGameData.canvasField.get2DContext()
    c.fillText(str, x, y)
    //c.strokeText(str, x, y)
  }
}

IQMenu.initialized = false

IQMenu.file_cube = 'x/cube_n.x'
IQMenu.file_bg = 'x/cube_tex_1n.bmp'
IQMenu.file_cube_n = 'x/cube_tex_1n.bmp'
IQMenu.file_cube_f = 'x/cube_tex_f.bmp'
IQMenu.file_cube_a = 'x/cube_tex_a.bmp'

IQMenu.openingMoive = null
IQMenu.setup = () => {
  IQMenu.bgImage = new Image()
  const bgImagePromise = new Promise((resolve, reject) => {
    IQMenu.bgImage.addEventListener('load',  () => { resolve() })
    IQMenu.bgImage.addEventListener('error', (e) => { reject(e) })
  })
  IQMenu.bgImage.src = IQMenu.file_bg

  IQMenu.cubeNImage = new Image()
  const cubeNImagePromise = new Promise((resolve, reject) => {
    IQMenu.cubeNImage.addEventListener('load',  () => { resolve() })
    IQMenu.cubeNImage.addEventListener('error', (e) => { reject(e) })
  })
  IQMenu.cubeNImage.src = IQMenu.file_cube_n

  IQMenu.cubeFImage = new Image()
  const cubeFImagePromise = new Promise((resolve, reject) => {
    IQMenu.cubeFImage.addEventListener('load',  () => { resolve() })
    IQMenu.cubeFImage.addEventListener('error', (e) => { reject(e) })
  })
  IQMenu.cubeFImage.src = IQMenu.file_cube_f
  
  IQMenu.cubeAImage = new Image()
  const cubeAImagePromise = new Promise((resolve, reject) => {
    IQMenu.cubeAImage.addEventListener('load',  () => { resolve() })
    IQMenu.cubeAImage.addEventListener('error', (e) => { reject(e) })
  })
  IQMenu.cubeAImage.src = IQMenu.file_cube_a

  const promise = Promise.all([
    ModelBank.getModel(IQMenu.file_cube),
    bgImagePromise,
    cubeNImagePromise,
    cubeFImagePromise,
    cubeAImagePromise
  ])
  .catch((error) => {
    console.error(`IQMenu Cube model loading error: ${error}`)
  })
  .then(() => {
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

