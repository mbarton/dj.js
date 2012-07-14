(function($){

var aud_ctx = new webkitAudioContext();

// Audio elements
var left_elem = new Audio();
left_elem.src = ("left.mp3");

var right_elem = new Audio();
right_elem.src = ("right.mp3");

// Nodes
var left_src, right_src, left_vol, right_vol;

function createAudioElement(src){
	var aud = new Audio();
	aud.src = src;
	return aud;
}

function handleCrossfade(num){
	left_vol.gain.value = Math.min(-parseFloat(num) + 1, 1);
	right_vol.gain.value = Math.min(parseFloat(num) + 1, 1);
}

// Chrome is a silly billy and can't do this immediately (crbug.com/112368)
window.addEventListener('load', function(e){
	left_src = aud_ctx.createMediaElementSource(left_elem);
	left_vol = aud_ctx.createGainNode();
	left_src.connect(left_vol);
	left_vol.connect(aud_ctx.destination);

	right_src = aud_ctx.createMediaElementSource(right_elem);
	right_vol = aud_ctx.createGainNode();
	right_src.connect(right_vol);
	right_vol.connect(aud_ctx.destination);
});

$(function(){
	$("#play").click(function(){
		// HACK: deal with the right track silence until 0.74s in
		right_elem.currentTime = 0.74;
		left_elem.play();
		right_elem.play();
	});

	$("#stop").click(function(){
		left_elem.pause();
		left_elem.currentTime = 0;
		right_elem.pause();
		right_elem.currentTime = 0;
	});

	$("#crossfader").change(function(e){
		handleCrossfade(e.srcElement.value);
	});
});
})(jQuery);