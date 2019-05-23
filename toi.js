// better than mobile check, includes ipad
function onMotion(ev) {
	window.removeEventListener('devicemotion', onMotion, false);
	if (ev.acceleration.x != null || ev.accelerationIncludingGravity.x != null) {
		document.getElementById('desktop').remove();
		launch();
	}
}
window.addEventListener('devicemotion', onMotion, false);
if (document.getElementById('desktop'))
	document.getElementById('desktop').style.opacity = 1;

document.getElementById('proceed').addEventListener('click', proceed);
document.getElementById('proceed').addEventListener('touchend', proceed);

if (Cool.mobilecheck()) {
	document.getElementById('owen').remove();
	Array.from(document.getElementsByClassName('mobile')).forEach(e => {
		e.style.display = 'block';
	});
}

let gif;
document.getElementById('view').addEventListener('click', () => {
	if (!gif) {
		gif = new Image();
		gif.src = 'safari-fix.gif';
		document.getElementById('gif-instructions').appendChild(gif);
		document.body.style.overflow = 'auto';
	} else {
		if (gif.style.display == 'none') {
			gif.style.display = 'block';
			document.body.style.overflow = 'auto';
		} else  {
			gif.style.display = 'none';
			document.body.style.overflow = 'hidden';
		}
	}
	
	// https://gist.github.com/tskaggs/6394639 // making gifs
});

let autoCam = false;
function proceed() {
	autoCam = true;
	launch();
}

function launch() {
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
let toad, toilet, banana, bananas = [], cactus, cactii = [];
let raycaster;
const vector = new THREE.Vector3();

// duraiton in frames 
const rig = {
	animations: {
		lookDown: {
			prop: 'rotation',
			axis: 'x',
			target: -Math.PI / 2,
			func: 'easeOut',
			duration: 60
		},
		end: {
			prop: 'position',
			axis: 'y',
			target: 4,
			func: 'linear',
			duration: 240
		},
		mend: {
			prop: 'position',
			axis: 'y',
			target: -2,
			func: 'linear',
			duration: 240
		}
	},
	// https://www.kirupa.com/html5/animating_with_easing_functions_in_javascript.htm
	easeOut: function(iteration, start, change, total) {
		return change * (Math.pow(iteration / total - 1, 3) + 1) + start;
	},
	linear: function(iteration, start, change, total) {
		return Cool.map(iteration, 0, total, start, start + change);
	},
	easeIn: function(iteration, start, change, total) {
		return change * Math.pow(iteration / total, 3) + start;
	},
	easeInOut: function(iteration, start, change, total) {
		if ((iteration /= total / 2) < 1) {
			return change / 2 * Math.pow(iteration, 3) + start;
		}
		return change / 2 * (Math.pow(iteration - 2, 3) + 2) + start;
	},
	add: function(anim) {
		const a = rig.animations[anim];
		a.i = 0;
		a.start = camera[a.prop][a.axis];
		a.change = a.target - a.start;
		rig.current.push(a);
	},
	create: function(params) {
		const anim = { ...params, i: 0};
		anim.start = camera[params.prop][params.axis];
		anim.target = anim.start + anim.change;
		rig.current.push(anim);
	},
	current: []
};

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
		// seems to change based on start angle .... 
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
	if (!autoCam) controls = new THREE.DeviceOrientationControls( camera );
	else camera.rotation.x = -Math.PI / 16;
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
			let anim = label ? label : Cool.random(['Wave', 'Idle', 'Look1', 'Look2', 'Look3', 'Look4', 'Look5']);
			mixer.clipAction( toad.animations[toad.animations.current], toad ).stop();
			mixer.clipAction( toad.animations[anim], toad ).play();
			toad.animations.current = anim;
		};
		mixer.clipAction( toad.animations['Wave'], toad ).play();
		scene.add( toad );
	});

	loader.load('models/banana.gltf', gltf => {
		banana = gltf;
	});

	loader.load('models/cactus.gltf', gltf => {
		cactus = gltf;
	});
}

let cactusInterval;
function addCactus() {
	if (cactii.length < 100) {
		const c = cloneGltf(cactus).scene;
		const x = Cool.random(0.5, 3) * (Cool.random(2) > 1 ? -1 : 1);
		const z = Cool.random(0.5, 3) * (Cool.random(2) > 1 ? -1 : 1);
		c.position.set( x, 0, z);
		const s = Cool.random(0.25, 0.5);
		c.scale.set( s, s, s );
		c.rotation.y = Cool.random(Math.PI * 2);
		c.morphs = [];
		c.traverse(o => {
			if (o.material) o.material.color.set( bgColor );
			if (o.morphTargetInfluences) c.morphs.push( o );
		});
		c.update = function() {
			const mti = c.morphs[0].morphTargetInfluences;
			for (let i = 0, len = mti.length; i < len; i++) {
				mti[i] += Cool.random(-0.02, 0.02);
				mti[i] = mti[i].clamp(-2, 2);
			}
		};
		cactii.push( c );
		scene.add( c );
	} else {
		clearInterval(cactusInterval);
	}
}

function randomCam() {
	if (Game.scene != 'end') {
		const params = {
			prop: Cool.random(['position', 'rotation']),
			axis: Cool.random(['x', 'y', 'z']),
			change: Cool.random(-0.1, 0.1),
			func: Cool.random(['linear', 'easeOut', 'easeIn', 'easeInOut']),
			duration: Cool.random(20, 40)
		};
		rig.create(params);
		const t = Cool.random(1000, 2000);
		setTimeout(function() {
			params.change *= -1;
			rig.create(params);
		}, t);
		setTimeout(randomCam, t * 4);
	}
}

function animate() {
	requestAnimationFrame( animate );
	if (performance.now() > interval + timer) {
		timer = performance.now();
		for (let i = 0; i < cactii.length; i++) {
			cactii[i].update();
		}

		// camera animations 
		for (let i = 0; i < rig.current.length; i++) {
			const a = rig.current[i];
			if (a.i <= a.duration) {
				camera[a.prop][a.axis] = rig[a.func](a.i, a.start, a.change, a.duration);
				a.i++;
			} else {
				camera[a.prop][a.axis] = a.target;
				rig.current.splice(i, 1); // remove anim 
			}
		}
			
		if (!autoCam) controls.update();
		mixer.update( clock.getDelta() );
		// renderer.render(scene, camera);
		effect.render( scene, camera );

		if (Game.scene == 'dialog' && dlgs.index == 0 && dlgs.current) {
			if (autoCam) dlgs.current.ready[2] = true;
			else {
				raycaster.set( camera.position, camera.getWorldDirection( vector ) );
				const intersects = raycaster.intersectObjects( scene.children, true );
				if (intersects.length) dlgs.current.ready[2] = true;
			}
		} 
	}
}
	
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