'use strict'

import {
  AjaxRequest,
  Bone,
  Camera,
  DH3DObject,
  Light,
  MMDAnimator,
  ModelBank,
  MotionBank,
  Vector3,
  Vector4,
  SimpleRenderer
} from '../../modules/DH3DLibrary/src/js/main'
import CookieManager from '../../modules/CookieManager/cookiemanager'

import IQCanvas from './IQCanvas'
import IQCube from './IQCube'
import IQEffectPlate from './IQEffectPlate'
import IQFaceCube from './IQFaceCube'
import IQGameData from './IQGameData'
import IQKeyListener from './IQKeyListener'
import IQLabel from './IQLabel'
import IQMarker from './IQMarker'
import IQMarkerPlate from './IQMarkerPlate'
import IQMenu from './IQMenu'
import IQNameEditor from './IQNameEditor'
import IQPlayer from './IQPlayer'
import IQQuestion from './IQQuestion'
import IQRecorder from './IQRecorder'
import IQSceneChanger from './IQSceneChanger'
import IQStage from './IQStage'
import IQTimeExecuter from './IQTimeExecuter'

const g = IQGameData

function playerMoveCallback() {
  if(g.pausing){
    return
  }

  if(!g.gameOver && !g.stageClear){
    if(g.playerObj._position.x < g.minX){
      g.playerObj._position.x = g.minX
    }else if(g.playerObj._position.x > g.maxX){
      g.playerObj._position.x = g.maxX
    }

    if(g.playerObj._position.z < g.moveMinZ){
      g.playerObj._position.z = g.moveMinZ
    }else if(g.playerObj._position.z > g.maxZ){
      g.playerObj._position.z = g.maxZ
    }

    // FIXME
    const oldPosX = g.playerObj.oldPositionX
    const oldPosZ = g.playerObj.oldPositionX
    const newPosX = g.playerObj._position.x
    const newPosZ = g.playerObj._position.z
    const oldX = g.playerObj.oldX
    const oldZ = g.playerObj.oldZ
    let newX = Math.floor((newPosX - g.minX) / g.cubeSize)
    let newZ = Math.floor((newPosZ - g.minZ) / g.cubeSize)
    let bigX = 0
    let bigZ = 0

    // value check
    if(newX < 0)
      newX = 0
    else if(newX >= g.stageWidth)
      newX = g.stageWidth - 1

    if(newZ < 0)
      newZ = 0
    else if(newZ >= g.stageLength)
      newZ = g.stageLength - 1

    if(oldX > newX){
      bigX = oldX
    }else{
      bigX = newX
    }
    if(oldZ > newZ){
      bigZ = oldZ
    }else{
      bigZ = newZ
    }

    if(oldX !== newX || oldZ !== newZ){
      const e = 0.0001
      const c = getCubeAt(newZ, newX)
      let backX = false
      let backZ = false

      if(g.rotating){
        const co = getCubeAt(oldZ, oldX)
        const cn = getCubeAt(newZ - 1, newX)
        if(oldX === newX){
          if(c){
            if(oldZ > newZ || co || cn){
              backZ = true
            }
          }else{
            if(oldZ < newZ && co){
              backZ = true
            }
          }
        }else if(oldZ === newZ){
          if(c){
            if(cn){
              backX = true
            }
          }
        }else{
          const cx = getCubeAt(oldZ, newX)
          const cz = getCubeAt(newZ, oldX)

          if(c){
            if(cx){
              if(cn){
                backX = true
              }
            }
            if(cz){
              if(oldZ > newZ || co || cn){
                backZ = true
              }
            }
          }else{
            const tanXPosX = g.minX + bigX * g.cubeSize
            const tanXPosZ = oldPosZ + (newPosZ - oldPosZ) * (tanXPosX - oldPosX) / (newPosX - oldPosX)
            const tanZ = Math.floor((tanXPosZ - g.minZ) / g.cubeSize)
            const tanZPosZ = g.minZ + bigZ * g.cubeSize

            if(cx && cz){
              if(oldZ > newZ){
                if(tanZ === newZ){
                  g.playerObj._position.z -= tanXPosZ - tanZPosZ
                }
              }else{
                if(co || tanZ !== newZ){
                  backZ = true
                }
              }
            }else if(cx){
              if(oldZ < newZ){
                if(co || tanZ !== newZ){
                  backZ = true
                }
              }
            }else if(cz){
              if(oldZ < newZ){
                if(tanZ === newZ){
                  g.playerObj._position.z -= tanXPosZ - tanZPosZ
                }
              }else{
                if(co && tanZ === newZ){
                  g.playerObj._position.z -= tanXPosZ - tanZPosZ
                }
              }
            }else{
              // nothing to do
            }
          }
        }

      }else{
        // g.rotating is false
        if(oldX === newX){
          if(c){
            backZ = true
          }
        }else if(oldZ === newZ){
          if(c){
            backX = true
          }
        }else{
          const cx = getCubeAt(oldZ, newX)
          const cz = getCubeAt(newZ, oldX)

          if(c){
            if(cx){
              backX = true
            }
            if(cz){
              backZ = true
            }
          }else{
            const tanXPosX = g.minX + bigX * g.cubeSize
            const tanXPosZ = oldPosZ + (newPosZ - oldPosZ) * (tanXPosX - oldPosX) / (newPosX - oldPosX)
            const tanZ = Math.floor((tanXPosZ - g.minZ) / g.cubeSize)
            const tanZPosZ = g.minZ + bigZ * g.cubeSize
            const tanZPosX = oldPosX + (newPosX - oldPosX) * (tanZPosZ - oldPosZ) / (newPosZ - oldPosZ)
            //const tanX = Math.floor((tanZPosX - g.minX) / g.cubeSize)

            if(cx && cz){
              backX = true
              backZ = true
            }else if(cx){
              if(tanZ !== newZ){
                g.playerObj._position.x -= tanZPosX - tanXPosX
              }
            }else if(cz){
              if(tanZ === newZ){
                g.playerObj._position.z -= tanXPosZ - tanZPosZ
              }
            }else{
              if(tanZ === newZ){
                backX = true
              }else{
                backZ = true
              }
            }
          }
        }
      }

      if(g.breaking && newZ === g.stageObj.stageLength && newX >= g.breakTopCubeX){
        // check breaking cube
        if(oldZ === newZ){
          backX = true
        }else{
          backZ = true
        }
      }

      if(backX){
        if(newX > oldX){
          g.playerObj._position.x = g.minX + newX * g.cubeSize - e
        }else{
          g.playerObj._position.x = g.minX + oldX * g.cubeSize
        }
      }
      if(backZ){
        if(newZ > oldZ){
          g.playerObj._position.z = g.minZ + newZ * g.cubeSize - e
        }else{
          g.playerObj._position.z = g.minZ + oldZ * g.cubeSize
        }
      }
    }
    g.playerObj.oldPositionX = g.playerObj._position.x
    g.playerObj.oldPositionZ = g.playerObj._position.z
    g.playerObj.oldX = Math.floor((g.playerObj._position.x - g.minX) / g.cubeSize)
    g.playerObj.oldZ = Math.floor((g.playerObj._position.z - g.minZ) / g.cubeSize)
  } // !g.gameOver


  //////////////////////////////////////////////////////////////////////////////////
  // camera setting
  //////////////////////////////////////////////////////////////////////////////////
  const bindOffsetX = 0
  let bindOffsetY = 15.0
  const bindOffsetZ = 0
  const pos = g.playerObj._position

  g.camera.distance = g.cameraDistanceDuringGame

  if(g.gameOver){
    // game over
    const diffTime = g.getElapsedTime(g.gameOverTime)

    g.cameraTargetXGoal = pos.x
    g.cameraTargetYGoal = pos.y
    g.cameraTargetZGoal = pos.z

    if(diffTime > g.gameOverTime1 + g.gameOverTime2){
      if(g.testPlay){
        quitTestPlay()
      }else if(g.playSharedStage){
        quitSharedStage()
      }
    }

    if(diffTime < g.gameOverTime1){
      g.cameraXAngleGoal = -0.8
      g.cameraYAngleGoal = Math.PI
      g.cameraTargetYGoal = 0
    }else if(diffTime < g.gameOverTime1 + g.gameOverTime2){
      const r = (diffTime - g.gameOverTime1) / g.gameOverTime2
      g.cameraXAngleGoal = 0.8 - 1.6 * r
      if(g.cameraXAngleGoal > 0){
        g.cameraXAngleGoal = 0
      }else{
        // nothing to do
      }
      g.cameraYAngleGoal = Math.PI * 1.10

      g.hogeY = pos.y
    }else if(diffTime < g.gameOverTime1 + g.gameOverTime2 + g.gameOverTime3){
      const dy = 100
      const dz = 250
      const ox = pos.x
      const oy = g.hogeY - dy
      const oz = pos.z + dz
      const cx = pos.x
      const cy = pos.y
      const cz = pos.z
      g.camera.lookat(ox, oy, oz, cx, cy, cz, 0, 1, 0)
      return
    }else{
      const ox = pos.x
      const oy = g.hogeY - 100
      const oz = pos.z + 100
      const cx = pos.x
      const cy = pos.y
      const cz = pos.z
      g.camera.lookat(ox, oy, oz, cx, cy, cz, 0, 1, 0)
      return
    }
    g.cameraXAngle = g.cameraXAngleGoal
    g.cameraYAngle = g.cameraYAngleGoal
    g.cameraTargetX = g.cameraTargetXGoal
    g.cameraTargetY = g.cameraTargetYGoal
    g.cameraTargetZ = g.cameraTargetZGoal
    // <- g.gameOver
  }else if(g.stageStarting){
    // start
    const speed = g.cubeSize * 1000.0 / g.stageCreateDelay
    const startZ = g.minZ
    const step1Time = (pos.z - startZ) / speed * 1000.0
    const diffTime = g.getElapsedTime(g.stageCreateStartTime)

    if(diffTime > step1Time){
      g.stageStarting = false
      if(!g.rulePlay){
        // there's no BGM in 'RULES'
        IQSceneChanger.change(0, false, g.bgm_stagecall, g.bgm_stage, null, null)
      }

      g.cameraXAngleGoal = -0.3
      g.cameraYAngleGoal = Math.PI
      g.cameraTargetXGoal = pos.x
      g.cameraTargetYGoal = pos.y
      g.cameraTargetZGoal = pos.z
    }else{
      const rate = diffTime / step1Time
      g.cameraXAngleGoal = -0.3 * rate
      bindOffsetY *= rate
      g.cameraYAngleGoal = Math.PI * (1.5 - 0.5 * rate)
      g.cameraTargetXGoal = 0
      g.cameraTargetYGoal = 0
      g.cameraTargetZGoal = startZ + diffTime * speed * 0.001
    }
  }else if(g.stageClear){
    let diffTime = g.getElapsedTime(g.clearTime)
    const clearWaitTime = g.clearRotateTime * 2 + g.clearLabelTime
    let moveMaxTime = clearWaitTime + g.clearLineMoveTime * g.stageLength

    if(diffTime >= moveMaxTime){
      g.cameraXAngleGoal = -0.3
      g.cameraYAngleGoal = Math.PI * 1.10
      g.cameraTargetXGoal = 0
      g.cameraTargetYGoal = 0
      g.cameraTargetZGoal = g.stageLength * g.cubeSize
    }else if(diffTime >= clearWaitTime){
      diffTime -= clearWaitTime
      moveMaxTime -= clearWaitTime

      g.cameraXAngleGoal = -0.2
      g.cameraYAngleGoal = Math.PI * 1.4
      g.cameraTargetXGoal = g.stageWidth * g.cubeSize * 0.25
      g.cameraTargetYGoal = 0
      g.cameraTargetZGoal = (diffTime / moveMaxTime) * (g.stageLength - 1) * g.cubeSize
    }else{
      g.cameraXAngleGoal = -0.3
      g.cameraYAngleGoal = Math.PI * 1.10
      g.cameraTargetXGoal = 0
      g.cameraTargetYGoal = 0
      g.cameraTargetZGoal = g.stageLength * g.cubeSize
    }
  }else if(g.speedUp || g.speedUpByMiss || g.perfect){
    // speed up
    g.cameraXAngleGoal = -0.3
    g.cameraYAngleGoal = Math.PI * 1.10
    g.cameraTargetXGoal = 0
    g.cameraTargetYGoal = 0
    g.cameraTargetZGoal = g.stageLength * g.cubeSize
  }else if(g.ending){
    switch(g.endingPhase){
      case g.ENDING_PHASE_ADDSTAGE:
      case g.ENDING_PHASE_WAIT_1: {
        // same as clear
        g.cameraXAngleGoal = -0.3
        g.cameraYAngleGoal = Math.PI * 1.10
        g.cameraTargetXGoal = 0
        g.cameraTargetYGoal = 0
        g.cameraTargetZGoal = (g.stageLength + 1) * g.cubeSize
        break
      }

      case g.ENDING_PHASE_ESCAPE: 
      case g.ENDING_PHASE_WAIT_2: {
        // look closer
        g.cameraXAngleGoal = g.endingCameraXAngle
        g.cameraYAngleGoal = g.endingCameraYAngle
        g.cameraTargetXGoal = pos.x
        g.cameraTargetYGoal = pos.y
        g.cameraTargetZGoal = pos.z
        g.camera.distance = g.endingCameraDistance
        bindOffsetY = g.endingCameraOffsetY
        /*
        g.cameraXAngleGoal = -0.3
        g.cameraYAngleGoal = Math.PI * 1.10
        g.cameraTargetXGoal = 0
        g.cameraTargetYGoal = 0
        g.cameraTargetZGoal = g.stageLength * g.cubeSize
        */
        break
      }

      case g.ENDING_PHASE_DOWN_1: {
        // fix camera position
        const playerPos = g.playerObj._position
        g.camera.lookat(
          g.endingCameraX, g.endingCameraY, g.endingCameraZ,
          playerPos.x, playerPos.y + g.endingCameraOffsetY, playerPos.z,
          0, 1, 0
        )
        return
      }

      case g.ENDING_PHASE_DOWN_2: {
        // look from far
        const distance = 600
        const orgX = g.endingCameraX
        const orgZ = g.endingCameraZ
        const r = 1.0 / Math.sqrt(orgX * orgX + orgZ * orgZ)
        const cx = orgX * r * distance
        const cz = orgZ * r * distance
        g.camera.lookat(cx, 0, cz, 0, 0, 0, 0, 1, 0)
        return
      }

      case g.ENDING_PHASE_NAME: {
        // nothing to do
        return
      }

      case g.ENDING_PHASE_MIKU_STORY:
      case g.ENDING_PHASE_RIN_STORY:
      case g.ENDING_PHASE_LEN_STORY: {
        const distance = 20
        g.camera.lookat(0, 0, distance, 0, 0, 0, 0, 1, 0)
        break
      }

      case g.ENDING_PHASE_STAFFROLL: {
        // there's no 3D object, nothing to do
        break
      }

      default: {
        console.error('Camera setting: unknown ending phase: ' + g.endingPhase)
      }
    }
  }else if(!g.activated){
    g.cameraXAngleGoal = -0.3
    g.cameraYAngleGoal = Math.PI
    g.cameraTargetXGoal = pos.x
    g.cameraTargetYGoal = pos.y
    g.cameraTargetZGoal = pos.z
  }else{
    // normal
    g.cameraXAngleGoal = -0.3 - 0.06 * getQuestionLength()
    g.cameraYAngleGoal = Math.PI + pos.x / g.maxX * (g.cameraYAngleMax + (getQuestionLength() - 2) * 0.05)
    g.cameraTargetXGoal = pos.x
    g.cameraTargetYGoal = pos.y
    g.cameraTargetZGoal = pos.z
  }

  // XAngle
  const minMoveXAngle = 0.03
  const diffXAngle = (g.cameraXAngleGoal - g.cameraXAngle)
  const moveXAngle = diffXAngle * g.cameraAngleMoveRatio
  if(-minMoveXAngle < moveXAngle && moveXAngle < 0){
    if(minMoveXAngle > -diffXAngle){
      g.cameraXAngle = g.cameraXAngleGoal
    }else{
      g.cameraXAngle -= minMoveXAngle
    }
  }
  else if(0 < moveXAngle && moveXAngle < minMoveXAngle){
    if(minMoveXAngle > diffXAngle){
      g.cameraXAngle = g.cameraXAngleGoal
    }else{
      g.cameraXAngle += minMoveXAngle
    }
  }
  else{
    g.cameraXAngle += moveXAngle
  }

  // YAngle
  const minMoveYAngle = 0.03
  const diffYAngle = (g.cameraYAngleGoal - g.cameraYAngle)
  const moveYAngle = diffYAngle * g.cameraAngleMoveRatio
  if(-minMoveYAngle < moveYAngle && moveYAngle < 0){
    if(minMoveYAngle > -diffYAngle){
      g.cameraYAngle = g.cameraYAngleGoal
    }else{
      g.cameraYAngle -= minMoveYAngle
    }
  }
  else if(0 < moveYAngle && moveYAngle < minMoveYAngle){
    if(minMoveYAngle > diffYAngle){
      g.cameraYAngle = g.cameraYAngleGoal
    }else{
      g.cameraYAngle += minMoveYAngle
    }
  }
  else{
    g.cameraYAngle += moveYAngle
  }

  // TargetX
  const minMoveTargetX = 1.0
  const diffTargetX = (g.cameraTargetXGoal - g.cameraTargetX)
  const moveTargetX = diffTargetX * g.cameraTargetMoveRatio
  if(-minMoveTargetX < moveTargetX && moveTargetX < 0){
    if(minMoveTargetX > -diffTargetX){
      g.cameraTargetX = g.cameraTargetXGoal
    }else{
      g.cameraTargetX -= minMoveTargetX
    }
  }
  else if(0 < moveTargetX && moveTargetX < minMoveTargetX){
    if(minMoveTargetX > diffTargetX){
      g.cameraTargetX = g.cameraTargetXGoal
    }else{
      g.cameraTargetX += minMoveTargetX
    }
  }
  else{
    g.cameraTargetX += moveTargetX
  }

  // TargetY
  const minMoveTargetY = 1.0
  const diffTargetY = (g.cameraTargetYGoal - g.cameraTargetY)
  const moveTargetY = diffTargetY * g.cameraTargetMoveRatio
  if(-minMoveTargetY < moveTargetY && moveTargetY < 0){
    if(minMoveTargetY > -diffTargetY){
      g.cameraTargetY = g.cameraTargetYGoal
    }else{
      g.cameraTargetY -= minMoveTargetY
    }
  }
  else if(0 < moveTargetY && moveTargetY < minMoveTargetY){
    if(minMoveTargetY > diffTargetY){
      g.cameraTargetY = g.cameraTargetYGoal
    }else{
      g.cameraTargetY += minMoveTargetY
    }
  }
  else{
    g.cameraTargetY += moveTargetY
  }

  // TargetZ
  const minMoveTargetZ = 1.0
  const diffTargetZ = (g.cameraTargetZGoal - g.cameraTargetZ)
  const moveTargetZ = diffTargetZ * g.cameraTargetMoveRatio
  if(-minMoveTargetZ < moveTargetZ && moveTargetZ < 0){
    if(minMoveTargetZ > -diffTargetZ){
      g.cameraTargetZ = g.cameraTargetZGoal
    }else{
      g.cameraTargetZ -= minMoveTargetZ
    }
  }
  else if(0 < moveTargetZ && moveTargetZ < minMoveTargetZ){
    if(minMoveTargetZ > diffTargetZ){
      g.cameraTargetZ = g.cameraTargetZGoal
    }else{
      g.cameraTargetZ += minMoveTargetZ
    }
  }
  else{
    g.cameraTargetZ += moveTargetZ
  }

  const sinx = Math.sin(g.cameraXAngle)
  const cosx = Math.cos(g.cameraXAngle)
  const siny = Math.sin(g.cameraYAngle)
  const cosy = Math.cos(g.cameraYAngle)

  let d = g.camera.distance
  if(!g.speedUp && !g.speedUpByMiss){
    d += (getQuestionLength() - 2) * 15.0
  }

  const ox = g.cameraTargetX + bindOffsetX
  const oy = g.cameraTargetY + bindOffsetY
  const oz = g.cameraTargetZ + bindOffsetZ
  const cx = ox - d * cosx * siny
  const cy = oy - d * sinx
  const cz = oz - d * cosx * cosy
  g.camera.lookat(cx, cy, cz, ox, oy, oz, 0, 1, 0)

  if(g.ending){
    // save camera position
    g.endingCameraX = cx
    g.endingCameraY = cy
    g.endingCameraZ = cz
  }
}

function getQuestionLength() {
  let length = g.questionLength

  if(!g.activated){
    return 2
    //return length
  }

  for(let z=0; z<g.questionLength; z++){
    let noCube = true
    const cubeLine = g.aCubeArray[z]

    for(let x=0; x<g.stageWidth; x++){
      if(cubeLine[x]){
        noCube = false
        break
      }
    }

    if(noCube){
      length--
    }else{
      break
    }
  }

  for(let z=g.questionLength-1; z>=0; z--){
    let noCube = true
    const cubeLine = g.aCubeArray[z]

    for(let x=0; x<g.stageWidth; x++){
      if(cubeLine[x]){
        noCube = false
        break
      }
    }

    if(noCube){
      length--
    }else{
      break
    }
  }

  if(length < 2){
    length = 2
  }

  return length
}

function initGameData() {
  g.stage = 1
  g.subStage = 1
  g.subStageMax = 3
  g.subSubStage = 1
  g.subSubStageMax = 1
  g.score = 0
  g.iqPoint = 0
  g.baseStep = 0
  g.step = 0
  g.penaltyMax = 4
  g.penalty = 0

  g.cubeSize = 25
  g.stageHeight = 5
  g.stageWidth = 4
  g.stageLength = 20

  g.cookieManager = new CookieManager()
  g.cookieShelfLife = g.cookieSaveDays
}

function initCanvas() {
  g.canvasField = new IQCanvas('iqCanvas')
  g.canvasField.skipTimeCallback = skipTimeCallback
  g.canvasField.enableMirror()

  // camera
  g.camera = new Camera()

  // renderer
  g.renderer = new SimpleRenderer(g.canvasField.getContext(), g.camera)
  g.renderer.setClearColor(0, 0, 0, 1)
  g.animator = new MMDAnimator()

  // light
  g.light = new Light()

  // key listener
  g.keyListener = new IQKeyListener()

  // cube
  IQCube.setup()
  IQFaceCube.setup()

  // effect
  IQEffectPlate.setup()

  // marker
  IQMarkerPlate.setup()
  IQMarker.setup()

  // stage
  IQStage.setup()

  // menu
  IQMenu.setup()
}

function decisionKeyPushed() {
  return (g.keyListener.getKeyNewState(g.keyMark) || g.controller.getAnyTouchEndState())
}

function waitMovieLoop() {
  g.nowTime = new Date()

  if(g.menu._opMovieStarted){
    g.canvasField.setFrameCallback(showOpeningLoop)
  }else if(g.openingMovieError){
    // maybe the video codec is not supported... just skip the video
    if(g.playSharedStage){
      IQSceneChanger.change(2.0, true, null, g.bgm_stagecall, null, startSharedStage)
    }else{
      IQSceneChanger.change(2.0, true, null, g.bgm_menu, showMenuLoop, changeToMenu)
    }
  }

  g.keyListener.resetKeyNewState()
  resetTouchState()
}

function showOpeningLoop() {
  g.nowTime = new Date()

  if(!g.loadingDivRemoved){
    removeLoadingDiv()
  }

  // FIXME: separate label and controller
  if(!g.sceneChanging && (g.keyListener.getAnyKeyState() || g.controller.getAnyTouchState())){
    if(g.playSharedStage){
      IQSceneChanger.change(2.0, true, null, g.bgm_stagecall, null, startSharedStage)
    }else{
      IQSceneChanger.change(2.0, true, g.menu._opMovie, g.bgm_menu, showMenuLoop, changeToMenu)
    }
  }
  if(g.openingMovieError){
    // maybe the video codec is not supported... just skip the video 
    if(g.playSharedStage){
      IQSceneChanger.change(2.0, true, null, g.bgm_stagecall, null, startSharedStage)
    }else{
      IQSceneChanger.change(2.0, true, null, g.bgm_menu, showMenuLoop, changeToMenu)
    }
  }
  g.keyListener.resetKeyNewState()
  resetTouchState()
}

