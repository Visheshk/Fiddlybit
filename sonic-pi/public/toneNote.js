
var bass = new Tone.MonoSynth({
	"volume" : -10,
	"envelope" : {
		"attack" : 0.1,
		"decay" : 0.3,
		"release" : 2,
	},
	"filterEnvelope" : {
		"attack" : 0.001,
		"decay" : 0.01,
		"sustain" : 0.5,
		"baseFrequency" : 200,
		"octaves" : 2.6
	}
}).toMaster();


var x = 2
var y = 19
var p = -0.23
var q = .75

addX = function () {
	x = (x + 1) % 4;
	console.log(x);
	makeNoteList();
}
addY = function () {
	y = (y + 1) % 40;
	makeNoteList();

}
addP = function () {
	// p = (p + 0.1) % 2;
	p += 200;
			// Tone.Transport.start();
	makeTimeList();

}
addQ = function () {
	// q = (q + 0.1) % 2;
	q += 200;
	makeTimeList();
}

playingVar = false;
seqLength = 6;
noteIndex = -1;
var bassTimeList = [];
var bassNoteList = [];
var bassNoteIndex = -1;
// var 

makeTimeList = function () {
	def = 750;
	bassTimeList = [
		0, 
		def, 
		def, 
		def, 
		def + p, 
		def + q, 
		def + p, 
		def + def + p,
		def,
		def + q,
		def + def + p,
		def,
		def + p,
		def + def + q,
		def + p,
		def + p,
		def + q,
		def + q,
		def,
		def + p,
		def + p,
		def + q,
		def + q,
		def + p,
		def + p,
		def]
}

makeTimeList();

makeNoteList = function () {
	bassNoteList = [
	220, 
	195.998, 
	175.614, 
	195.998, 
	220*x/12, 
	220*y/10,
	220,
	195.998*x/12,
	195.998*y/10,
	195.998,
	220*x/12,
	261.626*x/12,
	261.626*y/10,
	220*y/10,
	195.998*x/12,
	174.614*y/10,
	195.998,
	220*y/10,
	220*x/12,
	220*x/12,
	220*y/10,
	195.998*x/12,
	195.998,
	220*x/12,
	195.998*x/12,
	174.614*y/10]
}

makeNoteList();

bassNoteStepper = function () {
	if (playingVar == true) {
		bassNoteIndex = (bassNoteIndex + 1) % seqLength;
			setTimeout(playBNote, bassTimeList[bassNoteIndex]);
	}
}

playPNote = function () {
	piano.triggerAttackRelease(chordList[noteIndex](x, y), "2n");
	pianoNoteStepper();
}

playBNote = function () {
	bass.triggerAttackRelease(bassNoteList[bassNoteIndex], "32n");
	bassNoteStepper();
}

startPlay = function () {
	bassNoteStepper();
}

playC = function () {
	playingVar = true;
	startPlay();
}
playD = function () {
	playingVar = false;
}


