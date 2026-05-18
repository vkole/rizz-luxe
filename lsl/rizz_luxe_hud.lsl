// Rizz Luxe Dancer MOAP HUD Script
// Compatible with Second Life LSL
// Handles dance playback, library management, and MOAP communication

// Configuration
string API_URL = ""; // Set your backend API URL here
string HUD_URL = ""; // Set your web HUD URL here
key OWNER = NULL_KEY;

// MOAP Configuration
integer MOAP_LINK = 2; // Link number for MOAP screen (adjust based on your HUD structure)
integer MOAP_FACE = 0; // Face number for MOAP screen

// State variables
integer currentDanceIndex = -1;
key currentAnimation = NULL_KEY;
integer isPlaying = FALSE;
list danceList = [];
list folderList = [];
list favoritesList = [];
integer currentPage = 0;
integer itemsPerPage = 6;

// Options
integer showFavoritesFirst = TRUE;
integer autoScrollList = TRUE;
integer confirmBeforeDelete = TRUE;
integer showButtonNumbers = TRUE;

// Communication channels
integer COMMAND_CHANNEL = -1234567890;
integer HTTP_REQUEST_TIMEOUT = 30;

// Function declarations
parseCommand(string message) {
    list parts = llParseString2List(message, ["|"], []);
    string command = llList2String(parts, 0);
    
    if (command == "PLAY_DANCE") {
        string danceId = llList2String(parts, 1);
        playDance(danceId);
    }
    else if (command == "STOP_DANCE") {
        stopDance();
    }
    else if (command == "TOGGLE_FAVORITE") {
        string danceId = llList2String(parts, 1);
        toggleFavorite(danceId);
    }
    else if (command == "CREATE_FOLDER") {
        string folderName = llList2String(parts, 1);
        string parentId = llList2String(parts, 2);
        createFolder(folderName, parentId);
    }
    else if (command == "RENAME_ITEM") {
        string itemId = llList2String(parts, 1);
        string itemType = llList2String(parts, 2);
        string newName = llList2String(parts, 3);
        renameItem(itemId, itemType, newName);
    }
    else if (command == "DELETE_ITEM") {
        string itemId = llList2String(parts, 1);
        string itemType = llList2String(parts, 2);
        deleteItem(itemId, itemType);
    }
    else if (command == "MOVE_ITEM") {
        string itemId = llList2String(parts, 1);
        string itemType = llList2String(parts, 2);
        string targetFolderId = llList2String(parts, 3);
        moveItem(itemId, itemType, targetFolderId);
    }
    else if (command == "COPY_ITEM") {
        string itemId = llList2String(parts, 1);
        string targetFolderId = llList2String(parts, 2);
        copyItem(itemId, targetFolderId);
    }
    else if (command == "IMPORT_LIBRARY") {
        string libraryData = llList2String(parts, 1);
        importLibrary(libraryData);
    }
    else if (command == "EXPORT_LIBRARY") {
        exportLibrary();
    }
    else if (command == "BACKUP_LIBRARY") {
        string backupName = llList2String(parts, 1);
        createBackup(backupName);
    }
    else if (command == "UPDATE_OPTIONS") {
        updateOptions(parts);
    }
    else if (command == "GET_LIBRARY") {
        sendLibraryToHUD();
    }
    else if (command == "GET_FOLDERS") {
        sendFoldersToHUD();
    }
    else if (command == "GET_OPTIONS") {
        sendOptionsToHUD();
    }
    else if (command == "SCAN_ANIMATIONS" || command == "SCAN_INVENTORY") {
        scanAnimations();
    }
}

