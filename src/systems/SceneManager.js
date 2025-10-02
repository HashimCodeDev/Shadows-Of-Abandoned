import { Vector3, MeshBuilder, StandardMaterial, Color3, Texture } from '@babylonjs/core';

export class SceneManager {
    constructor(scene, systems) {
        this.scene = scene;
        this.systems = systems;
        this.currentScene = null;
        this.sceneData = new Map();
        
        this.initializeScenes();
    }
    
    initializeScenes() {
        // Define scene layouts and content
        this.sceneData.set('asylum_entrance', {
            name: 'Asylum Entrance',
            playerStart: new Vector3(0, 1.8, -5),
            environment: 'entrance_hall',
            lighting: 'dim',
            interactables: [
                { type: 'note', position: new Vector3(2, 1, 0), data: { 
                    title: 'Patient Log - Day 1',
                    content: 'The new treatment shows promise. Subjects report vivid hallucinations but remain docile. Dr. Hartwell believes we are close to a breakthrough in consciousness manipulation.'
                }},
                { type: 'key', position: new Vector3(-3, 1, 2), data: { id: 'office_key', name: 'Office Key' }},
                { type: 'door', position: new Vector3(0, 0, 10), data: { locked: true, keyId: 'office_key', targetScene: 'main_corridor' }}
            ],
            triggers: [
                { position: new Vector3(0, 0, 5), radius: 2, event: 'area_entered', data: { area: 'entrance' }}
            ]
        });
        
        this.sceneData.set('main_corridor', {
            name: 'Main Corridor',
            playerStart: new Vector3(0, 1.8, -8),
            environment: 'long_corridor',
            lighting: 'flickering',
            interactables: [
                { type: 'note', position: new Vector3(5, 1, 0), data: {
                    title: 'Research Notes - Dr. Hartwell',
                    content: 'Day 47: The subjects have begun to change. Something is wrong. They speak of shadows that move independently, of whispers in empty rooms. I fear we have opened a door that should have remained closed.'
                }},
                { type: 'switch', position: new Vector3(-4, 1.5, 3), data: { id: 'corridor_lights', controls: 'lighting' }},
                { type: 'door', position: new Vector3(0, 0, 15), data: { locked: false, targetScene: 'restricted_area' }}
            ],
            triggers: [
                { position: new Vector3(0, 0, 0), radius: 3, event: 'entity_encounter', data: { intensity: 1 }},
                { position: new Vector3(0, 0, 10), radius: 2, event: 'area_entered', data: { area: 'corridor' }}
            ]
        });
        
        this.sceneData.set('restricted_area', {
            name: 'Restricted Research Wing',
            playerStart: new Vector3(0, 1.8, -5),
            environment: 'research_wing',
            lighting: 'emergency',
            interactables: [
                { type: 'note', position: new Vector3(3, 1, 5), data: {
                    title: 'FINAL LOG - EVACUATION ORDER',
                    content: 'Day 73: IMMEDIATE EVACUATION ORDERED. The entity has manifested. It feeds on light, grows stronger in darkness. All personnel must evacuate immediately. May God forgive us for what we have unleashed.'
                }},
                { type: 'generator', position: new Vector3(-5, 0, 8), data: { id: 'main_generator', powers: 'exit_lighting' }},
                { type: 'door', position: new Vector3(0, 0, 12), data: { locked: true, keyId: 'exit_key', targetScene: 'exit' }}
            ],
            triggers: [
                { position: new Vector3(0, 0, 0), radius: 5, event: 'area_entered', data: { area: 'restricted' }},
                { position: new Vector3(-2, 0, 6), radius: 2, event: 'entity_encounter', data: { intensity: 3 }}
            ]
        });
    }
    
    async loadScene(sceneName) {
        const sceneData = this.sceneData.get(sceneName);
        if (!sceneData) {
            console.error(`Scene ${sceneName} not found`);
            return false;
        }
        
        // Clear current scene
        if (this.currentScene) {
            this.clearScene();
        }
        
        console.log(`Loading scene: ${sceneData.name}`);
        
        // Set player position
        this.scene.activeCamera.position.copyFrom(sceneData.playerStart);
        
        // Load environment
        await this.loadEnvironment(sceneData.environment);
        
        // Setup lighting
        this.setupLighting(sceneData.lighting);
        
        // Create interactables
        this.createInteractables(sceneData.interactables);
        
        // Setup triggers
        this.setupTriggers(sceneData.triggers);
        
        // Start ambient audio
        this.systems.audioManager.playAmbient('ambient_asylum');
        
        this.currentScene = sceneName;
        
        // Emit scene loaded event
        this.systems.eventSystem.emit('scene_loaded', { scene: sceneName, data: sceneData });
        
        return true;
    }
    
