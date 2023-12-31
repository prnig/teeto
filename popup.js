document.getElementById('find-endpoints').addEventListener('click', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.executeScript(
      tabs[0].id,
      {file: 'endpoint_finder.js'}
    );
  });
});

document.getElementById('copy-all').addEventListener('click', function() {
  chrome.storage.local.get(['endpoints'], function(result) {
    var text = result.endpoints.map(e => e.endpoint).join('\n');
    navigator.clipboard.writeText(text).then(function() {
      alert('URLs copied to clipboard!');
    });
  });
});

document.getElementById('clear-results').addEventListener('click', function() {
  chrome.storage.local.set({endpoints: []}, function() {
    document.getElementById('results').textContent = '';
    document.getElementById('copy-all').style.display = 'none';
    document.getElementById('clear-results').style.display = 'none';
  });
});

function appendEndpointToResultsDiv(endpointObj, resultsDiv) {
  var endpointElement = document.createElement('div');
  endpointElement.style.border = "1px solid #ddd";
  endpointElement.style.padding = "10px";
  endpointElement.style.marginBottom = "10px";
  endpointElement.style.borderRadius = "5px";
  
  var a = document.createElement('a');
  a.textContent = endpointObj.endpoint;
  a.href = "#";
  a.style.textDecoration = "none";
  a.style.color = "red";
  a.style.marginRight = "10px";
  a.addEventListener('click', function(e) {
    e.preventDefault();
    chrome.tabs.create({url: endpointObj.endpoint});
  });

  var sourceLink = document.createElement('a');
  sourceLink.textContent = '(found in ' + endpointObj.source + ')';
  sourceLink.href = endpointObj.source;
  sourceLink.target = "_blank";
  sourceLink.style.color = "gray";

  endpointElement.appendChild(a);
  endpointElement.appendChild(sourceLink);

  resultsDiv.appendChild(endpointElement);
}

// load previous results
chrome.storage.local.get(['endpoints'], function(result) {
  var resultsDiv = document.getElementById('results');
  if (result.endpoints && result.endpoints.length > 0) {
    resultsDiv.style.display = 'block';
    document.getElementById('copy-all').style.display = 'block';
    document.getElementById('clear-results').style.display = 'block';
    result.endpoints.forEach(function(endpointObj) {
      appendEndpointToResultsDiv(endpointObj, resultsDiv);
    });
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "returnResults") {
    var resultsDiv = document.getElementById('results');
    resultsDiv.textContent = '';
    resultsDiv.style.display = 'block';
    document.getElementById('copy-all').style.display = 'block';
    document.getElementById('clear-results').style.display = 'block';
    let uniqueEndpoints = Array.from(new Set(request.data.map(JSON.stringify))).map(JSON.parse);
    chrome.storage.local.set({endpoints: uniqueEndpoints}, function() {
      uniqueEndpoints.forEach(function(endpointObj) {
        appendEndpointToResultsDiv(endpointObj, resultsDiv);
      });
    });
  }
});
