# Variables

Right now your app always shows `0`. To show a number that can change, keep it in a **variable**: a name that holds a value.

```lua
local name = "Ada"
local age = 11

function draw()
  unidex.header("Hello " .. name)
  unidex.centered(90, name .. " is " .. age)
  unidex.centered(120, "Next year: " .. age + 1)
end
```

- `local age = 11` makes a variable called `age` and puts `11` in it. `local` means it belongs to this file.
- `..` (two dots) joins things into one line of text. Numbers get turned into text when you join them.
- Variables go at the top, outside `draw`, so they're kept between one draw and the next.

When you show a number on its own, turn it into text first with `tostring(age)`.

## Your turn

At the top of your app, add two variables: `glasses`, starting at `0`, and `goal`, set to `8`.

Then use them in `draw`:

- show `glasses` in the large font, instead of the `"0"` that's there now
- change `glasses today` to say `of 8 glasses today`, with the `8` coming from `goal`

```starter
function draw()
  unidex.header("Water")
  unidex.centered(100, "0", "large")
  unidex.centered(125, "glasses today")
  unidex.hints("", "add", "")
end
```

```solution
local glasses = 0
local goal = 8

function draw()
  unidex.header("Water")
  unidex.centered(100, tostring(glasses), "large")
  unidex.centered(125, "of " .. goal .. " glasses today")
  unidex.hints("", "add", "")
end
```

```check
shows: of 8 glasses today
shows: 0
```
