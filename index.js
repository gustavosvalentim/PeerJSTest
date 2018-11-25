let express = require('express');
let peerServer = require('peer');

// create a express server
let app = express();


/*
 * Settings
 */

const PORT = 8080;
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