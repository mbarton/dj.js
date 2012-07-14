var Downloader = function(aud_ctx_, gui_selecter_){
	var gui_tmpl = "<table><tr><td colspan='3'><strong>Downloader</strong></td></tr>" + 
	               "<% _.each(files, function(file){ %> <tr>" +
	               "<td><%= file.src %></td><td>readyState: <%= file.elem.readyState %></td><td>downloaded: <%= file.downloaded %></td>" +
	               "</tr> <% }); %></table>";
	var aud_ctx = aud_ctx_;
	var gui_selecter = gui_selecter_;
	var files = [];

	function update_gui(selecter)
	{
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
					file.node = aud_ctx.createMediaElementSource(file.elem);
					file.callback(file.elem, file.node);
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

	this.download = function(src, callback){
		var existing_entry = _.find(files, function(file){ return file.src === src; });

		if(existing_entry !== undefined){
			callback(existing_entry.elem, existing_entry.node)
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
	};
};