# Welcome to Sonic Pi v2.11
set_sched_ahead_time! 0
live_loop :listen do
  message = sync "/osc/play_this"
  ##| print message
  ##| print message[0]
  note = message[0]
  rel = message[1]
  amp = message[2]
  play note, release: rel, amp: amp
  ##| play note
end

live_loop :listen2 do
  message = sync "/osc/sleep"
  len = message[0]
  ##| rel = message[1]
  ##| play note, release: rel
  ##| play note
  sleep len
end


set :synths, [:beep, :dsaw]
set :samples, [:perc_snap2, :bd_fat]
live_loop :synthlisten do
  message = sync "/osc/synthplay"
  syn = message[0]
  ##| rel = message[1]
  use_synth get[:synths][syn]
  ##| play 68, amp: 0.75
  ##| play note
end

live_loop :sampleplayer do
  message = sync "/osc/sample"
  sam = message[0]
  sample get[:samples][sam]
end