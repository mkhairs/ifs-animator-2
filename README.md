IFS Fractal Generator and Animator
======

> "In mathematics, iterated function systems or IFSs are a method of constructing fractals; the resulting constructions are always self-similar."
> -- Wikipedia (<http://en.wikipedia.org/wiki/Iterated_function_system>)

An interactive WebGL fractal generator and animator which uses Iterated Function Systems (IFS) to generate the fractals.

Inspired by [this paper](http://www.inf.uni-konstanz.de/gk/pubsys/publishedFiles/WiSa04.pdf).

Originally created by **sirxemic** – see the original project and demo at <http://sirxemic.github.io/ifs-animator>.  
This fork focuses on a modernized UI and a richer preset experience, while keeping the core IFS implementation intact.

## Demo

You can still use the original demo above for reference; the forked version keeps the same interaction model with an updated layout.

## Features in this fork

- **Modern layout and visuals**
  - White, gradient background with a card-like fractal viewport.
  - Responsive split layout: large fractal canvas on the left, controls in a right-hand sidebar (stacked on smaller screens).
  - Refreshed toolbar and sidebar styling for a more contemporary look.
  - Reduced horizontal padding and tighter control spacing for a more compact UI.
  - Fractal container expanded relative to the sidebar to give more drawing area.

- **Preset “Frame Properties”**
  - New **Presets** panel in the sidebar with a dropdown and **Apply preset** button.
  - Predefined IFS frame configurations for:
    - Sierpinski triangle  
    - Sierpinski carpet  
    - Koch snowflake  
    - Dragon curve  
    - Pythagoras tree  
    - Fern leaf (Barnsley fern)  
    - Lorenz-attractor-style IFS  
    - Menger-sponge-style IFS (2D projection)  
    - L-system-style tree  
    - Weierstrass-style rough curve  
  - Applying a preset:
    - Replaces the current IFS frames with a preset configuration.
    - Adjusts brightness per preset and re-centers the fractal using the existing `Fit to screen` logic.

- **Non-intrusive changes**
  - Core IFS math, animation, and rendering code are unchanged from the original project.
  - All additions live in the UI/layout layer plus a preset configuration object.
  - The “Fork me on GitHub” ribbon has been removed to keep the canvas area clean.

## Controls (unchanged from original)

Most controls should be pretty self-explanatory, except for the canvas itself:

- Move the frames by dragging their origins with the left mouse button.
- Rotate and scale the frames by dragging the end points with the left mouse button. Hold shift to just scale.
- Drag the points of the frames with the right mouse button to skew them.
- Use left mouse button, right mouse button and scroll wheel respectively to pan, rotate and zoom the scene.
