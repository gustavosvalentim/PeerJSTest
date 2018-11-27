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
let userID;

/*
 * HTML elements
 */
// user
let userIDText = document.querySelector('#userIDText');
let userIDInput = document.querySelector('#userIDInput');
let userIDSet = document.querySelector('#userIDSet');
// connection
let roomInputEl = document.querySelector('#roomID');
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
    if(userIDText.value === '') alert('Set your id');
    else userID = userIDText.value;
    peerConnection = new Peer(userID, peerClientSettings);
    peerConnection.on('open', id => {
        userIDInput.disabled = true;
        userIDSet.disabled = true;
        
        let userIDDiv = document.querySelector('#userID');
        userIDDiv.innerHTML += '<br>';
        let roomURL = document.createElement('A');
        roomURL.href = `#${id}`;
        roomURL.textContent = `${location.host}/#${id}`;
        userIDDiv.appendChild(roomURL);
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

// Buttons
connectButtonEl.addEventListener('click', 
    () => {
        let otherPeerID = roomInputEl.value;
        getMedia(
            mediaStream => {
                let call = peerConnection.call(otherPeerID, mediaStream);
                call.on('stream', receiveStream);
            }
        );
    }
);

userIDSet.addEventListener('click', startLocalStream);