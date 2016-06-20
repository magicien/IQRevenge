'use strict'

import IQGameData from './IQGameData'

/**
 * IQController class
 * Controller for Smart phone
 * @access public
 */
export default class IQController {
  /**
   * constructor
   * @access public
   * @constructor
   */
  constructor() {
    this._enable = false
    this._preventDefault = false

    this._touchStartState = new Map()
    this._touchNowState = new Map()
    this._touchEndState = new Map()
    this._buttonNewState = [false, false, false, false]
    this._nowTouches = []
    this._anyTouch = false

    this.markerButton = 0
    this.advantageButton = 1
    this.speedUpButton = 2
    this.pauseButton = 3

    this._controllerSize = 100
    this._buttonSize = 50
    this._buttonIconSize = 30 
    this._outerButtonSize = this._buttonSize + 5
    this._outerPadding = 40
    this._innerPadding = 20

    this._2pi = 2 * Math.PI

    // controller position
    this._ctrCenterX = this._outerPadding + this._controllerSize / 2
    this._ctrCenterY = IQGameData.canvasHeight - this._outerPadding - this._controllerSize / 2
    this._ctrRadius = this._controllerSize / 2
    this._ctrRadius2 = this._ctrRadius * this._ctrRadius
    this._ctrColor = 'rgba(255, 255, 255, 1)'

    // button position
    // marker button
    this._btn1CenterX = IQGameData.canvasWidth - this._outerPadding - this._innerPadding - this._outerButtonSize - this._outerButtonSize / 2
    this._btn1CenterY = this._ctrCenterY
    this._btn1Color   = 'rgba(128, 128, 255, 0.7)'

    // advantage button
    this._btn2CenterX = this._btn1CenterX + this._innerPadding + this._outerButtonSize
    this._btn2CenterY = this._ctrCenterY
    this._btn2Color   = 'rgba(0, 255, 0, 0.7)'
    this._btn2DisableColor = 'rgba(0, 255, 0, 0.2)'

    // speedup button
    this._btn3CenterX = this._btn2CenterX
    this._btn3CenterY = this._ctrCenterY - this._outerButtonSize * 1.5
    this._btn3Color   = 'rgba(255, 255, 255, 0.7)'

    const btn3DX = 3
    this._btn3IconP11X = this._btn3CenterX - this._buttonIconSize / 2 + btn3DX
    this._btn3IconP11Y = this._btn3CenterY - this._buttonIconSize / 2

    this._btn3IconP12X = this._btn3IconP11X
    this._btn3IconP12Y = this._btn3IconP11Y + this._buttonIconSize

    this._btn3IconP13X = this._btn3CenterX + btn3DX
    this._btn3IconP13Y = this._btn3CenterY

    this._btn3IconP21X = this._btn3CenterX + btn3DX
    this._btn3IconP21Y = this._btn3IconP11Y

    this._btn3IconP22X = this._btn3IconP21X
    this._btn3IconP22Y = this._btn3IconP12Y

    this._btn3IconP23X = this._btn3CenterX + this._buttonIconSize / 2 + btn3DX
    this._btn3IconP23Y = this._btn3CenterY

    // pause button
    this._btn4CenterX = this._btn1CenterX
    this._btn4CenterY = this._btn3CenterY
    this._btn4Color   = 'rgba(255, 255, 255, 0.7)'

    // pause icon
    this._btn4IconP1X = this._btn4CenterX - this._buttonIconSize * 0.4
    this._btn4IconP1Y = this._btn4CenterY - this._buttonIconSize * 0.5

    this._btn4IconP2X = this._btn4CenterX + this._buttonIconSize * 0.1
    this._btn4IconP2Y = this._btn4IconP1Y

    this._btn4IconWidth  = this._buttonIconSize * 0.3
    this._btn4IconHeight = this._buttonIconSize

    // resume icon
    this._btn4ResumeP1X = this._btn4CenterX + this._buttonIconSize * 0.6
    this._btn4ResumeP1Y = this._btn4CenterY

    this._btn4ResumeP2X = this._btn4CenterX - this._buttonIconSize * 0.4
    this._btn4ResumeP2Y = this._btn4CenterY - this._buttonIconSize * 0.5

    this._btn4ResumeP3X = this._btn4ResumeP2X
    this._btn4ResumeP3Y = this._btn4ResumeP2Y + this._buttonIconSize


    this._btnRadius  = this._buttonSize / 2
    this._btnOuterRadius = this._outerButtonSize / 2
    this._buttonRadius2 = this._btnOuterRadius * this._btnOuterRadius
    this._btnFireColor = 'rgba(255, 0, 0, 0.7)'

    this.setEnable()

    // DEBUG
    /*
    console.log('move controller: ' + this._ctrCenterX + ',' + this._ctrCenterY)
    console.log('button 1: ' + this._btn1CenterX + ',' + this._btn1CenterY)
    console.log('button 2: ' + this._btn2CenterX + ',' + this._btn2CenterY)
    console.log('button 3: ' + this._btn3CenterX + ',' + this._btn3CenterY)
    console.log('button 4: ' + this._btn4CenterX + ',' + this._btn4CenterY)
    */
  }

