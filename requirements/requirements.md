# Product Requirement Document (PRD) - Flappy Chicken

## 1. Overview
Flappy Chicken is a browser-based game inspired by Flappy Bird, implemented using Next.js. The player controls a chicken that must navigate through gaps between obstacles by tapping or clicking to keep it airborne.

## 2. Goals & Objectives
- Provide a simple yet engaging game experience.
- Ensure smooth animations and responsive gameplay.
- Make the game mobile-friendly and optimized for performance.
- Implement a leaderboard to track high scores.

## 3. Tech Stack
- **Frontend:** Next.js (React, Tailwind CSS)
- **Game Logic:** JavaScript (Canvas API / HTML5)
- **Backend (if needed):** Supabase (for high scores)

## 4. Game Mechanics
### 4.1 Controls
- **Tap / Click / Spacebar**: Makes the chicken flap upwards.
- **Gravity**: The chicken falls if not flapping.

### 4.2 Obstacles
- Pipes appear at random heights and move from right to left.
- The player must navigate through the gaps between the pipes.

### 4.3 Scoring System
- +1 point for each pipe gap successfully passed.
- Display the current and best score.
- Store high scores in Supabase (optional).

### 4.4 Collision Handling
- The game ends if the chicken hits a pipe or the ground.

## 5. UI/UX Design
### 5.1 Main Screens
- **Start Screen**: "Tap to Start" message.
- **Game Screen**: Chicken, pipes, score display.
- **Game Over Screen**: Score, restart button.

### 5.2 Visual Style
- Minimalist, cartoonish chicken character.
- Bright colors, simple backgrounds.
- Smooth animations for flapping and movement.

## 6. Development Plan
### 6.1 Phase 1: Core Mechanics
- Render the chicken and apply gravity.
- Implement flapping mechanics.
- Generate and move pipes.
- Implement collision detection.

### 6.2 Phase 2: UI & Game Flow
- Create start, game, and game-over screens.
- Implement scoring system.
- Add animations and sound effects.

### 6.3 Phase 3: Enhancements
- Add a high-score leaderboard.
- Optimize performance and mobile responsiveness.
- Add sound effects for flapping and collisions.

## 7. Deliverables
- Fully functional Next.js web app.
- Hosted version (Vercel/Supabase integration).
- Source code repository with documentation.

## 9. Success Metrics
- Smooth gameplay experience.
- Mobile responsiveness.
- Engagement (time spent playing, high-score submissions).