function showMenu() {
  if(!IQMenu.initialized){
    setTimeout(showMenu, 500)
    return
  }

  g.camera.bind(null)
  g.camera.perspective(45.0, g.canvasWidth / g.canvasHeight, g.cameraNear, g.cameraFar)
  g.canvasField.setCamera(g.camera)

  g.renderer.setClearColor(0, 0, 0, 1)
  g.light.setPosition(30, 70, 100)
  g.light.setAmbient(0.6, 0.6, 0.6, 0.0)
  g.light.setDiffuse(0.7, 0.7, 0.7, 0.0)
  g.light.setSpecular(0.9, 0.9, 0.9, 0.0)
  g.renderer.setLight(g.light)

  g.menu = new IQMenu('opening')
  g.canvasField.addObject(g.menu)
  updateStageList()

  if(g.device.isMobile || g.device.isTablet){
    // iPhone and iPad can't play the movie automatically... so it has to wait for a touch event
    g.canvasField.setFrameCallback(waitMovieLoop)
  }else{
    g.canvasField.setFrameCallback(showOpeningLoop)
  }

  // label
  g.labelObj = new IQLabel()
  // FIXME: separate controller from label
  g.controller = g.labelObj._controller

  // model
  g.playerObj = new IQPlayer()
  g.playerObj.addMoveCallback(playerMoveCallback)

  const promises = []

  // load all characters
  g.characterFileList.forEach((fileName, name) => {
    const promise = ModelBank.getModelForRenderer(fileName, g.renderer)
    .then((result) => {
      g.models.set(name, result)
    })
    .catch((error) => {
      console.error('Model load error: ' + fileName + ': ' + error)
    })

    promises.push(promise)
  })

  // load plate
  const platePromise = ModelBank.getModelForRenderer('x/normal_plate.x', g.renderer)
  .then((result) => {
    g.normalPlate = result
  })
  .catch((error) => {
    console.error('Plate model load error: ' + error)
  })
  promises.push(platePromise)

  Promise.all(promises)
  .catch((error) => {
    console.error(`playerObj/normalPlate model for renderer loading error: ${error}`)
  })
  .then(start)

  /*
  Promise.all([
    ModelBank.getModelForRenderer('pmd/miku/初音ミク.pmd', g.renderer),
    ModelBank.getModelForRenderer('x/normal_plate.x', g.renderer)
  ])
  .then((result) => {
    g.model_miku = result[0]
    g.normalPlate = result[1]
  })
  .catch((error) => {
    console.error(`playerObj/normalPlate model for renderer loading error: ${error}`)
  })
  .then(start)
  */
}

function initModelAndMotion() {
  return Promise.all([
    ModelBank.getModel('pmd/miku/初音ミク.pmd'),
    ModelBank.getModel('x/normal_plate.x'),
    MotionBank.getMotion('vmd/standing.vmd'),
    MotionBank.getMotion('vmd/running.vmd'),
    MotionBank.getMotion('vmd/rolling.vmd'),
    MotionBank.getMotion('vmd/down.vmd'),
    MotionBank.getMotion('vmd/standup.vmd'),
    MotionBank.getMotion('vmd/falling.vmd'),
    MotionBank.getMotion('vmd/walking.vmd')
  ])
  .catch((error) => {
    console.error(`model and motion loading error: ${error}`)
  })
  .then((result) => {
    g.standing  = result[2]
    g.running   = result[3]
    g.rolling   = result[4]
    g.down      = result[5]
    g.standup   = result[6]
    g.falling   = result[7]
    g.walking   = result[8]
  })
  .then(showMenu)
}

function initAudio() {
  g.bgm_stage = new Audio()
  if(g.bgm_stage.canPlayType('audio/mpeg')){
    g.support_mp3 = true
  }
  if(g.bgm_stage.canPlayType('audio/ogg')){
    g.support_ogg = true
  }
  g.bgm_menu = new Audio()
  g.bgm_stagecall = new Audio()
  g.bgm_fanfare = new Audio()
  g.bgm_gameover = new Audio()

  g.se_select = new Audio() // menu select
  g.se_decision = new Audio() // menu decision

  g.se_substage = new Audio() // create sub stage
  g.se_mark = new Audio()  // set marker
  g.se_markon = new Audio()  // use marker
  g.se_erase = new Audio() // erase cube
  g.se_forbidden = new Audio() // erase forbidden cube
  g.se_break = new Audio() // break stage
  g.se_roll = new Audio()  // rolling cube
  g.se_fall = new Audio()  // falling cube
  g.se_count = new Audio()  // stage length counting
  g.se_bonus = new Audio()  // perfect
  g.se_stagecall_1 = new Audio() // first stage
  g.se_stagecall_2 = new Audio() // second stage
  g.se_stagecall_3 = new Audio() // third stage
  g.se_stagecall_4 = new Audio() // forth stage
  g.se_stagecall_5 = new Audio() // fifth stage
  g.se_stagecall_6 = new Audio() // sixth stage
  g.se_stagecall_7 = new Audio() // seventh stage
  g.se_stagecall_8 = new Audio() // eighth stage
  g.se_stagecall_9 = new Audio() // final stage
  g.se_excellent = new Audio() // Excellent!!
  g.se_perfect = new Audio() // Perfect!
  g.se_great = new Audio() // Great
  g.se_again = new Audio() // Again
  g.se_step = new Audio()  // foot step
  g.se_lifted = new Audio()  // character lifted
  g.se_stamped = new Audio() // character stamped
  g.se_scream = new Audio() // character scream

  if(g.support_mp3){
    g.snd_ext = '.mp3'
    g.play_audio = true
  }else if(g.support_ogg){
    g.snd_ext = '.ogg'
    g.play_audio = true
  }else{
    g.play_audio = false
    // can't play audio
    return
  }
  const ext = g.snd_ext

  // BGM
  //g.bgm_stage.src = g.bgm_directory + '/' + g.bgm_stage1_file + ext
  g.bgm_menu.src = g.bgm_directory + '/' + g.bgm_menu_file + ext
  g.bgm_stagecall.src = g.bgm_directory + '/' + g.bgm_stagecall_file + ext
  g.bgm_fanfare.src = g.bgm_directory + '/' + g.bgm_fanfare_file + ext
  g.bgm_gameover.src = g.bgm_directory + '/' + g.bgm_gameover_file + ext

  // BGM loop setting
  g.bgm_stage.loop = true
  g.bgm_menu.loop = true
  g.bgm_stagecall.loop = false
  g.bgm_fanfare.loop = false
  g.bgm_gameover.loop = false

  // sound effect
  g.se_select.src      = g.se_directory  + '/' + g.se_select_file      + ext
  g.se_decision.src    = g.se_directory  + '/' + g.se_decision_file    + ext
  g.se_substage.src    = g.se_directory  + '/' + g.se_substage_file    + ext
  g.se_mark.src        = g.se_directory  + '/' + g.se_mark_file        + ext
  g.se_markon.src      = g.se_directory  + '/' + g.se_markon_file      + ext
  g.se_erase.src       = g.se_directory  + '/' + g.se_erase_file       + ext
  g.se_forbidden.src   = g.se_directory  + '/' + g.se_forbidden_file   + ext
  g.se_break.src       = g.se_directory  + '/' + g.se_break_file       + ext
  g.se_roll.src        = g.se_directory  + '/' + g.se_roll_file        + ext
  g.se_fall.src        = g.se_directory  + '/' + g.se_fall_file        + ext
  g.se_count.src       = g.se_directory  + '/' + g.se_count_file       + ext
  g.se_bonus.src       = g.se_directory  + '/' + g.se_bonus_file       + ext
  g.se_stagecall_1.src = g.se_directory  + '/' + g.se_stagecall_1_file + ext
  g.se_stagecall_2.src = g.se_directory  + '/' + g.se_stagecall_2_file + ext
  g.se_stagecall_3.src = g.se_directory  + '/' + g.se_stagecall_3_file + ext
  g.se_stagecall_4.src = g.se_directory  + '/' + g.se_stagecall_4_file + ext
  g.se_stagecall_5.src = g.se_directory  + '/' + g.se_stagecall_5_file + ext
  g.se_stagecall_6.src = g.se_directory  + '/' + g.se_stagecall_6_file + ext
  g.se_stagecall_7.src = g.se_directory  + '/' + g.se_stagecall_7_file + ext
  g.se_stagecall_8.src = g.se_directory  + '/' + g.se_stagecall_8_file + ext
  g.se_stagecall_9.src = g.se_directory  + '/' + g.se_stagecall_9_file + ext
  g.se_excellent.src   = g.se_directory  + '/' + g.se_excellent_file   + ext
  g.se_perfect.src     = g.se_directory  + '/' + g.se_perfect_file     + ext
  g.se_great.src       = g.se_directory  + '/' + g.se_great_file       + ext
  g.se_again.src       = g.se_directory  + '/' + g.se_again_file       + ext
  
  // sound effect for characters
  g.se_step.src    = g.se_directory  + '/' + g.se_miku_step_file    + ext
  g.se_lifted.src  = g.se_directory  + '/' + g.se_miku_lifted_file  + ext
  g.se_stamped.src = g.se_directory  + '/' + g.se_miku_stamped_file + ext
  g.se_scream.src  = g.se_directory  + '/' + g.se_miku_scream_file  + ext
}

/***************************************************
 * Cookie
 * - date (newest date)
 * - CharacterName -> LevelName -> Array(Score)
 *
 * @access public
 * @returns {object|null} - parsed cookie IQ data
 ***************************************************/
function getCookieIQ() {
  const cookieIQValue = g.cookieManager.getCookie(g.cookieScore)
  if(!cookieIQValue)
    return null

  const cookieIQ = JSON.parse( decodeURIComponent(cookieIQValue) )

  return cookieIQ
}

function setIQtoCookie() {
  //let scoreObj = getCookieIQ()
  //const daySeconds = 24*60*60*1000
  //const today = Math.floor((new Date()) / daySeconds)
  updatePersonalBestIQ()
  const scoreObj = g.personalBest

  /*
  if(!scoreObj || scoreObj.date > today || scoreObj.date <= today - g.cookieSaveDays){
    // create cookieObj
    scoreObj = new Object()
    scoreObj.date = today
    g.characterList.forEach( (characterName) => {
      const characterScoreObj = new Object()
      g.levelList.forEach( (levelName) => {
        const levelScoreArray = []
        for(let i=0; i<g.cookieSaveDays; i++){
          levelScoreArray[i] = 0
        }
        characterScoreObj[levelName] = levelScoreArray
      })
      scoreObj[characterName] = characterScoreObj
    })
  }else if(scoreObj.date !== today){
    const diffDate = today - scoreObj.date
    g.characterList.forEach( (characterName) => {
      let characterScoreObj = scoreObj[characterName]
      if(!characterScoreObj){
        characterScoreObj = new Object()
      }

      g.levelList.forEach( (levelName) => {
        let oldScoreArray = characterScoreObj[levelName]
        const newScoreArray = []
        if(!oldScoreArray){
          oldScoreArray = []
        }

        for(let i=0; i<diffDate; i++){
          newScoreArray[i] = 0
        }
        for(let i=0; i<(g.cookieSaveDays - diffDate - 1); i++){
          newScoreArray[i + diffDate] = oldScoreArray[i]
        }
      })
    })
  }

  // check new record
  if(iq > scoreObj[g.character][g.level][0]){
    scoreObj[g.character][g.level][0] = iq
  }
  */

  // check new record
  if(g.iqPoint > scoreObj[g.character][g.level].iq){
    // update record
    scoreObj[g.character][g.level] = {
      "name": g.playerName,
      "iq": g.iqPoint,
      "score": g.score,
      "perfect": g.perfectCount
    }
    g.isNewRecord = true
  }


  const value = JSON.stringify(scoreObj)
  const str = encodeURIComponent(value)
  g.cookieManager.setCookie(g.cookieScore, str)
}

function updatePersonalBestIQ() {
  //setIQtoCookie(0)
  const scoreObj = getCookieIQ()

  g.personalBest = scoreObj

  if(!g.personalBest){
    g.personalBest = new Object()
  }

  let playerName = g.playerName
  if(playerName === ''){
    playerName = 'You'
  }

  // set default value if there's no data
  g.characterList.forEach((characterName) => {
    if(typeof g.personalBest[characterName] === "undefined"){
      g.personalBest[characterName] = new Object()
    }
    g.levelList.forEach((levelName) => {
      if(typeof g.personalBest[characterName][levelName] === "undefined"){
        g.personalBest[characterName][levelName] = {
          'name': playerName,
          'iq': 0,
          'score': 0,
          'perfect': 0
        }
      }
    })
  })

  /*
  g.personalDailyBest = new Object()
  g.personalWeeklyBest = new Object()

  g.characterList.forEach( (characterName) => {
    g.personalDailyBest[characterName] = new Object()
    g.personalWeeklyBest[characterName] = new Object()

    const characterScoreObj = scoreObj[characterName]
    g.levelList.forEach( (levelName) => {
      const scoreArray = characterScoreObj[levelName]
      let weeklyBest = 0
      for(let i=0; i<7; i++){
        if(scoreArray[i] > weeklyBest){
          weeklyBest = scoreArray[i]
        }
      }
      g.personalDailyBest[characterName][levelName] = scoreArray[0]
      g.personalWeeklyBest[characterName][levelName] = weeklyBest
    })
  })
  */
}

function loadBestIQ() {
  // get world best
  //g.worldDailyBest = new Object()
  //g.worldWeeklyBest = new Object()
  g.worldBest = new Object()

  let fileName = g.scoreDataURL
  fileName += '?' + (Number(new Date()) * 1) // disable cache

  AjaxRequest.get(fileName, {
    async: false
  })
  .then((result) => {
    const data = result
    const worldIQJson = decodeURIComponent(data)
    /*
    if(!worldIQJson.isJSON()){
      worldIQJson = '{}'
    }
    */
    const worldIQ = JSON.parse(worldIQJson)

    g.worldBest = worldIQ
    if(!g.worldBest){
      g.worldBest = new Object()
    }

    // set default value if there's no data
    g.characterList.forEach((characterName) => {
      if(typeof g.worldBest[characterName] === "undefined"){
        g.worldBest[characterName] = new Object()
      }
      g.levelList.forEach((levelName) => {
        if(typeof g.worldBest[characterName][levelName] === "undefined"){
          g.worldBest[characterName][levelName] = {
            'name': 'NO NAME',
            'iq': 0,
            'score': 0,
            'perfect': 0
          }
        }
      })
    })

    // create score object
    /*
    g.characterList.forEach((characterName) => {
      g.worldBest[characterName] = new Object()

      g.levelList.forEach( (levelName) => {
        if(worldIQ[characterName] && worldIQ[characterName][levelName]){
          //g.worldDailyBest[characterName][levelName]  = worldIQ[characterName][levelName].daily
          //g.worldWeeklyBest[characterName][levelName] = worldIQ[characterName][levelName].weekly
          g.worldBest[characterName][levelName] = worldIQ
        }else{
          g.worldDailyBest[characterName][levelName] = 0
          g.worldWeeklyBest[characterName][levelName] = 0
        }
      })
    })
    */
  })
  .catch((error) => {
    console.error(`BestIQ data loading error: ${error}`)

    // set initial data
    g.characterList.forEach((characterName) => {
      g.worldBest[characterName] = new Object()
      g.levelList.forEach((levelName) => {
        g.worldBest[characterName][levelName] = {
            'name': 'NO NAME',
            'iq': 0,
            'score': 0,
            'perfect': 0
        }
      })
    })
  })
  .then(updatePersonalBestIQ)
}

/**
 * reset score for debug
 * @returns {void}
 */
function resetScore() {
  g.cookieManager.setCookie(g.cookieScore, "")
  updatePersonalBestIQ()
}

function sendScore() {
  const best = g.worldBest[g.character][g.level].iq
  console.log('sendScore:' + g.iqPoint + ' <=> ' + best)

  if(g.iqPoint > g.worldBest[g.character][g.level].iq){
    console.log('new record!')
    // send score to server
    let receiveData = null

    const sendData = {
      submit: 'submit',
      name: g.playerName,
      iq: g.iqPoint,
      score: g.score,
      perfect: g.perfectCount,
      character: g.character,
      level: g.level
    }
    console.log('sendData: ' + sendData)

    AjaxRequest.post(g.scoreSendURL, {
      data: sendData,
      async: false
    })
    .then((result) => {
      console.log('after send data, result: ' + result)
      receiveData = result
      //const data = receiveData.evalJSON()
      const data = JSON.parse(receiveData)
      if(data.result === 'OK'){
        // OK
        console.log('sendscore: OK')
      }else{
        // error
        console.log('sendscore: NG: ' + receiveData)
      }
    })
    .catch((error) => {
      console.error(`Score data sending error: ${error}`)
    })
  }
}

function checkNewCharacter() {
  switch(g.character){
    case 'Miku': {
      if(!g.characterListEnable[1] && g.getNewCharacterIQThreshold[1] <= g.iqPoint){
        // get Rin
        g.characterListEnable[1] = true
        g.getNewCharacter = 'Rin'
      }
      break
    }

    case 'Rin': {
      if(!g.characterListEnable[2] && g.getNewCharacterIQThreshold[2] <= g.iqPoint){
        // get Len
        g.characterListEnable[2] = true
        g.getNewCharacter = 'Len'
      }
      break
    }

    case 'Len': {
      // nothing to do
      break
    }
    
    default: {
      console.error('checkNewCharacter: unknown character: ' + g.character)
    }
  }

  if(!g.extraPlayable && g.getExtraStageIQThreshold <= g.iqPoint){
    //g.getExtraStage = true // disabled temporarily
  }

  // save data to cookie
  setStageToCookie()
  setPlayableCharacterToCookie()
}

function loadCookieOption() {
  const IQLv = g.cookieManager.getCookie(g.cookieOptionLevel)
  if(!IQLv)
    return false

  // player name setting
  g.playerName = g.cookieManager.getCookie(g.cookieOptionPlayer)
  if(g.playerName === null){
    g.playerName = ''
  }

  // level setting
  g.level       = IQLv
  const levelData = g.levelData.get(g.level)
  g.showMarker     = levelData.get('showMarker')
  g.rotateWaitTime = levelData.get('rotateWaitTime')
  g.rotateTime     = levelData.get('rotateTime')
  g.penaltyDiff    = levelData.get('penaltyDiff')

  // character setting
  g.character   = g.cookieManager.getCookie(g.cookieOptionCharacter)
  g.characterSpeed = g.characterData.get(g.character).get('characterSpeed')

  // sound setting
  g.soundVolume = g.cookieManager.getCookie(g.cookieOptionSoundVolume)
  g.soundVolumeValue = g.soundVolume * 100
  setSoundVolume()

  // language setting
  g.language    = g.cookieManager.getCookie(g.cookieOptionLanguage)
  
  // key config
  g.keyUp        = g.cookieManager.getCookie(g.cookieOptionKeyUp)
  g.keyDown      = g.cookieManager.getCookie(g.cookieOptionKeyDown)
  g.keyLeft      = g.cookieManager.getCookie(g.cookieOptionKeyLeft)
  g.keyRight     = g.cookieManager.getCookie(g.cookieOptionKeyRight)
  g.keyMark      = g.cookieManager.getCookie(g.cookieOptionKeyMark)
  g.keyAdvantage = g.cookieManager.getCookie(g.cookieOptionKeyAdvantage)
  g.keySpeedUp   = g.cookieManager.getCookie(g.cookieOptionKeySpeedUp)
  g.keyEscape    = g.cookieManager.getCookie(g.cookieOptionKeyEscape)

  return true
}

function saveCookieOption() {
  g.cookieManager.setCookie(g.cookieOptionPlayer,      g.playerName)
  g.cookieManager.setCookie(g.cookieOptionLevel,       g.level)
  g.cookieManager.setCookie(g.cookieOptionCharacter,   g.character)
  g.cookieManager.setCookie(g.cookieOptionSoundVolume, g.soundVolume)
  g.cookieManager.setCookie(g.cookieOptionLanguage,    g.language)

  // key config
  g.cookieManager.setCookie(g.cookieOptionKeyUp,        g.keyUp)
  g.cookieManager.setCookie(g.cookieOptionKeyDown,      g.keyDown)
  g.cookieManager.setCookie(g.cookieOptionKeyLeft,      g.keyLeft)
  g.cookieManager.setCookie(g.cookieOptionKeyRight,     g.keyRight)
  g.cookieManager.setCookie(g.cookieOptionKeyMark,      g.keyMark)
  g.cookieManager.setCookie(g.cookieOptionKeyAdvantage, g.keyAdvantage)
  g.cookieManager.setCookie(g.cookieOptionKeySpeedUp,   g.keySpeedUp)
  g.cookieManager.setCookie(g.cookieOptionKeyEscape,    g.keyEscape)
}

function setStageToCookie() {
  g.cookieManager.setCookie(g.cookieStage, g.selectableMaxStage)

  setPlayableCharacterToCookie()
}

function getStageFromCookie() {
  g.selectableMaxStage = g.cookieManager.getCookie(g.cookieStage)

  if(!g.selectableMaxStage){
    g.selectableMaxStage = 1
  }

  if(g.selectedStage > g.selectableMaxStage){
    g.selectedStage = 1
  }

  if(g.debug){
    // for debug
    g.selectableMaxStage = 10
    g.selectedStage = 9
  }
  //updateStageList() ... do it later

  getPlayableCharacterFromCookie()
}

function setPlayableCharacterToCookie() {
  let data = ''
  g.characterListEnable.forEach((playable) => {
    if(playable){
      data += 'T'
    }else{
      data += 'F'
    }
  })
  g.cookieManager.setCookie(g.cookieOptionPlayableCharacter, data)
}

function getPlayableCharacterFromCookie() {
  const data = g.cookieManager.getCookie(g.cookieOptionPlayableCharacter)
  if(data === null){
    // there's no data, so nothing to change
    return
  }

  for(let i=0; i<data.length; i++){
    if(data[i] === 'T'){
      g.characterListEnable[i] = true
    }else{
      g.characterListEnable[i] = false
    }
  }
}

function updateStageList() {
  let i = 0
  let maxStage = g.selectableMaxStage

  if(maxStage > g.stageList.length){
    maxStage = g.stageList.length

    // enable 'EXTRA'
    g.extraPlayable = true
    g.menu._opMenuEnable[6] = true
  }

  for(; i<maxStage; i++){
    g.stageListEnable[i] = true
  }
  for(; i<g.stageListEnable.length; i++){
    g.stageListEnable[i] = false
  }
}

function removeAllObjects() {
  // remove all objects
  g.canvasField._objs.forEach( (obj) => {
    if(!(obj instanceof IQSceneChanger)){
      g.canvasField.removeObject(obj)
    }
  })
  g.canvasField._alphaObjs.forEach( (obj) => {
    g.canvasField.removeObject(obj)
  })
}

function resetValues(stage, remainScores) {
  removeAllObjects()

  // set stage
  if(stage){
    g.stage = stage
  }else{
    g.stage = 1
  }
  const stageFile = g.stageFiles[g.stage]

  // reset score
  if(!remainScores){
    g.score = 0
    g.iqPoint = 0
    g.perfectCount = 0
  }

  // flags
  g.loading = false
  g.stageStarting = false
  g.stageCreating = false
  g.activated = false
  g.rotating = false
  g.breaking = false
  g.deleting = false
  g.again = false
  g.gameOver = false
  g.gameOverFlag = false
  g.gameOverFadeOut = false
  g.stageClear = false
  g.stageClearSceneChange = false
  g.ending = false
  g.pausing = false

  g.perfect = false
  g.addingLine = false

  g.markerOn = false
  g.stepCounting = false
  g.missed = false
  g.speedUp = false
  g.speedUpByMiss = false

  g.getNewCharacter = null
  g.getExtraStage = false
  g.isNewRecord = false

  g.subStage = 1
  g.subSubStage = 1

  g.baseStep = 0
  g.step = 0
  if(!g.penaltyMax){
    g.penaltyMax = 4
  }
  g.penalty = 0
  g.penaltyQueue = 0

  g.cubeSize = 25
  g.stageHeight = 5
  g.stageWidth = 4
  g.stageLength = 20

  // music
  setStageBGM(g.stage)

  // reset game objects

  // canvas
  g.canvasField.enableMirror()
  g.canvasField.moveEnable = true

  // camera
  g.camera.bind(null)
  g.camera.setBindOffset(0, 15.0, 0)
  g.camera.perspective(45.0, g.canvasWidth / g.canvasHeight, g.cameraNear, g.cameraFar)
  g.camera.projMat.translate(g.camera.projMat, 0, -40, 40)
  g.camera.distance = 250.0
  g.cameraYAngleGoal = g.cameraYAngle = Math.PI
  g.cameraXAngleGoal = g.cameraXAngle = -0.9
  g.canvasField.setCamera(g.camera)

  // renderer
  g.renderer.setClearColor(0, 0, 0, 1)

  // light
  g.light.setPosition(30, 70, 100)
  g.light.setAmbient(0.6, 0.6, 0.6, 0.0)
  g.light.setDiffuse(0.7, 0.7, 0.7, 0.0)
  g.light.setSpecular(0.9, 0.9, 0.9, 0.0)
  g.renderer.setLight(g.light)

  // cube
  IQCube.resetTexture()

  // player
  g.playerObj.setMotion(g.standing)
  g.playerObj.setAnimationTime(0)
  g.playerObj.setState('standing')
  g.playerObj.setAnimator(g.animator)
  g.playerObj.setAnimating(true)
  g.playerObj.setLoop(true)
  g.playerObj.setMaxSpeed(100)
  g.playerObj.setRenderer(g.renderer)
  g.playerObj.setRotate(0.0, 1.0, 0.0, Math.PI)
  g.playerObj.setAutoDirection(true)
  g.playerObj.setPosition(0, 0, g.maxZ - g.cubeSize)
 

  g.activeMarker = null

  g.markerArray = []
  g.plateMarkerArray = []
  g.plateCubeArray = []
  g.effectArray = []

  g.qCubeArray = []
  g.aCubeArray = []

  g.fallCubeArray = []
  g.deleteCubeArray = []
  g.breakCubeArray = []
  g.addCubeArray = []


  // add objects to canvas
  g.canvasField.addObject(g.playerObj)
  g.canvasField.addObject(g.labelObj)

  // load stage data
  const promise = createStage(stageFile)
  .then(() => {
    g.plateMarkerArray = []
    for(let z=0; z<g.stageLength; z++){
      g.plateMarkerArray[z] = []
      for(let x=0; x<g.stageWidth; x++){
        g.plateMarkerArray[z][x] = null
      }
    }
    g.plateCubeArray = []
    for(let z=0; z<g.stageLength; z++){
      g.plateCubeArray[z] = []
      for(let x=0; x<g.stageWidth; x++){
        g.plateCubeArray[z][x] = null
      }
    }
    g.questionUsed = []

    // FIXME
    g.playerObj.oldX = Math.floor(g.playerObj._position.x - g.minX) / g.cubeSize
    g.playerObj.oldZ = Math.floor(g.playerObj._position.z - g.minZ) / g.cubeSize
    g.playerObj.oldPositionX = g.playerObj._position.x
    g.playerObj.oldPositionZ = g.playerObj._position.z

    //g.canvasField.setFrameCallback(update)
    g.canvasField.setFrameCallback(setTimerAndStart)
  })

  return promise
}

