/* lines */
const keypad = { sprites: {} };
keypad.files = '0123456789abcdefghilmnopqrstuvwxyz';
let tap, passwordSprite, password = '';
Sprite.prototype.focus = function(speed, callback) {
	const limit = speed * 4;
	this.animation.overrideProperty('r', 1);
	this.displayFunc = function() {
		this.animation.over.r += speed;
		if (this.animation.over.r >= limit) speed *= -1;
		if (this.animation.over.r <= 0) {
			speed = 0;
			this.animation.over.r = undefined;
			this.displayFunc = undefined;
			if (callback) callback();
		}
	};
};

/* dialogs */
 // ready / needs : [ drawing, voice,  raycast ]
const dialogs = {
	index: 0,
	list: [
		{ file: "hey", next: 'dialog', ready: [false, false, false], delay: 0 },
		{ file: "help", next: 'dialog', ready: [false, false, true], delay: 0 },
		{ file: "password", next: 'keypad', ready: [false, false, true], delay: 0 },
		{ file: "notit", next: 'dialog', ready: [false, false, true], delay: 0 },
		{ file: "inside", next: 'dialog', ready: [false, false, true], delay: 0 },
		{ file: "trybutt", next: 'keypad', ready: [false, false, true], delay: 0 },
		{ file: "littlebutt", next: 'keypad', ready: [false, false, true], delay: 0 },
		{ file: "either", next: 'dialog', ready: [false, false, true], delay: 0 },
		{ file: "past", next: 'dialog', ready: [false, false, true], delay: 0 },
		{ file: "town", next: 'keypad', ready: [false, false, true], delay: 0 },
		{ file: "from", next: 'dialog', ready: [false, false, true], delay: 0 },
		{ file: "cousin", next: 'keypad', ready: [false, false, true], delay: 0 },
		{ file: "dog", next: 'keypad', ready: [false, false, true], delay: 0 },
		{ file: "cat", next: 'keypad', ready: [false, false, true], delay: 0 },
		{ file: "gm", next: 'keypad', ready: [false, false, true], delay: 0 },
		{ file: "fartville", next: 'keypad', ready: [false, false, true], delay: 0 },
		{ file: "alone", next: 'keypad', ready: [false, false, true], delay: 0 },
		{ file: "spring", next: 'keypad', ready: [false, false, true], delay: 0 },
		{ file: "characters", next: 'dialog', ready: [false, false, true], delay: 0 },
		{ file: "banana", next: 'keypad', ready: [false, false, true], delay: 0 }
	],
	next: function() {
		Game.scene = this.current.next;
		if (this.current.next == 'dialog') this.nextDialog();
	},
	nextDialog: function() {
		voice.pause();
		this.index++;
		// this.current = { ...this.list[this.index] }; // clone
		this.load();
	},
	load: function() {
		this.sprite.resetSize();
		this.current = JSON.parse(JSON.stringify(this.list[this.index]));
		this.sprite.addAnimation(`drawings/dialogs/${this.current.file}.json`, () => {
			this.sprite.fit(Game.width);
			this.sprite.animation.onPlayedState = function() {
				dialogs.current.ready[0] = true;
			};
		});
		voice.src = `audio/${this.current.file}.mp3`;
		this.play();
	},
	play: function() {
		Game.scene = 'dialog';
		voice.addEventListener('ended', voiceEnd);
		voice.play();
		toad.playAnimation('Wave+Talk');
		this.sprite.animation.setFrame(0); // play from beginning
	},
	replay: function() {
		this.current = JSON.parse(JSON.stringify(this.list[this.index]));
		this.play();
	},
	isReady: function() {
		return this.current.ready.every(e => { return e; });
	}
};
let voice; /* init with tap */
function voiceEnd() {
	dialogs.current.ready[1] = true;
	toad.playAnimation('Wave');
	voice.removeEventListener('ended', voiceEnd);
}

function start() {
	const o = 6; // random offset
	const c = Math.floor(width / (width > 320 ? 56 : 48)); // columns
	const w = width / c; // column width
	const h = w + 6;
	let x = 0, y = 10;
	const keys = [...keypad.files];
	for (let i = 0; i < keypad.files.length; i++) {
		const index = Cool.randomInt(keys.length - 1);
		const k = keys[index];
		keys.splice(index, 1);
		keypad.sprites[k] = new Sprite(x + Cool.random(-o, o), y + Cool.random(-o, o));
		keypad.sprites[k].addAnimation(`drawings/keypad/${k}.json`);
		x += w;
		if (x > Game.width - w) x = 0, y += h;
	}
	tap = new Sprite(0, 0);
	tap.addAnimation('drawings/ui/tap.json', function() {
		tap.fit(Game.width);
	});
	passwordSprite = new Sprite(0, height - 80);
	passwordSprite.addAnimation('drawings/ui/password.json', function() {
		passwordSprite.fit(Game.width);
	});
	dialogs.sprite = new Sprite(0, 0);
	// dialogs.sprite.debug = true;
}

function draw() {
	switch (Game.scene) {
		case 'tap':
			tap.display();
		break;
		case 'dialog':
			dialogs.sprite.display();
			/* check current dialog */
			if (dialogs.isReady() && !dialogs.current.played) {
				dialogs.current.played = true;
				// setTimeout(dialogs.next.bind(dialogs), dialogs.current.delay);
				dialogs.next();
				/* counter ? */
			}
		break;
		case 'keypad':
			passwordSprite.display();
			for (const k in keypad.sprites) {
				keypad.sprites[k].display();
			}
		break;
	}
}

/* events */
let lastTouch;
function tapStart(ev) {
	lastTouch = { x: ev.touches[0].clientX, y: ev.touches[0].clientY };
}

function tapEnd(ev) {
	switch (Game.scene) {
		case 'tap':
			voice = new Audio();
			// voice.loop = true;
			if (tap.tap(lastTouch.x, lastTouch.y)) {
				tap.focus(4, () => {
					Game.scene = 'dialog';
					animate();
					dialogs.load();
					// makeBananas();
				});
			}
		break;
		case 'keypad':
			for (const k in keypad.sprites) {
				const key =  keypad.sprites[k];
				if (key.tap(lastTouch.x, lastTouch.y)) {
					key.focus(2);
					password += k;
				}
			}
			if (passwordSprite.tap(lastTouch.x, lastTouch.y)) {
				passwordSprite.focus(3, () => {
					switch (dialogs.current.file) {
						case 'trybutt':
							if (password == 'butt') dialogs.nextDialog();
							else dialogs.replay();
						break;
						case 'banana':
							if (password == 'banana') {
								makeBananas();
								dialogs.nextDialog();
							}
							else dialogs.replay();
						break;
						default:
							dialogs.nextDialog();
					}
					password = '';
				});
			}
		break;
	}
}

window.addEventListener('touchstart', tapStart);
window.addEventListener('touchend', tapEnd);

