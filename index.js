var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var OSC = require('osc-js');
var port = process.env.PORT || 3000;
// var Worker = require('webworker-threads').Worker;
// require('handlebars');


// gibbs = require('./gibber.audio.lib.min.js')

const osc = new OSC({
  plugin: new OSC.DatagramPlugin({ send: { port: 4559, host: '127.0.0.1' } })
});

osc.open() // listening on 'ws://localhost:8080'


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');

});


app.use('/bower_components', express.static(__dirname + '/bower_components'));


playing = 0;
lastNotePlay = Date.now();
notePlaying = 0;
release = 1;


messageList = [
  "/play_this",   //0 is note play
                        //check for each parameter of note play if it's a string or not
  "/sleep",       //1 is sleep
                        //check parameter if it's a variable
  "/sample",      //2 is sample
                        //0 is perc_snap, 1 is bd_fat
  "/synthplay"    //3 is synth
                        //0 is beep, 1 is d_saw
]


playArr = [
  [3, 0], 
  [0, 64, 0.8, 0.4], 
  [3, 1], 
  [0, 40, 2, 0.1], 
  [2, 1], 
  [1, 0.6], 
  [3, 0], 
  [0, 62, 0.8, 0.4], 
  [1, 0.6], 
  [3, 0],                                       //use_synth :beep
  [0, "a", 0.8, 0.4],                           //play a, release: 0.8, amp: 0.4
  [2, 0],                                       //sample :perc_snap2
  [1, "e"],                                     //sleep e
  [3, 0],
  [0, 62, 0.8, 0.4],
  [2, 0.6],
  //measure 2
  [3, 0],
  [0, 64, 0.8, 0.4],
  [3, 1],
  [0, 36, 2, 0.1],
  [2, 1],
  [1, 0.6],
  
  [3, 0],
  [0, 64, 0.8, 0.4],
  [2, 1],
  [1, "e"],

  [3, 0],
  [0, "b", 0.8, 0.4],
  [2, 0],
  [1, "f"],
  //measure 3
  [3, 0],
  [0, 62, 0.8, 0.4],
  [3, 1],
  [0, 38, 2, 0.1],
  [2, 1],
  [1, 0.6],

  [3, 0],
  [0, 62, 0.8, 0.4],
  [2, 1],
  [1, "e"],

  [3, 0],
  [0, "c", 0.8, 0.4],
  [2, 0],
  [1, 1.2],
  //measure 4
  [3, 0],
  [0, 62, 0.8, 0.4],
  [3, 1],
  [0, 43, 2, 0.1],
  [2, 1],
  [1, "e"],

  [3, 0],
  [0, 67, 0.8, 0.4],
  [2, 1],
  [1, 0.6],

  [3, 0],
  [0, "d", 0.8, 0.4],
  [2, 1],
  [1, "f"],
  //measure 5
  [3, 0],
  [0, 64, 0.8, 0.4],
  [3, 1],
  [0, 40, 2, 0.1],
  [2, 1],
  [1, 0.6],

  [3, 0],
  [0, 62, 0.8, 0.4],
  [2, 0.6],

  [3, 0],
  [0, "a", 0.8, 0.4],
  [2, 1],
  [1, "e"],

  [3, 0],
  [0, 62, 0.8, 0.4],
  [1, "e"],
  //measure 6
  [3, 0],
  [0, 64, 0.8, 0.4],
  [3, 1],
  [0, 36, 2, 0.1],
  [2, 1],
  [1, 0.6],

  [3, 0],
  [0, 64, 0.8, 0.4],
  [2, 1],
  [1, 0.6],

  [3, 0],
  [0, "b", 0.8, 0.4],
  [2, 0],
  [1, 1.2],

  [3, 0],
  [0, 64, 0.8, 0.4],
  [2, 1],
  [1, 0.6],
  //measure 7
  [3, 0],
  [0, 62, 0.8, 0.4],
  [3, 1],
  [0, 38, 2, 0.1],
  [2, 1],
  [1, 0.6],

  [3, 0],
  [0, 64, 0.8, 0.4],
  [2, 1],
  [1, 0.6],

  [3, 0],
  [0, 62, 0.8, 0.4],
  [1, 0.6],
  //measure 8
  [3, 0],
  [0, "a", 0.8, 0.4],
  [3, 1],
  [0, 36, 2, 0.1],
  [1, 0.6],

  [2, 0],
  [1, 0.6],

  [2, 1],
  [1, "f"],
]
// noteArr = [[1, 60], [1, 60], [1, 67], [1, 67], [1, 69], [1, 69], [1, 67], [1, 20], [1, 65], [1, 65], [1, 64], [1, 64], [1, 62], [1, 62], [2, 60]]
varAnswers = {
  "a": 55,
  "b": 71,
  "c": 90,
  "d": 43,
  "e": 1,
  "f": 0.2
}


