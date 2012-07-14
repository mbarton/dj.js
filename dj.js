//(function($){
var aud_ctx = new webkitAudioContext();
var downloader = new Downloader(aud_ctx, "#downloader_debug");

// Decks
function Deck(){
	this.load_listeners = [];
	this.vol = aud_ctx.createGainNode();
	this.vol.connect(aud_ctx.destination);

	this.play = function(){
		this.elem.play();
	}

	this.stop = function(){
		this.elem.pause();
		this.elem.currentTime = 0;
	}

	this.addLoadListener = function(listener){
		this.load_listeners.push(listener);
	}

	this.load = function(src){
		if(this.elem)
			this.stop()

		this.src = src;

		downloader.download(src, _.bind(function(elem, node){
			this.elem = elem;
			
			node.connect(this.vol);
			this.node = node;
		}, this));

		_.each(this.load_listeners, function(listener){
			listener();
		});
	}
};
var decks = {}
decks.left = new Deck();
decks.right = new Deck();

function handleCrossfade(num){
	decks.left.vol.gain.value = Math.min(-parseFloat(num) + 1, 1);
	decks.right.vol.gain.value = Math.min(parseFloat(num) + 1, 1);
}

function enableUI()
{
	$("input").removeAttr("disabled");
}

decks.left.addLoadListener(enableUI);
decks.right.addLoadListener(enableUI);

// Chrome is a silly billy and can't do this immediately (crbug.com/112368)
window.addEventListener('load', function(e){
	decks.left.load("left.mp3");
	decks.right.load("right.mp3");
});

$(function(){

	/*var left_paper = new Raphael($("#left_waveform").get(0), 800, 100);
	var right_paper = new Raphael($("#right_waveform").get(0), 800, 100);
	var left_bg = left_paper.rect(0, 0, 800, 100, 10);
	left_bg.attr({"fill": "#333"});
	var right_bg = right_paper.rect(0, 0, 800, 100, 10);
	right_bg.attr({"fill": "#333"});*/

	$("#play").click(function(){
		decks.left.play();
		// HACK: deal with the right track silence until 0.74s in
		decks.right.elem.currentTime = 0.74;
		decks.right.play();
	});

	$("#stop").click(function(){
		decks.left.stop();
		decks.right.stop();
	});

	$("#crossfader").change(function(e){
		handleCrossfade(e.srcElement.value);
	});

	$("#swap_tracks").click(function(){
		// HACK: because you don't seem to be able to make multiple source nodes
		// for a single media source and each source can only be connected to one
		// output at a time, we've got to disconnect everything otherwise we will
		// lost the sound of one deck on every swap
		decks.left.node.disconnect(decks.left.vol);
		decks.right.node.disconnect(decks.right.vol);

		var left_src = decks.left.src;
		var right_src = decks.right.src;

		decks.left.load(right_src);
		decks.right.load(left_src);
	});
});

function update_gui()
{
	var out = "<table><tr><td colspan='2'><strong>Decks</strong><td></tr>";
	_.each(decks, function(deck){
		out += "<tr>";
		out += "<td>" + deck.src + "</td>";
		var elem_src = deck.elem !== undefined ? deck.elem.currentSrc : "loading" ;
		out += "<td>" + elem_src + "</td>";
		out += "</tr>";
	});
	out += "</table>";
	$("#decks_debug").html(out);

	setTimeout(update_gui, 500);
}

update_gui();

//})(jQuery);