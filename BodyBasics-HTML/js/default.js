(function () {
    "use strict";

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var sdk = WindowsPreview.Kinect;
    var sensor,
        reader,
        bodies;

    var playerColors = [
        'blue', 'red', 'purple'
    ];

    function drawFirstBody(sensor, ctx, bodies) {
        var currentBody,
            handLeft,
            handRight,
            head,
            colSpacePosition;

        var trackedBodies = bodies.filter(function (b) { return (b.isTracked); });

        if (trackedBodies.length > 0) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            for (var i = 0; i < trackedBodies.length; i++) {
                currentBody = trackedBodies[i];

                handLeft = currentBody.joints.lookup(sdk.JointType.handLeft);
                handRight = currentBody.joints.lookup(sdk.JointType.handRight);
                head = currentBody.joints.lookup(sdk.JointType.head);

                ctx.fillStyle = playerColors[i];
                colSpacePosition = sensor.coordinateMapper.mapCameraPointToColorSpace(handLeft.position);
                ctx.fillRect(colSpacePosition.x, colSpacePosition.y, 100, 100);
                colSpacePosition = sensor.coordinateMapper.mapCameraPointToColorSpace(handRight.position);
                ctx.fillRect(colSpacePosition.x, colSpacePosition.y, 100, 100);
                colSpacePosition = sensor.coordinateMapper.mapCameraPointToColorSpace(head.position);
                ctx.fillRect(colSpacePosition.x, colSpacePosition.y, 100, 100);
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
            reader.addEventListener('framearrived', function (args) {
                var bodyFrame = args.frameReference.acquireFrame();
                if (bodyFrame) {
                    bodyFrame.getAndRefreshBodyData(bodies);
                    drawFirstBody(sensor, ctx, bodies);
                    bodyFrame.close();
                }
            });
        }
    };

    app.start();
})();
