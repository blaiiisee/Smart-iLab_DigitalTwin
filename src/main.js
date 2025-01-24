// ---------- Rendering the Scene ------
// [0] Import Modules

// ThreeJS for 3D Scenes Support
import * as THREE from 'three';
// OrbitControls for 3D Camera Controls
import { OrbitControls } from "jsm/controls/OrbitControls.js";
// GLTFLoader for .gltf file-loading
import { GLTFLoader } from "jsm/loaders/GLTFLoader.js";

// [1] The Three Fundamentals

// (a) Main Scene
const scene = new THREE.Scene();

// (b) Camera and Properties
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(20,20,20);
camera.lookAt(0, 0, 0);
camera.zoom = 1;
camera.near = 0.1;
camera.far = 1000;

// (c) Renderer and Properties
const renderer = new THREE.WebGLRenderer({antialias: true});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Orbit Controls Drifting, Sensitivity, and Bounds
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.02;
controls.maxPolarAngle = Math.PI/2 -0.1;

// [2] Creating ambient light
const ambient = new THREE.AmbientLight(0xffffff, 1);
ambient.castShadow = true;
scene.add(ambient);

// [3] Adding directional light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(20,30,-10);
// Setting bounds of the directional light
light.shadow.mapSize.width = 8192;
light.shadow.mapSize.height = 8192;
light.shadow.camera.near = 0.1;
light.shadow.camera.far = 1000;
light.shadow.camera.left = 50;
light.shadow.camera.right = -50;
light.shadow.camera.top = 50;
light.shadow.camera.bottom = -50;
light.castShadow = true;
scene.add(light);
// Directional Light Helper
// const helper = new THREE.DirectionalLightHelper(light, 1);
// scene.add(helper);

// [4] Adding a ground plane
const groundGeometry = new THREE.PlaneGeometry(1000,1000,500,500);
groundGeometry.rotateX(-Math.PI /2);
const groundMaterial = new THREE.MeshStandardMaterial({
    color:  0xddffff,
    side: THREE.DoubleSide
});
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.castShadow = false;
groundMesh.receiveShadow = true;
scene.add(groundMesh);

// [4] Adding my gltf scenes
const loader = new GLTFLoader().setPath('../assets/');
loader.load('shiba/scene.gltf', (gltf) => {
    const dog_mesh = gltf.scene;

    dog_mesh.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    dog_mesh.position.set(0,3.3,0);
    dog_mesh.scale.set(1,1,1);
    scene.add(dog_mesh);
});

loader.load('smart_ilab_3d/scene.gltf', (gltf) => {
    const lab = gltf.scene;

    lab.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    
    lab.position.set(-15,0.05,-15);
    lab.scale.set(0.03, 0.03, 0.03);
    scene.add(lab);
});

loader.load('skybox/scene.gltf', (gltf) => {
    const sky = gltf.scene;
    scene.add(sky);
});


// ---------- Functionalities ----------

// [1] Camera Reset
var rst_cam_btn = document.getElementById("rst_cam_btn");
rst_cam_btn.onclick = function(){
    camera.position.set(20,20,20);
    camera.lookAt(0, 0, 0);

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controls.update();
};

// ---------- Properties ----------


// ! NOT WORKING !
// [2] Overview Position Projection
const over4 = document.getElementById("over4");
const canvas = document.querySelector("canvas");
const overposition4 = new THREE.Vector3();

// ---------- RENDERING ----------

// [X] Creating a looping function
function animate(t = 0) {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controls.update();
  };
  animate();