  /**
   * enable/disable touch event listener
   * @access public
   * @param {boolean} flag - true: enable, false: disable
   * @returns {void}
   */
  setEnable(flag = true) {
    if(!flag){
      this._enable = false
      this._preventDefault = false
    }else{
      this._enable = true
      this._preventDefault = true

      document.addEventListener('touchstart',  (event) => { this.touchStartCallback(event)  }, false)
      document.addEventListener('touchmove',   (event) => { this.touchMoveCallback(event)   }, false)
      document.addEventListener('touchend',    (event) => { this.touchEndCallback(event)    }, false)
      document.addEventListener('touchcancel', (event) => { this.touchCancelCallback(event) }, false)
      /*
      const canvas = IQGameData.canvasField._2DCanvas
      canvas.addEventListener('touchstart',  (event) => { this.touchStartCallback(event)  }, false)
      canvas.addEventListener('touchmove',   (event) => { this.touchMoveCallback(event)   }, false)
      canvas.addEventListener('touchend',    (event) => { this.touchEndCallback(event)    }, false)
      canvas.addEventListener('touchcancel', (event) => { this.touchCancelCallback(event) }, false)
      */
    } 
  }

  /**
   * disable default event
   * @access private
   * @param {Event} event - touch event
   * @returns {void}
   */
  _disableDefaultEvent(event){
    if(this._preventDefault){
      event.preventDefault()
    }
  }

  /**
   * disable touch event listener
   * @access public
   * @returns {void}
   */
  setDisable() {
    this.setEnable(false)
  }

  /**
   * callback for touchstart event
   * @access public
   * @param {Event} event - touchstart event
   * @returns {void}
   */
  touchStartCallback(event = window.event) {
    this._disableDefaultEvent(event)
    this._nowTouches = event.touches

    this._anyTouch = true

    const length = event.changedTouches.length
    for(let i=0; i<length; i++){
      const touch = event.changedTouches[i]
      touch.timeStamp = event.timeStamp
      //touch.startX = touch.clientX
      //touch.startY = touch.clientY
      touch.startX = touch.pageX
      touch.startY = touch.pageY
      this._touchStartState.set(touch.identifier, touch)
      this._touchNowState.set(touch.identifier, touch)

      if(this.isInsideMarkerButton(touch)){
        this._buttonNewState[this.markerButton] = true
      }
      if(this.isInsideAdvantageButton(touch)){
        this._buttonNewState[this.advantageButton] = true
      }
      if(this.isInsideSpeedUpButton(touch)){
        this._buttonNewState[this.speedUpButton] = true
      }
      if(this.isInsidePauseButton(touch)){
        this._buttonNewState[this.pauseButton] = true
      }
    }
  }

