(function($){

// Downloader Debug GUI
downloader.setGUIContainer("#downloader_debug");

var aud_ctx = new webkitAudioContext();

// Audio elements
var left_elem, right_elem;

// Nodes
var left_src, right_src;
var left_vol = aud_ctx.createGainNode();
left_vol.connect(aud_ctx.destination);
var right_vol = aud_ctx.createGainNode();
right_vol.connect(aud_ctx.destination);

function handleCrossfade(num){
	left_vol.gain.value = Math.min(-parseFloat(num) + 1, 1);
	right_vol.gain.value = Math.min(parseFloat(num) + 1, 1);
}

function loadLeftTrack(src)
{
	downloader.download(src, function(elem){
		left_elem = elem;
		left_src = aud_ctx.createMediaElementSource(elem);
		left_src.connect(left_vol);
	});
}

function loadRightTrack(src)
{
	downloader.download(src, function(elem){
		right_elem = elem;
		right_src = aud_ctx.createMediaElementSource(elem);
		right_src.connect(right_vol);
	});
}

function playLeft()
{
	left_elem.play();
}

function playRight()
{
	// HACK: deal with the right track silence until 0.74s in
	right_elem.currentTime = 0.74;
	right_elem.play();
}

function stopLeft()
{
	left_elem.pause();
	left_elem.currentTime = 0;
}

function stopRight()
{
	right_elem.pause();
	right_elem.currentTime = 0;
}

// Chrome is a silly billy and can't do this immediately (crbug.com/112368)
window.addEventListener('load', function(e){
	loadLeftTrack("left.mp3");
	loadRightTrack("right.mp3");
});

$(function(){

	var left_paper = new Raphael($("#left_waveform").get(0), 800, 100);
	var right_paper = new Raphael($("#right_waveform").get(0), 800, 100);
	var left_bg = left_paper.rect(0, 0, 800, 100, 10);
	left_bg.attr({"fill": "#333"});
	var right_bg = right_paper.rect(0, 0, 800, 100, 10);
	right_bg.attr({"fill": "#333"});

	$("#play").click(function(){
		playLeft();
		playRight();
	});

	$("#stop").click(function(){
		stopLeft();
		stopRight();
	});

	$("#crossfader").change(function(e){
		handleCrossfade(e.srcElement.value);
	});

	$("#swap_tracks").click(function(){
		stopLeft();
		stopRight();
		loadLeftTrack("right.mp3");
		loadRightTrack("left.mp3");
	});
});
})(jQuery);