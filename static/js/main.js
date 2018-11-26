const peerClientSettings = {
    host: location.host,
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

// declare some variables
let peerConnection;

// html objects
let roomInputEl = document.querySelector('#roomID');
let connectButtonEl = document.querySelector('#connectButton');
let homeVideoEl = document.querySelector('#homeVideo');
let remoteVideosEl = document.querySelector('#remoteVideos');


/*
 * Functions
 */
function getMedia(successCallback, errorCallback = null) {    
    if(errorCallback === null) {
        errorCallback = err => {
            document.body.append(err);
        }
    }

    if(navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = navigator.getUserMedia;
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
    let receiveStream;
    getMedia(
        mediaStream => {
            receiveStream = mediaStream;
            call.answer(mediaStream);
    });

    call.on('stream', receiveStream);
    call.on('close', () => {
        let videoObj = getVideoObjectByStream(receiveStream);
        videoObj.srcObject = null;
        videoObj = null;
    });
}


function getVideoObjectByStream(stream) {
    var remoteVideos = document.querySelectorAll('video');

    for(video in remoteVideos) {
        if(video.srcObject === stream) {
            return video;
        }
    }
}


/*
 * Events
 */

// Buttons
connectButtonEl.addEventListener('click', 
    () => {
        let otherPeerID = roomInputEl.value;
        getMedia(
            mediaStream => {
                var call = peerConnection.call(otherPeerID, mediaStream);
                call.on('stream', receiveStream);
            }
        );
    }
);

// PeerConnection
peerConnection = new Peer(peerClientSettings);

peerConnection.on('open',
    id => {
        document.querySelector('h1').textContent += id;
    });

peerConnection.on('call', receiveCall);

getMedia(
    stream => {
        homeVideoEl.srcObject = stream;
        homeVideoEl.play();
    }
);