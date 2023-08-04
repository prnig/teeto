chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "executeScript") {
    chrome.tabs.executeScript(null, {code: request.script}, function(results) {
      sendResponse({results: results[0]});
    });
    return true; // indicate we will send the response asynchronously
  } else if (request.action === "fetchUrl") {
    fetch(request.url)
      .then(response => response.text())
      .then(text => sendResponse({text}))
      .catch(error => sendResponse({error: error.toString()}));
    return true; // indicate we will send the response asynchronously
  } else if (request.action === "analyzeEndpoints") {
    // TODO: Perform any additional analysis on the endpoints
    console.log('Endpoints:', request.endpoints);
    sendResponse({message: "Endpoints received"});
  }
});
