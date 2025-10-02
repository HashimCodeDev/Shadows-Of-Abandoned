import { Sound, Vector3 } from '@babylonjs/core';

export class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.sounds = new Map();
        this.ambientSounds = new Map();
        this.isEnabled = true;
        this.masterVolume = 0.7;
        
        this.initializeAudio();
    }
    
    async initializeAudio() {
        // Audio files will be loaded on demand to avoid 404 errors
        console.log('Audio system initialized - sounds will load on first use');
    }
    
    async loadSound(name, path, options = {}) {
        try {
            const sound = new Sound(name, `assets/audio/${path}`, this.scene, null, {
                loop: options.loop || false,
                autoplay: false,
                volume: (options.volume || 1.0) * this.masterVolume,
                spatialSound: options.spatial || false,
                maxDistance: options.maxDistance || 20
            });
            
            this.sounds.set(name, sound);
            return sound;
        } catch (error) {
            console.warn(`Failed to load sound ${name}:`, error);
            return null;
        }
    }
    
    playSound(name, options = {}) {
        const sound = this.sounds.get(name);
        if (!sound || !this.isEnabled) {
            console.log(`Sound ${name} not loaded or audio disabled`);
            return;
        }
        
        if (options.position) {
            sound.setPosition(options.position);
        }
        
        if (options.volume !== undefined) {
            sound.setVolume(options.volume * this.masterVolume);
        }
        
        sound.play();
    }
    
    stopSound(name) {
        const sound = this.sounds.get(name);
        if (sound) {
            sound.stop();
        }
    }
    
    playAmbient(name) {
        const sound = this.sounds.get(name);
        if (sound && this.isEnabled) {
            sound.play();
            this.ambientSounds.set(name, sound);
        }
    }
    
    stopAmbient(name) {
        const sound = this.ambientSounds.get(name);
        if (sound) {
            sound.stop();
            this.ambientSounds.delete(name);
        }
    }
    
    playFootstep(surface = 'concrete') {
        this.playSound(`footstep_${surface}`, { volume: Math.random() * 0.2 + 0.3 });
    }
    
    playStinger(intensity = 1) {
        this.playSound(`stinger_${intensity}`, { volume: 0.8 });
    }
    
    playEntitySound(position) {
        this.playSound('whisper_1', { 
            position: position,
            volume: 0.6,
            spatial: true 
        });
    }
    
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        
        this.sounds.forEach(sound => {
            const originalVolume = sound._volume / this.masterVolume;
            sound.setVolume(originalVolume * this.masterVolume);
        });
    }
    
    toggleAudio() {
        this.isEnabled = !this.isEnabled;
        
        if (!this.isEnabled) {
            this.sounds.forEach(sound => sound.stop());
        }
    }
    
    dispose() {
        this.sounds.forEach(sound => sound.dispose());
        this.sounds.clear();
        this.ambientSounds.clear();
    }
}