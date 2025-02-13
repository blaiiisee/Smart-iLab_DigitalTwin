// ---------- Some node package manager installs necessary ----------
// npm install three
// npm install gsap

const ip = "http://192.168.1.7:80"; // IP of REST API




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
// CSS2D for HTML Position Projection 
import { CSS2DRenderer, CSS2DObject } from 'jsm/renderers/CSS2DRenderer.js';


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
const renderer = new THREE.WebGLRenderer({antialias: false});

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
controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
// controls.mouseButtons.LEFT = THREE.MOUSE.PAN; // Turn on if want panning
controls.mouseButtons.LEFT = null;

// [2] Creating ambient light
const ambient = new THREE.AmbientLight(0xffffff, 1);
ambient.castShadow = false;
scene.add(ambient);

// [3] Adding directional light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(-10,50,20);
// Setting bounds of the directional light
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
light.shadow.camera.near = 0.1;
light.shadow.camera.far = 500;
light.shadow.camera.left = 50;
light.shadow.camera.right = -50;
light.shadow.camera.top = 50;
light.shadow.camera.bottom = -50;
light.castShadow = true;
light.shadow.bias = -0.0004;
scene.add(light);
// Directional Light Helper
// const helper = new THREE.DirectionalLightHelper(light, 1);
// scene.add(helper);

// [4] Adding a ground plane
const groundGeometry = new THREE.PlaneGeometry(1000,1000,1,1);
groundGeometry.rotateX(-Math.PI /2);
const groundMaterial = new THREE.MeshStandardMaterial({
    color:  0xa1edf7,
    side: THREE.DoubleSide
});
groundMaterial.metalness = 0.8;
groundMaterial.roughness = 0.6;
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

    dog_mesh.position.set(-1.65,3.3,-8);
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

// Loading skybox
loader.load('skybox/scene.gltf', (gltf) => {
    const sky = gltf.scene;
    scene.add(sky);
});








// ---------- Functionalities ----------

// [0] Disable Raytracer if mouse is being held
var mouse_held = false;
window.addEventListener('mousedown', function(){
    mouse_held = true;
});
window.addEventListener('mouseup', function(){
    mouse_held = false;
});


// [1] Camera Reset
    // [1.1] Isometric View
var rst_cam_btn = document.getElementById("rst_cam_btn");
rst_cam_btn.onclick = function(){
    gsap.to(controls.target,{ x: 0, y: 0, z: 0, duration: 1, ease: 'power2.inOut'});
    gsap.to(camera.position,{ x: 20, y: 20, z: 20, duration: 1, ease: 'power2.inOut'});
};
     // [1.2] Overhead View
var rst_cam_btn = document.getElementById("top_cam_btn");
rst_cam_btn.onclick = function(){
    gsap.to(controls.target,{ x: 0, y: 0, z: 0, duration: 1, ease: 'power2.inOut'});
    gsap.to(camera.position,{ x: 0, y: 30, z: 0.1, duration: 1, ease: 'power2.inOut'});
};