  /**
   * callback for touchend event
   * @access public
   * @param {Event} event - touchend event
   * @returns {void}
   */
  touchEndCallback(event = window.event) {
    this._disableDefaultEvent(event)
    this._nowTouches = event.touches

    const length = event.changedTouches.length
    for(let i=0; i<length; i++){
      const touch = event.changedTouches[i]
      touch.timeStamp = event.timeStamp
      this._touchStartState.delete(touch.identifier)
      this._touchNowState.delete(touch.identifier)
      this._touchEndState.set(touch.identifier, touch)
    }
  }

  /**
   * callback for touchmove event
   * @access public
   * @param {Event} event - touchmove event
   * @returns {void}
   */
  touchMoveCallback(event = window.event) {
    this._disableDefaultEvent(event)
    this._nowTouches = event.touches

    const length = event.changedTouches.length
    for(let i=0; i<length; i++){
      const touch = event.changedTouches[i]
      touch.timeStamp = event.timeStamp
      this._touchNowState.set(touch.identifier, touch)
    }
  }

  /**
   * callback for touchcancel event
   * @access public
   * @param {Event} event - touchcancel event
   * @returns {void}
   */
  touchCancelCallback(event = window.event) {
    this._disableDefaultEvent(event)
    this._nowTouches = event.touches

    const length = event.changedTouches.length
    for(let i=0; i<length; i++){
      const touch = event.changedTouches[i]
      this._touchStartState.delete(touch.identifier)
      this._touchNowState.delete(touch.identifier)
    }
  }

  resetTouchNewState() {
    this._anyTouch = false
    for(let i=0; i<this._buttonNewState.length; i++){
      this._buttonNewState[i] = false
    }
    this._touchEndState.clear()
  }

  resetTouchState() {
    this.resetTouchNewState()
    this._touchStartState.clear()
    this._touchNowState.clear()
    this._nowTouches.length = 0
  }

  /**
   * check if there's any touch hovering within a given rect
   * @access public
   * @param {int} left - left(x) of rect
   * @param {int} top - top(y) of rect
   * @param {int} width - width of rect
   * @param {int} height - height of rect
   * @returns {Array<Touch>} - touches hovering within a given rect
   */
  hoverWithinRect(left, top, width, height) {
    const length = this._nowTouches.length
    const right = left + width
    const bottom = top + height
    const result = []
    for(let i=0; i<length; i++){
      const touch = this._nowTouches[i]
      if(left <= touch.startX && touch.startX <= right
         && top <= touch.startY && touch.startY <= bottom
         && left <= touch.pageX && touch.pageX <= right
         && top <= touch.pageY && touch.pageY <= bottom){
         //&& left <= touch.clientX && touch.clientX <= right
         //&& top <= touch.clientY && touch.clientY <= bottom){
        result.push(touch)
      }
    }
    return result
  }

  /**
   * check if there's any touch ended within a given rect
   * @access public
   * @param {int} left - left(x) of rect
   * @param {int} top - top(y) of rect
   * @param {int} width - width of rect
   * @param {int} height - height of rect
   * @returns {Array<Touch>} - touches ended within a given rect
   */
  touchEndWithinRect(left, top, width, height) {
    const right = left + width
    const bottom = top + height
    const result = []
    this._touchEndState.forEach((touch) => {
      if(left <= touch.startX && touch.startX <= right
         && top <= touch.startY && touch.startY <= bottom
         && left <= touch.pageX && touch.pageX <= right
         && top <= touch.pageY && touch.pageY <= bottom){
         //&& left <= touch.clientX && touch.clientX <= right
         //&& top <= touch.clientY && touch.clientY <= bottom){
        result.push(touch)
      }
    })
    return result
  }

  getAnyTouchState() {
    return this._anyTouch
  }

  getAnyTouchEndState() {
    return (this._touchEndState.size > 0)
  }

  getTouchNewState(index) {
    // TODO: error handling
    return this._buttonNewState[index]
  }

