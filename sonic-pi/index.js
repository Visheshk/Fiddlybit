var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Two = require('two.js');
// var OSC = require('osc-js');
// var Tone = require('tone');
var port = process.env.PORT || 18010;
// var Worker = require('webworker-threads').Worker;
// require('handlebars');


// gibbs = require('./gibber.audio.lib.min.js')

// const osc = new OSC({
//   plugin: new OSC.DatagramPlugin({ send: { port: 4559, host: '127.0.0.1' } })
// });

// osc.open() // listening on 'ws://localhost:8080'


homePage = "/index.html";
puzzlePages = ["/index.html", "/puzzle-1.html"];

app.get('/', function(req, res){
  res.sendFile(__dirname + "" + homePage);

});


app.get('/manual', function(req, res){
  res.sendFile(__dirname + '/manualNoteSeq.html');

});

app.get('/:pno', function(req, res){
  res.sendFile(__dirname + "/p-" + req.params.pno + ".html");

});


app.use(express.static('public/'));

app.use('/bower_components', express.static(__dirname + '/bower_components'));


playing = 0;
lastNotePlay = Date.now();
notePlaying = 0;
release = 1;
feedback = 1;
puzzle = 0;
varAnswers = {
  "x": 12,
  "y": 10,
  "p": 0,
  "q": 0
}


variables = {
  "x": 2,
  "y": 19,
  "p": -440,
  "q": 630 
}

startVars = [
  { "x": 2,
    "y": 19,
    "p": -440,
    "q": 630 } ,
  { "x": 19,
    "y": 3,
    "p": -250,
    "q": 900 }
]

ansVars = [
  { "x": 12,
    "y": 10,
    "p": 0,
    "q": 0 } ,
  { "x": 15,
    "y": 9,
    "p": 0,
    "q": 0 }
]


  // var x = 19
  //   var y = 3
  //   var p = -250
  //   var q = 900

corrects = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
correctVals = [0, 0, 0, 0, 0, 0]
lastCorrects = [0, 0, 0, 0, 0, 0]

ticklength = 500;
vals = []


resumePlaying = function () {
  if (checkPlayState() == 0){
    playing = 1;
    // console.log(lastNotePlay);
    lastNotePlay = Date.now();
    playMusic();
    // updateVals();
  }
}

stopPlaying = function () {
  playing = 0;
  console.log("stopping play");
  // updateVals();
}

checkPlayState = function () {
  return(playing);
}

updatePuzzleVars = function (puzzleNo) {
  variables = startVars[puzzleNo];
  varAnswers = ansVars[puzzleNo];
  homePage = puzzlePages[puzzleNo];
}

updateHomePage = function () {
  io.emit('refresh page');
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

emitFeedback = function () {
  if (feedback == 0) {
    io.emit('feedback', 'Off');
  }
  else {
    io.emit('feedback', 'On');
  }
}

io.on('connection', function(socket){
  console.log('a user connected');
  console.log(socket.id);
  socket.emit('variable values', variables);

  variableChange = function () {
    io.emit('variable values', variables);
  }

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('play', function (state) {
    
    variableChange();
  });

//vnc is, for each variable name [scale] converter.
// the four values are – lowest value of interface tool, highest value of interface, lowest value the variable should take, and highest value it should take
  vnc = {
    "a": [0, 100, 30, 120],
    "b": [-100, 100, 30, 120],
    "c": [0, 100, 30, 120],
    "d": [0, 100, 30, 120],
    "e": [-100, 100, 0.01, 5],
    "f": [-100, 100, 0.01, 5],
    "x": [0, 100, 1, 24],
    "y": [-100, 100, 1, 10],
    "p": [0, 100, -740, 1500],
    "q": [0, 100, -740, 500]
  };

  correctColors = ["", "", "", "", "", ""];

  checkCorrects = function () {
    i = 0;
    for (k in variables) {
      corrects[i] = 1 - ((Math.abs(variables[k] - varAnswers[k]) * 1.0) / (vnc[k][3] - vnc[k][2]));
      corrects[i] = corrects[i] * feedback;
      i++;

    }
    // console.log(correctVals)
    // io.emit("correctUpdate", correctVals);
    // newCor = true
    
    // for (i in corrects) {
    //   if (corrects[i] != lastCorrects[i]) {
    //     newCor = false;
    //   }
    // }

    // if (newCor == false) {
    //   io.emit("correctUpdate", corrects);
    // }

  }

  // varNameConnects = {
  //   "dial1": "a",
  //   "pad1": "b",
  //   "br2": "c",
  //   "dial2": "d",
  //   "pad3": "e",
  //   "br3": "f"
  // }

  varNameConnects = {
    "dial1": "x",
    "pad1": "y",
    "br2": "p",
    "dial2": "q",
    "pad3": "x",
    "br3": "y"
  }

  // varNameConversion = {
  //   "dial1": vnc[0],
  //   "pad1": vnc[1],
  //   "br2": vnc[2],
  //   "dial2": vnc[3],
  //   "pad3": vnc[4],
  //   "br3": vnc[5]
  // }

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
      return f1 + ( ( (f2 - f1)*(v - o1) ) / (o2 - o1) );
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
    // console.log(vs);
    convertedVal = scaleVal(vnc[varNameConnects[vs[1]]], vs[0]);
    variables[varNameConnects[vs[1]]] = convertedVal;
    checkCorrects();
    io.emit("variable values", variables);
    io.emit("correct updates", corrects);
    // console.log(variables);
    
  });

  /*
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
  */
  socket.on('send variable vals', function () {
    variableChange();
  });

  socket.on('Change Feedback', function () {
    console.log("changing feedback " + feedback);
    feedback = 1 - feedback;
    emitFeedback();
  });

  socket.on('Next Puzzle', function () {
    console.log("nexting da puzzle");
    puzzle = (puzzle + 1) % 2;
    updatePuzzleVars(puzzle);
    updateHomePage();
    io.emit('refresh page');

  });  

});

http.listen(18010, function(){
  console.log('listening on *:18010');
});