    async loadEnvironment(environmentType) {
        // Create basic environment geometry
        switch (environmentType) {
            case 'entrance_hall':
                await this.createEntranceHall();
                break;
            case 'long_corridor':
                await this.createLongCorridor();
                break;
            case 'research_wing':
                await this.createResearchWing();
                break;
            default:
                await this.createBasicRoom();
        }
    }
    
    async createEntranceHall() {
        // Floor
        const floor = MeshBuilder.CreateGround('floor', { width: 20, height: 20 }, this.scene);
        floor.position.y = 0;
        floor.checkCollisions = true;
        
        const floorMaterial = new StandardMaterial('floorMaterial', this.scene);
        floorMaterial.diffuseColor = new Color3(0.3, 0.3, 0.3);
        floorMaterial.specularColor = new Color3(0.1, 0.1, 0.1);
        floor.material = floorMaterial;
        
        // Walls
        this.createWalls(20, 20, 4);
        
        // Add some basic props
        this.createBasicProps();
    }
    
    async createLongCorridor() {
        // Floor
        const floor = MeshBuilder.CreateGround('floor', { width: 6, height: 30 }, this.scene);
        floor.position.y = 0;
        floor.checkCollisions = true;
        
        const floorMaterial = new StandardMaterial('floorMaterial', this.scene);
        floorMaterial.diffuseColor = new Color3(0.2, 0.25, 0.2);
        floor.material = floorMaterial;
        
        // Corridor walls
        this.createCorridorWalls(6, 30, 4);
        
        // Add doors along corridor
        this.createCorridorDoors();
    }
    
    async createResearchWing() {
        // Larger research area
        const floor = MeshBuilder.CreateGround('floor', { width: 25, height: 15 }, this.scene);
        floor.position.y = 0;
        floor.checkCollisions = true;
        
        const floorMaterial = new StandardMaterial('floorMaterial', this.scene);
        floorMaterial.diffuseColor = new Color3(0.15, 0.15, 0.2);
        floor.material = floorMaterial;
        
        // Research wing walls
        this.createWalls(25, 15, 4);
        
        // Add research equipment
        this.createResearchEquipment();
    }
    
    createWalls(width, depth, height) {
        const wallMaterial = new StandardMaterial('wallMaterial', this.scene);
        wallMaterial.diffuseColor = new Color3(0.4, 0.4, 0.35);
        wallMaterial.specularColor = new Color3(0.1, 0.1, 0.1);
        
        // Create walls
        const walls = [
            { pos: new Vector3(0, height/2, depth/2), size: new Vector3(width, height, 0.2) },
            { pos: new Vector3(0, height/2, -depth/2), size: new Vector3(width, height, 0.2) },
            { pos: new Vector3(width/2, height/2, 0), size: new Vector3(0.2, height, depth) },
            { pos: new Vector3(-width/2, height/2, 0), size: new Vector3(0.2, height, depth) }
        ];
        
        walls.forEach((wall, index) => {
            const wallMesh = MeshBuilder.CreateBox(`wall_${index}`, { 
                width: wall.size.x, 
                height: wall.size.y, 
                depth: wall.size.z 
            }, this.scene);
            wallMesh.position.copyFrom(wall.pos);
            wallMesh.material = wallMaterial;
            wallMesh.checkCollisions = true;
        });
    }
    
    createCorridorWalls(width, length, height) {
        const wallMaterial = new StandardMaterial('wallMaterial', this.scene);
        wallMaterial.diffuseColor = new Color3(0.35, 0.4, 0.35);
        
        // Side walls
        const leftWall = MeshBuilder.CreateBox('leftWall', { width: 0.2, height: height, depth: length }, this.scene);
        leftWall.position = new Vector3(-width/2, height/2, 0);
        leftWall.material = wallMaterial;
        leftWall.checkCollisions = true;
        
        const rightWall = MeshBuilder.CreateBox('rightWall', { width: 0.2, height: height, depth: length }, this.scene);
        rightWall.position = new Vector3(width/2, height/2, 0);
        rightWall.material = wallMaterial;
        rightWall.checkCollisions = true;
    }
    
    createBasicProps() {
        // Simple furniture/debris
        const propMaterial = new StandardMaterial('propMaterial', this.scene);
        propMaterial.diffuseColor = new Color3(0.3, 0.2, 0.1);
        
        // Broken chair
        const chair = MeshBuilder.CreateBox('chair', { width: 1, height: 1.5, depth: 1 }, this.scene);
        chair.position = new Vector3(3, 0.75, 2);
        chair.material = propMaterial;
        
        // Debris
        const debris = MeshBuilder.CreateBox('debris', { width: 0.5, height: 0.3, depth: 0.8 }, this.scene);
        debris.position = new Vector3(-2, 0.15, -1);
        debris.material = propMaterial;
    }
    
