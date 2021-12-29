/* lines */
const keypad = { sprites: {} };
keypad.files = '0123456789abcdefghilmnopqrstuvwxyz';
let tap, creditsSprite, flushSprites, passwordSprite, password = '';
let isLaunched = false;

Sprite.prototype.focus = function(speed, callback) {
	const limit = speed * 3;
	this.animation.overrideProperty('jiggleRange', 1 / 10);
	this.displayFunc = function() {
		this.animation.override.jiggleRange += speed / 10;
		if (this.animation.override.jiggleRange >= limit) speed *= -1;
		if (this.animation.override.jiggleRange <= 0) {
			speed = 0;
			this.animation.cancelOverride();
			this.displayFunc = undefined;
			if (callback) callback();
		}
	};
};

Sprite.prototype.ficus = function(speed, callback) {
	const limit = speed * 4;
	let vSpeed = 0.5;
	this.animation.overrideProperty('jiggleRange', 1);
	this.animation.overrideProperty('wiggleRange', 2);
	this.animation.overrideProperty('wiggleSpeed', 0.1);
	
	this.displayFunc = function() {

		this.animation.override.jiggleRange += speed;
		this.animation.override.wiggleSpeed += vSpeed;

		if (this.animation.override.jiggleRange >= limit) {
			speed *= -1;
			vSpeed *= -1;
		}

		if (this.animation.override.jiggleRange <= 0) {
			speed = 0;
			this.animation.cancelOverride();
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

		{ file: "doodoo", next: 'keypad' },

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
		dlgs.sprite.animation.stop();
		gme.scenes.current = dlgs.current.next;
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
		dlgs.current = JSON.parse(JSON.stringify(dlgs.list[dlgs.index]));
		if (!dlgs.current.ready) dlgs.current.ready = [false, false, true];
		dlgs.sprite.addAnimation(gme.anims.sprites[`dialog-${dlgs.current.file}`], () => {
			dlgs.sprite.position = [gme.halfWidth, gme.halfHeight];
			dlgs.sprite.animation.onPlayedOnce = function() {
				dlgs.current.ready[0] = true;
				dlgs.sprite.animation.stop();
			};
		});
		voice.src = `audio/${dlgs.current.file}.mp3`;
		dlgs.play();
	},
	play: function() {
		gme.scenes.current = 'dialog';
		voice.play();
		toad.playAnimation('Wave+Talk');
		dlgs.sprite.animation.frame = 0; // play from beginning
		dlgs.sprite.animation.play();
	},
	replay: function() {
		dlgs.current.played = false;
		dlgs.current.ready = [false, false, true];
		dlgs.sprite.animation.onPlayedOnce = function() {
			dlgs.current.ready[0] = true;
		};
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

const gme = new Game({
	width: window.innerWidth, 
	height: window.innerHeight,
	stats: false,
	debug: false,
	multiColor: false,
	scenes: ['tap', 'keypad', 'dialog'],
	lineWidth: 2,
});

const assets = {
	'tap': 'drawings/tap.json',
	'password': 'drawings/password.json',
	'credits': 'drawings/credits.json',
	'flush': 'drawings/flush.json',
	'chars': 'drawings/chars.json',
};

for (let i = 0; i < keypad.files.length; i++) {
	assets[`${keypad.files[i]}`] = `drawings/keypad/${keypad.files[i]}.json`
}

for (let i = 0; i < dlgs.list.length; i++) {
	const d = dlgs.list[i];
	assets[`dialog-${d.file}`] = `drawings/dialogs/${d.file}.json`;
}
gme.loadAssets('sprites', assets);

function launch() {
	gme.canvas.style.display = 'block';
	gme.scenes.current = 'tap';
	isLaunched = true;
}

gme.start = function() {
	// console.log(gme.anims.sprites);

	// fix dialog sprites animation
	for (const k in gme.anims.sprites) {
		const anim = gme.anims.sprites[k];
		if (k.includes('dialog')) {
			const s = gme.anims.sprites[k];
			s.layers.forEach(layer => {

				const a = {
					prop: 'endIndex',
					startFrame: layer.startFrame,
					endFrame: layer.startFrame + Math.floor((layer.endFrame - layer.startFrame) * 0.75), 
					startValue: 0,
					endValue: anim.drawings[layer.drawingIndex].length
				};

				const b = {
					prop: 'startIndex',
					startFrame: layer.startFrame + Math.floor((layer.endFrame - layer.startFrame) * 0.75),
					endFrame: layer.endFrame,
					startValue: 0,
					endValue: anim.drawings[layer.drawingIndex].length
				};

				layer.tweens = [a, b];
			});
			// anim.fps = 16;
		}
	}


	const o = 6; // random offset
	const keypadWidth = Math.min(400, width);
	const c = Math.floor(keypadWidth / (keypadWidth > 320 ? 56 : 48)); // columns
	const w = keypadWidth / c; // column width
	const h = w + (keypadWidth > 320 ? 12: 6);
	const start = gme.width > keypadWidth ? gme.halfWidth - (keypadWidth / 2) : 0;
	let x = start, y = gme.height > 700 ? 100 : 10;
	
	const keys = [...keypad.files];
	for (let i = 0; i < keypad.files.length; i++) {
		const index = Cool.randomInt(keys.length - 1);
		const k = keys[index];
		keys.splice(index, 1);
		keypad.sprites[k] = new ColliderSprite(x + Cool.random(-o, o), y + Cool.random(-o, o), gme.anims.sprites[k]);
		x += w;
		if (x > start + keypadWidth - w) x = start, y += h;
	}

	passwordSprite = new UI({ 
		x: start, 
		y: y + h * 2,
		animation: gme.anims.sprites.password, 
		center: false 
	});

	chars = new UI({ 
		x: start, 
		y: y + h * 1, 
		animation: gme.anims.sprites.chars, 
		center: false
	});

	for (let i = 1; i <= 6; i++) {
		chars.animation.createNewState(i, i - 1, i - 1);
	}

	tap = new UI({ x: gme.halfWidth, y: gme.halfHeight, animation: gme.anims.sprites.tap });
	tap.center = true;

	dlgs.sprite = new Sprite(gme.halfWidth, gme.halfHeight);
	dlgs.sprite.center = true;
	
	
	creditsSprite = new Sprite(gme.halfWidth, gme.halfHeight, gme.anims.sprites.credits);
	creditsSprite.center = true;
	creditsSprite.isActive = false;
	
	// flush sprites ...
	const _w = gme.anims.sprites.flush.width, _h = gme.anims.sprites.flush.height;
	flushSprites = new SpriteCollection();
	for (let _x = -_w / 2; _x < gme.width + _w / 2; _x += _w) {
		for (let _y = -_h / 2; _y < gme.height + _h / 2; _y += _h) {
			const f = new Sprite(_x, _y, gme.anims.sprites.flush);
			f.animation.play();
			f.fps = 0.01;
			flushSprites.add(f);
		}
	}

	gme.ctx.strokeStyle = '#ffffff';
};

gme.draw = function() {
	switch (gme.scenes.currentName) {
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
			if (password.length > 0) {
				chars.animation.state = '' + Math.min(6, password.length);
				chars.display();
			}
		break;
		case 'end':
			flushSprites.display();
			creditsSprite.display();
		break;
	}
};

function end() {
	if (autoCam) rig.add('end');
	if (!autoCam) rig.add('mend');

	const nFlushPlays = 2;
	let nFlushCount = 0;
	let f = flushSprites.sprite(0);
	f.displayFunc = function() {
		this.animation.override.jiggleRange += 0.01;
		this.animation.override.wiggleRange += 0.01;
		this.animation.override.wiggleSpeed += 0.001;
	};
	f.animation.onPlayedState = function() {
		nFlushCount++;
		if (nFlushCount === nFlushPlays) f.animation.stop();
		console.log(nFlushCount);
	};
	f.animation.overrideProperty('jiggleRange', 1);
	f.animation.overrideProperty('wiggleRange', 2);
	f.animation.overrideProperty('wiggleSpeed', 1);
	f.animation.play();
	
	flush.play();
	flush.addEventListener('ended', () => {
		creditsSprite.isActive = true;
		document.getElementById('credits').style.display = 'block';
	});

	gme.scenes.current = 'end';
	cactusInterval = setInterval(addCactus, 1000);
	scene.remove(toilet);
	toad.playAnimation('Weird');
}

/* events */
let lastTouch;
function tapStart(ev) {
	lastTouch = { x: ev.touches[0].clientX, y: ev.touches[0].clientY };
}

function tapEnd(ev) {
	if (!isLaunched) return;
	if (!tap) return;
	switch (gme.scenes.currentName) {
		case 'tap':
			if (tap.tap(lastTouch.x, lastTouch.y)) {
				voice = new Audio();
				flush = new Audio();
				flush.src = '/audio/flush_.mp3';
				if (autoCam) setTimeout(randomCam, 4000);
				// document.getElementById('lines').classList.remove('bg');
				voice.addEventListener('ended', voiceEnd);
				tap.focus(4, () => {
					gme.scenes.current = 'dialog';
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
