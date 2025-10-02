# Shadows of the Abandoned

A browser-based 3D horror game built with Babylon.js. Explore an abandoned mental asylum, uncover dark secrets, and survive encounters with an otherworldly entity.

## Story

You wake inside a closed asylum abandoned since the 1970s after a mass disappearance. Through scattered documents and clues, you discover a failed mind-warping experiment that unleashed something that should have remained hidden. The entity that remains is invisible in light and manifests in darkness.

## Features

### Core Gameplay
- **First-person exploration** with WASD movement and mouse look
- **Flashlight system** with limited battery and realistic flickering
- **Physics-based collision** and gravity
- **Interactive objects** including doors, notes, keys, and switches

### Atmosphere
- **Dynamic lighting** with volumetric effects and realistic shadows
- **Atmospheric audio** including ambient sounds, footsteps, and entity encounters
- **Particle effects** for dust and environmental atmosphere
- **Cold color palette** with flickering emergency lighting

### Story Progression
- **Document collection** revealing the asylum's dark history
- **Key-based progression** through locked areas
- **Trigger-based events** for entity encounters and story beats
- **Chase sequences** in restricted areas
- **Multiple endings** based on player choices

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Modern web browser with WebGL support

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd shadows-of-abandoned
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Game Controls

- **WASD** - Movement
- **Mouse** - Look around
- **F** - Toggle flashlight
- **E** - Interact with objects
- **Click** - Lock mouse cursor (required for mouse look)

## Project Structure

```
src/
├── main.js              # Game entry point
└── systems/
    ├── AssetManager.js   # 3D model, texture, and audio loading
    ├── AudioManager.js   # Spatial audio and sound effects
    ├── PlayerController.js # First-person movement and flashlight
    ├── InteractionManager.js # Object interaction system
    ├── EventSystem.js    # Story progression and triggers
    ├── SceneManager.js   # Scene loading and management
    └── EnvironmentManager.js # Lighting and atmospheric effects

public/assets/
├── models/              # 3D models (GLTF/GLB format)
├── textures/           # Texture files
└── audio/              # Sound effects and ambient audio
    ├── ambient/        # Background atmosphere
    ├── footsteps/      # Movement sounds
    ├── interactions/   # Object interaction sounds
    ├── stingers/       # Horror stingers
    ├── entity/         # Entity-related audio
    └── ui/             # UI sound effects
```

## Adding Assets

### 3D Models
Place GLTF/GLB files in `public/assets/models/`. The AssetManager will handle loading and collision setup.

### Audio Files
Supported formats: MP3, WAV, OGG
- Place ambient tracks in `public/assets/audio/ambient/`
- Place sound effects in appropriate subdirectories

### Textures
Place image files (PNG, JPG) in `public/assets/textures/`

## Customization

### Adding New Scenes
1. Define scene data in `SceneManager.js`
2. Include environment layout, interactables, and triggers
3. Load the scene using `sceneManager.loadScene('scene_name')`

### Creating Interactables
```javascript
// Register an interactable object
interactionManager.registerInteractable(mesh, 'note', {
    title: 'Document Title',
    content: 'Document content...'
});
```

### Adding Story Events
```javascript
// Listen for story events
eventSystem.on('custom_event', (data) => {
    // Handle event
});

// Trigger story events
eventSystem.emit('custom_event', { data: 'value' });
```

## Performance Optimization

The game is optimized for WebGL deployment:
- **Asset bundling** with Vite for efficient loading
- **Texture compression** and LOD systems
- **Particle system optimization** for atmospheric effects
- **Lighting optimization** with minimal shadow casting
- **Collision mesh optimization** with simplified geometry

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

Requires WebGL 2.0 support for optimal performance.

## Development

### Adding New Systems
1. Create a new file in `src/systems/`
2. Export a class with `constructor(scene, systems)` and `update(deltaTime)` methods
3. Initialize in `main.js`

### Debugging
- Use browser developer tools for debugging
- Babylon.js Inspector available in development builds
- Console logging for event system and asset loading

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

Built with:
- [Babylon.js](https://babylonjs.com/) - 3D engine
- [Vite](https://vitejs.dev/) - Build tool
- Web Audio API - Spatial audio processing