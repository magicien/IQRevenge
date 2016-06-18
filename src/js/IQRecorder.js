'use strict'

import IQGameData from './IQGameData'

/**
 * IQRecorder class
 * This class records time and key states to replay
 * @access public
 */
export default class IQRecorder {
  /**
   * constructor
   * @access public
   * @param {string} data - record data
   * @constructor
   */
  constructor(data) {
    /** @type {Date} */
    this.startTime = null

    /** @type {Array<object>} */
    this.records = []

    /** @type {int} */
    this.elapsedTimeSum = 0

    if(data){
      this.records = this.parseString(data)
    }
  }

  getRecord(index) {
    return this.records[index]
  }

  startRecord() {
    this.startTime = new Date(IQGameData.nowTime.getTime())
    this.records = []
    this.elapsedTimeSum = 0
  }

  addRecord() {
    const listener = IQGameData.keyListener
    this.elapsedTimeSum += IQGameData.elapsedTime
    const record = {
      canvasTime: this.elapsedTimeSum,
      gameTime: IQGameData.nowTime - this.startTime,
      keyState: [
        listener.getKeyState(IQGameData.keyMark),
        listener.getKeyState(IQGameData.keyAdvantage),
        listener.getKeyState(IQGameData.keySpeedUp),
        listener.getKeyState(IQGameData.keyPause),
        listener.getKeyState(IQGameData.keyUp),
        listener.getKeyState(IQGameData.keyDown),
        listener.getKeyState(IQGameData.keyLeft),
        listener.getKeyState(IQGameData.keyRight)
      ],
      keyNewState: [
        listener.getKeyNewState(IQGameData.keyMark),
        listener.getKeyNewState(IQGameData.keyAdvantage),
        listener.getKeyNewState(IQGameData.keySpeedUp),
        listener.getKeyNewState(IQGameData.keyPause),
        listener.getKeyNewState(IQGameData.keyUp),
        listener.getKeyNewState(IQGameData.keyDown),
        listener.getKeyNewState(IQGameData.keyLeft),
        listener.getKeyNewState(IQGameData.keyRight)
      ]
    }
    this.records.push(record)
  }

  keyStateToString(keyState) {
    let result = ''
    keyState.forEach((pushed) => {
      result += pushed ? '1' : '0'
    })
    return result
  }

  stringToKeyState(string) {
    const result = []

    string.split('').forEach((ch) => {
      result.push(ch === '1')
    })

    return result
  }
  
  parseString(string) {
    const result = []

    const lines = string.split('\n')
    lines.forEach((line) => {
      const tokens = line.split(',')
      if(tokens.length === 4){
        result.push({
          canvasTime: parseInt(tokens[0], 10),
          gameTime: parseInt(tokens[1], 10),
          keyState: this.stringToKeyState(tokens[2]),
          keyNewState: this.stringToKeyState(tokens[3])
        })
      }
    })

    return result
  }

  toString() {
    let string = ''
    this.records.forEach((record) => {
      string += record.canvasTime
      string += ',' + record.gameTime
      string += ',' + this.keyStateToString(record.keyState)
      string += ',' + this.keyStateToString(record.keyNewState)
      string += '\n'
    })
    return string
  }
}