    createCorridorDoors() {
        const doorMaterial = new StandardMaterial('doorMaterial', this.scene);
        doorMaterial.diffuseColor = new Color3(0.4, 0.3, 0.2);
        
        // Create doors along corridor
        for (let i = -10; i <= 10; i += 5) {
            if (i !== 0) { // Skip center
                const door = MeshBuilder.CreateBox(`door_${i}`, { width: 1.5, height: 2.5, depth: 0.1 }, this.scene);
                door.position = new Vector3(2.5, 1.25, i);
                door.material = doorMaterial;
            }
        }
    }
    
    createResearchEquipment() {
        const equipMaterial = new StandardMaterial('equipMaterial', this.scene);
        equipMaterial.diffuseColor = new Color3(0.6, 0.6, 0.7);
        equipMaterial.emissiveColor = new Color3(0.1, 0.1, 0.2);
        
        // Research tables
        const table1 = MeshBuilder.CreateBox('table1', { width: 3, height: 0.8, depth: 1.5 }, this.scene);
        table1.position = new Vector3(5, 0.4, 3);
        table1.material = equipMaterial;
        
        const table2 = MeshBuilder.CreateBox('table2', { width: 2, height: 0.8, depth: 1 }, this.scene);
        table2.position = new Vector3(-4, 0.4, -2);
        table2.material = equipMaterial;
    }
    
    setupLighting(lightingType) {
        // Remove existing lights except flashlight
        this.scene.lights.forEach(light => {
            if (light.name !== 'flashlight') {
                light.dispose();
            }
        });
        
        switch (lightingType) {
            case 'dim':
                this.systems.environmentManager.setupDimLighting();
                break;
            case 'flickering':
                this.systems.environmentManager.setupFlickeringLights();
                break;
            case 'emergency':
                this.systems.environmentManager.setupEmergencyLighting();
                break;
            default:
                this.systems.environmentManager.setupBasicLighting();
        }
    }
    
    createInteractables(interactables) {
        interactables.forEach(item => {
            const mesh = this.systems.assetManager.createPlaceholderMesh(
                `${item.type}_${Date.now()}`, 
                item.type === 'door' ? 2 : 0.5
            );
            mesh.position.copyFrom(item.position);
            
            // Special handling for different types
            if (item.type === 'door') {
                mesh.scaling = new Vector3(1.5, 2.5, 0.1);
                mesh.material.diffuseColor = new Color3(0.4, 0.3, 0.2);
            } else if (item.type === 'note') {
                mesh.scaling = new Vector3(0.3, 0.01, 0.4);
                mesh.material.diffuseColor = new Color3(0.9, 0.9, 0.8);
            } else if (item.type === 'key') {
                mesh.scaling = new Vector3(0.1, 0.3, 0.05);
                mesh.material.diffuseColor = new Color3(0.8, 0.7, 0.2);
                mesh.material.emissiveColor = new Color3(0.2, 0.15, 0.05);
            }
            
            this.systems.interactionManager.registerInteractable(mesh, item.type, item.data);
        });
    }
    
    setupTriggers(triggers) {
        triggers.forEach(trigger => {
            // Create invisible trigger zones
            const triggerMesh = MeshBuilder.CreateSphere(`trigger_${Date.now()}`, { diameter: trigger.radius * 2 }, this.scene);
            triggerMesh.position.copyFrom(trigger.position);
            triggerMesh.isVisible = false;
            
            // Check for player entering trigger zone
            this.scene.registerBeforeRender(() => {
                const playerPos = this.scene.activeCamera.position;
                const distance = Vector3.Distance(playerPos, trigger.position);
                
                if (distance <= trigger.radius) {
                    this.systems.eventSystem.emit(trigger.event, trigger.data);
                    // Remove trigger after activation (single use)
                    triggerMesh.dispose();
                }
            });
        });
    }
    
    clearScene() {
        // Dispose of scene-specific meshes and materials
        this.scene.meshes.forEach(mesh => {
            if (mesh.name !== 'playerCamera' && !mesh.name.includes('flashlight')) {
                mesh.dispose();
            }
        });
        
        // Clear interactables
        this.systems.interactionManager.dispose();
        
        // Stop ambient sounds
        this.systems.audioManager.stopAmbient('ambient_asylum');
    }
    
    getCurrentScene() {
        return this.currentScene;
    }
    
    getSceneData(sceneName) {
        return this.sceneData.get(sceneName);
    }
}