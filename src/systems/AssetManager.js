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
            // Load model without textures first to avoid 404 errors
            const result = await SceneLoader.ImportMeshAsync('', 'assets/models/', path, this.scene, null, null, null, '.gltf');
            this.loadedAssets.set(name, result);
            
            console.log(`Model ${name} loaded successfully with ${result.meshes.length} meshes`);
            
            // Setup collisions for imported meshes
            result.meshes.forEach(mesh => {
                if (mesh.name.includes('collision') || mesh.name.includes('wall')) {
                    mesh.checkCollisions = true;
                    mesh.isVisible = false;
                } else {
                    // Enable collisions for furniture
                    mesh.checkCollisions = true;
                    // Apply basic material if textures failed
                    if (!mesh.material || mesh.material.diffuseTexture?.hasAlpha === undefined) {
                        mesh.material = this.createPlaceholderMaterial();
                    }
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
        console.log(`Creating instance for model: ${modelName}`, modelData ? 'Model found' : 'Model not found');
        
        if (!modelData) {
            console.warn(`Model ${modelName} not loaded`);
            return null;
        }
        
        console.log('Model meshes:', modelData.meshes.map(m => m.name));
        
        // Clone the first mesh as instance
        const originalMesh = modelData.meshes.find(m => m.geometry) || modelData.meshes[0];
        if (!originalMesh) {
            console.warn('No suitable mesh found for instancing');
            return null;
        }
        
        console.log('Using mesh for instance:', originalMesh.name);
        
        const instance = originalMesh.createInstance(`${modelName}_instance_${Date.now()}`);
        instance.position.copyFrom(position);
        
        if (rotation) {
            instance.rotation.copyFrom(rotation);
        }
        
        if (scale) {
            instance.scaling.copyFrom(scale);
        }
        
        instance.checkCollisions = true;
        console.log('Model instance created at position:', instance.position);
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