function setTimerAndStart(elapsedTime) {
  g.nowTime = new Date()
  const startTime = g.nowTime.getTime()

  // reset cube timer
  g.qCubeArray.forEach((cubeLine) => {
    cubeLine.forEach((cube) => {
      cube.startTime = new Date(startTime)
    })
  })

  g.stageCreateStartTime = new Date(startTime)

  if(g.subStage === 1){
    if(g.recording){
      g.recorder.startTime = new Date(startTime)
    }
    if(g.demoPlay){
      g.canvasField.startSimulation(g.nowTime, g.rulesDataArray, simFrameCallback)
      g.demoStartTime = new Date(startTime)
    }
    if(g.rulePlay){
      g.rulesStartTime = new Date(startTime)
    }
  }

  g.canvasField.setFrameCallback(update)
}

function playSound(audio, recycle = false) {
  if(!audio){
    return
  }

  if(recycle){
    audio.pause()
    audio.currentTime = 0
    audio.play()
  }else{
    const newAudio = audio.cloneNode()
    newAudio.volume = g.soundVolume
    newAudio.play()
  }
}

function playSECallback_step(){
  playSound(g.se_step)
}

function pauseSound(audio){
  if(audio){
    audio.pause()
  }
  //for(let i=0; i<audio.children.length; i++){
  //  audio.children[i].pause()
  //}
}

function checkObjLoaded() {
  if(!IQCube.initialized)
    return false

  if(!IQEffectPlate.initialized)
    return false

  if(!IQMarker.initialized)
    return false

  if(!IQMarkerPlate.initialized)
    return false

  return true
}

function changeToMenu() {
  stop()
  g.menu.moviePlayStop()
  g.menu.setMenu('top')
  g.camera.distance = 20.0
  g.canvasField.addObject(g.menu._opTileObj, true)

  // set first menu
  const cursor = 0
  g.menu._srcCursor = cursor
  g.menu._srcX = g.menu._opPosX[cursor]
  g.menu._srcY = g.menu._opPosY[cursor]
  g.menu._dstCursor = cursor
  g.menu._dstX = g.menu._opPosX[cursor]
  g.menu._dstY = g.menu._opPosY[cursor]
  g.menu._startTime = new Date(g.nowTime.getTime())
  g.menu._moving = true
  g.menu._cursor = cursor

  g.menu._opStayTiles.length = 0
  g.menu._opUpTiles.length = 0
  g.menu._opDownTiles.length = 0
  const srcTiles = g.menu.getMenuTiles(g.menu._srcCursor)
  srcTiles.forEach( (tile) => {
    g.menu._opUpTiles.push(tile)
  })

  // set light
  g.light.setPosition(-50, 0, -100)
  g.light.setAmbient(0.6, 0.6, 0.6, 0.0)
  g.light.setDiffuse(0.7, 0.7, 0.7, 0.0)
  g.light.setSpecular(0.9, 0.9, 0.9, 0.0)
  g.renderer.setLight(g.light)

  start()
}

function startSharedStage() {
  stop()
  g.menu.moviePlayStop()
  removeAllObjects()
  setup()
}

function createSharedStageURL() {
  let character = 'Miku'

  let stageName = 'SHARED STAGE'
  if(g.playerName.length > 0){
    if(g.playerName[g.playerName.length-1] === 'S'){
      stageName = `${g.playerName}' STAGE`
    }else{
      stageName = `${g.playerName}'S STAGE`
    }
  }

  const sizeIndex = g.stageSizeList.indexOf(g.editStageSize)
  const stageSize = g.stageSizeValues[sizeIndex]
  let stageWidth = stageSize[0]
  let stageLength = 30 // FIXME: make it dynamic
  let baseStep = g.editStageStep
  let questionLength = stageSize[1]

  let question = ''
  for(let y=0; y<stageSize[1]; y++){
    for(let x=0; x<stageSize[0]; x++){
      question += g.editStageData[x][y]
    }
  }

  const queryMap = new Map()
  queryMap.set(g.sharedStageParamCharacter, character)
  queryMap.set(g.sharedStageParamStageName, stageName)
  queryMap.set(g.sharedStageParamStageWidth, stageWidth)
  queryMap.set(g.sharedStageParamStageLength, stageLength)
  queryMap.set(g.sharedStageParamQuestionLength, questionLength)
  queryMap.set(g.sharedStageParamQuestion, question)
  queryMap.set(g.sharedStageParamBaseStep, baseStep)

  const params = []
  queryMap.forEach((value, key) => {
    params.push(encodeURIComponent(key) + '=' + encodeURIComponent(value))
  })
  const sharedURL = g.shareURL + '?' + g.sharedStageParamFlag + '&' + params.join('&')

  return sharedURL
}

function createSharedStage() {
  //let character = 'Miku'
  let stageName = 'SHARED STAGE'
  let stageWidth = 4
  let stageLength = 30
  let questionLength = 2
  let question = 'ffffffff'
  let baseStep = 1

  //if(g.query.has(g.sharedStageParamCharacter)){
  //  character = g.query.get(g.sharedStageParamCharacter)
  //}
  if(g.query.has(g.sharedStageParamStageName)){
    stageName = g.query.get(g.sharedStageParamStageName)
  }
  if(g.query.has(g.sharedStageParamStageWidth)){
    stageWidth = g.query.get(g.sharedStageParamStageWidth)
  }
  if(g.query.has(g.sharedStageParamStageLength)){
    stageLength = g.query.get(g.sharedStageParamStageLength)
  }
  if(g.query.has(g.sharedStageParamQuestionLength)){
    questionLength = g.query.get(g.sharedStageParamQuestionLength)
  }
  if(g.query.has(g.sharedStageParamQuestion)){
    question = g.query.get(g.sharedStageParamQuestion)
  }
  if(g.query.has(g.sharedStageParamBaseStep)){
    baseStep = g.query.get(g.sharedStageParamBaseStep)
  }

  let stageData = stageName + '\n' // stage name
  stageData += stageWidth + ',' + stageLength + '\n' // stage size
  stageData += '1\n' // number of sub stages
  stageData += '1\n' // number of sub sub stages
  stageData += questionLength + '\n' // question length
  stageData += '1\n' // number of questions
  stageData += baseStep + ',' + question + '\n'

  return stageData
}

function incrementParam(param, paramList, enableList, stopAtEdge = false) {
  let enabled = enableList
  if(!enableList){
    enabled = g.menu._opSubSubMenuEnable
  }

  let index = paramList.indexOf(param)
  const prevIndex = index
  do {
    index++
    if(index >= paramList.length){
      if(stopAtEdge){
        index = prevIndex
        break
      }else{
        index = 0
      }
    }
  }while(!enabled[index])

  //g.menu._subSubCursor = index

  return paramList[index]
}

function decrementParam(param, paramList, enableList, stopAtEdge = false) {
  let enabled = enableList
  if(!enableList){
    enabled = g.menu._opSubSubMenuEnable
  }

  let index = paramList.indexOf(param)
  const prevIndex = index
  do {
    index--
    if(index < 0){
      if(stopAtEdge){
        index = prevIndex
        break
      }else{
        index = paramList.length - 1
      }
    }
  }while(!enabled[index])

  //this._subSubCursor = index

  return paramList[index]
}


function setSubMenu() {
  g.menu.setSubMenu()

  const opMenuName = g.menu.getOptionName()
  switch(opMenuName){
    case 'OPTION': {
      // FIXME: get menu item by menu name
      const playerNameMenu = g.menu._menuItem[0]
      const playerNameParam = g.menu._menuItem[10]
      playerNameMenu.onDecision = () => {
        const nameBoxX = playerNameParam.x
        const nameBoxY = playerNameParam.y
        const keyboardY = 200
        g.keyListener.resetKeyNewState()
        g.nameEditor = new IQNameEditor(nameBoxX, nameBoxY, null, keyboardY)
        g.nameEditor.setEndEditCallback(() => {
          IQGameData.canvasField.removeObject(g.nameEditor)
          IQGameData.optionNameEdit = false
        })
        g.canvasField.addObject(g.nameEditor)
        g.optionNameEdit = true
      }
      playerNameMenu.onTouch = playerNameMenu.onDecision

      const levelMenu = g.menu._menuItem[1]
      levelMenu.onLeft  = () => { g.level = decrementParam(g.level, g.levelList, g.levelListEnable) }
      levelMenu.onRight = () => { g.level = incrementParam(g.level, g.levelList, g.levelListEnable) }
      levelMenu.onTouch = levelMenu.onRight

      const stageMenu = g.menu._menuItem[2]
      stageMenu.onLeft  = () => { g.selectedStage = decrementParam(g.selectedStage, g.stageList, g.stageListEnable) }
      stageMenu.onRight = () => { g.selectedStage = incrementParam(g.selectedStage, g.stageList, g.stageListEnable) }
      stageMenu.onTouch = stageMenu.onRight

      const charaMenu = g.menu._menuItem[3]
      charaMenu.onLeft  = () => {
        g.character = decrementParam(g.character, g.characterList, g.characterListEnable)
        g.menu.setupMenuPlayerObj()
      }
      charaMenu.onRight = () => {
        g.character = incrementParam(g.character, g.characterList, g.characterListEnable)
        g.menu.setupMenuPlayerObj()
      }
      charaMenu.onTouch = charaMenu.onRight

      const volumeMenu = g.menu._menuItem[4]
      volumeMenu.onLeft = () => {
        g.soundVolumeValue = decrementParam(g.soundVolumeValue, g.soundVolumeList, g.soundVolumeListEnable, true)
        g.soundVolume = g.soundVolumeValue * 0.01
        setSoundVolume()
      }
      volumeMenu.onRight = () => {
        g.soundVolumeValue = incrementParam(g.soundVolumeValue, g.soundVolumeList, g.soundVolumeListEnable, true)
        g.soundVolume = g.soundVolumeValue * 0.01
        setSoundVolume()
      }
      volumeMenu.onTouch = () => {
        g.soundVolumeValue = incrementParam(g.soundVolumeValue, g.soundVolumeList, g.soundVolumeListEnable)
        g.soundVolume = g.soundVolumeValue * 0.01
        setSoundVolume()
      }

      const langMenu = g.menu._menuItem[5]
      langMenu.onLeft  = () => { g.language = decrementParam(g.language, g.languageList, g.languageListEnable) }
      langMenu.onRight = () => { g.language = incrementParam(g.language, g.languageList, g.languageListEnable) }
      langMenu.onTouch = langMenu.onRight

      const returnMenu = g.menu._menuItem[6]
      returnMenu.onDecision = () => {
        updateOptionValue()
        IQSceneChanger.change(2.0, true, null, null, showMenuLoop, subMenuReturn)
      }
      returnMenu.onTouch = returnMenu.onDecision

      // show character if device is a mobile or a tablet => this timing is too early
      /*
      if(g.device.isMobile || g.device.isTablet){
        g.menu.setupMenuPlayerObj()
      }
      */
      break
    }

    case 'RULES': {
      const rule1Menu = g.menu._menuItem[0]
      rule1Menu.onDecision = () => { startRules(1) }
      rule1Menu.onTouch = rule1Menu.onDecision

      const rule2Menu = g.menu._menuItem[1]
      rule2Menu.onDecision = () => { startRules(2) }
      rule2Menu.onTouch = rule2Menu.onDecision

      const returnMenu = g.menu._menuItem[6]
      returnMenu.onDecision = () => { IQSceneChanger.change(2.0, true, null, null, showMenuLoop, subMenuReturn) }
      returnMenu.onTouch = returnMenu.onDecision

      break
    }

    case 'SCORE': {
      loadBestIQ()
      g.menu._subScoreCharacter = g.character
      g.menu._subScoreLevel = g.level

      const charaMenu = g.menu._menuItem[0]
      charaMenu.onLeft  = () => { g.menu._subScoreCharacter = decrementParam(g.menu._subScoreCharacter, g.characterList, g.characterListEnable) }
      charaMenu.onRight = () => { g.menu._subScoreCharacter = incrementParam(g.menu._subScoreCharacter, g.characterList, g.characterListEnable) }
      charaMenu.onTouch = charaMenu.onRight

      const levelMenu = g.menu._menuItem[1]
      levelMenu.onLeft  = () => { g.menu._subScoreLevel = decrementParam(g.menu._subScoreLevel, g.levelList, g.levelListEnable) }
      levelMenu.onRight = () => { g.menu._subScoreLevel = incrementParam(g.menu._subScoreLevel, g.levelList, g.levelListEnable) }
      levelMenu.onTouch = levelMenu.onRight

      const returnMenu = g.menu._menuItem[6]
      returnMenu.onDecision = () => { IQSceneChanger.change(2.0, true, null, null, showMenuLoop, subMenuReturn) }
      returnMenu.onTouch = returnMenu.onDecision

      break
    }

    case 'SHARE': {
      const url = g.shareURL
      const title = g.shareTitle

      // Twitter
      const twitterMenu = g.menu._menuItem[0]
      twitterMenu.onDecision = () => {
        const href = 'http://twitter.com/share?url=' + escape(url)
            + '&text=' + escape(title)
            + '&hashtags=IQRevenge'
        window.location.href = href
      }
      twitterMenu.onTouch = twitterMenu.onDecision

      // Facebook
      const facebookMenu = g.menu._menuItem[1]
      facebookMenu.onDecision = () => {
        const href = 'http://www.facebook.com/share.php?u=' + escape(url)
        window.location.href = href
      }
      facebookMenu.onTouch = facebookMenu.onDecision

      // Google+
      const googleMenu = g.menu._menuItem[2]
      googleMenu.onDecision = () => {
        const href = 'https://plusone.google.com/_/+1/confirm?hl=' + g.language + '&url=' + escape(url)
            + '&title=' + escape(title)
        window.location.href = href
      }
      googleMenu.onTouch = googleMenu.onDecision

      // mixi
      const mixiMenu = g.menu._menuItem[3]
      mixiMenu.onDecision = () => {
        const href = 'http://mixi.jp/share.pl?u=' + escape(url)
        window.location.href = href
      }
      mixiMenu.onTouch = mixiMenu.onDecision

      // return
      const returnMenu = g.menu._menuItem[6]
      returnMenu.onDecision = () => {
        IQSceneChanger.change(2.0, true, null, null, showMenuLoop, subMenuReturn)
      }
      returnMenu.onTouch = returnMenu.onDecision

      break
    }

    case 'CREATE': {
      if(g.debug){
        // initialize
        g.debugStageNo = 1
        g.debugSubStageNo = 1
        g.debugSubSubStageNo = 1
        loadDebugStageData()
        .then(updateDebugStageData)

        // stage debug
        const stageMenu = g.menu._menuItem[0]
        stageMenu.onLeft  = () => {
          g.debugStageNo = decrementParam(g.debugStageNo, g.debugStageList, g.debugStageListEnable)
          g.debugSubStageNo = 1
          g.debugSubSubStageNo = 1
          loadDebugStageData()
          .then(updateDebugStageData)
        }
        stageMenu.onRight = () => {
          g.debugStageNo = incrementParam(g.debugStageNo, g.debugStageList, g.debugStageListEnable)
          g.debugSubStageNo = 1
          g.debugSubSubStageNo = 1
          loadDebugStageData()
          .then(updateDebugStageData)
        }
        stageMenu.onTouch = stageMenu.onRight

        const subStageMenu = g.menu._menuItem[1]
        subStageMenu.onLeft  = () => {
          g.debugSubStageNo = decrementParam(g.debugSubStageNo, g.debugSubStageList, g.debugSubStageListEnable)
          g.debugSubSubStageNo = 1
          updateDebugStageData()
        }
        subStageMenu.onRight = () => {
          g.debugSubStageNo = incrementParam(g.debugSubStageNo, g.debugSubStageList, g.debugSubStageListEnable)
          g.debugSubSubStageNo = 1
          updateDebugStageData()
        }
        subStageMenu.onTouch = stageMenu.onRight

        const subSubStageMenu = g.menu._menuItem[2]
        subSubStageMenu.onLeft  = () => {
          g.debugSubSubStageNo = decrementParam(g.debugSubSubStageNo, g.debugSubSubStageList, g.debugSubSubStageListEnable)
          updateDebugStageData()
        }
        subSubStageMenu.onRight = () => {
          g.debugSubSubStageNo = incrementParam(g.debugSubSubStageNo, g.debugSubSubStageList, g.debugSubSubStageListEnable)
          updateDebugStageData()
        }
        subSubStageMenu.onTouch = subSubStageMenu.onRight

        const stepMenu = g.menu._menuItem[3]
        stepMenu.onLeft  = () => { g.editStageStep = decrementParam(g.editStageStep, g.stageStepList, g.stageStepListEnable) }
        stepMenu.onRight = () => { g.editStageStep = incrementParam(g.editStageStep, g.stageStepList, g.stageStepListEnable) }
        stepMenu.onTouch = stepMenu.onRight

        const editMenu = g.menu._menuItem[4]
        editMenu.onDecision = () => {
          g.editStart = true
        }

        const playMenu = g.menu._menuItem[5]
        playMenu.onDecision = () => {
          IQSceneChanger.change(2.0, true, g.bgm_menu, g.bgm_stagecall, null, () => {
            g.testPlay = true
            stop()
            setup()
          })
        }
        playMenu.onTouch = playMenu.onDecision

        const returnMenu = g.menu._menuItem[6]
        returnMenu.onDecision = () => {
          IQSceneChanger.change(2.0, true, null, null, showMenuLoop, subMenuReturn)
        }
        returnMenu.onTouch = returnMenu.onDecision
      }else{
        // normal editor
        const sizeMenu = g.menu._menuItem[0]
        sizeMenu.onLeft  = () => { g.editStageSize = decrementParam(g.editStageSize, g.stageSizeList, g.stageSizeListEnable) }
        sizeMenu.onRight = () => { g.editStageSize = incrementParam(g.editStageSize, g.stageSizeList, g.stageSizeListEnable) }
        sizeMenu.onTouch = sizeMenu.onRight

        const stepMenu = g.menu._menuItem[1]
        stepMenu.onLeft  = () => { g.editStageStep = decrementParam(g.editStageStep, g.stageStepList, g.stageStepListEnable) }
        stepMenu.onRight = () => { g.editStageStep = incrementParam(g.editStageStep, g.stageStepList, g.stageStepListEnable) }
        stepMenu.onTouch = stepMenu.onRight

        const editMenu = g.menu._menuItem[2]
        editMenu.onDecision = () => {
          g.editStart = true
        }

        const playMenu = g.menu._menuItem[3]
        playMenu.onDecision = () => {
          IQSceneChanger.change(2.0, true, g.bgm_menu, g.bgm_stagecall, null, () => {
            g.testPlay = true
            stop()
            setup()
          })
        }
        playMenu.onTouch = playMenu.onDecision

        const shareMenu = g.menu._menuItem[4]
        shareMenu.onDecision = () => {
          const sharedURL = createSharedStageURL()
          prompt('URL for this stage:', sharedURL)
        }
        shareMenu.onTouch = shareMenu.onDecision

        const returnMenu = g.menu._menuItem[6]
        returnMenu.onDecision = () => {
          IQSceneChanger.change(2.0, true, null, null, showMenuLoop, subMenuReturn)
        }
        returnMenu.onTouch = returnMenu.onDecision
      }

      break
    }

    default: {
      // nothing to do
    }
  }
}

function loadDebugStageData() {
  const debugFileIndex = g.debugStageList.indexOf(g.debugStageNo)
  if(debugFileIndex < 0){
    console.error('debug stage no error: ' + g.debutStageNo + ', ' + debugFileIndex)
  }
  const debugFileName = g.debugFileList[debugFileIndex]

  return loadQuestionFile(debugFileName)
}

function updateDebugStageData() {
  // sub stage list
  g.debugSubStageList.length = 0
  g.debugSubStageListEnable.length = 0
  for(let i=0; i<g.subStageMax; i++){
    g.debugSubStageList[i] = i + 1
    g.debugSubStageListEnable[i] = true
  }

  /*
  let subStageIndex = g.debugSubStageList.indexOf(g.debugSubStageNo) + 1
  if(subStageIndex < 1){
    subStageIndex = 1
  }
  const subStage = g.stageData[subStageIndex]
  */
  const subStage = g.stageData[g.debugSubStageNo]

  // sub sub stage list
  g.debugSubSubStageList.length = 0
  g.debugSubSubStageListEnable.length = 0

  for(let i=0; i<subStage.numQuestions; i++){
    g.debugSubSubStageList[i] = i + 1
    g.debugSubSubStageListEnable[i] = true
  }

  let subSubStageIndex = g.debugSubSubStageList.indexOf(g.debugSubSubStageNo)
  if(subSubStageIndex < 0){
    subSubStageIndex = 0
  }
  const question = subStage.questionArray[subSubStageIndex]

  // size and steps
  g.editStageSize = g.stageWidth + 'x' + subStage.questionLength
  g.editStageStep = question.baseStep

  // stage data
  for(let x=0; x<g.stageWidth; x++){
    for(let y=0; y<subStage.questionLength; y++){
      switch(question.data[y][x]){
        case 'advantage': {
          g.editStageData[x][y] = 'a'
          break
        }
        case 'forbidden': {
          g.editStageData[x][y] = 'f'
          break
        }
        case 'normal':
        default: {
          g.editStageData[x][y] = 'n'
        }
      }
    }
  }
}

function startRules(ruleNo) {
  IQSceneChanger.change(2.0, true, g.bgm_menu, g.bgm_stagecall, null, () => {
    g.demoPlay = true
    g.rulePlay = true
    g.ruleNumber = ruleNo
    g.rulePlayQuestionNo = 0
    g.rulesCurrentAudio = null
    g.rulesCurrentPause = null

    stop()
    loadRulesData()
    .then(setup)
    .catch((error) => {
      console.error('loadRulesData error: ' + error)
    })
    .then(() => {
      // for debug
      if(g.debug){
        g.rulesAudioArray.forEach((audio) => {
          console.log(audio.src + ': ' + audio.duration)
        })
      }
    })
  })
}

