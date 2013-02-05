/**
 * An OpenResponseNode is a representation of an OpenResponse assessment item
 *
 */

OpenResponseNode.prototype = new Node();
OpenResponseNode.prototype.constructor = OpenResponseNode;
OpenResponseNode.prototype.parent = Node.prototype;
OpenResponseNode.authoringToolName = "Open Response";
OpenResponseNode.authoringToolDescription = "Students write text to answer a question or explain their thoughts";
OpenResponseNode.prototype.i18nEnabled = true;
OpenResponseNode.prototype.i18nPath = "/vlewrapper/vle/node/openresponse/i18n/";
OpenResponseNode.prototype.supportedLocales = {
			"en_US":"en_US",
			"ja":"ja"
};

OpenResponseNode.tagMapFunctions = [
	{functionName:'importWork', functionArgs:[]},
	{functionName:'showPreviousWork', functionArgs:[]}
];

/**
 * @constructor
 * @extends Node
 * @param nodeType
 * @param view
 * @returns {OpenResponseNode}
 */
function OpenResponseNode(nodeType, view) {
	this.view = view;
	this.type = nodeType;
	this.prevWorkNodeIds = [];
	this.importableFromNodes = new Array("NoteNode","OpenResponseNode");	
	this.importableFileExtensions = new Array(
			"jpg", "png");
	
	this.tagMapFunctions = this.tagMapFunctions.concat(OpenResponseNode.tagMapFunctions);
};

/**
 * Takes in a state JSON object and returns an OPENRESPONSESTATE object
 * @param nodeStatesJSONObj a state JSON object
 * @return an OPENRESPONSESTATE object
 */
OpenResponseNode.prototype.parseDataJSONObj = function(stateJSONObj) {
	return OPENRESPONSESTATE.prototype.parseDataJSONObj(stateJSONObj);
};

OpenResponseNode.prototype.translateStudentWork = function(studentWork) {
	return studentWork;
};

/**
 * Get the prompt for the peer review view
 */
OpenResponseNode.prototype.getPeerReviewPrompt = function() {
	if(this.or == null) {
		//create an OPENRESPONSE to load the content
		this.or = new OPENRESPONSE(this);	
	}
	
	//retrieve the prompt from the OPENRESPONSE content
	var peerReviewPrompt = this.or.getPeerReviewPrompt();
	return peerReviewPrompt;
};

/**
 * Get the other student's work that will be peer reviewed.
 * We will get the other student's work by parsing the JSON 
 * NodeVisit obj that is passed in.
 * @param otherStudentWorkJSONObj a JSON object containing a NodeVisit of
 * the other student's work
 * @return the other student's work
 */
OpenResponseNode.prototype.getPeerReviewOtherStudentWork = function(otherStudentWorkJSONObj) {
	if(this.or == null) {
		this.or = new OPENRESPONSE(this);	
	}
	
	var peerReviewOtherStudentWork = this.or.getPeerReviewOtherStudentWork(otherStudentWorkJSONObj);
	return peerReviewOtherStudentWork;
};

/**
 * Imports and inserts the work from the specified importFromNode
 * @param importFromNode node that has the data for this node to import
 * @return
 */
OpenResponseNode.prototype.importWork = function(importFromNode) {
	if (this.canImportWork(importFromNode)) {
		var studentWorkState = this.view.state.getLatestWorkByNodeId(importFromNode.id);
		if (studentWorkState != null) {
			var studentWork = studentWorkState.response;

			if(studentWork != null && studentWork.constructor.toString().indexOf("Array") != -1) {
				/*
				 * response is an array so we will use the toString() of the array
				 * which should give us just the text within it
				 */
				studentWork = studentWork.toString();

				if(this.contentPanel && this.contentPanel.or) {
					this.contentPanel.or.appendResponse(studentWork);
				}
			}
				
		};
	}
};

/**
 * Returns true iff the given file can be imported 
 * into this step's work.
 */
