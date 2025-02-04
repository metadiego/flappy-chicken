import { customFont } from '@/app/fonts'

// Base constants
const BASE_CONSTANTS = {
  MOBILE: {
    GRAVITY: 1.1,
    PIPE_SPEED: 3.1,
    JUMP_STRENGTH: -15
  },
  DESKTOP: {
    GRAVITY: 0.6,
    PIPE_SPEED: 2.2,
    JUMP_STRENGTH: -12
  }
}

// Other constants that don't change with device
export const PIPE_WIDTH = 120
export const MIN_PIPE_GAP = 200
export const MAX_PIPE_GAP = 240
export const BIRD_RADIUS = 30
export const HORIZONTAL_PIPE_DISTANCE = 400
export const TERMINAL_VELOCITY = 4

// Dynamic constants based on device
let GRAVITY: number
let PIPE_SPEED: number
let JUMP_STRENGTH: number

// Function to set constants based on device
const setDeviceConstants = () => {
  const isMobile = /Mobile|Android|iPhone/i.test(navigator.userAgent)
  const constants = isMobile ? BASE_CONSTANTS.MOBILE : BASE_CONSTANTS.DESKTOP
  
  GRAVITY = constants.GRAVITY
  PIPE_SPEED = constants.PIPE_SPEED
  JUMP_STRENGTH = constants.JUMP_STRENGTH
}

// Types
export interface Bird {
  x: number
  y: number
  velocity: number
}

export interface Pipe {
  x: number
  topHeight: number
  bottomY: number
  topFryType: 'top' | 'bottom'    // Which image to use for top fry
  bottomFryType: 'top' | 'bottom' // Which image to use for bottom fry
}

export interface GameState {
  bird: Bird
  pipes: Pipe[]
  score: number
  gameStarted: boolean
  gameOver: boolean
  currentBirdFrame: number  // 0 = down, 1 = middle, 2 = up
  analytics: {
    gameStartTime: Date
    jumpsCount: number
    obstaclesPassed: number
  }
}

// Animation constants
const BIRD_SIZE = 80

// Initialize empty arrays/objects for images
let birdImages: HTMLImageElement[] = []
const pipeImages: { top: HTMLImageElement; bottom: HTMLImageElement } = {
  top: {} as HTMLImageElement,
  bottom: {} as HTMLImageElement
}

// Optimize image loading and caching
const imageCache = new Map<string, HTMLImageElement>()

const loadImage = (src: string): Promise<HTMLImageElement> => {
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src)!)
  }

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      imageCache.set(src, img)
      resolve(img)
    }
    img.src = src
  })
}

// Initialize constants when game assets are loaded
export const initializeGameAssets = () => {
  if (typeof window === 'undefined') return

  // Set device-specific constants
  setDeviceConstants()

  return Promise.all([
    loadImage('/3d_chicken_1.svg'),
    loadImage('/3d_chicken_2.svg'),
    loadImage('/3d_chicken_2.svg'),
    loadImage('/pipe.svg'),
    loadImage('/background.png')
  ]).then(([bird1, bird2, bird3, pipe, bg]) => {
    birdImages = [bird1, bird2, bird3]
    pipeImages.top = pipe
    pipeImages.bottom = pipe
    imageCache.set('background', bg)
  })
}

// Export constants for use in other components
export const getGameConstants = () => ({
  GRAVITY,
  PIPE_SPEED,
  JUMP_STRENGTH,
  PIPE_WIDTH,
  MIN_PIPE_GAP,
  MAX_PIPE_GAP,
  BIRD_RADIUS,
  HORIZONTAL_PIPE_DISTANCE,
  TERMINAL_VELOCITY
})

export const initGame = (width: number, height: number): GameState => {
  return {
    bird: { 
      x: width * 0.2,
      y: height * 0.5,
      velocity: 0 
    },
    pipes: [generatePipe(width, height)],
    score: 0,
    gameStarted: false,
    gameOver: false,
    currentBirdFrame: 0,  // Start with wings down
    analytics: {
      gameStartTime: new Date(),
      jumpsCount: 0,
      obstaclesPassed: 0
    }
  }
}

// Add animation timing constants
const FRAMES_PER_FLAP = 3  // How many game frames to show each bird frame
let frameCount = 0

export const updateGame = (state: GameState, width: number, height: number): GameState => {
  if (!state.gameStarted || state.gameOver) {
    return state
  }

  // Get current constants
  const { GRAVITY, PIPE_SPEED, TERMINAL_VELOCITY } = getGameConstants()

  // Update frame count and bird frame more efficiently
  frameCount = (frameCount + 1) % (FRAMES_PER_FLAP * 3)
  const currentBirdFrame = state.bird.velocity < 0 
    ? Math.floor(frameCount / FRAMES_PER_FLAP)
    : 0

  // Update bird physics
  const newVelocity = Math.min(state.bird.velocity + GRAVITY, TERMINAL_VELOCITY)
  const updatedBird = {
    ...state.bird,
    y: state.bird.y + newVelocity,
    velocity: newVelocity
  }

  // More efficient pipe updates
  const updatedPipes = state.pipes
    .filter(pipe => pipe.x + PIPE_WIDTH > -50)
    .map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED }))

  // Only generate new pipe when needed
  if (updatedPipes.length < 3 && 
      updatedPipes[updatedPipes.length - 1].x <= width - HORIZONTAL_PIPE_DISTANCE) {
    updatedPipes.push(generatePipe(width, height))
  }

  // Update score when passing pipes
  const newScore = updatedPipes[0].x + PIPE_WIDTH < updatedBird.x ? state.score + 1 : state.score

  // Track obstacles passed when score increases
  if (updatedPipes[0].x + PIPE_WIDTH < updatedBird.x && newScore > state.score) {
    state.analytics.obstaclesPassed++
  }

  // Check for any collisions (both pipes and boundaries)
  const collision = checkCollision(updatedBird, updatedPipes, height)

  if (collision) {
    return { 
      ...state,
      gameOver: true,
      score: newScore,  // Preserve the final score
      bird: updatedBird,
      pipes: updatedPipes
    }
  }

  return {
    ...state,
    bird: updatedBird,
    pipes: updatedPipes,
    score: newScore,
    currentBirdFrame
  }
}

