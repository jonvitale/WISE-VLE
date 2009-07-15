var xmlPage;
var currentResponse;
var saved = true;

/**
 * Generates this page dynamically based on the content of xmlPage
 */
function generatePage(){
	var parent = document.getElementById('dynamicParent');
	
	//wipe out old elements
	parent.removeChild(document.getElementById('dynamicPage'));
	
	//create new elements
	var pageDiv = createElement(document, 'div', {id:'dynamicPage'});
	var optionsDiv = createElement(document, 'div', {id:'optionsDiv'});
	
	parent.appendChild(pageDiv);
	pageDiv.appendChild(optionsDiv);
	
	generateOptions();
	generatePrompt();
	generateCannedResponses();
};

/**
 * Generates the option portion of this page dynamically based
 * on the content of xmlPage
 */
function generateOptions(){
	var parent = document.getElementById('dynamicPage');
	var nextChild = document.getElementById('optionsDiv').nextChild;
	
	//wipe out old options
	parent.removeChild(document.getElementById('optionsDiv'));
	
	//create new options elements
	var optionsDiv = createElement(document, 'div', {id:'optionsDiv'});
	var optionsText = document.createTextNode('Available Options:');
	var optionsTable = createElement(document, 'table', {id:'optionsTable'});
	var optionsRow1 = createElement(document, 'tr', {id:'optionsRow1'});
	var optionsRow2 = createElement(document, 'tr', {id:'optionsRow2'});
	
	if(nextChild){
		parent.insertBefore(optionsDiv, nextChild);
	} else {
		parent.appendChild(optionsDiv);
	};
	
	optionsDiv.appendChild(optionsText);
	optionsDiv.appendChild(createBreak());
	optionsDiv.appendChild(optionsTable);
	optionsDiv.appendChild(createBreak());
	
	optionsTable.appendChild(optionsRow1);
	optionsTable.appendChild(optionsRow2);
	
	var expectedLinesText = document.createTextNode('Size of student response box (#rows): ');
	var expectedLinesInput = createElement(document, 'input', {type: 'text', id: 'expectedLines', onkeyup: 'updateExpectedLines()', value: getExpectedLines()});
	
	optionsDiv.appendChild(expectedLinesText);
	optionsDiv.appendChild(expectedLinesInput);
	
	var titleTD = createElement(document, 'td', {id: 'titleTD'});
	var titleText = document.createTextNode('Title: ');
	var titleInput = createElement(document, 'input', {type: 'text', id: 'titleInput', onkeyup: 'updateTitle()', value: getTitle()});
	
	optionsRow1.appendChild(titleTD);
	
	titleTD.appendChild(titleText);
	titleTD.appendChild(titleInput);
	
	var gatedTD = createElement(document, 'td', {id: 'gatedTD'});
	var gatedText = document.createTextNode('Is Brainstorm gated?');
	var gatedYesText = document.createTextNode('Yes. Student must post a response before seing peer responses');
	var gatedNoText = document.createTextNode('No. Student sees peer responses immediately');
	var gatedYesRadio = createElement(document, 'input', {type: 'radio', name: 'isGated', onclick: 'updateGated(true)'});
	var gatedNoRadio = createElement(document, 'input', {type: 'radio', name: 'isGated', onclick: 'updateGated(false)'});
	
	var displayNameTD = createElement(document, 'td', {id: 'displayNameTD'});
	var displayNameText = document.createTextNode('When response is submitted by student, how is it labeled?');
	var displayNameUserOnlyText = document.createTextNode('Username');
	var displayNameAnonymousOnlyText = document.createTextNode('Anonymous');
	var displayNameUserOrAnonymousText = document.createTextNode('Student selects Username or Anonymous');
	var displayNameUserOnlyRadio = createElement(document, 'input', {type: 'radio', name: 'displayName', onclick: 'updateDisplayName(0)'});
	var displayNameAnonymousOnlyRadio = createElement(document, 'input', {type: 'radio', name: 'displayName', onclick: 'updateDisplayName(1)'});
	var displayNameUserOrAnonymousRadio = createElement(document, 'input', {type: 'radio', name: 'displayName', onclick: 'updateDisplayName(2)'});
	
	var richTextEditorTD = createElement(document, 'td', {id: 'richTextEditorTD'});
	var richTextEditorText = document.createTextNode('Rich Text Editor');
	var richTextEditorYesText = document.createTextNode('Rich editor visible to student');
	var richTextEditorNoText = document.createTextNode('Rich 	editor not visible');
	var richTextEditorYesRadio = createElement(document, 'input', {type: 'radio', name: 'richText', onclick: 'updateRichText(true)'});
	var richTextEditorNoRadio = createElement(document, 'input', {type: 'radio', name: 'richText', onclick: 'updateRichText(false)'});
	
	var pollEndedTD = createElement(document, 'td', {id: 'pollEndedTD'});
	var pollEndedText = document.createTextNode('Is poll ended');
	var pollEndedYesText = document.createTextNode('poll is ended');
	var pollEndedNoText = document.createTextNode('poll is not ended');
	var pollEndedYesRadio = createElement(document, 'input', {type: 'radio', name: 'pollEnded', onclick: 'updatePollEnded(true)'});
	var pollEndedNoRadio = createElement(document, 'input', {type: 'radio', name: 'pollEnded', onclick: 'updatePollEnded(false)'});
	
	var instantPollTD = createElement(document, 'td', {id: 'instantPoll'});
	var instantPollText = document.createTextNode('Instant Poll Active?');
	var instantPollYesText = document.createTextNode('Instant Poll IS active');
	var instantPollNoText = document.createTextNode('Instant Poll IS NOT active');
	var instantPollYesRadio = createElement(document, 'input', {type: 'radio', name: 'instantPoll', onclick: 'updateInstantPoll(true)'});
	var instantPollNoRadio = createElement(document, 'input', {type: 'radio', name: 'instantPoll', onclick: 'updateInstantPoll(false)'});
	
	if(getInstantPoll()=='true'){
		instantPollYesRadio.checked = true;
	} else {
		instantPollNoRadio.checked = true;
	};
	instantPollTD.appendChild(instantPollText);
	instantPollTD.appendChild(createBreak());
	instantPollTD.appendChild(instantPollYesRadio);
	instantPollTD.appendChild(instantPollYesText);
	instantPollTD.appendChild(createBreak());
	instantPollTD.appendChild(instantPollNoRadio);
	instantPollTD.appendChild(instantPollNoText);
	
	if(getPollEnded()=='true'){
		pollEndedYesRadio.checked = true;
	} else {
		pollEndedNoRadio.checked = true;
	};
	pollEndedTD.appendChild(pollEndedText);
	pollEndedTD.appendChild(createBreak());
	pollEndedTD.appendChild(pollEndedYesRadio);
	pollEndedTD.appendChild(pollEndedYesText);
	pollEndedTD.appendChild(createBreak());
	pollEndedTD.appendChild(pollEndedNoRadio);
	pollEndedTD.appendChild(pollEndedNoText);
	
	if(getRichText()=='true'){
		richTextEditorYesRadio.checked = true;
	} else {
		richTextEditorNoRadio.checked = true;
	};
	richTextEditorTD.appendChild(richTextEditorText);
	richTextEditorTD.appendChild(createBreak());
	richTextEditorTD.appendChild(richTextEditorYesRadio);
	richTextEditorTD.appendChild(richTextEditorYesText);
	richTextEditorTD.appendChild(createBreak());
	richTextEditorTD.appendChild(richTextEditorNoRadio);
	richTextEditorTD.appendChild(richTextEditorNoText);
	
	if(getDisplayName()=='0'){
		displayNameUserOnlyRadio.checked = true;
	} else if(getDisplayName()=='1'){
		displayNameAnonymousOnlyRadio.checked = true;
	} else {
		displayNameUserOrAnonymousRadio.checked = true;
	};
	displayNameTD.appendChild(displayNameText);
	displayNameTD.appendChild(createBreak());
	displayNameTD.appendChild(displayNameUserOnlyRadio);
	displayNameTD.appendChild(displayNameUserOnlyText);
	displayNameTD.appendChild(createBreak());
	displayNameTD.appendChild(displayNameAnonymousOnlyRadio);
	displayNameTD.appendChild(displayNameAnonymousOnlyText);
	displayNameTD.appendChild(createBreak());
	displayNameTD.appendChild(displayNameUserOrAnonymousRadio);
	displayNameTD.appendChild(displayNameUserOrAnonymousText);
	
	if(getGated()=='true'){
		gatedYesRadio.checked = true;	
	} else {
		gatedNoRadio.checked = true;
	};
	gatedTD.appendChild(gatedText);
	gatedTD.appendChild(createBreak());
	gatedTD.appendChild(gatedYesRadio);
	gatedTD.appendChild(gatedYesText);
	gatedTD.appendChild(createBreak());
	gatedTD.appendChild(gatedNoRadio);
	gatedTD.appendChild(gatedNoText);
	
	optionsRow1.appendChild(gatedTD);
	optionsRow1.appendChild(displayNameTD);
	optionsRow2.appendChild(richTextEditorTD);
	optionsRow2.appendChild(pollEndedTD);
	optionsRow2.appendChild(instantPollTD);
};

