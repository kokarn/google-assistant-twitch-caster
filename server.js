const WebSocket = require( 'ws' );
const googlehome = require( 'google-home-notifier' );
const chromecasts = require( 'chromecasts' )();

const PLAY_TARGET_NAME = '';
const HOME_TARGET = '';
const RECONNECT_DELAY = 5000;
const TARGET_QUALITY = '720p';
const TARGET_MAX_FPX = 30;

let ws;

googlehome.device( HOME_TARGET );
googlehome.accent( 'uk' );

let playTarget = false;

const sayThing = function sayThing ( thing ) {
    googlehome.notify( thing, ( response ) => {
        console.log( response );
    } );
}

const playStream = function playStream ( streams ) {
    for ( let i = 0; i < streams.length; i = i + 1 ) {
        if ( streams[ i ].quality.toLowerCase() === TARGET_QUALITY.toLowerCase() && Number( streams[ i ].fps ) <= TARGET_MAX_FPX ) {
            playTarget.play( streams[ i ].uri );

            return true;
        }
    }

    console.error( `Unable to find a stream with the preferred quality ( ${ TARGET_QUALITY } ${ TARGET_MAX_FPX } FPS )` );
};

const connectToServer = function connectToServer () {
    console.log( 'Connecting to server' );
    ws = new WebSocket( 'http://localhost:3000' );

    ws.on( 'open', () => {
        console.log( 'Connected to server' );
    } );

    ws.on( 'close', () => {
        console.log( 'Disconnected from server, reconnecting in 5 seconds' );
        setTimeout( connectToServer, RECONNECT_DELAY );
    } );

    ws.on( 'error', ( socketError ) => {
        console.log( socketError );
    } );

    ws.on( 'message', ( data ) => {
        const message = JSON.parse( data );
        if ( message.type === 'message' ) {
            sayThing( message.content );
        } else if ( message.type === 'play' ) {
            playStream( message.content );
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