OpenResponseNode.prototype.canImportFile = function(filename) {
	// can't import if this is not in a rich text editor mode.
	if (this.contentPanel.or.content.isRichTextEditorAllowed) {
		if (filename.indexOf(".") != -1) {
			var fileExt = filename.substr(filename.lastIndexOf(".")+1);	
			if (this.importableFileExtensions.indexOf(fileExt.toLowerCase()) != -1) {
			return true;
			}
		}
	}
	return false;
};

/**
 * Imports and inserts the specified file into current response.
 * @param file to insert into response
 * @return true iff import is successful
 */
OpenResponseNode.prototype.importFile = function(filename) {
	if (this.canImportFile(filename)) {
		var importFileHTML = "<img src='"+filename+"'></img>";
		this.contentPanel.or.appendResponse(importFileHTML);
		return true;
	}
	return false;
};


/**
 * Sets up a WorkOnXConstraint before rendering so that students will
 * not be able to navigate to any other step before completing work on
 * this step if that was specified in the content.
 * 
 * @param contentPanel
 * @param studentWork
 */
OpenResponseNode.prototype.render = function(contentPanel,studentWork, disable) {
	// add constraints
	this.addConstraints();
	
	/* call super */
	Node.prototype.render.call(this, contentPanel, studentWork, disable);
};

/**
 * Adds a new constraint for this open response if the content specifies that
 * student must complete work before exiting to another step
 */
OpenResponseNode.prototype.addConstraints = function() {
	if (this.content.getContentJSON().isMustCompleteAllPartsBeforeExit) {
		//this.view.eventManager.fire('addConstraint',{type:'WorkOnXConstraint', x:{id:this.id, mode:'node'}, id:this.utils.generateKey(20)});
	}
};

/**
 * Override of Node.processStateConstraints
 * Checks to see if the work was completed. If it was, then no constraint is needed.
 * If not, then we need to add a constraint.
 */
OpenResponseNode.prototype.processStateConstraints = function() {
	if(!this.isCompleted()){
		this.addConstraints();
	}
};

/**
 * Called when the step is exited. This is used for auto-saving.
 */
OpenResponseNode.prototype.onExit = function() {
	//check if the content panel exists
	if(this.contentPanel && this.contentPanel.save) {
		//tell the content panel to save
		this.contentPanel.save();
	};
};

/**
 * Renders the student work into the div. The grading tool will pass in a
 * div id to this function and this function will insert the student data
 * into the div.
 * 
 * @param displayStudentWorkDiv the div we will render the student work into
 * @param nodeVisit the student work
 * @param childDivIdPrefix (optional) a string that will be prepended to all the 
 * div ids use this to prevent DOM conflicts such as when the show all work div
 * uses the same ids as the show flagged work div
 * @param workgroupId the id of the workgroup this work belongs to
 * 
 * TODO: rename TemplateNode
 * Note: you may need to add code to this function if the student
 * data for your step is complex or requires additional processing.
 * look at SensorNode.renderGradingView() as an example of a step that
 * requires additional processing
 */
OpenResponseNode.prototype.renderGradingView = function(displayStudentWorkDiv, nodeVisit, childDivIdPrefix, workgroupId) {
	/*
	 * Get the latest student state object for this step
	 * TODO: rename templateState to reflect your new step type
	 * 
	 * e.g. if you are creating a quiz step you would change it to quizState
	 */
	var openResponseState = nodeVisit.getLatestWork();
	
	/*
	 * get the step work id from the node visit in case we need to use it in
	 * a DOM id. we don't use it in this case but I have retrieved it in case
	 * someone does need it. look at SensorNode.js to view an example of
	 * how one might use it.
	 */
	var stepWorkId = nodeVisit.id;
	
	/*
	 * TODO: rename templateState to match the variable name you
	 * changed in the previous line above
	 */
	var studentWork = openResponseState.response;
	
	//get the string value of the student work in case student work is an array
	studentWork = this.getStudentWorkString(studentWork);
	
	//get the step content
	var contentJSON = this.content.getContentJSON();
	
	if(contentJSON.cRater != null) {
		//this step is a CRater step so we will get he CRater grading view
		studentWork = this.getCRaterGradingView(nodeVisit);
	}
	
	//replace \n with <br>
	studentWork = this.view.replaceSlashNWithBR(studentWork);
	
	//put the student work into the div
	displayStudentWorkDiv.html(studentWork);
};