/**
 * Generates the prompt element and removes previous prompt element
 */
function generatePrompt(){
	var parent = document.getElementById('dynamicPage');
	var old = document.getElementById('promptDiv');
	
	//wipe out old
	if(old){
		parent.removeChild(old);
	};
	
	//create new
	var promptDiv = createElement(document, 'div', {id: 'promptDiv'});
	var promptText = document.createTextNode('Edit/Enter prompt');
	var promptInput = createElement(document, 'textarea', {id: 'promptInput', cols: '75', rows: '28', wrap: 'soft', onkeyup: 'updatePrompt()'});
	promptInput.value = getPrompt();
	
	promptDiv.appendChild(createBreak());
	promptDiv.appendChild(promptText);
	promptDiv.appendChild(createBreak());
	promptDiv.appendChild(promptInput);
	
	parent.appendChild(promptDiv);
};

/**
 * Generates the cannedResponses element and removes previous
 */
function generateCannedResponses(){
	var parent = document.getElementById('dynamicPage');
	var old = document.getElementById('cannedResponsesDiv');
	
	if(old){
		parent.removeChild(old);
	};
	
	var cannedResponsesDiv = createElement(document, 'div', {id: 'cannedResponsesDiv'});
	var cannedResponsesDivText = document.createTextNode('Edit/Create canned student responses', {class:'cannedResponsesTitle'});
	var createButton = createElement(document, 'input', {type: 'button', class:'button', value: 'Create New Response', onclick: 'createNewResponse()'});
	var removeButton = createElement(document, 'input', {type: 'button', class:'button', value: 'Remove Response', onclick: 'removeResponse()'});
	var responses = xmlPage.getElementsByTagName('response');
	
	parent.appendChild(createBreak());
	cannedResponsesDiv.appendChild(cannedResponsesDivText);
	parent.appendChild(createBreak());
	for(var t=0;t<responses.length;t++){
		var title = responses[t].getAttribute('name');
		if(responses[t].firstChild){
			var val = responses[t].firstChild.nodeValue;
		} else {
			var val = "";
		};
		var responseTitleText = document.createTextNode('Name: ');
		var responseTitleInput = createElement(document, 'input', {type: 'text', id: 'responseInput_' + title, value: title, onkeyup: 'responseNameChanged("' + title + '")', onclick: 'responseSelected("' + title + '")'});
		var responseValueText = document.createTextNode('Response: ');
		var responseValueInput = createElement(document, 'textarea', {id: 'responseValue_' + title, onkeyup: 'responseValueChanged("' + title + '")', onclick: 'responseSelected("' + title + '")'});
		responseValueInput.value = val;
		
		cannedResponsesDiv.appendChild(createBreak());
		cannedResponsesDiv.appendChild(responseTitleText);
		cannedResponsesDiv.appendChild(responseTitleInput);
		cannedResponsesDiv.appendChild(createBreak());
		cannedResponsesDiv.appendChild(responseValueText);
		cannedResponsesDiv.appendChild(responseValueInput);
	};
	
	cannedResponsesDiv.appendChild(createBreak());
	cannedResponsesDiv.appendChild(createButton);
	cannedResponsesDiv.appendChild(removeButton);
	parent.appendChild(cannedResponsesDiv);
};

