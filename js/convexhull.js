(function () {
    self.addEventListener("message", function (e) {
        switch (e.data.type) {
            case "convexHull":
                self.postMessage({
                    type: "convexHull",
                    hull: convexHull(e.data.points, e.data.delay)
                });
                break;
            case "randomPoints":
                xMin = (e.data.xMin) ? e.data.xMin : -20;
                xMax = (e.data.xMax) ? e.data.xMax : 20;
                yMin = (e.data.yMin) ? e.data.yMin : -20;
                yMax = (e.data.yMax) ? e.data.yMax : 20;

                nMin = (e.data.nMin) ? e.data.nMin : 10;
                nMax = (e.data.nMax) ? e.data.nMax : 30;

                self.postMessage({
                    type: "randomPoints",
                    points: randomPoints(nMin, nMax, xMin, xMax, yMin, yMax)
                });
                break;
        }
    }, false);

    function sleep(milliseconds) {
        var start = new Date().getTime();
        while (true) {
            if ((new Date().getTime() - start) > milliseconds) {
                break;
            }
        }
    }

    function randomPoint(xMin, xMax, yMin, yMax) {
        return [(Math.random() * (xMax - xMin) + xMin).toFixed(2),
                (Math.random() * (yMax - yMin) + yMin).toFixed(2)];
    }

    function randomPoints(nMin, nMax, xMin, xMax, yMin, yMax) {
        var n = Math.floor(Math.random() * (nMax - nMin) + nMin);
        var points = [];
        for (var i = 0; i < n; ++i) {
            points.push(randomPoint(xMin, xMax, yMin, yMax));
        }
        return points;
    }

    function lastThreePointsTurnRight(list) {
        var p = list[list.length - 3];
        var q = list[list.length - 2];
        var r = list[list.length - 1];
        var D =   (q[0] * r[1] - q[1] * r[0])
                - (p[0] * r[1] - p[1] * r[0])
                + (p[0] * q[1] - p[1] * q[0]);
        return (D < 0);
    }

    function convexHull(points, delay) {
        if (!delay || delay < 0)
            delay = 0;

        var n = points.length;
        if (n <= 2)
            return points;

        points.sort(function (p, q) {
            if (p[0] != q[0])
                return p[0] - q[0];
            else
                return p[1] - q[1];
        });

        var i;

        // Compute upper hull
        var upperHull = [];
        upperHull.push(points[0]);
        upperHull.push(points[1]);
        for (i = 2; i < n; ++i) {
            upperHull.push(points[i]);
            while (upperHull.length > 2 && !lastThreePointsTurnRight(upperHull)) {
                upperHull.splice(upperHull.length - 2, 1);
            }
            if (delay > 0) {
                self.postMessage({
                    type: "upperHull",
                    info: upperHull
                });
                sleep(delay);
            }
        }

        // Compute lower hull
        var lowerHull = [];
        lowerHull.push(points[n - 1]);
        lowerHull.push(points[n - 2]);
        for (i = n - 3; i >= 0; --i) {
            lowerHull.push(points[i]);
            while (lowerHull.length > 2 && !lastThreePointsTurnRight(lowerHull)) {
                lowerHull.splice(lowerHull.length - 2, 1);
            }
            if (delay > 0) {
                self.postMessage({
                    type: "lowerHull",
                    info: lowerHull,
                    info2: upperHull
                });
                sleep(delay);
            }
        }

        upperHull.pop();
        lowerHull.pop();
        hull = upperHull.concat(lowerHull);

        return hull;
    }
})();
