var downloader;

(function($){

var files = [];
var gui_selecter;

function update_gui(selecter)
{
	var gui_tmpl = "<hr /><% _.each(files, function(file){ %> <%= file.src %> - readyState: <%= file.elem.readyState %> - downloaded: <%= file.downloaded %> <hr /> <% }); %>";
	$(selecter).html(_.template(gui_tmpl, {"files": files}));
}

function check_download()
{
	var all_downloaded = true;

	_.each(files, function(file)
	{
		if(!file.downloaded){
			if(file.elem.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA){
				file.downloaded = true;
				file.callback(file.elem);
			}else{
				all_downloaded = false;
			}
		}

		if(gui_selecter)
			update_gui(gui_selecter);
	});

	if(!all_downloaded)
			setTimeout(check_download, 400);
}

function setGUIContainer(selecter){
	gui_selecter = selecter;
}

function download(src, callback){
	var existing_entry = _.find(files, function(file){ return file.src === src; });

	if(existing_entry !== undefined){
		callback(src, existing_entry.elem)
	}else{
		var elem = new Audio();
		elem.src = src;

		files.push({
			"src": src,
			"elem": elem,
			"callback": callback,
			"downloaded": false
		});

		check_download();
	}
}

downloader = {
	"download": download,
	"setGUIContainer": setGUIContainer
}
})(jQuery);