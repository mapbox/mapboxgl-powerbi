Overview over scanjs rules and how we realized them as eslint functionality:
 
 
setTimeout, setInterval:
  no-implied-eval rule

eval:
  no-eval rule
  
new Function, setImmediate, execScript, crypto.generateCRMFRequest:
  https://github.com/eslint/eslint/issues/2873
 
outerHTML ",.innerHTML ",  insertAdjacentHTML()",
  no-unsafe-innerHTML
                           
document.write/document.writeln
  https://github.com/mozfreddyb/eslint-plugin-no-unsafe-innerhtml/issues/2

                                                      

                                                   
should just warn/highlight:
    "source": "$_any.createContextualFragment", // should justwarn
    "source": "$_any.location=$_unsafe", // should remove "$_any."
    "source": "$_any.href=$_unsafe",
    "source": "$_any.pathname=$_unsafe",
    "source": "$_any.search=$_unsafe",
    "source": "$_any.protocol=$_unsafe",
    "source": "$_any.hostname=$_unsafe",
    "source": "$_any.src=$_unsafe",
    "source": "$_any.addEventListener()",
    "source": "$_any.addEventListener('message')",
    "source": "onmessage=$_any",
    "source": "$_any.indexedDB",
    "source": "$_any.localStorage",
    "source": "$_any.sessionStorage",
    "source": "$_any.parseFromString()",
    "source": "new MozActivity()",
    "source": "$_any.mozSetMessageHandler('activity')",
    "source": "$_any.mozSetMessageHandler()",
    "source": "navigator.getDataStores",
    "source": "$_any.connect()",
    "source": "$_any.setMessageHandler('connect')",
    "source": "navigator.mozAlarms",
    "source": "window.open($_any, $_any, 'attention')",
    "source": "navigator.getUserMedia",
    "testhit": "navigator.getUserMedia({audio:true});",
    "source": "$_any.mozAudioChannelType=$_any",
    "source": "$_any.addEventListener('deviceproximity', callback)",
    "source": "navigator.mozBluetooth", // without navigator
    "source": "$_any.setAttribute('mozbrowser')",
    "source": "$_any.mozCameras",
    "source": "$_any.addEventListener('cellbroadcastmsgchanged')", 
    // covered in addeventlistener?
    "source": "$_any.mozContacts",
    "source": "new Notification()",
    "source": "$_any.getDeviceStorage" // call and others
    "source": "navigator.mozDownloadManager",
    "source": "$_any.setAttribute('mozapp')",
    "testhit": "browser.setAttribute('mozapp', config.manifestURL);",
    "testmiss": "",
    "desc": "Usage of sensitive API",
    "threat": "Certified API"
  },
  {
    "name": "fmradio permission",
    "source": "navigator.mozFMRadio",
    "testhit": "navigator.mozFMRadio",
    "testmiss": "",
    "desc": "This function is only available to higher privileged Firefox OS applications.",
    "threat": "Certified API"
  },
  {
    "name": "geolocation permission",
    "source": "navigator.geolocation",
    "testhit": "var geolocation = navigator.geolocation;",
    "testmiss": "",
    "desc": "This function gives access to information about the user's location.",
    "threat": ""
  },
  {
    "name": "idle permission",
    "source": "navigator.addIdleObserver",
    "testhit": "navigator.addIdleObserver",
    "testmiss": "",
    "desc": "This function is only available to higher privileged Firefox OS applications.",
    "threat": ""
  },
  {
    "name": "input permission",
    "source": "navigator.mozInputMethod",
    "testhit": "window.navigator.mozInputMethod",
    "testmiss": "",
    "desc": "Usage of sensitive API",
    "threat": ""
  },
  {
    "name": "input-manage permission",
    "source": "$_any.mgmt.hide()",
    "testhit": "navigator.mozInputMethod.mgmt.hide()",
    "testmiss": "",
    "desc": "Usage of sensitive API",
    "threat": "Certified API"
  },
  {
    "name": "mobileconnection permission",
    "source": "navigator.mozMobileConnections",
    "testhit": "navigator.mozMobileConnections",
    "testmiss": "",
    "desc": "Usage of sensitive API",
    "threat": "Certified API"
  },
  {
    "name": "mobilenetwork permission",
    "source": "$_any.lastKnownHomeNetwork",
    "testhit": "connection.lastKnownHomeNetwork && connection.lastKnownNetwork",
    "testmiss": "",
    "desc": "Usage of sensitive API",
    "threat": ""
  },
  {
    "name": "mobilenetwork permission",
    "source": "$_any.lastKnownNetwork",
    "testhit": "connection.lastKnownHomeNetwork && connection.lastKnownNetwork",
    "testmiss": "",
    "desc": "Usage of sensitive API",
    "threat": ""
  },
  {
    "name": "network-events permission",
    "source": "$_any.addEventListener('moznetworkupload')",
    "testhit": "window.addEventListener('moznetworkupload', uploadHandler);",
    "testmiss": "window.addEventListener('moznetworkdownload', downloadHandler);",
    "desc": "Usage of sensitive API",
    "threat": "Certified API"
  },
  {
    "name": "network-events permission",
    "source": "$_any.addEventListener('moznetworkdownload')",
    "testhit": "window.addEventListener('moznetworkdownload', downloadHandler);",
    "testmiss": "window.addEventListener('moznetworkupload', uploadHandler);",
    "desc": "Usage of sensitive API",
    "threat": "Certified API"
  },
  {
    "name": "networkstats-manage permission",
    "source": "navigator.mozNetworkStats",
    "testhit": "var networks = navigator.mozNetworkStats.getAvailableNetworks();",
    "testmiss": "",
    "desc": "Usage of sensitive API",
    "threat": "Certified API"
  },
  {
    "name": "nfc permission",
    "source": "navigator.mozNfc",
    "testhit": "navigator.mozNfc",
    "testmiss": "",
    "desc": "Usage of sensitive API",
    "threat": ""
  },
  {
    "name": "open-remote-window permission",
    "source": "window.open($_any,$_any, 'remote=true');",
    "testhit": "window.open(target.dataset.url, '_blank', 'remote=true');",
    "testmiss": "",
    "desc": "Not sure if testhit example is right here..",
    "threat": "Certified API"
  },
  {
    "name": "permissions permission",
    "source": "navigator.mozPermissionSettings",
    "testhit": "var mozPerms = navigator.mozPermissionSettings;",
    "testmiss": "",
    "desc": "This function is only available to higher privileged Firefox OS applications. It allows managing and revoking apps permissions.",
    "threat": "Certified API"
  },
  {
    "name": "phonenumberservice permission",
    "source": "navigator.mozPhoneNumberService",
    "testhit": "var service = navigator.mozPhoneNumberService;",
    "testmiss": "",
    "desc": "Usage of sensitive API",
    "threat": ""
  },
  {
    "name": "power permission",
    "source": "navigator.mozPower",
    "testhit": "navigator.mozPower",
    "testmiss": "",
    "desc": "This function is only available to higher privileged Firefox OS applications. It allows access to power management features.",
    "threat": "Certified API"
  },
  {
    "name": "settings permission",
    "source": "navigator.mozSettings",
    "testhit": "window.navigator.mozSettings",
    "testmiss": "",
    "desc": "Usage of sensThis function is only available to higher privileged Firefox OS applications. It allows access to the phone's settingsitive API",
    "threat": "Certified API"
  },
  {
    "name": "sms permission",
    "source": "navigator.mozMobileMessage",
    "testhit": "navigator.mozMobileMessage",
    "testmiss": "",
    "desc": "Usage of sensitive API",
    "threat": "Certified API"
  },
  {
    "name": "speaker-control permission",
    "source": "new MozSpeakerManager()",
    "testhit": "var mgr = new MozSpeakerManager();",
    "testmiss": "",
    "desc": "Usage of sensitive API",
    "threat": ""
  },
  {
    "name": "systemXHR permission",
    "source": "new XMLHttpRequest({mozSystem: true});",
    "testhit": "var xhr = new XMLHttpRequest({mozSystem: true});",
    "testmiss": "",
    "desc": "XMLHttpRequests of type system may contact and read data from third party origins",
    "threat": ""
  },
  {
    "name": "tcp-socket permission",
    "source": "navigator.mozTCPSocket;",
    "testhit": "var TCPSocket = navigator.mozTCPSocket;",
    "testmiss": "",
    "desc": "This function allows creating connections and communicating with remote servers.",
    "threat": ""
  },
  {
    "name": "telephony permission",
    "source": "navigator.mozTelephony",
    "testhit": "navigator.mozTelephony.stopTone(this.serviceId);",
    "testmiss": "",
    "desc": "Usage of sensitive API",
    "threat": "Certified API"
  },
  {
    "name": "time permission",
    "source": "navigator.mozTime",
    "testhit": "_mozTime = window.navigator.mozTime;",
    "testmiss": "",
    "desc": "This function is only available to higher privileged Firefox OS applications.",
    "threat": ""
  },
  {
    "name": "video-capture permission",
    "source": "navigator.getUserMedia",
    "testhit": "navigator.getUserMedia({video:true});",
    "testmiss": "",
    "desc": "This function allows prompting for audio and video recording.",
    "threat": ""
  },
  {
    "name": "voicemail permission",
    "source": "navigator.mozVoicemail",
    "testhit": "var voicemail = navigator.mozVoicemail;",
    "testmiss": "",
    "desc": "This function is only available to higher privileged Firefox OS applications. It allows controlling the phone's Voicemail features.",
    "threat": "Certified API"
  },
  {
    "name": "wappush permission",
    "source": "$_any.mozSetMessageHandler('wappush-received')",
    "testhit": "window.navigator.mozSetMessageHandler('wappush-received', wpm_onWapPushReceived);",
    "testmiss": "",
    "desc": "This specifies a handler for WAP Push notifications. In general, mozSetMessageHandler allows handling WebActivities. The origin of the activity and its data might be untrusted.",
    "threat": ""
  },
  {
    "name": "webapps manage",
    "source": "$_any.mgmt",
    "testhit": "var req = navigator.mozApps.mgmt.getAll();",
    "testmiss": "",
    "desc": "This function is only available to higher privileged Firefox OS applications. It allows managing the phone's app.",
    "threat": ""
  },
  {
    "name": "wifi-manage permission",
    "source": "navigator.mozWifiManager",
    "testhit": "navigator.mozWifiManager",
    "testmiss": "",
    "desc": "This function is only available to higher privileged Firefox OS applications. It allows managing the Wifi features of the phone.",
    "threat": "Certified API"
  },
  {
    "name": "mozkeyboard",
    "source": "navigator.mozKeyboard",
    "testhit": "var keyboard = navigator.mozKeyboard || navigator.mozInputMethod;",
    "testmiss": "",
    "desc": "Usage of sensitive API",
    "threat": ""
  },
  {
    "name": "cell broadcasts",
    "source": "navigator.mozCellBroadcast",
    "testhit": "navigator.mozCellBroadcast.onreceived = this.show.bind(this);",
    "testmiss": "",
    "desc": "Usage of sensitive API",
    "threat": ""
  },
  {
    "name": "mobile connection api",
    "source": "navigator.mozMobileConnection",
    "testhit": "var conn = window.navigator.mozMobileConnection || window.navigator.mozMobileConnections",
    "testmiss": "",
    "desc": "Usage of sensitive API",
    "threat": ""
  },
  {
    "name": "notification api",
    "source": "navigator.mozNotification",
    "testhit": "var notification = navigator.mozNotification.createNotification(title, body, icon);",
    "testmiss": "",
    "desc": "Usage of sensitive API",
    "threat": ""
  },
  {
    "name": "assignment typo",
    "source": "if($_contains('AssignmentExpression'));",
    "testhit": "if(x=y){};",
    "testmiss": "if(x==y){x=0;}",
    "desc": "Unintended use of AssignmentExpression in If Statement",
    "threat": "Typo"
  }
]

```
