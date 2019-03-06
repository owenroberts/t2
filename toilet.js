/* game states  */
let state = 'intro';

let voice; /* init with tap */

/* start */
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

	mixer = new THREE.AnimationMixer( scene );

	const loader = new THREE.GLTFLoader();
	loader.load("models/toilet.gltf", gltf => {
		toilet = gltf.scene;
		toilet.rotation.y = Math.PI;
		toilet.traverse(o => { if (o.material) o.material.color.set( bgColor ); });
		scene.add( toilet );
		console.log(toilet);
		animate(); // move to start or whatever 
	});
}

function animate() {
	requestAnimationFrame( animate );
	if (performance.now() > interval + timer) {
		timer = performance.now();
		controls.update();
		// mixer.update( clock.getDelta() );
		// renderer.render(scene, camera);
		effect.render( scene, camera );
	}
}



function draw() {

}

// Game.init({
// 	width: window.innerWidth, 
// 	height: window.innerHeight, 
// 	lps: 10, 
// 	stats: false,
// 	debug: false,
// 	mixedColors: false
// });


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