const generatePipe = (width: number, height: number): Pipe => {
  const minTopHeight = height * 0.2
  const maxTopHeight = height * 0.6
  const topHeight = Math.random() * (maxTopHeight - minTopHeight) + minTopHeight
  
  // Generate random gap between MIN_PIPE_GAP and MAX_PIPE_GAP
  const gap = Math.random() * (MAX_PIPE_GAP - MIN_PIPE_GAP) + MIN_PIPE_GAP
  
  return {
    x: width,
    topHeight,
    bottomY: topHeight + gap,
    topFryType: Math.random() < 0.5 ? 'top' : 'bottom',
    bottomFryType: Math.random() < 0.5 ? 'top' : 'bottom'
  }
}

const checkCollision = (bird: Bird, pipes: Pipe[], height: number): boolean => {
  // Quick boundary check first
  if (bird.y - BIRD_RADIUS <= 0 || bird.y + BIRD_RADIUS >= height) {
    return true
  }

  // Only check pipes that are near the bird
  const nearbyPipes = pipes.filter(pipe => 
    Math.abs(pipe.x - bird.x) < PIPE_WIDTH + BIRD_RADIUS
  )

  return nearbyPipes.some(pipe => 
    bird.x + BIRD_RADIUS > pipe.x &&
    bird.x - BIRD_RADIUS < pipe.x + PIPE_WIDTH &&
    (bird.y - BIRD_RADIUS < pipe.topHeight || bird.y + BIRD_RADIUS > pipe.bottomY)
  )
}

export const handleJump = (state: GameState) => {
  if (!state.gameOver) {
    const { JUMP_STRENGTH } = getGameConstants()
    state.bird.velocity = JUMP_STRENGTH
    state.analytics.jumpsCount++
  }
}

// Draw score with background box
const drawScore = (ctx: CanvasRenderingContext2D, score: number) => {
  const text = score.toString()
  const boxWidth = 100
  const boxHeight = 70

  // Position box at top center
  const x = ctx.canvas.width / 2 - boxWidth / 2
  const y = 20

  // Draw shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
  ctx.beginPath()
  ctx.roundRect(x + 4, y + 4, boxWidth, boxHeight, 10)
  ctx.fill()

  // Draw white box
  ctx.fillStyle = 'rgba(240, 240, 240, 1)'
  ctx.beginPath()
  ctx.roundRect(x, y, boxWidth, boxHeight, 10)
  ctx.fill()

  // Draw score text
  ctx.fillStyle = "#EB321A"
  ctx.font = `bold 30px ${customFont.style.fontFamily}, sans-serif`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(text, ctx.canvas.width / 2, y + boxHeight/2)
}

export const drawGame = (ctx: CanvasRenderingContext2D, state: GameState) => {
  // Clear only what's needed
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  // Draw background more efficiently
  const bgImage = imageCache.get('background')
  if (bgImage) {
    ctx.save()
    ctx.scale(0.5, 0.5)
    const pattern = ctx.createPattern(bgImage, 'repeat')
    if (pattern) {
      ctx.fillStyle = pattern
      ctx.fillRect(0, 0, ctx.canvas.width * 2, ctx.canvas.height * 2)
    }
    ctx.restore()
  }

  const { bird, pipes, score, gameStarted, gameOver } = state

  // Draw pipes 
  pipes.forEach(pipe => {
    // Draw top pipe (upside down)
    ctx.save()
    ctx.translate(pipe.x + PIPE_WIDTH/2, pipe.topHeight/2)
    ctx.rotate(Math.PI)  // Rotate 180 degrees
    ctx.drawImage(
      pipeImages.top,
      -PIPE_WIDTH/2,
      -pipe.topHeight/2,
      PIPE_WIDTH,    // Using wider width
      pipe.topHeight
    )
    ctx.restore()

    // Draw bottom pipe fry
    ctx.drawImage(
      pipeImages.bottom,
      pipe.x,
      pipe.bottomY,
      PIPE_WIDTH,    // Using wider width
      ctx.canvas.height - pipe.bottomY
    )
  })

  // Draw bird
  ctx.save()
  ctx.translate(bird.x, bird.y)
  
  // Reduce rotation amount by lowering the multiplier (from 0.2 to 0.1)
  // and tighten the min/max bounds (from -0.5/0.5 to -0.3/0.3)
  const rotation = Math.min(Math.max(bird.velocity * 0.1, -0.3), 0.3)
  ctx.rotate(rotation)

  // Draw the current bird frame
  ctx.drawImage(
    birdImages[state.currentBirdFrame],
    -BIRD_SIZE/2,
    -BIRD_SIZE/2,
    BIRD_SIZE,
    BIRD_SIZE
  )

  ctx.restore()

  // Replace old score drawing with new function
  drawScore(ctx, score)

  // Draw messages
  if (!gameStarted) {
    // drawCenteredText(ctx, "Press Space to Start", ctx.canvas.height / 2)
  } else if (gameOver) {
    // drawCenteredText(ctx, "Game Over!", ctx.canvas.height / 2 - 30)
    // drawCenteredText(ctx, `Score: ${score}`, ctx.canvas.height / 2 + 30)
    // drawCenteredText(ctx, "Press Space to Restart", ctx.canvas.height / 2 + 90)
  }
}