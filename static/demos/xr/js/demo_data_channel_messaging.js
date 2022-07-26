//
//Copyright (c) 2016, Skedans Systems, Inc.
//All rights reserved.
//
//Redistribution and use in source and binary forms, with or without
//modification, are permitted provided that the following conditions are met:
//
//    * Redistributions of source code must retain the above copyright notice,
//      this list of conditions and the following disclaimer.
//    * Redistributions in binary form must reproduce the above copyright
//      notice, this list of conditions and the following disclaimer in the
//      documentation and/or other materials provided with the distribution.
//
//THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
//AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
//IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
//ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
//LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
//CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
//SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
//INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
//CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
//ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
//POSSIBILITY OF SUCH DAMAGE.
//
var selfEasyrtcid = "";
//var connId='';

//var usersDB=["rai","mond","amon","ra"]
//var passDB=[["rai","musica_260876"],["mond","musica_260876"],["amon","musica_260876"],["ra","musica_260876"]]

var user="";
var passWord="";
var connectList = {};
var channelIsActive = {}; // tracks which channels are active
function auth(){
    user=document.getElementById("loginText").value;
    
    //passWord=document.getElementById("pass").value;
    var chekUserNameDB;
    var chekPassDB;
    //for (chekUserNameDB in usersDB){   
        //if(user==usersDB[chekUserNameDB]){
            //for (chekPassDB in passDB){
                //if(user==passDB[chekPassDB][0] && passWord==passDB[chekPassDB][1]){
                    
                    document.getElementById("iam").innerHTML = "Io sono il nodo: ---  " + user+"  --- e mi vorrei collegare al nodo...";
                    connect();
                //}
                
            //}
        //}
        
    //}
    
    
}

function connect() {
    easyrtc.enableDebug(false);
    easyrtc.enableDataChannels(true);
    easyrtc.enableVideo(false);
    easyrtc.enableAudio(false);
    easyrtc.enableVideoReceive(false);
    easyrtc.enableAudioReceive(false);
    easyrtc.setUsername(user);
    easyrtc.setCredential({ "password":passWord});
    easyrtc.setDataChannelOpenListener(openListener);
    easyrtc.setDataChannelCloseListener(closeListener);
    easyrtc.setPeerListener(addToConversation);
    easyrtc.setRoomOccupantListener(convertListToButtons);
    easyrtc.connect("easyrtc.dataMessaging", loginSuccess, loginFailure);
}



function addToConversation(who, msgType, content) {
    // Escape html special characters, then add linefeeds.
    content = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    content = content.replace(/\n/g, '<br />');
    if (content){
        sessionStorage.setItem('passaggio', content);
        //console.log('sended data -----    ',content)
        window.location.href = "./third/index.html";
    }
    /*
    document.getElementById('conversation').innerHTML +=
            "<b>" + who + ":</b>&nbsp;" + content + "<br />";
    */
}


function openListener(otherParty) {
    channelIsActive[otherParty] = true;
    updateButtonState(otherParty);
}


function closeListener(otherParty) {
    channelIsActive[otherParty] = false;
    updateButtonState(otherParty);
}

function convertListToButtons(roomName, occupantList, isPrimary) {
    connectList = occupantList;

    var otherClientDiv = document.getElementById('otherClients');
    while (otherClientDiv.hasChildNodes()) {
        otherClientDiv.removeChild(otherClientDiv.lastChild);
    }

    var label, button;
    for (var easyrtcid in connectList) {
        var rowGroup = document.createElement("span");
        var rowLabel = document.createTextNode(easyrtc.idToName(easyrtcid));
        rowGroup.appendChild(rowLabel);

        button = document.createElement('button');
        button.id = "connect_" + easyrtcid;
        button.onclick = function(easyrtcid) {
            return function() {
                var xr_el = document.getElementById('gui');
                xr_el.style.display='block';
                var mai = document.getElementById('main');
                mai.style.display='none';
                sessionStorage.setItem('connId', easyrtcid);
                //connId=easyrtcid;
                startCall(easyrtcid);
            };
        }(easyrtcid);
        label = document.createTextNode("Connect");
        button.appendChild(label);
        rowGroup.appendChild(button);

        button = document.createElement('button');
        button.id = "send_" + easyrtcid;
        button.onclick = function(easyrtcid) {
            return function() {
                sendStuffP2P(easyrtcid);
            };
        }(easyrtcid);
        label = document.createTextNode("Send Message");
        button.appendChild(label);
        rowGroup.appendChild(button);
        otherClientDiv.appendChild(rowGroup);
        updateButtonState(easyrtcid);
    }
    if (!otherClientDiv.hasChildNodes()) {
        otherClientDiv.innerHTML = "<em>Nobody else logged in to talk to...</em>";
    }
}

function updateButtonState(otherEasyrtcid) {
    var isConnected = channelIsActive[otherEasyrtcid];
    if(document.getElementById('connect_' + otherEasyrtcid)) {
        document.getElementById('connect_' + otherEasyrtcid).disabled = isConnected;
    }
    if( document.getElementById('send_' + otherEasyrtcid)) {
        document.getElementById('send_' + otherEasyrtcid).disabled = !isConnected;
    }
}


function startCall(otherEasyrtcid) {
    if (easyrtc.getConnectStatus(otherEasyrtcid) === easyrtc.NOT_CONNECTED) {
        try {
        easyrtc.call(otherEasyrtcid,
                function(caller, media) { // success callback
                    if (media === 'datachannel') {
                        // console.log("made call succesfully");
                        connectList[otherEasyrtcid] = true;
                    }
                },
                function(errorCode, errorText) {
                    connectList[otherEasyrtcid] = false;
                    easyrtc.showError(errorCode, errorText);
                },
                function(wasAccepted) {
                    // console.log("was accepted=" + wasAccepted);
                }
        );
        }catch( callerror) {
            console.log("saw call error ", callerror);
        }
    }
    else {
        easyrtc.showError("ALREADY-CONNECTED", "already connected to " + easyrtc.idToName(otherEasyrtcid));
    }
}

function sendStuffP2P(otherEasyrtcid) {

    var text = sessionStorage.getItem('passaggio1');
    if (text.replace(/\s/g, "").length === 0) { // Don't send just whitespace
        return;
    }
    if (easyrtc.getConnectStatus(otherEasyrtcid) === easyrtc.IS_CONNECTED) {
        easyrtc.sendDataP2P(otherEasyrtcid, 'msg', text);
    }
    else {
        easyrtc.showError("NOT-CONNECTED", "not connected to " + easyrtc.idToName(otherEasyrtcid) + " yet.");
    }

    //addToConversation("Me", "msgtype", text);
    
    
    //window.location.href = "./third/index.html";
    //document.getElementById('sendMessageText').value = "";
}


function loginSuccess(username) {
    selfEasyrtcid = username;
    //document.getElementById("iam").innerHTML = "I am " + username;
}


function loginFailure(errorCode, message) {
    easyrtc.showError(errorCode, "failure to login");
}
