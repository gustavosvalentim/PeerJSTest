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
let remoteVideoEl = document.querySelector('#remoteVideo');


/*
 * Functions
 */
function getMedia(successCallback, errorCallback = null) {    
    navigator.getUserMedia(mediaStreamConstraints, successCallback, err => {
        document.body.append(err);
    });
}

function receiveStream(stream) {
    console.log(remoteVideoEl);
    remoteVideoEl.srcObject = stream;
    remoteVideoEl.play();
}

function receiveCall(call) {
    console.log(call);
    getMedia(
        mediaStream => {
            call.answer(mediaStream);
    });

    call.on('stream', receiveStream);
}



/*
 * Events
 */
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


/*
 * Run
 */
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