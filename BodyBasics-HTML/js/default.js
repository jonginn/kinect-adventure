﻿(function () {
    "use strict";

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var sdk = WindowsPreview.Kinect;
    var sensor,
        reader,
        bodies;

    var player = [
        {
            color: 'blue',
            role: 'drums',
            sounds: [
                '1', '2', '3', '4'
            ],
            playerNumber: 1,
        },
        {
            color: 'red',
            role: 'bass',
            sounds: [
                '1', '2', '3', '4'
            ],
            playerNumber: 2,
        },
        {
            color: 'purple',
            role: 'sounds',
            sounds: [
                '1', '2', '3', '4'
            ],
            playerNumber: 3,
        },
        {
            color: 'green',
            role: 'sounds',
            sounds: [
                '5', '6', '7', '8'
            ],
            playerNumber: 4,
        },
        {
            color: 'pink',
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

    var currentSounds = [-1, -1, -1, -1, -1, -1], targetAudio, targetSrc, targetPlayer, targetID, targetAudioSource;

   function muteAll() {
        var audioElements = document.getElementsByTagName('audio');
        for (var a = 0; a < audioElements.length; a++) {
            audioElements[a].pause();
        }
    }

    // function to fade volume

    var audioLength = 4000;
    function switchTracks() {
        //muteAll();
        for (var s = 0; s < currentSounds.length; s++) {
            targetID = "player" + (s + 1) + "audio";
            targetAudio = document.getElementById(targetID);
            targetAudio.pause();

            if (currentSounds[s] > -1) {
                targetAudioSource = document.getElementById(targetID + "-source");
                targetPlayer = player[s];
                targetSrc = "/music/" + targetPlayer.role + ".1." + currentSounds[s] + ".mp3";
                targetAudio.src = targetSrc;
                targetAudio.volume = 1;
                targetAudio.play();
            } else {
                targetAudio.pause();
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
            trackingSize = 50,
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
                ctx.fillRect(leftHandPosition.x, leftHandPosition.y, trackingSize, trackingSize);
                rightHandPosition = sensor.coordinateMapper.mapCameraPointToColorSpace(handRight.position);
                ctx.fillRect(rightHandPosition.x, rightHandPosition.y, trackingSize, trackingSize);
                headPosition = sensor.coordinateMapper.mapCameraPointToColorSpace(head.position);
                ctx.fillRect(headPosition.x, headPosition.y, trackingSize, trackingSize);

                setSound(player[i], headPosition, leftHandPosition, rightHandPosition);
            }
        }
    }

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            var canvas = document.getElementById('myCanvas');
            var ctx = canvas.getContext('2d');
            sensor = sdk.KinectSensor.getDefault();
            sensor.open();
            bodies = new Array(sensor.bodyFrameSource.bodyCount);
            reader = sensor.bodyFrameSource.openReader();
            //muteAll();
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

       // var audioEl = document.getElementById('player1audio');
        //audioEl.play();
    };

    app.start();
})();
