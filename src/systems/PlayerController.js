import { Vector3, Ray, SpotLight, Color3 } from '@babylonjs/core';

export class PlayerController {
    constructor(camera, scene, systems) {
        this.camera = camera;
        this.scene = scene;
        this.systems = systems;
        
        this.moveSpeed = 3.0;
        this.mouseSensitivity = 0.002;
        this.isMoving = false;
        this.lastFootstepTime = 0;
        this.footstepInterval = 500;
        
        // Flashlight system
        this.flashlight = null;
        this.flashlightEnabled = false;
        this.batteryLevel = 100;
        this.batteryDrainRate = 2; // per second when on
        this.flickerChance = 0.02;
        
        this.keys = {};
        this.mouseMovement = { x: 0, y: 0 };
        
        this.setupControls();
        this.setupFlashlight();
        this.setupPointerLock();
    }
    
    setupControls() {
        // Keyboard input
        this.scene.onKeyboardObservable.add((kbInfo) => {
            const key = kbInfo.event.key.toLowerCase();
            
            if (kbInfo.type === 1) { // Key down
                this.keys[key] = true;
                
                if (key === 'f') {
                    this.toggleFlashlight();
                }
                if (key === 'e') {
                    this.systems.interactionManager.tryInteract();
                }
            } else if (kbInfo.type === 2) { // Key up
                this.keys[key] = false;
            }
        });
        
        // Mouse input
        this.scene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.type === 4) { // Mouse move
                if (document.pointerLockElement === this.scene.getEngine().getRenderingCanvas()) {
                    this.mouseMovement.x = pointerInfo.event.movementX || 0;
                    this.mouseMovement.y = pointerInfo.event.movementY || 0;
                }
            }
        });
    }
    
    setupFlashlight() {
        this.flashlight = new SpotLight(
            'flashlight',
            this.camera.position,
            this.camera.getForwardRay().direction,
            Math.PI / 6,
            2,
            this.scene
        );
        
        this.flashlight.diffuse = new Color3(1, 0.9, 0.7);
        this.flashlight.intensity = 0;
        this.flashlight.range = 15;
        this.flashlight.parent = this.camera;
    }
    
    setupPointerLock() {
        const canvas = this.scene.getEngine().getRenderingCanvas();
        
        canvas.addEventListener('click', () => {
            canvas.requestPointerLock();
        });
        
        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement !== canvas) {
                // Pointer lock lost
            }
        });
    }
    
    update(deltaTime) {
        this.handleMovement(deltaTime);
        this.handleMouseLook();
        this.updateFlashlight(deltaTime);
        this.updateFootsteps(deltaTime);
        this.updateUI();
    }
    
    handleMovement(deltaTime) {
        const moveVector = Vector3.Zero();
        let moving = false;
        
        if (this.keys['w']) {
            moveVector.addInPlace(this.camera.getForwardRay().direction);
            moving = true;
        }
        if (this.keys['s']) {
            moveVector.subtractInPlace(this.camera.getForwardRay().direction);
            moving = true;
        }
        if (this.keys['a']) {
            moveVector.subtractInPlace(this.camera.getRightVector());
            moving = true;
        }
        if (this.keys['d']) {
            moveVector.addInPlace(this.camera.getRightVector());
            moving = true;
        }
        
        if (moving) {
            moveVector.normalize();
            moveVector.scaleInPlace(this.moveSpeed * deltaTime);
            moveVector.y = 0; // Prevent flying
            
            this.camera.position.addInPlace(moveVector);
        }
        
        this.isMoving = moving;
    }
    
    handleMouseLook() {
        if (this.mouseMovement.x !== 0 || this.mouseMovement.y !== 0) {
            this.camera.rotation.y += this.mouseMovement.x * this.mouseSensitivity;
            this.camera.rotation.x += this.mouseMovement.y * this.mouseSensitivity;
            
            // Clamp vertical rotation
            this.camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.camera.rotation.x));
            
            this.mouseMovement.x = 0;
            this.mouseMovement.y = 0;
        }
    }
    
    updateFlashlight(deltaTime) {
        if (this.flashlightEnabled) {
            // Drain battery
            this.batteryLevel = Math.max(0, this.batteryLevel - this.batteryDrainRate * deltaTime);
            
            // Flicker effect when battery is low
            let intensity = 2.0;
            if (this.batteryLevel < 20) {
                if (Math.random() < this.flickerChance * (21 - this.batteryLevel)) {
                    intensity = Math.random() * 0.5;
                }
            }
            
            // Turn off if battery dead
            if (this.batteryLevel <= 0) {
                intensity = 0;
                this.flashlightEnabled = false;
            }
            
            this.flashlight.intensity = intensity;
        } else {
            this.flashlight.intensity = 0;
        }
        
        // Update flashlight position and direction
        this.flashlight.position.copyFrom(this.camera.position);
        this.flashlight.direction.copyFrom(this.camera.getForwardRay().direction);
    }
    
    updateFootsteps(deltaTime) {
        if (this.isMoving) {
            const currentTime = Date.now();
            if (currentTime - this.lastFootstepTime > this.footstepInterval) {
                this.systems.audioManager.playFootstep();
                this.lastFootstepTime = currentTime;
            }
        }
    }
    
    updateUI() {
        const batteryElement = document.getElementById('battery');
        if (batteryElement) {
            batteryElement.textContent = `${Math.floor(this.batteryLevel)}%`;
        }
    }
    
    toggleFlashlight() {
        if (this.batteryLevel > 0) {
            this.flashlightEnabled = !this.flashlightEnabled;
            this.systems.audioManager.playSound('flashlight_click');
        }
    }
    
    getPosition() {
        return this.camera.position.clone();
    }
    
    getForwardDirection() {
        return this.camera.getForwardRay().direction.clone();
    }
}