variables = {
  "a": 55,
  "b": 71,
  "c": 90,
  "d": 43,
  "e": 1,
  "f": 0.2
}

ticklength = 500;
vals = []

updateVals = function () {
  vals = [
    {
      "docid": "playState",
      "val": playing
    },
    {
      "docid": "speedVal",
      "val": ticklength
    }
  ]
  console.log(vals);
  return true;
}

resumePlaying = function () {
  if (checkPlayState() == 0){
    playing = 1;
    // console.log(lastNotePlay);
    lastNotePlay = Date.now();
    playMusic();
    updateVals();
  }
}

stopPlaying = function () {
  playing = 0;
  console.log("stopping play");
  updateVals();

}

checkPlayState = function () {
  return(playing);
}

note = 0
varval = 0
rel = 0
amp = 0
parameters = []

getValue = function (note) {
  if (isNaN(parseInt(note))) {
    return variables[note];
  }
  else {
    return note;
  }
}

playMusic = function () {
  playing = checkPlayState();
  message = "";
  if (playing == 1) {
    nowtime = Date.now();
    // console.log("playing + " + Date.now());
    //TODO: Figure out nice way to split messages dep3ending on different commands
    note = 0;
    varval = 0;
    rel = 0;
    amp = 0;   
    parameters = [];
    console.log("instruction = " + playArr[notePlaying].toString());
    if (playArr[notePlaying][0] == 0) {
      note = getValue(playArr[notePlaying][1])
      rel = getValue(playArr[notePlaying][2])
      amp = getValue(playArr[notePlaying][3])
      parameters = [note, rel, amp]
      console.log(parameters[0] + " " + parameters[1] + " " + parameters[2]);
      console.log("play parameter = " + parameters);
      message = new OSC.Message(messageList[playArr[notePlaying][0]], note, rel, amp);
    } 
    else if (playArr[notePlaying][0] == 1 || playArr[notePlaying][0] == 2 || playArr[notePlaying][0] == 3) {
      parameters = [getValue(playArr[notePlaying][1])];
      // parameters = [parameters];
      console.log("parameter non play = " + parameters);
      message = new OSC.Message(messageList[playArr[notePlaying][0]], getValue(playArr[notePlaying][1]));

    }
    // else if (playArr[notePlaying][0] == 1) {
    //   parameters = [getValue(playArr[notePlaying][1])]
    // }
    // else if (playArr[notePlaying][0] == 1) {
    //   parameters = [getValue(playArr[notePlaying][1])]
    // }
    // const message = new OSC.Message(messageList[playArr[notePlaying][0]], parseInt(noteArr[notePlaying][1]), parseInt(noteArr[notePlaying][0]));
    if(playArr[notePlaying][0] == 1) {
      console.log("going to sleep");
      setTimeout(playMusic, parameters[0]);
    }
    else{
      // console.log(messageList[playArr[notePlaying][0]] + parameters.toString())
      // console.log("making message " + messageList[playArr[notePlaying][0]] + " " + parameters.toString() + " of type " + typeof(parameters));
      // const message = new OSC.Message(messageList[playArr[notePlaying][0]], parameters);
      // const message = new OSC.Message("play_this/", parameters);
      if (message != ""){
        osc.send(message);
      }
      setTimeout(playMusic, 200);
    }
    // osc.send(message);
    // notePlaying = (notePlaying + 1) % noteArr.length;
    notePlaying = (notePlaying + 1) % playArr.length;
    // setTimeout(playMusic, 500);
    // if (nowtime - lastNotePlay > 800) {
    //   lastNotePlay = nowtime;-
    //   console.log("playing");
    // }
    
  }
  
    // playMusic();
}