function showMenuLoop() {
  g.nowTime = new Date()

  let c = g.menu._cursor
  if(!g.menu._moving && !g.menu._folding && !g.menu._moveTopLeft
     && !g.menu._expanding && !g.sceneChanging){
    let move = false

    const leftTouches = g.controller.touchEndWithinRect(
      g.menuLeftButtonX, g.menuLeftButtonY,
      g.menuButtonWidth, g.menuButtonHeight
    )
    if(g.keyListener.getKeyState(g.keyLeft) || leftTouches.length > 0){
      do {
        c--
        if(c < 0){
          g.menu._cursor = g.menu._opMenus.size
          c = g.menu._cursor - 1
        }
      }while(!g.menu._opMenuEnable[c])
      move = true
    }

    const rightTouches = g.controller.touchEndWithinRect(
      g.menuRightButtonX, g.menuRightButtonY,
      g.menuButtonWidth, g.canvasHeight
    )
    if(g.keyListener.getKeyState(g.keyRight) || rightTouches.length > 0){
      do {
        c++
      }while(!g.menu._opMenuEnable[c])
      move = true
    }
    if(move){
      playSound(g.se_select)
    }
  }

  let tileZ = g.menu._upTileZ
  if(!g.menu._moving && g.menu._cursor !== c){
    g.menu._srcCursor = g.menu._cursor
    if(g.menu._srcCursor >= g.menu._opMenus.size){
      g.menu._srcCursor = 0
    }
    g.menu._srcX = g.menu._opPosX[g.menu._cursor]
    g.menu._srcY = g.menu._opPosY[g.menu._cursor]
    g.menu._dstCursor = c
    if(g.menu._dstCursor >= g.menu._opMenus.size){
      g.menu._dstCursor = 0
    }
    g.menu._dstX = g.menu._opPosX[c]
    g.menu._dstY = g.menu._opPosY[c]
    g.menu._startTime = new Date(g.nowTime.getTime())
    g.menu._moving = true
    g.menu._cursor = c

    // tile setting
    g.menu._opStayTiles.length = 0
    g.menu._opUpTiles.length = 0
    g.menu._opDownTiles.length = 0
    const srcTiles = g.menu.getMenuTiles(g.menu._srcCursor)
    const dstTiles = g.menu.getMenuTiles(g.menu._dstCursor)
    srcTiles.forEach( (tile) => {
      if(dstTiles.includes(tile)){
        g.menu._opStayTiles.push(tile)
        tile._position.z = tileZ
      }else{
        g.menu._opDownTiles.push(tile)
      }
    })
    dstTiles.forEach( (tile) => {
      if(!g.menu._opStayTiles.includes(tile)){
        g.menu._opUpTiles.push(tile)
      }
    })
  }

  let cx = 0
  let cy = 0
  if(g.menu._moving){
    const diffTime = g.getElapsedTime(g.menu._startTime)
    const maxTime = g.menuMoveTime
    if(diffTime > maxTime){
      cx = g.menu._dstX
      cy = g.menu._dstY
      g.menu._moving = false
      if(c >= g.menu._opMenus.size){
        c = 0
        g.menu._cursor = 0
      }
      g.menu._opUpTiles.forEach( (tile) => {
        tile._position.z = tileZ
      })
      g.menu._opDownTiles.forEach( (tile) => {
        tile._position.z = 0
      })
    }else{
      let s = 0
      const t = 2.0 * diffTime / maxTime
      if(t < 1){
        s = 0.5 * t * t
      }else{
        s = -0.5 * (t * (t - 4) + 2)
      }
      cx = s * g.menu._dstX + (1 - s) * g.menu._srcX
      cy = s * g.menu._dstY + (1 - s) * g.menu._srcY
      const uz = s * tileZ
      const dz = (1 - s) * tileZ
      g.menu._opUpTiles.forEach( (tile) => {
        tile._position.z = uz
      })
      g.menu._opDownTiles.forEach( (tile) => {
        tile._position.z = dz
      })

    }
  }else if(g.menu._folding){
    const diffTime = g.getElapsedTime(g.menu._foldingTime)
    // FIMXE
    if(diffTime < g.menuFoldingTime){
      const r = diffTime / g.menuFoldingTime * Math.PI * 0.5
      const tiles = g.menu._foldingTiles
      tiles.forEach( (tile) => {
        if(tile._leftBone){
          tile._leftBone.rotate.createAxis(g.yaxis, r)
        }
        if(tile._rightBone){
          tile._rightBone.rotate.createAxis(g.yaxis, -r)
        }
        if(tile._topBone){
          tile._topBone.rotate.createAxis(g.xaxis, -r)
        }
        if(tile._bottomBone){
          tile._bottomBone.rotate.createAxis(g.xaxis, r)
        }
      })
    }else if(!g.menuNext){
      g.menuNext = true

      const r = Math.PI * 0.5
      const tiles = g.menu._foldingTiles
      tiles.forEach( (tile) => {
        if(tile._leftBone){
          tile._leftBone.rotate.createAxis(g.yaxis, r)
        }
        if(tile._rightBone){
          tile._rightBone.rotate.createAxis(g.yaxis, -r)
        }
        if(tile._topBone){
          tile._topBone.rotate.createAxis(g.xaxis, -r)
        }
        if(tile._bottomBone){
          tile._bottomBone.rotate.createAxis(g.xaxis, r)
        }
      })

      switch(g.menu.getOptionName()){
        case 'START': {
          IQSceneChanger.change(3.0, true, g.bgm_menu, g.bgm_stagecall, null, () => {
            stop()
            removeAllObjects()
            setup()
          })
          break
        }
        case 'OPTION':
        case 'SCORE':
        case 'RULES':
        case 'CREATE':
        case 'SHARE': {
          moveCubeToTopLeft()
          break
        }
        case 'EXTRA': {
          IQSceneChanger.change(3.0, true, g.bgm_menu, g.bgm_stagecall, null, () => {
            stop()
            removeAllObjects()
            setup(true)
          })
          break
        }
        case 'EXIT': {
          IQSceneChanger.change(5.0, true, g.bgm_menu, null, null, () => {
            removeAllObjects()
            window.close()
          })
          break
        }
        default: {
          // nothing to do
        }
      }
    }
    const t = diffTime / g.menuRotationTime
    const h = (t - 1.0) * g.menuRotationSpeed
    const r = h + Math.sqrt(t + h * h)
    const tile = g.menu._foldingTiles[0]

    const tileRot = tile._model.rootBone.rotate
    tileRot.createAxis(g.yaxis, -r)

    cx = g.menu._opPosX[g.menu._cursor]
    cy = g.menu._opPosY[g.menu._cursor]
  }else if(g.menu._moveTopLeft){
    // cube position
    const cubeDiffTime = g.getElapsedTime(g.menu._moveTopLeftTime)
    const cube = g.menu._foldingTiles[0]
    const cubePos = cube._position
    let s = 0
    if(cubeDiffTime > g.menuCubeMoveTime){
      // ready for expanding cube
      cube.setScale(g.menu._cubeScale * 0.5)
      cubePos.x = g.menu._cubeDstX
      cubePos.y = g.menu._cubeDstY
      cubePos.z = g.menu._upTileZ + g.menu._cubeScale * 0.25

      g.menu._moveTopLeft = false
      g.menu._expanding = true
      g.menu._expandingTime = new Date(g.nowTime.getTime())

      // calc expandingStartTime
      const foldingDiffTime = g.getElapsedTime(g.menu._foldingTime)
      const t = foldingDiffTime / g.menuRotationTime
      const h = (t - 1.0) * g.menuRotationSpeed
      const nowR = h + Math.sqrt(t + h * h)
      const pi2 = Math.PI
      const objR = (Math.ceil(nowR / pi2) + 1) * pi2
      const rotSpeed = g.menuRotationSpeed * 2.0
      
      g.menu._expandingStartTime = (objR - nowR) / rotSpeed * g.menuRotationTime
      g.menu._expandingSrcRot = nowR
      g.menu._expandingDstRot = objR

      g.menu.removeWithoutMenuCube()
    }else{
      const t = 2.0 * cubeDiffTime / g.menuCubeMoveTime
      if(t < 1){
        s = 0.5 * t * t
      }else{
        s = -0.5 * (t * (t - 4) + 2)
      }
      const cubeX = s * g.menu._cubeDstX + (1 - s) * g.menu._cubeSrcX
      const cubeY = s * g.menu._cubeDstY + (1 - s) * g.menu._cubeSrcY
      const cubeZ = g.menu._upTileZ + s * g.menu._cubeScale * 0.25
      const cubeScale = g.menu._cubeScale * (1.0 - s * 0.5)

      cube.setScale(cubeScale)
      cubePos.x = cubeX
      cubePos.y = cubeY
      cubePos.z = cubeZ
    } 

    // fade out
    g.menu.setFadeTileAlpha(s)

    // rotate cube
    const foldingDiffTime = g.getElapsedTime(g.menu._foldingTime)
    const t = foldingDiffTime / g.menuRotationTime
    const h = (t - 1.0) * g.menuRotationSpeed
    const r = h + Math.sqrt(t + h * h)
    const tile = g.menu._foldingTiles[0]

    const tileRot = tile._model.rootBone.rotate
    tileRot.createAxis(g.yaxis, -r)

    // camera position
    cx = g.menu._opPosX[g.menu._cursor]
    cy = g.menu._opPosY[g.menu._cursor]
  }else if(g.menu._expanding){
    const expandingDiffTime = g.getElapsedTime(g.menu._expandingTime)

    const time1 = g.menu._expandingStartTime
    const time2 = time1 + g.menuCubeExpandingTime
    //var time3 = time2 + g.menuMenuExpandingTime
    if(expandingDiffTime < time1){
      // rotate cube
      const rotDiffTime = g.getElapsedTime(g.menu._expandingTime)
      const rotSpeed = g.menuRotationSpeed * 2.0
      const t = rotDiffTime / g.menuRotationTime
      const r = g.menu._expandingSrcRot + rotSpeed * t
      const tile = g.menu._foldingTiles[0]

      const tileRot = tile._model.rootBone.rotate
      tileRot.createAxis(g.yaxis, -r)
    }else if(expandingDiffTime < time2){
      if(!g.menu._expandingRotFinished){
        g.menu._expandingRotFinished = true

        // setup tiles
        const tiles = g.menu._foldingTiles
        const numTiles = g.menu.getOptionName().length
        const tileX = g.menu._cubeDstX
        const tileY = g.menu._cubeDstY
        tileZ = g.menu._upTileZ
        tiles[0]._model.rootBone.childBoneArray[0].offset.z = 0
        for(let i=0; i<numTiles; i++){
          const tile = tiles[i]
          tile.setScale(g.menu._cubeScale * 0.5)
          tile.setRotateAxis(g.zaxis, 0)
          tile.setPosition(tileX, tileY, tileZ)

          const rootBone = tile._model.rootBone
          const tileBone = rootBone.childBoneArray[0]
          const childBones = tileBone.childBoneArray
          childBones.forEach( (bone) => {
            bone.childBoneArray.length = 0
            tileBone.removeChild(bone)
          })
          rootBone.parentBone = null
        }
        for(let i=numTiles; i<tiles.length; i++){
          const tile = tiles[i]
          g.canvasField.removeObject(tile)
        }

        g.menu._expandingSrcTileX = tileX
        g.menu._expandingSrcTileY = tileY
      }

      // expand menu titles
      const exDiffTime = expandingDiffTime - time1
      let s = 0
      const t = 2.0 * exDiffTime / g.menuCubeExpandingTime
      if(t < 1){
        s = 0.5 * t * t
      }else{
        s = -0.5 * (t * (t - 4) + 2)
      }

      const tiles = g.menu._foldingTiles
      const numTiles = g.menu.getOptionName().length
      for(let i=0; i<numTiles; i++){
        const tile = tiles[i]
        const tileX = g.menu._expandingSrcTileX + g.menu._cubeScale * 0.5 * i * s
        tile.setPosition(tileX, g.menu._expandingSrcTileY, g.menu._upTileZ)
      }
    }else{
      g.menu._expanding = false
      g.menu._showSubMenu = true
      g.menu._showSubMenuReady = false
      g.menu._showSubMenuTime = new Date(g.nowTime.getTime())
      g.menu.subCursorInit()

      // show character if device is a mobile or a tablet
      if(g.menu.getOptionName() === 'OPTION'){
        if(g.device.isMobile || g.device.isTablet){
          g.menu.setupMenuPlayerObj()
        }
      }

      g.canvasField.setFrameCallback(showSubMenuLoop)
    }

    // camera position
    cx = g.menu._opPosX[g.menu._cursor]
    cy = g.menu._opPosY[g.menu._cursor]
  }else if(g.menu._showSubMenu){
    // camera position
    cx = g.menu._opPosX[g.menu._cursor]
    cy = g.menu._opPosY[g.menu._cursor]
  }else{
    cx = g.menu._opPosX[g.menu._cursor]
    cy = g.menu._opPosY[g.menu._cursor]
  }
  const cz = -135
  const ox = cx
  const oy = cy
  const oz = 0

  g.camera.lookat(cx, cy, cz, ox, oy, oz, 0, -1, 0)

  if(!g.menu._moving && !g.menu._folding && !g.menu._moveTopLeft
     && !g.menu._expanding && !g.sceneChanging 
     && decisionKeyPushed()){
    setSubMenu()
    g.menu._folding = true
    g.menu._foldingTime = new Date(g.nowTime.getTime())
    const tiles = g.menu._opActiveTileObjArray
    const tilePos = g.menu._opActiveTiles[g.menu._cursor]
    const tileObjs = []
    tilePos.forEach( (pos) => {
      const x = pos[0]
      const y = pos[1]
      const tile = tiles[y][x]
      tile._marked = false
      tileObjs.push(tile)
    })
    g.menu._foldingTiles = tileObjs
    setMenuTileFolding(tileObjs[0], tileObjs)

    const childBone = tileObjs[0]._model.rootBone.childBoneArray[0]
    childBone.rotate = new Vector4(0, 0, 0, 1)
    childBone.offset = new Vector3(0, 0, -0.5)

    playSound(g.se_decision)
  }

  if(g.debug){
    // record player's move
    if(g.keyListener.getKeyNewState('R')){
      g.recording = !g.recording
      console.log('g.recording = ' + g.recording)
      if(!g.recording){
        g.canvasField.setMspf(0)
      }
    }

    // output recorded move
    if(g.keyListener.getKeyNewState('T')){
      if(g.recorder){
        console.log(g.recorder.toString())
      }
    }

    if(g.keyListener.getKeyNewState('U')){
      // make it enable to start from the final stage
      g.selectableMaxStage = 10
      updateStageList()
    }

    if(g.keyListener.getKeyNewState('Y')){
      // new character scene debug
      g.getNewCharacter = 'Rin'

      IQSceneChanger.change(2.0, true, g.bgm_menu, null, showNewCharacterLoop, setupNewCharacterFunctions)
    }

    if(g.keyListener.getKeyNewState('H')){
      g.characterListEnable = [true, false, false]
      setPlayableCharacterToCookie()
    }

    if(g.keyListener.getKeyNewState('S')){
      resetScore()
    }
  }

  g.keyListener.resetKeyNewState()
  resetTouchState()
}

function showSubMenuLoop() {
  g.nowTime = new Date()

  const menuName = g.menu.getOptionName()
  //const subName = g.menu.getSubOptionName()

  if(!g.sceneChanging && !g.menu._moving
     && g.menu._showSubMenuReady && !g.editing
     && !g.optionNameEdit){
    // TODO: move to setSubMenu function
    let c = g.menu._subCursor
    if(g.keyListener.getKeyState(g.keyUp)){
      do {
        c--
        if(c < 0){
          c = g.menu._opSubMenus.length - 1
        }
      }while(!g.menu._opSubMenuEnable[c])
    }
    if(g.keyListener.getKeyState(g.keyDown)){
      do {
        c++
        if(c >= g.menu._opSubMenus.length){
          c = 0
        }
      }while(!g.menu._opSubMenuEnable[c])
    }
    if(c !== g.menu._subCursor){
      playSound(g.se_select)
      g.menu._moving = true

      g.menu._srcMenuItem = g.menu._subCursor
      g.menu._dstMenuItem = c
      g.menu._moveSubMenuTime = new Date(g.nowTime.getTime())
      g.menu._subCursor = c
   
      const newSubName = g.menu.getSubOptionName(c)

      // set subsubmenu
      if(menuName === 'OPTION'){
        if(!g.device.isMobile && !g.device.isTablet){
          if(newSubName === 'Character'){
            g.menu.setupMenuPlayerObj()
          }else{
            g.canvasField.removeObject(g.menuPlayerObj)
          }
        }
      }

      /*
      if(menuName === 'OPTION'){
        if(subName === 'Level'){
          g.menu._opSubSubMenus = g.levelList
          g.menu._opSubSubMenuEnable = g.levelListEnable
          g.menu._subSubCursor = g.levelList.indexOf(g.level)
        }else if(subName === 'Stage'){
          g.menu._opSubSubMenus = g.stageList
          g.menu._opSubSubMenuEnable = g.stageListEnable
          g.menu._subSubCursor = g.stageList.indexOf(g.selectedStage)
        }else if(subName === 'Character'){
          g.menu._opSubSubMenus = g.characterList
          g.menu._opSubSubMenuEnable = g.characterListEnable
          g.menu._subSubCursor = g.characterList.indexOf(g.character)

          // show character
          g.menu.setupMenuPlayerObj()
        }else if(subName === 'Volume'){
          g.menu._opSubSubMenus = g.soundVolumeList
          g.menu._opSubSubMenuEnable = g.soundVolumeListEnable
          g.menu._subSubCursor = g.soundVolumeList.indexOf(g.soundVolumeValue)
        }else if(subName === 'Language'){
          g.menu._opSubSubMenus = g.languageList
          g.menu._opSubSubMenuEnable = g.languageListEnable
          g.menu._subSubCursor = g.languageList.indexOf(g.language)
        }else{
          g.menu._opSubSubMenus = null
          g.menu._opSubSubMenuEnable = null
        }

        if(name !== 'Character'){
          // hide character
          g.canvasField.removeObject(g.menuPlayerObj)
        }
      }else if(menuName === 'SCORE'){
        if(subName === 'Character'){
          g.menu._opSubSubMenus = g.characterList
          g.menu._opSubSubMenuEnable = g.characterListEnable
          g.menu._subSubCursor = g.characterList.indexOf(g.charater)
        }else if(subName === 'Level'){
          g.menu._opSubSubMenus = g.levelList
          g.menu._opSubSubMenuEnable = g.levelListEnable
          g.menu._subSubCursor = g.levelList.indexOf(g.level)
        }else{
          // return
          g.menu._opSubSubMenus = null
          g.menu._opSubSubMenuEnable = null
        }
      }else if(menuName === 'CREATE'){
        if(subName === 'Size'){
          g.menu._opSubSubMenus = g.stageSizeList
          g.menu._opSubSubMenuEnable = g.stageSizeListEnable
          g.menu._subSubCursor = g.stageSizeList.indexOf(g.editStageSize)
        }else if(subName === 'Step'){
          g.menu._opSubSubMenus = g.stageStepList
          g.menu._opSubSubMenuEnable = g.stageStepListEnable
          g.menu._subSubCursor = g.stageStepList.indexOf(g.editStageStep)
        }else if(subName === 'Edit'){
          g.menu._opSubSubMenus = null
          g.menu._opSubSubMenuEnable = null
        }else if(subName === 'Play'){
          g.menu._opSubSubMenus = null
          g.menu._opSubSubMenuEnable = null
        }else if(subName === 'Save'){
          g.menu._opSubSubMenus = null
          g.menu._opSubSubMenuEnable = null
        }else{
          // return
          g.menu._opSubSubMenus = null
          g.menu._opSubSubMenuEnable = null
        }
      }
      */
    }

    // push decision button handling
    if(!g.menu._moving){
      g.menu.handleMenuItemAction()
    }
  }

  if(g.editing){
    const sizeIndex = g.stageSizeList.indexOf(g.editStageSize)
    const stageSize = g.stageSizeValues[sizeIndex]
    const stageWidth = stageSize[0]
    const stageLength = stageSize[1]
    let cx = g.menu._editCursorX
    let cy = g.menu._editCursorY

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
    cx = (cx + stageWidth) % stageWidth
    cy = (cy + stageLength) % stageLength

    if(cx !== g.menu._editCursorX || cy !== g.menu._editCursorY){
      playSound(g.se_select)
      g.menu._moving = true
      g.menu._moveSubMenuTime = new Date(g.nowTime.getTime())

      g.menu._editCursorSX = g.menu._editCursorX
      g.menu._editCursorSY = g.menu._editCursorY
      g.menu._editCursorX = cx
      g.menu._editCursorY = cy
    }

    if(!g.menu._moving){
      if(g.keyListener.getKeyNewState(g.keyMark)){
        // back to sub sub menu
        g.editing = false
      }else if(g.keyListener.getKeyNewState(g.keyAdvantage)){
        // change block type
        const oldBlockType = g.editStageData[g.menu._editCursorX][g.menu._editCursorY]
        const blockTypes = ['n', 'a', 'f']
        const newBlockTypeIndex = (blockTypes.indexOf(oldBlockType) + 1) % blockTypes.length
        const newBlockType = blockTypes[newBlockTypeIndex]

        g.editStageData[g.menu._editCursorX][g.menu._editCursorY] = newBlockType
      }
    }

    if(g.keyListener.getKeyNewState(g.keySpeedUp)){
      // for debug
      outputEditStageData()
    }
  }else if(g.editStart){
    g.editing = true
    g.editStart = false
  }

  if(menuName === 'CREATE' && (g.device.isMobile || g.device.isTablet)){
    // edit for mobile
    const sizeIndex = g.stageSizeList.indexOf(g.editStageSize)
    const stageSize = g.stageSizeValues[sizeIndex]
    const stageWidth = stageSize[0]
    const stageLength = stageSize[1]

    const editorLeft = g.menu._subMenuSX + 255
    const editorTop = 40
    const editorCubeWidth = 30
    const editorWidth = editorCubeWidth * stageWidth
    const editorHeight = editorCubeWidth * stageLength

    const touches = g.controller.touchEndWithinRect(
      editorLeft, editorTop, editorWidth, editorHeight
    )
    touches.forEach((touch) => {
      let startX = Math.floor((touch.startX - editorLeft) / editorCubeWidth)
      let startY = Math.floor((touch.startY - editorTop) / editorCubeWidth)
      let endX = Math.floor((touch.clientX - editorLeft) / editorCubeWidth)
      let endY = Math.floor((touch.clientY - editorTop) / editorCubeWidth)

      startX = Math.min(Math.max(startX, 0), stageWidth - 1)
      startY = Math.min(Math.max(startY, 0), stageLength - 1)
      endX = Math.min(Math.max(endX, 0), stageWidth - 1)
      endY = Math.min(Math.max(endY, 0), stageLength - 1)

      if(startX === endX && startY === endY){
        // change block type
        const oldBlockType = g.editStageData[startX][startY]
        const blockTypes = ['n', 'a', 'f']
        const newBlockTypeIndex = (blockTypes.indexOf(oldBlockType) + 1) % blockTypes.length
        const newBlockType = blockTypes[newBlockTypeIndex]

        g.editStageData[startX][startY] = newBlockType
      }
    })
  }

  if(g.optionNameEdit){
    g.nameEditor.handleInput()
  }

  if(g.menu._moving){
    const diffTime = g.getElapsedTime(g.menu._moveSubMenuTime)
    const maxTime = g.menuMoveTime
    if(diffTime >= maxTime){
      g.menu._moving = false
    }
  }
  g.keyListener.resetKeyNewState()
  resetTouchState()
}

function setMenuTileFolding(tile, tileArray) {
  tile._marked = true
  const x = tile._tileX
  const y = tile._tileY
  const arr = tileArray
  tileArray.forEach( (tile2) => {
    if(!tile2._marked){
      // left
      if(tile2._tileX === x-1 && tile2._tileY === y){
        const bone = new Bone()
        bone.rotate = new Vector4(0, 0, 0, 1)
        bone.offset = new Vector3(-0.5, 0, 0)

        tile._model.rootBone.childBoneArray[0].addChild(bone)
        bone.addChild(tile2._model.rootBone)
        tile2.setScale(1.0)
        tile2.setPosition(-0.5, 0, 0)

        tile._leftTile = tile2
        tile._leftBone = bone
        setMenuTileFolding(tile2, arr)
      }
      // right
      else if(tile2._tileX === x+1 && tile2._tileY === y){
        const bone = new Bone()
        bone.rotate = new Vector4(0, 0, 0, 1)
        bone.offset = new Vector3(0.5, 0, 0)

        tile._model.rootBone.childBoneArray[0].addChild(bone)
        bone.addChild(tile2._model.rootBone)
        tile2.setScale(1.0)
        tile2.setPosition(0.5, 0, 0)

        tile._rightTile = tile2
        tile._rightBone = bone
        setMenuTileFolding(tile2, arr)
      }
      // top
      else if(tile2._tileX === x && tile2._tileY === y-1){
        const bone = new Bone()
        bone.rotate = new Vector4(0, 0, 0, 1)
        bone.offset = new Vector3(0, -0.5, 0)

        tile._model.rootBone.childBoneArray[0].addChild(bone)
        bone.addChild(tile2._model.rootBone)
        tile2.setScale(1.0)
        tile2.setPosition(0, -0.5, 0)

        tile._topTile = tile2
        tile._topBone = bone
        setMenuTileFolding(tile2, arr)
      }
      // bottom
      else if(tile2._tileX === x && tile2._tileY === y+1){
        const bone = new Bone()
        bone.rotate = new Vector4(0, 0, 0, 1)
        bone.offset = new Vector3(0, 0.5, 0)

        tile._model.rootBone.childBoneArray[0].addChild(bone)
        bone.addChild(tile2._model.rootBone)
        tile2.setScale(1.0)
        tile2.setPosition(0, 0.5, 0)

        tile._bottomTile = tile2
        tile._bottomBone = bone
        setMenuTileFolding(tile2, arr)
      }
    }
  })
}

function moveCubeToTopLeft() {
  const tilePos = g.menu._foldingTiles[0]._position
  const cameraPos = g.camera.position

  g.menu._folding = false
  g.menu._moveTopLeft = true
  g.menu._moveTopLeftTime = new Date(g.nowTime.getTime())
  g.menu._cubeSrcX = tilePos.x
  g.menu._cubeSrcY = tilePos.y
  g.menu._cubeDstX = cameraPos.x - g.menu._topLeftDX
  g.menu._cubeDstY = cameraPos.y - g.menu._topLeftDY

  g.menu.showFadeTile()
}

function subMenuReturn() {
  g.canvasField.removeObject(g.menuPlayerObj)

  g.camera.distance = 20.0
  // FIXME
  g.canvasField.addObject(g.menu._opTileObj, true)
  g.menu.addTilesToCanvas()
  g.menu.initMenuParams()

  // set first menu
  const cursor = g.menu._cursor
  g.menu._srcCursor = cursor
  g.menu._srcX = g.menu._opPosX[cursor]
  g.menu._srcY = g.menu._opPosY[cursor]
  g.menu._dstCursor = cursor
  g.menu._dstX = g.menu._opPosX[cursor]
  g.menu._dstY = g.menu._opPosY[cursor]
  g.menu._startTime = new Date(g.nowTime.getTime())
  g.menu._moving = true
  g.menu._cursor = cursor

  g.menu._opStayTiles.length = 0
  g.menu._opUpTiles.length = 0
  g.menu._opDownTiles.length = 0
  const srcTiles = g.menu.getMenuTiles(g.menu._srcCursor)
  srcTiles.forEach( (tile) => {
    g.menu._opUpTiles.push(tile)
  })
}

