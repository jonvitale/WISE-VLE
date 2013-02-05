package vle.web;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import vle.domain.ideabasket.IdeaBasket;

public class VLEIdeaBasketController extends HttpServlet {

	private static final long serialVersionUID = 1L;
	
	public void doPost(HttpServletRequest request,
			HttpServletResponse response)
	throws ServletException, IOException {
		//get all the params
		String runId = request.getParameter("runId");
		String periodId = request.getParameter("periodId");
		String workgroupId = request.getParameter("workgroupId");
		String action = request.getParameter("action");
		String data = request.getParameter("data");
		String ideaString = request.getParameter("ideaString");
		String ideaId = request.getParameter("ideaId");
		
		String signedInWorkgroupId = (String) request.getAttribute("signedInWorkgroupId");
		String projectId = (String) request.getAttribute("projectId");
		boolean isPrivileged = (Boolean) request.getAttribute("isPrivileged");
		
		//get the latest revision of the IdeaBasket for this runId, workgroupId
		IdeaBasket ideaBasket = IdeaBasket.getIdeaBasketByRunIdWorkgroupId(new Long(runId), new Long(signedInWorkgroupId));

		if(action == null) {
			
		} else if(action.equals("saveIdeaBasket") || action.equals("addPrivateIdea") || action.equals("editPrivateIdea") ||
				 action.equals("deletePrivateIdea") || action.equals("restorePrivateIdea") || action.equals("reOrderPrivateBasket")) {
			boolean savedBasket = false;
			
			Long workgroupIdLong = null;
			Long ideaIdLong = null;
			
			if(workgroupId != null && !"undefined".equals(workgroupId) && !"null".equals(workgroupId)) {
				try {
					//get the long value if a workgroup id was passed in as an argument
					workgroupIdLong = new Long(workgroupId);
				} catch(NumberFormatException e) {
					
				}
			}
			
			if(ideaId != null && !"undefined".equals(ideaId) && !"null".equals(workgroupId)) {
				try {
					//get the long value if an idea id was passed in as an argument
					ideaIdLong = new Long(ideaId);
				} catch(NumberFormatException e) {
					
				}
			}
			
			
			if(ideaBasket != null) {
				//the idea basket was created before
				
				//get the idea basket data
				String previousData = ideaBasket.getData();
				
				if(previousData != null && previousData.equals(data)) {
					//data is the same so we do not need to save
				} else {
					try {
						//create a JSON object from the data to make sure it is valid JSON
						@SuppressWarnings("unused")
						JSONObject dataJSONObj = new JSONObject(data);
						
						//data is not the same so we will save a new row
						ideaBasket = new IdeaBasket(new Long(runId), new Long(periodId), new Long(projectId), new Long(signedInWorkgroupId), data, false, action, new Long(signedInWorkgroupId), ideaIdLong, workgroupIdLong);
						ideaBasket.saveOrUpdate();
						savedBasket = true;
					} catch (JSONException e) {
						e.printStackTrace();
					} catch (NullPointerException e) {
						e.printStackTrace();
					}
				}
			} else {
				//the idea basket was never created before so we will save a new row
				ideaBasket = new IdeaBasket(new Long(runId), new Long(periodId), new Long(projectId), new Long(signedInWorkgroupId), data, false, action, new Long(signedInWorkgroupId), ideaIdLong, workgroupIdLong);
				ideaBasket.saveOrUpdate();
				savedBasket = true;
			}
			
			if(!savedBasket) {
				/*
				 * we failed to save the basket so we will retrieve the
				 * previous revision and send it back to the vle so they
				 * can reload the previous revision.
				 */
				ideaBasket = IdeaBasket.getIdeaBasketByRunIdWorkgroupId(new Long(runId), new Long(signedInWorkgroupId));
				response.getWriter().print(ideaBasket.toJSONString());
			} else {
				/*
				 * we successfully saved the idea basket. we must send this
				 * message back in order to notify the vle that the idea basket
				 * was successfully saved otherwise it will assume it failed
				 * to save
				 */
				response.getWriter().print("Successfully saved Idea Basket");
			}
		} else if(action.equals("addPublicIdea")) {
			//add a public idea to the public idea basket and save a new revision
			
			//make sure the signed in user is allowed to perform this add public idea request
			if(isAllowedToModifyPublicIdeaBasket(new Boolean(isPrivileged), new Long(signedInWorkgroupId), new Long(workgroupId))) {
				JSONObject newIdeaJSON = null;
				long newIdeaId = 0;
				long newIdeaWorkgroupId = 0;
				
				try {
					//get the idea we are going to make public
					newIdeaJSON = new JSONObject(ideaString);
					
					if(newIdeaJSON != null) {
						//get the id and workgroup id of the new idea we are adding
						newIdeaId = newIdeaJSON.getLong("id");
						newIdeaWorkgroupId = newIdeaJSON.getLong("workgroupId");
					}
				} catch (JSONException e1) {
					e1.printStackTrace();
				}
				
				//get the latest revision of the public idea basket
				IdeaBasket publicIdeaBasket = getPublicIdeaBasket(new Long(runId), new Long(periodId), new Long(projectId), action, new Long(signedInWorkgroupId), newIdeaId, newIdeaWorkgroupId);
				
				//get the data from the public idea basket
				String dataString = publicIdeaBasket.getData();
				
				try {
					JSONObject dataJSON = new JSONObject(dataString);
					
					//get the ideas in the public idea basket
					JSONArray ideasJSON = dataJSON.getJSONArray("ideas");

					if(newIdeaJSON != null) {
						//value to see if the idea is already in the public idea basket
						boolean ideaAlreadyAdded = false;
						
						/*
						 * make sure the signed in user workgroup id is the same as the
						 * workgroup id field in the idea JSON  
						 */
						if(new Long(signedInWorkgroupId) == newIdeaWorkgroupId) {
							
							/*
							 * loop through all the ideas in the public idea basket
							 * so we can check if this idea is already in the public
							 * idea basket
							 */
							for(int x=0; x<ideasJSON.length(); x++) {
								//get an idea
								JSONObject tempIdea = ideasJSON.getJSONObject(x);
								
								if(tempIdea != null) {
									//get the id and workgroup id
									long tempId = tempIdea.getLong("id");
									long tempWorkgroupId = tempIdea.getLong("workgroupId");
									
									if(newIdeaId == tempId && newIdeaWorkgroupId == tempWorkgroupId) {
										/*
										 * an idea with the same id and workgroup id already exists in the
										 * public idea basket so we will not add it
										 */
										ideaAlreadyAdded = true;
									}
								}
							}
							
							if(!ideaAlreadyAdded) {
								//the idea does not exist in the public idea basket so we will add it
								
								//put the idea into the ideas array of the public idea basket
								ideasJSON.put(newIdeaJSON);
								
								//create a new public idea basket revision
								IdeaBasket publicIdeaBasketRevision = createPublicIdeaBasket(new Long(runId), new Long(periodId), new Long(projectId), dataJSON.toString(), action, new Long(signedInWorkgroupId), newIdeaId, newIdeaWorkgroupId);
								
								//get the string representation
								String publicIdeaBasketRevisionString = publicIdeaBasketRevision.toJSONString();
								
								//return the new public idea basket revision
								response.getWriter().print(publicIdeaBasketRevisionString);
							} else {
								//idea already exists in the public idea basket so we will not add it
								JSONObject errorMessageJSONObject = new JSONObject();
								errorMessageJSONObject.put("errorMessage", "Error: Idea already exists in the public idea basket");
								response.getWriter().print(errorMessageJSONObject.toString());
							}
						} else {
							//workgroup id does not match
							JSONObject errorMessageJSONObject = new JSONObject();
							errorMessageJSONObject.put("errorMessage", "Error: Signed in workgroup id does not match workgroup id in idea");
							response.getWriter().print(errorMessageJSONObject.toString());
						}
					}
				} catch (JSONException e) {
					e.printStackTrace();
				}
			} else {
				//workgroup id does not match
				try {
					JSONObject errorMessageJSONObject = new JSONObject();
					errorMessageJSONObject.put("errorMessage", "Error: Signed in workgroup id does not match workgroup id they claim to be");
					response.getWriter().print(errorMessageJSONObject.toString());
				} catch (JSONException e) {
					e.printStackTrace();
				}
			}
		} else if(action.equals("editPublicIdea")) {
			
		} else if(action.equals("deletePublicIdea")) {
			//delete a public idea from the public idea basket and save a new revision
			
			//make sure the signed in user is allowed to perform this delete public idea request
			if(isAllowedToModifyPublicIdeaBasket(new Boolean(isPrivileged), new Long(signedInWorkgroupId), new Long(workgroupId))) {
				//get the latest revision of the public idea basket
				IdeaBasket publicIdeaBasket = getPublicIdeaBasket(new Long(runId), new Long(periodId), new Long(projectId), action, new Long(signedInWorkgroupId), new Long(ideaId), new Long(workgroupId));
				
				//get the data
				String dataString = publicIdeaBasket.getData();
				
				try {
					boolean ideaDeleted = false;
					
					//get the data as a JSON object
					JSONObject dataJSON = new JSONObject(dataString);
					
					//get the ideas
					JSONArray ideasJSON = dataJSON.getJSONArray("ideas");
					
					if(ideasJSON != null) {
						//loop through all the ideas
						for(int x=0; x<ideasJSON.length(); x++) {
							//get an idea
							JSONObject idea = ideasJSON.getJSONObject(x);
							
							//get the id and workgroup id from the idea
							long tempId = idea.getLong("id");
							long tempWorkgroupId = idea.getLong("workgroupId");
							
							if(new Long(ideaId) == tempId && new Long(workgroupId) == tempWorkgroupId) {
								//the idea id and workgroup id match so we will remove this idea
								JSONObject removedIdea = (JSONObject) ideasJSON.remove(x);
								
								//get the array of deleted ideas
								JSONArray deleted = dataJSON.getJSONArray("deleted");
								
								//put the removed idea into the deleted array
								deleted.put(removedIdea);
								
								/*
								 * move the counter back one so that it checks every idea.
								 * this will make it so we delete all ideas with the given
								 * idea id and workgroup id just to be safe even though there
								 * shouldn't be multiple ideas with the same idea id and
								 * workgroup id.
								 */
								x--;
								
								ideaDeleted = true;
							}
						}					
					}
					
					if(ideaDeleted) {
						//we have found and deleted the public idea
						
						//create a new public idea basket revision
						IdeaBasket publicIdeaBasketRevision = createPublicIdeaBasket(new Long(runId), new Long(periodId), new Long(projectId), dataJSON.toString(), action, new Long(signedInWorkgroupId), new Long(ideaId), new Long(workgroupId));
						
						//get the string representation
						String publicIdeaBasketRevisionString = publicIdeaBasketRevision.toJSONString();
						
						//return the new public idea basket revision
						response.getWriter().print(publicIdeaBasketRevisionString);
					} else {
						//we did not find the public idea we wanted to delete
						JSONObject errorMessageJSONObject = new JSONObject();
						errorMessageJSONObject.put("errorMessage", "Error: Idea was not found in the public idea basket");
						response.getWriter().print(errorMessageJSONObject.toString());
					}
				} catch (JSONException e) {
					e.printStackTrace();
				}
			} else {
				//user is not allowed to delete this public idea
				try {
					JSONObject errorMessageJSONObject = new JSONObject();
					errorMessageJSONObject.put("errorMessage", "Error: Signed in workgroup is not allowed to delete this public idea");
					response.getWriter().print(errorMessageJSONObject.toString());
				} catch (JSONException e) {
					e.printStackTrace();
				}
			}
		} else if(action.equals("copyPublicIdea")) {
			/*
			 * a user is copying a public idea so we will add that user to the list of users
			 * who have copied that idea
			 */
			
			//get the latest revision of the public idea basket
			IdeaBasket publicIdeaBasket = getPublicIdeaBasket(new Long(runId), new Long(periodId), new Long(projectId), action, new Long(signedInWorkgroupId), new Long(ideaId), new Long(workgroupId));
			
			//get the data
			String dataString = publicIdeaBasket.getData();
			
			try {
				boolean foundPublicIdea = false;
				boolean ideaCopied = false;
				boolean previouslyCopied = false;
				
				//get the data as a JSON object
				JSONObject dataJSON = new JSONObject(dataString);
				
				//get the ideas
				JSONArray ideasJSON = dataJSON.getJSONArray("ideas");
				
				if(ideasJSON != null) {
					//loop through all the ideas
					for(int x=0; x<ideasJSON.length(); x++) {
						//get an idea
						JSONObject idea = ideasJSON.getJSONObject(x);
						
						//get the id and workgroup id from the idea
						long tempId = idea.getLong("id");
						long tempWorkgroupId = idea.getLong("workgroupId");
						
						if(new Long(ideaId) == tempId && new Long(workgroupId) == tempWorkgroupId) {
							//we have found the public idea that is being copied
							foundPublicIdea = true;
							
							//create the array of workgroup ids that have copied if it does not exist
							if(idea.isNull("workgroupIdsThatHaveCopied")) {
								idea.put("workgroupIdsThatHaveCopied", new JSONArray());
							}
							
							//get the array of workgroups that have copied this idea
							JSONArray workgroupIdsThatHaveCopied = idea.getJSONArray("workgroupIdsThatHaveCopied");
							
							//check if the signed in workgroup id is already in this array
							for(int y=0; y<workgroupIdsThatHaveCopied.length(); y++) {
								long workgroupIdThatHasCopied = workgroupIdsThatHaveCopied.getLong(y);
								
								if(new Long(signedInWorkgroupId) == workgroupIdThatHasCopied) {
									/*
									 * we found the signed in workgroup id in the array which
									 * means the workgroup has previously copied this idea
									 * so we will not need to copy it again
									 */
									previouslyCopied = true;
								}
							}
							
							if(!previouslyCopied) {
								/*
								 * the workgroup has not previously copied this idea so we will
								 * add this workgroup to the array of workgroups that have copied 
								 * this idea 
								 */
								workgroupIdsThatHaveCopied.put(new Long(signedInWorkgroupId));
								ideaCopied = true;								
							}
						}
					}					
				}
				
				if(ideaCopied) {
					//create a new public idea basket revision
					IdeaBasket publicIdeaBasketRevision = createPublicIdeaBasket(new Long(runId), new Long(periodId), new Long(projectId), dataJSON.toString(), action, new Long(signedInWorkgroupId), new Long(ideaId), new Long(workgroupId));

					//get the string representation
					String publicIdeaBasketRevisionString = publicIdeaBasketRevision.toJSONString();

					//return the new public idea basket revision
					response.getWriter().print(publicIdeaBasketRevisionString);
				} else if(previouslyCopied) {
					//the signed in workgroup has previously copied the public idea before
					JSONObject publicIdeaBasketJSONObject = publicIdeaBasket.toJSONObject();
					publicIdeaBasketJSONObject.put("errorMessage", "Error: You have already copied this public idea");
					response.getWriter().print(publicIdeaBasketJSONObject.toString());
				} else if(!foundPublicIdea) {
					//the public idea with the given id and workgroupId was not found
					JSONObject errorMessageJSONObject = new JSONObject();
					errorMessageJSONObject.put("errorMessage", "Error: Did not find public idea with id=" + ideaId + " and workgroupId=" + workgroupId);
					response.getWriter().print(errorMessageJSONObject.toString());
				}
			} catch (JSONException e) {
				e.printStackTrace();
			}
		} else if(action.equals("uncopyPublicIdea")) {
			/*
			 * a user is uncopying a public idea so we will remove that user from the list of users
			 * who have copied that idea
			 */
			
			//get the latest revision of the public idea basket
			IdeaBasket publicIdeaBasket = getPublicIdeaBasket(new Long(runId), new Long(periodId), new Long(projectId), action, new Long(signedInWorkgroupId), new Long(ideaId), new Long(workgroupId));
			
			//get the data
			String dataString = publicIdeaBasket.getData();
			
			try {
				boolean publicIdeaBasketChanged = false;
				boolean foundPublicIdea = false;
				boolean previouslyCopied = false;
				
				//get the data as a JSON object
				JSONObject dataJSON = new JSONObject(dataString);
				
				//get the ideas
				JSONArray ideasJSON = dataJSON.getJSONArray("ideas");
				
				if(ideasJSON != null) {
					//loop through all the ideas
					for(int x=0; x<ideasJSON.length(); x++) {
						//get an idea
						JSONObject idea = ideasJSON.getJSONObject(x);
						
						//get the id and workgroup id from the idea
						long tempId = idea.getLong("id");
						long tempWorkgroupId = idea.getLong("workgroupId");
						
						if(new Long(ideaId) == tempId && new Long(workgroupId) == tempWorkgroupId) {
							//we have found the public idea that is being copied
							foundPublicIdea = true;
							
							//create the array of workgroup ids that have copied if it does not exist
							if(idea.isNull("workgroupIdsThatHaveCopied")) {
								idea.put("workgroupIdsThatHaveCopied", new JSONArray());
							}
							
							//get the array of workgroups that have copied this idea
							JSONArray workgroupIdsThatHaveCopied = idea.getJSONArray("workgroupIdsThatHaveCopied");
							
							//check if the signed in workgroup id is already in this array
							for(int y=0; y<workgroupIdsThatHaveCopied.length(); y++) {
								long workgroupIdThatHasCopied = workgroupIdsThatHaveCopied.getLong(y);
								
								if(new Long(signedInWorkgroupId) == workgroupIdThatHasCopied) {
									/*
									 * we found the signed in workgroup id in the array so
									 * we will remove it. we will also move the counter back
									 * one so that it will keep checking the array for all
									 * instances of the workgroup id even though the workgroup
									 * id should never appear more than once in the array.
									 * this is just to be safe.
									 */
									workgroupIdsThatHaveCopied.remove(y);
									y--;
									publicIdeaBasketChanged = true;
									previouslyCopied = true;
								}
							}
						}
					}					
				}
				
				if(publicIdeaBasketChanged) {
					//create a new public idea basket revision
					IdeaBasket publicIdeaBasketRevision = createPublicIdeaBasket(new Long(runId), new Long(periodId), new Long(projectId), dataJSON.toString(), action, new Long(signedInWorkgroupId), new Long(ideaId), new Long(workgroupId));
					
					//get the string representation
					String publicIdeaBasketRevisionString = publicIdeaBasketRevision.toJSONString();
					
					//return the new public idea basket revision
					response.getWriter().print(publicIdeaBasketRevisionString);
				} else {
					if(!foundPublicIdea) {
						//the public idea with the given id and workgroupId was not found
						JSONObject errorMessageJSONObject = new JSONObject();
						errorMessageJSONObject.put("errorMessage", "Error: Did not find public idea with id=" + ideaId + " and workgroupId=" + workgroupId);
						response.getWriter().print(errorMessageJSONObject.toString());
					} else if(!previouslyCopied) {
						//the signed in workgroup has not previously copied the public idea before
						JSONObject errorMessageJSONObject = new JSONObject();
						errorMessageJSONObject.put("errorMessage", "Error: Signed in workgroup has not previously copied this public idea before");
						response.getWriter().print(errorMessageJSONObject.toString());					
					}
				}
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
	}

	public void doGet(HttpServletRequest request,
			HttpServletResponse response)
	throws ServletException, IOException {
		//get all the params
		String runId = request.getParameter("runId");
		String workgroupId = request.getParameter("workgroupId");
		String action = request.getParameter("action");
		String periodId = (String) request.getParameter("periodId");
		
		String signedInWorkgroupId = (String) request.getAttribute("signedInWorkgroupId");
		String projectId = (String) request.getAttribute("projectId");
		boolean isPrivileged = (Boolean) request.getAttribute("isPrivileged");
		
		if(action.equals("getIdeaBasket")) {
			if(runId != null && signedInWorkgroupId != null) {
				//get the IdeaBasket
				IdeaBasket ideaBasket = IdeaBasket.getIdeaBasketByRunIdWorkgroupId(new Long(runId), new Long(signedInWorkgroupId));
				
				if(ideaBasket == null) {
					//make the IdeaBasket if it does not exist
					ideaBasket = new IdeaBasket(new Long(runId), new Long(periodId), new Long(projectId), new Long(signedInWorkgroupId));
					ideaBasket.saveOrUpdate();
				}
				
				//get the IdeaBasket JSONString
				String ideaBasketJSONString = ideaBasket.toJSONString();
				response.getWriter().print(ideaBasketJSONString);
			}
		} else if(action.equals("getAllIdeaBaskets")) {
			if(isPrivileged) {
				//get all the idea baskets for a run
				List<IdeaBasket> latestIdeaBasketsForRunId = IdeaBasket.getLatestIdeaBasketsForRunId(new Long(runId));
				
				//convert the list to a JSONArray
				JSONArray ideaBaskets = ideaBasketListToJSONArray(latestIdeaBasketsForRunId);
				
				//return the JSONArray of idea baskets as a string
				String ideaBasketsJSONString = ideaBaskets.toString();
				response.getWriter().print(ideaBasketsJSONString);
			} else {
				response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "You are not authorized to access this page");
			}
		} else if(action.equals("getIdeaBasketsByWorkgroupIds")) {
			//get the JSONArray of workgroup ids
			String workgroupIdsJSONArrayStr = request.getParameter("workgroupIds");
			
			try {
				JSONArray workgroupIdsJSONArray = new JSONArray(workgroupIdsJSONArrayStr);
				
				List<Long> workgroupIds = new ArrayList<Long>();
				
				//loop through all the workgroup ids
				for(int x=0; x<workgroupIdsJSONArray.length(); x++) {
					//add the workgroup id to the list
					long workgroupIdToGet = workgroupIdsJSONArray.getLong(x);
					workgroupIds.add(workgroupIdToGet);
				}
				
				List<IdeaBasket> latestIdeaBasketsForRunIdWorkgroupIds = new ArrayList<IdeaBasket>();
				
				if(workgroupIds.size() > 0) {
					//query for the baskets with the given run and workgroup ids
					latestIdeaBasketsForRunIdWorkgroupIds = IdeaBasket.getLatestIdeaBasketsForRunIdWorkgroupIds(new Long(runId), workgroupIds);					
				}
				
				//convert the list to a JSONArray
				JSONArray ideaBaskets = ideaBasketListToJSONArray(latestIdeaBasketsForRunIdWorkgroupIds);
				
				//return the JSONArray of idea baskets as a string
				String ideaBasketsJSONString = ideaBaskets.toString();
				response.getWriter().print(ideaBasketsJSONString);
			} catch (JSONException e) {
				e.printStackTrace();
			}
		} else if(action.equals("getPublicIdeaBasket")) {
			//get the latest public idea basket revision
			IdeaBasket publicIdeaBasket = getPublicIdeaBasket(new Long(runId), new Long(periodId), new Long(projectId), action, new Long(signedInWorkgroupId), null, null);
			
			//get the JSON string representation of the public idea basket
			String publicIdeaBasketJSONString = publicIdeaBasket.toJSONString();
			
			//return the public idea basket
			response.getWriter().print(publicIdeaBasketJSONString);
		}
	}
	
	/**
	 * Check if the signed in user is allowed to modify the public idea basket
	 * @param isPrivileged whether the user is an admin or teacher
	 * @param signedInWorkgroupId the signed in workgroup id retrieved from the server
	 * @param workgroupId the workgroup id retrieved from the user
	 * @return whether the signed in user can modify the public idea basket
	 */
	private boolean isAllowedToModifyPublicIdeaBasket(boolean isPrivileged, long signedInWorkgroupId, long workgroupId) {
		boolean result = false;
		
		if(isPrivileged || signedInWorkgroupId == workgroupId) {
			result = true;
		}
		
		return result;
	}
	
	/**
	 * Get the latest public idea basket revision for the given run id, period id, project id.
	 * If it does not exist it will be created.
	 * @param runId the run id
	 * @param periodId the period id
	 * @param projectId the project id
	 * @return the public idea basket for the given arguments
	 */
	private IdeaBasket getPublicIdeaBasket(Long runId, Long periodId, Long projectId, String action, Long actionPerformer, Long ideaId, Long ideaWorkgroupId) {
		//try to retrieve the latest public idea basket revision from the database
		IdeaBasket publicIdeaBasket = IdeaBasket.getPublicIdeaBasketForRunIdPeriodId(runId, periodId);
		
		if(publicIdeaBasket == null) {
			//the public idea basket does not exist so we will make it
			publicIdeaBasket = createPublicIdeaBasket(runId, periodId, projectId, null, action, actionPerformer, ideaId, ideaWorkgroupId);
		}
		
		return publicIdeaBasket;
	}
	
	/**
	 * Create a new public idea basket revision
	 * @param runId the run id
	 * @param periodId the period id
	 * @param projectId the project id
	 * @return a public idea basket revision
	 */
	private IdeaBasket createPublicIdeaBasket(Long runId, Long periodId, Long projectId, String dataString, String action, Long actionPerformer, Long ideaId, Long ideaWorkgroupId) {
		IdeaBasket publicIdeaBasket = null;
		
		if(dataString == null) {
			//the data string was not provided so we will create it with default values
			try {
				//make the data for the public idea basket revision
				JSONObject dataJSONObject = new JSONObject();
				dataJSONObject.put("ideas", new JSONArray());
				dataJSONObject.put("deleted", new JSONArray());
				dataJSONObject.put("nextIdeaId", JSONObject.NULL);
				dataJSONObject.put("version", 2); //might want to set this to 2 or 3
				dataJSONObject.put("settings", JSONObject.NULL);
				
				//get the data as a string
				dataString = dataJSONObject.toString();
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		
		//create the new public idea basket revision
		publicIdeaBasket = new IdeaBasket(runId, periodId, projectId, -1, dataString, true, action, actionPerformer, ideaId, ideaWorkgroupId);
		
		//save the public idea basket revision to the database
		publicIdeaBasket.saveOrUpdate();
		
		return publicIdeaBasket;
	}
	
	/**
	 * Turns a list of IdeaBaskets into a JSONArray
	 * @param ideaBasketsList a list containing IdeaBaskets
	 * @return a JSONArray containing the idea baskets
	 */
	private JSONArray ideaBasketListToJSONArray(List<IdeaBasket> ideaBasketsList) {
		JSONArray ideaBaskets = new JSONArray();
		
		//loop through all the idea baskets
		for(int x=0; x<ideaBasketsList.size(); x++) {
			//get an idea basket
			IdeaBasket ideaBasket = ideaBasketsList.get(x);
			
			try {
				//add the idea basket to our JSONArray
				JSONObject ideaBasketJSONObj = new JSONObject(ideaBasket.toJSONString());
				ideaBaskets.put(ideaBasketJSONObj);
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		
		return ideaBaskets;
	}
}
