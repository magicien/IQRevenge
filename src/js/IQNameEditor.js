'use strict'

import {
  DH2DObject
} from '../../modules/DH3DLibrary/src/js/main'
import IQGameData from './IQGameData'

/**
 * IQNameEditor class
 * @access public
 */
export default class IQNameEditor extends DH2DObject {
  /**
   * constructor
   * @access public
   * @param {int} nameBoxX -
   * @param {int} nameBoxY -
   * @param {int} keyboardX -
   * @param {int} keyboardY -
   * @constructor
   */
  constructor(nameBoxX = null, nameBoxY = null, keyboardX = null, keyboardY = null) {
    super()

    this._nameBoxX = nameBoxX
    this._nameBoxY = nameBoxY
    this._keyboardX = keyboardX
    this._keyboardY = keyboardY
    this._endEditCallback = null

    this._fontSize = 28
    this._font = this._fontSize + 'px bold ' + IQGameData.fontFamily
    this._charBoxWidth = 34
    this._charBoxMargin = 6
    this._charBoxDW = this._charBoxWidth + this._charBoxMargin
    this._cursorPadding = (this._charBoxWidth - this._fontSize) / 2

    this._chars = [
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
      ['L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'],
      ['W', 'X', 'Y', 'Z', '!', '?', '/', '.', ' ', 'DEL', 'END']
    ]
    this._charsXLen = 11
    this._charsYLen = 3

    this._nameBoxPadding = 10
    this._nameBoxWidth = IQGameData.playerNameMaxLength * this._charBoxWidth
                       + this._nameBoxPadding * 2
    this._nameBoxHeight = this._charBoxWidth

    if(this._nameBoxX === null){
      this._nameBoxX = (IQGameData.canvasWidth - this._nameBoxWidth) / 2
    }
    if(this._nameBoxY === null){
      this._nameBoxY = this._charBoxWidth
    }

    this._keyboardWidth = this._charBoxDW * this._charsXLen - this._charBoxMargin
    this._keyboardHeight = this._charBoxDW * this._charsYLen - this._charBoxMargin

    if(this._keyboardX === null){
      this._keyboardX = (IQGameData.canvasWidth - this._keyboardWidth) / 2
    }
    if(this._keyboardY === null){
      this._keyboardY = IQGameData.canvasHeight - this._keyboardHeight - this._charBoxWidth
    }

    this._editName = IQGameData.playerName
    this._editNameChars = []

    let chX = this._nameBoxX + this._nameBoxPadding + this._charBoxWidth / 2
    const chY = this._nameBoxY + this._nameBoxHeight / 2
    for(let i=0; i<this._editName.length; i++){

      const ch = {
        character: this._editName[i],
        x: chX,
        y: chY,
        moving: false
      }
      this._editNameChars.push(ch)

      chX += this._charBoxWidth
    }

    this._cursorMoveWait = 100
    this._charSpeed = 300

    this._editCursorSX = 0
    this._editCursorSY = 0
    this._editCursorX = 0
    this._editCursorY = 0

    this._moving = false
    this._moveStartTime = null
  }

  setEndEditCallback(callback) {
    this._endEditCallback = callback
  }

  handleInput() {
    this.handleKey()
    this.handleTouch()
  }

  handleKey() {
    const g = IQGameData
    let cx = this._editCursorX
    let cy = this._editCursorY

    if(g.keyListener.getKeyNewState(g.keyRight)){
      cx++
    }
    if(g.keyListener.getKeyNewState(g.keyLeft)){
      cx--
    }
    if(g.keyListener.getKeyNewState(g.keyUp)){
      cy--
    }
    if(g.keyListener.getKeyNewState(g.keyDown)){
      cy++
    }
    cx = (cx + this._charsXLen) % this._charsXLen
    cy = (cy + this._charsYLen) % this._charsYLen

    if(cx !== this._editCursorX || cy !== this._editCursorY){
      //playSound(g.se_select) // FIXME
      this._moving = true
      this._moveStartTime = new Date(g.nowTime.getTime())

      this._editCursorSX = this._editCursorX
      this._editCursorSY = this._editCursorY
      this._editCursorX = cx
      this._editCursorY = cy
    }

    if(!this._moving){
      if(g.keyListener.getKeyNewState(g.keyMark)){
        this.selectChar(this._editCursorX, this._editCursorY)
      }
    }
  }

