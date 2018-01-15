/*jslint
    this
*/

"use strict";

function Complex(real, img) {
    this.real = real;
    this.img = img;
}

Complex.prototype = {
    real: 0,
    img: 0,
    toString: function () {
        if (this.img >= 0) {
            return this.real + "+" + this.img + "i";
        } else {
            return this.real + this.img + "i";
        }
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
    power: function (n) {
        let x;
        while (n >= 2) {
            x = this.real * this.real - this.img * this.img;
            this.img = this.img * this.real * 2;
            this.real = x;
            n -= 1;
        }
    },
    copy: function (x, y) {
        this.real = x;
        this.img = y;
    }
};
