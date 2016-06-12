'use strict'

import {
  DH2DObject
} from '../../modules/DH3DLibrary/src/js/main'
import IQGameData from './IQGameData'
import IQController from './IQController'

/**
 * IQLabel class
 * This label shows and scrolls messages
 * @access public
 */
export default class IQLabel extends DH2DObject {
  /**
   * constructor
   * @access public
   * @constructor
   */
  constructor() {
    super()

    //this._gameData = null

    this._messages = null
    this._messageLength = 8
    this._messageSpeed = 500
    this._messageCycle = 0

    /** @type {Date} */
    this._beforeTime = null

    /** @type {IQGameData} */
    this._gameData = IQGameData

    /** @type {Array} */
    this._messages = []

    /** @type {IQController} */
    this._controller = new IQController()

    /** @type {boolean} */
    this.paused = false
  }

  /**
   * render label
   * @access public
   * @returns {void}
   */
  render() {
    const g = this._gameData
    const c = g.canvasField.get2DContext()

    // setup context
    c.textAlign    = 'center'
    c.textBaseline = 'top'
    c.shadowBlur   = 0

    c.lineCap      = 'butt'
    c.lineJoin     = 'miter'
    c.lineWidth    = 1

    let y = g.canvasHeight * 0.5

    // game over
    if(g.gameOver){
      c.save()

      c.textAlign    = 'center'
      c.textBaseline = 'middle'
      c.font         = '48px bold ' + g.fontFamily
      c.fillStyle    = g.whiteColor
      c.strokeStyle  = g.blackColor

      let str = 'GAME OVER'
      let strlen = str.length
      const diffTime = g.getElapsedTime(g.gameOverTime)
      let dx = 50
      let x = (g.canvasWidth - dx * (strlen - 1)) * 0.5
      //var startTime = g.gameOverTime1 + g.gameOverTime2 + g.gameOverTime3
      const startTime = g.gameOverTime1 + g.gameOverTime2 + g.gameOverTime3 * 0.5

      if(g.testPlay){
        // don't show "GAME OVER" in test play
      }else if(diffTime < startTime){
        // nothing to do
      }else if(diffTime < startTime + g.gameOverRotateTime){
        // show game over
        const t = diffTime - startTime
        const a = t / g.gameOverRotateTime

        for(let i=0; i<strlen; i++){
          const drawChar = str.charAt(i)
          c.save()
          c.transform(a, 0, 0, 1, x, y)
          c.fillText(drawChar, 0, 0)
          c.strokeText(drawChar, 0, 0)
          c.restore()
          x += dx
        }
      }else if(diffTime < startTime + g.gameOverRotateTime + g.gameOverWaitTime){
        // wait
        for(let i=0; i<strlen; i++){
          const drawChar = str.charAt(i)
          c.fillText(drawChar, x, y)
          c.strokeText(drawChar, x, y)
          x += dx
        }
      }else if(diffTime < startTime + g.gameOverRotateTime * 2 + g.gameOverWaitTime){
        // rotate
        const t = diffTime - startTime - g.gameOverRotateTime - g.gameOverWaitTime
        const a = 1.0 - t / g.gameOverRotateTime

        for(let i=0; i<strlen; i++){
          const drawChar = str.charAt(i)
          c.save()
          c.transform(a, 0, 0, 1, x, y)
          c.fillText(drawChar, 0, 0)
          c.strokeText(drawChar, 0, 0)
          c.restore()
          x += dx
        }
      }else if(diffTime < startTime + g.gameOverRotateTime * 3 + g.gameOverWaitTime){
        // show score
        str = new String(g.score)
        strlen = str.length
        dx = 30
        x = (g.canvasWidth - dx * (strlen - 1)) * 0.5
        const t = diffTime - startTime - g.gameOverRotateTime * 2 - g.gameOverWaitTime
        const a = t / g.gameOverRotateTime

        for(let i=0; i<strlen; i++){
          const drawChar = str.charAt(i)
          c.save()
          c.transform(a, 0, 0, 1, x, y)
          c.fillText(drawChar, 0, 0)
          c.strokeText(drawChar, 0, 0)
          c.restore()
          x += dx
        }
      }else if(diffTime < startTime + g.gameOverRotateTime * 4 + g.gameOverWaitTime * 2){
        // wait
        str = new String(g.score)
        strlen = str.length
        dx = 30
        x = (g.canvasWidth - dx * (strlen - 1)) * 0.5
        for(let i=0; i<strlen; i++){
          const drawChar = str.charAt(i)
          c.fillText(drawChar, x, y)
          c.strokeText(drawChar, x, y)
          x += dx
        }
      }else if(diffTime < startTime + g.gameOverRotateTime * 5 + g.gameOverWaitTime * 2){
        // rotate and fade out
        str = new String(g.score)
        strlen = str.length
        dx = 30
        x = (g.canvasWidth - dx * (strlen - 1)) * 0.5
        const t = diffTime - startTime - g.gameOverRotateTime * 4 - g.gameOverWaitTime * 2
        const a = 1.0 - t / g.gameOverRotateTime

        c.fillStyle = 'rgba(0, 0, 0, ' + (1.0 - a) + ')'
        c.fillRect(0, 0, g.canvasWidth, g.canvasHeight)

        c.fillStyle = g.whiteColor
        for(let i=0; i<strlen; i++){
          const drawChar = str.charAt(i)
          c.save()
          c.transform(a, 0, 0, 1, x, y)
          c.fillText(drawChar, 0, 0)
          c.strokeText(drawChar, 0, 0)
          c.restore()
          x += dx
        }
      }else if(diffTime < startTime + g.gameOverRotateTime * 5 + g.gameOverWaitTime * 2 + g.gameOverIQTime1){
        // show I.Q string
        const t = diffTime - startTime - g.gameOverRotateTime * 5 - g.gameOverWaitTime * 2
        const a = 1.0 - t / g.gameOverIQTime1

        c.fillStyle = g.blackColor
        c.fillRect(0, 0, g.canvasWidth, g.canvasHeight)
        c.fillStyle = g.whiteColor

        dx = 30
        x = g.canvasWidth * 0.5 - dx * 3.5
        c.fillText('I', x,      y)
        c.fillText('.', x+dx,   y)
        c.fillText('Q', x+dx*2, y)

        c.fillStyle = g.blackColor
        // I
        const w = 10
        const h = 20
        c.fillRect(x - w, y - h, 2 * w, 2 * h * a)

        // Q
        const r = 30
        c.beginPath()
        c.moveTo(x+dx*2, y)
        c.lineTo(x+dx*2+r, y)
        c.arc(x+dx*2, y, r,       0, Math.PI * a, false)
        c.closePath()
        c.fill()

        c.beginPath()
        c.moveTo(x+dx*2, y)
        c.lineTo(x+dx*2-r, y)
        c.arc(x+dx*2, y, r, Math.PI, Math.PI * (1.0 + a), false)
        c.closePath()
        c.fill()
      }else if(diffTime < startTime + g.gameOverRotateTime * 5 + g.gameOverWaitTime * 2
                                    + g.gameOverIQTime1 + g.gameOverIQTime2){
        // show I.Q point
        const t = diffTime - startTime - g.gameOverRotateTime * 5 - g.gameOverWaitTime * 2
                         - g.gameOverIQTime1
        let a = (t / g.gameOverIQTime2 - 0.5) * 2
        if(a < 0)
          a = 0

        c.fillStyle = g.blackColor
        c.fillRect(0, 0, g.canvasWidth, g.canvasHeight)

        c.fillStyle = g.whiteColor
        dx = 30
        x = g.canvasWidth * 0.5 - dx * 3.5
        c.fillText('I', x,      y)
        c.fillText('.', x+dx,   y)
        c.fillText('Q', x+dx*2, y)

        c.fillStyle = 'rgba(255, 255, 255, ' + a + ')'
        c.strokeStyle = 'rgba(0, 0, 0, ' + a + ')'
        str = new String(g.iqPoint)
        strlen = str.length
        x = g.canvasWidth * 0.5 + dx * 1.5
        for(let i=0; i<strlen; i++){
          const drawChar = str.charAt(i)
          c.fillText(drawChar, x, y)
          x += dx
        }
      }else{
        // wait until player pushes any key
        c.fillStyle = g.blackColor
        c.fillRect(0, 0, g.canvasWidth, g.canvasHeight)

        c.fillStyle = g.whiteColor
        dx = 30
        x = g.canvasWidth * 0.5 - dx * 3.5
        c.fillText('I', x,      y)
        c.fillText('.', x+dx,   y)
        c.fillText('Q', x+dx*2, y)

        str = new String(g.iqPoint)
        strlen = str.length
        x = g.canvasWidth * 0.5 + dx * 1.5
        for(let i=0; i<strlen; i++){
          const drawChar = str.charAt(i)
          c.fillText(drawChar, x, y)
          x += dx
        }
      }

      c.restore()

      return
    } // if(g.gameOver)

    if(g.gameOverFadeOut){
      // fade out 
      const diffTime = g.getElapsedTime(g.gameOverFadeOutStartTime)
      let alpha = diffTime / g.gameOverFadeOutTime
      if(alpha > 1.0)
        alpha = 1.0

      c.fillStyle = g.blackColor
      c.fillRect(0, 0, g.canvasWidth, g.canvasHeight)

      c.fillStyle = g.whiteColor
      const dx = 30
      let x = g.canvasWidth * 0.5 - dx * 3.5
      c.fillText('I', x,      y)
      c.fillText('.', x+dx,   y)
      c.fillText('Q', x+dx*2, y)

      const str = new String(g.iqPoint)
      const strlen = str.length
      x = g.canvasWidth * 0.5 + dx * 1.5
      for(let i=0; i<strlen; i++){
        const drawChar = str.charAt(i)
        c.fillText(drawChar, x, y)
        x += dx
      }
      c.fillStyle = 'rgba(0, 0, 0, ' + alpha + ')'
      c.fillRect(0, 0, g.canvasWidth, g.canvasHeight)

      return
    } // if(g.gameOverFadeOut)

    // game complete
    if(g.ending){
      c.save()
      
      c.textAlign    = 'center'
      c.textBaseline = 'middle'
      c.font         = '48px bold ' + g.fontFamily
      c.fillStyle    = g.whiteColor
      c.strokeStyle  = g.blackColor

      const diffTime = g.getElapsedTime(g.endingStartTime)
      const time1 = g.endingWaitTime
      const time2 = time1 + g.endingScoreRotateTime
      const time3 = time2 + g.endingScoreWaitTime
      const time4 = time3 + g.endingScoreRotateTime
      const time5 = time4 + g.endingIQTime1
      const time6 = time5 + g.endingIQTime2

      const scoreStr = new String(g.score)
      const scoreStrLen = scoreStr.length
      let dx = 30
      let x = (g.canvasWidth - dx * (scoreStrLen - 1)) * 0.5

      if(diffTime < time1){
        // nothing to do
        c.fillStyle = g.blackColor
        c.fillRect(0, 0, g.canvasWidth, g.canvasHeight)
      }else if(diffTime < time2){
        // rotate score
        const t = diffTime - time1
        const a = t / g.endingScoreRotateTime
        for(let i=0; i<scoreStrLen; i++){
          const drawChar = scoreStr.charAt(i)
          c.save()
          c.transform(a, 0, 0, 1, x, y)
          c.fillText(drawChar, 0, 0)
          c.strokeText(drawChar, 0, 0)
          c.restore()
          x += dx
        }
      }else if(diffTime < time3){
        // show score
        for(let i=0; i<scoreStrLen; i++){
          const drawChar = scoreStr.charAt(i)
          c.fillText(drawChar, x, y)
          c.strokeText(drawChar, x, y)
          x += dx
        }
      }else if(diffTime < time4){
        // rotate score
        const t = diffTime - time3
        const a = 1.0 - t / g.endingScoreRotateTime

        c.fillStyle = g.whiteColor
        for(let i=0; i<scoreStrLen; i++){
          const drawChar = scoreStr.charAt(i)
          c.save()
          c.transform(a, 0, 0, 1, x, y)
          c.fillText(drawChar, 0, 0)
          c.strokeText(drawChar, 0, 0)
          c.restore()
          x += dx
        }
      }else if(diffTime < time5){
        // show I.Q string
        const t = diffTime - time4
        const a = 1.0 - t / g.endingIQTime1

        c.fillStyle = g.blackColor
        c.fillRect(0, 0, g.canvasWidth, g.canvasHeight)
        c.fillStyle = g.whiteColor

        dx = 30
        x = g.canvasWidth * 0.5 - dx * 3.5
        c.fillText('I', x,      y)
        c.fillText('.', x+dx,   y)
        c.fillText('Q', x+dx*2, y)

        c.fillStyle = g.blackColor
        // I
        const w = 10
        const h = 20
        c.fillRect(x - w, y - h, 2 * w, 2 * h * a)

        // Q
        const r = 30
        c.beginPath()
        c.moveTo(x+dx*2, y)
        c.lineTo(x+dx*2+r, y)
        c.arc(x+dx*2, y, r,       0, Math.PI * a, false)
        c.closePath()
        c.fill()

        c.beginPath()
        c.moveTo(x+dx*2, y)
        c.lineTo(x+dx*2-r, y)
        c.arc(x+dx*2, y, r, Math.PI, Math.PI * (1.0 + a), false)
        c.closePath()
        c.fill()
      }else if(diffTime < time6){
        // show I.Q point
        const t = diffTime - time5
        let a = (t / g.endingIQTime2 - 0.5) * 2
        if(a < 0)
          a = 0

        c.fillStyle = g.blackColor
        c.fillRect(0, 0, g.canvasWidth, g.canvasHeight)

        c.fillStyle = g.whiteColor
        dx = 30
        x = g.canvasWidth * 0.5 - dx * 3.5
        c.fillText('I', x,      y)
        c.fillText('.', x+dx,   y)
        c.fillText('Q', x+dx*2, y)

        c.fillStyle = 'rgba(255, 255, 255, ' + a + ')'
        c.strokeStyle = 'rgba(0, 0, 0, ' + a + ')'
        const str = new String(g.iqPoint)
        const strlen = str.length
        x = g.canvasWidth * 0.5 + dx * 1.5
        for(let i=0; i<strlen; i++){
          const drawChar = str.charAt(i)
          c.fillText(drawChar, x, y)
          x += dx
        }
      }else{
        // wait until player pushes any key
        c.fillStyle = g.blackColor
        c.fillRect(0, 0, g.canvasWidth, g.canvasHeight)

        c.fillStyle = g.whiteColor
        dx = 30
        x = g.canvasWidth * 0.5 - dx * 3.5
        c.fillText('I', x,      y)
        c.fillText('.', x+dx,   y)
        c.fillText('Q', x+dx*2, y)

        const str = new String(g.iqPoint)
        const strlen = str.length
        x = g.canvasWidth * 0.5 + dx * 1.5
        for(let i=0; i<strlen; i++){
          const drawChar = str.charAt(i)
          c.fillText(drawChar, x, y)
          x += dx
        }
      }

      c.restore()
      return
    } // if(g.ending)


    // stage number
    c.font         = '24px ' + g.fontFamily
    c.fillStyle    = g.whiteColor
    c.strokeStyle  = g.whiteColor
    c.fillText(g.stage, 50, 27)
    c.strokeText(g.stage, 50, 27)

    c.strokeRect(35, 25, 30, 30)

    // sub stage
    let squareLeft = 70
    let squareTop = 27
    let squareWidth = 20
    let squareHeight = 10
    let padding = 3
    c.fillStyle = g.blueColor
    let x = squareLeft
    for(let i=0; i<g.subStageMax; i++){
      if(i < g.subStage){
        c.fillRect(x, squareTop, squareWidth, squareHeight)
      }
      c.strokeRect(x, squareTop, squareWidth, squareHeight)
      x += padding + squareWidth
    }

    // score
    c.textAlign    = 'right'
    c.font         = '14px ' + g.fontFamily
    c.fillStyle    = g.whiteColor
    c.strokeStyle  = g.blackColor
    c.strokeText(g.score, 135, 40)
    c.fillText(g.score, 135, 40)

    // step
    c.textAlign    = 'center'
    c.font         = '16px ' + g.fontFamily
    if(g.step < g.baseStep){
      c.fillStyle   = g.blueColor
      c.strokeStyle = g.blueColor
    }else if(g.step === g.baseStep){
      c.fillStyle   = g.whiteColor
      c.strokeStyle = g.whiteColor
    }else{
      c.fillStyle   = g.redColor
      c.strokeStyle = g.redColor
    }
    c.fillText(g.step,     570, 40)
    c.fillText(g.baseStep, 570, 66)
    c.beginPath()
    c.moveTo(555, 61)
    c.lineTo(585, 61)
    c.closePath()
    c.stroke()


    // penalty
    squareLeft = 600
    squareTop = 320
    squareWidth = 10
    squareHeight = 10
    padding = 5
    x = squareLeft
    for(let i=0; i<g.penaltyMax - 1; i++){
      if(i < g.penalty){
        c.fillStyle = g.redColor
      }else{
        c.fillStyle = g.grayColor
      }
      c.fillRect(x, squareTop, squareWidth, squareHeight)
      x -= squareWidth + padding
    }


    // stage name
    if(g.stageStarting){
      c.textAlign    = 'center'
      c.font         = '32px ' + g.fontFamily
      c.fillStyle    = g.whiteColor
      c.strokeStyle  = g.blackColor
      c.fillText(g.stageName, 320, 180)
      c.strokeText(g.stageName, 320, 180)
    }

    this._drawMessages()

    // again
    if(g.again){
      c.save()

      c.textAlign    = 'center'
      c.textBaseline = 'middle'
      c.font         = '48px bold ' + g.fontFamily
      c.fillStyle    = g.whiteColor
      c.strokeStyle  = g.blackColor

      const str = 'Again!'
      const strlen = str.length
      const diffTime = g.getElapsedTime(g.againTime)
      const dx = 50
      x = (g.canvasWidth - dx * (strlen - 1)) * 0.5

      if(diffTime > g.againRotateTime * 2 + g.againWaitTime){
        g.again = false
      }else if(diffTime > g.againRotateTime + g.againWaitTime){
        // rotate
        const t = diffTime - g.againRotateTime - g.againWaitTime
        const a = 1.0 - t / g.perfectRotateTime

        for(let i=0; i<strlen; i++){
          const drawChar = str.charAt(i)
          c.save()
          c.transform(a, 0, 0, 1, x, y)
          c.fillText(drawChar, 0, 0)
          c.strokeText(drawChar, 0, 0)
          c.restore()
          x += dx
        }
      }else if(diffTime > g.againRotateTime){
        // wait
        for(let i=0; i<strlen; i++){
          const drawChar = str.charAt(i)
          c.fillText(drawChar, x, y)
          c.strokeText(drawChar, x, y)
          x += dx
        }
      }else{
        // show
        const t = diffTime
        const a = t / g.perfectRotateTime

        for(let i=0; i<strlen; i++){
          const drawChar = str.charAt(i)
          c.save()
          c.transform(a, 0, 0, 1, x, y)
          c.fillText(drawChar, 0, 0)
          c.strokeText(drawChar, 0, 0)
          c.restore()
          x += dx
        }
      }
      c.restore()
    }

    // perfect
    if(g.perfect){
      c.save()
      c.textAlign    = 'center'
      c.textBaseline = 'middle'
      c.font         = '48px bold ' + g.fontFamily
      c.fillStyle    = g.whiteColor
      c.strokeStyle  = g.blackColor

      const str = g.perfectString
      const strlen = str.length
      let diffTime = g.getElapsedTime(g.perfectTime)
      const dx = 50
      x = (g.canvasWidth - dx * (strlen - 1)) * 0.5

      if(diffTime > g.perfectStringTime + g.perfectWaitTime){
        // rotate
        const t = diffTime - g.perfectStringTime - g.perfectWaitTime
        const a = 1.0 - t / g.perfectRotateTime

        for(let i=0; i<strlen; i++){
          const drawChar = str.charAt(i)
          c.save()
          c.transform(a, 0, 0, 1, x, y)
          c.fillText(drawChar, 0, 0)
          c.strokeText(drawChar, 0, 0)
          c.restore()
          x += dx
        }
      }else if(diffTime > g.perfectStringTime){
        // wait
        for(let i=0; i<strlen; i++){
          const drawChar = str.charAt(i)
          c.fillText(drawChar, x, y)
          c.strokeText(drawChar, x, y)
          x += dx
        }
      }else{
        // show
        if(diffTime <= 0)
          diffTime = 0.001

        const moveTime = 400
        const delay = (g.perfectStringTime - moveTime) / (strlen - 1)

        const tx = g.canvasWidth * 0.5
        x -= tx
        for(let i=0; i<strlen; i++){
          const drawChar = str.charAt(i)
          let scale = 1.0
          if(diffTime < moveTime){
            scale = 0.3 + 0.7 * moveTime / diffTime
          }

          c.save()
          c.transform(scale, 0, 0, scale, tx, y)
          c.fillText(drawChar, x, 0)
          c.strokeText(drawChar, x, 0)
          c.restore()

          x += dx
          diffTime -= delay
          if(diffTime < 0)
            break
        }
      }
      c.restore()
    } // if(g.perfect)

    // stage clear
    if(g.stageClear){
      c.save()

      c.textAlign    = 'center'
      c.textBaseline = 'middle'
      c.font         = '48px bold ' + g.fontFamily
      c.fillStyle    = g.whiteColor
      c.strokeStyle  = g.blackColor

      let str = g.messageClear
      let strlen = str.length
      const diffTime = g.getElapsedTime(g.clearTime)
      let dx = 50
      x = (g.canvasWidth - dx * (strlen - 1)) * 0.5

      const countStartTime = g.clearRotateTime * 2 + g.clearLabelTime
      if(diffTime > countStartTime){
        // bonus score count
        str = g.messageBonus
        strlen = str.length
        dx = 40
        x = (g.canvasWidth - dx * (strlen - 1)) * 0.5
        y = g.canvasHeight * 0.5 - dx * 0.75
        for(let i=0; i<strlen; i++){
          const drawChar = str.charAt(i)
          c.fillText(drawChar, x, y)
          c.strokeText(drawChar, x, y)
          x += dx
        }

        // draw bonus point
        str = g.bonusScore.toString()
        strlen = str.length
        x = (g.canvasWidth - dx * (strlen - 1)) * 0.5
        y = g.canvasHeight * 0.5 + dx * 0.75
        for(let i=0; i<strlen; i++){
          const drawChar = str.charAt(i)
          c.fillText(drawChar, x, y)
          c.strokeText(drawChar, x, y)
          x += dx
        }
      }else if(diffTime > g.clearRotateTime + g.clearLabelTime){
        // rotate
        const t = diffTime - g.clearRotateTime - g.clearLabelTime
        const a = 1.0 - t / g.clearRotateTime

        for(let i=0; i<strlen; i++){
          const drawChar = str.charAt(i)
          c.save()
          c.transform(a, 0, 0, 1, x, y)
          c.fillText(drawChar, 0, 0)
          c.strokeText(drawChar, 0, 0)
          c.restore()
          x += dx
        }
      }else if(diffTime > g.clearRotateTime){
        // wait
        for(let i=0; i<strlen; i++){
          const drawChar = str.charAt(i)
          c.fillText(drawChar, x, y)
          c.strokeText(drawChar, x, y)
          x += dx
        }
      }else{
        // rotate
        const t = diffTime
        const a = t / g.clearRotateTime

        for(let i=0; i<strlen; i++){
          const drawChar = str.charAt(i)
          c.save()
          c.transform(a, 0, 0, 1, x, y)
          c.fillText(drawChar, 0, 0)
          c.strokeText(drawChar, 0, 0)
          c.restore()
          x += dx
        }
      }
      c.restore()
    } // if(g.stageClear)

    if(IQGameData.rulePlay){
      const data = IQGameData.rulesCurrentAudio
      const pauseData = IQGameData.rulesCurrentPause
      const time = IQGameData.rulesElapsedTime

      // for debug
      c.fillStyle = IQGameData.whiteColor
      c.fillText(time, 500, 30)

      if(pauseData && pauseData.spotX !== undefined){
        // draw spot light
        c.fillStyle = 'rgba(255, 255, 255, 0.5)'
        c.beginPath()
        c.arc(pauseData.spotX, pauseData.spotY, IQGameData.rulesSpotLightRadius, 0, 2 * Math.PI)
        c.rect(IQGameData.canvasWidth, 0, -IQGameData.canvasWidth, IQGameData.canvasHeight)
        c.fill("evenodd")
      }

      if(data){
        const startTime = data.time
        const endTime = data.time + data.duration
        if(data.type === 'audio' && data.text.length > 0){
          if(startTime <= time && time < endTime){
            let alpha = 1.0
            if(time < startTime + IQGameData.rulesTextFadeTime){
              // Fade in
              alpha = (time - startTime) / IQGameData.rulesTextFadeTime
            }else if(time < endTime - IQGameData.rulesTextFadeTime){
              alpha = 1.0
            }else{
              // Fade out
              alpha = (endTime - time) / IQGameData.rulesTextFadeTime
            }
            if(alpha > 1.0){
              console.log('something is wrong')
            }
            const textAlpha = alpha
            const bgAlpha = textAlpha * 0.5

            y = 80
            let center = IQGameData.canvasWidth / 2
            padding = 10
            const textHeight = 18

            // back ground
            const bgHeight = (padding + textHeight) * data.text.length + padding
            c.fillStyle = `rgba(0, 0, 0, ${bgAlpha})`
            //console.log(`bgAlpha: ${bgAlpha}`)
            c.fillRect(0, y, IQGameData.canvasWidth, bgHeight)

            // text
            //c.strokeStyle = `rgba(0, 0, 0, ${alpha})`
            c.fillStyle = `rgba(255, 255, 255, ${alpha})`
            c.font = `${textHeight}px bold ${g.fontFamily}`
            c.textAlgin = 'center'
            c.textBaseline = 'middle'

            y += padding + textHeight * 0.5
            data.text.forEach((text) => {
              c.fillText(text, center, y) 
              //c.strokeText(text, center, y) 
              y += padding + textHeight
            })
          }
        }else if(data.type === 'pause'){
          // TODO: implement
        }
      }
    } // if(g.rulePlay)

    // draw controller for mobile
    if(g.device.isMobile || g.device.isTablet){
      this._controller.render(c)
    }

    if(g.pausing){
      // make the screen darker
      c.fillStyle = 'rgba(0, 0, 0, 0.8)'
      c.fillRect(0, 0, g.canvasWidth, g.canvasHeight)

      if(g.device.isMobile || g.device.isTablet){
        this._controller.drawResumeButton(c)
      }


    } // if(g.pausing)
  }

