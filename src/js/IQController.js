'use strict'

/*
import {

} from '../../modules/DH3DLibrary/src/js/main'
*/
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
    this.ffButton = 2
    this.pauseButton = 3

    this._controllerSize = 70
    this._buttonSize = 30
    this._buttonIconSize = 15
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
    this._btn1CenterX = IQGameData.canvasWidth - this._outerPadding - this._innerPadding * 2 - this._outerButtonSize * 2 - this._outerButtonSize / 2
    this._btn1CenterY = this._ctrCenterY
    this._btn1Color   = 'rgba(128, 128, 255, 0.7)'

    this._btn2CenterX = this._btn1CenterX + this._innerPadding + this._outerButtonSize
    this._btn2CenterY = this._ctrCenterY
    this._btn2Color   = 'rgba(0, 255, 0, 0.7)'
    this._btn2DisableColor = 'rgba(255, 255, 255, 0.3)'

    this._btn3CenterX = this._btn2CenterX + this._innerPadding + this._outerButtonSize
    this._btn3CenterY = this._ctrCenterY
    this._btn3Color   = 'rgba(255, 255, 255, 0.7)'

    this._btn3IconP11X = this._btn3CenterX - this._buttonIconSize / 2
    this._btn3IconP11Y = this._btn3CenterY - this._buttonIconSize / 2

    this._btn3IconP12X = this._btn3IconP11X
    this._btn3IconP12Y = this._btn3IconP11Y + this._buttonIconSize

    this._btn3IconP13X = this._btn3CenterX
    this._btn3IconP13Y = this._btn3CenterY

    this._btn3IconP21X = this._btn3CenterX
    this._btn3IconP21Y = this._btn3IconP11Y

    this._btn3IconP22X = this._btn3IconP21X
    this._btn3IconP22Y = this._btn3IconP12Y

    this._btn3IconP23X = this._btn3CenterX + this._buttonIconSize / 2
    this._btn3IconP23Y = this._btn3CenterY

    // FIXME: where is the pause button?
    this._btn4CenterX = 0
    this._btn4CenterY = 0
    this._btn4Color   = 'rgba(255, 255, 255, 0.7)'

    this._btnRadius  = this._buttonSize / 2
    this._btnOuterRadius = this._outerButtonSize / 2
    this._buttonRadius2 = this._btnOuterRadius * this._btnOuterRadius
    this._btnFireColor = 'rgba(255, 0, 0, 0.7)'

    // button icon
    // TODO: create icon image

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
      touch.startX = touch.clientX
      touch.startY = touch.clientY
      this._touchStartState.set(touch.identifier, touch)
      this._touchNowState.set(touch.identifier, touch)

      console.log('touchstart: (' + touch.clientX + ',' + touch.clientY + ')')

      if(this.isInsideMarkerButton(touch)){
        console.log('inside marker button!')
        this._buttonNewState[this.markerButton] = true
      }
      if(this.isInsideAdvantageButton(touch)){
        console.log('inside advantage button!')
        this._buttonNewState[this.advantageButton] = true
      }
      if(this.isInsideFFButton(touch)){
        console.log('inside ff button!')
        this._buttonNewState[this.ffButton] = true
      }
      if(this.isInsidePauseButton(touch)){
        console.log('inside pause button!')
        this._buttonNewState[this.pauseButton] = true
      }

      console.log('touchstart: id: ' + touch.identifier)
    }
    //console.log('touchstart: ' + event)
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
    console.log('touchend: ' + event)
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
      console.log('touchmove: id: ' + touch.identifier)
    }
    //console.log('touchmove: ' + event)
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

    console.log('touchcancel: ' + event)
  }

  resetTouchNewState() {
    this._anyTouch = false
    for(let i=0; i<this._buttonNewState.length; i++){
      this._buttonNewState[i] = false
    }
    this._touchEndState.clear()
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
         && left <= touch.clientX && touch.clientX <= right
         && top <= touch.clientY && touch.clientY <= bottom){
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
         && left <= touch.clientX && touch.clientX <= right
         && top <= touch.clientY && touch.clientY <= bottom){
        result.push(touch)
      }
    })
    return result
  }

  getAnyTouchState() {
    return this._anyTouch
  }

  getTouchNewState(index) {
    // TODO: error handling
    return this._buttonNewState[index]
  }

  getTouchState(index) {
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
      case this.ffButton: {
        for(let i=0; i<len; i++){
          result |= this.isInsideFFButton(this._nowTouches[i])
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
    let firstTouch = null
    this._touchStartState.forEach((touch) => {
      if(this.isInsideMoveController(touch, true)){
        if(firstTouch === null || touch.timeStamp < firstTouch.timeStamp){
          firstTouch = touch
        }
      }
    })

    //console.log('firstTouch found')

    if(firstTouch === null){
      return null
    }

    const nowTouch = this._touchNowState.get(firstTouch.identifier)
    const dx = nowTouch.clientX - firstTouch.startX
    const dy = nowTouch.clientY - firstTouch.startY
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
   * @param {boolean} checkStartValue - check startX/Y instead of clientX/Y
   * @returns {boolean} - true if the touch is inside of a move controller
   */
  isInsideMoveController(touch, checkStartValue = false) {
    let x = touch.clientX
    let y = touch.clientY

    if(checkStartValue){
      x = touch.startX
      y = touch.startY
    }

    const dx = x - this._ctrCenterX
    const dy = y - this._ctrCenterY

    return (dx * dx + dy * dy < this._ctrRadius2)
  }

  isInsideMarkerButton(touch) {
    const x = touch.clientX
    const y = touch.clientY

    const dx = x - this._btn1CenterX
    const dy = y - this._btn1CenterY

    return (dx * dx + dy * dy < this._buttonRadius2)
  }

  isInsideAdvantageButton(touch) {
    const x = touch.clientX
    const y = touch.clientY

    const dx = x - this._btn2CenterX
    const dy = y - this._btn2CenterY

    return (dx * dx + dy * dy < this._buttonRadius2)
  }

  isInsideFFButton(touch) {
    const x = touch.clientX
    const y = touch.clientY

    const dx = x - this._btn3CenterX
    const dy = y - this._btn3CenterY

    return (dx * dx + dy * dy < this._buttonRadius2)
  }

  isInsidePauseButton(touch) {
    const x = touch.clientX
    const y = touch.clientY

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

    /*
    if(g.markerOn){
      c.fillStyle = this._btnFireColor
    }else{
      c.fillStyle = this._btn1Color
    }
    */
    c.fillStyle = this._btn1Color

    c.beginPath()
    c.arc(this._btn1CenterX, this._btn1CenterY, this._btnRadius, 0, this._2pi)
    c.fill()

    // button 2: advantage marker
    c.strokeStyle = this._btn2Color
    c.beginPath()
    c.arc(this._btn2CenterX, this._btn2CenterY, this._btnOuterRadius, 0, this._2pi)
    c.stroke()

    // TODO: disable if there's no advantage marker
    c.fillStyle = this._btn2Color
    c.beginPath()
    c.arc(this._btn2CenterX, this._btn2CenterY, this._btnRadius, 0, this._2pi)
    c.fill()

    // button 3: fast-forward
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
  }
}