function setSoundVolume() {
  const vol = g.soundVolume
  g.bgm_menu.volume = vol

  // FIXME: create se array
  g.se_select.volume = vol
  g.se_decision.volume = vol
  g.se_substage.volume = vol
  g.se_mark.volume = vol
  g.se_markon.volume = vol
  g.se_erase.volume = vol
  g.se_forbidden.volume = vol
  g.se_break.volume = vol
  g.se_roll.volume = vol
  g.se_fall.volume = vol
  g.se_count.volume = vol
  g.se_bonus.volume = vol
  g.se_stagecall_1.volume = vol
  g.se_stagecall_2.volume = vol
  g.se_stagecall_3.volume = vol
  g.se_stagecall_4.volume = vol
  g.se_stagecall_5.volume = vol
  g.se_stagecall_6.volume = vol
  g.se_stagecall_7.volume = vol
  g.se_stagecall_8.volume = vol
  g.se_stagecall_9.volume = vol
  g.se_excellent.volume = vol
  g.se_perfect.volume = vol
  g.se_great.volume = vol
  g.se_again.volume = vol
  g.se_step.volume = vol
  g.se_lifted.volume = vol
  g.se_stamped.volume = vol
  g.se_scream.volume = vol
}

function updateOptionValue() {
  // Level
  const levelData = g.levelData.get(g.level)
  g.showMarker     = levelData.get('showMarker')
  g.rotateWaitTime = levelData.get('rotateWaitTime')
  g.rotateTime     = levelData.get('rotateTime')
  g.penaltyDiff    = levelData.get('penaltyDiff')

  // Character
  const characterData = g.characterData.get(g.character)
  g.characterSpeed = characterData.get('characterSpeed')

  // KeyConfig: nothing to do
  // SoundVolume: nothing to do
  // Language: nothing to do

  saveCookieOption()
}

function showIQLoop() {
  g.nowTime = new Date()

  if(!g.gameOverFadeOut){
    if(decisionKeyPushed()){
      g.gameOverFadeOut = true
      g.gameOverFadeOutStartTime = new Date(g.nowTime.getTime())
    }
  }else{
    const diffTime = g.getElapsedTime(g.gameOverFadeOutStartTime)
    if(diffTime > g.gameOverFadeOutTime){
      if(g.isNewRecord){
        if(g.playerName.length === 0){
          // ask to enter player name
          IQSceneChanger.change(2.0, true, null, null, enterNameLoop, () => {
            removeAllObjects()

            const nameBoxY = 50
            const keyboardY = 200
            g.nameEditor = new IQNameEditor(null, nameBoxY, null, keyboardY)
            g.nameEditor.setEndEditCallback(() => {
              if(g.playerName.length === 0){
                // beep: you must have name
                playSound(g.se_forbidden)
              }else{
                // save player's name to cookie
                g.cookieManager.setCookie(g.cookieOptionPlayer, g.playerName)
                sendScore()
                moveToNextSceneFromGameOver()
              }
            })
            g.canvasField.addObject(g.nameEditor)
          })
        }else{
          sendScore()
          moveToNextSceneFromGameOver()
        }
      }else{
        moveToNextSceneFromGameOver()
      }
    }
  }
  g.keyListener.resetKeyNewState()
  resetTouchState()
}

function moveToNextSceneFromGameOver() {
  if(g.getNewCharacter){
    IQSceneChanger.change(2.0, true, g.bgm_menu, null, showNewCharacterLoop, setupNewCharacterFunctions)
  }else{
    g.continueFadeInStartTime = new Date(g.nowTime.getTime())
    removeAllObjects()
    g.menu.setMenu('continue')
    g.canvasField.addObject(g.menu)
    g.canvasField.setFrameCallback(showContinueLoop)
  }
}

function showContinueLoop() {
  g.nowTime = new Date()
  
  if(!g.sceneChanging){
    const touchedMenu = g.menu.getTouchedMenuNumber()
    if(g.keyListener.getKeyNewState(g.keyMark) || touchedMenu >= 0){
      const srcBGM = g.bgm_gameover
      let cursorPos = g.menu._subCursor
      if(touchedMenu >= 0){
        cursorPos = touchedMenu
      }

      switch(cursorPos){
        case 0: {
          // Tweet
          const url = g.shareURL
          const text = 'I.Q ' + g.iqPoint
          const href = 'http://twitter.com/share?url=' + escape(url)
                  + '&text=' + escape(text)
                  + '&hashtags=IQRevenge'
          window.location.href = href
          break
        }

        case 1: {
          // Continue

          setStageBGM(g.stage)
          IQSceneChanger.change(1.0, true, srcBGM, g.bgm_stagecall, null, () => {
            stop()
            resetValues(g.stage, false)
            .then(start)
          })
          break
        }

        case 2: {
          // back to top

          IQSceneChanger.change(2.0, true, srcBGM, g.bgm_menu, showMenuLoop, () => {
            g.menu.setMenu('top')
            g.camera.distance = 20.0
            g.menu.addTilesToCanvas()
            g.menu.initMenuParams()
            g.canvasField.addObject(g.menu._opTileObj, true)

            // set first menu
            const cursor = 0
            g.menu._srcCursor = cursor
            g.menu._srcX = g.menu._opPosX[cursor]
            g.menu._srcY = g.menu._opPosY[cursor]
            g.menu._dstCursor = cursor
            g.menu._dstX = g.menu._opPosX[cursor]
            g.menu._dstY = g.menu._opPosY[cursor]
            g.menu._startTime = new Date(g.nowTime.getTime())
            g.menu._moving = true
            g.menu._cursor = cursor

            g.menu._opStayTiles.length = 0
            g.menu._opUpTiles.length = 0
            g.menu._opDownTiles.length = 0
            const srcTiles = g.menu.getMenuTiles(g.menu._srcCursor)
            srcTiles.forEach( (tile) => {
              g.menu._opUpTiles.push(tile)
            })

            // set light
            g.light.setPosition(-50, 0, -100)
            g.light.setAmbient(0.6, 0.6, 0.6, 0.0)
            g.light.setDiffuse(0.7, 0.7, 0.7, 0.0)
            g.light.setSpecular(0.9, 0.9, 0.9, 0.0)
            g.renderer.setLight(g.light)
          })
          break
        }

        default: {
          // nothing to do
        }
      }
    }

    const max = 3
    if(g.keyListener.getKeyNewState(g.keyUp)){
      g.menu._subCursor = (g.menu._subCursor + max - 1) % max
    }
    if(g.keyListener.getKeyNewState(g.keyDown)){
      g.menu._subCursor = (g.menu._subCursor + 1) % max
    }
  }

  g.keyListener.resetKeyNewState()
  resetTouchState()
}

function setupNewCharacterFunctions() {
  removeAllObjects()

  // prepare a new character
  g.newCharacterObj = new DH3DObject()
  g.newCharacterObj.setModel(g.models.get(g.getNewCharacter))
  g.newCharacterObj.setMotion(g.standing)
  g.newCharacterObj.setAnimationTime(0)
  g.newCharacterObj.setState('standing')
  g.newCharacterObj.setAnimator(g.animator)
  g.newCharacterObj.setAnimating(true)
  g.newCharacterObj.setLoop(true)
  g.newCharacterObj.setRenderer(g.renderer)
  g.newCharacterObj.setRotate(0, 1, 0, 0)
  g.newCharacterObj.setAutoDirection(false)
  g.newCharacterObj.setPosition(0, 0, 0)

  // set step SE callback
  g.newCharacterObj.clearMotionCallback()
  g.newCharacterObj.addMotionCallback(playSECallback_step, g.se_step_walkTiming_1, 'walking')
  g.newCharacterObj.addMotionCallback(playSECallback_step, g.se_step_walkTiming_2, 'walking')

  // face cube
  g.faceCube = new IQFaceCube()
  g.canvasField.addObject(g.faceCube)
  g.canvasField.addObject(g.faceCube._lidObj) // FIXME: do it in IQFaceCube
  g.faceCube.setScale(g.cubeSize)
  g.faceCube.setPosition(0, 0, 0)

  // set camera
  g.camera.lookat(-30, 50, -100, 0, 0, 0, 0, 1, 0)
  g.camera.perspective(45.0, g.canvasWidth / g.canvasHeight, g.cameraNear, g.cameraFar)

  // set light
  g.light.setPosition(-30, 50, -100)

  // set timer
  g.newCharacterStartTime = new Date(g.nowTime.getTime())
  g.newCharacterBeforeTimeDiff = 0

  const functions = [
    {
      begin: 0,
      duration: g.newCharacterRotateTime,
      func: (diffTime) => {
        // rotate the box
        const rot = diffTime / g.newCharacterTimePerRotate
        const rotCount = Math.floor(rot)
        const rotMod = rot - rotCount
        const sqrt2 = Math.sqrt(2)
        const r = g.cubeSize * sqrt2 * 0.5
        const cubeZ = rotCount - g.newCharacterRotateMaxCount

        g.camera.lookat(-30, 50, -100, 0, 0, 0, 0, 1, 0)
        g.faceCube.setRotateAxis(g.xaxis, (g.newCharacterRotateMaxCount - rot - 1) * Math.PI * 0.5)
        const cubePosY = r * Math.sin(Math.PI * (0.25 + rotMod * 0.5))
        const cubePosZ = -(cubeZ - 0.5) * g.cubeSize - r * (sqrt2 - Math.cos(Math.PI * (0.25 + rotMod * 0.5)))
        g.faceCube.setPosition(0, cubePosY, cubePosZ)

        const rotateTurn1 = Math.floor(g.newCharacterBeforeTimeDiff / g.newCharacterTimeRotate)
        const rotateTurn2 = rotCount
        if(rotateTurn1 > 0 && rotateTurn1 < rotateTurn2){
          playSound()
        }
        g.newCharacterBeforeTimeDiff = diffTime
      }
    },
    {
      once: true,
      func: () => {
        // prepare for opening lid
        g.faceCube.setRotateAxis(g.xaxis, 3 * Math.PI * 0.5)
        g.faceCube.setPosition(0, g.cubeSize / 2, 0)
        g.newCharacterObj.setPosition(0, 0, 0)
        g.canvasField.addObject(g.newCharacterObj)
      }
    },
    {
      // nothing to do. wait for opening the lid
      duration: g.newCharacterWaitOpenTime
    },
    {
      duration: g.newCharacterWaitOpenTime,
      func: (diffTime, rate) => {
        // open the lid
        g.faceCube.setLidAngle(rate * Math.PI * 0.5)
      }
    },
    {
      once: true,
      func: () => {
        // complete opening the lid
        g.faceCube.setLidAngle(Math.PI * 0.5)
      }
    },
    {
      // nothing to do
      duration: g.newCharacterWaitWalkTime
    },
    {
      once: true,
      func: () => {
        // prepare to walk
        g.newCharacterObj.setState('walking')
        g.newCharacterObj.setMotionWithBlending(g.walking, 5)
        g.newCharacterObj.setAnimationTime(0)
      }
    },
    {
      duration: g.newCharacterWalkTime,
      func: (diffTime, rate) => {
        // walk
        const walkingSpeed = 0.02
        const z = -walkingSpeed * diffTime
        g.newCharacterObj.setPosition(0, 0, z)
      }
    },
    {
      once: true,
      func: () => {
        // go to the next scene
        removeAllObjects()
        g.newCharacterObj = null

        if(g.gameOver){
          // gameover: show continue
          IQSceneChanger.change(3.0, true, null, null, showContinueLoop, () => {
            g.menu.setMenu('continue')
            g.canvasField.addObject(g.menu)
            g.continueFadeInStartTime = new Date(g.nowTime.getTime())
          })
        }else{
          // ending: go back to the menu
          IQSceneChanger.change(3.0, true, null, g.bgm_menu, showMenuLoop, () => {
            // nothing to do
          })
        }
      }
    }
  ]

  g.showNewCharacterFunc = IQTimeExecuter.create(functions)
}

function showNewCharacterLoop() {
  g.nowTime = new Date()
  const diffTime = g.getElapsedTime(g.newCharacterStartTime)

  g.showNewCharacterFunc(diffTime)

  g.keyListener.resetKeyNewState()
  resetTouchState()
}

/*
function showNewCharacterLoop() {
  g.nowTime = new Date()

  const diffTime = g.getElapsedTime(g.newCharacterStartTime)

  if(diffTime < t1){
    // rotate
    const rot = diffTime / g.newCharacterTimePerRotate
    const rotMod = diffTime % g.newCharacterTimePerRotate
    const rotCount = Math.floor(rot)
    const sqrt2 = Math.sqrt(2)
    const r = g.cubeSize * sqrt2 * 0.5
    const cubeZ = rotCount - g.newCharacterRotateMaxCount

    g.faceCube.setRotateAxis(g.xaxis, rot * Math.PI * 0.5)
    const cubePosY = r * Math.sin(Math.PI * (0.25 + rotMod * 0.5))
    const cubePosZ = (cubeZ - 0.5) * g.cubeSize + r * (sqrt2 - Math.cos(Math.PI * (0.25 + rotMod * 0.5)))
    g.faceCube.setPosition(0, cubePosY, cubePosZ)

    const rotateTurn1 = Math.floor(g.newCharacterBeforeTimeDiff / g.newCharacterTimeRotate)
    const rotateTurn2 = rotCount
    if(rotateTurn1 > 0 && rotateTurn1 < rotateTurn2){
      playSound()
    }
  }else if(diffTime < t2){
    // wait
    if(g.newCharacterBeforeTimeDiff < t1){
      g.faceCube.setRotateAxis(g.xaxis, 3 * Math.PI * 0.5)
      g.faceCube.setPosition(0, 0, 0)
    }
  }else if(diffTime < t3){
    // open the lid
    if(g.newCharacterBeforeTimeDiff < t2){
      // put character in the box
      g.newCharacterObj.setPosition(0, 0, 0)
    }
    g.faceCube.setLidAngle((diffTime - t2) / g.newCharacterOpenTime * Math.PI * 0.5)
  }else if(diffTime < t4){
    // wait
    if(g.newCharacterBeforeTimeDiff < t3){
      g.faceCube.setLidAngle(Math.PI * 0.5)
    }
  }else if(diffTime < t5){
    // walk
    if(g.newCharacterBeforeTimeDiff < t4){
      // start to walk
      g.newCharacterObj.setMotionWithBlending(g.walk, 5)
      g.newCharacterObj.setAnimationTime(0)
    }
    g.newCharacterObj.setPosition(0, 0, (diffTime - t4))
  }else if(!g.sceneChanging){
    // end
    IQSceneChanger.change(3.0, true, null, g.bgm_menu, showMenuLoop, () => {
      removeAllObjects()
      g.newCharacterObj = null
    })
  }else{
    // nothing to do
  }

  g.newCharacterBeforeTimeDiff = diffTime

  g.keyListener.resetKeyNewState()
  resetTouchState()
}
*/

function loadRulesData() {
  const audioDataFile = g.rulesAudioDataURLPrefix + g.ruleNumber 
                      + '_' + g.deviceType + '_' + g.language + '.txt'
  const audioPromise = AjaxRequest.get(audioDataFile, { async: true })

  const moveDataFile = g.rulesMoveDataURLPrefix + g.ruleNumber + '.txt'
  const movePromise = AjaxRequest.get(moveDataFile, { async: true })

  return Promise.all([
    audioPromise, movePromise
  ]).then((result) => {
    g.rulesMoveData = new IQRecorder(result[1])
    return loadRulesAudio(result[0]).then(mergeRulesData)
  })
}

function loadRulesAudio(audioData) {
  const lines = audioData.split('\n')
  const audioPromises = []
  let resumeData = null
  g.rulesDataArray.length = 0
  g.rulesDataIndex = 0

  let ext = ''
  if(g.support_mp3){
    ext = '.mp3'
  }else if(g.support_ogg){
    ext = '.ogg'
  }else{
    // audio is not supported...
    ext = null
  }

  // iPhone and iPad can't play audio automaticaly, so don't use audio files
  if(g.device.isMobile || g.device.isTablet){
    ext = null
  }

  lines.forEach((line) => {
    const tokens = line.split(';')
    if(tokens.length >= 3){
      const data = {
        type: tokens[0],
        time: parseInt(tokens[1], 10),
        duration: parseInt(tokens[2], 10)
      }

      if(resumeData && resumeData.time < data.time){
        g.rulesDataArray.push(resumeData)
        resumeData = null
      }

      if(tokens[0] === 'audio'){
        // type (='audio'), time, duration, audioFileName, text1, text2, ...
        if(ext){
          const audio = new Audio()
          const fileName = g.rulesAudioDirectory + '/' + tokens[3] + ext
          const promise = new Promise((resolve, reject) => {
            audio.addEventListener('canplaythrough', () => { resolve() }, false)
            audio.addEventListener('error', (error) => { reject(error) }, false)
          }).catch((error) => {
            console.error('Audio file load error: ' + audio.src + ': ' + error)
          })
          audioPromises.push(promise)

          audio.src = fileName
          audio.volume = g.soundVolume

          data.audio = audio
        }else{
          data.audio = null
        }
        data.text = tokens.slice(4)
        data.callback = simAudioCallback
      }else if(tokens[0] === 'pause'){
        // type (='pause'), time, duration
        if(tokens.length > 4){
          data.spotX = parseInt(tokens[3], 10)
          data.spotY = parseInt(tokens[4], 10)
        }
        data.callback = simPauseCallback

        resumeData = {
          type: 'resume',
          time: (data.time + data.duration),
          duration: data.duration,
          callback: simResumeCallback
        }
      }else if(tokens[0] === 'end'){
        // type (='end'), time, 0(reserved)
        data.callback = simEndCallback
      }
         
      g.rulesDataArray.push(data)
    }
  })

  return Promise.all(audioPromises)
}

function mergeRulesData() {
  let addTime = 0
  let controlIndex = 1
  const audioLength = g.rulesDataArray.length
  const newArray = []

  for(let audioIndex = 0; audioIndex < audioLength; audioIndex++){
    const audioData = g.rulesDataArray[audioIndex]
    let controlData = g.rulesMoveData.getRecord(controlIndex)
    while(controlData && (controlData.gameTime + addTime) < audioData.time){
      const prevData = g.rulesMoveData.getRecord(controlIndex - 1)
      controlData.type = 'control'
      controlData.time = controlData.gameTime + addTime
      controlData.callback = simControlCallback
      controlData.elapsedTime = controlData.canvasTime - prevData.canvasTime
      controlData.gameTime += addTime

      newArray.push(controlData)

      controlIndex++
      controlData = g.rulesMoveData.getRecord(controlIndex)
    }

    if(audioData.type === 'pause'){
      addTime += audioData.duration
    }
    newArray.push(audioData)
  }

  g.rulesDataArray = newArray
}

function skipTimeCallback(skipTime) {
  g.addTimeToAllTimer(skipTime)

  if(g.qCubeArray){
    g.qCubeArray.forEach((cubeLine) => {
      cubeLine.forEach((cube) => {
        if(cube){
          cube.addTime(skipTime)
        }
      })
    })
  }

  if(g.aCubeArray){
    g.aCubeArray.forEach((cubeLine) => {
      cubeLine.forEach((cube) => {
        if(cube){
          cube.addTime(skipTime)
        }
      })
    })
  }

  if(g.markerArray){
    g.markerArray.forEach((marker) => {
      marker.addTime(skipTime)
    })
  }

  if(g.plateMarkerArray){
    g.plateMarkerArray.forEach((markerLine) => {
      markerLine.forEach((marker) => {
        if(marker){
          marker.addTime(skipTime)
        }
      })
    })
  }

  if(g.effectArray){
    g.effectArray.forEach((effect) => {
      effect.addTime(skipTime)
    })
  }

  if(g.labelObj){
    g.labelObj.addTime(skipTime)
  }
}

function simFrameCallback(diffTime) {
  g.rulesElapsedTime = diffTime

  if(decisionKeyPushed()){
    // go back to menu
    quitRulePlay()
  }
}

function simControlCallback(data, elapsedTime) {
  g.demoGameTime = data.gameTime

  g.keyListener._keyState[g.keyMark] = data.keyState[0]
  g.keyListener._keyState[g.keyAdvantage] = data.keyState[1]
  g.keyListener._keyState[g.keySpeedUp] = data.keyState[2]
  g.keyListener._keyState[g.keyPause] = data.keyState[3]
  g.keyListener._keyState[g.keyUp] = data.keyState[4]
  g.keyListener._keyState[g.keyDown] = data.keyState[5]
  g.keyListener._keyState[g.keyLeft] = data.keyState[6]
  g.keyListener._keyState[g.keyRight] = data.keyState[7]

  g.keyListener._keyNewState[g.keyMark] = data.keyNewState[0]
  g.keyListener._keyNewState[g.keyAdvantage] = data.keyNewState[1]
  g.keyListener._keyNewState[g.keySpeedUp] = data.keyNewState[2]
  g.keyListener._keyNewState[g.keyPause] = data.keyNewState[3]
  g.keyListener._keyNewState[g.keyUp] = data.keyNewState[4]
  g.keyListener._keyNewState[g.keyDown] = data.keyNewState[5]
  g.keyListener._keyNewState[g.keyLeft] = data.keyNewState[6]
  g.keyListener._keyNewState[g.keyRight] = data.keyNewState[7]
}

function simAudioCallback(data) {
  if(g.rulesCurrentAudio){
    pauseSound(g.rulesCurrentAudio.audio)
  }

  g.rulesCurrentAudio = data
  playSound(data.audio)
}

function simPauseCallback(data) {
  g.rulePause = true
  g.rulesCurrentPause = data
  g.canvasField.pauseSimulation()
}

function simResumeCallback(data) {
  g.rulePause = false
  g.rulesCurrentPause = null
  g.canvasField.resumeSimulation()
}

function simEndCallback(data) {
  quitRulePlay()
}

function setup(extra = false) {
  if(!checkObjLoaded()){
    setTimeout(setup, 500)
    return
  }

  g.playExtra = extra

  let loadDataPromise = null

  if(g.testPlay){
    // test play in the edit mode
    g.stageMax = 1
    g.stage = 1
    g.stageFiles = ['TestPlay'] // just set dummy string

    loadDataPromise = new Promise((resolve) => {
      // just resolve
      resolve()
    })
  }else if(g.rulePlay){
    if(g.ruleNumber === 1){
      // Basic Rules 1
      g.stageFiles = ['', g.ruleStageDataFile1]
    }else if(g.ruleNumber === 2){
      // Basic Rules 2
      g.stageFiles = ['', g.ruleStageDataFile2]
    }

    loadDataPromise = new Promise((resolve) => {
      // just resolve
      resolve()
    })
  }else if(g.playSharedStage){
    g.stageMax = 1
    g.stage = 1
    g.stageFiles = ['SharedStage'] // just set dummy string

    loadDataPromise = new Promise((resolve) => {
      // just resolve
      resolve()
    })
  }else if(g.playExtra){
    loadDataPromise = loadStageFilesData(g.extraStageDataFile)
  }else{
    loadDataPromise = loadStageFilesData(g.stageDataFile)
  }

  loadDataPromise
  .then(() => {
    // character
    let character = g.character
    if(g.rulePlay){
      character = 'Miku'
    }else if(g.playSharedStage){
      if(g.query.has(g.sharedStageParamCharacter)){
        character = g.query.get(g.sharedStageParamCharacter)
      }
    }
    g.playerObj.setModel(g.models.get(character))
    g.characterSpeed = g.characterData.get(character).get('characterSpeed')

    // FIXME: use Map
    if(character === 'Miku'){
      //g.playerObj.setModel(g.model_miku)
      g.se_step.src    = g.se_directory  + '/' + g.se_miku_step_file    + g.snd_ext
      g.se_lifted.src  = g.se_directory  + '/' + g.se_miku_lifted_file  + g.snd_ext
      g.se_stamped.src = g.se_directory  + '/' + g.se_miku_stamped_file + g.snd_ext
      g.se_scream.src  = g.se_directory  + '/' + g.se_miku_scream_file  + g.snd_ext
      g.se_step_timing_1 = g.se_miku_step_timing_1
      g.se_step_timing_2 = g.se_miku_step_timing_2
      //g.menu._opMenuEnable[6] = false
      //g.characterSpeed = g.characterData.get('Miku').get('characterSpeed')
    }else if(character === 'Rin'){
      // TODO: create sound
      g.se_step.src    = g.se_directory  + '/' + g.se_miku_step_file    + g.snd_ext
      g.se_lifted.src  = g.se_directory  + '/' + g.se_miku_lifted_file  + g.snd_ext
      g.se_stamped.src = g.se_directory  + '/' + g.se_miku_stamped_file + g.snd_ext
      g.se_scream.src  = g.se_directory  + '/' + g.se_miku_scream_file  + g.snd_ext
      g.se_step_timing_1 = g.se_miku_step_timing_1
      g.se_step_timing_2 = g.se_miku_step_timing_2
    }else if(character === 'Len'){
      // TODO: create sound
      g.se_step.src    = g.se_directory  + '/' + g.se_miku_step_file    + g.snd_ext
      g.se_lifted.src  = g.se_directory  + '/' + g.se_miku_lifted_file  + g.snd_ext
      g.se_stamped.src = g.se_directory  + '/' + g.se_miku_stamped_file + g.snd_ext
      g.se_scream.src  = g.se_directory  + '/' + g.se_miku_scream_file  + g.snd_ext
      g.se_step_timing_1 = g.se_miku_step_timing_1
      g.se_step_timing_2 = g.se_miku_step_timing_2
    }
    /*
    else if(g.character === 'Cyan'){
      //g.playerObj.setModel(g.model_cyan)
      g.se_step.src    = g.se_directory  + '/' + g.se_cyan_step_file    + g.snd_ext
      g.se_lifted.src  = g.se_directory  + '/' + g.se_cyan_lifted_file  + g.snd_ext
      g.se_stamped.src = g.se_directory  + '/' + g.se_cyan_stamped_file + g.snd_ext
      g.se_scream.src  = g.se_directory  + '/' + g.se_cyan_scream_file  + g.snd_ext
      g.se_step_timing_1 = g.se_cyan_step_timing_1
      g.se_step_timing_2 = g.se_cyan_step_timing_2
      //g.menu._opMenuEnable[6] = false
      //g.characterSpeed = g.characterData.get('Cyan').get('characterSpeed')
    }else if(g.character === 'Reimu'){
      //g.playerObj.setModel(g.model_reimu)
      g.se_step.src    = g.se_directory  + '/' + g.se_reimu_step_file    + g.snd_ext
      g.se_lifted.src  = g.se_directory  + '/' + g.se_reimu_lifted_file  + g.snd_ext
      g.se_stamped.src = g.se_directory  + '/' + g.se_reimu_stamped_file + g.snd_ext
      g.se_scream.src  = g.se_directory  + '/' + g.se_reimu_scream_file  + g.snd_ext
      g.se_step_timing_1 = g.se_cyan_step_timing_1
      g.se_step_timing_2 = g.se_cyan_step_timing_2
      //g.menu._opMenuEnable[6] = true
      //g.characterSpeed = g.characterData.get('Reimu').get('characterSpeed')
    }
    */

    // motion sound
    g.playerObj.clearMotionCallback()
    g.playerObj.addMotionCallback(playSECallback_step, g.se_step_timing_1, 'running')
    g.playerObj.addMotionCallback(playSECallback_step, g.se_step_timing_2, 'running')

    let stageNo = g.selectedStage
    if(g.testPlay || g.rulePlay || g.playSharedStage){
      stageNo = null
    }else if(g.playExtra){
      stageNo = 1
    }

    resetValues(stageNo)
    .then(() => {
      start()
    })
  })
}

