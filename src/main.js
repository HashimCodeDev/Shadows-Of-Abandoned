import { Engine, Scene, FreeCamera, Vector3, HemisphericLight, DirectionalLight, 
         MeshBuilder, StandardMaterial, Color3, UniversalCamera, CannonJSPlugin,
         PhysicsImpostor, Sound, ParticleSystem, Texture, SpotLight } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { AssetManager } from './systems/AssetManager.js';
import { AudioManager } from './systems/AudioManager.js';
import { PlayerController } from './systems/PlayerController.js';
import { InteractionManager } from './systems/InteractionManager.js';
import { EventSystem } from './systems/EventSystem.js';
import { SceneManager } from './systems/SceneManager.js';
import { EnvironmentManager } from './systems/EnvironmentManager.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.engine = new Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true });
        this.scene = null;
        this.camera = null;
        
        this.systems = {};
        
        this.init();
    }
    
    async init() {
        // Create scene
        this.scene = new Scene(this.engine);
        this.scene.gravity = new Vector3(0, -9.81, 0);
        this.scene.collisionsEnabled = true;
        
        // Initialize systems
        this.systems.assetManager = new AssetManager(this.scene);
        this.systems.audioManager = new AudioManager(this.scene);
        this.systems.eventSystem = new EventSystem();
        this.systems.sceneManager = new SceneManager(this.scene, this.systems);
        this.systems.environmentManager = new EnvironmentManager(this.scene, this.systems);
        this.systems.interactionManager = new InteractionManager(this.scene, this.systems);
        
        // Setup camera
        this.setupCamera();
        
        // Setup player controller
        this.systems.playerController = new PlayerController(this.camera, this.scene, this.systems);
        
        // Load initial scene
        await this.systems.sceneManager.loadScene('asylum_entrance');
        
        // Start render loop
        this.engine.runRenderLoop(() => {
            this.update();
            this.scene.render();
        });
        
        // Handle resize
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }
    
    setupCamera() {
        this.camera = new FreeCamera('playerCamera', new Vector3(0, 1.8, -5), this.scene);
        this.camera.setTarget(Vector3.Zero());
        this.camera.attachControls(this.canvas, true);
        
        // Camera settings for horror atmosphere
        this.camera.fov = 0.8;
        this.camera.minZ = 0.1;
        this.camera.maxZ = 100;
        
        // Enable collisions
        this.camera.checkCollisions = true;
        this.camera.applyGravity = true;
        this.camera.ellipsoid = new Vector3(0.5, 0.9, 0.5);
    }
    
    update() {
        const deltaTime = this.engine.getDeltaTime() / 1000;
        
        // Update all systems
        Object.values(this.systems).forEach(system => {
            if (system.update) {
                system.update(deltaTime);
            }
        });
    }
}

// Start the game
new Game();