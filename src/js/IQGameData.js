'use strict'

import {
  Vector3
} from '../../modules/DH3DLibrary/src/js/main'

/**
 * _IQGameData class
 * @access public
 */
class _IQGameData {
  /**
   * constructor
   * @access public
   * @constructor
   */
  constructor() {
    /**
     * device type (isMobile, isTablet)
     * @type {Object}
     */
    this.device = this._getDeviceInfo()

    /**
     * Device type ('pc' or 'mb')
     * @type {string}
     */
    this.deviceType = (this.device.isMobile || this.device.isTable) ? 'mb' : 'pc'

    /**
     * controller (only) for mobile
     * @type {IQController}
     */
    this.controller = null

    /**
     * URL for sharing in Social Media
     * @type {string}
     */
    this.shareURL = 'http://darkhorse2.0spec.jp/dh3d/sample/iq/iq.php'

    /**
     * Title for sharing in Social Media
     * @type {string}
     */
    this.shareTitle = 'I.Q Revenge'

    /**
     * URL to send score
     * @type {string}
     */
    this.scoreSendURL = 'http://darkhorse2.0spec.jp/dh3d/sample/iq/sendScore.php'

    /**
     * URL to get score and ranking
     * @type {string}
     */
    this.scoreDataURL = 'http://darkhorse2.0spec.jp/dh3d/sample/iq/score.txt'

    /** 
     * Stage level of the game
     * @type {string} 
     */
    this.level = 'Normal'

    /** 
     * List of game levels
     * @type {Array<string>}
     */
    this.levelList = [
      'Easy',
      'Normal',
      'Hard',
      'Extreme'
    ]

    /** 
     * List of booleans which mean the player can play the level.
     * It associates to levelList
     * @type {Array<boolean>}
     */
    this.levelListEnable = [true, true, true, false]

    /**
     * 
     * @type {boolean}
     */
    this.showMarker = true

    /**
     * data for each level
     * levelName => params => value
     * params:
     *  - showMarker {boolean} = player can see the marker or not
     *  - rotateWaitTime {int} = time (msec) before cube rotates
     *  - rotateTime {int} = time (msec) which it takes to rotate cube
     *  - penaltyMax {int} = number of penalties to break stage block
     * @type {Map<string,Map<string,*>>}
     */
    this.levelData = new Map([
      ['Easy', new Map([
        ['showMarker', true],
        ['rotateWaitTime', 750],
        ['rotateTime', 1050],
        ['penaltyMax', 5]
      ])],
      ['Normal', new Map([
        ['showMarker', true],
        ['rotateWaitTime', 600],
        ['rotateTime', 900],
        ['penaltyMax', 4]
      ])],
      ['Hard', new Map([
        ['showMarker', false],
        ['rotateWaitTime', 450],
        ['rotateTime', 750],
        ['penaltyMax', 3]
      ])],
      ['Extreme', new Map([
        ['showMarker', false],
        ['rotateWaitTime', 400],
        ['rotateTime', 700],
        ['penaltyMax', 2]
      ])]
    ])

    /** 
     * character name which the player chose
     * @type {string}
     */
    this.character = 'Miku'

    /** 
     * List of character names
     * @type {Array<string>}
     */
    this.characterList = [
      'Miku',
      'Cyan',
      'Reimu'
    ]

    /** 
     * List of booleans which mean the player can choose the character or not
     * @type {Array<boolean>}
     */
    this.characterListEnable = [true, false, false]

    /** 
     * Character data
     * @type {Map<string, Map<string, *>>}
     */
    this.characterData = new Map([
      ['Miku', new Map([
        ['characterSpeed', 250]
      ])],
      ['Cyan', new Map([
        ['characterSpeed', 300]
      ])],
      ['Reimu', new Map([
        ['characterSpeed', 250]
      ])]
    ])

    /**
     * Sound volume (0.0 - 1.0) for inner use
     * @type {float}
     */
    this.soundVolume = 1.0
  
    /**
     * Sound volume value (0 - 100)
     * @type {int}
     */
    this.soundVolumeValue = 100

    /**
     * List of sound volume values for choice
     * set -1 to first and last elements as sentinels
     * @type {Array<int>}
     */
    this.soundVolumeList = [
      0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100
    ]

    /**
     * List of booleans which mean the player can choose value for volume or not
     * @type {Array<boolean>}
     */
    this.soundVolumeListEnable = [
      true, true, true, true, true, true, true, true, true, true, true
    ]

    /**
     * Language which the player uses
     * @type {string}
     */
    this.language = 'ja'

    /**
     * List of languages which the player can choose
     * @type {Array<string>}
     */
    this.languageList = [
      'ja', 'en'
    ]
    
    /**
     * Language name list to show on the screen
     * @type {Map<string, string>}
     */
    this.languageNameList = new Map([
      ['ja', '日本語'],
      ['en', 'English']
    ])

    /**
     * List of booleans which mean the player can choose the language or not
     * @type {Array<boolean>}
     */
    this.languageListEnable = [true, true]
  
    // key config
    this.keyUp = 'I'
    this.keyDown = 'K'
    this.keyLeft = 'J'
    this.keyRight = 'L'
    this.keyMark = 'Z'
    this.keyAdvantage = 'X'
    this.keySpeedUp = 'C'
    this.keyPause = 'Esc'

    // best score
    this.scoreDataURL = './data/score.txt'
    this.worldDailyBest = 0
    this.worldWeeklyBest = 0
    this.personalDailyBest = 0
    this.personalWeeklyBest = 0

    // rules
    this.rulesAudioDataURLPrefix = './data/rules_audio_'
    this.rulesAudioDirectory = './snd/rules'
    this.rulesMoveDataURLPrefix = './data/rules_move_'
    this.rulesMoveData = null
    this.rulesStartTime = null
    this.rulesPrevTime = 0

    this.rulesDataIndex = -1
    this.rulesDataArray = []
    this.rulesCurrentAudio = null
    this.rulesCurrentPause = null
    this.rulesElapsedTime = 0
    this.rulesTextFadeTime = 300
    this.rulesSpotLightRadius = 60

    this.rulesSettingBackup = {}

    // edit
    this.stageSizeValues = [
      [4, 2], [4, 3], [4, 4], [4, 5],
      [5, 5], [5, 6], [5, 7], [5, 8],
      [6, 6], [6, 7], [6, 8], [6, 9],
      [7, 7], [7, 8], [7, 9], [7, 10],
      [8, 9], [8, 10], [9, 10]
    ] 
    this.stageSizeMaxWidth = 9
    this.stageSizeMaxLength = 10

    this.stageSizeList = []
    this.stageSizeListEnable = []
    for(let i=0; i<this.stageSizeValues.length; i++){
      const stageSize = this.stageSizeValues[i]
      this.stageSizeList[i] = `${stageSize[0]}x${stageSize[1]}`
      this.stageSizeListEnable[i] = true
    }

    const minStageStep = 1
    const maxStageStep = 40
    const stepIndices = maxStageStep - minStageStep + 1
    this.stageStepList = []
    this.stageStepListEnable = []
    for(let i=0; i<stepIndices; i++){
      this.stageStepList[i] = i + minStageStep
      this.stageStepListEnable[i] = true
    }

    this.editStageSize = this.stageSizeList[0]
    this.editStageStep = this.stageStepList[0]
    this.editStageData = []
    for(let ex=0; ex<this.stageSizeMaxWidth; ex++){
      this.editStageData[ex] = []
      for(let ey=0; ey<this.stageSizeMaxLength; ey++){
        this.editStageData[ex][ey] = 'n'
      }
    }

    // recording
    this.recording = false
    this.recorder = null
    this.recordMspf = Math.floor(1000 / 60)
    this.recordElapsedTime = 0
    this.demoPlay = false
    this.demoStartTime = null
    this.demoGameTime = 0
    this.demoIndex = 0
    this.demoRecord = null

    // loading
    this.loading = false
    this.loadStartTime = null
    this.loadingTimer = null

    // canvas params
    this.canvasWidth = 640
    this.canvasHeight = 360
    this.canvasField = null
    this.camera = null
    this.renderer = null
    this.animator = null
    this.keyListener = null

    // menu
    this.menu = null
    this.menuNext = false
    this.menuMoveTime = 200
    this.menuFoldingTime = 500
    this.menuRotationTime = 500
    this.menuRotationSpeed = 3.0
    this.menuCubeMoveTime = 500
    this.menuCubeExpandingTime = 500
    this.showSubMenuTimeMax = 500
    this.stageCreateWait = 1000
    this.menuPlayerObj = null

    const buffer = 100
    const buttonWidth = 80
    this.menuButtonWidth = buttonWidth + buffer
    this.menuButtonHeight = this.canvasHeight + buttonWidth * 2
    this.menuLeftButtonY = -buffer
    this.menuLeftButtonX = -buffer
    this.menuRightButtonY = -buffer
    this.menuRightButtonX = this.canvasWidth - buttonWidth
    this.menuButtonColor = 'rgba(0, 0, 0, 0.7)'

    // model
    this.model_miku = null
    this.model_cyan = null
    this.model_reimu = null

    // motion
    this.standing = null
    this.running = null
    this.rolling = null
    this.down = null
    this.standup = null
    this.falling = null

    // bgm
    this.support_mp3 = false
    this.support_ogg = false
    this.snd_ext = ''
    this.play_audio = false
    this.bgm_stage = null
    this.bgm_menu = null
    this.bgm_stagecall = null
    this.bgm_fanfare = null
    this.bgm_gameover = null
    this.bgm_edit = null

    this.current_bgm = null

    // bgm file
    this.bgm_directory = './snd'
    this.bgm_menu_file = 'menu'
    this.bgm_stagecall_file = 'stagecall'
    this.bgm_gameover_file = 'gameover'
    this.bgm_fanfare_file = 'fanfare'
    this.bgm_stage1_file = 'stage1'
    this.bgm_stage2_file = 'stage2'
    this.bgm_stage3_file = 'stage3'
    this.bgm_stage4_file = 'stage4'
    this.bgm_stage5_file = 'stage5'
    this.bgm_stage6_file = 'stage6'
    this.bgm_stage7_file = 'stage7'
    this.bgm_stage8_file = 'stage8'
    this.bgm_stage9_file = 'stage9'
    this.bgm_stageE_file = 'stage3'
    this.bgm_edit_file = 'edit'

    // sound
    this.se_select = null
    this.se_decision = null
    this.se_substage = null
    this.se_mark = null
    this.se_markon = null
    this.se_erase = null
    this.se_forbidden = null
    this.se_break = null
    this.se_roll = null
    this.se_fall = null
    this.se_count = null
    this.se_bonus = null
    this.se_stagecall_1 = null
    this.se_stagecall_2 = null
    this.se_stagecall_3 = null
    this.se_stagecall_4 = null
    this.se_stagecall_5 = null
    this.se_stagecall_6 = null
    this.se_stagecall_7 = null
    this.se_stagecall_8 = null
    this.se_stagecall_9 = null
    this.se_excellent = null
    this.se_perfect = null
    this.se_great = null
    this.se_again = null
    this.se_step = null
    this.se_lifted = null
    this.se_stamped = null
    this.se_scream = null

    // sound file
    this.se_directory = './snd'
    this.se_rules_directory = './snd/rules'
    this.se_select_file = 'select'
    this.se_decision_file = 'decision'
    this.se_substage_file = 'substage'
    this.se_mark_file = 'mark'
    this.se_markon_file = 'markon'
    this.se_erase_file = 'erase'
    this.se_forbidden_file = 'forbidden'
    this.se_break_file = 'break'
    this.se_roll_file = 'roll'
    this.se_fall_file = 'fall'
    this.se_count_file = 'roll'
    this.se_bonus_file = 'bonus'
    // Alex
    this.se_stagecall_1_file = 'stagecall_1'
    this.se_stagecall_2_file = 'stagecall_2'
    this.se_stagecall_3_file = 'stagecall_3'
    this.se_stagecall_4_file = 'stagecall_4'
    this.se_stagecall_5_file = 'stagecall_5'
    this.se_stagecall_6_file = 'stagecall_6'
    this.se_stagecall_7_file = 'stagecall_7'
    this.se_stagecall_8_file = 'stagecall_8'
    this.se_stagecall_9_file = 'stagecall_9'
    this.se_excellent_file = 'excellent'
    this.se_perfect_file = 'perfect'
    this.se_great_file = 'great'
    this.se_again_file = 'again'
    // miku
    this.se_miku_step_file = 'step'
    this.se_miku_lifted_file = 'stamped'
    this.se_miku_stamped_file = 'stamped'
    this.se_miku_scream_file = 'scream'

    // sound play timing
    this.se_step_timing_1 = 0
    this.se_step_timing_2 = 0

    this.se_miku_step_timing_1 = 0.1
    this.se_miku_step_timing_2 = 0.5

    // character params
    this.characterSpeed = 0

    // game object
    this.playerObj = null
    this.labelObj = null
    this.stageObj = null
    this.stageLines = null

    // stage area
    this.minX = 0
    this.maxX = 0
    this.minZ = 0
    this.moveMinZ = 0
    this.maxZ = 0

    // time
    this.elapsedTime = 0
    this.nowTime = null

    this.rotateElapsedTime = 0
    this.pauseStartTime = null
    this.stageCreateStartTime = null
    this.downStartTime = null
    this.gameOverTime = null
    this.gameOverFadeOutStartTime = null
    this.continueFadeInStartTime = null
    this.againTime = null
    this.perfectTime = null
    this.clearTime = null
    this.endingStartTime = null

    this.stageCreateDelay = 300
    this.stageCreateBlockMoveTime = 1000
    this.downWaitTime = 1000
    this.standupWaitTime = 600
    this.defaultWaitTime = 800
    //this.deletedWaitTime = 400
    this.deletedWaitTime = 800
    this.rotateWaitTime = 500
    this.afterDeleteAdditionalWaitTime = 800
    this.rotateTime = 800
    //this.markerRemainTime = 500
    this.markerRemainTime = 1000
    this.checkMissTiming = 0.8
    this.perfectStringTime = 1000
    this.perfectWaitTime = 1000
    this.perfectRotateTime = 1000
    this.perfectAddLineTime = 500
    this.perfectAddLineZ = 300
    this.againRotateTime = 1000
    this.againWaitTime = 1000
    this.gameOverTime1 = 1000
    this.gameOverTime2 = 2000
    this.gameOverTime3 = 4000
    this.gameOverRotateTime = 1000
    this.gameOverWaitTime = 1500
    this.gameOverIQTime1 = 2000
    this.gameOverIQTime2 = 1000
    this.gameOverFadeOutTime = 1000
    this.clearRotateTime = 1000
    this.clearLabelTime = 500
    this.clearLineMoveTime = 400
    this.clearLineWaitTime = 2000
    this.endingWaitTime =        1000
    this.endingScoreRotateTime = 1000
    this.endingScoreWaitTime =   1500
    this.endingIQTime1 =         2000
    this.endingIQTime2 =         1000
    this.endingTotalTime =       7500

    // camera params
    this.cameraNear = 10
    this.cameraFar = 1000
    this.cameraXAngle = 0
    this.cameraYAngle = 0
    this.cameraTargetX = 0
    this.cameraTargetY = 0
    this.cameraTargetZ = 0

    this.cameraXAngleMax = 0.5
    this.cameraYAngleMax = 0.5

    this.cameraXAngleGoal = 0
    this.cameraYAngleGoal = 0
    this.cameraTargetXGoal = 0
    this.cameraTargetYGoal = 0
    this.cameraTargetZGoal = 0

    // game params
    this.stage = 0
    this.stageMax = 0
    this.stageName = ''
    this.subStage = 0
    this.subStageMax = 0
    this.subSubStage = 0
    this.subSubStageMax = 0
    this.baseStep = 0
    this.step = 0
    this.penaltyMax = 0
    this.penaltyQueue = 0
    this.penalty = 0
    this.stageHeight = 0
    this.stageWidth = 0
    this.stageLength = 0
    this.questionLength = 4
    this.questionNo = 0
    this.score = 0
    this.iqPoint = 0
    this.perfectCount = 0

    this.breakTopCubeX = 0
    this.clearPlayerZ = 0
    this.clearPlayerBlockZ = 0
    this.clearScore = 0
    this.bonusScore = 0
    this.oldBlockNo = 0

    // question data
    this.stageDataFile = './question/stage_data.txt'
    this.stageFiles = null
    this.numQuestions = 0
    this.questionArray = null
    this.questionUsed = null

    // rule
    this.rulePlay = false
    this.rulePause = false
    this.ruleQuitting = false
    this.ruleNumber = 0
    this.rulePlayQuestionNo = 0
    this.ruleStageDataFile1 = './question/rule_stage1.txt'
    this.ruleStageDataFile2 = './question/rule_stage2.txt'
    
    // edit
    this.editStart = false
    this.editing = false
    this.testPlay = false

    // game state
    this.loadingDivRemoved = false
    this.sceneChanging = false
    this.stageStarting = false
    this.stageCreating = false
    this.activated = false
    this.rotating = false
    this.breaking = false
    this.deleting = false
    this.blockDeleted = false
    this.again = false
    this.gameOver = false
    this.gameOverFlag = false
    this.gameOverFadeOut = false
    this.stageClear = false
    this.stageClearSceneChange = false
    this.ending = false
    this.pausing = false

    this.perfect = false
    this.addingLine = false
    this.perfectString = ''

    this.markerOn = false
    this.activeMarker = null

    this.stepCounting = false
    this.missed = false

    this.speedUp = false
    this.speedUpByMiss = false
    this.speedUpRate = 10

    // point
    this.pointNormal =      100
    this.pointAdvantage =   200
    this.pointExcellent = 15000
    this.pointPerfect =   10000
    this.pointGreat =      2000
    this.pointBonus =      1000

    // message
    this.messageExcellent = 'EXCELLENT!'
    this.messagePerfect =   'PERFECT!'
    this.messageGreat =     'GREAT!'
    this.messageClear =     'CLEAR'
    this.messageBonus =     'STAGE BONUS'
    this.leftMessageExcellent = 'TRUE GENIUS!!'
    this.leftMessagePerfect =   'PERFECT!'
    this.leftMessageGreat =     'GREAT!'
    this.leftMessageExcellentPoint = '15000 Point!'
    this.leftMessagePerfectPoint =   '10000 Point!'
    this.leftMessageGreatPoint =     '2000 Point'
    this.leftMessagePerfectCount =   'total perfect '
    this.leftMessageAdvantageCount = ' Hits'
    this.leftMessageAdvantagePoint = ' Points'

    // color
    this.blueColor =  '#4060FF'
    this.redColor =   '#F07070'
    this.whiteColor = '#FFFFFF'
    this.blackColor = '#000000'
    this.grayColor =  '#606060'
    this.transparent = 'rgba(0, 0, 0, 0)'

    // font
    this.fontFamily = 'Expressway,sans-serif'

    // game data
    this.markerArray = null
    this.plateMarkerArray = null
    this.plateCubeArray = null
    this.effectArray = null

    // object array
    this.qCubeArray = null // question Cube
    this.aCubeArray = null // active Cube
    this.aCubeZ = 0
    this.fallCubeArray = null
    this.deleteCubeArray = null
    this.breakCubeArray = null
    this.addCubeArray = null

    this.movableArea = null

    // rotate axis
    this.xaxis = new Vector3(1.0, 0.0, 0.0)
    this.yaxis = new Vector3(0.0, 1.0, 0.0)
    this.zaxis = new Vector3(0.0, 0.0, 1.0)

    // cube data
    this.cubeSize = 25
    this.cubeEpsilon = 0.1

    // marker data
    this.markerSize = 10

    // cookie
    this.cookieManager = null
    this.cookieSaveDays = 35
    this.cookieScore = 'IQ'
    this.cookieOptionLevel = 'IQLv'
    this.cookieOptionCharacter = 'IQChar'
    this.cookieOptionSoundVolume = 'IQSndVol'
    this.cookieOptionLanguage = 'IQLang'
    this.cookieOptionKeyUp = 'IQKUp'
    this.cookieOptionKeyDown = 'IQKDown'
    this.cookieOptionKeyLeft = 'IQKLeft'
    this.cookieOptionKeyRight = 'IQKRight'
    this.cookieOptionKeyMark = 'IQKMark'
    this.cookieOptionKeyAdvantage = 'IQKAdv'
    this.cookieOptionKeySpeedUp = 'IQKSpeed'

  }

