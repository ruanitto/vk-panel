"use strict";

/**
 * vk_panel namespace.
 */
if ("undefined" == typeof(vk_panel)) {
  var vk_panel = {};
};

vk_panel.sibPref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);

vk_panel.BrowserOverlay = {

  resizePanel: function(){ //resize the panel with the preference %.
    var panelWidth = vk_panel.sibPref.getIntPref("extensions.vk_panel.panelWidth")/100;
    var panelHeight = vk_panel.sibPref.getIntPref("extensions.vk_panel.panelHeight")/100;
    var panel = document.getElementById("vk_panel-panel");
    panel.sizeTo(window.screen.availWidth*panelWidth,window.screen.availHeight*panelHeight);
  },

  setFavicon: function (){ //This function set the button's image with the favicon of vk Web (change with unread messages).
    var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                     .getInterface(Components.interfaces.nsIWebNavigation)
                     .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                     .rootTreeItem
                     .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                     .getInterface(Components.interfaces.nsIDOMWindow);

    var vkButton = mainWindow.document.getElementById("vk_panel-toolbar-button");
    var vkIFrame = mainWindow.document.getElementById("vk_panel-iframe").contentDocument;

    try{
      var faviconUrl = vkIFrame.getElementById("favicon").href;
      vkButton.setAttribute("image",faviconUrl);
    }catch(e){
      //do nothing.
    };
  },

  setvkIframe: function(){ //set the iframe src.
    var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                     .getInterface(Components.interfaces.nsIWebNavigation)
                     .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                     .rootTreeItem
                     .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                     .getInterface(Components.interfaces.nsIDOMWindow);

    var vkIframe = mainWindow.document.getElementById("vk_panel-iframe");
    vkIframe.webNavigation.loadURI('https://m.vk.com/',Components.interfaces.nsIWebNavigation,null,null,null);

  },

  pinvkPanel: function (){
    var panel = document.getElementById("vk_panel-panel");
    var noautohide = vk_panel.sibPref.getBoolPref("extensions.vk_panel.noautohide");
    panel.setAttribute("noautohide", noautohide);
    var pinButton = document.getElementById("vk_panel-toolbarButton_pin");
    pinButton.checked = noautohide;
  },

  changePinMode: function (){
    var pinMode = document.getElementById("vk_panel-toolbarButton_pin").checked;
    vk_panel.sibPref.setBoolPref("extensions.vk_panel.noautohide", pinMode);
    vk_panel.BrowserOverlay.pinvkPanel();
    //Need to close and reopen the panel to make the change take effect.
    var panel = document.getElementById("vk_panel-panel");
    panel.hidePopup();
    var button = document.getElementById("vk_panel-toolbar-button");
    panel.openPopup(button, "", 0, 0, false, false);
  },

  autoHideToolbar: function (){
    var panelToolbar = document.getElementById("vk_panel-panel-toolbar");
    var toolbarAutoHide = vk_panel.sibPref.getBoolPref("extensions.vk_panel.toolbarAutoHide");
    if(toolbarAutoHide){
      panelToolbar.classList.add("vk_panel-toolbar-class-hide");
      panelToolbar.classList.remove("vk_panel-toolbar-class-show");
    }else{
      panelToolbar.classList.add("vk_panel-toolbar-class-show");
      panelToolbar.classList.remove("vk_panel-toolbar-class-hide");
    };
    var autoHideButton = document.getElementById("vk_panel-toolbarButton_autoHide");
    autoHideButton.checked = toolbarAutoHide;
  },

  changeAutoHideMode: function (){
    var pinMode = document.getElementById("vk_panel-toolbarButton_autoHide").checked;
    vk_panel.sibPref.setBoolPref("extensions.vk_panel.toolbarAutoHide", pinMode);
    vk_panel.BrowserOverlay.autoHideToolbar();
    //Need to close and reopen the panel to make the change take effect.
    var panel = document.getElementById("vk_panel-panel");
    panel.hidePopup();
    var button = document.getElementById("vk_panel-toolbar-button");
    panel.openPopup(button, "", 0, 0, false, false);
  },

  openvkPanel: function (){
    window.clearTimeout(vk_panel.delayFirstRunTimeOut);
    window.clearTimeout(vk_panel.refreshTime);

    vk_panel.BrowserOverlay.resizePanel();
    vk_panel.BrowserOverlay.setFavicon();
    vk_panel.BrowserOverlay.pinvkPanel();
    vk_panel.BrowserOverlay.autoHideToolbar();

    var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                     .getInterface(Components.interfaces.nsIWebNavigation)
                     .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                     .rootTreeItem
                     .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                     .getInterface(Components.interfaces.nsIDOMWindow);

    var vkIframe = mainWindow.document.getElementById("vk_panel-iframe");
    if(vkIframe.src == "chrome://vk_panel/content/vk-loading.xul"){
      //if the user opens the panel before it is loaded for the first time, I load it.
      //if it's loaded, I do nothing, because it's pretty annoying loading every time you open the panel because the load has a little delay. Also, you might lose information.
      vk_panel.BrowserOverlay.setvkIframe();
    };

  },

  closevkPanel: function (){
    vk_panel.BrowserOverlay.setFavicon();
    vk_panel.refreshTime = setInterval(function() { vk_panel.BrowserOverlay.setFavicon(); },
            vk_panel.sibPref.getIntPref("extensions.vk_panel.faviconRefreshTime")*
            30*
            1000); //Refresh the button's image with de vk Web's favicon every 30 seconds.
  },

  installButton: function(toolbarId, id){
    if (!document.getElementById(id)){
        var toolbar = document.getElementById(toolbarId);
        var before = null;
        toolbar.insertItem(id, before);
        toolbar.setAttribute("currentset", toolbar.currentSet);
        document.persist(toolbar.id, "currentset");
    };
  },

  vk_panelShortcut_cmd: function(){ //opens the panel with the shortcut.
    var panel = document.getElementById("vk_panel-panel");
    var button = document.getElementById("vk_panel-toolbar-button");
    if(panel.state == "closed"){
      panel.openPopup(button, "", 0, 0, false, false);
    }else{
      panel.hidePopup();
    };
  },

  initKeyset: function(){ //On Firefox loads sets the shortcut keys.
    var modifiers = vk_panel.sibPref.getCharPref("extensions.vk_panel.modfiers");
    var key = vk_panel.sibPref.getCharPref("extensions.vk_panel.key");
    var keyset = document.getElementById("vk_panel-shortcut_cmd");
    keyset.setAttribute("modifiers",modifiers);
    keyset.setAttribute("key",key);
  },

  onFirefoxLoad: function(event){
    var isFirstRunPref = vk_panel.sibPref.getBoolPref("extensions.vk_panel.isFirstRun");
    if (isFirstRunPref){
      vk_panel.BrowserOverlay.installButton("nav-bar", "vk_panel-toolbar-button");
      vk_panel.sibPref.setBoolPref("extensions.vk_panel.isFirstRun", false);
    };
    vk_panel.BrowserOverlay.initKeyset(); //initiate the button's keyboard shortcut.
  },

};

window.addEventListener("load", function onFirefoxLoadEvent() {
  window.removeEventListener("load", onFirefoxLoadEvent, false); // remove listener, no longer needed
  vk_panel.BrowserOverlay.onFirefoxLoad();
  }, false);

vk_panel.delayFirstRunTimeOut = setTimeout(function() {vk_panel.BrowserOverlay.setvkIframe(); },
           vk_panel.sibPref.getIntPref("extensions.vk_panel.delayFirstRun")*
           1000); //Delay the first panel load.

vk_panel.refreshTime = setInterval(function() { vk_panel.BrowserOverlay.setFavicon(); },
            vk_panel.sibPref.getIntPref("extensions.vk_panel.faviconRefreshTime")*
            30*
            1000); //Refresh the button's image with de vk Web's favicon every 30 seconds.
