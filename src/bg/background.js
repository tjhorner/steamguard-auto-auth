chrome.runtime.onInstalled.addListener(function(object){
  chrome.tabs.create({ url: chrome.extension.getURL("welcome/index.html") }, function(tab){
    console.log("Extension just installed, tab:", tab);
  });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  if(request.action === "ajax"){
    ajax(request.method, request.url, request.params, function(data){
      sendResponse(data);
    });
    return true;
  }
});

function ajax(method, url, params, callback) {
  chrome.identity.getAuthToken({ interactive: true }, function(token){
    $.ajax({
      url: url,
      type: method,
      headers: {
        "Authorization": "Bearer " + token
      },
      data: params,
      success: callback,
      error: callback
    });
  });
}
