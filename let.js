/* lines */
const keypad = { sprites: {} };
keypad.files = '0123456789abcdefghilmnopqrstuvwxyz';
let tap, credits, flushSprite, passwordSprite, password = '';
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
const dlgs = {
	index: 0,
	list: [
		{ file: "hey", next: 'dialog', ready: [false, false, false] },
		{ file: "help", next: 'dialog', ready: [false, false, true] },
		{ file: "password", next: 'keypad', ready: [false, false, true] },

		{ file: "notit", next: 'dialog', ready: [false, false, true] },
		{ file: "colon", next: 'dialog', ready: [false, false, true] },
		{ file: "trybutt", next: 'keypad', ready: [false, false, true] },

		{ file: "littlebutt", next: 'keypad', ready: [false, false, true] },

		{ file: "either", next: 'dialog', ready: [false, false, true] },
		{ file: "past", next: 'dialog', ready: [false, false, true] },
		{ file: "town", next: 'keypad', ready: [false, false, true] },

		{ file: "dumb", next: 'dialog', ready: [false, false, true] },
		{ file: "cousin", next: 'keypad', ready: [false, false, true] },
		{ file: "dog", next: 'keypad', ready: [false, false, true] },
		{ file: "cat", next: 'keypad', ready: [false, false, true] },

		// { file: "gm", next: 'keypad', ready: [false, false, true] },
		// { file: "fartville", next: 'keypad', ready: [false, false, true] },
		// { file: "alone", next: 'keypad', ready: [false, false, true] },
		// { file: "spring", next: 'keypad', ready: [false, false, true] },
		// { file: "characters", next: 'dialog', ready: [false, false, true] },

		{ file: "best_friend", next: 'keypad', ready: [false, false, true] },
		{ file: "second_best", next: 'keypad', ready: [false, false, true] },
		{ file: "middle", next: 'keypad', ready: [false, false, true] },
		{ file: "first_friend", next: 'keypad', ready: [false, false, true] },
		{ file: "stopped", next: 'keypad', ready: [false, false, true] },
		{ file: "sleep", next: 'keypad', ready: [false, false, true] },

		{ file: "alone", next: 'dialog', ready: [false, false, true] },
		{ file: "silent", next: 'dialog', ready: [false, false, true] },
		{ file: "try_alone", next: 'keypad', ready: [false, false, true] },

		{ file: "real", next: 'dialog', ready: [false, false, true] },
		{ file: "soul", next: 'dialog', ready: [false, false, true] },
		{ file: "flush", next: 'keypad', ready: [false, false, true] },

		{ file: "desperate", next: 'dialog', ready: [false, false, true] },
		{ file: "ride", next: 'dialog', ready: [false, false, true] },
		{ file: "plumbing", next: 'keypad', ready: [false, false, true] },

		{ file: "each", next: 'dialog', ready: [false, false, true] },
		{ file: "time", next: 'dialog', ready: [false, false, true] },
		{ file: "change", next: 'dialog', ready: [false, false, true] },
		{ file: "seasons", next: 'keypad', ready: [false, false, true] },

		{ file: "direction", next: 'dialog', ready: [false, false, true] },
		{ file: "reflection", next: 'keypad', ready: [false, false, true] },

		{ file: "leave", next: 'dialog', ready: [false, false, true] },
		{ file: "abandon", next: 'dialog', ready: [false, false, true] },
		{ file: "please", next: 'dialog', ready: [false, false, true] },
		{ file: "try_please", next: 'keypad', ready: [false, false, true] },

		{ file: "dropping", next: 'dialog', ready: [false, false, true] },
		{ file: "life", next: 'dialog', ready: [false, false, true] },
		{ file: "yellow", next: 'dialog', ready: [false, false, true] },
		{ file: "push", next: 'dialog', ready: [false, false, true] },
		{ file: "shallow", next: 'keypad', ready: [false, false, true] },

		{ file: "shadow", next: 'dialog', ready: [false, false, true] },
		{ file: "climb", next: 'dialog', ready: [false, false, true] },
		{ file: "despair", next: 'dialog', ready: [false, false, true] },
		{ file: "try_despair", next: 'keypad', ready: [false, false, true] },

		{ file: "power", next: 'dialog', ready: [false, false, true] },
		{ file: "machines", next: 'dialog', ready: [false, false, true] },
		{ file: "removal", next: 'dialog', ready: [false, false, true] },
		{ file: "fate", next: 'dialog', ready: [false, false, true] },
		{ file: "release_me", next: 'keypad', ready: [false, false, true] },

		{ file: "moments", next: 'dialog', ready: [false, false, true] },
		{ file: "effort", next: 'dialog', ready: [false, false, true] },
		{ file: "count", next: 'dialog', ready: [false, false, true] },
		{ file: "123456", next: 'keypad', ready: [false, false, true] },

		{ file: "free", next: 'end', ready: [false, false, true] }

		// { file: "banana", next: 'end', ready: [false, false, true] }
	],
	next: function() {
		Game.scene = dlgs.current.next;
		if (dlgs.current.next == 'dialog') dlgs.nextDialog();
		else if (dlgs.current.next == 'keypad') toad.playAnimation('Jump');
		else if (dlgs.current.next == 'end') end();
	},
	nextDialog: function() {
		voice.pause();
		dlgs.index++;
		// this.current = { ...this.list[this.index] }; // clone
		dlgs.load();
	},
	load: function() {
		dlgs.sprite.resetSize();
		dlgs.current = JSON.parse(JSON.stringify(dlgs.list[dlgs.index]));
		dlgs.sprite.addAnimation(`drawings/dialogs/${dlgs.current.file}.json`, () => {
			dlgs.sprite.fit(Game.width);
			dlgs.sprite.animation.onPlayedState = function() {
				dlgs.current.ready[0] = true;
				dlgs.sprite.animation.stop();
			};
		});
		voice.src = `audio/${dlgs.current.file}.mp3`;
		// voice.addEventListener('loadeddata', function() { });
		dlgs.play();
	},
	play: function() {
		Game.scene = 'dialog';
		voice.play();
		toad.playAnimation('Wave+Talk');
		dlgs.sprite.animation.setFrame(0); // play from beginning
		dlgs.sprite.animation.start();
	},
	replay: function() {
		// dlgs.current = JSON.parse(JSON.stringify(dlgs.list[dlgs.index]));
		dlgs.current.played = false;
		dlgs.current.ready = [false, false, true];
		dlgs.play();
	},
	isReady: function() {
		return dlgs.current.ready.every(e => { return e; });
	}
};
let voice, flush; /* init with tap */
function voiceEnd() {
	dlgs.current.ready[1] = true;
	toad.playAnimation('Wave');
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
	tap.addAnimation('drawings/tap.json', function() {
		tap.fit(Game.width);
	});
	passwordSprite = new Sprite(0, height - 80);
	passwordSprite.addAnimation('drawings/password.json', function() {
		passwordSprite.fit(Game.width);
	});
	dlgs.sprite = new Sprite(0, 0);
	// dlgs.sprite.debug = true;
	flushSprite = new Sprite(0, 0);
	credits = new Sprite(0, 0);
	credits.addAnimation('drawings/credits.json', () => {
		credits.animation.stop();
	});
}

