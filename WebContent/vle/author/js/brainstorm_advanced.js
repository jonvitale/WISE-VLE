var saved = true;

/**
 * Loads updated content into previewFrame
 */
function sourceUpdated() {
	saved = false;
	//retrieve the authored text
	var xmlContent = loadXMLString(document.getElementById('sourceTextArea').value);

	window.frames["previewFrame"].loadContent(xmlContent);
};

/**
 * Load the authoring view from the specified filename
 * filename points to a plain old file.
 */
function loadAuthoringFromFile(filename, projectName, projectPath, pathSeparator) {
	var callback =
	{
	  success: function(o) { 
		var xmlDocToParse = o.responseXML;
	  
	    //set source editing area with text
		document.getElementById('sourceTextArea').value = o.responseText;

		//load xmlContent in preview frame
		window.frames["previewFrame"].loadContent(xmlDocToParse);

		},
		failure: function(o) { alert('failure');},
		scope: this
	}

	YAHOO.util.Connect.asyncRequest('POST', '../filemanager.html', callback, 'command=retrieveFile&param1=' + projectPath + pathSeparator + filename);
}

/**
 * Calls functions to dynamically create html, load scripts and
 * call functions that needs to run once all of the scripts and
 * page elements are available
 */
function loaded(){
	//set frame source to blank and create page dynamically
	var callback = function(){
		var frm = window.frames['previewFrame'];
		var loadBrain = function(){
			loadAuthoringFromFile(window.parent.filename, window.parent.projectName, window.parent.projectPath, window.parent.pathSeparator);
			window.parent.childSave = save;
			window.parent.getSaved = getSaved;
		};
		
		frm.scriptloader.initialize(frm.document, loadBrain, 'brainstorm');
	};
	
	window.allready = function(){
		pageBuilder.build(window.frames['previewFrame'].document, 'brainstorm', callback);
	};
	
	window.frames['previewFrame'].location = '../blank.html';
};

//used to notify scriptloader that this script has finished loading
scriptloader.scriptAvailable(scriptloader.baseUrl + "vle/author/js/brainstorm_advanced.js");