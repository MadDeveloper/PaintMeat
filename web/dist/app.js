import jQuery from 'jquery';

var $ = jQuery;

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

$( function() {
    $( document ).ready( function() {
        var $window = $( window );

        var game = {
            gridLineWidth: 30,
            speed: 3,
            map: null,
            ballLimits: {
                x: {
                    min: 0,
                    max: 0
                },
                y: {
                    min: 0,
                    max: 0
                }
            }
        };

        var grid = {
            x: 0,
            y: 0,
            width: 4000,
            height: 3000
        };

        var camera = {
            x: 0,
            y: 0,
            width: $window.width(),
            height: $window.height(),
            grid: false,
            followed: null
        };

        var ball = {
            x: 0,
            y: 0,
            xCanvas: 0,
            yCanvas: 0,
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
            y: 0,
            hasMoved: false
        };

        var border = {
            TOP: 0,
            BOTTOM: 1,
            LEFT: 2,
            RIGHT: 3
        };

        var canvas  = document.querySelector( '#game' );
        var context = canvas.getContext( '2d' );

        canvas.width    = grid.width;
        canvas.height   = grid.height;

        ball.x = grid.width / 2;
        ball.y = grid.height / 2;

        camera.followed = ball;

        start();

        /*
         * Game functions
         */
        function start() {
            generateMap( mapLoaded );

            function mapLoaded() {
                defineBallLimits();

                if ( camera.grid ) {
                    drawCameraGrid();
                }

                updateCamera();
                drawGame();

                $( canvas ).on( 'mousemove', function( event ) {
                    mouse.x = event.clientX;
                    mouse.y = event.clientY;
                    mouse.hasMoved = true;
                });
            }
        }

        function defineBallLimits() {
            game.ballLimits.x.min = camera.width / 1.5;
            game.ballLimits.x.max = game.map.width - ( camera.width / 1.5 );
            game.ballLimits.y.min = camera.height / 1.5;
            game.ballLimits.y.max = game.map.height - ( camera.height / 1.5 );
        }

        function drawCameraGrid() {
            var lineWidth = document.createElement( 'div' );

            $( lineWidth ).css({
                borderTop: '1px solid rgb( 100, 100, 100 )',
                height: '0',
                width: camera.width + 'px',
                position: 'fixed',
                top: ( camera.height / 2 ) + 'px',
                left: 0
            }).appendTo( 'body' );

            var lineHeight = document.createElement( 'div' );
            $( lineHeight ).css({
                borderLeft: '1px solid rgb( 100, 100, 100 )',
                height: '100%',
                width: '0',
                position: 'fixed',
                top: 0,
                left: ( camera.width / 2 ) + 'px',
                content: ' '
            }).appendTo( 'body' );
        }

        function drawGame() {
            clearGame();

            calculateBallCoordsRelativeToCanvas();

            drawMap();
            drawBall();

            if ( false === ball.stopped && mouse.hasMoved ) {
                if ( !collisionWithMouse() ) {
                    calculateVectors();
                    calculateBallNextMovement();
                    checkIfNeedToUnStopBall();
                    moveObjects();
                    updateCamera();
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
            // CAHSOHTOA
            ball.angle = Math.atan2( ball.yCanvas - mouse.y , mouse.x - ball.xCanvas );

            vector.x = Math.cos( ball.angle ) * norm;
            vector.y = -( Math.sin( ball.angle ) * norm ); // we inverse y axis to correspond to screen axis and not maths' axis
        }

        function updateCamera() {
            camera.x = camera.followed.x;
            camera.y = camera.followed.y;

            if ( cameraCollisionWithBorder( border.LEFT ) ) {
                camera.x = camera.width / 2;
            }
            if ( cameraCollisionWithBorder( border.RIGHT ) ) {
                camera.x = game.map.width - ( camera.width / 2 );
            }
            if ( cameraCollisionWithBorder( border.TOP ) ) {
                camera.y = camera.height / 2;
            }
            if ( cameraCollisionWithBorder( border.BOTTOM ) ) {
                camera.y = game.map.height - ( camera.height / 2 );
            }
        }

        function calculateBallNextMovement() {
            ballNextMovement.x = ball.x + vector.x;
            ballNextMovement.y = ball.y + vector.y;
        }

        function ballApplyNextMovement( ballNewNextMovement ) {
            ballNewNextMovement = ballNewNextMovement || ballNextMovement;

            ball.x = ballNewNextMovement.x;
            ball.y = ballNewNextMovement.y;
        }

        function checkIfNeedToUnStopBall() {
            if ( ( ball.xCanvas < mouse.x - vector.x ) || ( ball.xCanvas > mouse.x + vector.x ) || ( ball.yCanvas < mouse.y - vector.y ) || ( ball.yCanvas > mouse.y + vector.y ) ) {
                ball.stopped = false;
            }
        }

        function collisionWithMouse() {
            return Math.abs( mouse.x - ball.xCanvas ) < ball.radius && Math.abs( mouse.y - ball.yCanvas ) < ball.radius; // bound-in-box
        }

        function collisionWithBorder( borderCollision ) {
            switch ( borderCollision ) {
                case border.TOP:
                    return ballNextMovement.y < ball.radius + game.ballLimits.y.min;
                    break;
                case border.BOTTOM:
                    return ballNextMovement.y + ball.radius > game.ballLimits.y.max;
                    break;
                case border.LEFT:
                    return ballNextMovement.x < ball.radius + game.ballLimits.x.min;
                    break;
                case border.RIGHT:
                    return ballNextMovement.x + ball.radius > game.ballLimits.x.max
                    break;
                default:
                    return false;
                    break;
            }
        }

        function checkBallCollision() {
            return collisionWithBorder( border.LEFT ) || collisionWithBorder( border.RIGHT ) || collisionWithBorder( border.TOP ) || collisionWithBorder( border.BOTTOM );
        }

        function cameraCollisionWithBorder( borderCollision ) {
            switch ( borderCollision ) {
                case border.TOP:
                    return camera.y < camera.height / 2;
                    break;
                case border.BOTTOM:
                    return camera.y + ( camera.height / 2 ) > game.map.height;
                    break;
                case border.LEFT:
                    return camera.x < camera.width / 2;
                    break;
                case border.RIGHT:
                    return camera.x + ( camera.width / 2 ) > game.map.width;
                    break;
                default:
                    return false;
                    break;
            }
        }

        function moveObjects() {
            if ( collisionWithMouse() ) {
                // ball proach to mouse, we adjust vector to reach cursor and then stop ball vectors
                calculateVectors( Math.sqrt( Math.pow( mouse.x - ball.xCanvas, 2 ) + Math.pow( mouse.y - ball.yCanvas, 2 ) ) );

                ballApplyNextMovement();

                vector.x = 0;
                vector.y = 0;

                ball.stopped = true;
            } else if ( checkBallCollision() ) {
                var ballNewNextMovement = {
                    x: ballNextMovement.x,
                    y: ballNextMovement.y
                };

                if ( collisionWithBorder( border.LEFT ) ) {
                    // <--|-- O
                    ballNewNextMovement.x = ball.radius + game.ballLimits.x.min;
                    vector.x = 0;
                } else if ( collisionWithBorder( border.RIGHT ) ) {
                    // O --|-->
                    ballNewNextMovement.x = game.ballLimits.x.max - ball.radius;
                    vector.x = 0;
                }

                if  ( collisionWithBorder( border.TOP ) ) {
                    // <--|-- O (vertically)
                    ballNewNextMovement.y = ball.radius + game.ballLimits.y.min;
                    vector.y = 0;
                } else if ( collisionWithBorder( border.BOTTOM ) ) {
                    // O --|--> (vertically)
                    ballNewNextMovement.y = game.ballLimits.y.max - ball.radius;
                    vector.y = 0;
                }

                ballApplyNextMovement( ballNewNextMovement );
            } else {
                ballApplyNextMovement();
            }
        }

        function calculateBallCoordsRelativeToCanvas() {
            ball.xCanvas = ball.x - ( camera.x - ( camera.width / 2 ) );
            ball.yCanvas = ball.y - ( camera.y - ( camera.height / 2 ) );
        }

        function drawBall() {
            context.beginPath(); //On démarre un nouveau tracé.
            context.arc( ball.xCanvas, ball.yCanvas, ball.radius, 0, Math.PI * 2 ); //On trace la courbe délimitant notre forme
            context.fillStyle = ball.backgroundColor;
            context.fill(); //On utilise la méthode fill(); si l'on veut une forme pleine
            context.closePath();
        }

        function drawMap() {
            context.drawImage(
                game.map,
                camera.x - ( camera.width / 2 ),
                camera.y - ( camera.height / 2 ),
                camera.width,
                camera.height,
                0,
                0,
                camera.width,
                camera.height
            );
        }

        function generateMap( callback ) {
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
            game.map.src = context.canvas.toDataURL( "image/jpg" );
            game.map.onload = function() {
                game.map.loaded = true;
                callback();
            }
        }

        function formatCoords( coords ) {
            return '(' + coords.x + ', ' + coords.y + ')';
        }

        function formatCoordsAngle( element ) {
            return '(' + ( element.x - ( element.width / 2 ) ) + ', ' + ( element.y - ( element.height / 2 ) ) + '), (' + ( element.x + ( element.width / 2 ) ) + ', ' + ( element.y - ( element.height / 2 ) ) + '), (' + ( element.x - ( element.width / 2 ) ) + ', ' + ( element.y + ( element.height / 2 ) ) + '), (' + ( element.x + ( element.width / 2 ) ) + ', ' + ( element.y + ( element.height / 2 ) ) + ')';
        }

        function formatSizes( element ) {
            return '(' + element.width + ', ' + element.height + ')';
        }
    });
});