  handleTouch() {
    const kbLeft = this._keyboardX - this._charBoxMargin / 2
    const kbTop = this._keyboardY - this._charBoxMargin / 2
    const kbWidth = this._charBoxDW * this._charsXLen
    const kbHeight = this._charBoxDW * this._charsYLen

    const touches = IQGameData.controller.touchEndWithinRect(
      kbLeft, kbTop, kbWidth, kbHeight
    )
    touches.forEach((touch) => {
      let startX = Math.floor((touch.startX - kbLeft) / this._charBoxDW)
      let startY = Math.floor((touch.startY - kbTop) / this._charBoxDW)
      let endX = Math.floor((touch.clientX - kbLeft) / this._charBoxDW)
      let endY = Math.floor((touch.clientY - kbTop) / this._charBoxDW)

      startX = Math.min(Math.max(startX, 0), this._charsXLen - 1)
      startY = Math.min(Math.max(startY, 0), this._charsYLen - 1)
      endX = Math.min(Math.max(endX, 0), this._charsXLen - 1)
      endY = Math.min(Math.max(endY, 0), this._charsYLen - 1)

      if(startX === endX && startY === endY){
        // handle touch
        this.selectChar(startX, startY)
      }
    })
  }

  selectChar(charX, charY) {
    const ch = this._chars[charY][charX]

    if(ch === 'DEL'){
      this.deleteChar()
    }else if(ch === 'END'){
      this.endEdit()
    }else{
      this.addChar(ch)
    }
  }

  endEdit() {
    IQGameData.playerName = this._editName

    if(this._endEditCallback){
      this._endEditCallback()
    }
  }

  deleteChar() {
    if(this._editName.length <= 0){
      // can't delete char
      return
    }

    this._editName = this._editName.substr(0, this._editName.length - 1)
    this._editNameChars.pop()
  }

  addChar(ch) {
    const nameLen = this._editName.length
    if(nameLen >= IQGameData.playerNameMaxLength){
      // can't add char
      return
    }

    let cx = -1
    let cy = -1
    for(let y=0; y<this._charsYLen; y++){
      for(let x=0; x<this._charsXLen; x++){
        if(this._chars[y][x] === ch){
          cx = x
          cy = y
        }
      }
    }

    if(cx === -1){
      console.error('addChar: unknown char: ' + ch)
      return
    }

    const srcX = this._keyboardX + this._charBoxWidth / 2 + cx * this._charBoxDW
    const srcY = this._keyboardY + this._charBoxWidth / 2 + cy * this._charBoxDW
    const dstX = this._nameBoxX + this._nameBoxPadding + (nameLen + 0.5) * this._charBoxWidth
    const dstY = this._nameBoxY + this._nameBoxHeight / 2

    let dy = this._charBoxDW
    if(srcY < dstY){
      dy = -dy
    }
    const midY = dstY + dy

    const d1 = Math.abs(midY - srcY)
    const d2 = Math.abs(dstX - srcX)
    const d3 = Math.abs(dstY - midY)
    const t1 = d1 / this._charSpeed * 1000
    const t2 = d2 / this._charSpeed * 1000
    const t3 = d3 / this._charSpeed * 1000

    this._editName += ch
    const newCh = {
      character: ch,
      x: srcX,
      y: srcY,
      srcX: srcX,
      dstX: dstX,
      srcY: srcY,
      midY: midY,
      dstY: dstY,
      t1: t1,
      t2: t2,
      t3: t3,
      moveStartTime: new Date(IQGameData.nowTime.getTime()),
      moving: true
    }
    this._editNameChars.push(newCh)
  }

  move(elapsedTime) {
    // move cursor
    if(this._moving){
      const diffTime = IQGameData.getElapsedTime(this._moveStartTime)
      const maxTime = this._cursorMoveWait
      if(diffTime >= maxTime){
        this._moving = false
      }
    }

    // move characters
    this._editNameChars.forEach((ch) => {
      if(!ch.moving){
        // nothing to do
        return
      }
      const chTime = IQGameData.getElapsedTime(ch.moveStartTime)

      if(chTime < ch.t1){
        // vertical move
        ch.x = ch.srcX

        const s = chTime / ch.t1
        ch.y = ch.srcY * (1 - s) + ch.midY * s
      }else if(chTime < ch.t1 + ch.t2){
        // horizontal move
        ch.y = ch.midY

        const s = (chTime - ch.t1) / ch.t2
        ch.x = ch.srcX * (1 - s) + ch.dstX * s
      }else if(chTime < ch.t1 + ch.t2 + ch.t3){
        // vertical move
        ch.x = ch.dstX

        const s = (chTime - ch.t1 - ch.t2) / ch.t3
        ch.y = ch.midY * (1 - s) + ch.dstY * s
      }else{
        // end moving
        ch.moving = false
        ch.x = ch.dstX
        ch.y = ch.dstY
      }
    })
  }

