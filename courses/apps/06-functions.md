# Functions of your own

You've been filling in functions the unidex calls, like `draw` and `onB`. You can write your own too, to give a few lines a name and use them in more than one place:

```lua
local function greeting(name)
  return "Hello, " .. name .. "!"
end

function draw()
  unidex.header("Greetings")
  unidex.centered(80, greeting("Ada"))
  unidex.centered(110, greeting("Sam"))
end
```

- `name` is what you hand the function when you call it. Inside, it's a variable like any other.
- `return` hands an answer back. `greeting("Ada")` turns into `"Hello, Ada!"`.
- Write `local function` for your own ones, and put them above the code that uses them.

There's one more function the unidex looks for: `status`. Whatever it returns shows under your app's name in the Apps list, so you can see your count without opening it.

## Your turn

Give your app a message at the top that cheers you on:

- write a function `message` that returns `Goal reached!` once `glasses` is at least `goal`, and `Keep going` before that
- show it with `unidex.centered(52, message())`
- add a `status` function that returns something like `2 of 8`

```starter
local glasses = 0
local goal = 8

function draw()
  unidex.header("Water")
  unidex.centered(100, tostring(glasses), "large")
  unidex.centered(125, "of " .. goal .. " glasses today")
  unidex.hints("less", "add", "reset")
end

function onB()
  glasses = glasses + 1
  return "partial"
end

function onA()
  if glasses > 0 then
    glasses = glasses - 1
  end
  return "partial"
end

function onBHold()
  glasses = 0
  unidex.toast("Reset")
  return "partial"
end
```

```solution
local glasses = 0
local goal = 8

local function message()
  if glasses >= goal then
    return "Goal reached!"
  else
    return "Keep going"
  end
end

function draw()
  unidex.header("Water")
  unidex.centered(52, message())
  unidex.centered(100, tostring(glasses), "large")
  unidex.centered(125, "of " .. goal .. " glasses today")
  unidex.hints("less", "add", "reset")
end

function status()
  return glasses .. " of " .. goal
end

function onB()
  glasses = glasses + 1
  return "partial"
end

function onA()
  if glasses > 0 then
    glasses = glasses - 1
  end
  return "partial"
end

function onBHold()
  glasses = 0
  unidex.toast("Reset")
  return "partial"
end
```

```check
shows: Keep going
press: b b b b b b b
shows: Keep going
press: b
shows: Goal reached!
press: a
shows: Keep going
```
