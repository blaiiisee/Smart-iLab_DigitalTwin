// ---------- Some node package manager installs necessary ----------
// npm install three
// npm install gsap
// ---------- Foundation of the Scene ----------
// [0] Import Modules

// ThreeJS for 3D Scenes Support
import * as THREE from 'three';
// OrbitControls for 3D Camera Controls
import { OrbitControls } from "jsm/controls/OrbitControls.js";
// GLTFLoader for .gltf file-loading
import { GLTFLoader } from "jsm/loaders/GLTFLoader.js";
// OutlinePass for outlines
import { OutlinePass } from 'jsm/postprocessing/OutlinePass.js';
// EffectComposer for OutlinePass support?
import { EffectComposer } from 'jsm/postprocessing/EffectComposer.js';
// RenderPass for OutlinePass support?
import { RenderPass } from 'jsm/postprocessing/RenderPass.js';
// ShaderPass for shadow correction in tandem with GammaCorrectionShader
import { ShaderPass } from 'jsm/postprocessing/ShaderPass.js';
// Gamma correction because Effect Composer makes scene darker
import { GammaCorrectionShader } from 'jsm/shaders/GammaCorrectionShader.js';


// [1] The Three + 1 Fundamentals

// (a) Main Scene
const scene = new THREE.Scene();

// (b) Camera and Properties
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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
renderer.shadowMap.type = THREE.PCFShadowMap;
document.body.appendChild(renderer.domElement);

// (d) Orbit Controls Drifting, Sensitivity, and Bounds
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.maxPolarAngle = Math.PI/2 -0.1;
//controls.target.set(10,3,-4); // This is for table 1, must also change camera position
controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
controls.mouseButtons.LEFT = THREE.MOUSE.PAN;

// [2] Creating ambient light
const ambient = new THREE.AmbientLight(0xffffff, 1);
ambient.castShadow = false;
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
const groundGeometry = new THREE.PlaneGeometry(1000,1000,1,1);
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

// Loading Smart I-Lab
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
    gsap.to(controls.target,{ x: 0, y: 0, z: 0, duration: 1, ease: 'power2.inOut'});
    gsap.to(camera.position,{ x: 20, y: 20, z: 20, duration: 1, ease: 'power2.inOut'});
};

// [2] Table Selection 
    // [2.1] Plane and Wireframe Generation for each table (for object detection)

    // table_geometry sets the table dimensions and orientation
    const table_geometry = new THREE.PlaneGeometry(3,4.77,1,1);
    table_geometry.rotateX(Math.PI/2);
    // table_material sets the table color
    const table_material = new THREE.MeshStandardMaterial({
        color:  0x3e90b6,
        side: THREE.DoubleSide
    });

    // Table #1 Creation
    const table_top1 = new THREE.Mesh(table_geometry, table_material);
    table_top1.castShadow = false;
    table_top1.receiveShadow = true;
    table_top1.name = "Table1";
    scene.add(table_top1);
    table_top1.position.set(9.79,2.305,-4.65);

    // Table #2 Creation
    const table_top2 = new THREE.Mesh(table_geometry, table_material);
    table_top2.castShadow = false;
    table_top2.receiveShadow = true;
    table_top2.name = "Table2";
    scene.add(table_top2);
    table_top2.position.set(9.79,2.305,0.28);


    // [2.2] OutlinePass creation for outlines when hovering over interactable objects
    let composer, outlinePass;
    composer = new EffectComposer( renderer );

    let renderPass = new RenderPass( scene, camera );
	composer.addPass( renderPass );

    outlinePass = new OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, camera );
    composer.addPass( outlinePass );
    outlinePass.edgeStrength = 5;
    outlinePass.edgeGlow = 0.9;
    outlinePass.edgeThickness = 4;
    outlinePass.pulsePeriod = 1;
    outlinePass.visibleEdgeColor.set("#ffffff");
    outlinePass.hiddenEdgeColor.set("#ffffff");

    // Gamma correction in Effect Composer
    const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);  
    composer.addPass(gammaCorrectionPass);
    
    // [2.3] Raycaster and Pointer for Object Detection
    const pointer = new THREE.Vector2();    // For 2D Coordinates of mouse on the window
    const raycaster = new THREE.Raycaster();    // For intersection detection between pointer and an object (our table planes)

    // While mouse is moving: Function for calculating pointer position, raycasting information...
    const onMouseMove = (event) => {

            // calculate pointer position in normalized device coordinates
            // [-1 to +1] for both components
            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(scene.children);
            
            // If there are intersected objects with the ray...
            if (intersects.length > 0) {
                outlinePass.selectedObjects = [];
                let top_object = intersects[0].object
                document.getElementById("the_body").style.cursor = "default";

                if (top_object.name.includes("Table")){ // If the object at the top is a "Table" identified via object.name as defined here in code
                    document.getElementById("the_body").style.cursor = "pointer";
                    outlinePass.selectedObjects = [top_object];
                }           
            }
            
    
    };
    // Event listener for mouse moving, calls function 'onMouseMove'
    window.addEventListener('mousemove', onMouseMove);

    // [2.4] Move Camera to table view onClick

    // When mouse is clicked: Function for calculating pointer position, raycasting information...
    const onMouseClick = (event) => {
            // calculate pointer position in normalized device coordinates
            // [-1 to +1] for both components
            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(scene.children);

            // If there are intersected objects with the ray...
            if (intersects.length > 0) {
                let top_object = intersects[0].object

                // Check if intersected object is a table, and what table.
                if (top_object.name.includes("Table1")){ 
                    gsap.to(controls.target,{ x: 10, y: 3, z: -4, duration: 1, ease: 'power2.inOut'});
                    gsap.to(camera.position,{ x: 5, y: 4, z: -4, duration: 1, ease: 'power2.inOut'});
                } else if (top_object.name.includes("Table2")){ 
                    gsap.to(controls.target,{ x: 10, y: 3, z: 1, duration: 1, ease: 'power2.inOut'});
                    gsap.to(camera.position,{ x: 5, y: 4, z: 1, duration: 1, ease: 'power2.inOut'});
                }
            }
             
    };

    // Event listsener for mouse click, sets clicked to True. Otherwise, sets it to false.
    window.addEventListener('click', onMouseClick);


// ---------- Properties ----------


// ! NOT WORKING !
// [2] Overview Position Projection (HTML Element Following Object)
const over4 = document.getElementById("over4");
const canvas = document.querySelector("canvas");
const overposition4 = new THREE.Vector3();







// ---------- RENDERING ----------

// For Camera Testing:
const cam_test = document.getElementById("CAM_TEST");

// [X] Creating a looping function
function animate(t = 0) {
    cam_test.innerHTML = camera.position.x + " " + camera.position.y + " " + camera.position.z;
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controls.update();
    composer.render();
  };
  animate();