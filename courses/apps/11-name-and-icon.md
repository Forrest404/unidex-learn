# Its name and icon

Your app is nearly done, so let's make it look like one in the Apps list. That's what `app.json` is for. Open its tab above your code:

```text
{
  "id": "water",
  "name": "Water",
  "version": "1.0.0",
  "author": "",
  "description": "Counts the glasses of water I drink.",
  "category": "tools",
  "api": 1,
  "type": "app",
  "permissions": []
}
```

- `id` is the app's short name inside the unidex: lower case letters, numbers and `-`, and it has to match the app's folder name.
- `name` is what people see, up to 20 letters. `description` says what it does in one sentence.
- `version` goes up when you change the app: `1.0.1` for a fix, `1.1.0` for something new.
- `category` is one of `games`, `tools`, `time`, `badges`, `learning`, `fun` or `other`.
- `api` and `type` stay as they are.

Everything is in double quotes except numbers, with a comma between each line. Miss a comma and Run will tell you which line.

An **icon** is a picture 40 dots wide and 40 tall, written as 40 lines of 40 characters each: `#` for black and a space for white. Here's the top of a glass:

```text
"icon": [
  "                                        ",
  "        ##                    ##        ",
  "        ##                    ##        ",
  ...
]
```

## Your turn

In `app.json`, put your name in `author`, and add an `icon` that's 40 lines of 40 characters. Draw your own, or use the glass in the answer. Press Run: if the icon's the wrong size, the unidex says so.

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

```solution
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

```solution app.json
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

```check
has: author
has: icon
shows: Water
```
