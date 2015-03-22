(function () {
    "use strict";

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var sdk = WindowsPreview.Kinect;
    var sensor,
        reader,
        bodies;

    var player = [
        {
            color: '#2C64C4',
            role: 'drums',
            sounds: [
                '1', '2', '3', '4'
            ],
            playerNumber: 1,
        },
        {
            color: '#D4214F',
            role: 'bass',
            sounds: [
                '1', '2', '3', '4'
            ],
            playerNumber: 2,
        },
        {
            color: '#0AFDCC',
            role: 'sounds',
            sounds: [
                '1', '2', '3', '4'
            ],
            playerNumber: 3,
        },
        {
            color: '#f8e9db',
            role: 'sounds',
            sounds: [
                '5', '6', '7', '8'
            ],
            playerNumber: 4,
        },
        {
            color: 'purple',
            role: 'sounds',
            sounds: [
                '9', '10', '11', '12'
            ],
            playerNumber: 5,
        },
        {
            color: 'yellow',
            role: 'bass',
            sounds: [
                '3', '4', '5', '6'
            ],
            playerNumber: 6,
        },
    ];

    var bassNumbers = 6, bassElements = [];
    var drumNumbers = 6, drumElements = [];
    var soundNumbers = 12, soundElements = [];
    var tempElement;

    var theContainer = document.getElementById("audio-container");

    function createAudioElements() {
        for (var x = 0; x < (bassNumbers - 1); x++) {
            tempElement = document.createElement("audio");
            tempElement.src = "music/bass.1." + (x + 1) + ".mp3";
            tempElement.id = "bass-" + (x + 1);
            theContainer.appendChild(tempElement);
            bassElements.push(tempElement);
        }
        for (var x = 0; x < (drumNumbers - 1); x++) {
            tempElement = document.createElement("audio");
            tempElement.src = "music/drum.1." + (x + 1) + ".mp3";
            tempElement.id = "drums-" + (x + 1);
            theContainer.appendChild(tempElement);
            drumElements.push(tempElement);
        }
        for (var x = 0; x < (soundNumbers - 1); x++) {
            tempElement = document.createElement("audio");
            tempElement.src = "music/sounds.1." + (x + 1) + ".mp3";
            tempElement.id = "sounds-" + (x + 1);
            theContainer.appendChild(tempElement);
            soundElements.push(tempElement);
        }
    }

    var currentSounds = [-1, -1, -1, -1, -1, -1], targetAudio, targetSrc, targetPlayer, targetID, targetAudioSource;

   function muteAll() {
        var audioElements = document.getElementsByTagName('audio');
        for (var a = 0; a < audioElements.length; a++) {
            if (typeof audioElements[a].loop == 'boolean')
                {
                    audioElements[a].loop = true;
                }
                else
                {
                    audioElements[a].addEventListener('ended', function () {
                        this.currentTime = 0;
                        this.play();
                    }, false);
                }
            audioElements[a].pause();
        }
    }

    // function to fade volume

    var audioLength = 8000;
    function switchTracks() {
        muteAll();
        for (var s = 0; s < currentSounds.length; s++) {
            if (currentSounds[s] > -1) {
                targetPlayer = player[s];
                targetID = targetPlayer.role + "-" + currentSounds[s];
                targetAudio = document.getElementById(targetID);
                targetAudio.play();
            }
        }
    }

function setSound(playerData, headPosition, leftHandPosition, rightHandPosition) {
    var role = playerData.role;
    var sounds = playerData.sounds, soundToPlay;

    var l = leftHandPosition.y;
    var r = rightHandPosition.y;
    var h = headPosition.y;

    if ((l > h) && (r > h)) {
        // both hands up
        soundToPlay = playerData.sounds[0];
    } else if ((l <= h) && (r > h)) {
        // right hand up
        soundToPlay = playerData.sounds[1];
    } else if ((l > h) && (r <= h)) {
        // left hand up
        soundToPlay = playerData.sounds[2];
    } else if ((l <= h) && (r <= h)) {
        // both hands down
        soundToPlay = playerData.sounds[3];
    }

    currentSounds[playerData.playerNumber - 1] = soundToPlay;

    var debug = document.getElementById("nowplaying");
    debug.innerHTML = currentSounds.toString();
}
    function drawPlayers(sensor, ctx, bodies) {
        var currentBody,
            handLeft,
            handRight,
            head,
            colSpacePosition,
            trackingSize = 50, trackingSizeSmaller = 40,
            headPosition,
            leftHandPosition,
            rightHandPosition;

        var trackedBodies = bodies.filter(function (b) { return (b.isTracked); });

        if (trackedBodies.length > 0) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            for (var i = 0; i < trackedBodies.length; i++) {
                currentBody = trackedBodies[i];

                handLeft = currentBody.joints.lookup(sdk.JointType.handLeft);
                handRight = currentBody.joints.lookup(sdk.JointType.handRight);
                head = currentBody.joints.lookup(sdk.JointType.head);

                ctx.fillStyle = player[i].color;
                leftHandPosition = sensor.coordinateMapper.mapCameraPointToColorSpace(handLeft.position);
                ctx.fillRect(leftHandPosition.x, leftHandPosition.y, trackingSizeSmaller, trackingSizeSmaller);
                rightHandPosition = sensor.coordinateMapper.mapCameraPointToColorSpace(handRight.position);
                ctx.fillRect(rightHandPosition.x, rightHandPosition.y, trackingSizeSmaller, trackingSizeSmaller);
                headPosition = sensor.coordinateMapper.mapCameraPointToColorSpace(head.position);
                ctx.fillRect(headPosition.x, headPosition.y, trackingSize, trackingSize);
                
                setSound(player[i], headPosition, leftHandPosition, rightHandPosition);
            }
        }
    }

    app.onactivated = function (args) {
        createAudioElements();
        if (args.detail.kind === activation.ActivationKind.launch) {
            var canvas = document.getElementById('myCanvas');
            var ctx = canvas.getContext('2d');
            sensor = sdk.KinectSensor.getDefault();
            sensor.open();
            bodies = new Array(sensor.bodyFrameSource.bodyCount);
            reader = sensor.bodyFrameSource.openReader();
            //muteAll();
            switchTracks();
            window.setInterval(switchTracks, audioLength);
            reader.addEventListener('framearrived', function (args) {
                var bodyFrame = args.frameReference.acquireFrame();
                if (bodyFrame) {
                    bodyFrame.getAndRefreshBodyData(bodies);
                    drawPlayers(sensor, ctx, bodies);
                    bodyFrame.close();
                }
            });
        }
    };

    app.start();
})();
