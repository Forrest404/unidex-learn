-- A unidex game played the way the Games app plays one (src/apps/games/games.cpp in the firmware), for
-- tests/game-model.mjs: lua game-model.lua <main.lua> <id>, then one command a line on stdin:
--   start <seed>    a new round: start(seed), then draw()
--   play <0101...>  a frame each, B up (0) or down (1), as X PLAY does; then draw(), unless the round ended
-- Each answers with its print()s ("LUA <id>: ...") and then "END play", "END over <score>" or "END failed <error>".
local file, id = arg[1], arg[2]
local function say(s) io.write(s, "\n") io.flush() end

-- The unidex API, drawing nothing
unidex = { api = 4 }
for _, n in ipairs({"header", "centered", "text", "hints", "rect", "fill", "line", "qr", "icon", "bitmap", "toast", "wake_in"}) do
  unidex[n] = function() end
end
unidex.wrap = function() return 1 end
unidex.width = function(text) return #tostring(text) * 7 end
unidex.battery = function() return 80, false end
unidex.time = function() local t = os.date("*t"); t.valid = true; return t end
local saved = {}
unidex.data = {
  read = function(name) return saved[name] end,
  write = function(name, text) saved[name] = tostring(text); return true end,
  append = function(name, text) saved[name] = (saved[name] or "") .. tostring(text); return true end,
  remove = function(name) saved[name] = nil; return true end,
  list = function() local t = {} for k in pairs(saved) do t[#t + 1] = k end; return t end,
}
-- unidex.random is the hardware's, so the seed doesn't touch it: a generator of its own
local r = os.time() % 2147483647
unidex.random = function(n) r = (r * 48271) % 2147483647; return 1 + r % n end
print = function(...)
  local t = {}
  for i = 1, select("#", ...) do t[#t + 1] = " " .. tostring((select(i, ...))) end
  say("LUA " .. id .. ":" .. table.concat(t))
end

local function call(fn, ...)
  local f = rawget(_G, fn)
  if type(f) ~= "function" then error("main.lua has no " .. fn .. "() function", 0) end
  return f(...)
end

local f = io.open(file)
local source = f:read("a")
f:close()
local loaded, failed = load(source, "=main.lua")
if loaded then
  local ok, err = pcall(loaded)
  if not ok then failed = err end
end

-- B as the Games app sees it: a tap is B going down
local wasHeld, counted = false, false
local function tap(held)
  local t = held and not wasHeld and not counted
  if t then counted = true end
  if not held then counted = false end
  wasHeld = held
  return t
end

for line in io.lines() do
  local cmd, rest = line:match("^(%S+)%s*(.*)$")
  local result = "play"
  if failed then
    result = "failed " .. tostring(failed)
  else
    local fine, err = pcall(function()
      if cmd == "start" then
        wasHeld, counted = false, false
        call("start", math.tointeger(tonumber(rest)))
      else
        for c in rest:gmatch("[01]") do
          local held = c == "1"
          if call("step", tap(held), held) == "over" then
            local s = call("score")
            if math.type(s) == "float" and s == math.floor(s) then s = math.tointeger(s) end
            if math.type(s) ~= "integer" then error("score() should give a whole number", 0) end
            result = "over " .. s
            return
          end
        end
      end
      call("draw")
    end)
    if not fine then
      failed = err
      result = "failed " .. tostring(err)
    end
  end
  say("END " .. result)
end
