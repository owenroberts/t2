// better than mobile check, includes ipad
function onMotion(ev) {
	window.removeEventListener('devicemotion', onMotion, false);
	if (ev.acceleration.x != null || ev.accelerationIncludingGravity.x != null) {
		document.getElementById('desktop').remove();
		init();
		// uiLines.loadAnimation(uiLines.files.intro, () => {
		// 	uiLines.ctx.lineWidth = 2;
		// 	init();
		// });
	}
}
window.addEventListener('devicemotion', onMotion, false);
if (document.getElementById('desktop'))
	document.getElementById('desktop').style.opacity = 1; 

let timer = performance.now();
const interval = 1000 / 30;
let width = window.innerWidth, height = window.innerHeight;
let camera, scene, renderer, controls;
let clock, mixer;
let toad, toilet;
let raycaster;
let testCube;

// const colors = [ 0x7AFFE2, 0xF8EF71, 0xEBB0EC, 0x9A8DD7, 0xBB6DF2, 0xF0ACDA ]; /* new colors ? */
// const outlineColor = Cool.random(colors);
const outlineColor = 0xFFFFFF;
const bgColor = 0x0d0d26;

function init() {
	clock = new THREE.Clock();
	scene = new THREE.Scene();
	scene.background = new THREE.Color( bgColor );

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
		toad.animations = gltf.animations;
		toad.rotation.y = Math.PI;
		toad.scale.set( 0.06, 0.06, 0.06 );
		toad.position.set( 0, -0.3, -0.4 );
		mixer.clipAction( toad.animations[0], toad ).play();
		scene.add( toad );
	});

	/* test cube */
	var geometry = new THREE.BoxGeometry( 1, 1, 1 );
	var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
	testCube =  new THREE.Mesh( geometry, material );
	// scene.add( testCube );
	
}
var vector = new THREE.Vector3();
function animate() {
	requestAnimationFrame( animate );
	if (performance.now() > interval + timer) {
		timer = performance.now();
		controls.update();
		mixer.update( clock.getDelta() );
		// renderer.render(scene, camera);
		effect.render( scene, camera );

		if (Game.scene == 'dialog' && currentDialog == 0) {
			raycaster.set( camera.position, camera.getWorldDirection( vector ) );
			const intersects = raycaster.intersectObjects( scene.children, true );
			if (intersects.length) nextDialog();
		}
	}
}

/* lines */
const keypad = { sprites: {} };
keypad.files = '0123456789abcdefghilmnopqrstuvwxyz';
let tap;
Sprite.prototype.focus = function(callback) {
	this.fSpeed = 9;
	this.animation.overrideProperty('jig', 1);
	this.displayFunc = function() {
		this.animation.jig += this.fSpeed;
		if (this.animation.jig >= 20) this.fSpeed *= -1;
		if (this.animation.jig <= 0) {
			this.fSpeed = 0;
			this.animation.jig = undefined;
			this.displayFunc = undefined;
			if (callback) callback();
		}
	};
};

/* dialogs */
const dialogs = [
	{ audio: 'hey', drawing: 'hey', next: 'keypad' }
];
let dialog;
let currentDialog = 0;
let voice; /* init with tap */

function nextDialog() {
	voice.pause();
	const dialog = dialogs[currentDialog];
	if (dialog.next == 'dialog') {
		currentDialog++;
		loadDialog();
		Game.scene = 'dialog';

	} else if (dialog.next == 'keypad') {
		Game.scene = 'keypad';
	}
}

function loadDialog() {
	dialog.addAnimation(`/drawings/dialogs/${dialogs[currentDialog].drawing}.json`);
	voice.src = `/audio/${dialogs[currentDialog].audio}.mp3`;
	voice.play();
}

function start() {
	let x = 32, y = 10;
	for (let i = 0; i < keypad.files.length; i++) {
		const k = keypad.files[i];
		keypad.sprites[k] = new Sprite(x, y);
		keypad.sprites[k].addAnimation(`/drawings/keypad/${k}.json`);
		x += 48;
		if (x > Game.width - 64) {
			x = 32;
			y += 48;
		}
	}
	tap = new Sprite(0, 0);
	tap.addAnimation('/drawings/ui/tap.json');

	dialog = new Sprite(0, 0);
}

function draw() {
	switch (Game.scene) {
		case 'tap':
			tap.display();
		break;
		case 'dialog':
			dialog.display();
		break;
		case 'keypad':
			for (const k in keypad.sprites) {
				keypad.sprites[k].display();
			}
		break;
	}
}

/* events */
function tapStart(ev) {
	lastTouch = ev.touches[0];
}

function tapEnd(ev) {
	switch (Game.scene) {
		case 'tap':
			voice = new Audio();
			voice.loop = true;
			if (tap.tap(lastTouch.clientX, lastTouch.clientY)) {
				tap.focus(() => {
					Game.scene = 'dialog';
					animate();
					loadDialog();
				});
			}
		break;
	}
}

let lastTouch;
window.addEventListener('touchstart', tapStart);
window.addEventListener('touchend', tapEnd);
	

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