initializeMOAP() {
    llOwnerSay("Loading Rizz Luxe Dancer MOAP...");
    
    if (HUD_URL == "") {
        llOwnerSay("ERROR: MOAP URL not configured. Please set HUD_URL in script.");
        return;
    }
    
    // Check if the MOAP link exists
    integer linkCount = llGetNumberOfPrims();
    if (MOAP_LINK > linkCount) {
        llOwnerSay("ERROR: MOAP screen link " + (string)MOAP_LINK + " not found. HUD has " + (string)linkCount + " prims.");
        return;
    }
    
    // Set up MOAP on the correct link
    list mediaParams = [
        PRIM_MEDIA_AUTO_PLAY, TRUE,
        PRIM_MEDIA_FIRST_CLICK_INTERACT, TRUE,
        PRIM_MEDIA_PERMS_INTERACT, PRIM_MEDIA_PERM_ANYONE,
        PRIM_MEDIA_PERMS_CONTROL, PRIM_MEDIA_PERM_ANYONE,
        PRIM_MEDIA_WIDTH_PIXELS, 1024,
        PRIM_MEDIA_HEIGHT_PIXELS, 768,
        PRIM_MEDIA_CURRENT_URL, HUD_URL
    ];
    
    llSetLinkPrimitiveParams(MOAP_LINK, [
        PRIM_LINK_MEDIA, MOAP_FACE, mediaParams
    ]);
    
    llOwnerSay("MOAP URL set successfully on link " + (string)MOAP_LINK + ", face " + (string)MOAP_FACE);
}

playDance(string danceId) {
    integer index = llListFindList(danceList, [danceId]);
    if (index == -1) {
        llOwnerSay("Dance not found: " + danceId);
        return;
    }
    
    if (isPlaying && currentAnimation != NULL_KEY) {
        llStopAnimation(currentAnimation);
    }
    
    currentAnimation = (key)llList2Key(danceList, index + 1);
    currentDanceIndex = index;
    isPlaying = TRUE;
    
    llStartAnimation(currentAnimation);
    llOwnerSay("Playing: " + llList2String(danceList, index + 2));
    
    sendToHUD("DANCE_PLAYING|" + danceId);
}

stopDance() {
    if (isPlaying && currentAnimation != NULL_KEY) {
        llStopAnimation(currentAnimation);
        isPlaying = FALSE;
        currentAnimation = NULL_KEY;
        currentDanceIndex = -1;
        llOwnerSay("Dance stopped");
        
        sendToHUD("DANCE_STOPPED");
    }
}

toggleFavorite(string danceId) {
    integer index = llListFindList(favoritesList, [danceId]);
    if (index == -1) {
        favoritesList += danceId;
        llOwnerSay("Added to favorites");
    } else {
        favoritesList = llDeleteSubList(favoritesList, index, index);
        llOwnerSay("Removed from favorites");
    }
    
    sendToHUD("FAVORITE_TOGGLED|" + danceId);
}

createFolder(string folderName, string parentId) {
    string url = API_URL + "/api/library/folders/create";
    string body = llDumpList2String([
        "name=" + llEscapeURL(folderName),
        "parentId=" + llEscapeURL(parentId)
    ], "&");
    
    llHTTPRequest(url, [HTTP_METHOD, "POST", HTTP_MIMETYPE, "application/x-www-form-urlencoded"], body);
}

renameItem(string itemId, string itemType, string newName) {
    string endpoint = "/api/library/" + itemType + "s/" + itemId;
    string url = API_URL + endpoint;
    string body = "name=" + llEscapeURL(newName);
    
    llHTTPRequest(url, [HTTP_METHOD, "PUT", HTTP_MIMETYPE, "application/x-www-form-urlencoded"], body);
}

deleteItem(string itemId, string itemType) {
    if (confirmBeforeDelete) {
        llOwnerSay("Confirm delete of " + itemType + " " + itemId);
    }
    
    string endpoint = "/api/library/" + itemType + "s/" + itemId;
    string url = API_URL + endpoint;
    
    llHTTPRequest(url, [HTTP_METHOD, "DELETE"], "");
}

moveItem(string itemId, string itemType, string targetFolderId) {
    string endpoint = "/api/library/" + itemType + "s/" + itemId;
    string url = API_URL + endpoint;
    string body = "folderId=" + llEscapeURL(targetFolderId);
    
    llHTTPRequest(url, [HTTP_METHOD, "PUT", HTTP_MIMETYPE, "application/x-www-form-urlencoded"], body);
}

