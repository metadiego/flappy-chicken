# Sample Game Logic

```ts
const GRAVITY = 0.2
const PIPE_SPEED = 2
const PIPE_WIDTH = 50
const PIPE_GAP = 250
const BIRD_RADIUS = 15
const HORIZONTAL_PIPE_DISTANCE = 300 // New constant for horizontal separation
export const JUMP_STRENGTH = -4.5

export interface Bird {
  x: number
  y: number
  velocity: number
}

export interface Pipe {
  x: number
  topHeight: number
  bottomY: number
}

export interface GameState {
  bird: Bird
  pipes: Pipe[]
  score: number
  gameStarted: boolean
}

export function initGame(width: number, height: number): GameState {
  return {
    bird: { x: 50, y: height / 2, velocity: 0 },
    pipes: [generatePipe(width, height)],
    score: 0,
    gameStarted: false,
  }
}

export function updateGame(state: GameState, width: number, height: number): GameState {
  if (!state.gameStarted) {
    return state
  }

  const { bird, pipes, score } = state
  const updatedBird = {
    ...bird,
    y: bird.y + bird.velocity,
    velocity: bird.velocity + GRAVITY,
  }

  const updatedPipes = pipes
    .map((pipe) => ({ ...pipe, x: pipe.x - PIPE_SPEED }))
    .filter((pipe) => pipe.x + PIPE_WIDTH > 0)

  // Generate new pipe when the last pipe has moved HORIZONTAL_PIPE_DISTANCE pixels from the right edge
  if (pipes[pipes.length - 1].x <= width - HORIZONTAL_PIPE_DISTANCE) {
    updatedPipes.push(generatePipe(width, height))
  }

  const newScore = pipes[0].x + PIPE_WIDTH < bird.x ? score + 1 : score

  const collision = checkCollision(updatedBird, updatedPipes, height)

  return collision
    ? { ...initGame(width, height), gameStarted: false }
    : {
        bird: updatedBird,
        pipes: updatedPipes,
        score: newScore,
        gameStarted: true,
      }
}

export function drawGame(ctx: CanvasRenderingContext2D, state: GameState) {
  const { bird, pipes, score, gameStarted } = state

  // Clear canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  // Draw background
  ctx.fillStyle = "skyblue"
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  // Draw bird
  ctx.fillStyle = "yellow"
  ctx.beginPath()
  ctx.arc(bird.x, bird.y, BIRD_RADIUS, 0, Math.PI * 2)
  ctx.fill()

  // Draw pipes
  ctx.fillStyle = "green"
  pipes.forEach((pipe) => {
    ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight)
    ctx.fillRect(pipe.x, pipe.bottomY, PIPE_WIDTH, ctx.canvas.height - pipe.bottomY)
  })

  // Draw score
  ctx.fillStyle = "white"
  ctx.font = "24px Arial"
  ctx.fillText(`Score: ${score}`, 10, 30)

  // // Draw start message
  // if (!gameStarted) {
  //   ctx.fillStyle = "white"
  //   ctx.font = "20px Arial"
  //   ctx.textAlign = "center"
  //   ctx.fillText("Press Space to Start", ctx.canvas.width / 2, ctx.canvas.height / 2)
  // }
}

function generatePipe(width: number, height: number): Pipe {
  const minTopHeight = 50
  const maxTopHeight = height - PIPE_GAP - 50
  const topHeight = Math.random() * (maxTopHeight - minTopHeight) + minTopHeight
  return {
    x: width,
    topHeight,
    bottomY: topHeight + PIPE_GAP,
  }
}

function checkCollision(bird: Bird, pipes: Pipe[], height: number): boolean {
  return pipes.some(
    (pipe) =>
      (bird.x + BIRD_RADIUS > pipe.x &&
        bird.x - BIRD_RADIUS < pipe.x + PIPE_WIDTH &&
        (bird.y - BIRD_RADIUS < pipe.topHeight || bird.y + BIRD_RADIUS > pipe.bottomY)) ||
      bird.y + BIRD_RADIUS > height ||
      bird.y - BIRD_RADIUS < 0,
  )
}
```
