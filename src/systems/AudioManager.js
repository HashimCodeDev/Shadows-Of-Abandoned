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
        // Load core audio files
        await this.loadSound('ambient_asylum', 'ambient/asylum_drone.mp3', { loop: true, volume: 0.3 });
        await this.loadSound('footstep_concrete', 'footsteps/concrete_step.mp3', { volume: 0.4 });
        await this.loadSound('door_creak', 'interactions/door_creak.mp3', { volume: 0.6 });
        await this.loadSound('key_pickup', 'interactions/key_pickup.mp3', { volume: 0.5 });
        await this.loadSound('paper_rustle', 'interactions/paper_rustle.mp3', { volume: 0.4 });
        await this.loadSound('stinger_1', 'stingers/horror_stinger_1.mp3', { volume: 0.8 });
        await this.loadSound('whisper_1', 'entity/whisper_1.mp3', { volume: 0.6 });
        await this.loadSound('flashlight_click', 'ui/flashlight_click.mp3', { volume: 0.3 });
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
        if (!sound || !this.isEnabled) return;
        
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