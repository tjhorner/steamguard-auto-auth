var ajax = function(method, url, params, callback){
	chrome.runtime.sendMessage({
		action: "ajax",
		method: method,
		url: url,
		params: params
	}, callback);
};

var atob2 = function(string){
	string = string.replace(/\-/gi, "+").replace(/\_/gi, "/");
	return atob(string);
};

var getMessages = function(callback){
	ajax("GET", "https://www.googleapis.com/gmail/v1/users/me/messages", {}, callback);
};

var getMessage = function(messageId, callback){
	ajax("GET", "https://www.googleapis.com/gmail/v1/users/me/messages/" + messageId, { format: "full" }, callback);
};

var getLatestMessage = function(callback){
	getMessages(function(res){
		getMessage(res.messages[0].id, function(message){
			callback(message);
		});
	});
};

var getMessageDom = function(message, callback){
	if(message.payload && message.payload.parts){
		message.payload.parts.forEach(function(part){
			if(part.mimeType === "text/html"){
				callback($(atob2(part.body.data)));
			}
		});
	}
};

var checkForCode = function(callback){
	getLatestMessage(function(msg){
		getMessageDom(msg, function($dom){
			$.each($dom.find("span"), function(i, e){
				var $e = $(e);
				if($e.text().length === 5){
					console.log("assumed access code:", $e.text());
					callback($e.text());
				}
			});
		});
	});
};

var startMessageListener = function(callback){
	// lol, callbacks
	console.log("Message listener started up!");
	var listener = setInterval(function(){
		checkForCode(function(code){
			callback(code);
			clearInterval(listener);
		});
	}, 5000);
};

var authCodeObserver = new WebKitMutationObserver(function(m) {
  m.forEach(function(mutation) {
		if(mutation.target.className === "login_modal loginAuthCodeModal") {
			console.log("Auth modal popped up, triggering email listener.");
			$("#authcode").attr("placeholder", "waiting for steam email...").prop("disabled", true);
			$("#auth_buttonsets, #auth_details_computer_name").hide();
			startMessageListener(function(code){
				$("#authcode").val(code);
				$(".auth_button.leftbtn").click();
			});
		}
  });
});

authCodeObserver.observe(document.body, { subtree: true, attributes: true });