function draw() {
	switch (Game.scene) {
		case 'tap':
			tap.display();
		break;
		case 'dialog':
			dlgs.sprite.display();
			/* check current dialog */
			if (dlgs.isReady() && !dlgs.current.played) {
				dlgs.current.played = true;
				dlgs.next();
			}
		break;
		case 'keypad':
			passwordSprite.display();
			for (const k in keypad.sprites) {
				keypad.sprites[k].display();
			}
		break;
		case 'end':
			flushSprite.display();
			credits.display();
		break;
	}
}

function end() {
	flushSprite.addAnimation('drawings/flush.json', function() {
		flush.play();
		flush.addEventListener('ended', () => {
			credits.animation.start();
			document.getElementById('credits').style.display = 'block';
		});
		flushSprite.fit(Game.width);
		flushSprite.animation.overrideProperty('r', 1);
		flushSprite.animation.overrideProperty('w', 2);
		flushSprite.animation.overrideProperty('v', 1);
		// Game.clearBg = false;
		flushSprite.displayFunc = function() {
			this.animation.over.r += 0.01;
			this.animation.over.w += 0.01;
			this.animation.over.v += 0.1;
		};
		flushSprite.animation.onPlayedState = function() {
			flushSprite.animation.stop();
			// Game.clearBg = true;
		};
	});
	Game.scene = 'end';
	cactusInterval = setInterval(addCactus, 500);
	scene.remove( toilet );
	toad.playAnimation( 'Weird' );
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
			flush = new Audio();
			flush.src = '/audio/_flush.mp3';
			voice.addEventListener('ended', voiceEnd);
			if (tap.tap(lastTouch.x, lastTouch.y)) {
				tap.focus(4, () => {
					Game.scene = 'dialog';
					animate();
					dlgs.load();
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
					switch (dlgs.current.file) {
						case 'trybutt':
							if (password == 'butt') dlgs.nextDialog();
							else dlgs.replay();
						break;
						case 'banana':
							if (password == 'banana') {
								makeBananas();
								dlgs.nextDialog();
							}
							else dlgs.replay();
						break;
						case '123456':
							if (password == '123456') dlgs.nextDialog();
							else dlgs.replay();
						break;
						default:
							if (password == '123456') {
								dlgs.index = dlgs.list.length - 2;
								dlgs.nextDialog();
							} else {
								dlgs.nextDialog();
							}
						break;
					}
					password = '';
				});
			}
		break;
	}
}

window.addEventListener('touchstart', tapStart);
window.addEventListener('touchend', tapEnd);