/**
 * Returns the value of the title attribute in xmlPage
 */
function getTitle(){
	return xmlPage.getElementsByTagName('Brainstorm')[0].getAttribute('title');
};

/**
 * Updates the value of the title attribute in xmlPage
 */
function updateTitle(){
	xmlPage.getElementsByTagName('Brainstorm')[0].setAttribute('title', document.getElementById('titleInput').value);
	updatePreview();
};

/**
 * Returns the value of the isAnonAllowed attribute in xmlPage
 */
function getAnonymousAllowed(){
	return xmlPage.getElementsByTagName('Brainstorm')[0].getAttribute('isAnonAllowed');
};

/**
 * Updates the value of the isAnonAllowed attribute in xmlPage
 */
function updateAnonymousAllowed(val){
	xmlPage.getElementsByTagName('Brainstorm')[0].setAttribute('isAnonAllowed', val);
	updatePreview();
};

/**
 * Returns the value of the isGated attribute in xmlPage
 */
function getGated(){
	return xmlPage.getElementsByTagName('Brainstorm')[0].getAttribute('isGated');
};

/**
 * Updates the value of the isGated attribute in xmlPage
 */
function updateGated(val){
	xmlPage.getElementsByTagName('Brainstorm')[0].setAttribute('isGated', val);
	updatePreview();
};

