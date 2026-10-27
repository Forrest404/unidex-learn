# Hitting the wall

A round ends when `step` returns `"over"`. The unidex then asks `score()` for the score, and shows it on the game-over screen, with the best so far. It keeps the best score for you. B starts the next round.

Here's a game that ends. A ball falls, B bounces it up, and the round is over when it hits the floor:

```lua
local ballY = 0
local vy = 0

function start(seed)
  ballY = 40
  vy = 0
end

function step(tapped, held)
  if tapped then
    vy = -6
  end
  vy = vy + 1
  ballY = ballY + vy
  if ballY > 170 then
    return "over"
  end
  return "moved"
end

function draw()
  unidex.fill(0, 180, 200, 20)
  unidex.fill(95, ballY, 10, 10)
end

function score() return 0 end
```

Here `ballY` is a place on the screen, so it gets bigger going down, and bouncing up makes it smaller. The ball is 10 tall, so it touches the floor at 180 once `ballY` is more than 170.

## When two boxes touch

The player and the wall are both boxes. They overlap when they overlap across *and* up and down:

- across: the wall's left edge is left of the player's right edge (`wallX < x + 16`), and the wall's right edge is right of the player's left edge (`wallX + 10 > x`).
- up and down: the player isn't high enough to clear the wall (`y < wallH`).

## Your turn

At the end of `step`, before `return "moved"`, end the round when the player touches the wall:

```text
if wallX < x + 16 and wallX + 10 > x and y < wallH then
  return "over"
end
```

Then play it. A tap isn't quite enough for this wall. Hold B to jump over it.

```starter
local GROUND = 170   -- how far down the ground is
local x = 30         -- the player's left edge
local y = 0          -- how high the player is off the ground
local vy = 0         -- how fast it's going up (less than 0: coming down)
local wallX = 200    -- the wall's left edge
local wallH = 20     -- how tall the wall is

function start(seed)
  y = 0
  vy = 0
  wallX = 200
end

function step(tapped, held)
  -- the jump
  if tapped and y == 0 then
    vy = 9
  end
  y = y + vy
  if held then
    vy = vy - 1
  else
    vy = vy - 2
  end
  if y <= 0 then
    y = 0
    vy = 0
  end

  -- the wall
  wallX = wallX - 4
  if wallX < -10 then
    wallX = 200
  end
  return "moved"
end

function draw()
  unidex.text(8, 20, "Hop")
  unidex.fill(0, GROUND, 200, 2)
  unidex.fill(x, GROUND - 16 - y, 16, 16)
  unidex.fill(wallX, GROUND - wallH, 10, wallH)
end

function score()
  return 0
end
```

```solution
local GROUND = 170   -- how far down the ground is
local x = 30         -- the player's left edge
local y = 0          -- how high the player is off the ground
local vy = 0         -- how fast it's going up (less than 0: coming down)
local wallX = 200    -- the wall's left edge
local wallH = 20     -- how tall the wall is

function start(seed)
  y = 0
  vy = 0
  wallX = 200
end

function step(tapped, held)
  -- the jump
  if tapped and y == 0 then
    vy = 9
  end
  y = y + vy
  if held then
    vy = vy - 1
  else
    vy = vy - 2
  end
  if y <= 0 then
    y = 0
    vy = 0
  end

  -- the wall
  wallX = wallX - 4
  if wallX < -10 then
    wallX = 200
  end

  -- did the player hit it?
  if wallX < x + 16 and wallX + 10 > x and y < wallH then
    return "over"
  end
  return "moved"
end

function draw()
  unidex.text(8, 20, "Hop")
  unidex.fill(0, GROUND, 200, 2)
  unidex.fill(x, GROUND - 16 - y, 16, 16)
  unidex.fill(wallX, GROUND - wallH, 10, wallH)
end

function score()
  return 0
end
```

```check
play: 0*50
over
again
play: 0*5
playing
```

```check
play: 0*35 1*10 0*20
playing
```