copyItem(string itemId, string targetFolderId) {
    string endpoint = "/api/library/dances/" + itemId + "/copy";
    string url = API_URL + endpoint;
    string body = "folderId=" + llEscapeURL(targetFolderId);
    
    llHTTPRequest(url, [HTTP_METHOD, "POST", HTTP_MIMETYPE, "application/x-www-form-urlencoded"], body);
}

importLibrary(string libraryData) {
    string url = API_URL + "/api/library/import";
    string body = "libraryData=" + llEscapeURL(libraryData);
    
    llHTTPRequest(url, [HTTP_METHOD, "POST", HTTP_MIMETYPE, "application/x-www-form-urlencoded"], body);
}

exportLibrary() {
    string url = API_URL + "/api/library/export";
    llHTTPRequest(url, [HTTP_METHOD, "GET"], "");
}

createBackup(string backupName) {
    string url = API_URL + "/api/library/backups";
    string body = "backupName=" + llEscapeURL(backupName);
    
    llHTTPRequest(url, [HTTP_METHOD, "POST", HTTP_MIMETYPE, "application/x-www-form-urlencoded"], body);
}

updateOptions(list parts) {
    showFavoritesFirst = (integer)llList2String(parts, 1);
    autoScrollList = (integer)llList2String(parts, 2);
    confirmBeforeDelete = (integer)llList2String(parts, 3);
    showButtonNumbers = (integer)llList2String(parts, 4);
    
    saveOptions();
    llOwnerSay("Options updated");
}

saveOptions() {
    string options = llDumpList2String([
        showFavoritesFirst,
        autoScrollList,
        confirmBeforeDelete,
        showButtonNumbers
    ], ",");
    
    llSetObjectDesc("OPTIONS:" + options);
}

loadOptions() {
    string desc = llGetObjectDesc();
    if (llSubStringIndex(desc, "OPTIONS:") == 0) {
        string options = llGetSubString(desc, 8, -1);
        list opts = llParseString2List(options, [","], []);
        
        showFavoritesFirst = (integer)llList2String(opts, 0);
        autoScrollList = (integer)llList2String(opts, 1);
        confirmBeforeDelete = (integer)llList2String(opts, 2);
        showButtonNumbers = (integer)llList2String(opts, 3);
    }
}

sendToHUD(string message) {
    // Send to web HUD via MOAP on the correct link
    llSetLinkPrimitiveParams(MOAP_LINK, [
        PRIM_LINK_MEDIA, MOAP_FACE, [
            PRIM_MEDIA_CURRENT_URL, HUD_URL + "?msg=" + llEscapeURL(message)
        ]
    ]);
    // Also send via link message for backup
    llMessageLinked(LINK_THIS, COMMAND_CHANNEL, message, NULL_KEY);
}

sendLibraryToHUD() {
    string libraryJson = "{\"dances\":[";
    integer i;
    for (i = 0; i < llGetListLength(danceList); i += 3) {
        if (i > 0) libraryJson += ",";
        libraryJson += "{\"id\":\"" + llList2String(danceList, i) + "\",";
        libraryJson += "\"name\":\"" + llList2String(danceList, i + 2) + "\",";
        libraryJson += "\"favorite\":" + (string)(llListFindList(favoritesList, [llList2String(danceList, i)]) != -1) + "}";
    }
    libraryJson += "]}";
    
    sendToHUD("LIBRARY_DATA|" + libraryJson);
}

sendFoldersToHUD() {
    string foldersJson = "{\"folders\":[";
    integer i;
    for (i = 0; i < llGetListLength(folderList); i += 2) {
        if (i > 0) foldersJson += ",";
        foldersJson += "{\"id\":\"" + llList2String(folderList, i) + "\",";
        foldersJson += "\"name\":\"" + llList2String(folderList, i + 1) + "\"}";
    }
    foldersJson += "]}";
    
    sendToHUD("FOLDERS_DATA|" + foldersJson);
}

