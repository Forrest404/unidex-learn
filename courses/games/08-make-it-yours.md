# Make it yours

You've made a whole game: it moves, jumps, ends, keeps score, speeds up, and is different every round. Now turn it into your own.

A few numbers change how it feels a lot:

- The jump: `vy = 9` is how hard it starts, and the 2 and 1 taken off `vy` are gravity.
- The walls: how fast they start, how fast they can get, and how tall they can be.
- `"frame_ms"` in `app.json`: how often `step` runs, in milliseconds. It's 100 if you leave it out, ten frames a second. A smaller number makes the whole game faster. It can be from 48 to 1000.

And a few things change how it looks: the player could be an outline with `unidex.rect`, have eyes, or be something else entirely.

Change the name too: the title in `draw`, and the `id`, `name` and `description` in `app.json`. The `id` is the folder's name, in lower case, with no spaces.

## Your turn

Make it your own game, with a new name. When it plays the way you want, press **Check**.

Then put it on your unidex:

1. Plug your unidex into the computer with its USB cable, and press one of its buttons to wake it.
2. Press **Install on my unidex** under your code, and pick it from the list. This needs Chrome or Edge on a computer.
3. On the unidex, open **Games**. Your game is after the four that come with it.

Games need the newest firmware. If your unidex says "needs newer firmware", update it from the [tools site](https://tools.unidex.shop) first.

On another browser, press **Download .zip** to keep a copy.

## Share it in the app store

If you'd like everyone with a unidex to be able to play it, send it to the [app store](https://github.com/Forrest404/unidex-apps). You'll need a free GitHub account.

1. Download your game as a .zip and unzip it. It's a folder named after its `id`.
2. On the [unidex-apps page](https://github.com/Forrest404/unidex-apps), press **Fork** to get your own copy.
3. In your copy, open the `apps` folder, choose **Add file**, then **Upload files**, and drop your folder in.
4. Press **Contribute**, then **Open pull request**.

Checks run on it automatically, and a person plays it. Once it's accepted, it shows up in the [tools site's app store](https://tools.unidex.shop/store.html) within a few hours. The [store's guide to games](https://github.com/Forrest404/unidex-apps/blob/main/GAMES.md) has the details.

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

```starter app.json
{
  "id": "hop",
  "name": "Hop",
  "version": "1.0.0",
  "author": "Your name",
  "description": "Jump over the walls.",
  "category": "games",
  "api": 4,
  "type": "game",
  "permissions": []
}
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
    vy = 10
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
  unidex.text(8, 20, "Leap")
  unidex.text(170, 20, tostring(points))
  unidex.fill(0, GROUND, 200, 2)
  unidex.rect(x, GROUND - 16 - y, 16, 16)
  unidex.fill(x + 4, GROUND - 12 - y, 8, 8)
  unidex.fill(wallX, GROUND - wallH, 10, wallH)
end

function score()
  return points
end
```

```solution app.json
{
  "id": "leap",
  "name": "Leap",
  "version": "1.0.0",
  "author": "Your name",
  "description": "Leap the walls. Tap B for a hop, hold it for a big jump.",
  "category": "games",
  "api": 4,
  "type": "game",
  "frame_ms": 80,
  "permissions": []
}
```

```check
hides: Hop
play: 0*20
playing
```
