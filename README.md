Project Lazarus 🌌
==================

**Project Lazarus** is a scientifically accurate interstellar wormhole visualization platform inspired by the 2015 research paper _"Visualizing Interstellar's Wormhole"_ by James, von Tunzelmann, Franklin & Thorne. The project faithfully implements the physics equations used in the movie _Interstellar_ to generate realistic gravitational lensing effects.

🚀 Features
-----------

*   🌀 Real-time geodesic ray tracing through curved spacetime
    
*   🎵 Immersive audio system featuring Hans Zimmer’s _Interstellar_ soundtrack
    
*   ⚙ Physics-accurate wormhole simulation using Dneg three-parameter equations
    
*   ⚡ Smooth 60fps WebGL rendering with Three.js
    
*   🎨 Interactive shader controls with real-time parameter adjustments
    
*   🌟 Dynamic, twinkling starfields with custom shader effects
    
*   📊 Performance monitoring with FPS counter
    
*   🎛 Dual rendering modes: Geometry visualization and ray-traced simulation
    
*   🔇 Toggleable UI with fullscreen and audio controls
    
*   📐 Mathematical annotations and dimensional displays
    

🔥 Technologies
---------------

*   🏗 **Framework:** Next.js with TypeScript
    
*   🎭 **3D Rendering:** Three.js with custom WebGL shaders
    
*   🔬 **Physics:** Hamiltonian geodesic integration for ray tracing
    
*   💻 **Frontend:** React with advanced state management
    
*   🎨 **Styling:** Tailwind CSS with custom components
    
*   🎵 **Audio:** React H5 Audio Player for precise music control
    
*   🌌 **Shaders:** Custom GLSL implementation of gravitational lensing equations
    
*   ⭐ **Visual Effects:** Procedural starfields and particle systems
    

🛠 Installation
---------------

### Prerequisites

*   Node.js v18 or later
    
*   npm or yarn
    

### Steps

1.  Clone or download the repository
    
2.  \# Using npmnpm install# Using yarnyarn install add —legacy-peer-ds flag
    
3.  Add texture files to /public/:
    
    *   galaxy.jpg (wormhole interior texture)
        
    *   galaxy\_05.jpg (wormhole exterior texture)
        
4.  npm run dev
    

🎮 Controls
-----------

### Keyboard Shortcuts

*   H — Toggle UI visibility
    
*   F — Enter/exit fullscreen
    

### Parameter Controls

*   **Wormhole Physics:** Adjust radius (ρ), half-length (a), and lensing (M)
    
*   **Camera:** Control distance and viewing angle
    
*   **Advanced Parameters:**
    
    *   Rotation modes (Oscillating, Bounded, Linear, Spiral)
        
    *   Einstein ring customization (color, intensity, sharpness)
        
    *   Particle visibility toggle
        
    *   Animation pause/resume
        

### Render Modes

*   **Geometry Mode:** Wireframe embedding diagram with mathematical visualization
    
*   **Ray-Traced Mode:** Physics-accurate gravitational lensing simulation
    

🧮 Physics Implementation
-------------------------

*   **Wormhole Metric:** Dneg three-parameter wormhole (ρ, a, M)
    
*   **Ray Tracing:** Real-time integration of light geodesics using Hamilton’s equations
    
*   **Gravitational Lensing:** Primary, secondary, and tertiary lensed images
    
*   **Einstein Rings:** Physics-based ring visualization with adjustable properties
    

💡 About
--------

Project Lazarus bridges science and cinematic visualization, making advanced general relativity concepts accessible through interactive exploration. Its ray tracing system solves the actual differential equations governing light propagation in curved spacetime, offering a genuine physics sandbox for students, enthusiasts, and researchers alike.

Future plans include Kerr black hole visualization, expanding to more exotic spacetime geometries.

🎵 Audio Credits
----------------

Background music sourced from Hans Zimmer’s _Interstellar_ Original Motion Picture Soundtrack:

*   Day One (Interstellar Theme) 
*   The Wormhole
*   Introducing The Dust Bowl (Short Film Audio)
*   Alessandro Roussel - ScienceClic Musique
    
    

📚 Scientific Reference
-----------------------

Based on the paper: _"Visualizing Interstellar's Wormhole"_ — Oliver James, Eugénie von Tunzelmann, Paul Franklin, Kip S. Thorne (2015).

Created by Egret with ❤️ for physics education and scientific visualization.

For questions or technical support, please reach out at egretfx@gmail.com.