sendOptionsToHUD() {
    string optionsJson = llDumpList2String([
        "\"showFavoritesFirst\":" + (string)showFavoritesFirst,
        "\"autoScrollList\":" + (string)autoScrollList,
        "\"confirmBeforeDelete\":" + (string)confirmBeforeDelete,
        "\"showButtonNumbers\":" + (string)showButtonNumbers
    ], ",");
    
    sendToHUD("OPTIONS_DATA|{" + optionsJson + "}");
}

scanAnimations() {
    llOwnerSay("Inventory scan started...");
    
    integer count = llGetInventoryNumber(INVENTORY_ANIMATION);
    danceList = [];
    
    if (count == 0) {
        llOwnerSay("No animations found in inventory.");
        sendEmptyDanceList();
        return;
    }
    
    integer i;
    list tempNames = [];
    
    for (i = 0; i < count; i++) {
        string name = llGetInventoryName(INVENTORY_ANIMATION, i);
        llOwnerSay("Detected animation: " + name);
        tempNames += name;
    }
    
    // Sort alphabetically, case-insensitive
    tempNames = llListSort(tempNames, 1, TRUE);
    
    // Remove duplicates
    list uniqueNames = [];
    for (i = 0; i < llGetListLength(tempNames); i++) {
        string name = llList2String(tempNames, i);
        if (llListFindList(uniqueNames, [name]) == -1) {
            uniqueNames += name;
        }
    }
    
    // Build dance list with IDs and keys
    for (i = 0; i < llGetListLength(uniqueNames); i++) {
        string name = llList2String(uniqueNames, i);
        key animKey = llGetInventoryKey(name);
        string danceId = llMD5String(name, 0);
        
        danceList += [danceId, animKey, name];
    }
    
    llOwnerSay("Scan complete. Found " + (string)llGetListLength(uniqueNames) + " unique animations.");
    
    sendLibraryToHUD();
}

sendEmptyDanceList() {
    string emptyJson = "{\"dances\":[],\"empty\":true,\"message\":\"No dances found. Drop animations into the HUD contents, then press Scan.\"}";
    sendToHUD("LIBRARY_DATA|" + emptyJson);
}

handleInventoryChanged() {
    llOwnerSay("Inventory changed, rescanning animations...");
    scanAnimations();
}

showMainMenu() {
    list buttons = ["Play", "Stop", "Scan", "Options", "Close"];
    llDialog(OWNER, "Rizz Luxe Dancer HUD", buttons, COMMAND_CHANNEL);
}

parseAPIResponse(string body) {
    if (llSubStringIndex(body, "\"success\":true") != -1) {
        llOwnerSay("Operation successful");
    } else {
        llOwnerSay("Operation failed");
    }
}

// Initialize
default {
    state_entry() {
        OWNER = llGetOwner();
        llOwnerSay("Rizz Luxe Dancer HUD script started");
        llListen(COMMAND_CHANNEL, "", NULL_KEY, "");
        
        // Initialize MOAP
        initializeMOAP();
        
        // Load saved options
        loadOptions();
        
        // Scan animations on startup
        scanAnimations();
    }
    
    on_rez(integer start_param) {
        llResetScript();
    }
    
    changed(integer change) {
        if (change & CHANGED_OWNER) {
            llResetScript();
        }
        else if (change & CHANGED_INVENTORY) {
            handleInventoryChanged();
        }
    }
    
    listen(integer channel, string name, key id, string message) {
        if (id != llGetOwner()) return;
        
        parseCommand(message);
    }
    
    http_response(key request_id, integer status, list metadata, string body) {
        if (status == 200) {
            llOwnerSay("API request successful");
            parseAPIResponse(body);
        } else {
            llOwnerSay("API request failed: " + (string)status);
        }
    }
    
    link_message(integer sender_num, integer num, string str, key id) {
        if (num == COMMAND_CHANNEL) {
            parseCommand(str);
        }
    }
    
    touch_start(integer total_number) {
        key toucher = llDetectedKey(0);
        if (toucher != llGetOwner()) return;
        
        showMainMenu();
    }
}
