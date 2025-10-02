import { SceneLoader, AssetsManager, Mesh, StandardMaterial, Color3, Texture, Sound } from '@babylonjs/core';

export class AssetManager {
    constructor(scene) {
        this.scene = scene;
        this.loadedAssets = new Map();
        this.assetsManager = new AssetsManager(scene);
    }
    
    async loadModel(name, path) {
        if (this.loadedAssets.has(name)) {
            return this.loadedAssets.get(name);
        }
        
        try {
            const result = await SceneLoader.ImportMeshAsync('', 'assets/models/', path, this.scene);
            this.loadedAssets.set(name, result);
            
            // Setup collisions for imported meshes
            result.meshes.forEach(mesh => {
                if (mesh.name.includes('collision') || mesh.name.includes('wall')) {
                    mesh.checkCollisions = true;
                    mesh.isVisible = false;
                } else {
                    // Enable collisions for furniture
                    mesh.checkCollisions = true;
                }
            });
            
            return result;
        } catch (error) {
            console.warn(`Failed to load model ${name}:`, error);
            return null;
        }
    }
    
    async createModelInstance(modelName, position, rotation = null, scale = null) {
        const modelData = this.loadedAssets.get(modelName);
        if (!modelData) {
            console.warn(`Model ${modelName} not loaded`);
            return null;
        }
        
        // Clone the first mesh as instance
        const originalMesh = modelData.meshes.find(m => m.geometry);
        if (!originalMesh) return null;
        
        const instance = originalMesh.createInstance(`${modelName}_instance_${Date.now()}`);
        instance.position.copyFrom(position);
        
        if (rotation) {
            instance.rotation.copyFrom(rotation);
        }
        
        if (scale) {
            instance.scaling.copyFrom(scale);
        }
        
        instance.checkCollisions = true;
        return instance;
    }
    
    async loadTexture(name, path) {
        if (this.loadedAssets.has(name)) {
            return this.loadedAssets.get(name);
        }
        
        const texture = new Texture(`assets/textures/${path}`, this.scene);
        this.loadedAssets.set(name, texture);
        return texture;
    }
    
    async loadSound(name, path) {
        if (this.loadedAssets.has(name)) {
            return this.loadedAssets.get(name);
        }
        
        const sound = new Sound(name, `assets/audio/${path}`, this.scene, null, {
            loop: false,
            autoplay: false
        });
        
        this.loadedAssets.set(name, sound);
        return sound;
    }
    
    createPlaceholderMesh(name, size = 1) {
        const mesh = Mesh.CreateBox(name, size, this.scene);
        mesh.material = this.scene.getMaterialByName('placeholder') || this.createPlaceholderMaterial();
        mesh.checkCollisions = true;
        return mesh;
    }
    
    async loadTableModel() {
        // Load the industrial coffee table GLTF model
        return await this.loadModel('table', 'industrial_coffee_table_4k.gltf');
    }
    
    createPlaceholderMaterial() {
        const material = new StandardMaterial('placeholder', this.scene);
        material.diffuseColor = new Color3(0.5, 0.5, 0.5);
        material.emissiveColor = new Color3(0.1, 0.1, 0.1);
        return material;
    }
    
    getLoadedModel(name) {
        return this.loadedAssets.get(name);
    }
    
    dispose() {
        this.loadedAssets.clear();
        this.assetsManager.reset();
    }
}