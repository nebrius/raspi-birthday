/*
MIT License

Copyright (c) 2017 Bryan Hughes <bryan@nebri.us>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const Raspi = require('raspi-io');
const five = require('johnny-five');
const Oled = require('oled-js');
const crypto = require('crypto');
const font = require('oled-font-5x7');

const board = new five.Board({
  io: new Raspi({
    enableSoftPwm: true
  })
});

const CANDLE_1_PIN = 'GPIO18';
const CANDLE_2_PIN = 'GPIO24';
const CANDLE_3_PIN = 'GPIO16';

const MIN_LED_BRIGHTNESS = 100;
const MAX_LED_BRIGHTNESS = 255;
const STEP_TIME = 500;
const FADE_TIME = 75;

function random(min, max, cb) {

}

board.on('ready', () => {

  const candle1 = new five.Led(CANDLE_1_PIN);
  const candle2 = new five.Led(CANDLE_2_PIN);
  const candle3 = new five.Led(CANDLE_3_PIN);

  const brightnesses = {
    [CANDLE_1_PIN]: 0,
    [CANDLE_2_PIN]: 0,
    [CANDLE_3_PIN]: 0
  };

  function flicker() {

    crypto.randomBytes(12, (err, buf) => {
      if (err) {
        console.error(err);
        process.exit(-1);
        return;
      }

      function getBrightness(offset) {
        return Math.round(Math.abs((buf.readInt32LE(offset) / Math.pow(2, 32)) * (MIN_LED_BRIGHTNESS - MAX_LED_BRIGHTNESS) + MIN_LED_BRIGHTNESS));
      }

      candle1.fade(getBrightness(0), FADE_TIME);
      candle2.fade(getBrightness(4), FADE_TIME);
      candle3.fade(getBrightness(8), FADE_TIME);

      setTimeout(flicker, Math.random() * STEP_TIME + FADE_TIME);

    });
  }
  flicker();

  const oled = new Oled(board, five, {
    width: 128,
    height: 64,
    address: 0x3C
  });
  oled.fillRect(0, 0, 128, 64, 0);
  oled.setCursor(28, 1);
  oled.writeString(font, 1, 'Happy Third', 1, true, 2);
  oled.setCursor(38, 15);
  oled.writeString(font, 1, 'Birthday', 1, true, 2);
  oled.setCursor(30, 30);
  oled.writeString(font, 1, 'Raspi IO!!!', 1, true, 2);
});