  getTouchState(index) {
    if(IQGameData.demoPlay){
      return false
    }

    const len = this._nowTouches.length
    let result = false

    switch(index){
      case this.markerButton: {
        for(let i=0; i<len; i++){
          result |= this.isInsideMarkerButton(this._nowTouches[i])
        }
        break
      }
      case this.advantageButton: {
        for(let i=0; i<len; i++){
          result |= this.isInsideAdvantageButton(this._nowTouches[i])
        }
        break
      }
      case this.speedUpButton: {
        for(let i=0; i<len; i++){
          result |= this.isInsideSpeedUpButton(this._nowTouches[i])
        }
        break
      }
      case this.pauseButton: {
        for(let i=0; i<len; i++){
          result |= this.isInsidePauseButton(this._nowTouches[i])
        }
        break
      }
      default: {
        console.warn('unknown button index: ' + index)
      }
    }

    return result
  }

  /**
   * get direction of move
   * @access public
   * @return {Object} - normalized vector (x,y)
   */
  getMoveVector() {
    if(IQGameData.demoPlay){
      return null
    }

    let firstTouch = null
    this._touchStartState.forEach((touch) => {
      if(this.isInsideMoveController(touch, true)){
        if(firstTouch === null || touch.timeStamp < firstTouch.timeStamp){
          firstTouch = touch
        }
      }
    })

    if(firstTouch === null){
      return null
    }

    const nowTouch = this._touchNowState.get(firstTouch.identifier)
    //const dx = nowTouch.clientX - firstTouch.startX
    //const dy = nowTouch.clientY - firstTouch.startY
    const dx = nowTouch.pageX - firstTouch.startX
    const dy = nowTouch.pageY - firstTouch.startY
    const r = Math.sqrt(dx * dx + dy * dy)

    console.log('MoveVector: ' + dx + ',' + dy + ',' + r)

    if(r < 0.01){
      return null
    }
    const invR = 1.0 / r

    return {
      x: dx * invR,
      y: dy * invR,
      r: r
    }
  }

  /**
   * check if a given touch is inside of a move controller
   * @access public
   * @param {Touch} touch - Touch object to check
   * @param {boolean} checkStartValue - check startX/Y instead of pageX/Y
   * @returns {boolean} - true if the touch is inside of a move controller
   */
  isInsideMoveController(touch, checkStartValue = false) {
    //let x = touch.clientX
    //let y = touch.clientY
    let x = touch.pageX
    let y = touch.pageY

    if(checkStartValue){
      x = touch.startX
      y = touch.startY
    }

    const dx = x - this._ctrCenterX
    const dy = y - this._ctrCenterY

    return (dx * dx + dy * dy < this._ctrRadius2)
  }

  isInsideMarkerButton(touch) {
    //const x = touch.clientX
    //const y = touch.clientY
    const x = touch.pageX
    const y = touch.pageY

    const dx = x - this._btn1CenterX
    const dy = y - this._btn1CenterY

    return (dx * dx + dy * dy < this._buttonRadius2)
  }

  isInsideAdvantageButton(touch) {
    //const x = touch.clientX
    //const y = touch.clientY
    const x = touch.pageX
    const y = touch.pageY

    const dx = x - this._btn2CenterX
    const dy = y - this._btn2CenterY

    return (dx * dx + dy * dy < this._buttonRadius2)
  }

  isInsideSpeedUpButton(touch) {
    //const x = touch.clientX
    //const y = touch.clientY
    const x = touch.pageX
    const y = touch.pageY

    const dx = x - this._btn3CenterX
    const dy = y - this._btn3CenterY

    return (dx * dx + dy * dy < this._buttonRadius2)
  }

  isInsidePauseButton(touch) {
    //const x = touch.clientX
    //const y = touch.clientY
    const x = touch.pageX
    const y = touch.pageY

    const dx = x - this._btn4CenterX
    const dy = y - this._btn4CenterY

    return (dx * dx + dy * dy < this._buttonRadius2)
  }