/**
 * go back to edit from test play
 * @access public
 * @returns {void}
 */
function quitTestPlay() {
  if(g.sceneChanging){
    return
  }

  IQSceneChanger.change(3.0, true, g.bgm_stage, g.bgm_menu, showSubMenuLoop, () => {
    g.quittingTestPlay = false
    g.pausing = false

    const createCursor = 4
    removeAllObjects()
    g.canvasField.addObject(g.menu)
    g.camera.lookat(
      g.menu._opPosX[createCursor], g.menu._opPosY[createCursor], -135,
      g.menu._opPosX[createCursor], g.menu._opPosY[createCursor], 0,
    0, -1, 0)

    g.menu.setMenu('top')
    g.menu._cursor = 4  // 'CREATE'
    //g.menu.setSubMenu()
    setSubMenu()
    g.menu._subCursor = 3 // 'Play'

    // set light
    g.light.setPosition(-50, 0, -100)
    g.light.setAmbient(0.6, 0.6, 0.6, 0.0)
    g.light.setDiffuse(0.7, 0.7, 0.7, 0.0)
    g.light.setSpecular(0.9, 0.9, 0.9, 0.0)
    g.renderer.setLight(g.light)

    // title objects: 'CREATE'
    const len = g.menu.getOptionName().length
    for(let i=0; i<len; i++){
      g.canvasField.addObject(g.menu._foldingTiles[i])
    }

    g.testPlay = false
    g.canvasField.moveEnable = true
  }, true)
}

/**
 * go to the main menu from playing a shared stage
 * @access public
 * @returns {void}
 */
function quitSharedStage() {
  if(g.sceneChanging){
    return
  }

  IQSceneChanger.change(3.0, true, g.bgm_stage, g.bgm_menu, showMenuLoop, () => {
    stop()
    g.quittingSharedStage = false
    g.pausing = false

    const startCursor = 0 // 'START'
    removeAllObjects()
    g.canvasField.addObject(g.menu)
    g.camera.lookat(
      g.menu._opPosX[startCursor], g.menu._opPosY[startCursor], -135,
      g.menu._opPosX[startCursor], g.menu._opPosY[startCursor], 0,
    0, -1, 0)

    g.menu.setMenu('top')
    g.menu._cursor = startCursor

    g.camera.distance = 20.0
    g.menu.addTilesToCanvas()
    g.menu.initMenuParams()
    g.canvasField.addObject(g.menu._opTileObj, true)

    // set first menu
    const cursor = 0
    g.menu._srcCursor = cursor
    g.menu._srcX = g.menu._opPosX[cursor]
    g.menu._srcY = g.menu._opPosY[cursor]
    g.menu._dstCursor = cursor
    g.menu._dstX = g.menu._opPosX[cursor]
    g.menu._dstY = g.menu._opPosY[cursor]
    g.menu._startTime = new Date(g.nowTime.getTime())
    g.menu._moving = true
    g.menu._cursor = cursor

    g.menu._opStayTiles.length = 0
    g.menu._opUpTiles.length = 0
    g.menu._opDownTiles.length = 0
    const srcTiles = g.menu.getMenuTiles(g.menu._srcCursor)
    srcTiles.forEach( (tile) => {
      g.menu._opUpTiles.push(tile)
    })

    // set light
    g.light.setPosition(-50, 0, -100)
    g.light.setAmbient(0.6, 0.6, 0.6, 0.0)
    g.light.setDiffuse(0.7, 0.7, 0.7, 0.0)
    g.light.setSpecular(0.9, 0.9, 0.9, 0.0)
    g.renderer.setLight(g.light)

    g.playSharedStage = false
    g.canvasField.moveEnable = true

    start()
  }, true)
}

/**
 * go back to rules
 * @access public
 * @returns {void}
 */
function quitRulePlay() {
  if(g.ruleQuitting){
    return
  }
  g.ruleQuitting = true
    
  IQSceneChanger.change(3.0, true, g.bgm_stage, g.bgm_menu, showSubMenuLoop, () => {
    g.rulePlay = false
    g.demoPlay = false
    g.ruleQuitting = false

    g.canvasField.endSimulation()
    g.keyListener.resetKeyState()

    // stop rules audio
    g.rulesDataArray.forEach((data) => {
      if(data.audio){
        data.audio.pause()
      }
    })

    const rulesCursor = 3
    removeAllObjects()
    // FIXME: do it elsewhere
    g.menu.setFadeTileAlpha(0)
    g.canvasField.addObject(g.menu)
    g.camera.lookat(
      g.menu._opPosX[rulesCursor], g.menu._opPosY[rulesCursor], -135,
      g.menu._opPosX[rulesCursor], g.menu._opPosY[rulesCursor], 0,
      0, -1, 0
    )

    g.menu.setMenu('top')
    g.menu._cursor = rulesCursor  // 'RULES'
    setSubMenu()
    g.menu._subCursor = g.ruleNumber - 1

    // set light
    g.light.setPosition(-50, 0, -100)
    g.light.setAmbient(0.6, 0.6, 0.6, 0.0)
    g.light.setDiffuse(0.7, 0.7, 0.7, 0.0)
    g.light.setSpecular(0.9, 0.9, 0.9, 0.0)
    g.renderer.setLight(g.light)

    // title objects: 'RULES'
    const len = g.menu.getOptionName().length
    for(let i=0; i<len; i++){
      g.canvasField.addObject(g.menu._foldingTiles[i])
    }

    g.keyListener.resetKeyState()

    restoreSettingFromRules()
  }, true)
}

function saveSettingForRules() {
  g.rulesSettingBackup.character = g.character
  g.rulesSettingBackup.characterSpeed = g.characterSpeed
  g.rulesSettingBackup.showMarker = g.showMarker
  g.rulesSettingBackup.rotateWaitTime = g.rotateWaitTime
  g.rulesSettingBackup.rotateTime = g.rotateTime
  g.rulesSettingBackup.penaltyDiff = g.penaltyDiff
}

function restoreSettingFromRules() {
  g.character = g.rulesSettingBackup.character
  g.characterSpeed = g.rulesSettingBackup.characterSpeed
  g.showMarker = g.rulesSettingBackup.showMarker
  g.rotateWaitTime = g.rulesSettingBackup.rotateWaitTime
  g.rotateTime = g.rulesSettingBackup.rotateTime
  g.penaltyDiff = g.rulesSettingBackup.penaltyDiff
}

/**
 * show edited stage data for debug
 * @access public
 * @returns {void}
 */
function outputEditStageData() {
  let debugInfo = g.editStageStep + ','
  const sizeIndex = g.stageSizeList.indexOf(g.editStageSize)
  const stageSize = g.stageSizeValues[sizeIndex]
  for(let y=0; y<stageSize[1]; y++){
    for(let x=0; x<stageSize[0]; x++){
      debugInfo += g.editStageData[x][y]
    }
  }
  console.info(`stageData: ${debugInfo}`)
}

function downProcess() {
  if(g.playerObj._state === 'down'){
    const diffTime = g.getElapsedTime(g.playerObj.downStartTime)
    if(diffTime > g.downWaitTime){
      g.playerObj._state = 'standup'
      g.playerObj.setMotionWithBlending(g.standup, 3)
      g.playerObj.animationTime = 0
      g.playerObj.standupStartTime = new Date(g.nowTime.getTime())
    }
  }else if(g.playerObj._state === 'standup'){
    const diffTime = g.getElapsedTime(g.playerObj.standupStartTime)
    if(diffTime > g.standupWaitTime){
      g.playerObj._state = 'standing'
      g.playerObj.setMotionWithBlending(g.standing, 3)
      g.playerObj.animationTime = 0
    }
  }
}

function createSubStageProcess() {
  if(!g.stageCreating)
    return

  let diffTime = g.getElapsedTime(g.stageCreateStartTime)
  if(!g.stageStarting){
    diffTime -= g.stageCreateWait
  }

  const borderTime = g.stageCreateDelay * g.questionLength * g.subSubStageMax
  const maxTime = borderTime - g.stageCreateDelay + g.stageCreateBlockMoveTime
  const maxZ = g.questionLength * g.subSubStageMax * g.cubeSize
  const borderZ = g.minZ + maxZ * diffTime / borderTime

  if(g.gameOverFlag && diffTime > g.stageCreateDelay * (g.stageLength + 1.0)){
    if(!g.gameOver){
      // game over
      const minZ = g.cubeSize * g.stageLength + 15
      if(g.playerObj._position.z < minZ){
        g.playerObj._position.z = minZ
      }
      gameOver()
    }
  }else if(diffTime > maxTime){
    if(!g.stageStarting){
      g.stageCreating = false
      createSubSubStage()
    }
  }else if(diffTime > borderTime + g.stageCreateDelay){
    if(g.playerObj._state === 'rolling'){
      g.playerObj._position.z = maxZ + g.cubeSize
      g.playerObj._state = 'down'
      g.playerObj.setMotionWithBlending(g.down, 3)
      g.playerObj.animationTime = 0
      g.playerObj.downStartTime = new Date(g.nowTime.getTime())

      playSound(g.se_lifted)
    }
    pauseSound(g.se_substage)
  }else if(diffTime > borderTime){
    g.moveMinZ = g.minZ + g.cubeSize * g.questionLength * g.subSubStageMax
  }else if(diffTime > 0){
    if(borderZ > g.playerObj._position.z && g.playerObj._state !== 'rolling'){
      g.playerObj._state = 'rolling'
      g.playerObj.setMotionWithBlending(g.rolling, 5)
      g.playerObj.animationTime = 0
      g.playerObj.setDirection(Math.PI)

      g.iqPoint -= 1
    }
  }
  if(g.playerObj._state === 'rolling'){
    g.playerObj._position.z = borderZ
  }
}

function createStage(stageFile) {
  const e = 0.0001
  const promise = loadQuestionFile(stageFile)
  .then(() => {
    // set stage texture
    IQCube.setNormalCubeTextureForStage(g.stage)

    if(g.stageObj){
      g.canvasField.removeObject(g.stageObj)
    }
    g.stageObj = new IQStage(g.stageHeight, g.stageWidth, g.stageLength)
    g.canvasField.addObject(g.stageObj, false, true)
    // FIXME
    g.stageObj._floor.setMirror(true)
    g.canvasField.addObject(g.stageObj._floor, false, true)
    g.minX = -g.stageWidth * 0.5 * g.cubeSize
    g.maxX = -g.minX - e
    g.minZ = -0.5 * g.cubeSize
    g.moveMinZ = g.minZ
    g.maxZ = (g.stageLength - 0.5) * g.cubeSize - e
    g.stageStarting = true

    g.penaltyMax = g.stageWidth + g.penaltyDiff
    g.subStage = 1

    const work = g.stageCreateWait
    g.stageCreateWait = 0
    createSubStage()
    g.stageCreateWait = work

    // set player params
    const z = (g.questionLength * g.subSubStageMax + 2.5) * g.cubeSize
    g.playerObj.setPosition(0, 0, z)
    g.playerObj.setDirection(Math.PI)

    // set camera params
    g.cameraTargetX = 0
    g.cameraTargetY = 0
    g.cameraTargetZ = g.minZ
    g.cameraXAngle = 0
    g.cameraYAngle = Math.PI * 1.5
  })

  return promise
}

function loadSubStageData() {
  const data = g.stageData[g.subStage]

  g.subSubStageMax = data.subSubStageMax
  g.questionLength = data.questionLength
  g.numQuestions   = data.numQuestions
  g.questionArray  = data.questionArray
  g.questionUsed   = []
}

function createSubStage() {
  if(g.stageCreating){
    return -1
  }
  g.stageCreating = true

  loadSubStageData()

  g.qCubeArray = []
  const cubePosY = -g.cubeSize * 0.5 - g.cubeEpsilon
  let cubePosZ = 0
  let qlen = g.questionLength * g.subSubStageMax
  if(g.stageLength <= qlen){
    g.gameOverFlag = true
    qlen = g.stageLength
  }
  for(let z=0; z<qlen; z++){
    let cubePosX = (-g.stageWidth * 0.5 + 0.5) * g.cubeSize
    const cubeLine = []
    for(let x=0; x<g.stageWidth; x++){
      const cubeObj = new IQCube()
      cubeObj.setPosition(cubePosX, cubePosY, cubePosZ)
      cubeObj.setRotateAxis(g.xaxis, 0.0)
      g.canvasField.addObject(cubeObj)

      cubeLine[x] = cubeObj
      cubePosX += g.cubeSize
    }
    g.qCubeArray[z] = cubeLine
    cubePosZ += g.cubeSize
  }

  //const startTime = new Date()
  const startTime = new Date(g.nowTime.getTime())
  for(let z=0; z<qlen; z++){
    const cubeLine = g.qCubeArray[z]
    const moveTime = g.stageCreateWait + g.stageCreateDelay * z
    for(let x=0; x<g.stageWidth; x++){
      const obj = cubeLine[x]
      obj.state = 'entry'
      obj.startTime = new Date(startTime.getTime())
      obj.moveTime = moveTime
      obj.rotateCount = 0
      obj.bx = x
      obj.by = -g.cubeEpsilon
      obj.bz = z
      obj.addMoveCallback(blockReady)
    }
  }

  g.subSubStage = 1
  g.stageCreateStartTime = new Date(g.nowTime.getTime())

  if(g.subStage === 1){
    if(g.recording){
      g.recorder = new IQRecorder()
      g.recorder.startRecord()
      g.recordElapsedTime = 0
      g.canvasField.setMspf(g.recordMspf)
    }
    if(g.demoPlay){
      g.canvasField.startSimulation(g.nowTime, g.rulesDataArray, simFrameCallback)
      g.demoStartTime = new Date(g.nowTime.getTime())
      if(g.rulePlay){
        g.rulesStartTime = new Date(g.nowTime.getTime())
      }
    }
  }

  if(g.rulePlay){
    // nothing to do
  }else if(g.playExtra){
    // nothing to do
  }else if(g.subStage === 1){
    // stage call
    switch(g.stage){
      case 1: {
        playSound(g.se_stagecall_1)
        break
      }
      case 2: {
        playSound(g.se_stagecall_2)
        break
      }
      case 3: {
        playSound(g.se_stagecall_3)
        break
      }
      case 4: {
        playSound(g.se_stagecall_4)
        break
      }
      case 5: {
        playSound(g.se_stagecall_5)
        break
      }
      case 6: {
        playSound(g.se_stagecall_6)
        break
      }
      case 7: {
        playSound(g.se_stagecall_7)
        break
      }
      case 8: {
        playSound(g.se_stagecall_8)
        break
      }
      case 9: {
        playSound(g.se_stagecall_9)
        break
      }
      default: {
        console.error(`unknown stage call: ${g.stage}`)
      }
    }
  }else{
    playSound(g.se_substage, true)
  }

  return 0
}

function blockReady(obj) {
  if(obj.paused){
    return
  }

  // FIXME: merge to createStage function
  const moveLength = g.stageCreateBlockMoveTime

  if(obj.state === 'entry'){
    const diffTime = g.getElapsedTime(obj.startTime)
    if(obj.moveTime < diffTime){
      if(obj.moveTime + moveLength > diffTime){
        // delete marker
        const marker = g.plateMarkerArray[obj.bz][obj.bx]
        if(marker){
          if(marker.type === 'blue'){
            g.activeMarker = null
            g.markerOn = false
          }
          marker.erase()
        }
        obj._position.y = (g.cubeSize + g.cubeEpsilon) 
                          * ((diffTime - obj.moveTime) / moveLength - 0.5) - g.cubeEpsilon
      }else{
        obj._position.y = g.cubeSize * 0.5
        obj.state = 'ready'
        obj.removeMoveCallback(blockReady)
      }
    }
  }
}

function loadStageFilesData(fileName) {
  let dir = String(fileName).replace(/\/[^\/]*$/, '/')
  if(dir === fileName){
    dir = './'
  }
  
  return AjaxRequest.get(fileName, {
    async: false
  })
  .then((result) => {
    const data = result
    let line = 0
    const lines = data.split('\n')

    // numStages
    g.stageMax = parseInt(lines[line], 10)
    line++

    g.stageFiles = []
    for(let i=1; i<=g.stageMax; i++){
      g.stageFiles[i] = dir + lines[line]
      line++
    }
  })
  .catch((error) => {
    console.error(`Stage data loading error: ${error}`)
  })
}

function loadQuestionFile(fileName) {
  let promise = null

  if(g.testPlay){
    // build test play data
    const sizeIndex = g.stageSizeList.indexOf(g.editStageSize)
    const stageSize = g.stageSizeValues[sizeIndex]
    const stageLength = 30 // FIXME: make it dynamic
    const baseStep = g.editStageStep
    promise = new Promise((resolve) => {
      let testData = 'Test Play\n' // stage name
      testData += stageSize[0] + ',' + stageLength + '\n' // stage size
      testData += '1\n' // number of sub stages
      testData += '1\n' // number of sub sub stages
      testData += stageSize[1] + '\n' // question length
      testData += '1\n' // number of questions
      testData += baseStep + ','

      for(let y=0; y<stageSize[1]; y++){
        for(let x=0; x<stageSize[0]; x++){
          testData += g.editStageData[x][y]
        }
      }

      testData += '\n'

      resolve(testData)

      return testData
    })
  }else if(g.playSharedStage){
    promise = new Promise((resolve) => {
      const sharedData = createSharedStage()

      resolve(sharedData)

      return sharedData
    })
  }else{
    promise = AjaxRequest.get(fileName, {
      async: false
    })
  }
  
  if(g.rulePlay){
    saveSettingForRules()
  
    // level normal
    g.character = 'Miku'
    g.characterSpeed = 250
    g.showMarker = true
    g.rotateWaitTime = 600
    g.rotateTime = 900
    g.penaltyDiff = 0
    g.penaltyMax = 4
  }

  promise.then((result) => {
    const data = result

    let line = 0
    const lines = data.split('\n')

    // stageName
    g.stageName = lines[line]
    line++

    // stageWidth,stageLength
    let tokens = lines[line].split(',')
    g.stageWidth = parseInt(tokens[0], 10)
    g.stageLength = parseInt(tokens[1], 10)
    line++

    // numOfSubStages
    g.subStageMax = parseInt(lines[line], 10)
    line++

    // loop for sub-stages
    g.stageData = []
    for(let stage=1; stage<=g.subStageMax; stage++){
      const obj = new Object()

      // subSubStageMax
      obj.subSubStageMax = parseInt(lines[line], 10)
      line++

      // questionLength
      obj.questionLength = parseInt(lines[line], 10)
      line++

      // numQuestions
      obj.numQuestions = parseInt(lines[line], 10)
      line++

      obj.questionArray = []

      // loop for questions
      for(let i=0; i<obj.numQuestions; i++){
        tokens = lines[line].split(',')
        const q = new IQQuestion()

        q.baseStep = parseInt(tokens[0], 10)
        q.data = []
        let index = 0
        for(let z=0; z<obj.questionLength; z++){
          const dataLine = []
          for(let x=0; x<g.stageWidth; x++){
            const dataChar = tokens[1].charAt(index)
            switch(dataChar){
              case 'a': {
                dataLine.push('advantage')
                break
              }
              case 'f': {
                dataLine.push('forbidden')
                break
              }
              case 'n':
              default: {
                dataLine.push('normal')
              }
            }
            index++
          }
          q.data.push(dataLine)
        }
        obj.questionArray.push(q)

        line++
      }

      g.stageData[stage] = obj
    }

    // initialize movable area data
    g.movableArea = []
    for(let z=0; z<g.stageLength; z++){
      line = []
      for(let x=0; x<g.stageWidth; x++){
        line[x] = true
      }
      g.movableArea[z] = line
    }
  })

  return promise
}

function setQuestion(again) {
  let qNo = -1

  if(g.rulePlay){
    qNo = g.rulePlayQuestionNo
    g.rulePlayQuestionNo++
  }else if(again){
    qNo = g.questionNo
  }else{
    // select question
    let used = true
    for(let i=0; i<g.numQuestions; i++){
      if(!g.questionUsed[i]){
        used = false
        break
      }
    }
    if(used){
      g.questionUsed = []
    }

    qNo = Math.floor(Math.random() * g.numQuestions)
    while(g.questionUsed[qNo]){
      qNo = (qNo + 1) % g.numQuestions
    }
    g.questionNo = qNo
    g.questionUsed[qNo] = true
  }

  const q = g.questionArray[qNo]

  g.baseStep = q.baseStep
  for(let z=0; z<g.questionLength; z++){
    for(let x=0; x<g.stageWidth; x++){
      const cube = g.aCubeArray[z][x]
      cube.setType(q.data[z][x])
      g.canvasField.addObject(cube)
    }
  }
}

function createSubSubStage(again) {
  if(g.activated){ return -1 }
  g.activated = true

  // initialize values
  g.missed = false
  g.speedUpByMiss = false
  g.step = 0

  g.aCubeArray = []
  g.rotateElapsedTime = 0
  const zStart = g.questionLength * (g.subSubStageMax - g.subSubStage)
  const zEnd = g.questionLength * (g.subSubStageMax - g.subSubStage + 1)
  for(let z=0; z<zEnd; z++){
    const cubeLine = g.qCubeArray[z]
    for(let x=0; x<g.stageWidth; x++){
      const cubeObj = cubeLine[x]
      g.canvasField.removeObject(cubeObj)
    }
  }
  for(let z=zStart; z<zEnd; z++){
    const cubeLine = g.qCubeArray[z]
    for(let x=0; x<g.stageWidth; x++){
      const cubeObj = cubeLine[x]
      cubeObj.state = 'active'
      cubeObj._position.y = g.cubeSize * 0.5
      //cubeObj.removeMoveCallback(blockReady)
    }
    g.aCubeArray.push(cubeLine)
  }
  g.aCubeZ = zStart

  g.moveMinZ = g.minZ + g.cubeSize * zStart

  setQuestion(again)

  g.canvasField.removeObject(g.stageObj._waitCube)
  if(zStart > 0){
    g.stageObj.createWaitCube(zStart)
    g.canvasField.addObject(g.stageObj._waitCube)
  }

  return 0
}