  render() {
    this.drawKeyboard()
    this.drawNameBox()
    this.drawCursor()
    this.drawChars()
  }

  resetFont() {
    const c = IQGameData.canvasField.get2DContext()
    c.textAlign    = 'center'
    c.textBaseline = 'middle'
    c.font         = this._font
    c.fillStyle    = IQGameData.whiteColor
    c.strokeStyle  = IQGameData.whiteColor
  }

  drawKeyboard() {
    const c = IQGameData.canvasField.get2DContext()
    this.resetFont()

    const boxWidth = this._charBoxWidth
    //const boxMargin = this._charBoxMargin
    const d = this._charBoxDW
    const xLen = this._charsXLen
    const yLen = this._charsYLen

    const sx = this._keyboardX
    const sy = this._keyboardY
    let xpos = sx
    let ypos = sy
    for(let y=0; y<yLen; y++){
      const line = this._chars[y]
      xpos = sx
      for(let x=0; x<xLen; x++){
        const ch = line[x]

        const chX = xpos + boxWidth / 2
        const chY = ypos + boxWidth / 2

        // draw character
        if(ch.length > 1){
          c.save()
          c.transform(0.45, 0, 0, 1, chX, chY)
          c.fillText(ch, 0, 0)
          c.restore()
        }else{
          c.fillText(ch, chX, chY)
        }

        // draw box
        c.strokeRect(xpos, ypos, boxWidth, boxWidth)

        xpos += d
      }
      ypos += d
    }
  }

  drawNameBox() {
    const c = IQGameData.canvasField.get2DContext()
    this.resetFont()

    // draw box
    c.strokeRect(this._nameBoxX, this._nameBoxY, this._nameBoxWidth, this._nameBoxHeight)

    // draw cursor
    let cursorX = this._nameBoxX + this._nameBoxPadding + this._editName.length * this._charBoxWidth
    if(this._editName.length === IQGameData.playerNameMaxLength){
      cursorX -= this._charBoxWidth
    }
    cursorX += this._cursorPadding

    const cursorY = this._nameBoxY + this._nameBoxHeight - this._cursorPadding

    c.beginPath()
    c.moveTo(cursorX, cursorY)
    c.lineTo(cursorX + this._fontSize, cursorY)
    c.stroke()
  }

  drawCursor() {
    const c = IQGameData.canvasField.get2DContext()
    const boxWidth = this._charBoxWidth
    //const boxMargin = this._charBoxMargin
    const d = this._charBoxDW
    const strokeWidth = 4
    //const xLen = this._charsXLen
    //const yLen = this._charsYLen
    const width = boxWidth + strokeWidth

    //const totalWidth = (boxWidth + boxMargin) * xLen - boxMargin
    //const totalHeight = (boxWidth + boxMargin) * yLen - boxMargin
    const sx = this._keyboardX
    const sy = this._keyboardY

    let x = sx + this._editCursorX * d - strokeWidth * 0.5
    let y = sy + this._editCursorY * d - strokeWidth * 0.5

    if(this._moving){
      const cursorDiffTime = IQGameData.getElapsedTime(this._moveStartTime)
      const maxTime = this._cursorMoveWait
      const srcX = sx + this._editCursorSX * d - strokeWidth * 0.5
      const srcY = sy + this._editCursorSY * d - strokeWidth * 0.5
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

    c.save()
    c.strokeStyle = IQGameData.redColor
    c.lineWidth = strokeWidth
    c.strokeRect(x, y, width, width)
    c.restore()
  }

  drawChars() {
    const c = IQGameData.canvasField.get2DContext()
    this.resetFont()
    c.fillStyle = IQGameData.whiteColor

    this._editNameChars.forEach((ch) => {
      c.fillText(ch.character, ch.x, ch.y)
    })
  }
}
