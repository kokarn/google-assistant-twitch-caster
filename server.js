const WebSocket = require( 'ws' );
const googlehome = require( 'google-home-notifier' );
const chromecasts = require( 'chromecasts' )();

const PLAY_TARGET_NAME = '';
const HOME_TARGET = '';

let ws;

googlehome.device( HOME_TARGET );
googlehome.accent( 'uk' );

let playTarget = false;

const sayThing = function sayThing ( thing ) {
    googlehome.notify( thing, ( response ) => {
        console.log( response );
    } );
}

const playStream = function playStream ( streamURI ) {
    playTarget.play( streamURI );
};

const connectToServer = function connectToServer () {
    console.log( 'Connecting to server' );
    ws = new WebSocket( 'http://localhost:3000' );

    ws.on( 'open', () => {
        console.log( 'Connected to server' );
    } );

    ws.on( 'close', () => {
        console.log( 'Disconnected from server, reconnecting in 5 seconds' );
        setTimeout( connectToServer, 5000 );
    } );

    ws.on( 'error', ( socketError ) => {
        console.log( socketError );
    } );

    ws.on( 'message', ( data ) => {
        const message = JSON.parse( data );
        if ( message.type === 'message' ) {
            // sayThing( message.content );
            console.log( message );
        } else if ( message.type === 'play' ) {
            // playStream( message.content );
            console.log( message );
        } else {
            console.error( message );
        }
    } );
}

connectToServer();

chromecasts.on( 'update', ( player ) => {
    if ( player.name === PLAY_TARGET_NAME ) {
        console.log( 'Play target found' );
        playTarget = player;
    }
} );