function blockRotate() {
  if(g.deleting){
    return
  }

  if(g.rotateElapsedTime < g.rotateWaitTime && g.gameOver){
    // stop rotation 
    g.rotateElapsedTime = 0
  }else if(g.speedUp || g.speedUpByMiss){
    g.rotateElapsedTime += g.elapsedTime * g.speedUpRate
  }else{
    g.rotateElapsedTime += g.elapsedTime
  }

  const waitTime = g.rotateWaitTime

  if(!g.activated || g.rotateElapsedTime < waitTime){
    return
  }

  g.blockDeleted = false
  
  if(g.rotateElapsedTime > g.rotateWaitTime + g.rotateTime){
    // rotation ended
    g.rotating = false
    g.aCubeZ++

    const cubePosY = 0.5 * g.cubeSize
    let cubePosZ = g.aCubeZ * g.cubeSize
    for(let z=0; z<g.aCubeArray.length; z++){
      const cubeLine = g.aCubeArray[z]
      cubeLine.forEach((obj) => {
        if(!obj)
          return

        obj.rotateCount = (obj.rotateCount + 1) % 4
        obj.setRotateAxis(g.xaxis, obj.rotateCount * Math.PI * 0.5)
        obj.setPosition(obj._position.x, cubePosY, cubePosZ)
      })
      cubePosZ += g.cubeSize
    }

    // check if block would be fallen
    let fallen = false
    if(g.stageLength < g.aCubeZ + g.questionLength){
      let zStart = g.stageLength - g.aCubeZ
      if(zStart < 0)
        zStart = 0

      for(let z=zStart; z<g.questionLength; z++){
        const cubeLine = g.aCubeArray[z]
        for(let x=0; x<g.stageWidth; x++){
          const cube = cubeLine[x]
          if(cube){
            //cube.fallStartTime = new Date()
            cube.fallStartTime = new Date(g.nowTime.getTime())
            cubeLine[x] = null
            g.fallCubeArray.push(cube)
            fallen = true
          }
        }
      }
    }
    if(fallen){
      playSound(g.se_fall)
    }

    g.markerArray.forEach( (marker) => {
      if(marker.type === 'red'){
        marker.deleteStartTime = new Date(g.nowTime.getTime())
      }
    })

    if(g.stepCounting){
      g.step++
    }
    g.rotateElapsedTime = 0
    checkMarker()

    // check if there's cube
    let rollCube = false
    g.aCubeArray.forEach( (line) => {
      line.forEach( (cube) => {
        if(cube)
          rollCube = true
      })
    })
    if(rollCube){
      playSound(g.se_roll)
    }

  }else{
    if(!g.rotating){
      g.rotating = true
      // delete red marker
      for(let z=0; z<g.stageLength; z++){
        for(let x=0; x<g.stageWidth; x++){
          const marker = g.plateMarkerArray[z][x]
          if(marker && marker.type === 'red'){
            marker.erase()
          }
        }
      }
    }
    if(g.rotateElapsedTime > g.rotateWaitTime + g.rotateTime * g.checkMissTiming){
      // check miss
      const bx = Math.floor((g.playerObj._position.x - g.minX) / g.cubeSize)
      const bz = Math.floor((g.playerObj._position.z - g.minZ) / g.cubeSize)
      const c = getCubeAt(bz-1, bx)
      if(c){
        // stamped
        g.missed = true
        g.stepCounting = true
        g.speedUpByMiss = true
        g.playerObj._state = 'down'
        g.playerObj.setMotionWithBlending(g.down, 3)
        g.playerObj.animationTime = 0
        g.playerObj.downStartTime = new Date(g.nowTime.getTime())

        playSound(g.se_stamped)
      }
    }
    const rot = (g.rotateElapsedTime - g.rotateWaitTime) / g.rotateTime
    const sqrt2 = Math.sqrt(2)
    const r = g.cubeSize * sqrt2 * 0.5

    let cubeZ = g.aCubeZ
    for(let z=0; z<g.aCubeArray.length; z++, cubeZ++){
      const cubeLine = g.aCubeArray[z]
      cubeLine.forEach( (obj) => {
        if(!obj)
          return

        obj.setRotateAxis(g.xaxis, (obj.rotateCount + rot) * Math.PI * 0.5)
        const cubePosY = r * Math.sin(Math.PI * (0.25 + rot * 0.5))
        const cubePosZ = (cubeZ - 0.5) * g.cubeSize + r * (sqrt2 - Math.cos(Math.PI * (0.25 + rot * 0.5)))
        obj.setPosition(obj._position.x, cubePosY, cubePosZ)
      })
    }
  }
}

function markerRotate() {
  const rotateTime = 3000
  const rot = (g.nowTime % rotateTime) * Math.PI * 2.0 / rotateTime 
  g.markerArray.forEach( (marker) => {
    marker.setRotateAxis(g.yaxis, rot)
    if(marker.startTime){
      if(g.markerRemainTime < g.getElapsedTime(marker.startTime)){
        marker.erase()
      }
    }
    if(!g.rotating && marker.deleteStartTime){
      if(g.deletedWaitTime < g.getElapsedTime(marker.deleteStartTime)){
        marker.erase()
      }
    }
  })
}

function setMarker() {
  if(g.markerOn){
    g.activeMarker.setType('red')

    g.markerOn = false
    g.activeMarker = null

    playSound(g.se_markon)

    // FIXME
    if(!g.rotating){
      checkMarker()
    }
  }else{
    let cubeX = Math.floor((g.playerObj._position.x - g.minX) / g.cubeSize)
    let cubeZ = Math.floor((g.playerObj._position.z - g.minZ) / g.cubeSize)

    // value check
    if(cubeX < 0)
      cubeX = 0
    else if(cubeX >= g.stageWidth)
      cubeX = g.stageWidth - 1

    if(cubeZ < 0)
      cubeZ = 0
    else if(cubeZ >= g.stageLength)
      cubeZ = g.stageLength - 1

    if(g.plateMarkerArray[cubeZ][cubeX] === null){
      const marker = new IQMarker('blue')
      const plate = new IQMarkerPlate('blue')
      marker.markerPlate = plate
      marker.setPositionWithCube(cubeZ, cubeX)
      if(g.showMarker){
        g.canvasField.addObject(marker, false, true)
      }
      g.canvasField.addObject(plate, true, true)

      g.activeMarker = marker
      g.markerOn = true
      g.markerArray.push(marker)

      playSound(g.se_mark)
    }
  }
}

function useAdvantage() {
  let used = false
  g.markerArray.forEach( (marker) => {
    if(marker.type === 'green'){
      used = true
      marker.setType('red')

      let xStart = marker.cubeX - 1
      let xEnd   = marker.cubeX + 1
      let zStart = marker.cubeZ - 1
      let zEnd   = marker.cubeZ + 1

      if(xStart < 0)
        xStart = 0
      if(xEnd >= g.stageWidth)
        xEnd = g.stageWidth - 1

      const zStartMin = g.questionLength * (g.subSubStageMax - g.subSubStage)
      if(zStart < zStartMin)
        zStart = zStartMin
      if(zEnd >= g.stageLength)
        zEnd = g.stageLength - 1

      for(let z=zStart; z<=zEnd; z++){
        for(let x=xStart; x<=xEnd; x++){
          if(g.plateMarkerArray[z][x] === null){
            // FIXME: マーカ削除対策(blue -> red)
            const redMarker = new IQMarker('blue')
            const plate = new IQMarkerPlate('red')
            redMarker.markerPlate = plate
            redMarker.advantage = true
            redMarker.setPositionWithCube(z, x)
            redMarker.setType('red')
            if(g.showMarker){
              g.canvasField.addObject(redMarker, false, true)
            }
            g.canvasField.addObject(plate, true, true)
            g.markerArray.push(redMarker)
          }
        }
      }
    }
  })

  if(used){
    // use advantage marker
    playSound(g.se_markon)
    if(!g.rotating){
      checkMarker()
    }
  }
}

function checkMarker() {
  let deleted = false
  let aCount = 0

  g.markerArray.forEach( (marker) => {
    if(marker.type === 'red'){
      const cube = getCubeAt(marker.cubeZ, marker.cubeX)
      if(cube){
        if(marker.advantage){
          aCount++
        }
        cube.eraseWithMarker(marker)
        IQEffectPlate.create(true, marker.cubeZ, marker.cubeX, g.deletedWaitTime)
        IQEffectPlate.create(true, marker.cubeZ + 1, marker.cubeX, g.deletedWaitTime)
        IQEffectPlate.create(false, marker.cubeZ, marker.cubeX, g.deletedWaitTime)
        IQEffectPlate.create(false, marker.cubeZ, marker.cubeX + 1, g.deletedWaitTime)
 
        if(cube.type === 'advantage'){
          marker.setType('green')
          marker.deleteStartTime = null
        }else if(!marker.advantage && !marker.deleteStartTime){
          marker.deleteStartTime = new Date(g.nowTime.getTime())
        }

        deleted = true
      }
    }
  })
  if(deleted){
    g.rotateElapsedTime = -g.afterDeleteAdditionalWaitTime
    g.deleting = true
    if(!g.stepCounting){
      g.stepCounting = true
      g.step = 1
    }
    if(aCount > 0){
      const point = aCount * g.pointAdvantage
      g.labelObj.addMessage(aCount + g.leftMessageAdvantageCount)
      g.labelObj.addMessage(point  + g.leftMessageAdvantagePoint)

      // delete red markers
      g.markerArray.forEach( (marker) => {
        if(marker.type === 'red' && marker.advantage && !marker.deleteStartTime){
          marker.deleteStartTime = new Date(g.nowTime.getTime())
        }
      })
    }
  }
}

function getCubeAt(z, x) {
  const cubeZ = z - g.aCubeZ
  if(cubeZ < 0)
    return null

  const cubeLine = g.aCubeArray[cubeZ]
  if(cubeLine){
    return cubeLine[x]
  }
  return null
}

function fallProcess() {
  const endTime = 1000
  const arr = g.fallCubeArray

  arr.forEach( (cube) => {
    const diffTime = g.getElapsedTime(cube.fallStartTime)
    if(diffTime > endTime){
      g.fallCubeArray = g.fallCubeArray.filter((fallCube) => { return fallCube !== cube })
      g.canvasField.removeObject(cube)
      if(cube.type !== 'forbidden' || g.speedUpByMiss){
        g.penalty++
        g.missed = true
        if(g.penalty >= g.penaltyMax){
          g.stageObj.breakOneLine(true)
          playSound(g.se_break)
        }
      }
    }else{
      //const val = diffTime * 0.001
      //const posY = g.cubeSize * (0.5 - 10 * val * val)
      const val = diffTime * 0.001 + 0.68
      const posY = g.cubeSize * (5.1 - 10 * val * val)
      cube.setPosition(cube._position.x, posY, cube._position.z)
    }
  })
}

function deleteProcess() {
  if(!g.deleting)
    return

  const endTime = 500
  const arr = g.deleteCubeArray
  let cubeErased = false
  let forbiddenErased = false
  arr.forEach( (cube) => {
    const diffTime = g.getElapsedTime(cube.deleteStartTime) - g.deletedWaitTime
    if(diffTime > endTime){
      g.deleteCubeArray = g.deleteCubeArray.filter((deleteCube) => { return deleteCube !== cube })
      g.canvasField.removeObject(cube)
    }else if(diffTime > 0){
      if(!cube.deleteStarted){
        cube.deleteStarted = true
        if(cube.type === 'forbidden'){
          // miss
          g.stageObj.breakOneLine()
          playSound(g.se_break)
          g.missed = true
          forbiddenErased = true
        }else{
          cubeErased = true
        }
      }
      const posY = ((endTime - diffTime) / endTime - 0.5) * g.cubeSize
      cube.setPosition(cube._position.x, posY, cube._position.z)
    }
  })
  if(forbiddenErased){
    playSound(g.se_forbidden)
  }
  if(cubeErased){
    playSound(g.se_erase)
  }

  if(g.deleteCubeArray.length === 0){
    g.deleting = false
  }
}

function perfectProcess() {
  if(!g.perfect)
    return

  const perfectProcessTime = g.perfectStringTime + g.perfectWaitTime + g.perfectRotateTime
  const diffTime = g.getElapsedTime(g.perfectTime)
 
  if(diffTime > perfectProcessTime){
    g.perfect = false
    if(g.testPlay){
      // go back to edit
      quitTestPlay()
    }else if(g.playSharedStage){
      // go to main menu
      quitSharedStage()
    }else if(g.subSubStage === g.subSubStageMax){
      subStageClear()
    }else{
      g.subSubStage++
      createSubSubStage()
    }
  }
  if(g.addingLine){
    if(diffTime > g.perfectAddLineTime){
      g.addingLine = false

      g.addCubeArray.forEach( (cube) => {
        g.canvasField.removeObject(cube)
      })
      g.addCubeArray = []

      g.stageObj.addOneLine()

      const e = 0.0001
      g.maxZ = (g.stageLength - 0.5) * g.cubeSize - e

      // plateMarkerArray and plateCubeArray
      if(g.plateMarkerArray.length < g.stageLength){
        for(let z=g.plateMarkerArray.length; z<g.stageLength; z++){
          g.plateMarkerArray[z] = []
          for(let x=0; x<g.stageWidth; x++){
            g.plateMarkerArray[z][x] = null
          }
        }
      }
      if(g.plateCubeArray.length < g.stageLength){
        for(let z=g.plateMarkerArray.length; z<g.stageLength; z++){
          g.plateCubeArray[z] = []
          for(let x=0; x<g.stageWidth; x++){
            g.plateCubeArray[z][x] = null
          }
        }
      }
    }else{
      const r = 1.0 - diffTime / g.perfectAddLineTime
      const posZ = g.stageLength * g.cubeSize + r * g.perfectAddLineZ
      g.addCubeArray.forEach( (cube) => {
        cube._position.z = posZ
      })
    }
  }
}

function gameOver() {
  if(g.gameOver)
    return

  let music = g.bgm_gameover
  if(g.rulePlay || g.testPlay || g.playSharedStage){
    music = null
  }
  IQSceneChanger.change(0, false, g.bgm_stage, music, null, null)

  g.gameOver = true
  g.gameOverTime = new Date(g.nowTime.getTime())
  g.playerObj.setMotionWithBlending(g.falling, 3)
  g.playerObj.animationTime = 0
  g.playerObj._state = 'falling'

  // set IQ point and send it to server
  setIQPoint()

  playSound(g.se_scream)
}

function setIQPoint() {
  g.iqPoint = Math.floor(g.iqPoint)
  if(g.iqPoint < 0){
    g.iqPoint = 0
  }
  //sendScore()
  setIQtoCookie()

  checkNewCharacter()
}

function breakLineProcess() {
  if(!g.breaking)
    return

  const e = 0.0001
  const diffTime = g.getElapsedTime(g.breakStartTime)
  const endTime = 1000
  const line = g.breakCubeArray
  line.forEach( (cube) => {
    if(diffTime > cube.fallStartTime + endTime){
      g.breakCubeArray = g.breakCubeArray.filter((breakCube) => { return breakCube !== cube })
      g.canvasField.removeObject(cube)
    }else if(diffTime > cube.fallStartTime){
      const val = (diffTime - cube.fallStartTime) * 0.001
      const rot = val * Math.PI
      const posX = cube._position.x
      const posY = cube.baseY - g.cubeSize * 10 * val * val
      const posZ = cube.baseZ + val * g.cubeSize
      cube.setRotateAxis(g.xaxis, rot)
      cube.setPosition(posX, posY, posZ)

      if(cube.isTopCube && !g.ending){
        // check game over
        const cx = Math.floor((cube._position.x - g.minX) / g.cubeSize)
        const cz = Math.floor((cube._position.z - g.minZ) / g.cubeSize)
        const bx = Math.floor((g.playerObj._position.x - g.minX) / g.cubeSize)
        const bz = Math.floor((g.playerObj._position.z - g.minZ) / g.cubeSize)
        if(bx === cx && bz === cz){
          const minZ = g.cubeSize * cz + 15
          if(g.playerObj._position.z < minZ){
            g.playerObj._position.z = minZ
          }
          gameOver()
        }

        if(cx === 0){
          g.maxZ = (g.stageLength - 0.5) * g.cubeSize - e

          // delete marker
          g.markerArray.forEach( (marker) => {
            if(marker.cubeZ >= cz){
              if(marker.type === 'blue'){
                g.activeMarker = null
                g.markerOn = false
              }
              marker.erase()
            }
          })
        }
      }
    }
  })

  if(g.breakCubeArray.length === 0){
    g.breaking = false
    if(g.penalty >= g.penaltyMax){
      g.stageObj.breakOneLine(true)
      playSound(g.se_break)
    }else if(g.penaltyQueue > 0){
      g.stageObj.breakOneLine()
      playSound(g.se_break)
      g.penaltyQueue--
    }
  }
}

function gameOverProcess() {
  if(g.gameOver){
    const diffTime = g.getElapsedTime(g.gameOverTime) * 0.001
    g.playerObj._position.y = -60.0 * diffTime * (diffTime + 0.5)

    const maxTime = g.gameOverTime1 + g.gameOverTime2 + g.gameOverTime3 * 0.5
                + g.gameOverRotateTime * 5
                + g.gameOverWaitTime * 2
                + g.gameOverIQTime1 + g.gameOverIQTime2
    const animationStop = g.gameOverTime1 + g.gameOverTime2

    if(diffTime > maxTime * 0.001){
      removeAllObjects()
      g.canvasField.addObject(g.labelObj)
      g.canvasField.setFrameCallback(showIQLoop)
    }else if(diffTime > animationStop * 0.001){
      g.playerObj.setAnimating(false)
    }
  }
}

function checkClear() {
  if(g.gameOver)
    return

  if(g.stepCounting){
    let cleared = true
    g.aCubeArray.forEach( (line) => {
      line.forEach( (cube) => {
        if(cube && cube.type !== 'forbidden')
          cleared = false
      })
    })
    if(cleared){
      g.stepCounting = false
    }
  }
  if(!g.stepCounting && g.activated){
    let cleared = true
    g.aCubeArray.forEach( (line) => {
      line.forEach( (cube) => {
        if(cube){
          cleared = false
        }
      })
    })
    if(g.fallCubeArray.length > 0 ||
       g.deleteCubeArray.length > 0 ||
       g.breakCubeArray.length){
      cleared = false
    }
    
    if(cleared){
      g.activated = false

      // FIXME: timing
      subSubStageClear()
    }
  }
}

function subSubStageClear() {
  if(!g.missed){
    g.perfect = true
    g.addingLine = true
    g.perfectTime = new Date(g.nowTime.getTime())
    g.perfectCount++

    if(g.step < g.baseStep){
      // Excellent!!
      g.perfectString = g.messageExcellent
      g.score += g.pointExcellent

      g.labelObj.addMessage(g.leftMessageExcellent)
      g.labelObj.addMessage(g.leftMessageExcellentPoint)
      g.labelObj.addMessage('　')
      g.labelObj.addMessage(g.leftMessagePerfectCount + g.perfectCount)

      playSound(g.se_excellent)
      playSound(g.se_bonus)

      g.iqPoint += 4
    }else if(g.step === g.baseStep){
      // Perfect!
      g.perfectString = g.messagePerfect
      g.score += g.pointPerfect

      g.labelObj.addMessage(g.leftMessagePerfect)
      g.labelObj.addMessage(g.leftMessagePerfectPoint)
      g.labelObj.addMessage('　')
      g.labelObj.addMessage(g.leftMessagePerfectCount + g.perfectCount)

      playSound(g.se_perfect)
      playSound(g.se_bonus)

      g.iqPoint += 3
    }else{
      // Great!
      g.perfectString = g.messageGreat
      g.score += g.pointGreat

      g.labelObj.addMessage(g.leftMessageGreat)
      g.labelObj.addMessage(g.leftMessageGreatPoint)
      g.labelObj.addMessage('　')
      g.labelObj.addMessage(g.leftMessagePerfectCount + g.perfectCount)

      playSound(g.se_great)
      playSound(g.se_bonus)
      
      g.iqPoint += 2
    }

    // create one line
    addOneLineToStage()
  }else{
    // not perfect

    if(g.testPlay){
      // go back to edit
      quitTestPlay()
    }else if(g.playSharedStage){
      // go to main menu
      quitSharedStage()
    }

    g.iqPoint += 1
  }
  if(g.speedUpByMiss){
    g.again = true
    g.againTime = new Date(g.nowTime.getTime())
  }
  g.speedUpByMiss = false

  if(!g.perfect){
    if(g.subSubStage === g.subSubStageMax){
      g.again = false
      subStageClear()
    }else{
      g.subSubStage++
      createSubSubStage(g.again)
      if(g.again){
        playSound(g.se_again)
      }
    }
  }
}

function addOneLineToStage() {
  const posZ = g.stageLength * g.cubeSize + g.perfectAddLineZ
  let posY = -g.cubeSize * 0.5
  for(let y=0; y<g.stageHeight; y++){
    let posX = (-g.stageWidth * 0.5 + 0.5) * g.cubeSize
    for(let x=0; x<g.stageWidth; x++){
      const cube = new IQCube('normal')
      cube.setRotateAxis(g.xaxis, 0.0)
      cube.setPosition(posX, posY, posZ)
      g.canvasField.addObject(cube)
      g.addCubeArray.push(cube)

      posX += g.cubeSize
    }
    posY -= g.cubeSize
  }
}

function subStageClear() {
  if(g.rulePlay){
    // do not create sub stage
  }else if(g.playSharedStage){
    // do nothing
  }else if(g.subStage === g.subStageMax){
    stageClear()
  }else{
    g.subStage++
    createSubStage()
  }
}

function stageClear() {
  IQSceneChanger.change(0, false, g.bgm_stage, g.bgm_fanfare, null, null)

  g.stageLines = []
  for(let i=0; i<g.stageLength; i++){
    const line = g.stageObj.createOneLine()
    line._position.z = g.minZ + g.cubeSize * i
    g.stageLines[i] = line
    g.canvasField.addObject(line)
  }
  // remove objects
  g.canvasField.removeObject(g.stageObj)
  g.canvasField.removeObject(g.stageObj._floor)
  g.markerArray.forEach( (marker) => {
    marker.erase()
  })
  g.clearPlayerZ = g.playerObj._position.z
  g.clearPlayerBlockZ = Math.floor((g.clearPlayerZ - g.minZ) / g.cubeSize)
  g.clearScore = g.score
  g.bonusScore = 0

  g.stageClear = true
  g.clearTime = new Date(g.nowTime.getTime())
  g.oldBlockNo = 0

  g.playerObj.setMotionWithBlending(g.standing, 10)
  g.playerObj.animationTime = 0
  g.playerObj._state = 'standing'

  // update the max stage number
  if(g.stage + 1 > g.selectableMaxStage){
    g.selectableMaxStage = g.stage + 1
    setStageToCookie()
    updateStageList()
  }
}

function setStageBGM(stage) {
  let ext = ''
  const fileName = [
    null,
    g.bgm_stage1_file,
    g.bgm_stage2_file,
    g.bgm_stage3_file,
    g.bgm_stage4_file,
    g.bgm_stage5_file,
    g.bgm_stage6_file,
    g.bgm_stage7_file,
    g.bgm_stage8_file,
    g.bgm_stage9_file
  ]
  if(g.support_mp3){
    ext = '.mp3'
  }else if(g.support_ogg){
    ext = '.ogg'
  }else{
    return
  }
  g.bgm_stage.src = g.bgm_directory + '/' + fileName[stage] + ext
}

function clearProcess() {
  if(!g.stageClear || g.gameOver)
    return

  let diffTime = g.getElapsedTime(g.clearTime)
  const clearWaitTime = g.clearRotateTime * 2 + g.clearLabelTime
  const moveMaxTime = clearWaitTime + g.clearLineMoveTime * g.stageLength
  const clearMaxTime = moveMaxTime + g.clearLineWaitTime
  if(diffTime >= clearMaxTime){
    if(g.stageClearSceneChange)
      return

    g.bonusScore = g.stageLength * g.pointBonus
    if(g.stage === g.stageMax){
      // go to ending
      g.iqPoint = Math.floor(g.iqPoint)
      if(g.iqPoint < 0){
        g.iqPoint = 0
      }
      setIQtoCookie()
      loadEndingStory()
      
      IQSceneChanger.change(1.0, false, g.bgm_fanfare, null, endingLoop, () => {
        g.stageClear = false
        g.ending = true
        g.endingStartTime = new Date(g.nowTime.getTime())
        g.endingPhaseStartTime = new Date(g.nowTime.getTime())
        g.endingPhase = g.ENDING_PHASE_ADDSTAGE

        // setup stage
        g.canvasField.addObject(g.stageObj)
        g.canvasField.addObject(g.stageObj._floor, false, true)
        g.stageLines.forEach((line) => {
          g.canvasField.removeObject(line)
        })
        g.playerObj._position.z += g.cubeSize
      })

      g.stageClearSceneChange = true
    }else{
      // go to next stage
      setStageBGM(g.stage + 1)
      IQSceneChanger.change(1.0, true, g.bgm_fanfare, g.bgm_stagecall, null, () => {
        stop()
        g.stage++
        resetValues(g.stage, true)
        .then(start)
      })
      g.stageClearSceneChange = true
    }

    // FIXME: wait time
    return
  }else if(diffTime >= moveMaxTime){
    // finish count
    let nowZ = -g.cubeSize
    g.bonusScore = g.stageLength * g.pointBonus
    g.stageLines.forEach( (obj) => {
      obj._position.z = nowZ
      nowZ += g.cubeSize
    })
    if(g.oldBlockNo){
      playSound(g.se_count)
      g.oldBlockNo = 0
    }
  }else if(diffTime >= clearWaitTime){
    // count lines
    diffTime -= clearWaitTime

    const blockTime = diffTime / g.clearLineMoveTime
    const blockNo = Math.floor(blockTime)
    for(let i=0; i<blockNo; i++){
      g.stageLines[i]._position.z = g.minZ + (i - 1) * g.cubeSize
    }

    if(blockNo > g.clearPlayerBlockZ){
      g.playerObj._position.z = g.clearPlayerZ - g.cubeSize
    }else if(blockNo === g.clearPlayerBlockZ){
      g.playerObj._position.z = g.clearPlayerZ - (blockTime - blockNo) * g.cubeSize
    }
    g.stageLines[blockNo]._position.z = g.minZ + (blockNo * 2 - blockTime) * g.cubeSize

    if(blockNo >= g.stageLength){
      g.bonusScore = g.stageLength * g.pointBonus
    }else{
      g.bonusScore = (blockNo + 1) * g.pointBonus
    }

    if(blockNo > 1 && g.oldBlockNo !== blockNo){
      playSound(g.se_count)
    }
    g.oldBlockNo = blockNo
  }else{
    // nothing to do
  }
  g.score = g.clearScore + g.bonusScore
}

function checkControllable() {
  if(g.stageStarting || g.stageClear || g.gameOver)
    return false

  if(g.playerObj._state === 'rolling'
     || g.playerObj._state === 'down'
     || g.playerObj._state === 'standup'
     || g.playerObj._state === 'falling'){
    return false
  }

  return true
}