// [2] Table Selection 
    // [2.1] Plane and Wireframe Generation for each table (for object detection)

    // table_geometry sets the table dimensions and orientation
    const table_geometry = new THREE.PlaneGeometry(3,4.77,1,1);
    table_geometry.rotateX(Math.PI/2);
    // table_material sets the table color
    const table_material = new THREE.MeshStandardMaterial({
        color:  0xe8fcff,
        side: THREE.DoubleSide
    });
    table_material.roughness = 0.6;

    // Define positions of table (tops)
    const table_positions = [
        [9.79, 2.305, -4.65],
        [9.79, 2.305, 0.28],
        [9.79, 2.305, 5.24],
        [9.79, 2.305, 10.21],
        [-0.1, 2.305, -4.65],
        [-0.1, 2.305, 0.28],
        [-0.1, 2.305, 5.24],
        [-0.1, 2.305, 10.21],
        [-3.25, 2.305, -4.65],
        [-3.25, 2.305, 0.28],
        [-3.25, 2.305, 5.24],
        [-3.25, 2.305, 10.21],
        [-12.48, 2.305, -4.65],
        [-12.48, 2.305, 0.28],
        [-12.48, 2.305, 5.24],
        [-12.48, 2.305, 10.21]
    ];
    
    // Create a plane for each table top
    table_positions.forEach((pos, index) => {
        const table = new THREE.Mesh(table_geometry, table_material);
        table.castShadow = false;
        table.receiveShadow = true;
        table.name = `Table${index + 1}`;
        scene.add(table);
        table.position.set(...pos);
    });

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
            if(mouse_held) return; // If mouse is being held down i.e. rotating the scene, DO NOT TRACE RAYS

            // calculate pointer position in normalized device coordinates
            // [-1 to +1] for both components
            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(scene.children.filter(child => child.name.includes("Table")), false); // false -> non-recursive, better performance
            
            // If there are intersected objects with the ray...
            if (intersects.length > 0) {
                outlinePass.selectedObjects = [];
                let top_object = intersects[0].object
                document.getElementById("the_body").style.cursor = "default";

                if (top_object.name.includes("Table")){ // If the object at the top is a "Table" identified via object.name as defined here in code
                    document.getElementById("the_body").style.cursor = "pointer";
                    outlinePass.selectedObjects = [top_object];
                }           
            } else {
                outlinePass.selectedObjects = [];
                document.getElementById("the_body").style.cursor = "default";
            }
            
    
    };
    // Event listener for mouse moving, calls function 'onMouseMove'
    window.addEventListener('mousemove', onMouseMove);

    // [2.4] Move Camera to table view onClick + Show dashboard
    
    const closeBtn = document.getElementById("closeModal");     // Dashboard close button
    const modal = document.getElementById("modal");             // Dashboard reference

    closeBtn.addEventListener("click", () => {
        modal.classList.remove("open");                                                     // Close Dashboard
        window.addEventListener('mousemove', onMouseMove);                                  // Turn on raycasting for onMouseMove
        window.addEventListener('click', onMouseClick);                                     // Turn on raycasting for onMouseClick
        gsap.to(controls.target,{ x: 0, y: 0, z: 0, duration: 1, ease: 'power2.inOut'});    // Return to default view
        gsap.to(camera.position,{ x: 20, y: 20, z: 20, duration: 1, ease: 'power2.inOut'});
    });


    // When mouse is clicked: Function for calculating pointer position, raycasting information...
    const onMouseClick = (event) => {
            // calculate pointer position in normalized device coordinates
            // [-1 to +1] for both components
            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(scene.children.filter(child => child.name.includes("Table")), false); // false -> non-recursive, better performance

            // If there are intersected objects with the ray...
            if (intersects.length > 0) {
                let top_object = intersects[0].object
                let tableName = top_object.name;

                // Check which if and which table is clicked
                if (tableName.includes("Table")) {
                    let tableNumber = parseInt(tableName.replace("Table", ""), 10);
                
                    let positions = {
                        target: { x: 10, y: 3, z: 0 },
                        camera: { x: 5, y: 4, z: 0 }
                    };
                
                    if (tableNumber >= 1 && tableNumber <= 4) {
                        positions.target.x = 10;
                        positions.camera.x = 5;
                        positions.target.z = [-4.65, 0.28, 5.24, 10.21][tableNumber - 1];
                        positions.camera.z = positions.target.z;
                    } else if (tableNumber >= 5 && tableNumber <= 8) {
                        positions.target.x = -6;
                        positions.camera.x = 5;
                        positions.target.z = [-4.65, 0.28, 5.24, 10.21][tableNumber - 5];
                        positions.camera.z = positions.target.z;
                    } else if (tableNumber >= 9 && tableNumber <= 12) {
                        positions.target.x = -2;
                        positions.camera.x = -8;
                        positions.target.z = [-4.65, 0.28, 5.24, 10.21][tableNumber - 9];
                        positions.camera.z = positions.target.z;
                    } else if (tableNumber >= 13 && tableNumber <= 16) {
                        positions.target.x = -13.5;
                        positions.camera.x = -8;
                        positions.target.z = [-4.65, 0.28, 5.24, 10.21][tableNumber - 13];
                        positions.camera.z = positions.target.z;
                    }
                
                    gsap.to(controls.target, { ...positions.target, duration: 1, ease: 'power2.inOut' });   // Look at table
                    gsap.to(camera.position, { ...positions.camera, duration: 1, ease: 'power2.inOut' });   // Set camera position
                    document.getElementById("the_body").style.cursor = "default";       // Turn pointer to default
                    modal.classList.add("open");                                        // Open Dashboard
                    window.removeEventListener('mousemove', onMouseMove);               // Turn off raycasting for onMouseMove
                    window.removeEventListener('click', onMouseClick);                  // Turn off raycasting for onMouseClick

                    // Add table number in Dashboard view
                    document.getElementById("table_num").innerHTML = '<img src="/assets/icons/table-Icon.png" height="15px" style="margin-right: 10px;">Table '+tableNumber;
                    // Add last updated time in Dashboard view
                    document.getElementById("last_update").innerHTML = time_update;
                    // Add sensor ID in dashboard sensor header
                    document.getElementById("msr-2-id").innerHTML = '#'+ msr_2_ids[tableNumber-1];
                    document.getElementById("air-1-id").innerHTML = '#'+ air_1_ids[tableNumber-1];
                    document.getElementById("smart-plug-1-id").innerHTML = '#'+ smart_plug_1_ids[tableNumber-1];
                    document.getElementById("smart-plug-2-id").innerHTML = '#'+ smart_plug_2_ids[tableNumber-1];

                    setInterval(update_sensors(tableNumber), 10000);
                }
            } 
             
    };

    // Event listsener for mouse click, sets clicked to True. Otherwise, sets it to false.
    window.addEventListener('click', onMouseClick);








