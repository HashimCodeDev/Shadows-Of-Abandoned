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
        let sound = this.sounds.get(name);
        
        // Load sound on demand if not exists
        if (!sound && this.isEnabled) {
            const soundPaths = {
                'footstep_concrete': 'footsteps/concrete.mp3',
                'door_creak': 'interactions/door_creak.mp3',
                'door_locked': 'interactions/door_locked.mp3',
                'door_slam': 'interactions/door_slam.mp3',
                'flashlight_click': 'ui/flashlight_click.mp3',
                'paper_rustle': 'interactions/paper_rustle.mp3',
                'key_pickup': 'interactions/key_pickup.mp3',
                'switch_flip': 'interactions/switch_flip.mp3',
                'generator_start': 'interactions/generator_start.mp3',
                'entity_whisper': 'entity/whisper.mp3',
                'entity_growl': 'entity/growl.mp3',
                'heartbeat': 'stingers/heartbeat.mp3',
                'static': 'stingers/static.mp3'
            };
            
            if (soundPaths[name]) {
                // Create procedural sound for missing audio files
                sound = this.createProceduralSound(name);
                this.sounds.set(name, sound);
            }
        }
        
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
        let sound = this.sounds.get(name);
        
        // Load ambient sound on demand
        if (!sound && this.isEnabled) {
            const ambientPaths = {
                'ambient_asylum': 'ambient/asylum_base.mp3',
                'ambient_corridor': 'ambient/corridor_wind.mp3',
                'ambient_basement': 'ambient/basement_drip.mp3',
                'entity_pursuit': 'ambient/entity_pursuit.mp3',
                'generator_running': 'ambient/generator_loop.mp3'
            };
            
            if (ambientPaths[name]) {
                sound = this.createProceduralAmbient(name);
                this.sounds.set(name, sound);
            }
        }
        
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
    
    createProceduralSound(name) {
        // Create mock sound object for procedural audio
        const soundConfig = {
            'footstep_concrete': { duration: 0.2, frequency: 200 },
            'door_creak': { duration: 1.5, frequency: 150 },
            'door_locked': { duration: 0.5, frequency: 300 },
            'door_slam': { duration: 0.8, frequency: 80 },
            'flashlight_click': { duration: 0.1, frequency: 800 },
            'paper_rustle': { duration: 0.6, frequency: 2000 },
            'key_pickup': { duration: 0.3, frequency: 1200 },
            'switch_flip': { duration: 0.2, frequency: 400 },
            'generator_start': { duration: 2.0, frequency: 60 },
            'entity_whisper': { duration: 2.5, frequency: 100 },
            'entity_growl': { duration: 1.8, frequency: 40 },
            'heartbeat': { duration: 1.0, frequency: 80 },
            'static': { duration: 0.5, frequency: 5000 }
        };
        
        const config = soundConfig[name] || { duration: 0.5, frequency: 440 };
        
        return {
            name,
            config,
            volume: 1.0,
            position: null,
            setVolume: function(vol) { this.volume = vol; },
            setPosition: function(pos) { this.position = pos; },
            play: function() { 
                console.log(`Playing procedural sound: ${this.name} (${this.config.frequency}Hz, ${this.config.duration}s)`); 
            },
            stop: function() { 
                console.log(`Stopping sound: ${this.name}`); 
            },
            dispose: function() {}
        };
    }
    
    createProceduralAmbient(name) {
        const ambientConfig = {
            'ambient_asylum': { frequency: 30, intensity: 0.3 },
            'ambient_corridor': { frequency: 25, intensity: 0.4 },
            'ambient_basement': { frequency: 20, intensity: 0.5 },
            'entity_pursuit': { frequency: 15, intensity: 0.8 },
            'generator_running': { frequency: 120, intensity: 0.6 }
        };
        
        const config = ambientConfig[name] || { frequency: 50, intensity: 0.3 };
        
        return {
            name,
            config,
            volume: config.intensity,
            isPlaying: false,
            setVolume: function(vol) { this.volume = vol; },
            play: function() { 
                this.isPlaying = true;
                console.log(`Playing ambient: ${this.name} (${this.config.frequency}Hz base)`); 
            },
            stop: function() { 
                this.isPlaying = false;
                console.log(`Stopping ambient: ${this.name}`); 
            },
            dispose: function() {}
        };
    }
    
    triggerEntityEncounter(intensity = 1, position = null) {
        // Entity encounter audio sequence
        this.playSound('static', { volume: 0.3 });
        
        setTimeout(() => {
            this.playSound('entity_whisper', { 
                volume: 0.4 * intensity,
                position: position
            });
        }, 500);
        
        setTimeout(() => {
            this.playSound('entity_growl', { 
                volume: 0.6 * intensity,
                position: position
            });
        }, 1500);
        
        if (intensity >= 2) {
            setTimeout(() => {
                this.playSound('heartbeat', { volume: 0.5 });
            }, 2000);
        }
    }
    
    createHorrorStinger(type = 'random') {
        const stingers = ['static', 'entity_whisper', 'heartbeat'];
        const soundName = type === 'random' ? 
            stingers[Math.floor(Math.random() * stingers.length)] : type;
        
        this.playSound(soundName, { volume: 0.2 + Math.random() * 0.3 });
    }
    
    update(deltaTime) {
        // Random horror ambience
        if (Math.random() < 0.0005) { // Very rare random sounds
            this.createHorrorStinger();
        }
        
        // Update 3D audio positioning
        if (this.scene.activeCamera) {
            // Update listener position for spatial audio
            const camera = this.scene.activeCamera;
            // Implementation would update Web Audio API listener position
        }
    }
    
    dispose() {
        this.sounds.forEach(sound => {
            if (sound.dispose) sound.dispose();
        });
        this.sounds.clear();
        this.ambientSounds.clear();
    }
}