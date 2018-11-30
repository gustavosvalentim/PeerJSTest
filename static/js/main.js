/*
 * Settings
 */
const peerClientSettings = {
    host: location.hostname,
    port: location.port ? location.port : '',
    path: '/peerjs',
    config: {
        'iceServers': [
            {url: 'stun:stun.l.google.com:19302'}
        ]
    }
};
const mediaStreamConstraints = {
    video: true,
    audio: false
};


/*
 * Global scope vars
 */
let peerConnection;
let roomID;
let connectionID;

/*
 * HTML elements
 */
// user
let roomIDDiv = document.querySelector('#roomID');
let roomIDInput = document.querySelector('#roomIDInput');
let roomIDButton = document.querySelector('#roomIDButton');
// connection
let roomInputEl = document.querySelector('#connectRoomID');
let connectButtonEl = document.querySelector('#connectButton');
// video elements
let homeVideoEl = document.querySelector('#homeVideo');
let remoteVideosEl = document.querySelector('#remoteVideos');


/*
 * Functions
 */
function getMedia(successCallback, errorCallback = null) {    
    if(errorCallback === null) {
        errorCallback = err => {
            console.log(err);
            document.body.append(err);
        }
    }


    if(navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = new Promise((resolve, reject) => {
            navigator.getUserMedia(
                mediaStream => resolve(mediaStream),
                error => reject(error)
            );
        });
    }

    navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
        .then(successCallback)
        .catch(errorCallback);
}

function receiveStream(stream) {
    let videoObj = document.createElement('video');
    remoteVideosEl.appendChild(videoObj);
    videoObj.srcObject = stream;
    videoObj.play();
}

function receiveCall(call) {
    getMedia(
        mediaStream => {
            call.answer(mediaStream);
    });

    call.on('stream', receiveStream);
}


// util functions
function getVideoElementByStream(stream) {
    var remoteVideos = document.querySelectorAll('video');
    console.log(remoteVideos);

    for(video in remoteVideos) {
        if(video.srcObject === stream) {
            return video;
        }
    }
}

function startLocalStream(event) {
    document.querySelector('#selectRoom').style.visibility = 'visible';
    
    if(roomID === undefined) roomID = roomIDInput.value;
    if(connectionID === undefined) connectionID = roomIDInput.value;

    peerConnection = new Peer(roomID, peerClientSettings);
    peerConnection.on('open', id => {

        removeCreateRoomElements();

        roomIDDiv.querySelector('h1').textContent = `Sala ${connectionID}`;

        let roomURL = document.createElement('A');
        roomURL.href = `#${id}`;
        roomURL.textContent = `${location.host}/#${id}`;
        roomIDDiv.appendChild(roomURL);
    });

    peerConnection.on('call', receiveCall);

    getMedia(
        mediaStream => {
            homeVideoEl.srcObject = mediaStream;
            homeVideoEl.play();
        }
    );
}

function removeConnectionElements() {
    let primaryElement = document.querySelector('#selectRoom');
    document.body.removeChild(primaryElement);
}

function removeCreateRoomElements() {
    roomIDDiv.removeChild(roomIDInput);
    roomIDDiv.removeChild(roomIDButton);
}


/*
 * Events
 */

// Buttons
connectButtonEl.addEventListener('click', 
    () => {
        removeConnectionElements();
        let otherPeerID = roomInputEl.value || '';

        if(peerConnection === undefined) peerConnection = new Peer(otherPeerID, peerClientSettings);

        getMedia(
            mediaStream => {
                let call = peerConnection.call(otherPeerID, mediaStream);
                call.on('stream', receiveStream);
            }
        );
    }
);

roomIDButton.addEventListener('click', startLocalStream);

if(location.hash !== '') {
    // armazena o código que está depois da hashtag
    connectionID = location.hash.replace('#', '');

    startLocalStream();
    removeConnectionElements();

    getMedia(
        mediaStream => {
            let call = peerConnection.call(connectionID, mediaStream);
            call.on('stream', receiveStream);
        }
    );

}