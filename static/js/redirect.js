
let createRoomInput = document.querySelector('#criar-sala-input');
let createRoomButton = document.querySelector('#criar-sala-ok');

createRoomButton.addEventListener('click', event => {
    let roomID = createRoomInput.value;

    if(roomID === undefined) return;

    window.location.href = `/${roomID}#init`;
});
