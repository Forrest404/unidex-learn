# Lists and screens

A **table** holds a list of things, one after another, in curly brackets:

```lua
local fruit = {"apple", "pear", "plum"}
local pick = 1

function draw()
  unidex.header("Fruit")
  unidex.centered(90, fruit[pick], "medium")
  unidex.centered(120, pick .. " of " .. #fruit)
  unidex.hints("", "next", "")
end

function onB()
  pick = pick % #fruit + 1
  return "partial"
end
```

- `fruit[1]` is the first thing in the list, `fruit[2]` the second, and so on.
- `#fruit` is how many things are in it.
- `pick % #fruit + 1` counts 1, 2, 3, then back to 1. `%` is what's left over after dividing.

Apps often have more than one screen. Keep which one is showing in a variable, and have `draw` and the buttons check it. Holding A runs `onBack`: return `"exit"` to leave the app, or change the screen and return `"partial"` to stay.

## Your turn

Give your app an options screen where you choose your goal from a list:

- a table `GOALS` with `6`, `8` and `10` in it, and a variable `pick` saying which one is chosen (start at `2`, which is 8)
- **holding B** opens the options screen, titled `Options`, showing `Goal: 8`. This takes over from reset.
- on the options screen, **A** moves to the next goal and **B** sets the count back to 0 and goes back
- **holding A** on the options screen goes back to the count
- save `pick` too, so the goal survives sleep

The hints on the count screen become `less`, `add` and `options`.

```starter
local glasses = tonumber(unidex.data.read("glasses") or "") or 0
local goal = 8

local function save()
  unidex.data.write("glasses", tostring(glasses))
end

local function message()
  if glasses >= goal then
    return "Goal reached!"
  else
    return "Keep going"
  end
end

local function drawBar()
  local size = math.floor(184 / goal)
  for i = 1, goal do
    local x = 8 + (i - 1) * size
    if i <= glasses then
      unidex.fill(x, 136, size - 4, 16)
    else
      unidex.rect(x, 136, size - 4, 16)
    end
  end
end

function draw()
  unidex.header("Water")
  unidex.centered(52, message())
  unidex.centered(100, tostring(glasses), "large")
  unidex.centered(125, "of " .. goal .. " glasses today")
  drawBar()
  unidex.hints("less", "add", "reset")
end

function status()
  return glasses .. " of " .. goal
end

function onB()
  glasses = glasses + 1
  save()
  return "partial"
end

function onA()
  if glasses > 0 then
    glasses = glasses - 1
    save()
  end
  return "partial"
end

function onBHold()
  glasses = 0
  save()
  unidex.toast("Reset")
  return "partial"
end
```

```solution
local GOALS = {6, 8, 10}
local glasses = tonumber(unidex.data.read("glasses") or "") or 0
local pick = tonumber(unidex.data.read("goal") or "") or 2
local goal = GOALS[pick]
local screen = "main"

local function save()
  unidex.data.write("glasses", tostring(glasses))
  unidex.data.write("goal", tostring(pick))
end

local function message()
  if glasses >= goal then
    return "Goal reached!"
  else
    return "Keep going"
  end
end

local function drawBar()
  local size = math.floor(184 / goal)
  for i = 1, goal do
    local x = 8 + (i - 1) * size
    if i <= glasses then
      unidex.fill(x, 136, size - 4, 16)
    else
      unidex.rect(x, 136, size - 4, 16)
    end
  end
end

function draw()
  if screen == "options" then
    unidex.header("Options")
    unidex.centered(80, "Goal: " .. goal, "medium")
    unidex.centered(115, "A changes the goal.")
    unidex.centered(135, "B starts the day again.")
    unidex.hints("goal", "reset", "")
  else
    unidex.header("Water")
    unidex.centered(52, message())
    unidex.centered(100, tostring(glasses), "large")
    unidex.centered(125, "of " .. goal .. " glasses today")
    drawBar()
    unidex.hints("less", "add", "options")
  end
end

function status()
  return glasses .. " of " .. goal
end

function onB()
  if screen == "options" then
    glasses = 0
    screen = "main"
    unidex.toast("Reset")
  else
    glasses = glasses + 1
  end
  save()
  return "partial"
end

function onA()
  if screen == "options" then
    pick = pick % #GOALS + 1
    goal = GOALS[pick]
  elseif glasses > 0 then
    glasses = glasses - 1
  end
  save()
  return "partial"
end

function onBHold()
  screen = "options"
  return "partial"
end

-- Holding A leaves the app, unless you're on the options screen: then it goes back to the count
function onBack()
  if screen == "options" then
    screen = "main"
    return "partial"
  end
  return "exit"
end
```

```check
press: B
shows: Options
shows: Goal: 8
press: a
shows: Goal: 10
press: A
shows: of 10 glasses today
rects: 10
```

```check
press: b b B
press: b
shows: Keep going
fills: 0
press: a
hides: -1
```

```check
press: B a a
reopen
shows: of 6 glasses today
```
