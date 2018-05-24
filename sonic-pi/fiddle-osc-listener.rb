# Welcome to Sonic Pi v2.11
set_sched_ahead_time! 0
live_loop :listen do
  message = sync "/play_this"
  note = message[:args][0]
  ##| rel = message[:args][1]
  ##| play note, release: rel
  play note
end