// Constants
export const GRAVITY = 0.3         // Reduced gravity for slower falling
export const PIPE_SPEED = 1.5      // Slower pipe movement
export const PIPE_WIDTH = 120        // Increased from 50 to 80
export const MIN_PIPE_GAP = 185    // Minimum gap between pipes
export const MAX_PIPE_GAP = 220    // Maximum gap between pipes
export const BIRD_RADIUS = 33
export const HORIZONTAL_PIPE_DISTANCE = 300  // More space between pipes
export const JUMP_STRENGTH = -8    // Reduced jump strength for better control
export const TERMINAL_VELOCITY = 4  // Lower terminal velocity for slower falling

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
}

// Animation constants
const BIRD_SIZE = 80

// Initialize empty arrays/objects for images
let birdImages: HTMLImageElement[] = []
let pipeImages: { top: HTMLImageElement; bottom: HTMLImageElement } = {
  top: {} as HTMLImageElement,
  bottom: {} as HTMLImageElement
}

// Initialize images only in browser context
if (typeof window !== 'undefined') {
  // Initialize bird images
  birdImages = [
    new window.Image(),
    new window.Image(),
    new window.Image()
  ]

  birdImages[0].src = '/3d_chicken_1.svg'  // Wings down
  birdImages[1].src = '/3d_chicken_2.svg'  // Wings middle
  birdImages[2].src = '/3d_chicken_2.svg'  // Wings up

  // Initialize pipe images
  pipeImages = {
    top: new window.Image(),
    bottom: new window.Image()
  }

  pipeImages.top.src = '/pipe.svg'
  pipeImages.bottom.src = '/pipe.svg'
}

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
    currentBirdFrame: 0  // Start with wings down
  }
}

// Add animation timing constants
const FRAMES_PER_FLAP = 3  // How many game frames to show each bird frame
let frameCount = 0

export const updateGame = (state: GameState, width: number, height: number): GameState => {
  if (!state.gameStarted || state.gameOver) {
    return state
  }

  // Update frame count and bird frame
  frameCount++
  let currentBirdFrame = state.currentBirdFrame
  
  // If bird is moving upward (negative velocity), cycle through frames
  if (state.bird.velocity < 0) {
    currentBirdFrame = Math.floor(frameCount / FRAMES_PER_FLAP) % 3
  } else {
    // If falling, use wings down position
    currentBirdFrame = 0
  }

  const { bird, pipes, score } = state

  // Update bird velocity and position with slower physics
  const newVelocity = Math.min(bird.velocity + GRAVITY, TERMINAL_VELOCITY)
  const updatedBird = {
    ...bird,
    y: bird.y + newVelocity,
    velocity: newVelocity
  }

  // Update pipes position
  const updatedPipes = pipes
    .map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED }))
    .filter(pipe => pipe.x + PIPE_WIDTH > -50)

  // Generate new pipe when needed
  if (pipes[pipes.length - 1].x <= width - HORIZONTAL_PIPE_DISTANCE) {
    updatedPipes.push(generatePipe(width, height))
  }

  // Update score when passing pipes
  const newScore = pipes[0].x + PIPE_WIDTH < bird.x ? score + 1 : score

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
  // Check screen boundaries
  if (bird.y - BIRD_RADIUS <= 0 || bird.y + BIRD_RADIUS >= height) {
    return true
  }

  // Check pipe collisions
  return pipes.some(pipe => 
    bird.x + BIRD_RADIUS > pipe.x &&
    bird.x - BIRD_RADIUS < pipe.x + PIPE_WIDTH &&
    (bird.y - BIRD_RADIUS < pipe.topHeight || bird.y + BIRD_RADIUS > pipe.bottomY)
  )
}

export const handleJump = (state: GameState) => {
  if (!state.gameOver) {
    state.bird.velocity = JUMP_STRENGTH
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
  ctx.font = "bold 48px Arial"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(text, ctx.canvas.width / 2, y + boxHeight/2)
}

export const drawGame = (ctx: CanvasRenderingContext2D, state: GameState) => {
  const { bird, pipes, score, gameStarted, gameOver } = state

  // Clear canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  // Draw patterned background
  const pattern = document.createElement('img')
  pattern.src = '/background.png'
  const bg = ctx.createPattern(pattern, 'repeat')
  if (bg) {
    ctx.save()  // Save current context state
    ctx.scale(0.5, 0.5)  // Scale down to 50%
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, ctx.canvas.width * 2, ctx.canvas.height * 2)  // Compensate for scale
    ctx.restore()  // Restore context state
  } else {
    // Fallback color if pattern fails to load
    ctx.fillStyle = "#FFF5EA"
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  }

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