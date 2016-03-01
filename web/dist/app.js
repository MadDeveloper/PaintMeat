import jQuery from 'jquery';

var $ = jQuery;

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

$( function() {
    $( document ).ready( function() {

        var game = {
            height: $( document ).height(),
            width: $( document ).width(),
            gridLineWidth: 30,
            speed: 4
        };

        var ball = {
            x: 0,
            y: 0,
            radius: 20,
            backgroundColor: "#22A7F0"
        }

        var vector = {
            x: 0,
            y: 0
        };

        var mouse = {
            x: 0,
            y: 0
        };

        var canvas  = document.querySelector( '#game' );
        var context = canvas.getContext( '2d' );

        canvas.width    = game.width;
        canvas.height   = game.height;

        ball.x = ( $( window ).width() / 2 ) - ball.radius;
        ball.y = ( $( window ).height() / 2 ) - ball.radius;

        start();

        /*
         * Game functions
         */
        function start() {
            drawGame();

            $( canvas ).on( 'mousemove', function( event ) {
                mouse.x = event.clientX;
                mouse.y = event.clientY;

                calculateVectors();
            });
        }

        function drawGame() {
            setInterval( function() {
                clearGame();
                drawGrid();
                moveBall();
                drawBall();
            }, 1000 / 60 );
        }

        function clearGame() {
            context.clearRect( 0, 0, canvas.width, canvas.height );
        }

        function calculateVectors( norm ) {
            norm = norm || game.speed;
            // tan x = Opp / Adj <=> x = atan( Opp / Adj )
            // || v || = sqrt( x*x + y*y )
            ball.angle = Math.atan2( ball.y - mouse.y , mouse.x - ball.x );

            vector.x = Math.cos( ball.angle ) * norm;
            vector.y = -( Math.sin( ball.angle ) * norm );
        }

        function moveBall() {
            // in reality, just the background move!
            if ( ( ball.x + vector.x <= mouse.x - vector.x ) && ( ball.x + vector.x >= mouse.x + vector.x ) ) {
                // ball proch to mouse, we adjust vector to reach cursor and then stop vector
                calculateVectors( Math.sqrt( Math.pow( mouse.x - ball.x, 2 ) + Math.pow( mouse.y - ball.y, 2 ) ) );

                ball.x += vector.x;
                ball.y += vector.y;

                vector.x = 0;
                vector.y = 0;
            } else {
                ball.x += vector.x;
                ball.y += vector.y;
            }
        }

        function drawBall() {
            context.beginPath(); //On démarre un nouveau tracé.
            context.arc( ball.x, ball.y , ball.radius, 0, Math.PI * 2 ); //On trace la courbe délimitant notre forme
            context.fillStyle = ball.backgroundColor;
            context.fill(); //On utilise la méthode fill(); si l'on veut une forme pleine
            context.closePath();
        }

        function drawGrid() {
            //context.globalCompositeOperation = 'destination-over'; // draw grid as background

            var lines   = Math.round( game.width / game.gridLineWidth );
            var columns = Math.round( game.height / game.gridLineWidth );

            var gridCursor = {
                x: 0,
                y: 0
            };

            context.beginPath();
            context.strokeStyle = '#ccc';

            for ( var line = 0; line <= lines; line++ ) {
                for ( var column = 0; column <= columns; column++ ) {
                    gridCursor.x = line * game.gridLineWidth;
                    gridCursor.y = column * game.gridLineWidth;

                    context.moveTo( gridCursor.x + game.gridLineWidth, gridCursor.y );
                    context.lineTo( gridCursor.x + game.gridLineWidth, gridCursor.y + game.gridLineWidth );
                    context.moveTo( gridCursor.x, gridCursor.y + game.gridLineWidth );
                    context.lineTo( gridCursor.x + game.gridLineWidth, gridCursor.y + game.gridLineWidth );
                }
            }

            context.stroke();
            context.closePath();

            //context.globalCompositeOperation = 'source-over'; // draw normal now
        }

    });
});

/* With keys movement
var KEYMAP = {
    Z: 90,
    UP_ARROW: 38,
    S: 83,
    DOWN_ARROW: 40,
    D: 68,
    RIGHT_ARROW: 39,
    Q: 81,
    LEFT_ARROW: 37
};

var speed = 2;

var moving = {
    x: false,
    y: false,
    xInterval: null,
    yInterval: null,
    angle: null
}

$( function() {
    $( document ).ready( function() {
        var canvas  = document.querySelector( '#game' );
        var context = canvas.getContext( '2d' );

        canvas.width    = 2857; // $( document ).width()
        canvas.height   = 2153; // $( document ).height()
        canvas.style.background = 'url(/web/images/background.jpg) no-repeat';

        ball.x = $( window ).width() / 2;
        ball.y = $( window ).height() / 2;
        console.log($( window ).width());

        drawBall();

        $( document ).on( 'keydown', function( event ) {
            animate( event );
        });

        $( document ).on( 'keyup', function( event ) {
            animate( event );
        });

        function animate( event ) {
            var keyUpEvent = "keyup" == event.type;

            switch ( event.keyCode ) {
                case KEYMAP.Z:
                case KEYMAP.UP_ARROW:
                    if ( keyUpEvent ) {
                        stopMove( 'y' );
                    } else {
                        activeMove( 'y', true );
                    }
                    break;
                case KEYMAP.S:
                case KEYMAP.DOWN_ARROW:
                    if ( keyUpEvent ) {
                        stopMove( 'y' );
                    } else {
                        activeMove( 'y' );
                    }
                    break;
                case KEYMAP.D:
                case KEYMAP.RIGHT_ARROW:
                    if ( keyUpEvent ) {
                        stopMove( 'x' );
                    } else {
                        activeMove( 'x' );
                    }
                    break;
                case KEYMAP.Q:
                case KEYMAP.LEFT_ARROW:
                    if ( keyUpEvent ) {
                        stopMove( 'x' );
                    } else {
                        activeMove( 'x', true );
                    }
                    break;
            }

            moveBall();
        }

        function moveBall() {
            clearGame();

            ball.x += ( moving.x * speed );
            ball.y += ( moving.y * speed );

            drawBall();
        }

        function drawBall() {
            context.beginPath(); //On démarre un nouveau tracé.
            context.arc( ball.x, ball.y , ball.radius, 0, Math.PI * 2 ); //On trace la courbe délimitant notre forme
            context.fillStyle = ball.backgroundColor;
            context.fill(); //On utilise la méthode fill(); si l'on veut une forme pleine
            context.closePath();
        }

        function stopMove( axis ) {
            if ( moving.hasOwnProperty( axis ) ) {
                moving[ axis ] = 0;

                var movingInterval = axis + "Interval";
                clearInterval( moving[ movingInterval ] );
                moving[ movingInterval ] = null;
            }
        }

        function activeMove( axis, negative ) {
            if ( moving.hasOwnProperty( axis ) ) {
                moving[ axis ] = negative ? -1 : 1;

                var movingInterval = axis + "Interval";
                if ( moving.hasOwnProperty( movingInterval ) && !moving[ movingInterval ] ) {
                    moving[ movingInterval ] = setInterval( moveBall, 1000 / 60 );
                }
            }
        }

        function clearGame() {
            context.clearRect( 0, 0, canvas.width, canvas.height );
        }
    });
});
*/
