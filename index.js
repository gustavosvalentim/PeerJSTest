let express = require('express');
let peerServer = require('peer');
let fs = require('fs');

// create a express server
let app = express();


/*
 * Settings
 */

const PORT = process.env.PORT || 8080;
const peerServerOptions = {
    debug: true
};
const templates_dir = __dirname + '/public/';

// express uses static folder
app.use(express.static('.'));


/*
 * Routing
 */
app.get('/', (req, res) => {
    res.sendFile(templates_dir + 'index.html');
});

app.get('/:roomID', (req, res) => {
    let roomID = req.params.roomID;
    fs.readFile(templates_dir + 'video.html', 'utf-8', (err, contents) => {
        contents = contents.replace('$$roomID', roomID);
        res.send(contents);
    });
});

/*
 * Start it all
 */
// express server listen to port 8080
let server = app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`);
});
// set peer server with express server
let expressPeerServer = peerServer.ExpressPeerServer(server, peerServerOptions);

// make the app use the peer server
app.use('/peerjs', expressPeerServer);