  /**
   * add message to this label
   * @access public
   * @param {string} message - message to add
   * @returns {void}
   */
  addMessage(message) {
    let i = this._messageLength
    while(this._messages[i]){
      i++
    }
    this._messages[i] = message
  }

  /**
   * add time to timer for reducing time of pausing
   * @access public
   * @param {int} ms - time to add (ms)
   * @returns {void}
   */
  addTime(ms) {
    if(this._beforeTime){
      this._beforeTime.setMilliseconds(this._beforeTime.getMilliseconds() + ms)
      this._messageCycle += Math.floor(ms / this._messageSpeed) * this._messageSpeed
    }
  }

  /**
   * draw messages
   * @access private
   * @returns {void}
   */
  _drawMessages() {
    const g = this._gameData
    const c = g.canvasField.get2DContext()

    if(!this._beforeTime){
      //this._beforeTime = g.nowTime
      this._beforeTime = new Date(g.nowTime.getTime())
      this._messageCycle = Math.floor(g.nowTime / this._messageSpeed) * this._messageSpeed
    }
    while(this._messageCycle + this._messageSpeed < g.nowTime){
      for(let i=0; i<this._messages.length; i++){
        this._messages[i] = this._messages[i+1]
      }
      this._messages[this._messages.length] = null

      this._messageCycle += this._messageSpeed
    }
    const delta = g.getElapsedTime(this._messageCycle)

    const dy = 25
    let y = 70 + dy * (1 - delta / this._messageSpeed)
    const lastA  = delta / this._messageSpeed
    const firstA = 1.0 - lastA
    const lastColor  = 'rgba(255, 255, 255, ' + lastA  + ')'
    const firstColor = 'rgba(255, 255, 255, ' + firstA + ')'

    c.textAlign    = 'center'
    c.textBaseline = 'middle'
    c.font         = '14px bold ' + g.fontFamily

    const fx = 40
    const dx = 10
    for(let i=0; i<this._messageLength; i++, y+=dy){
      if(i === 0){
        c.fillStyle = firstColor
        c.strokeStyle = firstColor
      }else if(i === this._messageLength-1){
        c.fillStyle = lastColor
        c.strokeStyle = lastColor
      }else{
        c.fillStyle = g.whiteColor
        c.strokeStyle = g.whiteColor
      }
      const str = this._messages[i]
      if(!str){
        continue
      }

      let x = fx
      for(let j=0; j<str.length; j++, x+=dx){
        const ch = str.charAt(j)
        c.fillText(ch, x, y)
        c.strokeText(ch, x, y)
      }
    }

    this._beforeTime = new Date(g.nowTime.getTime())
  }

  pause() {
    if(this.paused){
      return
    }
    this.paused = true
  }

  resume(pausedTime = 0) {
    if(!this.paused){
      return
    }
    this.paused = false

    this.addTime(pausedTime)
  }
}
