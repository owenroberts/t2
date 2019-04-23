// better than mobile check, includes ipad
function onMotion(ev) {
	window.removeEventListener('devicemotion', onMotion, false);
	if (ev.acceleration.x != null || ev.accelerationIncludingGravity.x != null) {
		motionGo();
	}
}
window.addEventListener('devicemotion', onMotion, false);
if (document.getElementById('desktop'))
	document.getElementById('desktop').style.opacity = 1;

function motionGo() {
	document.getElementById('desktop').remove();
	init();
	Game.init({
		width: window.innerWidth, 
		height: window.innerHeight, 
		lps: 10, 
		stats: false,
		debug: false,
		mixedColors: false
	});
	Game.scene = 'tap';
	Game.ctx.strokeStyle = "#fff";
}


let timer = performance.now();
const interval = 1000 / 30;
let width = window.innerWidth, height = window.innerHeight;
let camera, scene, renderer, controls;
let clock, mixer;
let toad, toilet, banana, bananas = [];
let raycaster;
const vector = new THREE.Vector3();

// const colors = [ 0x7AFFE2, 0xF8EF71, 0xEBB0EC, 0x9A8DD7, 0xBB6DF2, 0xF0ACDA ]; /* new colors ? */
// const outlineColor = Cool.random(colors);
const outlineColor = 0xFFFFFF;
const bgColor = 0x0d0d26;


function init() {
	clock = new THREE.Clock();
	scene = new THREE.Scene();
	scene.background = new THREE.Color( bgColor );

	// change orientation for android
	if (navigator.userAgent.toLowerCase().indexOf("android") > -1) {
		scene.rotation.set( 0, -Math.PI/2, 0 );
		scene.position.set( -1, 0, -1 ); // match camera offset
	}

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize(width, height);
	document.body.appendChild(renderer.domElement);
	renderer.domElement.id = 'three';

	effect = new THREE.OutlineEffect( renderer, {
		defaultThickNess: 2,
		defaultColor: new THREE.Color( outlineColor )
	});

	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1100 );
	controls = new THREE.DeviceOrientationControls( camera );
	camera.position.z = -1;
	camera.position.y = 2;

	raycaster = new THREE.Raycaster( );

	mixer = new THREE.AnimationMixer( scene );

	const loadingManager = new THREE.LoadingManager();
	loadingManager.onProgress = function( item, loaded, total ) {
		// console.log( item, loaded, total );
	};
	loadingManager.onLoad = function() {
		// console.log( 'loaded' );
		// move to start or whatever 
		// calling animate from game, could init game here?
	};

	const loader = new THREE.GLTFLoader( loadingManager );
	loader.load("models/toilet.gltf", gltf => {
		toilet = gltf.scene;
		toilet.rotation.y = Math.PI;
		toilet.traverse(o => { if (o.material) o.material.color.set( bgColor ); });
		scene.add( toilet );
	});
	loader.load("models/toad.gltf", gltf => {
		toad = gltf.scene;
		toad.traverse(o => { if (o.material) o.material.color.set( bgColor ); });
		// toad.traverse(o => { if (o.material) console.log(o, o.material.color) });
		toad.animations = {
			wavetalk: gltf.animations[0],
			wave: gltf.animations[1]
		};
		toad.rotation.y = Math.PI;
		toad.scale.set( 0.06, 0.06, 0.06 );
		toad.position.set( 0, -0.3, -0.4 );
		toad.animations.current = 'wave';
		toad.playAnimation = function(label) {
			mixer.clipAction( toad.animations[toad.animations.current], toad ).stop();
			mixer.clipAction( toad.animations[label], toad ).play();
			toad.animations.current = label;
		};
		mixer.clipAction( toad.animations.wave, toad ).play();
		scene.add( toad );
	});

	loader.load('models/banana.gltf', gltf => {
		banana = gltf;
	});

	/* test cube
	var geometry = new THREE.BoxGeometry( 1, 1, 1 );
	var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
	testCube =  new THREE.Mesh( geometry, material );
	*/
	// scene.add( testCube );
}

function makeBananas() {
	const n = Cool.random(50, 100);
	for (let i = 0; i < n; i++) {
		const b = cloneGltf( banana ).scene;
		b.position.set( Cool.random(-1, 1), Cool.random(4, 20), Cool.random(-3, -1) );
		b.scale.set( 0.05, 0.05, 0.05 );
		bananas.push( b );
		scene.add( b );
	}
}

function animate() {
	requestAnimationFrame( animate );
	if (performance.now() > interval + timer) {
		// animate bananas
		for (let i = 0; i < bananas.length; i++) {
			if (bananas[i]) {
				bananas[i].rotation.x += Cool.random(0.25);
				bananas[i].rotation.z += Cool.random(0.25);
				bananas[i].position.y -= 0.05;
				if (bananas[i].position.y < -2) {
					scene.remove( bananas[i] );
					bananas.splice( i, 1 );
				}
			}
		}

		timer = performance.now();
		controls.update();
		mixer.update( clock.getDelta() );
		// renderer.render(scene, camera);
		effect.render( scene, camera );

		if (Game.scene == 'dialog' && dialogs.current == 'hey') {
			raycaster.set( camera.position, camera.getWorldDirection( vector ) );
			const intersects = raycaster.intersectObjects( scene.children, true );
			if (intersects.length) dialogs[dialogs.current].ready[3] = true;
		}
	}
}