// ---------- Properties ----------

// [1] Overview Position Projection (HTML Element Following Object)

// Creation of Label Renderer as a CSS2D Renderer
    let labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize( window.innerWidth, window.innerHeight );
    labelRenderer.domElement.style.position = 'absolute';   // Place on top most layer
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none';  // Do not capture mouse events
    document.body.appendChild( labelRenderer.domElement );

// Creation of HTML Objects that will be placed as labels on 3D space
    const temp_labels = [];

    table_positions.forEach((pos) => {
        let tempElement = document.createElement('p');
        tempElement.textContent = "Loading..."; // Placeholder for REST API data
        tempElement.className = "label";  // Apply styling based on temperature

        let tempLabel = new CSS2DObject(tempElement);
        scene.add(tempLabel);
        tempLabel.position.set(...pos);

        temp_labels.push(tempElement); // Store references for later updates
    });

// Hide labels if checkbox is turned off
    const temp_checkbox = document.getElementById("temp_checkbox");

    function checkbox()  {
        let opacityValue = temp_checkbox.checked ? '75%' : '0%';    // true : false

        for (let i = 0; i < 16; i++) {
            temp_labels[i].style.opacity = opacityValue;
        }
    }
    
    

// [2] Getting Information from REST API

// !!! Working incomplete !!!    
// API for get requests
var time_update;

// Future reference: GET msr_2_ids instead?
const msr_2_ids = [
    '2b7624',
    '87a5f4',
    'c07ce8',
    'cc0b5c',
    '89f464',
    '87a5dc',
    '1ee998',
    '87a5ec',
    '1ef110',
    '87a298',
    '89304c',
    '88edc8',
    'cd7014',
    'c660fc',
    'c8f5b4',
    'c7b650'
];

const air_1_ids = [
    '88e4c8',
    '89e8d8',
    '88e590',
    '87b074',
    '889720',
    '87f510',
    '2da640',
    '89ea14',
    '889b88',
    '889938',
    '88e85c',
    '89e548',
    '88970c',
    '2deb24',
    '89e5f0',
    'cc8f24'
];

const smart_plug_1_ids =[
    '9d86e0',
    '9d9572',
    '9d923d',
    '9d929b',
    '9d88e7',
    '9d929e',
    '9d9421',
    '9d89d4',
    '9d92a3',
    '9d8718',
    '9d3535',
    '9d90c3',
    '9d97ec',
    '9d927c',
    '9d88c5',
    '9cdee5'
];

const smart_plug_2_ids = [
    '9d86aa',
    '9d93d2',
    '9d8665',
    '9d9293',
    '9d924e',
    '9d9265',
    '9d8877',
    '9d8a03',
    '9d88e6',
    '9cda9a',
    '9d90b9',
    '9d94a6',
    '9d8671',
    '9d356f',
    '9d887f',
    '9d893e'
];