/**
 * Returns the value of the displayName attribute in xmlPage
 */
function getDisplayName(){
	return xmlPage.getElementsByTagName('Brainstorm')[0].getAttribute('displayName');
};

/**
 * Updates the value of the displayName attribute in xmlPage
 */
function updateDisplayName(val){
	xmlPage.getElementsByTagName('Brainstorm')[0].setAttribute('displayName', val);
	updatePreview();
};

/**
 * Returns the value of the isRichTextEditorAllowed attribute in xmlPage
 */
function getRichText(){
	return xmlPage.getElementsByTagName('Brainstorm')[0].getAttribute('isRichTextEditorAllowed');
};

/**
 * Updates the value of the isRichTextEditorAllowed attribute in xmlPage
 */
function updateRichText(val){
	xmlPage.getElementsByTagName('Brainstorm')[0].setAttribute('isRichTextEditorAllowed', val);
	updatePreview();
};

/**
 * Returns the value of the isPollEnded attribute in xmlPage
 */
function getPollEnded(){
	return xmlPage.getElementsByTagName('Brainstorm')[0].getAttribute('isPollEnded');
};

/**
 * Updates the value of the isPollEnded attribute in xmlPage
 */
function updatePollEnded(val){
	xmlPage.getElementsByTagName('Brainstorm')[0].setAttribute('isPollEnded', val);
	updatePreview();
};

/**
 * Returns the value of the isInstantPollActive attribute in xmlPage
 */
function getInstantPoll(){
	return xmlPage.getElementsByTagName('Brainstorm')[0].getAttribute('isInstantPollActive');
};

/**
 * Updates the value of the isInstantPollActive attribute in xmlPage
 */
function updateInstantPoll(val){
	xmlPage.getElementsByTagName('Brainstorm')[0].setAttribute('isInstantPollActive', val);
	updatePreview();
};

/**
 * Returns the value of expectedLines attribute of the extendedTextInteraction element in xmlPage
 */
function getExpectedLines(){
	return xmlPage.getElementsByTagName('Brainstorm')[0].getElementsByTagName('extendedTextInteraction')[0].getAttribute('expectedLines');
};

/**
 * Updates the value of the expectedLines attribute of the extendedTextInteraction element in xmlPage
 */
function updateExpectedLines(){
	xmlPage.getElementsByTagName('Brainstorm')[0].getElementsByTagName('extendedTextInteraction')[0].setAttribute('expectedLines', document.getElementById('expectedLines').value);
	updatePreview();
};

/**
 * Returns the value of the prompt element in xmlPage
 */
function getPrompt(){
	if(xmlPage.getElementsByTagName('Brainstorm')[0].getElementsByTagName('prompt')[0].firstChild){
		return xmlPage.getElementsByTagName('Brainstorm')[0].getElementsByTagName('prompt')[0].firstChild.nodeValue;
	} else {
		return "";
	};
};