/**
 * Get the CRater grading view which will display the individual
 * check answer submits and the score and the feedback
 * @param nodeVisit the node visit
 * @return the html that will display the CRater grading view
 */
OpenResponseNode.prototype.getCRaterGradingView = function(nodeVisit) {
	var html = '';
	
	//get the step work id
	var stepWorkId = nodeVisit.id;
	
	//get the step content
	var contentJSON = this.content.getContentJSON();
	
	//get the CRater annotation for this step work
	var cRaterAnnotation = this.view.annotations.getAnnotationByStepWorkIdType(stepWorkId, 'cRater');
	
	//get the node states
	var nodeStates = nodeVisit.nodeStates;
	
	//the counter for the check answer submits
	var checkAnswerCounter = 1;
	
	if(nodeStates != null && nodeStates.length > 0) {
		/*
		 * loop through all the node states so that we show all the individual check answer submits.
		 * the newest node states will show up at the top and the oldest will show up at the bottom.
		 */
		for(var x=0; x<nodeStates.length; x++) {
			var htmlForNodeState = '';
			
			//get a node state
			var nodeState = nodeStates[x];
			
			//get the timestamp
			var nodeStateTimestamp = nodeState.timestamp;
			
			//get the text the student typed
			var studentWork = nodeState.response;
			
			//get the string value of the student work in case student work is an array
			studentWork = this.getStudentWorkString(studentWork);
			
			var annotationRevision = null;
			
			if(cRaterAnnotation != null && cRaterAnnotation.value != null) {
				//there was a CRater annotation
				
				/*
				 * get the value of the annotation. the value of the annotation
				 * is an array that can contain annotation revisions if the student
				 * checked their answer multiple times within the same node visit
				 */
				var valueArray = cRaterAnnotation.value;
				
				//loop through all the values in the array
				for(var y=0; y<valueArray.length; y++) {
					//get an annotation revision
					var tempAnnotationRevision = valueArray[y];
					
					if(tempAnnotationRevision != null) {
						//get the node state id which is the timestamp when the node state was created
						var nodeStateId = tempAnnotationRevision.nodeStateId;
						
						if(nodeStateTimestamp == nodeStateId) {
							/*
							 * the node state timestamp matches the annotation revision timestamp
							 * so we have found the annotation for our node state
							 */
							annotationRevision = tempAnnotationRevision;
							break;
						}
					}
				}
			}
			
			if(annotationRevision == null) {
				//there was no CRater annotation for this node state
				
				//display the save answer for the node visit
				htmlForNodeState += 'Save Answer';
				htmlForNodeState += '<br>';
				htmlForNodeState += studentWork;
			} else {
				//there was a CRater annotation for this node state
				
				//display the check answer number for the node visit
				htmlForNodeState += 'Check Answer #' + checkAnswerCounter;
				checkAnswerCounter++;
				
				htmlForNodeState += '<br>';
				htmlForNodeState += studentWork;
				htmlForNodeState += '<br>';
				
				//display the CRater score
				htmlForNodeState += 'Auto-Score: ' + annotationRevision.score;
				
				/*
				 * get the CRater feedback the student received, if any.
				 * displayCRaterFeedbackToStudent must be enabled in order
				 * for the cRaterFeedbackText to be set in the node state.
				 */
				var feedbackText = nodeState.cRaterFeedbackText;
				
				if(feedbackText != null) {
					htmlForNodeState += '<br>';

					//display the feedback
					htmlForNodeState += 'Auto-Feedback: ' + feedbackText;					
				}
			}

			htmlForNodeState += '<br><br>';
			
			//prepend the html for this node state so that newest node state is displayed at the top
			html = htmlForNodeState + html;
		}
	}
	
	return html;
};

/**
 * Get the student work as a string in case student work is an array
 * @param studentWork a string or an array containing the student work text
 * @return the student work as a string
 */
OpenResponseNode.prototype.getStudentWorkString = function(studentWork) {
	if(studentWork != null && studentWork.constructor.toString().indexOf("Array") != -1) {
		/*
		 * response is an array so we will use the toString() of the array
		 * which should give us just the text within it
		 */
		studentWork = studentWork.toString();
	}
	
	return studentWork;
};

