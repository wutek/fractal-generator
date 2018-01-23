/*jslint
    browser, for, fudge
*/

/*global
    Complex, window
*/

window.fractal = window.fractal || {};

(function (fractal) {
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

    /* public atributes */
    fractal.canvas = document.getElementById("mainCanvas");
    fractal.imageData = fractal.canvas.getContext("2d").createImageData(fractal.canvas.width, fractal.canvas.height);

    /* private methods */
    function setPixel(x, y, r, g, b, a) {
        let index = (x + y * fractal.imageData.width) * 4;

        fractal.imageData.data[index] = r;
        fractal.imageData.data[index + 1] = g;
        fractal.imageData.data[index + 2] = b;
        fractal.imageData.data[index + 3] = a;
    }

    function getCoordinates(point) { //converts pixels to real numbers
        let x = point[0];
        let y = point[1];

        x = renderOptions.x0 + renderOptions.width * x / fractal.canvas.width;
        y = renderOptions.y0 + renderOptions.height * (fractal.canvas.height - y) / fractal.canvas.height;

        return [x, y];
    }

    /* public methods */
    fractal.depth = function (x, y) {
        let z = new Complex(
            renderOptions.x0 + x * (renderOptions.width / fractal.imageData.width),
            renderOptions.y0 + y * (renderOptions.height / fractal.imageData.height)
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
    };

    fractal.render = function () {
        let x;
        let y;
        let b;
        let t0 = new Date().getTime();

        for (x = 0; x < fractal.imageData.width; x += 1) {
            for (y = 0; y < fractal.imageData.height; y += 1) {
                b = Math.floor(renderOptions.brightness * fractal.depth(x, y));
                if (b > 0) {
                    setPixel(x, fractal.imageData.height - 1 - y, b > 511 ? b - 511 : 0, b > 255 ? b - 255 : 0, Math.min(b, 255), 255); //blue
                    //setPixel(x, fractal.imageData.height - 1 - y, b > 255 ? b - 255 : 0, Math.min(b, 255), b > 511 ? b - 511 : 0, 0xFF); //green
                    //setPixel(x, fractal.imageData.height - 1 - y, Math.min(b, 255), b > 255 ? b - 255 : 0, b > 511 ? b - 511 : 0, 255); //red
                } else {
                    //if ((x + y) % 20 < 10) {setPixel(x, fractal.imageData.height - 1 - y, 255, 0, 0, 255);} else //uncomment for red/white stripes
                    setPixel(x, fractal.imageData.height - 1 - y, 0xFF, 0xFF, 0xFF, 0xFF);
                }
            }
        }
        fractal.canvas.getContext("2d").putImageData(fractal.imageData, 0, 0);

        let time = new Date().getTime() - t0;
        document.getElementById("time").innerHTML = "fractal generated in " + (time/1000) + " s";
        return time;
    };

    fractal.getXY = function (event) {
        let rect = fractal.canvas.getBoundingClientRect();
        let x = event.clientX - rect.left.toFixed(0);
        let y = event.clientY - rect.top.toFixed(0);

        return [x, y];
    };

    fractal.zoomToPoint = function (point) {
        let x = point[0];
        let y = point[1];

        let scale = 0.96;

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

        let x = getCoordinates(zoomP1);
        let y = getCoordinates(zoomP2);


        renderOptions.width = Math.abs(x[0] - y[0]);
        renderOptions.height = Math.abs(x[1] - y[1]);

        renderOptions.x0 = Math.min(x[0], y[0]);
        renderOptions.y0 = Math.min(x[1], y[1]);

        fractal.render();
        fractal.updateStatus();

        zoomP1 = [0, 0]; zoomP2 = [0, 0];
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

    fractal.select = function (p1, p2) {
        for (let x = Math.min(p1[0], p2[0]); x < Math.max(p1[0], p2[0]); x++) {
            for (let y = Math.min(p1[1], p2[1]); y < Math.max(p1[1], p2[1]); y++) {
                fractal.imageData.data[(x + y * fractal.imageData.width) * 4 + 3] = 190;
            }
        }
        fractal.canvas.getContext("2d").putImageData(fractal.imageData, 0, 0);
    };

    fractal.deselect = function () {
        let x = fractal.imageData.width * fractal.imageData.height * 4;
        while (x > 0) {
            fractal.imageData.data[x+3] = 255;
            x -= 4;
        }
        fractal.canvas.getContext("2d").putImageData(fractal.imageData, 0, 0);
    };

    fractal.canvas.addEventListener("mousedown", function (event) {
        if (event.which != 1) return; //only left button

        zoomP1 = fractal.getXY(event);
        renderOptions.selection = true;
    });

    fractal.canvas.addEventListener("mousemove", function (event) {
        if (renderOptions.selection)
        {
            zoomP2 = fractal.getXY(event);

            fractal.deselect();
            fractal.select(zoomP1, zoomP2);
        }
    });

    fractal.canvas.addEventListener("mouseup", function (event) {
        if (event.which != 1) {
            return; //only left button
        }

        zoomP2 = fractal.getXY(event);
        renderOptions.selection = false

        fractal.deselect();
        fractal.select(zoomP1, zoomP2);

        //check if it was selection or the click
        if (zoomP1[0]==zoomP2[0] && zoomP1[1]==zoomP2[1]) {
            fractal.zoomToPoint(getCoordinates(fractal.getXY(event)));
        }
    });

    fractal.canvas.addEventListener("mouseout", function () {
        if (renderOptions.selection) {
            renderOptions.selection = false;

            fractal.deselect();
            fractal.select(zoomP1, zoomP2);
        }
    });

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
        renderOptions.width = 3.6; renderOptions.height = 2.7;
        renderOptions.x0 = -1.8; renderOptions.y0 = -1.35;

        fractal.render();
        fractal.updateStatus();
    };

    fractal.test = function () {
        let x = 0.7988606729802393;
        let y = 0.4650996687315542;

        let scale = 0.96;

        renderOptions.width *= scale;
        renderOptions.height *= scale;

        renderOptions.x0 = x - (Math.abs(renderOptions.x0 - x) * scale);
        renderOptions.y0 = y - (Math.abs(renderOptions.y0 - y) * scale);

        fractal.render();
        fractal.updateStatus();

        if (document.getElementById("stop").value != "stop") {
            setTimeout(fractal.test, 10);
        }
    }

    fractal.resize = function (size) {
        switch (size) {
            case "320x240":
                fractal.canvas.width = 320;
                fractal.canvas.height = 240;
                break;
            case "640x480":
                fractal.canvas.width = 640;
                fractal.canvas.height = 480;
                break;
            case "800x600":
                fractal.canvas.width = 800;
                fractal.canvas.height = 600;
                break;
            case "1024x768":
                fractal.canvas.width = 1024;
                fractal.canvas.height = 768;
                break;
            case "1800x1200":
                fractal.canvas.width = 1800;
                fractal.canvas.height = 1200;
                break;
            case "4000x3000":
                fractal.canvas.width = 4000;
                fractal.canvas.height = 3000;
                break;
        }
        renderOptions.resolution = size;
        fractal.imageData = fractal.canvas.getContext("2d").createImageData(fractal.canvas.width, fractal.canvas.height);
        fractal.render();
        fractal.updateStatus();
    };

    fractal.render();
    fractal.updateStatus();

}(window.fractal));
