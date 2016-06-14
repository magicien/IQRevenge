'use strict'

import { 
  KeyListener
} from '../../modules/DH3DLibrary/src/js/main'

/**
 * KeyListener class expanded to be able to record and replay the player's move
 * @access public
 */
export default class IQKeyListener extends KeyListener {
  /**
   * constructor
   * @access public
   * @constructor
   */
  constructor() {
    super()

    this.frozen = false
    this.stockedEvents = []
  }

  freeze() {
    this.frozen = true
  }

  keyDownCallback(event = window.event) {
    this.stockedEvents.push(event)
    if(!this.frozen){
      this.processKeyEvent()
    }
  }

  _keyDownCallback(event = window.event) {
    let keyChar = this._keyHash.get(event.keyCode)
    if(keyChar === undefined)
      keyChar = String.fromCharCode(event.keyCode)

    if(!this._keyState[keyChar]){
      this._keyNewState[keyChar] = true
    }
    this._keyState[keyChar] = true
    this._anyKey = true

    if(this._userKeyDownCallback){
      this._userKeyDownCallback(event)
    }
  }

  keyUpCallback(event = window.event) {
    this.stockedEvents.push(event)
    if(!this.frozen){
      this.processKeyEvent()
    }
  }

  _keyUpCallback(event = window.event) {
    let keyChar = this._keyHash.get(event.keyCode)
    if(keyChar === undefined)
      keyChar = String.fromCharCode(event.keyCode)

    this._keyState[keyChar] = false

    if(this._userKeyUpCallback){
      this._userKeyUpCallback(event)
    }
  }

  resetKeyNewState() {
    const obj = this
    Object.keys(this._keyState).forEach( (k) => {
      obj._keyNewState[k] = false
    })
    this._anyKey = false

    this.frozen = false
    this.processKeyEvent()
  }

  processKeyEvent() {
    if(this.processing){
      return
    }
    this.processing = true

    while(this.stockedEvents.length > 0){
      let event = this.stockedEvents.shift()
      if(event.type === 'keydown'){
        this._keyDownCallback(event)
      }else if(event.type === 'keyup'){
        this._keyUpCallback(event)
      }
    }

    this.processing = false
  }
}