io.on('connection', function(socket){
  console.log('a user connected');
  console.log(socket.id);

  variableChange = function () {
    io.emit('variable values', vals);
  }

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    io.emit('chat message', msg);
    console.log(release);
    if (msg == "60" || msg == "70" || msg == "80"){
      const message = new OSC.Message('/play_this', parseInt(msg), release);
      osc.send(message);
    }
  });

  socket.on('play', function (state) {
    if (state == 1) {
      resumePlaying();
    }
    else if (state == 0) {
      console.log("stop call");
      stopPlaying();
    }
    else if (state == -1){
      if (playing == 0) {
        console.log("resuming play from client call");
        resumePlaying();
      }
      else if (playing == 1) {
        console.log("stopping play from client call");
        stopPlaying();
      }
    }
    variableChange();
  });

  socket.on('releaseChange', function (dir) {
    release = release + (dir * 0.2);
    if (release < 0) {
      release = 0.2
    }
    else if (release > 10) {
      release = 1;
    }
  });

  checkCorrects = function () {
    corrects = [0, 0, 0, 0, 0, 0];
    i = 0;
    for (k in variables) {
      if (variables[k] == varAnswers[i]) {
        corrects[i] = 1;
      }
      i++;
    }
  }

  varNameConnects = {
    "dial1": "a",
    "pad1": "b",
    "br2": "c",
    "dial2": "d",
    "pad3": "e",
    "br3": "f"
  }

  varNameConversion = {
    "dial1": [0, 100, 35, 75],
    "pad1": [-100, 100, 50, 90],
    "br2": [0, 100, 75, 105],
    "dial2": [0, 100, 30, 60],
    "pad3": [-100, 100, 0, 3],
    "br3": [-100, 100, 0, 3]
  }

  scaleVal = function(cons, v) {   //original 1, original 2 to final 1, final 2, value to convert
    // v = cons[4];
    o1 = cons[0];
    o2 = cons[1];
    f1 = cons[2];
    f2 = cons[3];
    // console.log(cons);
    if ((o2 - o1) == 0) {
      return f2;
    }
    else {
      return f1 + ( ((f2 - f1)*(v - o1)) / (o2 - o1) );
    }
  },

  socket.on('clientVarChange', function (vs) {
    //br3: scale -100,100 to 0, 3
    //pad3: scale -100,100 to 0, 3
    //dial2: scale 0,100 to 30, 60
    //br2: scale 0, 100 to 75, 105
    //pad1: scale -100, 100 to 50, 90
    //dial1: scale 0, 100 to 35, 75

    // newArr = (varNameConversion[vs[1]]).push(vs[0]);
    // console.log(newArr);
    convertedVal = scaleVal(varNameConversion[vs[1]], vs[0]);
    variables[varNameConnects[vs[1]]] = convertedVal;
    // console.log(variables);
    checkCorrects();
  });

  socket.on('speedChange', function (dir) {
    ticklength = ticklength + (dir * 150);
    if (ticklength > 2000) {
      ticklength = 250;
    }
    
    if (ticklength < 100) {
      ticklength = 2000;
    }
    updateVals();
    variableChange();
  });

  socket.on('send variable vals', function () {
    variableChange();
  })

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});