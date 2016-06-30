'use strict'

/**
 * IQTimeExecuter
 * @access public
 */
export default class IQTimeExecuter {
  /**
   * constructor
   * @access public
   * @constructor
   * @param {Array<object>} functions - array of objects which have a function
   * @param {Date} startTime - the time which is used to calculate elapsed time
   */
  constructor(functions, startTime) {
    this._prevTime = -1
    this._functions = functions

    if(typeof startTime !== 'undefined'){
      this._startTime = startTime
    }else{
      this._startTime = new Date()
    }

    this._setupFunctions(functions)
  }

  /**
   * execute appropriate function
   * @access public
   * @param {int} time - elapsed time. If it's not set, it's calculated automatically
   * @returns {void}
   */
  exec(time) {
    const functions = this._functions
    const prevTime = this._prevTime

    let diffTime = time
    if(typeof time === 'undefined'){
      diffTime = (new Date()) - this._startTime
    }

    for(let i=0; i<functions.length; i++){
      const f = functions[i]

      if(f.once){
        if(prevTime < f.time && f.time <= diffTime){
          f.func(f.time, diffTime / f.time, diffTime)
        }
      }else{
        if(f.begin <= diffTime && diffTime < f.end){
          const t = diffTime - f.begin
          f.func(t, t / (f.end - f.begin), diffTime)
        }
      }
    }

    this._prevTime = diffTime
  }

  /**
   * calculate begin/end time of each function
   * @access private
   * @param {Array<object>} functions - array of objects
   * @returns {function} - function to execute the given functions
   */
  _setupFunctions(functions){
    let prevTime = 0
    let prevFunc = null
    functions.forEach((f) => {
      // set start time
      if(f.once){
        if(typeof f.time === 'undefined'){
          if(typeof f.begin === 'undefined'){
            f.time = prevTime
          }else{
            f.time = f.begin
          }
        }
        prevTime = f.time
      }else{
        if(typeof f.begin === 'undefined'){
          if(typeof f.time === 'undefined'){
            f.begin = prevTime
          }else{
            f.begin = f.time
          }
        }
        prevTime = f.begin
      }

      if(prevFunc !== null){
        if(typeof f.time !== 'undefined'){
          prevFunc.end = f.time
        }else{
          prevFunc.end = f.begin
        }
      }
      prevFunc = null

      // set end time
      if(!f.once){
        if(typeof f.end === 'undefined'){
          if(typeof f.duration === 'undefined'){
            prevFunc = f
          }else{
            f.end = f.begin + f.duration
          }
        }

        if(typeof f.end !== 'undefined'){
          prevTime = f.end
        }
      }

      // if function is not set, set an empty function
      if(typeof f.func === 'undefined'){
        f.func = () => { /* do nothing */ }
      }
    })

    if(prevFunc !== null){
      console.warn('IQTimeExecuter: "end" time of the last function is not set')
      prevFunc.end = Number.MAX_VALUE
    }
  }
}

IQTimeExecuter.create = (functions) => {
  const executer = new IQTimeExecuter(functions)
  return (diffTime) => executer.exec(diffTime)
}

