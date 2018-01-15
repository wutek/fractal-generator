/*jslint
    browser, for, fudge
*/

/*global
    Complex, window
*/

(function (fractal) {
	/* private atributes */
	var x0 = -1.8, y0 = -1.35;
	var width = 3.6, height = 2.7;
	var c = new Complex(0.377, -0.278);
	var zoomP1 = [0, 0], zoomP2 = [0, 0];
	var brightness = 4;
	var nIterations = 256;
	var bSelection = false;
	var resolution = "640x480";
	var nFunction = 2;

	/* public atributes */
	fractal.canvas = document.getElementById("mainCanvas");
	fractal.imageData = fractal.canvas.getContext("2d").createImageData(fractal.canvas.width, fractal.canvas.height);

	/* private methods */
	function setPixel(x, y, r, g, b, a) {
		var index = (x + y * fractal.imageData.width) * 4;

		fractal.imageData.data[index] = r;
		fractal.imageData.data[index + 1] = g;
		fractal.imageData.data[index + 2] = b;
		fractal.imageData.data[index + 3] = a;
	}

	function getCoordinates(point) { //converts pixels to real numbers
		var x = point[0];
		var y = point[1];

		x = x0 + width * x / fractal.canvas.width;
		y = y0 + height * (fractal.canvas.height - y) / fractal.canvas.height;

		return [x, y];
	}

	/* public methods */
	fractal.depth = function (x, y) {
		var z = new Complex(x0 + x * (width / fractal.imageData.width), y0 + y * (height / fractal.imageData.height));

		for (var i = 1; i <= nIterations; i++) {
			switch (nFunction) {
				case 2:
					z.square();
					break;
				case 3:
					z.cube();
					break;
				case 4:
					z.power4();
					break;
				case 5:
					z.power5();
					break;
			}
			z.add(c);
			if (z.norm() > 25) return i;
		}

		return 0;
	};

	fractal.render = function () {
		var x, y, b;
		var t0 = new Date().getTime();

		for (x = 0; x < fractal.imageData.width; x++) {
			for (y = 0; y < fractal.imageData.height; y++) {
				b = Math.floor(brightness * fractal.depth(x, y));
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

		var time = new Date().getTime() - t0;
		document.getElementById("time").innerHTML = "fractal generated in " + (time/1000) + " s";
		return time;
	};

	fractal.getXY = function (event) {
		var rect = fractal.canvas.getBoundingClientRect();
		var x = event.clientX - rect.left.toFixed(0);
		var y = event.clientY - rect.top.toFixed(0);

		return [x, y];
	};

	fractal.zoomToPoint = function (point) {
		var x = point[0];
		var y = point[1];

		var scale = 0.96;

		width *= scale;
		height *= scale;

		x0 = x - (Math.abs(x0 - x) * scale);
		y0 = y - (Math.abs(y0 - y) * scale);

		fractal.render();
		fractal.updateStatus();
	};

	fractal.zoomToRectangle = function () {
		if (zoomP1[0] === zoomP2[0] || zoomP1[1] === zoomP2[1]) return 0;

		var x = getCoordinates(zoomP1);
		var y = getCoordinates(zoomP2);


		width = Math.abs(x[0] - y[0]);
		height = Math.abs(x[1] - y[1]);

		x0 = Math.min(x[0], y[0]);
		y0 = Math.min(x[1], y[1]);

		fractal.render();
		fractal.updateStatus();

		zoomP1 = [0, 0]; zoomP2 = [0, 0];
	};

	fractal.updateStatus = function () {
		document.getElementById("fractal_height").value = height;
		document.getElementById("fractal_width").value = width;
		document.getElementById("fractal_y0").value = y0;
		document.getElementById("fractal_x0").value = x0;
		document.getElementById("fractal_cReal").value = c.real;
		document.getElementById("fractal_cImg").value = c.img;
		document.getElementById("fractal_brightness").value = brightness;
		document.getElementById("fractal_iterations").value = nIterations;
		document.getElementById("fractal_resolution").value = resolution;
	};

	fractal.select = function (p1, p2) {
		for (var x = Math.min(p1[0], p2[0]); x < Math.max(p1[0], p2[0]); x++) {
			for (var y = Math.min(p1[1], p2[1]); y < Math.max(p1[1], p2[1]); y++) {
				fractal.imageData.data[(x + y * fractal.imageData.width) * 4 + 3] = 190;
			}
		}
		fractal.canvas.getContext("2d").putImageData(fractal.imageData, 0, 0);
	};

	fractal.deselect = function () {
		for (var x=fractal.imageData.width*fractal.imageData.height*4; x; x-=4) {
			fractal.imageData.data[x+3]=255;
		}
		fractal.canvas.getContext("2d").putImageData(fractal.imageData, 0, 0);
	};

    fractal.canvas.addEventListener("mousedown", function (event) {
		if (event.which != 1) return; //only left button

		zoomP1 = fractal.getXY(event);
		bSelection = true;
	});

    fractal.canvas.addEventListener("mousemove", function (event) {
		if (bSelection)
		{
			zoomP2 = fractal.getXY(event);

			fractal.deselect();
			fractal.select(zoomP1, zoomP2);
		}
	});

    fractal.canvas.addEventListener("mouseup", function (event) {
		if (event.which != 1) return; //only left button

		zoomP2 = fractal.getXY(event);
		bSelection = false

		fractal.deselect();
		fractal.select(zoomP1, zoomP2);

		//check if it was selection or the click
		if (zoomP1[0]==zoomP2[0] && zoomP1[1]==zoomP2[1]) {
			fractal.zoomToPoint(getCoordinates(fractal.getXY(event)));
		}
	});

    fractal.canvas.addEventListener("mouseout", function () {
		if (bSelection)
		{
			bSelection = false;

			fractal.deselect();
			fractal.select(zoomP1, zoomP2);
		}
	});

	fractal.update = function () {
		c.real = parseFloat(document.getElementById("fractal_cReal").value);
		c.img = parseFloat(document.getElementById("fractal_cImg").value);
		width = parseFloat(document.getElementById("fractal_width").value);
		height = parseFloat(document.getElementById("fractal_height").value);
		x0 = parseFloat(document.getElementById("fractal_x0").value);
		y0 = parseFloat(document.getElementById("fractal_y0").value);
		brightness = parseFloat(document.getElementById("fractal_brightness").value);
		nIterations = parseInt(document.getElementById("fractal_iterations").value);
		nFunction = parseInt(document.getElementById("fractal_function").value);
		fractal.resize(document.getElementById("fractal_resolution").value);
	};

	fractal.random = function () {
		c.real = (Math.floor(Math.random() * 1800 - 900)) / 1000;
		c.img = (Math.floor(Math.random() * 1800 - 900)) / 1000;
		width = 3.6; height = 2.7;
		x0 = -1.8; y0 = -1.35;

		fractal.render();
		fractal.updateStatus();
	};

	fractal.test = function () {
		var x = 0.7988606729802393;
		var y = 0.4650996687315542;

		var scale = 0.96;

		width *= scale;
		height *= scale;

		x0 = x - (Math.abs(x0 - x) * scale);
		y0 = y - (Math.abs(y0 - y) * scale);

		fractal.render();
		fractal.updateStatus();

		if (document.getElementById("stop").value != "stop")
			setTimeout(fractal.test, 10);
	}	

	fractal.resize = function (size) {
		switch (size) {
			case '320x240':
				fractal.canvas.width = 320;
				fractal.canvas.height = 240;
				break;
			case '640x480':
				fractal.canvas.width = 640;
				fractal.canvas.height = 480;
				break;
			case '800x600':
				fractal.canvas.width = 800;
				fractal.canvas.height = 600;
				break;
			case '1024x768':
				fractal.canvas.width = 1024;
				fractal.canvas.height = 768;
				break;
			case '1800x1200':
				fractal.canvas.width = 1800;
				fractal.canvas.height = 1200;
				break;
			case '4000x3000':
				fractal.canvas.width = 4000;
				fractal.canvas.height = 3000;
				break;
		}
		resolution = size;
		fractal.imageData = fractal.canvas.getContext("2d").createImageData(fractal.canvas.width, fractal.canvas.height);
		fractal.render();
		fractal.updateStatus();
	};

	fractal.render();
	fractal.updateStatus();

}(window.fractal = window.fractal || {}));
