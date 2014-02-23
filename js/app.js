var app = {};
app.stage = {};

function init() {
    console.log("init() successfully called.");
    app.stage = new PIXI.Stage(0xFFFFFF);
    app.startingScaleX = 1;
    app.startingScaleY = 1;
    app.boardwidth = $('#game-canvas').width();
    app.boardheight = $('#game-canvas').height();
    PIXI.Texture.SCALE_MODE.DEFAULT = PIXI.Texture.SCALE_MODE.DEFAULT;
    var renderer = PIXI.autoDetectRenderer(
        app.boardwidth,
        app.boardheight,
        document.getElementById("game-canvas")
    );

    var mapContainer = new PIXI.DisplayObjectContainer();

    var assetsToLoader = ["img/map.png"];
    var loader = new PIXI.AssetLoader(assetsToLoader);
    loader.onComplete = onAssetsLoaded;
    loader.load();

    function onAssetsLoaded()
    {
        // start your game :D
        //var coolCrab = Sprite.fromImage("myImage.png");
        var farTexture = PIXI.Texture.fromImage("img/map.png");
        var far = new PIXI.Sprite(farTexture);
        far.position.x = 0;
        far.position.y = 0;
        far.scale.x = app.startingScaleX;
        far.scale.y = app.startingScaleY;
        mapContainer.addChild(far);

        app.stage.addChild(mapContainer);

        renderer.render(app.stage);
    }


    var maxScale = 2.0;
    var minScale = 0.2;
    $('#game-canvas').on('wheel', function(e){
        e.preventDefault();

        if(e.originalEvent.deltaY > 0) {
            //console.log("scroll down");
            if (mapContainer.scale.x >= minScale) {
                mapContainer.scale.x = mapContainer.scale.x - 0.05;
                mapContainer.scale.y = mapContainer.scale.y - 0.05;
                renderer.render(app.stage);
                //console.log("scaled down to: " + mapContainer.scale.x + "," + mapContainer.scale.y)
            }
        }
        else {
            //console.log("scroll up");
            if (mapContainer.scale.x <= maxScale) {
                mapContainer.scale.x = mapContainer.scale.x + 0.05;
                mapContainer.scale.y = mapContainer.scale.y + 0.05;
                renderer.render(app.stage);
                //console.log("scaled up to: " + mapContainer.scale.x + "," + mapContainer.scale.y)
            }
        }
        //console.log(e.originalEvent.deltaY);
    });

    var dragMode = false;
    var originalDragCoords = null;
    var lastDragCoords = null;
    var moveThrottle = 4;
    $('#game-canvas').on('mousedown', function(e) {
        e.preventDefault();
        dragMode = true;
        originalDragCoords = {x: e.originalEvent.clientX, y: e.originalEvent.clientY };
        //console.log('Start:' + e.originalEvent.clientX + ' ' + e.originalEvent.clientY);
        $('#game-canvas').on('mousemove', function(e) {
            if (dragMode) {
                if (!lastDragCoords) {
                    lastDragCoords = {x: (originalDragCoords.x), y: (originalDragCoords.y)};
                }

                var deltaDragCoords = {x: (e.originalEvent.clientX - lastDragCoords.x), y: (e.originalEvent.clientY - lastDragCoords.y)};

                if (Math.abs(deltaDragCoords.x) > moveThrottle || Math.abs(deltaDragCoords.y) > moveThrottle) {
                    //console.log('Moving: ' + Math.abs(deltaDragCoords.x) + ' ' + Math.abs(deltaDragCoords.y));
                    var newX = mapContainer.position.x + deltaDragCoords.x;

                    mapContainer.position = {x: (mapContainer.position.x + deltaDragCoords.x), y: (mapContainer.position.y + deltaDragCoords.y)};
                    renderer.render(app.stage);
                    lastDragCoords = {x: (e.originalEvent.clientX), y: (e.originalEvent.clientY)};
                    //console.log('Moving: ' + e.originalEvent.clientX + ' ' + e.originalEvent.clientX);
                }
            }
        });
    });

    $('#game-canvas').on('mouseup', function(e) {
        e.preventDefault();
        if (dragMode) {
            dragMode = false;
            lastDragCoords = null;
            originalDragCoords = null;
            $('#game-canvas').off('mousemove');
            //console.log('End:' + e.originalEvent.clientX + ' ' + e.originalEvent.clientY);
        }
    });

    var positions = [[0,0], [-2140, -110], [-2497, -1765], [-770, -1994], [-682,-1040]];
    var currPosition = 0;

    $(document).keydown(function(evt) {
        var key = evt.which;
        switch(key) {
            case 39:
                console.log("right");

                var oldPos = positions[currPosition];
                if (currPosition == positions.length -1)  {
                    currPosition = 0;
                }
                else {
                    currPosition += 1;
                }

                var newPos = positions[currPosition];
                var xDelta = Math.abs(oldPos[0] - newPos[0]);
                var yDelta = Math.abs(oldPos[1] - newPos[1]);
                var tweenX = new Tween(mapContainer.position, "x", newPos[0], xDelta/10, false);
                var tweenY = new Tween(mapContainer.position, "y", newPos[1], yDelta/10, false);
                var chain = new ChainedTween([tweenX, tweenY]);
                animate();
                break;
        }
    });

    function animate() {
        requestAnimFrame(animate);
        // Trigger all Tweens each frame
        Tween.runTweens();
        renderer.render(app.stage);
    }
}