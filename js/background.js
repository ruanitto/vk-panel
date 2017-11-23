var Ext={
	os:null,
	version:null,
	win:"Ctrl+Shift+V",
	mac:"Ctrl+Shift+V",
	gotPlatformInfo:function(info){
		Ext.os=info.os;
		browser.runtime.getBrowserInfo(Ext.gotBrowserInfo);
	},
	gotBrowserInfo:function(info){
	  Ext.version=info.version; 
	  if(parseInt(Ext.version.split(".")[0])<57){
		  chrome.tabs.executeScript(null,{code:'alert("Please use '+(Ext.os=="mac" ? Ext.mac : Ext.win)+' combination to open up Painel for Messenger.\\n\\nThis is a limitation for the current Firefox '+Ext.version+' and it will resolve itself for upcoming Firefox 57. Sorry for inconvenience!");'});
	  }
	}	
}

chrome.webRequest.onHeadersReceived.addListener(
    function(info) {
        var headers = info.responseHeaders;
		if(info.documentUrl==chrome.extension.getURL('html/sidebar.html') || info.documentUrl==chrome.extension.getURL('html/popup.html')){
			for (var i = headers.length - 1; i >= 0; --i) {
				var header = headers[i].name.toLowerCase();
				if (header == "frame-options" || header == "x-frame-options" || header ==='content-security-policy') {
					headers.splice(i, 1);
				}
			}			
		}
        return { responseHeaders: headers };
    }, {
        urls: ["<all_urls>"],
        types: ["sub_frame"]
    }, ["blocking", "responseHeaders"]
);

var sidebar = browser.extension.getURL("/html/sidebar.html");

function toggle(panel) {
  if (panel !== sidebar) {
    browser.sidebarAction.setPanel({panel: sidebar});
  }
}

function onGot(sidebarUrl) {
  if (sidebarUrl==sidebar) browser.sidebarAction.close();
}

browser.browserAction.onClicked.addListener(() => {
	chrome.runtime.getPlatformInfo(Ext.gotPlatformInfo);
	if(browser.sidebarAction.open) browser.sidebarAction.open();
});