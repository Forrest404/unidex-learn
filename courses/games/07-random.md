# Random walls

Every wall in Hop is the same height, so once you know the jump, you know the game. Some chance makes it more fun.

`math.random(a, b)` gives a whole number from `a` to `b`, different each time. Each time you tap B here, the box jumps somewhere new:

```lua
local boxX = 0
local boxY = 0

function start(seed)
  math.randomseed(seed)
  boxX = math.random(0, 180)
  boxY = math.random(30, 180)
end

function step(tapped, held)
  if tapped then
    boxX = math.random(0, 180)
    boxY = math.random(30, 180)
    return "moved"
  end
  return "still"
end

function draw()
  unidex.fill(boxX, boxY, 20, 20)
end

function score() return 0 end
```

The numbers aren't truly random. They come from a long list worked out from a starting number, the **seed**. `math.randomseed(seed)` starts the list from the seed the unidex gives `start`, which is different every round, so every round is different.

But give it the same seed and you get the same round, every time. That's how **Check** tests a game: it plays a round with a seed it picked, then plays it again and expects the same thing to happen. So always use `math.randomseed(seed)` and `math.random` in a game, not `unidex.random`, which can't be replayed.

The example only returns `"moved"` when it moved the box. The rest of the time nothing changes, so it returns `"still"`.

## Your turn

Make each wall a random height, from 10 to 36:

1. At the start of `start`, add `math.randomseed(seed)`.
2. In `start`, and again where the wall comes back round, set `wallH` to `math.random(10, 36)`.

Short walls can be hopped with a tap. Tall ones need B held down.

```starter
local GROUND = 170   -- how far down the ground is
local x = 30         -- the player's left edge
local y = 0          -- how high the player is off the ground
local vy = 0         -- how fast it's going up (less than 0: coming down)
local wallX = 200    -- the wall's left edge
local wallH = 20     -- how tall the wall is
local speed = 4      -- how far the wall moves each frame
local points = 0

function start(seed)
  y = 0
  vy = 0
  wallX = 200
  speed = 4
  points = 0
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
  wallX = wallX - speed
  if wallX < -10 then
    wallX = 200
    points = points + 1
    if speed < 10 then
      speed = speed + 1
    end
  end

  -- did the player hit it?
  if wallX < x + 16 and wallX + 10 > x and y < wallH then
    return "over"
  end
  return "moved"
end

function draw()
  unidex.text(8, 20, "Hop")
  unidex.text(170, 20, tostring(points))
  unidex.fill(0, GROUND, 200, 2)
  unidex.fill(x, GROUND - 16 - y, 16, 16)
  unidex.fill(wallX, GROUND - wallH, 10, wallH)
end

function score()
  return points
end
```

```solution
local GROUND = 170   -- how far down the ground is
local x = 30         -- the player's left edge
local y = 0          -- how high the player is off the ground
local vy = 0         -- how fast it's going up (less than 0: coming down)
local wallX = 200    -- the wall's left edge
local wallH = 20     -- how tall the wall is
local speed = 4      -- how far the wall moves each frame
local points = 0

function start(seed)
  math.randomseed(seed)
  y = 0
  vy = 0
  wallX = 200
  wallH = math.random(10, 36)
  speed = 4
  points = 0
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
  wallX = wallX - speed
  if wallX < -10 then
    wallX = 200
    wallH = math.random(10, 36)
    points = points + 1
    if speed < 10 then
      speed = speed + 1
    end
  end

  -- did the player hit it?
  if wallX < x + 16 and wallX + 10 > x and y < wallH then
    return "over"
  end
  return "moved"
end

function draw()
  unidex.text(8, 20, "Hop")
  unidex.text(170, 20, tostring(points))
  unidex.fill(0, GROUND, 200, 2)
  unidex.fill(x, GROUND - 16 - y, 16, 16)
  unidex.fill(wallX, GROUND - wallH, 10, wallH)
end

function score()
  return points
end
```

```check
seed: 3
play: 0*35 1*10 0*20
remember
again
play: 0*35 1*10 0*20
same
seed: 4
again
play: 0*35 1*10 0*20
changed
```

```check
seed: 7
play: 0*20
box: 120 134-160 10 10-36
```
