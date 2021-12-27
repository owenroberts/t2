/* lines */
const keypad = { sprites: {} };
keypad.files = '0123456789abcdefghilmnopqrstuvwxyz';
let tap, creditsSprite, flushSprite, passwordSprite, password = '';

Sprite.prototype.focus = function(speed, callback) {
	const limit = speed * 3;
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

Sprite.prototype.ficus = function(speed, callback) {
	const limit = speed * 4;
	let vSpeed = 0.5;
	this.animation.overrideProperty('r', 1);
	this.animation.overrideProperty('w', 2);
	this.animation.overrideProperty('v', 0.1);
	this.displayFunc = function() {
		this.animation.over.r += speed;
		this.animation.over.v += vSpeed;
		if (this.animation.over.r >= limit) {
			speed *= -1;
			vSpeed *= -1;
		}
		if (this.animation.over.r <= 0) {
			speed = 0;
			this.animation.over.r = undefined;
			this.animation.over.w = undefined;
			this.animation.over.v = undefined;
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
		{ file: "hey", next: 'dialog', ready: [false, false, false], cam: 'lookDown' },
		{ file: "help", next: 'dialog' },
		{ file: "password", next: 'keypad' },

		{ file: "notit", next: 'dialog' },
		{ file: "colon", next: 'dialog' },
		{ file: "trybutt", next: 'keypad' },

		{ file: "littlebutt", next: 'keypad' },

		{ file: "either", next: 'dialog' },
		{ file: "past", next: 'dialog' },
		{ file: "town", next: 'keypad' },

		{ file: "dumb", next: 'dialog' },
		{ file: "cousin", next: 'keypad' },
		{ file: "dog", next: 'keypad' },
		{ file: "cat", next: 'keypad' },

		{ file: "best_friend", next: 'keypad' },
		{ file: "second_best", next: 'keypad' },
		{ file: "middle", next: 'keypad' },
		{ file: "first_friend", next: 'keypad' },
		{ file: "stopped", next: 'keypad' },
		{ file: "sleep", next: 'keypad' },

		{ file: "alone", next: 'dialog' },
		{ file: "silent", next: 'dialog' },
		{ file: "try_alone", next: 'keypad' },

		{ file: "real", next: 'dialog' },
		{ file: "soul", next: 'dialog' },
		{ file: "flush", next: 'keypad' },

		{ file: "desperate", next: 'dialog' },
		{ file: "ride", next: 'dialog' },
		{ file: "plumbing", next: 'keypad' },

		{ file: "each", next: 'dialog' },
		{ file: "time", next: 'dialog' },
		{ file: "change", next: 'dialog' },
		{ file: "seasons", next: 'keypad' },

		{ file: "direction", next: 'dialog' },
		{ file: "reflection", next: 'keypad' },

		{ file: "leave", next: 'dialog' },
		{ file: "abandon", next: 'dialog' },
		{ file: "please", next: 'dialog' },
		{ file: "try_please", next: 'keypad' },

		{ file: "dropping", next: 'dialog' },
		{ file: "life", next: 'dialog' },
		{ file: "yellow", next: 'dialog' },
		{ file: "push", next: 'dialog' },
		{ file: "shallow", next: 'keypad' },

		{ file: "shadow", next: 'dialog' },
		{ file: "climb", next: 'dialog' },
		{ file: "despair", next: 'dialog' },
		{ file: "try_despair", next: 'keypad' },

		{ file: "power", next: 'dialog' },
		{ file: "machines", next: 'dialog' },
		{ file: "removal", next: 'dialog' },
		{ file: "fate", next: 'dialog' },
		{ file: "release_me", next: 'keypad' },

		{ file: "moments", next: 'dialog' },
		{ file: "effort", next: 'dialog' },
		{ file: "count", next: 'dialog' },
		{ file: "123456", next: 'keypad' },

		{ file: "free", next: 'end' }

	],
	next: function() {
		Game.scene = dlgs.current.next;
		if (autoCam && dlgs.current.cam) rig.add(dlgs.current.cam);
		if (!autoCam && dlgs.current.mcam) rig.add(dlgs.current.mcam);
		if (dlgs.current.next == 'dialog') dlgs.nextDialog();
		else if (dlgs.current.next == 'keypad') toad.playAnimation();
		else if (dlgs.current.next == 'end') end();
	},
	nextDialog: function() {
		voice.pause();
		dlgs.index++;
		dlgs.load();
	},
	load: function() {
		dlgs.sprite.resetSize();
		dlgs.current = JSON.parse(JSON.stringify(dlgs.list[dlgs.index]));
		if (!dlgs.current.ready) dlgs.current.ready = [false, false, true];
		dlgs.sprite.addAnimation(`drawings/dialogs/${dlgs.current.file}.json`, () => {
			dlgs.sprite.fit(Game.width);
			dlgs.sprite.position.x = Game.width / 2;
			dlgs.sprite.position.y = Game.height / 2;
			dlgs.sprite.center();
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
	toad.playAnimation();
}

function launch() {
	Game.init({
		width: window.innerWidth, 
		height: window.innerHeight,
		lps: 12, 
		stats: false,
		debug: false,
		mixedColors: false
	});
	Game.scene = 'tap';
	Game.ctx.strokeStyle = "#fff";
}

function start() {
	const o = 6; // random offset
	const keypadWidth = Math.min(400, width);
	const c = Math.floor( keypadWidth / (keypadWidth > 320 ? 56 : 48)); // columns
	const w = keypadWidth / c; // column width
	const h = w + (keypadWidth > 320 ? 12: 6);
	const start = Game.width > keypadWidth ? w / 2 : 0;
	let x = start, y = Game.height > 700 ? 100 : 10;
	const keys = [...keypad.files];
	for (let i = 0; i < keypad.files.length; i++) {
		const index = Cool.randomInt(keys.length - 1);
		const k = keys[index];
		keys.splice(index, 1);
		keypad.sprites[k] = new Sprite(x + Cool.random(-o, o), y + Cool.random(-o, o));
		keypad.sprites[k].addAnimation(`drawings/keypad/${k}.json`);
		x += w;
		if (x > start + keypadWidth - w) x = start, y += h;
	}

	tap = new Sprite(Game.width/2, Game.height/2);
	tap.addAnimation('drawings/tap.json', function() {
		tap.fit(Game.width);
		tap.center();
	});
	passwordSprite = new Sprite(Game.width/2, height - 80);
	passwordSprite.addAnimation('drawings/password.json', function() {
		passwordSprite.fit(Game.width);
		passwordSprite.center();
		if (y + h > passwordSprite.position.y) {
			passwordSprite.position.y = y + h + 8;
		}
	});
	dlgs.sprite = new Sprite(Game.width/2, Game.height/2);
	// dlgs.sprite.debug = true;
	flushSprite = new Sprite(Game.width/2, Game.height/2);
	creditsSprite = new Sprite(0, 0);
	creditsSprite.addAnimation('drawings/credits.json', () => {
		creditsSprite.animation.stop();
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
			creditsSprite.display();
		break;
	}
}

function end() {
	if (autoCam) rig.add('end');
	if (!autoCam) rig.add('mend');
	flushSprite.addAnimation('drawings/flush.json', function() {
		flushSprite.scale(Game.width / flushSprite.width);
		flushSprite.center();
		flush.play();
		flush.addEventListener('ended', () => {
			creditsSprite.animation.start();
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
	cactusInterval = setInterval(addCactus, 1000);
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
			if (tap.tap(lastTouch.x, lastTouch.y)) {
				voice = new Audio();
				flush = new Audio();
				flush.src = '/audio/flush_.mp3';
				if (autoCam) setTimeout(randomCam, 4000);
				// document.getElementById('lines').classList.remove('bg');
				voice.addEventListener('ended', voiceEnd);
				tap.focus(4, () => {
					Game.scene = 'dialog';
					animate();
					dlgs.load();
				});
			}
		break;
		case 'keypad':
			for (const k in keypad.sprites) {
				const key = keypad.sprites[k];
				if (key.tap(lastTouch.x, lastTouch.y)) {
					key.focus(2);
					password += k;
				}
			}
			if (passwordSprite.tap(lastTouch.x, lastTouch.y)) {
				passwordSprite.ficus(1, () => {
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

function setupClickEvents() {
	const canvas = document.getElementById('lines');

	canvas.addEventListener('mousedown', ev => {
		lastTouch = { x: ev.offsetX, y: ev.offsetY };
	});

	canvas.addEventListener('mouseup', ev => {
		tapEnd();
	});	
}