/* lines */
const keypad = { sprites: {} };
keypad.files = '0123456789abcdefghilmnopqrstuvwxyz';
let tap, passwordSprite, password = '';
Sprite.prototype.focus = function(speed, callback) {
	this.fSpeed = speed; // bigger is faster 
	const limit = speed * 4;
	this.animation.overrideProperty('r', 1);
	this.displayFunc = function() {
		this.animation.over.r += this.fSpeed;
		if (this.animation.over.r >= limit) this.fSpeed *= -1;
		if (this.animation.over.r <= 0) {
			this.fSpeed = 0;
			this.animation.over.r = undefined;
			this.displayFunc = undefined;
			if (callback) callback();
		}
	};
};

/* dialogs */
 // ready / needs : [ drawing, voice, keypad, raycast ]
const dialogs = {
	order: ['hey', 'help', 'password', 'trybutt', 'littlebutt',  'town', 'cousin', 'dog', 'cat', 'gm', 'fartville', 'alone', 'spring', 'characters', 'banana'],
	current: 'hey',
	hey: { next: 'dialog', ready: [false, false, true, false], delay: 0 },
	help: { next: 'dialog', ready: [false, false, true, true], delay: 0 },
	password: { next: 'keypad', ready: [false, false, true, true], delay: 0 },
	trybutt: { next: 'keypad', ready: [false, false, true, true], delay: 0 },
	littlebutt: { next: 'keypad', ready: [false, false, true, true], delay: 0 },
	town: { next: 'keypad', ready: [false, false, true, true], delay: 0 },
	cousin: { next: 'keypad', ready: [false, false, true, true], delay: 0 },
	dog: { next: 'keypad', ready: [false, false, true, true], delay: 0 },
	cat: { next: 'keypad', ready: [false, false, true, true], delay: 0 },
	gm: { next: 'keypad', ready: [false, false, true, true], delay: 0 },
	fartville: { next: 'keypad', ready: [false, false, true, true], delay: 0 },
	alone: { next: 'keypad', ready: [false, false, true, true], delay: 0 },
	spring: { next: 'keypad', ready: [false, false, true, true], delay: 0 },
	characters: { next: 'dialog', ready: [false, false, true, true], delay: 0 },
	banana: { next: 'keypad', ready: [false, false, true, true], delay: 0 },
	next: function() {
		const dialog = this[this.current];
		if (dialog.next == 'dialog') this.nextDialog();
		Game.scene = dialog.next;
	},
	nextDialog: function() {
		voice.pause();
		this.current = this.order[this.order.indexOf(this.current) + 1];
		this.load();
	},
	load: function() {
		const dialog = this[this.current];
		this.sprite.resetSize();
		this.sprite.addAnimation(`drawings/dialogs/${this.current}.json`, () => {
			this.sprite.animation.onPlayedState = function() {
				dialog.ready[0] = true;
			};
		});
		voice.src = `audio/${this.current}.mp3`;
		this.play();
	},
	play: function() {
		Game.scene = 'dialog';
		voice.addEventListener('ended', voiceEnd);
		voice.play();
		toad.playAnimation('wavetalk');
	},
	replay: function() {
		this[this.current].played = false;
		this[this.current].ready = [false, false, true, true];
		this.sprite.animation.setState('default'); // play from beginning
		this.play();
	}
};
let voice; /* init with tap */
function voiceEnd() {
	dialogs[dialogs.current].ready[1] = true;
	toad.playAnimation('wave');
	voice.removeEventListener('ended', voiceEnd);
}

function start() {
	const o = 6; // random offset
	const c = Math.floor(width/56); // columns
	const w = width / c; // column width
	let x = 0, y = 10;
	const keys = [...keypad.files];
	for (let i = 0; i < keypad.files.length; i++) {
		const index = Cool.randomInt(keys.length - 1);
		const k = keys[index];
		keys.splice(index, 1);
		keypad.sprites[k] = new Sprite(x + Cool.random(-o, o), y + Cool.random(-o, o));
		keypad.sprites[k].addAnimation(`drawings/keypad/${k}.json`);
		x += w;
		if (x > Game.width - w) x = 0, y += 68;
	}
	tap = new Sprite(0, 0);
	tap.addAnimation('drawings/ui/tap.json');
	passwordSprite = new Sprite(0, height - 80);
	passwordSprite.addAnimation('drawings/ui/password.json');
	dialogs.sprite = new Sprite(0, 0);
}

function draw() {
	switch (Game.scene) {
		case 'tap':
			tap.display();
		break;
		case 'dialog':
			dialogs.sprite.display();
			/* check current dialog */
			const dialog = dialogs[dialogs.current];
			if (dialog.ready.every(e => { return e; }) && !dialog.played) {
				dialog.played = true;
				setTimeout(dialogs.next.bind(dialogs), dialog.delay);
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
					switch (dialogs.current) {
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


// motionGo(); // run in browser
	
/* boring */
function onWindowResize() { 
	width = document.documentElement.clientWidth;
	height = document.documentElement.clientHeight;
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize(width, height);
}
window.addEventListener( 'resize', onWindowResize, false );

function fullscreen() {
	if (renderer.domElement.requestFullscreen) {
		renderer.domElement.requestFullscreen();
	} else if (renderer.domElement.msRequestFullscreen) {
		renderer.domElement.msRequestFullscreen();
	} else if (renderer.domElement.mozRequestFullScreen) {
		renderer.domElement.mozRequestFullScreen();
	} else if (renderer.domElement.webkitRequestFullscreen) {
		renderer.domElement.webkitRequestFullscreen();
	}
}

function exitFullscreen() {
	document.exitFullscreen = document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen || document.msExitFullscreen;
	if (document.exitFullscreen)
		document.exitFullscreen();
}

document.addEventListener( 'visibilitychange', ev => {
	location.reload(); // easier for now
});