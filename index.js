var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var OSC = require('osc-js');
var port = process.env.PORT || 3000;
var Worker = require('webworker-threads').Worker;

// gibbs = require('./gibber.audio.lib.min.js')

  const osc = new OSC({
    plugin: new OSC.DatagramPlugin({ send: { port: 4559, host: '127.0.0.1' } })
  });

  // const osc = new OSC( { plugin: new OSC.WebsocketServerPlugin() } );
  osc.open() // listening on 'ws://localhost:8080'


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');

});

var worker = new Worker(function(){
  postMessage("I'm working before postMessage('ali').");
  this.onmessage = function(event) {
    postMessage('Hi ' + event.data);
    self.close();
  };
});
worker.onmessage = function(event) {
  console.log("Worker said : " + event.data);
};
worker.postMessage('ali');


playing = 0;
lastNotePlay = Date.now();
notePlaying = 0;
release = 1;
noteArr = [[1, 60], [1, 60], [1, 67], [1, 67], [1, 69], [1, 69], [1, 67], [1, 20], [1, 65], [1, 65], [1, 64], [1, 64], [1, 62], [1, 62], [2, 60]]

ticklength = 500;

resumePlaying = function () {
  if (checkPlayState() == 0){
    playing = 1;
    console.log(lastNotePlay);
    lastNotePlay = Date.now();
    playMusic();
  }
}

stopPlaying = function () {
  playing = 0;
  console.log("stopping play");
}

checkPlayState = function () {
  return(playing);
}

playMusic = function () {
  playing = checkPlayState();
  if (playing == 1) {
    nowtime = Date.now();
    console.log("playing + " + Date.now());
    const message = new OSC.Message('/play_this', parseInt(noteArr[notePlaying][1]), parseInt(noteArr[notePlaying][0]));
    osc.send(message);
    notePlaying = (notePlaying + 1) % noteArr.length;
    // if (nowtime - lastNotePlay > 800) {
    //   lastNotePlay = nowtime;-
    //   console.log("playing");
    // }
    setTimeout(playMusic, ticklength);
  }
  
    // playMusic();
}


io.on('connection', function(socket){
  console.log('a user connected');
  console.log(socket.id);
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
    if (state == 0) {
      console.log("stop call");
      stopPlaying();
    }
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

  socket.on('speedChange', function (dir) {
    ticklength = ticklength + (dir * 150);
    if (ticklength > 2000) {
      ticklength = 250;
    }
    else if (release < 100) {
      release = 2000;
    }
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});