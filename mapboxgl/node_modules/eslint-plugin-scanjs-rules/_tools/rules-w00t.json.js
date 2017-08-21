rules = ({call_eval:(function anonymous(context) {
 return {
 "CallExpression": function (node) {
 if ((node.callee.name == 'eval') || ((node.callee.property) && (node.callee.property.name == 'eval'))) {
 context.report(node, "The function eval can be unsafe");
 }
 }
 };

 }), new_Function:(function new_Function(context) {
 return {
 "NewExpression": function (node) {
 if (node.callee.name == 'Function') {
 context.report(node, "The Function constructor can be unsafe");
 }
 }
 };

 }), call_Function:(function call_Function(context) {
 return {
 "CallExpression": function (node) {
 if ((node.callee.name == 'Function') || ((node.callee.property) && (node.callee.property.name == 'Function'))) {
 context.report(node, "The function Function can be unsafe");
 }
 }
 };

 }), call_setTimeout:(function call_setTimeout(context) {
 return {
 "CallExpression": function (node) {
 if ((node.callee.name == 'setTimeout') || ((node.callee.property) && (node.callee.property.name == 'setTimeout'))) {
 context.report(node, "The function setTimeout can be unsafe");
 }
 }
 };

 }), call_setInterval:(function call_setInterval(context) {
 return {
 "CallExpression": function (node) {
 if ((node.callee.name == 'setInterval') || ((node.callee.property) && (node.callee.property.name == 'setInterval'))) {
 context.report(node, "The function setInterval can be unsafe");
 }
 }
 };

 }), call_setImmediate:(function call_setImmediate(context) {
 return {
 "CallExpression": function (node) {
 if ((node.callee.name == 'setImmediate') || ((node.callee.property) && (node.callee.property.name == 'setImmediate'))) {
 context.report(node, "The function setImmediate can be unsafe");
 }
 }
 };

 }), call_execScript:(function call_execScript(context) {
 return {
 "CallExpression": function (node) {
 if ((node.callee.name == 'execScript') || ((node.callee.property) && (node.callee.property.name == 'execScript'))) {
 context.report(node, "The function execScript can be unsafe");
 }
 }
 };

 }), call_generateCRMFRequest:(function call_generateCRMFRequest(context) {
 return {
 "CallExpression": function (node) {
 if ((node.callee.name == 'generateCRMFRequest') || ((node.callee.property) && (node.callee.property.name == 'generateCRMFRequest'))) {
 context.report(node, "The function generateCRMFRequest can be unsafe");
 }
 }
 };

 }), call_write:(function call_write(context) {
 return {
 "CallExpression": function (node) {
 if ((node.callee.name == 'write') || ((node.callee.property) && (node.callee.property.name == 'write'))) {
 context.report(node, "The function write can be unsafe");
 }
 }
 };

 }), call_writeln:(function call_writeln(context) {
 return {
 "CallExpression": function (node) {
 if ((node.callee.name == 'writeln') || ((node.callee.property) && (node.callee.property.name == 'writeln'))) {
 context.report(node, "The function writeln can be unsafe");
 }
 }
 };

 }), assign_to_innerHTML:(function assign_to_innerHTML(context) {
 return {
 "AssignmentExpression:exit": function (node) {
 if ("property" in node.left) { // member assignment, so yeah.
 if (['=', '+='].indexOf(node.operator) !== -1) {
 if (node.left.property.name === 'innerHTML') {
 context.report(node, "Assignment to innerHTML can be unsafe");
 }
 }
 }
 }
 };

 }), assign_to_outerHTML:(function assign_to_outerHTML(context) {
 return {
 "AssignmentExpression:exit": function (node) {
 if ("property" in node.left) { // member assignment, so yeah.
 if (['=', '+='].indexOf(node.operator) !== -1) {
 if (node.left.property.name === 'outerHTML') {
 context.report(node, "Assignment to outerHTML can be unsafe");
 }
 }
 }
 }
 };

 }), call_insertAdjacentHTML:(function call_insertAdjacentHTML(context) {
 return {
 "CallExpression": function (node) {
 if ((node.callee.name == 'insertAdjacentHTML') || ((node.callee.property) && (node.callee.property.name == 'insertAdjacentHTML'))) {
 context.report(node, "The function insertAdjacentHTML can be unsafe");
 }
 }
 };

 }), property_createContextualFragment:(function property_createContextualFragment(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'createContextualFragment') {
 context.report(node, "createContextualFragment can be unsafe");

 }
 }
 }

 }), assign_to_location:(function assign_to_location(context) {
 return {
 "AssignmentExpression:exit": function (node) {
 if ("property" in node.left) { // member assignment, so yeah.
 if (['=', '+='].indexOf(node.operator) !== -1) {
 if (node.left.property.name === 'location') {
 context.report(node, "Assignment to location can be unsafe");
 }
 }
 }
 }
 };

 }), assign_to_href:(function assign_to_href(context) {
 return {
 "AssignmentExpression:exit": function (node) {
 if ("property" in node.left) { // member assignment, so yeah.
 if (['=', '+='].indexOf(node.operator) !== -1) {
 if (node.left.property.name === 'href') {
 context.report(node, "Assignment to href can be unsafe");
 }
 }
 }
 }
 };

 }), assign_to_pathname:(function assign_to_pathname(context) {
 return {
 "AssignmentExpression:exit": function (node) {
 if ("property" in node.left) { // member assignment, so yeah.
 if (['=', '+='].indexOf(node.operator) !== -1) {
 if (node.left.property.name === 'pathname') {
 context.report(node, "Assignment to pathname can be unsafe");
 }
 }
 }
 }
 };

 }), assign_to_search:(function assign_to_search(context) {
 return {
 "AssignmentExpression:exit": function (node) {
 if ("property" in node.left) { // member assignment, so yeah.
 if (['=', '+='].indexOf(node.operator) !== -1) {
 if (node.left.property.name === 'search') {
 context.report(node, "Assignment to search can be unsafe");
 }
 }
 }
 }
 };

 }), assign_to_protocol:(function assign_to_protocol(context) {
 return {
 "AssignmentExpression:exit": function (node) {
 if ("property" in node.left) { // member assignment, so yeah.
 if (['=', '+='].indexOf(node.operator) !== -1) {
 if (node.left.property.name === 'protocol') {
 context.report(node, "Assignment to protocol can be unsafe");
 }
 }
 }
 }
 };

 }), assign_to_hostname:(function assign_to_hostname(context) {
 return {
 "AssignmentExpression:exit": function (node) {
 if ("property" in node.left) { // member assignment, so yeah.
 if (['=', '+='].indexOf(node.operator) !== -1) {
 if (node.left.property.name === 'hostname') {
 context.report(node, "Assignment to hostname can be unsafe");
 }
 }
 }
 }
 };

 }), assign_to_src:(function assign_to_src(context) {
 return {
 "AssignmentExpression:exit": function (node) {
 if ("property" in node.left) { // member assignment, so yeah.
 if (['=', '+='].indexOf(node.operator) !== -1) {
 if (node.left.property.name === 'src') {
 context.report(node, "Assignment to src can be unsafe");
 }
 }
 }
 }
 };

 }), call_parseFromString:(function call_parseFromString(context) {
 return {
 "CallExpression": function (node) {
 if ((node.callee.name == 'parseFromString') || ((node.callee.property) && (node.callee.property.name == 'parseFromString'))) {
 context.report(node, "The function parseFromString can be unsafe");
 }
 }
 };

 }), call_addEventListener:(function call_addEventListener(context) {
 return {
 "CallExpression": function (node) {
 if ((node.callee.name == 'addEventListener') || ((node.callee.property) && (node.callee.property.name == 'addEventListener'))) {
 context.report(node, "The function addEventListener can be unsafe");
 }
 }
 };

 }), call_addEventListener_message:(function call_addEventListener_message(context) {
 return {
 "CallExpression": function(node) {
 if ((node.callee.name == 'addEventListener') || ((node.callee.property) && (node.callee.property.name == 'addEventListener'))) {
 for (var i=0; i < node.arguments.length; i++) {
 var arg = node.arguments[i];
 if ((arg.type == "Literal") && (arg.value == 'message')) {
 context.report(node, "The function addEventListener with parameter message can be unsafe");
 }
 }
 }
 }
 }
 }), assign_to_onmessage:(function assign_to_onmessage(context) {

 return {
 "AssignmentExpression:exit": function (node) {
 if (node.left == 'onmessage') {
 context.report(node, "Assignment to onmessage can be unsafe");
 }
 }
 };

 }), identifier_indexedDB:(function identifier_indexedDB(context) {

 return {
 "Identifier": function(node) {
 if (node.name == "indexedDB") {
 context.report(node, "indexedDB can be unsafe");
 }
 }
 }

 }), identifier_localStorage:(function identifier_localStorage(context) {

 return {
 "Identifier": function(node) {
 if (node.name == "localStorage") {
 context.report(node, "localStorage can be unsafe");
 }
 }
 }

 }), identifier_sessionStorage:(function identifier_sessionStorage(context) {

 return {
 "Identifier": function(node) {
 if (node.name == "sessionStorage") {
 context.report(node, "sessionStorage can be unsafe");
 }
 }
 }

 }), property_indexedDB:(function property_indexedDB(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'indexedDB') {
 context.report(node, "indexedDB can be unsafe");

 }
 }
 }

 }), property_localStorage:(function property_localStorage(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'localStorage') {
 context.report(node, "localStorage can be unsafe");

 }
 }
 }

 }), property_sessionStorage:(function property_sessionStorage(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'sessionStorage') {
 context.report(node, "sessionStorage can be unsafe");

 }
 }
 }

 }), new_MozActivity:(function new_MozActivity(context) {
 return {
 "NewExpression": function (node) {
 if (node.callee.name == 'MozActivity') {
 context.report(node, "The MozActivity constructor can be unsafe");
 }
 }
 };

 }), call_mozSetMessageHandler_activity:(function call_mozSetMessageHandler_activity(context) {
 return {
 "CallExpression": function(node) {
 if ((node.callee.name == 'mozSetMessageHandler') || ((node.callee.property) && (node.callee.property.name == 'mozSetMessageHandler'))) {
 for (var i=0; i < node.arguments.length; i++) {
 var arg = node.arguments[i];
 if ((arg.type == "Literal") && (arg.value == 'activity')) {
 context.report(node, "The function mozSetMessageHandler with parameter activity can be unsafe");
 }
 }
 }
 }
 }
 }), call_mozSetMessageHandler:(function call_mozSetMessageHandler(context) {
 return {
 "CallExpression": function (node) {
 if ((node.callee.name == 'mozSetMessageHandler') || ((node.callee.property) && (node.callee.property.name == 'mozSetMessageHandler'))) {
 context.report(node, "The function mozSetMessageHandler can be unsafe");
 }
 }
 };

 }), property_getDataStores:(function property_getDataStores(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'getDataStores') {
 context.report(node, "getDataStores can be unsafe");

 }
 }
 }

 }), call_connect:(function call_connect(context) {
 return {
 "CallExpression": function (node) {
 if ((node.callee.name == 'connect') || ((node.callee.property) && (node.callee.property.name == 'connect'))) {
 context.report(node, "The function connect can be unsafe");
 }
 }
 };

 }), call_setMessageHandler_connect:(function call_setMessageHandler_connect(context) {
 return {
 "CallExpression": function(node) {
 if ((node.callee.name == 'setMessageHandler') || ((node.callee.property) && (node.callee.property.name == 'setMessageHandler'))) {
 for (var i=0; i < node.arguments.length; i++) {
 var arg = node.arguments[i];
 if ((arg.type == "Literal") && (arg.value == 'connect')) {
 context.report(node, "The function setMessageHandler with parameter connect can be unsafe");
 }
 }
 }
 }
 }
 }), property_mozAlarms:(function property_mozAlarms(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'mozAlarms') {
 context.report(node, "mozAlarms can be unsafe");

 }
 }
 }

 }), call_open_attention:(function call_open_attention(context) {
 return {
 "CallExpression": function(node) {
 if ((node.callee.name == 'open') || ((node.callee.property) && (node.callee.property.name == 'open'))) {
 for (var i=0; i < node.arguments.length; i++) {
 var arg = node.arguments[i];
 if ((arg.type == "Literal") && (arg.value == 'attention')) {
 context.report(node, "The function open with parameter attention can be unsafe");
 }
 }
 }
 }
 }
 }), property_getUserMedia:(function property_getUserMedia(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'getUserMedia') {
 context.report(node, "getUserMedia can be unsafe");

 }
 }
 }

 }), assign_to_mozAudioChannelType:(function assign_to_mozAudioChannelType(context) {
 return {
 "AssignmentExpression:exit": function (node) {
 if ("property" in node.left) { // member assignment, so yeah.
 if (['=', '+='].indexOf(node.operator) !== -1) {
 if (node.left.property.name === 'mozAudioChannelType') {
 context.report(node, "Assignment to mozAudioChannelType can be unsafe");
 }
 }
 }
 }
 };

 }), assign_to_mozAudioChannel:(function assign_to_mozAudioChannel(context) {
 return {
 "AssignmentExpression:exit": function (node) {
 if ("property" in node.left) { // member assignment, so yeah.
 if (['=', '+='].indexOf(node.operator) !== -1) {
 if (node.left.property.name === 'mozAudioChannel') {
 context.report(node, "Assignment to mozAudioChannel can be unsafe");
 }
 }
 }
 }
 };

 }), call_addEventListener_deviceproximity:(function call_addEventListener_deviceproximity(context) {
 return {
 "CallExpression": function(node) {
 if ((node.callee.name == 'addEventListener') || ((node.callee.property) && (node.callee.property.name == 'addEventListener'))) {
 for (var i=0; i < node.arguments.length; i++) {
 var arg = node.arguments[i];
 if ((arg.type == "Literal") && (arg.value == 'deviceproximity')) {
 context.report(node, "The function addEventListener with parameter deviceproximity can be unsafe");
 }
 }
 }
 }
 }
 }), property_mozBluetooth:(function property_mozBluetooth(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'mozBluetooth') {
 context.report(node, "mozBluetooth can be unsafe");

 }
 }
 }

 }), call_setAttribute_mozbrowser:(function call_setAttribute_mozbrowser(context) {
 return {
 "CallExpression": function(node) {
 if ((node.callee.name == 'setAttribute') || ((node.callee.property) && (node.callee.property.name == 'setAttribute'))) {
 for (var i=0; i < node.arguments.length; i++) {
 var arg = node.arguments[i];
 if ((arg.type == "Literal") && (arg.value == 'mozbrowser')) {
 context.report(node, "The function setAttribute with parameter mozbrowser can be unsafe");
 }
 }
 }
 }
 }
 }), property_mozCameras:(function property_mozCameras(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'mozCameras') {
 context.report(node, "mozCameras can be unsafe");

 }
 }
 }

 }), call_addEventListener_cellbroadcastmsgchanged:(function call_addEventListener_cellbroadcastmsgchanged(context) {
 return {
 "CallExpression": function(node) {
 if ((node.callee.name == 'addEventListener') || ((node.callee.property) && (node.callee.property.name == 'addEventListener'))) {
 for (var i=0; i < node.arguments.length; i++) {
 var arg = node.arguments[i];
 if ((arg.type == "Literal") && (arg.value == 'cellbroadcastmsgchanged')) {
 context.report(node, "The function addEventListener with parameter cellbroadcastmsgchanged can be unsafe");
 }
 }
 }
 }
 }
 }), property_mozContacts:(function property_mozContacts(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'mozContacts') {
 context.report(node, "mozContacts can be unsafe");

 }
 }
 }

 }), new_Notification:(function new_Notification(context) {
 return {
 "NewExpression": function (node) {
 if (node.callee.name == 'Notification') {
 context.report(node, "The Notification constructor can be unsafe");
 }
 }
 };

 }), property_getDeviceStorage:(function property_getDeviceStorage(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'getDeviceStorage') {
 context.report(node, "getDeviceStorage can be unsafe");

 }
 }
 }

 }), call_getDeviceStorage_apps:(function call_getDeviceStorage_apps(context) {
 return {
 "CallExpression": function(node) {
 if ((node.callee.name == 'getDeviceStorage') || ((node.callee.property) && (node.callee.property.name == 'getDeviceStorage'))) {
 for (var i=0; i < node.arguments.length; i++) {
 var arg = node.arguments[i];
 if ((arg.type == "Literal") && (arg.value == 'apps')) {
 context.report(node, "The function getDeviceStorage with parameter apps can be unsafe");
 }
 }
 }
 }
 }
 }), call_getDeviceStorage_crashes:(function call_getDeviceStorage_crashes(context) {
 return {
 "CallExpression": function(node) {
 if ((node.callee.name == 'getDeviceStorage') || ((node.callee.property) && (node.callee.property.name == 'getDeviceStorage'))) {
 for (var i=0; i < node.arguments.length; i++) {
 var arg = node.arguments[i];
 if ((arg.type == "Literal") && (arg.value == 'crashes')) {
 context.report(node, "The function getDeviceStorage with parameter crashes can be unsafe");
 }
 }
 }
 }
 }
 }), call_getDeviceStorage_music:(function call_getDeviceStorage_music(context) {
 return {
 "CallExpression": function(node) {
 if ((node.callee.name == 'getDeviceStorage') || ((node.callee.property) && (node.callee.property.name == 'getDeviceStorage'))) {
 for (var i=0; i < node.arguments.length; i++) {
 var arg = node.arguments[i];
 if ((arg.type == "Literal") && (arg.value == 'music')) {
 context.report(node, "The function getDeviceStorage with parameter music can be unsafe");
 }
 }
 }
 }
 }
 }), call_getDeviceStorage_pictures:(function call_getDeviceStorage_pictures(context) {
 return {
 "CallExpression": function(node) {
 if ((node.callee.name == 'getDeviceStorage') || ((node.callee.property) && (node.callee.property.name == 'getDeviceStorage'))) {
 for (var i=0; i < node.arguments.length; i++) {
 var arg = node.arguments[i];
 if ((arg.type == "Literal") && (arg.value == 'pictures')) {
 context.report(node, "The function getDeviceStorage with parameter pictures can be unsafe");
 }
 }
 }
 }
 }
 }), call_getDeviceStorage_sdcard:(function call_getDeviceStorage_sdcard(context) {
 return {
 "CallExpression": function(node) {
 if ((node.callee.name == 'getDeviceStorage') || ((node.callee.property) && (node.callee.property.name == 'getDeviceStorage'))) {
 for (var i=0; i < node.arguments.length; i++) {
 var arg = node.arguments[i];
 if ((arg.type == "Literal") && (arg.value == 'sdcard')) {
 context.report(node, "The function getDeviceStorage with parameter sdcard can be unsafe");
 }
 }
 }
 }
 }
 }), call_getDeviceStorage_videos:(function call_getDeviceStorage_videos(context) {
 return {
 "CallExpression": function(node) {
 if ((node.callee.name == 'getDeviceStorage') || ((node.callee.property) && (node.callee.property.name == 'getDeviceStorage'))) {
 for (var i=0; i < node.arguments.length; i++) {
 var arg = node.arguments[i];
 if ((arg.type == "Literal") && (arg.value == 'videos')) {
 context.report(node, "The function getDeviceStorage with parameter videos can be unsafe");
 }
 }
 }
 }
 }
 }), property_mozDownloadManager:(function property_mozDownloadManager(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'mozDownloadManager') {
 context.report(node, "mozDownloadManager can be unsafe");

 }
 }
 }

 }), call_setAttribute_mozapp:(function call_setAttribute_mozapp(context) {
 return {
 "CallExpression": function(node) {
 if ((node.callee.name == 'setAttribute') || ((node.callee.property) && (node.callee.property.name == 'setAttribute'))) {
 for (var i=0; i < node.arguments.length; i++) {
 var arg = node.arguments[i];
 if ((arg.type == "Literal") && (arg.value == 'mozapp')) {
 context.report(node, "The function setAttribute with parameter mozapp can be unsafe");
 }
 }
 }
 }
 }
 }), property_mozFMRadio:(function property_mozFMRadio(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'mozFMRadio') {
 context.report(node, "mozFMRadio can be unsafe");

 }
 }
 }

 }), property_geolocation:(function property_geolocation(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'geolocation') {
 context.report(node, "geolocation can be unsafe");

 }
 }
 }

 }), property_addIdleObserver:(function property_addIdleObserver(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'addIdleObserver') {
 context.report(node, "addIdleObserver can be unsafe");

 }
 }
 }

 }), property_mozInputMethod:(function property_mozInputMethod(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'mozInputMethod') {
 context.report(node, "mozInputMethod can be unsafe");

 }
 }
 }

 }), call_hide:(function call_hide(context) {
 return {
 "CallExpression": function (node) {
 if ((node.callee.name == 'hide') || ((node.callee.property) && (node.callee.property.name == 'hide'))) {
 context.report(node, "The function hide can be unsafe");
 }
 }
 };

 }), property_mozMobileConnections:(function property_mozMobileConnections(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'mozMobileConnections') {
 context.report(node, "mozMobileConnections can be unsafe");

 }
 }
 }

 }), property_lastKnownHomeNetwork:(function property_lastKnownHomeNetwork(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'lastKnownHomeNetwork') {
 context.report(node, "lastKnownHomeNetwork can be unsafe");

 }
 }
 }

 }), property_lastKnownNetwork:(function property_lastKnownNetwork(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'lastKnownNetwork') {
 context.report(node, "lastKnownNetwork can be unsafe");

 }
 }
 }

 }), call_addEventListener_moznetworkupload:(function call_addEventListener_moznetworkupload(context) {
 return {
 "CallExpression": function(node) {
 if ((node.callee.name == 'addEventListener') || ((node.callee.property) && (node.callee.property.name == 'addEventListener'))) {
 for (var i=0; i < node.arguments.length; i++) {
 var arg = node.arguments[i];
 if ((arg.type == "Literal") && (arg.value == 'moznetworkupload')) {
 context.report(node, "The function addEventListener with parameter moznetworkupload can be unsafe");
 }
 }
 }
 }
 }
 }), call_addEventListener_moznetworkdownload:(function call_addEventListener_moznetworkdownload(context) {
 return {
 "CallExpression": function(node) {
 if ((node.callee.name == 'addEventListener') || ((node.callee.property) && (node.callee.property.name == 'addEventListener'))) {
 for (var i=0; i < node.arguments.length; i++) {
 var arg = node.arguments[i];
 if ((arg.type == "Literal") && (arg.value == 'moznetworkdownload')) {
 context.report(node, "The function addEventListener with parameter moznetworkdownload can be unsafe");
 }
 }
 }
 }
 }
 }), property_mozNetworkStats:(function property_mozNetworkStats(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'mozNetworkStats') {
 context.report(node, "mozNetworkStats can be unsafe");

 }
 }
 }

 }), property_mozNfc:(function property_mozNfc(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'mozNfc') {
 context.report(node, "mozNfc can be unsafe");

 }
 }
 }

 }), 'call_open_remote=true':(function anonymous(context) {
 return {
 "CallExpression": function(node) {
 if ((node.callee.name == 'open') || ((node.callee.property) && (node.callee.property.name == 'open'))) {
 for (var i=0; i < node.arguments.length; i++) {
 var arg = node.arguments[i];
 if ((arg.type == "Literal") && (arg.value == 'remote=true')) {
 context.report(node, "The function open with parameter remote=true can be unsafe");
 }
 }
 }
 }
 }
 }), property_mozPermissionSettings:(function property_mozPermissionSettings(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'mozPermissionSettings') {
 context.report(node, "mozPermissionSettings can be unsafe");

 }
 }
 }

 }), property_mozPhoneNumberService:(function property_mozPhoneNumberService(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'mozPhoneNumberService') {
 context.report(node, "mozPhoneNumberService can be unsafe");

 }
 }
 }

 }), property_mozPower:(function property_mozPower(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'mozPower') {
 context.report(node, "mozPower can be unsafe");

 }
 }
 }

 }), property_mozSettings:(function property_mozSettings(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'mozSettings') {
 context.report(node, "mozSettings can be unsafe");

 }
 }
 }

 }), property_mozMobileMessage:(function property_mozMobileMessage(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'mozMobileMessage') {
 context.report(node, "mozMobileMessage can be unsafe");

 }
 }
 }

 }), new_MozSpeakerManager:(function new_MozSpeakerManager(context) {
 return {
 "NewExpression": function (node) {
 if (node.callee.name == 'MozSpeakerManager') {
 context.report(node, "The MozSpeakerManager constructor can be unsafe");
 }
 }
 };

 }), object_mozSystem:(function object_mozSystem(context) {
 return {
 "ObjectExpression": function (node) {
 for (var i=0; i < node.properties.length; i++) {
 var prop = node.properties[i];
 if (prop.key.type == "Identifier") {
 if (prop.key.name == "mozSystem") {

 }
 } else if (prop.key.type == "Literalal") {
 if (prop.key.value == "mozSystem") {
 context.report(node, "mozSystem can be unsafe");
 }
 }
 }
 }
 }

 }), property_mozTCPSocket:(function property_mozTCPSocket(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'mozTCPSocket') {
 context.report(node, "mozTCPSocket can be unsafe");

 }
 }
 }

 }), property_mozTelephony:(function property_mozTelephony(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'mozTelephony') {
 context.report(node, "mozTelephony can be unsafe");

 }
 }
 }

 }), property_mozTime:(function property_mozTime(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'mozTime') {
 context.report(node, "mozTime can be unsafe");

 }
 }
 }

 }), property_mozVoicemail:(function property_mozVoicemail(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'mozVoicemail') {
 context.report(node, "mozVoicemail can be unsafe");

 }
 }
 }

 }), call_mozSetMessageHandler_wappush_received:(function call_mozSetMessageHandler_wappush_received(context) {
 return {
 "CallExpression": function(node) {
 if ((node.callee.name == 'mozSetMessageHandler') || ((node.callee.property) && (node.callee.property.name == 'mozSetMessageHandler'))) {
 for (var i=0; i < node.arguments.length; i++) {
 var arg = node.arguments[i];
 if ((arg.type == "Literal") && (arg.value == 'wappush-received')) {
 context.report(node, "The function mozSetMessageHandler with parameter wappush-received can be unsafe");
 }
 }
 }
 }
 }
 }), property_mgmt:(function property_mgmt(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'mgmt') {
 context.report(node, "mgmt can be unsafe");

 }
 }
 }

 }), property_mozWifiManager:(function property_mozWifiManager(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'mozWifiManager') {
 context.report(node, "mozWifiManager can be unsafe");

 }
 }
 }

 }), property_mozKeyboard:(function property_mozKeyboard(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'mozKeyboard') {
 context.report(node, "mozKeyboard can be unsafe");

 }
 }
 }

 }), property_mozCellBroadcast:(function property_mozCellBroadcast(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'mozCellBroadcast') {
 context.report(node, "mozCellBroadcast can be unsafe");

 }
 }
 }

 }), property_mozMobileConnection:(function property_mozMobileConnection(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'mozMobileConnection') {
 context.report(node, "mozMobileConnection can be unsafe");

 }
 }
 }

 }), property_mozNotification:(function property_mozNotification(context) {
 return {
 "MemberExpression": function(node) {
 if (node.property.name == 'mozNotification') {
 context.report(node, "mozNotification can be unsafe");

 }
 }
 }

 })})




var fs = require("fs");

for (var ruleName in rules) {
  var fileName = '../lib/rules/' + ruleName;
  var a = rules[ruleName].toString().split("\n");
  var fbody = (a.slice(1, a.length)).join("\n");
  var rulestart = "/**\n * @fileoverview Rule " + ruleName + "\n * @author ScanJS contributors\n * @copyright 2015 Mozilla Corporation. All rights reserved.\n */\n\"use strict\";\n\nmodule.exports = function (context) {\n  \n  ";
  //var ruleend = "\n};";
  var rulesrc = rulestart + fbody;
  fs.writeFileSync(fileName + '.js', rulesrc);
  //fs.appendFile("index.js", "'"+ruleName+"': 2,\n")

}
