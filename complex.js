function Complex(real, img) {
	this.real = real;
	this.img = img;
}

Complex.prototype = {
	real: 0,
	img: 0,
	toString: function () {
		return this.real + (this.img >= 0 ? "+" : "") + this.img + "i";
	},
	add: function (c) {
		this.real += c.real;
		this.img += c.img;
		return this;
	},
	multiply: function (c) {
		return new Complex(this.real * c.real - this.img * c.img, this.real * c.img + this.img * c.real);
	},
	mod: function () {
		return Math.sqrt(this.real * this.real + this.img * this.img);
	},
	norm: function () {
		return this.real * this.real + this.img * this.img;
	},
	vector: function (x, y) {
		this.real += x;
		this.img += y;
	},
	square: function () {
		var x = this.real * this.real - this.img * this.img;
		this.img = this.img * this.real * 2;
		this.real = x;
		return this;
	},
	cube: function () {
		var x = this.real;
		var y = this.img;
		this.square();
		var z = this.real * x - this.img * y;
		this.img = this.real * y + this.img * x;
		this.real = z;
		return this;
	},
	power4: function () {
		this.square();
		this.square();
		return this;
	},
	power5: function () {
		var x = this.real;
		var y = this.img;
		this.square();
		this.square();
		var z = this.real * x - this.img * y;
		this.img = this.real * y + this.img * x;
		this.real = z;
		return this;
	},
	copy: function (x, y) {
		this.real = x;
		this.img = y;
	}
};
