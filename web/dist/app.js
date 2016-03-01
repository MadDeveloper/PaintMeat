import jQuery from 'jquery';

var $ = jQuery;

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

$( function() {
    $( document ).ready( function() {

        var game = {
            gridLineWidth: 30,
            speed: 3,
            map: null
        };

        var grid = {
            x: 0,
            y: 0,
            width: $( window ).width(),
            height: $( window ).height()
        };

        var ball = {
            x: 0,
            y: 0,
            radius: 20,
            backgroundColor: "#22A7F0",
            stopped: false
        };

        var vector = {
            x: 0,
            y: 0
        };

        var ballNextMovement = {
            x: ball.x + vector.x,
            y: ball.y + vector.y
        };

        var mouse = {
            x: 0,
            y: 0
        };

        var border = {
            TOP: 0,
            BOTTOM: 1,
            LEFT: 2,
            RIGHT: 3
        };

        var canvas  = document.querySelector( '#game' );
        var context = canvas.getContext( '2d' );

        var $window = $( window );

        canvas.width    = $window.width();
        canvas.height   = $window.height();

        ball.x = ( $window.width() / 2 ) - ball.radius;
        ball.y = ( $window.height() / 2 ) - ball.radius;

        calculateBallNextMovement();

        start();

        /*
         * Game functions
         */
        function start() {
            generateMap();
            drawGame();

            $( canvas ).on( 'mousemove', function( event ) {
                mouse.x = event.clientX;
                mouse.y = event.clientY;

                calculateVectors();
            });
        }

        function drawGame() {
            clearGame();
            drawMap();
            drawBall();
            if ( false === ball.stopped ) {
                if ( !collisionWithMouse() ) {
                    calculateBallNextMovement();
                    moveGrid();
                }
            }

            requestAnimationFrame( drawGame );
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
            vector.y = -( Math.sin( ball.angle ) * norm ); // we inverse y axis to correspond to screen axis and not maths' axis

            calculateBallNextMovement();
            checkIfNeedToUnStopBall();
        }

        function calculateBallNextMovement() {
            ballNextMovement.x = ball.x + vector.x;
            ballNextMovement.y = ball.y + vector.y;

            /*
             * If ball is bloqued with border collision, vector or other axis will do the ball exceed mouse
             */
            if ( ( ( vector.x > 0 && ballNextMovement.x > mouse.x ) || ( vector.x < 0 && ballNextMovement.x < mouse.x ) ) && !collisionWithBorder( border.LEFT ) && !collisionWithBorder( border.RIGHT ) ) {
                ballNextMovement.x = mouse.x;
            }

            if ( ( ( vector.y > 0 && ballNextMovement.y > mouse.y ) || ( vector.y < 0 && ballNextMovement.y < mouse.y ) ) && !collisionWithBorder( border.TOP ) && !collisionWithBorder( border.BOTTOM ) ) {
                ballNextMovement.y = mouse.y;
            }
        }

        function ballApplyNextMovement( ballNewNextMovement ) {
            ballNewNextMovement = ballNewNextMovement || ballNextMovement;

            ball.x = ballNewNextMovement.x;
            ball.y = ballNewNextMovement.y;
        }

        function checkIfNeedToUnStopBall() {
            if ( ( ballNextMovement.x < mouse.x - vector.x ) || ( ballNextMovement.x > mouse.x + vector.x ) || ( ballNextMovement.y < mouse.y - vector.y ) || ( ballNextMovement.y > mouse.y + vector.y ) ) {
                ball.stopped = false;
            }
        }

        function collisionWithMouse() {
            return Math.abs( mouse.x - ball.x ) < ball.radius && Math.abs( mouse.y - ball.y ) < ball.radius; // bound-in-box
        }

        function collisionWithBorder( borderCollision ) {
            switch ( borderCollision ) {
                case border.TOP:
                    return ballNextMovement.y < ball.radius;
                    break;
                case border.BOTTOM:
                    return ballNextMovement.y + ball.radius > $window.height();
                    break;
                case border.LEFT:
                    return ballNextMovement.x < ball.radius;
                    break;
                case border.RIGHT:
                    return ballNextMovement.x + ball.radius > $window.width();
                    break;
                default:
                    return false;
                    break;
            }
        }

        function moveGrid() {
            // in reality, just the background move!
            if ( collisionWithMouse() ) {
                // ball proach to mouse, we adjust vector to reach cursor and then stop vector
                calculateVectors( Math.sqrt( Math.pow( mouse.x - ball.x, 2 ) + Math.pow( mouse.y - ball.y, 2 ) ) );

                ballApplyNextMovement();

                vector.x = 0;
                vector.y = 0;

                ball.stopped = true;
            } else if ( collisionWithBorder( border.LEFT ) || collisionWithBorder( border.RIGHT ) || collisionWithBorder( border.TOP ) || collisionWithBorder( border.BOTTOM ) ) {
                var ballNewNextMovement = {
                    x: ballNextMovement.x,
                    y: ballNextMovement.y
                };

                if ( collisionWithBorder( border.LEFT ) ) {
                    // <--|-- O
                    ballNewNextMovement.x = ball.radius;
                    vector.x = 0;
                } else if ( collisionWithBorder( border.RIGHT ) ) {
                    // O --|-->
                    ballNewNextMovement.x = $window.width() - ball.radius;
                    vector.x = 0;
                }

                if  ( collisionWithBorder( border.TOP ) ) {
                    // <--|-- O (vertically)
                    ballNewNextMovement.y = ball.radius;
                    vector.y = 0;
                } else if ( collisionWithBorder( border.BOTTOM ) ) {
                    // O --|--> (vertically)
                    ballNewNextMovement.y = $window.height() - ball.radius;
                    vector.y = 0;
                }

                ballApplyNextMovement( ballNewNextMovement );
            } else {
                ballApplyNextMovement();
            }
        }

        function drawBall() {
            context.beginPath(); //On démarre un nouveau tracé.
            context.arc( ball.x, ball.y , ball.radius, 0, Math.PI * 2 ); //On trace la courbe délimitant notre forme
            context.fillStyle = ball.backgroundColor;
            context.fill(); //On utilise la méthode fill(); si l'on veut une forme pleine
            context.closePath();
        }

        function drawMap() {
            context.drawImage( game.map, 0, 0, game.map.width, game.map.height, 0, 0, canvas.width, canvas.height );
        }

        function generateMap() {
            var lines   = Math.round( grid.width / game.gridLineWidth );
            var columns = Math.round( grid.height / game.gridLineWidth );

            var gridCursor = {
                x: 0,
                y: 0
            };

            context.save();
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
            context.restore();

            game.map = new Image();
            game.map.src = context.canvas.toDataURL("image/png");
        }

    });
});
