/*jslint
    browser
*/

/*global
    Complex, window
*/

window.fractal = window.fractal || {};

(function (fractal) {
    "use strict";

    const renderOptions = {
        functionFormula: 2,
        resolution: "640x480",
        selection: false,
        iterations: 256,
        brightness: 4,
        x0: -1.8,
        y0: -1.35,
        width: 3.6,
        height: 2.7,
        c: new Complex(0.377, -0.278)
    };
    let zoomP1 = [0, 0];
    let zoomP2 = [0, 0];
    const canvas = document.getElementById("mainCanvas");
    let imageData = canvas.getContext("2d").createImageData(canvas.width, canvas.height);

    function setPixel(x, y, r, g, b, a) {
        const index = (x + y * imageData.width) * 4;

        imageData.data[index] = r;
        imageData.data[index + 1] = g;
        imageData.data[index + 2] = b;
        imageData.data[index + 3] = a;
    }

    function getCoordinates(point) {
        const x = renderOptions.x0 + renderOptions.width * point[0] / canvas.width;
        const y = renderOptions.y0 + renderOptions.height * (canvas.height - point[1]) / canvas.height;

        return [x, y];
    }

    function depth(x, y) {
        const z = new Complex(
            renderOptions.x0 + x * (renderOptions.width / imageData.width),
            renderOptions.y0 + y * (renderOptions.height / imageData.height)
        );
        let i = 1;

        while (i <= renderOptions.iterations) {
            z.power(renderOptions.functionFormula);
            z.add(renderOptions.c);
            if (z.norm() > 25) {
                return i;
            }
            i += 1;
        }

        return 0;
    }

    fractal.render = function () {
        let x = 0;
        let t0 = Date.now();

        while (x < imageData.width) {
            let y = 0;
            while (y < imageData.height) {
                let b = Math.floor(renderOptions.brightness * depth(x, y));
                if (b > 0) {
                    setPixel(
                        x,
                        imageData.height - 1 - y,
                        Math.max(b - 511, 0),
                        Math.max(b - 255, 0),
                        Math.min(b, 255),
                        255
                    ); //blue
                    //setPixel(x, imageData.height - 1 - y, b > 255 ? b - 255 : 0, Math.min(b, 255), b > 511 ? b - 511 : 0, 0xFF); //green
                    //setPixel(x, imageData.height - 1 - y, Math.min(b, 255), b > 255 ? b - 255 : 0, b > 511 ? b - 511 : 0, 255); //red
                } else {
                    //if ((x + y) % 20 < 10) {setPixel(x, imageData.height - 1 - y, 255, 0, 0, 255);} else //uncomment for red/white stripes
                    setPixel(x, imageData.height - 1 - y, 0xFF, 0xFF, 0xFF, 0xFF);
                }
                y += 1;
            }
            x += 1;
        }
        canvas.getContext("2d").putImageData(imageData, 0, 0);

        let time = Date.now() - t0;
        document.getElementById("time").innerHTML = "fractal generated in " + (time / 1000) + " s";
        return time;
    };

    fractal.getXY = function (event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left.toFixed(0);
        const y = event.clientY - rect.top.toFixed(0);

        return [x, y];
    };

    fractal.zoomToPoint = function (point) {
        const x = point[0];
        const y = point[1];
        const scale = 0.96;

        renderOptions.width *= scale;
        renderOptions.height *= scale;

        renderOptions.x0 = x - (Math.abs(renderOptions.x0 - x) * scale);
        renderOptions.y0 = y - (Math.abs(renderOptions.y0 - y) * scale);

        fractal.render();
        fractal.updateStatus();
    };

    fractal.zoomToRectangle = function () {
        if (zoomP1[0] === zoomP2[0] || zoomP1[1] === zoomP2[1]) {
            return;
        }

        const x = getCoordinates(zoomP1);
        const y = getCoordinates(zoomP2);


        renderOptions.width = Math.abs(x[0] - y[0]);
        renderOptions.height = Math.abs(x[1] - y[1]);

        renderOptions.x0 = Math.min(x[0], y[0]);
        renderOptions.y0 = Math.min(x[1], y[1]);

        fractal.render();
        fractal.updateStatus();

        zoomP1 = [0, 0];
        zoomP2 = [0, 0];
    };

    fractal.updateStatus = function () {
        document.getElementById("fractal_height").value = renderOptions.height;
        document.getElementById("fractal_width").value = renderOptions.width;
        document.getElementById("fractal_y0").value = renderOptions.y0;
        document.getElementById("fractal_x0").value = renderOptions.x0;
        document.getElementById("fractal_cReal").value = renderOptions.c.real;
        document.getElementById("fractal_cImg").value = renderOptions.c.img;
        document.getElementById("fractal_brightness").value = renderOptions.brightness;
        document.getElementById("fractal_iterations").value = renderOptions.iterations;
        document.getElementById("fractal_resolution").value = renderOptions.resolution;
    };

    function select(p1, p2) {
        let x = imageData.width * imageData.height * 4;
        while (x > 0) {
            imageData.data[x + 3] = 255;
            x -= 4;
        }

        x = Math.min(p1[0], p2[0]);
        while (x < Math.max(p1[0], p2[0])) {
            let y = Math.min(p1[1], p2[1]);
            while (y < Math.max(p1[1], p2[1])) {
                imageData.data[(x + y * imageData.width) * 4 + 3] = 190;
                y += 1;
            }
            x += 1;
        }
        canvas.getContext("2d").putImageData(imageData, 0, 0);
    }

    canvas.addEventListener("mousedown", function (event) {
        if (event.which !== 1) {
            return; //only left button
        }

        zoomP1 = fractal.getXY(event);
        renderOptions.selection = true;
    }, false);

    canvas.addEventListener("mousemove", function (event) {
        if (renderOptions.selection) {
            zoomP2 = fractal.getXY(event);

            select(zoomP1, zoomP2);
        }
    }, false);

    canvas.addEventListener("mouseup", function (event) {
        if (event.which !== 1) {
            return; //only left button
        }

        zoomP2 = fractal.getXY(event);
        renderOptions.selection = false;

        select(zoomP1, zoomP2);

        //check if it was selection or the click
        if (zoomP1[0] === zoomP2[0] && zoomP1[1] === zoomP2[1]) {
            fractal.zoomToPoint(getCoordinates(fractal.getXY(event)));
        }
    }, false);

    canvas.addEventListener("mouseout", function () {
        if (renderOptions.selection) {
            renderOptions.selection = false;

            select(zoomP1, zoomP2);
        }
    }, false);

    fractal.update = function () {
        renderOptions.c.real = parseFloat(document.getElementById("fractal_cReal").value);
        renderOptions.c.img = parseFloat(document.getElementById("fractal_cImg").value);
        renderOptions.width = parseFloat(document.getElementById("fractal_width").value);
        renderOptions.height = parseFloat(document.getElementById("fractal_height").value);
        renderOptions.x0 = parseFloat(document.getElementById("fractal_x0").value);
        renderOptions.y0 = parseFloat(document.getElementById("fractal_y0").value);
        renderOptions.brightness = parseFloat(document.getElementById("fractal_brightness").value);
        renderOptions.iterations = parseInt(document.getElementById("fractal_iterations").value);
        renderOptions.functionFormula = parseInt(document.getElementById("fractal_function").value);
        fractal.resize(document.getElementById("fractal_resolution").value);
    };

    fractal.random = function () {
        renderOptions.c.real = (Math.floor(Math.random() * 1800 - 900)) / 1000;
        renderOptions.c.img = (Math.floor(Math.random() * 1800 - 900)) / 1000;
        renderOptions.width = 3.6;
        renderOptions.height = 2.7;
        renderOptions.x0 = -1.8;
        renderOptions.y0 = -1.35;

        fractal.render();
        fractal.updateStatus();
    };

    fractal.resize = function (size) {
        switch (size) {
        case "320x240":
            canvas.width = 320;
            canvas.height = 240;
            break;
        case "640x480":
            canvas.width = 640;
            canvas.height = 480;
            break;
        case "800x600":
            canvas.width = 800;
            canvas.height = 600;
            break;
        case "1024x768":
            canvas.width = 1024;
            canvas.height = 768;
            break;
        case "1800x1200":
            canvas.width = 1800;
            canvas.height = 1200;
            break;
        case "4000x3000":
            canvas.width = 4000;
            canvas.height = 3000;
            break;
        default:
            return;
        }
        renderOptions.resolution = size;
        imageData = canvas.getContext("2d").createImageData(canvas.width, canvas.height);
        fractal.render();
        fractal.updateStatus();
    };

    fractal.render();
    fractal.updateStatus();

}(window.fractal));