/**
 * Get the html string representation of the student work
 * @param work the student node state that we want to display
 * @return an html string that will display the student work
 */
OpenResponseNode.prototype.getStudentWorkHtmlView = function(work) {
	var latestState = work;
	var html = '';
	
	if(latestState != null && typeof latestState == 'object') {
		//get the student response as a string
		html = latestState.response + '';
	}
	
	return html;
};

/**
 * Whether this step has auto graded fields
 * @return whether this step has auto graded fields
 */
OpenResponseNode.prototype.hasAutoGradedFields = function() {
	var result = false;
	
	//get the step content
	var nodeContent = this.content.getContentJSON();
	
	if(nodeContent != null) {
		if(nodeContent.cRater != null) {
			//this step is a CRater step so it has an auto graded field
			result = true;
		}
	}
	
	return result;
};

/**
 * Get the auto graded fields for this step including the auto graded
 * scores
 * @param stepWorkId the step work id 
 * @param runId the run id
 * @param nodeId the node id
 * @param toWorkgroup the student workgroup id
 * @param fromWorkgroup the teacher workgroup ids
 * @return an array of objects that contain auto graded field data
 */
OpenResponseNode.prototype.getAutoGradedFields = function(stepWorkId, runId, nodeId, toWorkgroup, fromWorkgroup) {
	var autoGradedFields = [];
	
	//get the step content
	var nodeContent = this.content.getContentJSON();
	
	if(nodeContent != null) {
		if(nodeContent.cRater != null) {
			//this step uses CRater
			
			var autoGradedField = 'cRater';
			var autoGradedMaxScore = null;
			var autoGradedScore = null;
			var cRaterAnnotation = null;
			
			if(nodeContent.cRater.cRaterMaxScore != null) {
				//get the CRater max score
				autoGradedMaxScore = nodeContent.cRater.cRaterMaxScore;
			}
			
			/*
			 * get the CRater annotation (if any) so we can get the CRater
			 * score the student received
			 */
			if(stepWorkId != null) {
				//stepWorkId was provided
				cRaterAnnotation = this.view.annotations.getAnnotationByStepWorkIdType(parseInt(stepWorkId), 'cRater');
			} else {
				/*
				 * stepWorkId was not provided so we need to look 
				 * up the annotation using the other fields
				 */
				cRaterAnnotation = this.view.annotations.getLatestAnnotationByAll(runId, nodeId, toWorkgroup, "-1", 'cRater');								
			}
			
			if(cRaterAnnotation != null) {
				/*
				 * get the value of the annotation which will be an array
				 * because a CRater annotation contains all the CRater scores
				 * for each submit within a single node visit
				 */
				var annotationArray = cRaterAnnotation.value;
				
				if(annotationArray.length > 0) {
					//get the last sub annotation
					var lastAnnotation = annotationArray[annotationArray.length - 1];
					
					//get the CRater score
					autoGradedScore = lastAnnotation.score;
				}
			}
			
			if(autoGradedScore == null || autoGradedScore == "") {
				//set the value to 0 if it is null or ""
				autoGradedScore = 0;
			}
			
			//create the object that will contain all the fields
			var autoGradedFieldObject = {
				autoGradedField:autoGradedField,
				autoGradedMaxScore:autoGradedMaxScore,
				autoGradedScore:autoGradedScore
			};
			
			autoGradedFields.push(autoGradedFieldObject);
		}
	}
	
	//return the array
	return autoGradedFields;
};

/**
 * Determine whether the student has completed the step or not
 * @param nodeState the latest node state for the step
 * @return whether the student has completed the step or not
 */
OpenResponseNode.prototype.isCompleted = function(nodeState) {
	var result = false;
	
	if(nodeState != null && nodeState != '') {
		if(nodeState.response != '') {
			result = true;
		}
	}
	
	return result;
};

OpenResponseNode.prototype.getHTMLContentTemplate = function() {
	return createContent('node/openresponse/openresponse.html');
};

NodeFactory.addNode('OpenResponseNode', OpenResponseNode);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/openresponse/OpenResponseNode.js');
};