/**
 * Updates the value of the prompt element in xmlPage
 */
function updatePrompt(){
	if(xmlPage.getElementsByTagName('Brainstorm')[0].getElementsByTagName('prompt')[0].firstChild){
		xmlPage.getElementsByTagName('Brainstorm')[0].getElementsByTagName('prompt')[0].firstChild.nodeValue = document.getElementById('promptInput').value;
	} else {
		var promptText = xmlPage.createTextNode(document.getElementById('promptInput').value);
		xmlPage.getElementsByTagName('Brainstorm')[0].getElementsByTagName('prompt')[0].appendChild(promptText);
	};
	updatePreview();
};

/**
 * Returns the canned responses found in xmlPage
 */
function getResponses(){
	return xmlPage.getElementsByTagName('response');
};

/**
 * Given the name, returns the associated canned response in xmlPage
 */
function getResponse(name){
	var responses = getResponses();
	for(var c=0;c<responses.length;c++){
		if(responses[c].getAttribute('name')==name){
			return responses[c];
		};
	};
};

/**
 * Given an existing name, updates associated name in xmlPage
 */
function responseNameChanged(name){
	var input = document.getElementById('responseInput_' + name);
	var responseInput = document.getElementById('responseValue_' + name);
	var val = input.value;
	var response = getResponse(name);
	input.id = 'responseInput_' + val;
	input.setAttribute('onkeyup', 'responseNameChanged("' + val + '")');
	input.setAttribute('onclick', 'responseSelected("' + val + '")');
	input.value = val;
	responseInput.id = 'responseValue_' + val;
	responseInput.setAttribute('onkeyup', 'responseValueChanged("' + val + '")');
	responseInput.setAttribute('onclick', 'responseSelected("' + val + '")');
	updatePreview();
	response.setAttribute('name', val);
	updatePreview();
};

/**
 * Given an existing name, updates the associated value in xmlPage
 */
function responseValueChanged(name){
	if(getResponse(name).firstChild){
		getResponse(name).firstChild.nodeValue = document.getElementById('responseValue_' + name).value;
	} else {
		getResponse(name).appendChild(xmlPage.createTextNode(document.getElementById('responseValue_' + name).value));
	};
	updatePreview();
};

/**
 * sets the global currentResponse to the currently selected response
 */
function responseSelected(name){
	currentResponse = getResponse(name);
};

/**
 * Removes the currently selected response, if none, alerts
 */
function removeResponse(){
	if(currentResponse){
		xmlPage.getElementsByTagName('cannedResponses')[0].removeChild(currentResponse);
		generatePage();
		updatePreview();
	} else {
		alert('No response is selected for removal. Please select a response and try again.');
	};
};

/**
 * Creates a new canned response
 */
function createNewResponse(){
	var parent = xmlPage.getElementsByTagName('cannedResponses')[0];
	var response = xmlPage.createElement('response');
	var emptyValue = xmlPage.createTextNode('');
	
	response.setAttribute('name', 'Enter name');
	response.appendChild(emptyValue);
	
	parent.appendChild(response);
	generatePage();
	updatePreview();
};

/**
 * Loads updated content into previewFrame
 */
function updatePreview(){
	saved = false;
	
	window.frames["previewFrame"].loadContent(xmlPage);
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

		  /***						***|
		   * Extra work needed for IE *|
		   ***						***/
		  if(window.ActiveXObject){
		  	var ieXML = new ActiveXObject("Microsoft.XMLDOM");
		  	ieXML.async = "false";
		  	ieXML.loadXML(o.responseText);
		  	xmlDocToParse = ieXML;
		  };
		  /***						***|
		   * End extra work for IE	  *|
		   ***						***/
	  
		/**
		 * sets local xml and then generates the left panel
		 * of this page dynamically
		 */
		xmlPage = xmlDocToParse;
		generatePage();
		
		window.frames["previewFrame"].loadContent(xmlPage);

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
}

//used to notify scriptloader that this script has finished loading
scriptloader.scriptAvailable(scriptloader.baseUrl + "vle/author/js/brainstorm_easy.js");