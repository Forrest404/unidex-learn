# Make it yours

You've built a whole app: it counts, saves, draws, has a second screen, and knows what day it is. Now turn it into something that's yours.

The same app, with a few words changed, could count:

- push-ups, pages read or minutes practised
- cups of coffee, or days without one
- times the cat was fed, so nobody feeds it twice

Change the title, the words, the goals in `GOALS`, and the `id`, `name`, `description` and `icon` in `app.json`. Rename `glasses` to fit too, everywhere it appears. Press Run as you go.

## Your turn

Make it your own idea, with a new title. When it runs the way you want, press **Check**.

Then put it on your unidex:

1. Plug your unidex into the computer with its USB cable, and press one of its buttons to wake it.
2. Press **Install on my unidex** under your code, and pick it from the list. This needs Chrome or Edge on a computer.
3. On the unidex, open **Apps**. Your app is there.

On another browser, press **Download .zip** to keep a copy.

## Share it in the app store

If you'd like everyone with a unidex to be able to use it, send it to the [app store](https://github.com/Forrest404/unidex-apps). You'll need a free GitHub account.

1. Download your app as a .zip and unzip it. It's a folder named after its `id`.
2. On the [unidex-apps page](https://github.com/Forrest404/unidex-apps), press **Fork** to get your own copy.
3. In your copy, open the `apps` folder, choose **Add file**, then **Upload files**, and drop your folder in.
4. Press **Contribute**, then **Open pull request**.

Checks run on it automatically, and a person reads it. Once it's accepted, it shows up in the [tools site's app store](https://tools.unidex.shop/store.html) within a few hours. The [store's guide](https://github.com/Forrest404/unidex-apps/blob/main/APPS.md) has the details.

```starter
local GOALS = {6, 8, 10}
local glasses = tonumber(unidex.data.read("glasses") or "") or 0
local pick = tonumber(unidex.data.read("goal") or "") or 2
local goal = GOALS[pick]
local screen = "main"

-- Today, as text like "2026-10-17"
local function today()
  local t = unidex.time()
  return t.year .. "-" .. t.month .. "-" .. t.day
end

local function save()
  unidex.data.write("glasses", tostring(glasses))
  unidex.data.write("goal", tostring(pick))
  unidex.data.write("day", today())
end

-- A new day starts the count again
local function newDay()
  if unidex.time().valid and unidex.data.read("day") ~= today() then
    glasses = 0
    save()
    return true
  end
  return false
end
newDay()

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
    local t = unidex.time()
    unidex.header("Water", t.day .. "/" .. t.month)
    unidex.centered(52, message())
    unidex.centered(100, tostring(glasses), "large")
    unidex.centered(125, "of " .. goal .. " glasses today")
    drawBar()
    unidex.hints("less", "add", "options")
  end
end

function tick()
  if newDay() then
    return "partial"
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

```starter app.json
{
  "id": "water",
  "name": "Water",
  "version": "1.0.0",
  "author": "Your name",
  "description": "Counts the glasses of water I drink.",
  "category": "tools",
  "api": 1,
  "type": "app",
  "permissions": [],
  "icon": [
    "                                        ",
    "                                        ",
    "                                        ",
    "                                        ",
    "                                        ",
    "        ##                    ##        ",
    "        ##                    ##        ",
    "        ##                    ##        ",
    "        ##                    ##        ",
    "         ##                  ##         ",
    "         ##                  ##         ",
    "         ##                  ##         ",
    "         ##                  ##         ",
    "         ##                  ##         ",
    "         ##                  ##         ",
    "         ##                  ##         ",
    "         ## ###   ###   ###  ##         ",
    "          ##   ###   ###   ###          ",
    "          ####################          ",
    "          ####################          ",
    "          ####################          ",
    "          ####################          ",
    "          ####################          ",
    "          ####################          ",
    "           #####  ###########           ",
    "           #####  ###########           ",
    "           ##################           ",
    "           ##################           ",
    "           ############  ####           ",
    "           ############  ####           ",
    "           ##################           ",
    "           ########  ########           ",
    "            #######  #######            ",
    "            ################            ",
    "            ################            ",
    "            ################            ",
    "                                        ",
    "                                        ",
    "                                        ",
    "                                        "
  ]
}
```

```solution
local GOALS = {10, 15, 20}
local done = tonumber(unidex.data.read("done") or "") or 0
local pick = tonumber(unidex.data.read("goal") or "") or 1
local goal = GOALS[pick]
local screen = "main"

-- Today, as text like "2026-10-17"
local function today()
  local t = unidex.time()
  return t.year .. "-" .. t.month .. "-" .. t.day
end

local function save()
  unidex.data.write("done", tostring(done))
  unidex.data.write("goal", tostring(pick))
  unidex.data.write("day", today())
end

-- A new day starts the count again
local function newDay()
  if unidex.time().valid and unidex.data.read("day") ~= today() then
    done = 0
    save()
    return true
  end
  return false
end
newDay()

local function message()
  if done >= goal then
    return "Goal reached!"
  else
    return "Keep going"
  end
end

local function drawBar()
  local size = math.floor(184 / goal)
  for i = 1, goal do
    local x = 8 + (i - 1) * size
    if i <= done then
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
    local t = unidex.time()
    unidex.header("Push-ups", t.day .. "/" .. t.month)
    unidex.centered(52, message())
    unidex.centered(100, tostring(done), "large")
    unidex.centered(125, "of " .. goal .. " push-ups today")
    drawBar()
    unidex.hints("less", "add", "options")
  end
end

function tick()
  if newDay() then
    return "partial"
  end
end

function status()
  return done .. " of " .. goal
end

function onB()
  if screen == "options" then
    done = 0
    screen = "main"
    unidex.toast("Reset")
  else
    done = done + 1
  end
  save()
  return "partial"
end

function onA()
  if screen == "options" then
    pick = pick % #GOALS + 1
    goal = GOALS[pick]
  elseif done > 0 then
    done = done - 1
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

```solution app.json
{
  "id": "push-ups",
  "name": "Push-ups",
  "version": "1.0.0",
  "author": "Your name",
  "description": "Counts my push-ups each day.",
  "category": "fun",
  "api": 1,
  "type": "app",
  "permissions": [],
  "icon": [
    "                                        ",
    "                                        ",
    "                                        ",
    "                                        ",
    "                                        ",
    "        ##                    ##        ",
    "        ##                    ##        ",
    "        ##                    ##        ",
    "        ##                    ##        ",
    "         ##                  ##         ",
    "         ##                  ##         ",
    "         ##                  ##         ",
    "         ##                  ##         ",
    "         ##                  ##         ",
    "         ##                  ##         ",
    "         ##                  ##         ",
    "         ## ###   ###   ###  ##         ",
    "          ##   ###   ###   ###          ",
    "          ####################          ",
    "          ####################          ",
    "          ####################          ",
    "          ####################          ",
    "          ####################          ",
    "          ####################          ",
    "           #####  ###########           ",
    "           #####  ###########           ",
    "           ##################           ",
    "           ##################           ",
    "           ############  ####           ",
    "           ############  ####           ",
    "           ##################           ",
    "           ########  ########           ",
    "            #######  #######            ",
    "            ################            ",
    "            ################            ",
    "            ################            ",
    "                                        ",
    "                                        ",
    "                                        ",
    "                                        "
  ]
}
```

```check
hides: Water
press: b b
press: a
reopen
```
