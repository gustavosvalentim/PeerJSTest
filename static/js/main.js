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
const videoConstraints = {
    width: 1280,
    height: 720
};
const audioConstraints = true;

let mediaStreamConstraints = {
    video: videoConstraints, 
    audio: audioConstraints 
};


/*
 * Global scope vars
 */
let roomID = document.querySelector('#roomID').value;
let peerConnection;

/*
 * HTML elements
 */
// video elements
let homeVideoEl = document.querySelector('#homeVideo');
let remoteVideosEl = document.querySelector('#remoteVideos');


/*
 * Functions
 */
function getMedia(successCallback, errorCallback = null) {    
    if(errorCallback === null) {
        errorCallback = err => {
            mediaStreamConstraints.audio = false;
            getMedia(successCallback, errorCallback);
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

function startLocalStream() {

    peerConnection = new Peer(roomID, peerClientSettings);
    peerConnection.on('open', id => {
    });

    peerConnection.on('call', receiveCall);

    getMedia(
        mediaStream => {
            homeVideoEl.srcObject = mediaStream;
            homeVideoEl.play();
        }
    );
}


/*
 * Events
 */
if(location.hash === '#init') {
    let roomURL = document.createElement('a');
    roomURL.href = location.href.replace(location.hash, '');
    roomURL.textContent = roomURL.href;
    document.querySelector('#connectURL').appendChild(roomURL);

    startLocalStream();
} else {
    peerConnection = new Peer(null, peerClientSettings);
    peerConnection.on('open', id => {
    });

    getMedia(
        mediaStream => {
            homeVideoEl.srcObject = mediaStream;
            homeVideoEl.play();
            let call = peerConnection.call(roomID, mediaStream);
            call.on('stream', receiveStream);
        }
    );
}