function loadEndingStory() {
  let textFile = null
  let audioFile = null
  //let movieFile = null

  switch(g.character){
    case 'Miku': {
      textFile = g.endingStoryTextMiku
      audioFile = g.endingStoryVoiceMiku
      break
    }

    case 'Rin': {
      textFile = g.endingStoryTextRin
      audioFile = g.endingStoryVoiceRin
      break
    }

    case 'Len': {
      textFile = g.endingStoryTextLen
      audioFile = g.endingStoryVoiceLen
      break
    }

    default: {
      console.error('loadEndingStory: unknown character: ' + g.character)
    }
  }

  if(textFile !== null){
    AjaxRequest.get(textFile, {
      async: false
    })
    .then((result) => {
      const texts = result.split('\n')
      g.endingStoryTitle = texts[0]

      // delete title and blank line
      texts.shift()
      texts.shift()
      while(texts[texts.length-1].length === 0){
        // delete empty line
        texts.pop()
      }
      g.endingStoryText = texts

      g.endingStoryChars = []
      let totalLen = 0
      const totalPauseTime = g.endingStoryLinePauseTime + g.endingStoryLineMoveTime
      g.endingStoryText.forEach((text) => {
        totalLen += text.length + totalPauseTime
        g.endingStoryChars.push(totalLen)
      })
      g.endingStoryTime = g.endingStoryTitleTime 
                        + totalLen * g.endingStoryTextSpeed
                        + g.endingStoryEndWaitTime
    })
    .catch((error) => {
      console.error('ending text loading error: ' + textFile + ': ' + error)
    })
  }

  g.endingStoryVoicePlayed = false
  if(g.snd_ext !== null){
    // voice
    if(audioFile !== null){
      g.endingStoryVoice = new Audio()
      g.endingStoryVoice.addEventListener('error', (error) => {
        console.error('ending voice loading error: ' + g.endingStoryVoice.src + ': ' + error)
      }, false)
      g.endingStoryVoice.src = g.se_directory + '/' + audioFile + g.snd_ext
      g.endingStoryVoice.volume = g.soundVolume
    }

    // ending bgm
    g.bgm_ending = new Audio()
    g.bgm_ending.addEventListener('error', (error) => {
      console.error('ending bgm loading error: ' + g.bgm_ending.src + ': ' + error)
    }, false)
    g.bgm_ending.src = g.bgm_directory + '/' + g.bgm_ending_file + g.snd_ext
    g.bgm_ending.volume = g.soundVolume

    // staff roll bgm
    g.bgm_staffroll = new Audio()
    g.bgm_staffroll.addEventListener('error', (error) => {
      console.error('staffroll bgm loading error: ' + g.bgm_staffroll.src + ': ' + error)
    }, false)
    g.bgm_staffroll.src = g.bgm_directory + '/' + g.bgm_staffroll_file + g.snd_ext
    g.bgm_staffroll.volume = g.soundVolume
  }

  // staff roll
  AjaxRequest.get(g.endingStaffRollFile, {
    async: false
  })
  .then((result) => {
    g.endingStaffRollText = result.split('\n')
  })
  .catch((error) => {
    console.error('staff roll loading error: ' + error)
  })
}

function endingLoop(elapsedTime) {
  g.nowTime = new Date()
  g.elapsedTime = elapsedTime * 1000.0

  const force = g.playerObj._force
  force.x = force.y = force.z = 0

  const diffTime = g.getElapsedTime(g.endingPhaseStartTime)

  switch(g.endingPhase){
    case g.ENDING_PHASE_ADDSTAGE: {
      // add lines to the stage
      if(diffTime > g.endingStageAddTime){
        if(g.addCubeArray.length > 0){
          g.addCubeArray.forEach((cube) => {
            g.canvasField.removeObject(cube)
          })
          g.addCubeArray.length = 0
          g.stageObj.addOneLine()
        }
        
        if(g.stageLength >= g.endingMinStageLength){
          // setup stage
          //g.canvasField.addObject(g.stageObj)
          //g.canvasField.addObject(g.stageObj._floor)
          //g.canvasField.addObject(g.stageObj._floor, false, true)
          //g.stageLines.forEach((line) => {
          //  g.canvasField.removeObject(line)
          //})
          //g.playerObj._position.z += g.cubeSize

          // go to the next phase
          g.endingPhase = g.ENDING_PHASE_WAIT_1
          g.endingPhaseStartTime = new Date(g.nowTime.getTime())
        }else{
          addOneLineToStage()
          g.endingPhaseStartTime.setMilliseconds(g.endingPhaseStartTime.getMilliseconds() + g.endingStageAddTime)
        }
      }else{
        // move cube line
        const r = 1.0 - diffTime / g.endingStageAddTime
        const posZ = g.stageLength * g.cubeSize + r * g.perfectAddLineZ
        g.addCubeArray.forEach((cube) => {
          cube._position.z = posZ
        })
      }
      break
    }

    case g.ENDING_PHASE_WAIT_1: {
      // wait few seconds
      if(diffTime > g.endingStageBreakTime){
        // start running
        g.stageObj.breakOneLine()
        playSound(g.se_break)
        g.endingPhaseStartTime = new Date(g.nowTime.getTime())

        g.playerObj.setMotionWithBlending(g.running, 10)
        g.playerObj.animationTime = 0
        g.playerObj._state = 'running'
        g.endingPhase = g.ENDING_PHASE_ESCAPE
      }
      break
    }

    case g.ENDING_PHASE_ESCAPE: {
      if(diffTime > g.endingStageBreakTime && g.playerObj._position.z < g.maxZ - g.cubeSize){
        // break stage
        if(!g.breaking){
          g.stageObj.breakOneLine()
          playSound(g.se_break)
          g.endingPhaseStartTime = new Date(g.nowTime.getTime())
        }
      }

      // escape to the edge of the stage
      const goalX = g.minX + g.cubeSize * 3.5 // center of the 4th cube
      const goalZ = g.moveMinZ
      const dx = goalX - g.playerObj._position.x
      const dz = goalZ - g.playerObj._position.z
      const buff = g.cubeSize * g.cubeSize / 2

      if(dx * dx + dz * dz < buff){
        // stop running
        g.playerObj.setMotionWithBlending(g.standing, 10)
        g.playerObj.animationTime = 0
        g.playerObj._state = 'standing'

        // look back
        g.playerObj._position.x = goalX
        g.playerObj._position.z = goalZ + g.cubeSize * 0.8
        //g.playerObj._direction = -Math.PI * 0.5
        g.playerObj._direction = 0

        // go to the next phase
        g.endingPhase = g.ENDING_PHASE_WAIT_2
        g.endingPhaseStartTime = new Date(g.nowTime.getTime())
      }else{
        // go to the goal
        const r = 1.0 / Math.sqrt(dx * dx + dz * dz)
        const sx = dx * r
        const sz = dz * r

        g.playerObj._force.x = sx * g.characterSpeed
        g.playerObj._force.z = sz * g.characterSpeed
      }

      break
    }

    case g.ENDING_PHASE_WAIT_2: {
      // wait the stage broken
      if(diffTime > g.endingStageBreakTime && !g.breaking){
        if(g.stageLength > g.endingSecondStageLength){
          // break stage
          g.stageObj.shrinkStage(g.stageLength - g.endingSecondStageLength)
          //g.stageLength = g.endingSecondStageLength
          //g.stageObj.length = g.endingSecondStageLength
          g.stageObj.breakOneLine()
          playSound(g.se_break)
          /*
          for(let i=g.stageLength; i>g.endingSecondStageLength; i--){
            g.stageObj.breakOneLine()
            g.breaking = false
          }
          */
          //g.endingPhaseStartTime.setMilliseconds(g.endingPhaseStartTime.getMilliseconds() + g.endingStageBreakTime)
          g.endingPhaseStartTime = new Date(g.nowTime.getTime())
        }else if(g.stageLength > 1){
          // break stage
          g.stageObj.breakOneLine()
          playSound(g.se_break)
          //g.endingPhaseStartTime.setMilliseconds(g.endingPhaseStartTime.getMilliseconds() + g.endingStageBreakTime)
          g.endingPhaseStartTime = new Date(g.nowTime.getTime())
        }else if(g.stageLength === 1){
          // break stage without the cube which the player is standing
          g.endingCube = g.stageObj.breakOneLine(false, true)
          playSound(g.se_break)
          g.canvasField.removeObject(g.stageObj)

          // get the last cube
          //g.endingCube = g.breakCubeArray[3]
          //g.breakCubeArray = g.breakCubeArray.filter((cube) => cube !== g.endingCube)
          //g.endingPhaseStartTime.setMilliseconds(g.endingPhaseStartTime.getMilliseconds() + g.endingStageBreakTime)
          g.endingPhaseStartTime = new Date(g.nowTime.getTime())
        }else if(g.stageLength === 0){
          // go to the next phase
          g.endingPhase = g.ENDING_PHASE_DOWN_1
          g.endingPhaseStartTime = new Date(g.nowTime.getTime())
        }else{
          // something is wrong
          console.log('g.stageLength: ' + g.stageLength)
        }
      }
        
      break
    }

    case g.ENDING_PHASE_DOWN_1: {
      // go down
      g.playerObj._position.y = -diffTime * g.endingGoDownSpeed
      g.endingCube._position.y = g.playerObj._position.y - g.cubeSize * 0.5
      if(diffTime > g.endingGoDownTime1){
        g.endingPhase = g.ENDING_PHASE_DOWN_2
        g.endingPhaseStartTime = new Date(g.nowTime.getTime())
      }
      break
    }

    case g.ENDING_PHASE_DOWN_2: {
      // go down
      g.playerObj._position.y = g.endingGoDownInitY - diffTime * g.endingGoDownSpeed
      g.endingCube._position.y = g.playerObj._position.y - g.cubeSize * 0.5
      if(!g.sceneChanging && diffTime > g.endingGoDownTime2){
        if(g.playerName.length === 0){
          // ask to enter player name
          IQSceneChanger.change(2.0, true, null, null, enterNameLoop, () => {
            removeAllObjects()

            g.endingPhase = g.ENDING_PHASE_NAME

            const nameBoxY = 50
            const keyboardY = 200
            g.nameEditor = new IQNameEditor(null, nameBoxY, null, keyboardY)
            g.nameEditor.setEndEditCallback(() => {
              if(g.playerName.length === 0){
                // beep: you must have name
                playSound(g.se_forbidden)
              }else{
                // save player's name to cookie
                g.cookieManager.setCookie(g.cookieOptionPlayer, g.playerName)
                IQSceneChanger.change(2.0, true, null, g.bgm_ending, endingLoop, startEndingStory)
              }
            })
            g.canvasField.addObject(g.nameEditor)
          })
        }else{
          // go to the next phase
          IQSceneChanger.change(2.0, true, null, g.bgm_ending, endingLoop, startEndingStory)
        }
      }
      break
    }

    case g.ENDING_PHASE_MIKU_STORY:
    case g.ENDING_PHASE_RIN_STORY:
    case g.ENDING_PHASE_LEN_STORY: {
      // rotate
      g.playerObj._position.x = g.endingStoryCharaX
      g.playerObj._position.y = g.endingStoryCharaY
      g.playerObj._position.z = 0
      g.playerObj._direction = Math.PI * (diffTime * g.endingStoryRotatingSpeed)

      if(!g.endingStoryVoicePlayed && diffTime > g.endingStoryTitleTime){
        g.endingStoryVoicePlayed = true
        g.endingStoryVoice.play()
      }

      // go to the next phase
      if(!g.sceneChanging && diffTime > g.endingStoryTime){
        IQSceneChanger.change(15.0, true, g.bgm_ending, g.bgm_staffroll, endingLoop, () => {
          removeAllObjects()
          setStaffRollText()
          g.canvasField.addObject(g.labelObj)
          g.endingPhase = g.ENDING_PHASE_STAFFROLL
          g.endingPhaseStartTime = new Date(g.nowTime.getTime())
        })
      }
      break
    }

    case g.ENDING_PHASE_STAFFROLL: {
      if(diffTime > g.endingStaffRollTime){
        if(!g.sceneChanging){
          if(g.getNewCharacter){
            // show a new character
            IQSceneChanger.change(2.0, true, g.bgm_staffroll, null, showNewCharacterLoop, setupNewCharacterFunctions)
          }else{
            IQSceneChanger.change(3.0, true, g.bgm_staffroll, g.bgm_menu, showMenuLoop, () => {
              removeAllObjects()
              g.canvasField.addObject(g.menu)
              g.menu.setMenu('top')
              g.camera.distance = 20.0
              g.menu.addTilesToCanvas()
              g.menu.initMenuParams()
              g.canvasField.addObject(g.menu._opTileObj, true)

              // set light
              g.light.setPosition(-50, 0, -100)
              g.light.setAmbient(0.6, 0.6, 0.6, 0.0)
              g.light.setDiffuse(0.7, 0.7, 0.7, 0.0)
              g.light.setSpecular(0.9, 0.9, 0.9, 0.0)
              g.renderer.setLight(g.light)

              subMenuReturn()
            })
          }
        }
      }
      break
    }

    default: {
      console.error('endingLoop: unknown ending phase: ' + g.endingPhase)
    }
  }
  
  breakLineProcess()

  g.keyListener.resetKeyNewState()
  resetTouchState()
}

function enterNameLoop(elapsedTime) {
  g.nowTime = new Date()
  g.elapsedTime = elapsedTime * 1000.0

  g.nameEditor.handleInput()

  g.keyListener.resetKeyNewState()
  resetTouchState()
}

function startEndingStory() {
  removeAllObjects()
            
  if(g.character === 'Miku'){
    g.endingPhase = g.ENDING_PHASE_MIKU_STORY
    g.canvasField.addObject(g.playerObj)
  }else if(g.character === 'Rin'){
    g.endingPhase = g.ENDING_PHASE_RIN_STORY
    g.canvasField.addObject(g.playerObj)
  }else if(g.character === 'Len'){
    g.endingPhase = g.ENDING_PHASE_LEN_STORY
    g.canvasField.addObject(g.playerObj)
  }
  g.canvasField.addObject(g.labelObj)
  g.endingPhaseStartTime = new Date(g.nowTime.getTime())
}

function setStaffRollText() {
  for(let i=0; i<g.endingStaffRollText.length; i++){
    const text = g.endingStaffRollText[i]
    if(text === '<PLAYER>'){
      g.endingStaffRollText[i] = g.playerName
    }else if(text === '<I.Q>'){
      g.endingStaffRollText[i] = g.iqPoint
    }else if(text === '<SCORE>'){
      g.endingStaffRollText[i] = g.score
    }
  }
}

function endingTweetLoop() {
  g.nowTime = new Date()

  if(!g.sceneChanging){
    if(g.keyListener.getKeyNewState(g.keyMark)){
      switch(g.menu._cursor){
        case 0: {
          // Tweet
          const url = g.shareURL
          const text = 'I.Q ' + g.iqPoint
          const href = 'http://twitter.com/share?url=' + escape(url)
                  + '&text=' + escape(text)
                  + '&hashtags=IQRevenge'
          window.location.href = href
          break
        }

        case 1: {
          // back to top
          const srcBGM = null
          IQSceneChanger.change(2.0, true, srcBGM, g.bgm_menu, showMenuLoop, () => {
            g.menu.setMenu('top')
            g.camera.distance = 20.0
            g.menu.addTilesToCanvas()
            g.menu.initMenuParams()
            g.canvasField.addObject(g.menu._opTileObj, true)

            // set first menu
            const cursor = 0
            g.menu._srcCursor = cursor
            g.menu._srcX = g.menu._opPosX[cursor]
            g.menu._srcY = g.menu._opPosY[cursor]
            g.menu._dstCursor = cursor
            g.menu._dstX = g.menu._opPosX[cursor]
            g.menu._dstY = g.menu._opPosY[cursor]
            g.menu._startTime = new Date(g.nowTime.getTime())
            g.menu._moving = true
            g.menu._cursor = cursor

            g.menu._opStayTiles.length = 0
            g.menu._opUpTiles.length = 0
            g.menu._opDownTiles.length = 0
            const srcTiles = g.menu.getMenuTiles(g.menu._srcCursor)
            srcTiles.forEach( (tile) => {
              g.menu._opUpTiles.push(tile)
            })

            // set light
            g.light.setPosition(-50, 0, -100)
            g.light.setAmbient(0.6, 0.6, 0.6, 0.0)
            g.light.setDiffuse(0.7, 0.7, 0.7, 0.0)
            g.light.setSpecular(0.9, 0.9, 0.9, 0.0)
            g.renderer.setLight(g.light)
          })
          break
        }

        default: {
          // nothing to do
        }
      }
    }

    const max = 2
    if(g.keyListener.getKeyNewState(g.keyUp)){
      g.menu._cursor = (g.menu._cursor + max - 1) % max
    }
    if(g.keyListener.getKeyNewState(g.keyDown)){
      g.menu._cursor = (g.menu._cursor + 1) % max
    }
  }

  g.keyListener.resetKeyNewState()
  resetTouchState()
}

function start() {
  g.canvasField.start()
}

function stop() {
  g.canvasField.pause()
}

/*
function resetGame() {
  stop()
  resetValues()
  .then(start)
}
*/

function resetTouchState() {
  g.controller.resetTouchNewState()
}

function resumeFromPause() {
  if(g.current_bgm){
    g.current_bgm.play()
  }
  g.canvasField.removeObject(g.menu)

  const pausedTime = (new Date()) - g.pauseStartTime

  g.addTimeToAllTimer(pausedTime)
  g.qCubeArray.forEach((cubeLine) => {
    cubeLine.forEach((cube) => {
      if(cube){
        cube.resume(pausedTime)
      }
    })
  })

  g.aCubeArray.forEach((cubeLine) => {
    cubeLine.forEach((cube) => {
      if(cube){
        cube.resume(pausedTime)
      }
    })
  })

  g.markerArray.forEach((marker) => {
    marker.resume(pausedTime)
  })

  g.plateMarkerArray.forEach((markerLine) => {
    markerLine.forEach((marker) => {
      if(marker){
        marker.resume(pausedTime)
      }
    })
  })

  g.effectArray.forEach((effect) => {
    effect.resume(pausedTime)
  })

  g.labelObj.resume(pausedTime)

  g.playerObj.setAnimating(true)
  g.pausing = false
}

function giveup() {
  g.canvasField.moveEnable = false
  g.current_bgm = null

  if(g.testPlay){
    quitTestPlay()
  }else if(g.playSharedStage){
    quitSharedStage()
  }else{
    IQSceneChanger.change(2.0, true, null, g.bgm_menu, showMenuLoop, () => {
      g.pausing = false

      g.canvasField.moveEnable = true
      removeAllObjects()
      g.canvasField.addObject(g.menu)
      g.menu.setMenu('top')
      g.camera.distance = 20.0
      g.menu.addTilesToCanvas()
      g.menu.initMenuParams()
      g.canvasField.addObject(g.menu._opTileObj, true)

      // set light
      g.light.setPosition(-50, 0, -100)
      g.light.setAmbient(0.6, 0.6, 0.6, 0.0)
      g.light.setDiffuse(0.7, 0.7, 0.7, 0.0)
      g.light.setSpecular(0.9, 0.9, 0.9, 0.0)
      g.renderer.setLight(g.light)

      subMenuReturn()
    }, true)
  }
}

function update(elapsedTime) {
  const speed = g.characterSpeed
  const force = g.playerObj._force
  force.x = force.y = force.z = 0
  let moving = false

  // set time
  g.elapsedTime = elapsedTime * 1000.0
  if(g.demoPlay){
    g.nowTime = new Date(g.demoStartTime.getTime() + g.demoGameTime)
  }else if(g.recording){
    g.recordElapsedTime += g.recordMspf
    g.nowTime = new Date(g.recorder.startTime.getTime() + g.recordElapsedTime)
  }else{
    g.nowTime = new Date()
  }

  if(!g.sceneChanging){
    if(g.recording){
      g.keyListener.freeze()
      g.recorder.addRecord()
    }

    if(g.keyListener.getKeyNewState(g.keyPause) || g.controller.getTouchNewState(g.controller.pauseButton)){
      if(g.pausing){
        // resume
        resumeFromPause()
      }else{
        // pause
        g.menu.setMenu('pause')
        g.canvasField.addObject(g.menu)
        g.pauseStartTime = new Date(g.nowTime.getTime())
        if(g.current_bgm){
          g.current_bgm.pause()
        }
        g.playerObj.setAnimating(false)
        g.qCubeArray.forEach((cubeLine) => {
          cubeLine.forEach((cube) => {
            if(cube){
              cube.pause()
            }
          })
        })
        g.aCubeArray.forEach((cubeLine) => {
          cubeLine.forEach((cube) => {
            if(cube){
              cube.pause()
            }
          })
        })
        g.markerArray.forEach((marker) => {
          marker.pause()
        })
        g.plateMarkerArray.forEach((markerLine) => {
          markerLine.forEach((marker) => {
            if(marker){
              marker.pause()
            }
          })
        })
        g.effectArray.forEach((effect) => {
          effect.pause()
        })
        g.labelObj.pause()

        g.pausing = true
      }
    }

    if(g.pausing){
      // give up menu handling
      if(!g.menu._moving){
        if(g.keyListener.getKeyNewState(g.keyUp) || g.keyListener.getKeyNewState(g.keyDown)){
          g.menu._moving = true
          g.menu._srcMenuItem = g.menu._subCursor
          g.menu._dstMenuItem = 1 - g.menu._subCursor
          g.menu._subCursor = g.menu._dstMenuItem
          g.menu._moveSubMenuTime = (new Date())
        }
      }

      if(!g.menu._moving){
        const touchedMenu = g.menu.getTouchedMenuNumber()
        if(g.keyListener.getKeyNewState(g.keyMark) || touchedMenu >= 0){
          let cursorPos = g.menu._subCursor
          if(touchedMenu >= 0){
            cursorPos = touchedMenu
          }

          switch(cursorPos){
            case 0: {
              // give up
              giveup()
              break
            }
            case 1: {
              // resume
              resumeFromPause()
              break
            }
            default: {
              // something is wrong
            }
          }
        }
      }
      g.keyListener.resetKeyNewState()
      resetTouchState()
      return
    }

    if(g.keyListener.getKeyState(g.keyUp)){
      force.z -= speed
      moving = true
    }else if(g.keyListener.getKeyState(g.keyDown)){
      force.z += speed
      moving = true
    }
    if(g.keyListener.getKeyState(g.keyLeft)){
      force.x -= speed
      moving = true
    }else if(g.keyListener.getKeyState(g.keyRight)){
      force.x += speed
      moving = true
    }

    const moveVector = g.controller.getMoveVector()
    if(moveVector){
      force.z += moveVector.y * speed
      force.x += moveVector.x * speed
      moving = true
    }


    if(g.keyListener.getKeyNewState(g.keyMark) || g.controller.getTouchNewState(g.controller.markerButton)){
      if(checkControllable()){
        setMarker()
      }
    }
    if(g.keyListener.getKeyNewState(g.keyAdvantage) || g.controller.getTouchNewState(g.controller.advantageButton)){
      useAdvantage()
    }
    if(g.keyListener.getKeyState(g.keySpeedUp) || g.controller.getTouchState(g.controller.speedUpButton)){
      g.speedUp = true
    }else{
      g.speedUp = false
    }

    if(g.stageClear && decisionKeyPushed()){
      const diffTime = g.getElapsedTime(g.clearTime)
      const clearWaitTime = g.clearRotateTime * 2 + g.clearLabelTime
      const moveMaxTime = clearWaitTime + g.clearLineMoveTime * g.stageLength

      if(clearWaitTime < diffTime && diffTime < moveMaxTime){
        g.clearTime.setMilliseconds(g.nowTime.getMilliseconds() - moveMaxTime)
      }
    }
  } // !g.sceneChanging

  createSubStageProcess()
  downProcess()
  blockRotate()
  markerRotate()
  fallProcess()
  deleteProcess()
  perfectProcess()
  breakLineProcess()
  gameOverProcess()
  checkClear()
  clearProcess()

  if(!checkControllable()){
    force.x = force.y = force.z = 0
  }else if(moving && g.playerObj._state !== 'running'){
    g.playerObj.setMotionWithBlending(g.running, 10)
    g.playerObj.animationTime = 0
    g.playerObj._state = 'running'
  }else if(!moving && g.playerObj._state !== 'standing'){
    g.playerObj.setMotionWithBlending(g.standing, 10)
    g.playerObj.animationTime = 0
    g.playerObj._state = 'standing'
  }
  g.keyListener.resetKeyNewState()
  resetTouchState()
}

function removeLoadingDiv() {
  // remove "loading" div
  const loadingDiv = document.getElementById('loading')
  loadingDiv.parentNode.removeChild(loadingDiv)
  g.loadingDivRemoved = true
}

function init() {
  initGameData()
  initCanvas()
  initModelAndMotion()
  initAudio()
  getStageFromCookie()
  loadBestIQ()
  loadCookieOption()
}

document.addEventListener('DOMContentLoaded', init, false)

document.addEventListener('mouseup', (event) => {
  console.log('mouseup: time: ' + g.rulesElapsedTime + ', pos: (' + event.clientX + ', ' + event.clientY + ')')
}, false)

/*
document.addEventListener('orientationchange', (event) => {
  window.scrollTo(0, 0)
}, false)
*/