// To add: Update ALL tables in this one function
function table_update() {
    msr_2_ids.forEach((id, index) => {
        fetch(ip + `/msr-2/${id}`, { headers: { accept: '/' } })    // IP address to change
            .then(res => res.json())
            .then(data => {
                // Changing the temperature value
                if (temp_labels[index]) {
                    temp_labels[index].textContent = `${(data['temperature']).toFixed(2)}°C`; // REMOVE Math.random()
                }
                // REMOVE THIS FOR LAST UPDATED TIME -- DASHBOARD HEADER
                if (id == 'cc0b5c') {time_update = `Server last updated: ${data['timestamp']}`;}
            })
            .catch(error => console.error(`Error fetching sensor ${id}:`, error));
            // To add: Changing color based on temperature value
        });
}

table_update();
setInterval(table_update, 10000); // Run function every 10000ms (10s)

// Function to update data in Dashboard view
function update_sensors(table_no){

    document.querySelectorAll(".sensor_data").forEach(el => el.innerHTML = "");     // Clear all data to refresh

    fetch(ip + `/msr-2/${msr_2_ids[table_no-1]}`, { headers: { accept: '/' } })    // IP address to change
            .then(res => res.json())
            .then(data => {
                let keys = Object.keys(data);           // Store keys (parameters) in JSON to temporary variable
                keys.forEach((id, index) => {           // For each parameter, careful with changing this
                    document.getElementById("msr-2-data").innerHTML = document.getElementById("msr-2-data").innerHTML + 
                    `<div class="key-value">
                    <p class="key">${keys[index]}</p>
                    <p class="value">${data[keys[index]]}</p>
                    </div>`;
                    
                });
            });
    fetch(ip + `/air-1/${air_1_ids[table_no-1]}`, { headers: { accept: '/' } })    // IP address to change
            .then(res => res.json())
            .then(data => {
                let keys = Object.keys(data);           // Store keys (parameters) in JSON to temporary variable
                keys.forEach((id, index) => {           // For each parameter, careful with changing this
                    document.getElementById("air-1-data").innerHTML = document.getElementById("air-1-data").innerHTML + 
                    `<div class="key-value">
                    <p class="key">${keys[index]}</p>
                    <p class="value">${data[keys[index]]}</p>
                    </div>`;
                    
                });
            });
    fetch(ip + `/smart-plug-v2/${smart_plug_1_ids[table_no-1]}`, { headers: { accept: '/' } })    // IP address to change
            .then(res => res.json())
            .then(data => {
                let keys = Object.keys(data);           // Store keys (parameters) in JSON to temporary variable
                keys.forEach((id, index) => {           // For each parameter, careful with changing this
                    document.getElementById("smart-plug-1-data").innerHTML = document.getElementById("smart-plug-1-data").innerHTML + 
                    `<div class="key-value">
                    <p class="key">${keys[index]}</p>
                    <p class="value">${data[keys[index]]}</p>
                    </div>`;
                    
                });
            });
    fetch(ip + `/smart-plug-v2/${smart_plug_2_ids[table_no-1]}`, { headers: { accept: '/' } })    // IP address to change
            .then(res => res.json())
            .then(data => {
                let keys = Object.keys(data);           // Store keys (parameters) in JSON to temporary variable
                keys.forEach((id, index) => {           // For each parameter, careful with changing this
                    document.getElementById("smart-plug-2-data").innerHTML = document.getElementById("smart-plug-2-data").innerHTML + 
                    `<div class="key-value">
                    <p class="key">${keys[index]}</p>
                    <p class="value">${data[keys[index]]}</p>
                    </div>`;
                    
                });
            });
}




// ---------- RENDERING ----------
// For Camera Testing:
const cam_test = document.getElementById("CAM_TEST");

// [X] Creating a looping function
function animate(t = 0) {
    cam_test.innerHTML = camera.position.x.toFixed(2) + " " + camera.position.y.toFixed(2) + " " + camera.position.z.toFixed(2);
    requestAnimationFrame(animate);
    renderer.render(scene, camera);         // Render Scene
    controls.update();                      // Update OrbitControls
    composer.render();                      // Render Composre (for OutlinePass)
    labelRenderer.render(scene, camera);    // Render Labels
    checkbox();                             // Check if checkbox is selected
  };
  animate();