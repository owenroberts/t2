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
		lps: 12, 
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
		toad.animations = {};
		for (let i = 0; i < gltf.animations.length; i++) {
			const anim = gltf.animations[i];
			toad.animations[anim.name] = anim;
		}
		toad.rotation.y = Math.PI;
		toad.scale.set( 0.06, 0.06, 0.06 );
		toad.position.set( 0, -0.3, -0.4 );
		toad.animations.current = 'Wave';
		toad.playAnimation = function(label) {
			mixer.clipAction( toad.animations[toad.animations.current], toad ).stop();
			mixer.clipAction( toad.animations[label], toad ).play();
			toad.animations.current = label;
		};
		mixer.clipAction( toad.animations['Wave'], toad ).play();
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

		if (Game.scene == 'dialog' && dlgs.index == 0 && dlgs.current) {
			raycaster.set( camera.position, camera.getWorldDirection( vector ) );
			const intersects = raycaster.intersectObjects( scene.children, true );
			if (intersects.length) dlgs.current.ready[2] = true;
		}
	}
}
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