  /**
   * render controller
   * @access public
   * @param {Canvas} canvas - Canvas object to render controller
   * @returns {void}
   */
  render(canvas) {
    const g = IQGameData
    const c = canvas

    if(g.gameOver || g.gameOverFadeOut || g.ending || g.stageClear || g.pausing){
      // not draw controller
      return
    }
    
    c.lineCap   = 'butt'
    c.lineJoin  = 'miter'
    c.lineWidth = 1

    // controller
    c.strokeStyle = this._ctrColor
    c.beginPath()
    c.arc(this._ctrCenterX, this._ctrCenterY, this._ctrRadius, 0, this._2pi)
    c.stroke()

    // buttons

    // button 1: normal marker
    c.strokeStyle = this._btn1Color
    c.beginPath()
    c.arc(this._btn1CenterX, this._btn1CenterY, this._btnOuterRadius, 0, this._2pi)
    c.stroke()

    c.fillStyle = this._btn1Color

    c.beginPath()
    c.arc(this._btn1CenterX, this._btn1CenterY, this._btnRadius, 0, this._2pi)
    c.fill()

    // button 2: advantage marker

    // disable if there's no advantage marker
    if(IQGameData.markerArray.some((marker) => marker.type === 'green')){
      c.strokeStyle = this._btn2Color
      c.fillStyle = this._btn2Color
    }else{
      c.strokeStyle = this._btn2DisableColor
      c.fillStyle = this._btn2DisableColor
    }
    c.beginPath()
    c.arc(this._btn2CenterX, this._btn2CenterY, this._btnOuterRadius, 0, this._2pi)
    c.stroke()

    c.beginPath()
    c.arc(this._btn2CenterX, this._btn2CenterY, this._btnRadius, 0, this._2pi)
    c.fill()

    // button 3: speed up
    c.strokeStyle = this._btn3Color
    c.fillStyle = this._btn3Color
    c.beginPath()
    c.arc(this._btn3CenterX, this._btn3CenterY, this._btnOuterRadius, 0, this._2pi)
    c.stroke()

    c.beginPath()
    c.arc(this._btn3CenterX, this._btn3CenterY, this._btnRadius, 0, this._2pi)
    c.stroke()


    // draw fast-forward icon
    c.beginPath()
    c.moveTo(this._btn3IconP11X, this._btn3IconP11Y)
    c.lineTo(this._btn3IconP12X, this._btn3IconP12Y)
    c.lineTo(this._btn3IconP13X, this._btn3IconP13Y)
    c.fill()

    c.beginPath()
    c.moveTo(this._btn3IconP21X, this._btn3IconP21Y)
    c.lineTo(this._btn3IconP22X, this._btn3IconP22Y)
    c.lineTo(this._btn3IconP23X, this._btn3IconP23Y)
    c.fill()

    // button 4: pause
    c.strokeStyle = this._btn4Color
    c.fillStyle = this._btn4Color

    c.beginPath()
    c.arc(this._btn4CenterX, this._btn4CenterY, this._btnRadius, 0, this._2pi)
    c.stroke()

    c.beginPath()
    c.arc(this._btn4CenterX, this._btn4CenterY, this._btnOuterRadius, 0, this._2pi)
    c.stroke()

    c.fillRect(this._btn4IconP1X, this._btn4IconP1Y, this._btn4IconWidth, this._btn4IconHeight)
    c.fillRect(this._btn4IconP2X, this._btn4IconP2Y, this._btn4IconWidth, this._btn4IconHeight)
  }

  /**
   * draw resume button during pause
   * @access public
   * @param {object} canvas - canvas context
   * @returns {void}
   */
  drawResumeButton(canvas) {
    const c = canvas
    c.strokeStyle = this._btn4Color
    c.fillStyle = this._btn4Color

    c.beginPath()
    c.arc(this._btn4CenterX, this._btn4CenterY, this._btnRadius, 0, this._2pi)
    c.stroke()

    c.beginPath()
    c.arc(this._btn4CenterX, this._btn4CenterY, this._btnOuterRadius, 0, this._2pi)
    c.stroke()

    c.beginPath()
    c.moveTo(this._btn4ResumeP1X, this._btn4ResumeP1Y)
    c.lineTo(this._btn4ResumeP2X, this._btn4ResumeP2Y)
    c.lineTo(this._btn4ResumeP3X, this._btn4ResumeP3Y)
    c.fill()
  }
}