  /**
   * get device info from user agent
   * @access private
   * @returns {Object} - device isMobile/isTablet
   */
  _getDeviceInfo() {
    const u = window.navigator.userAgent.toLowerCase()

    return {
      isTablet: (
        (u.indexOf("windows") != -1 && u.indexOf("touch") != -1 && u.indexOf("tablet pc") == -1) 
        || u.indexOf("ipad") != -1
        || (u.indexOf("android") != -1 && u.indexOf("mobile") == -1)
        || (u.indexOf("firefox") != -1 && u.indexOf("tablet") != -1)
        || u.indexOf("kindle") != -1
        || u.indexOf("silk") != -1
        || u.indexOf("playbook") != -1
      ),
      isMobile: (
        (u.indexOf("windows") != -1 && u.indexOf("phone") != -1)
        || u.indexOf("iphone") != -1
        || u.indexOf("ipod") != -1
        || (u.indexOf("android") != -1 && u.indexOf("mobile") != -1)
        || (u.indexOf("firefox") != -1 && u.indexOf("mobile") != -1)
        || u.indexOf("blackberry") != -1
      )
    }
  }

  /**
   * get elapsed time from given time
   * @access public
   * @param {Date} time - Date object to compare time difference
   * @param {boolean} ignorePause - 
   * @returns {int} - elapsed time from given time (ms)
   */
  getElapsedTime(time, ignorePause = false) {
    if(this.pausing && !ignorePause){
      return this.pauseStartTime - time
    }

    return this.nowTime - time
  }

  /**
   * get elapsed time from given time
   * @access public
   * @param {Date} time - Date object to compare time difference
   * @returns {int} - elapsed time from given time (ms)
   */
  getElapsedRealTime(time) {
    return (new Date()) - time
  }

  /**
   * add time to all timer for pause
   * @access public
   * @param {int} time - 
   * @returns {void}
   */
  addTimeToAllTimer(time) {
    [
      this.pauseStartTime,
      this.stageCreateStartTime,
      this.downStartTime,
      this.gameOverTime,
      this.gameOverFadeOutStartTime,
      this.continueFadeInStartTime,
      this.againTime,
      this.perfectTime,
      this.clearTime,
      this.endingStartTime
    ].forEach((timer) => {
      if(timer){
        timer.setMilliseconds(timer.getMilliseconds() + time)
      }
    })
  }
}

// singleton
const IQGameData = new _IQGameData()
export default IQGameData

