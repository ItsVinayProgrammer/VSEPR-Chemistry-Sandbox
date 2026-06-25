/**
 * scene.js
 * 
 * 3D Scene Initialization, lighting (strong ambient + shadows), OrbitControls,
 * local-coordinate mesh creation (solving the floating atoms bug), GSAP transition
 * animations, recursive WebGL memory disposal, and bond angle calculations.
 */

// Global main scene variables
let mainScene, mainCamera, mainRenderer, mainControls;
let moleculeGroup; // Holds all 3D components of the active molecule
let mainCanvasWrapper;
let mainCanvas;

// Active state of 3D objects
let activeDomains = []; // Array of objects: { type: 'bond'|'lone_pair', mesh: THREE.Group, currentDir: THREE.Vector3, targetDir: THREE.Vector3, bondType: string }
let centralAtomMesh = null;
let bondAngleLines = []; // Array of lines representing angles
let angleLabels = []; // Array of HTML label elements: { element, pos3d }

// Parameters
const BOND_LENGTH = 1.6;
const CENTRAL_RADIUS = 0.55;
const OUTER_RADIUS = 0.42;

// Check if we are animating
let isTransitioning = false;

// Ideal directions for N electron domains
const DOMAIN_DIRECTIONS = {
  1: [
    new THREE.Vector3(0, 0, 1)
  ],
  2: [
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, 0, -1)
  ],
  3: [
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0.866, -0.5, 0),
    new THREE.Vector3(-0.866, -0.5, 0)
  ],
  4: [
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0.943, -0.333, 0),
    new THREE.Vector3(-0.471, -0.333, 0.816),
    new THREE.Vector3(-0.471, -0.333, -0.816)
  ],
  5: [
    // Axial
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, -1, 0),
    // Equatorial
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(-0.5, 0, 0.866),
    new THREE.Vector3(-0.5, 0, -0.866)
  ],
  6: [
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, 0, -1)
  ],
  7: [
    // Axial
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, -1, 0),
    // Equatorial
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0.309, 0, 0.951),
    new THREE.Vector3(-0.809, 0, 0.588),
    new THREE.Vector3(-0.809, 0, -0.588),
    new THREE.Vector3(0.309, 0, -0.951)
  ]
};

/**
 * Initializes the Three.js 3D environment
 */
function init3D() {
  mainCanvasWrapper = document.getElementById('canvas-wrapper');
  mainCanvas = document.getElementById('three-canvas');

  // Create Scene
  mainScene = new THREE.Scene();

  // Create Camera
  mainCamera = new THREE.PerspectiveCamera(
    42, 
    mainCanvasWrapper.clientWidth / mainCanvasWrapper.clientHeight, 
    0.1, 
    100
  );
  mainCamera.position.set(0, 2, 7.5);

  // Create Renderer
  try {
    mainRenderer = new THREE.WebGLRenderer({ canvas: mainCanvas, antialias: true, alpha: true });
    mainRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mainRenderer.setSize(mainCanvasWrapper.clientWidth, mainCanvasWrapper.clientHeight);
    mainRenderer.setClearColor(0xF1F5F9, 1);
    mainRenderer.shadowMap.enabled = true;
    mainRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
  } catch (e) {
    console.error("WebGL initialization failed:", e);
    const loadingText = document.getElementById('lbl-loading-text');
    if (loadingText) {
      loadingText.innerHTML = `
        <div style="color: #EF4444; text-align: center; max-width: 85%; margin: 0 auto; font-family: system-ui, sans-serif; line-height: 1.5; font-size: 0.95rem;">
          <span style="font-size: 2.2rem;"></span><br><br>
          <strong>WebGL Error</strong><br>
          Your browser or device does not support WebGL, or Hardware Acceleration is disabled.<br><br>
          Please enable "Use graphics acceleration when available" in your browser settings, update your graphics drivers, and reload.
        </div>
      `;
      const spinner = document.querySelector('.spinner');
      if (spinner) spinner.style.display = 'none';
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.style.display = 'flex';
        loadingScreen.style.opacity = '1';
      }
    }
    return;
  }

  // Add Lights
  // 1. Stronger AmbientLight to prevent black shadowed areas on white elements
  const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.65);
  mainScene.add(ambientLight);

  // 2. High-contrast DirectionalLight configured for casting soft shadows
  const dirLight = new THREE.DirectionalLight(0xFFFFFF, 0.85);
  dirLight.position.set(4, 9, 3);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 20;
  
  // Set boundaries for shadow frustum
  const d = 3;
  dirLight.shadow.camera.left = -d;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;
  dirLight.shadow.camera.bottom = -d;
  dirLight.shadow.bias = -0.0005;
  mainScene.add(dirLight);

  // 3. Colored backlighting for aesthetic volume
  const rimLight = new THREE.DirectionalLight(0x93C5FD, 0.35); // Soft blue rim
  rimLight.position.set(-4, -4, -3);
  mainScene.add(rimLight);

  const accentRim = new THREE.PointLight(0xC084FC, 0.45, 12); // Soft purple core fill
  accentRim.position.set(0, -3, 3);
  mainScene.add(accentRim);

  // 4. Soft specular highlight point light (Section 3)
  const specHighlight = new THREE.PointLight(0xFFFFFF, 0.8, 15);
  specHighlight.position.set(2, 5, 4);
  mainScene.add(specHighlight);

  // Setup OrbitControls
  mainControls = new THREE.OrbitControls(mainCamera, mainCanvasWrapper);
  mainControls.enableDamping = true;
  mainControls.dampingFactor = 0.05;
  mainControls.minDistance = 3.5;
  mainControls.maxDistance = 14;
  mainControls.enablePan = false; // Stay pinned strictly on origin (0,0,0)
  mainControls.target.set(0, 0, 0);

  mainCamera.lookAt(0, 0, 0);

  // Create Group for Molecule
  moleculeGroup = new THREE.Group();
  mainScene.add(moleculeGroup);

  // Window Resize
  window.addEventListener('resize', onWindowResize);

  // Start Animation Loop
  animate();
}

/**
 * Handle canvas resizing dynamically
 */
function resizeMainCanvas() {
  if (mainCamera && mainCanvasWrapper && mainRenderer) {
    const width = mainCanvasWrapper.clientWidth;
    const height = mainCanvasWrapper.clientHeight;
    if (width > 0 && height > 0) {
      mainCamera.aspect = width / height;
      mainCamera.updateProjectionMatrix();
      mainRenderer.setSize(width, height);
    }
  }
}

/**
 * Handle canvas resizing
 */
function onWindowResize() {
  resizeMainCanvas();
}

/**
 * Main animation & render loop
 */
function animate() {
  requestAnimationFrame(animate);

  // Update OrbitControls
  if (mainControls) mainControls.update();

  // Slow rotation logic tied to state.isAutoRotating (Bug Fix 3)
  if (moleculeGroup && window.state && window.state.isAutoRotating && !isTransitioning) {
    moleculeGroup.rotation.y += 0.0018; // Very slow and natural rotation speed
  }

  // Update HTML overlay labels
  projectAngleLabels();

  // Render Scene
  if (mainRenderer && mainScene && mainCamera) {
    mainRenderer.render(mainScene, mainCamera);
  }
}

// ==========================================================================
// WebGL Memory Cleanup & Disposal (CRITICAL)
// ==========================================================================

/**
 * Recursively disposes of geometries and materials on a Three.js object node
 */
function disposeNode(node) {
  if (node.geometry) {
    node.geometry.dispose();
  }
  if (node.material) {
    if (Array.isArray(node.material)) {
      node.material.forEach(mat => mat.dispose());
    } else {
      node.material.dispose();
    }
  }
}

/**
 * Clears the 3D scene elements and runs full garbage collection on them
 */
function clear3DScene() {
  // Dispose active lines
  bondAngleLines.forEach(line => {
    moleculeGroup.remove(line);
    disposeNode(line);
  });
  bondAngleLines = [];

  // Remove HTML labels from DOM
  const overlayContainer = document.getElementById('bond-angles-overlay-container');
  overlayContainer.innerHTML = '';
  angleLabels = [];

  // Dispose central atom
  if (centralAtomMesh) {
    moleculeGroup.remove(centralAtomMesh);
    disposeNode(centralAtomMesh);
    centralAtomMesh = null;
  }

  // Dispose domains
  activeDomains.forEach(dom => {
    moleculeGroup.remove(dom.mesh);
    dom.mesh.traverse(child => {
      if (child.isMesh || child.isLine) {
        disposeNode(child);
      }
    });
  });
  activeDomains = [];
}

// ==========================================================================
// Local Coordinate 3D Mesh Builders (Bug Fix 1)
// ==========================================================================

/**
 * Helper to build Standard materials with high roughness and slight metalness (Bug Fix 2)
 */
function createAtomMaterial(colorHex) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    roughness: 0.3,   // Glossy standard material (roughness: 0.3, metalness: 0.1)
    metalness: 0.1,   // Slight metalness
    shadowSide: THREE.DoubleSide
  });
}

/**
 * Static single cylinder aligned along Y axis (from 0 to height)
 */
function createStaticCylinder(height, radius = 0.055) {
  const geom = new THREE.CylinderGeometry(radius, radius, height, 16);
  
  // Center cylinder geometry so its pivot bottom is at (0,0,0) locally
  geom.translate(0, height / 2, 0);

  const mat = new THREE.MeshStandardMaterial({
    color: 0xE2E8F0,
    roughness: 0.5,
    metalness: 0.1,
    shadowSide: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(geom, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * Builds a double bond (two parallel offset cylinders along local Y axis)
 */
function createLocalDoubleBond(height) {
  const group = new THREE.Group();
  const offset = 0.085;
  
  const c1 = createStaticCylinder(height, 0.042);
  c1.position.x = offset;
  
  const c2 = createStaticCylinder(height, 0.042);
  c2.position.x = -offset;

  group.add(c1);
  group.add(c2);
  return group;
}

/**
 * Builds a triple bond (three parallel offset cylinders along local Y axis)
 */
function createLocalTripleBond(height) {
  const group = new THREE.Group();
  const offset = 0.11;

  const cCenter = createStaticCylinder(height, 0.038);
  
  const cLeft = createStaticCylinder(height, 0.038);
  cLeft.position.x = offset;

  const cRight = createStaticCylinder(height, 0.038);
  cRight.position.x = -offset;

  group.add(cCenter);
  group.add(cLeft);
  group.add(cRight);
  return group;
}

/**
 * Builds a lone pair lobe aligned along local Y axis
 */
function createLocalLonePairLobe() {
  const lobeGroup = new THREE.Group();

  // 1. Adjusted curve: Stays paper-thin until y=0.9 to clear the central atom, then balloons out
  const curve = new THREE.CubicBezierCurve(
    new THREE.Vector2(0, 0.0),       // Attach to central atom (hidden inside)
    new THREE.Vector2(0.01, 0.9),    // Keep stalk extremely narrow past the atom radius (r=0.55)
    new THREE.Vector2(0.85, 1.3),    // Expand rapidly into a balloon/water-drop bulge (increased horizontal bulge from 0.65 to 0.85)
    new THREE.Vector2(0, 1.6)        // Close the balloon at the top
  );

  const points = curve.getPoints(32);
  const geom = new THREE.LatheGeometry(points, 32);

  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffcc00,
    transmission: 0.6,
    opacity: 0.8,
    transparent: true,
    roughness: 0.1,
    metalness: 0.1,
    depthWrite: false, // Prevents transparent overlapping sort artifacts
    side: THREE.DoubleSide
  });

  const lobeMesh = new THREE.Mesh(geom, mat);
  lobeMesh.castShadow = false;
  lobeMesh.receiveShadow = true;
  lobeGroup.add(lobeMesh);

  // 2. Adjust electrons to sit perfectly inside the new higher bulge at y=1.35
  const elecGeom = new THREE.SphereGeometry(0.06, 16, 16);
  const elecMat = new THREE.MeshStandardMaterial({
    color: 0x000000, // Changed from white (0xffffff) to black (0x000000)
    roughness: 0.4,
    metalness: 0.1
  });

  const e1 = new THREE.Mesh(elecGeom, elecMat);
  e1.position.set(-0.12, 1.35, 0);

  const e2 = new THREE.Mesh(elecGeom, elecMat);
  e2.position.set(0.12, 1.35, 0);

  lobeGroup.add(e1);
  lobeGroup.add(e2);

  return lobeGroup;
}

/**
 * Attaches a lone pair to the group at (x, y, z) coordinates
 */
function addLonePair(group, x, y, z) {
  const lobe = createLocalLonePairLobe();
  lobe.position.set(x, y, z);
  group.add(lobe);
  return lobe;
}

// ==========================================================================
// SSOT Dynamic Scene Rendering
// ==========================================================================

/**
 * Distributes lone pairs and bonds onto target VSEPR direction vectors.
 * Prioritizes lone pair placement:
 *   - 5 domains: equatorial first (indices 2, 3, 4)
 *   - 6 domains: axial opposite first (indices 0, 1)
 */
function distributeDomains(bonds, lonePairsCount, totalDomains) {
  const directions = DOMAIN_DIRECTIONS[totalDomains] || [];
  const domainPositions = [];

  // Create list of roles (true = lone pair, false = bond)
  const roles = new Array(totalDomains).fill(false);

  if (totalDomains === 5) {
    let lpToPlace = lonePairsCount;
    const equatorialIndices = [2, 3, 4];
    for (let idx of equatorialIndices) {
      if (lpToPlace > 0) {
        roles[idx] = true;
        lpToPlace--;
      }
    }
    if (lpToPlace > 0) roles[0] = true;
    if (lpToPlace > 1) roles[1] = true;
  } 
  else if (totalDomains === 6) {
    if (lonePairsCount >= 1) roles[1] = true; // Bottom axial
    if (lonePairsCount >= 2) roles[0] = true; // Top axial
    
    let lpToPlace = lonePairsCount - 2;
    const eq = [2, 3, 4, 5];
    for (let idx of eq) {
      if (lpToPlace > 0) {
        roles[idx] = true;
        lpToPlace--;
      }
    }
  } 
  else {
    let lpToPlace = lonePairsCount;
    for (let i = 0; i < totalDomains; i++) {
      if (lpToPlace > 0) {
        roles[i] = true;
        lpToPlace--;
      }
    }
  }

  let bondIdx = 0;
  for (let i = 0; i < totalDomains; i++) {
    const dir = directions[i].clone();
    if (roles[i]) {
      domainPositions.push({
        type: 'lone_pair',
        targetDir: dir,
        bondType: null
      });
    } else {
      const bond = bonds[bondIdx];
      domainPositions.push({
        type: 'bond',
        targetDir: dir,
        bondType: bond ? bond.type : 'single'
      });
      bondIdx++;
    }
  }

  return domainPositions;
}

/**
 * Updates the 3D scene representation based on central state.
 * Implements smooth GSAP transitions and handles input locking.
 */
function renderMoleculeScene(state, onCompleteCallback) {
  if (isTransitioning) return;

  isTransitioning = true;
  window.setIsAnimatingState(true);

  const bonds = state.domains.bonds;
  const lonePairsCount = state.domains.lonePairs;
  const bondedCount = bonds.length;
  const totalDomains = bondedCount + lonePairsCount;

  // Colors
  let centralColor = window.CPK_COLORS['Default'];
  let outerColor = window.CPK_COLORS['Generic'];

  if (state.mode === 'real' && state.selectedRealMolecule) {
    const molInfo = window.REAL_MOLECULES[state.selectedRealMolecule];
    if (molInfo) {
      centralColor = window.CPK_COLORS[molInfo.centralAtom] || window.CPK_COLORS['Default'];
      outerColor = window.CPK_COLORS[molInfo.outerAtom] || window.CPK_COLORS['Generic'];
    }
  }

  // 1. Central Atom
  if (centralAtomMesh) {
    moleculeGroup.remove(centralAtomMesh);
    disposeNode(centralAtomMesh);
  }
  const centralGeom = new THREE.SphereGeometry(CENTRAL_RADIUS, 32, 32);
  const centralMat = createAtomMaterial(centralColor);
  centralAtomMesh = new THREE.Mesh(centralGeom, centralMat);
  centralAtomMesh.castShadow = true;
  centralAtomMesh.receiveShadow = true;
  moleculeGroup.add(centralAtomMesh);

  // Make absolutely sure moleculeGroup is attached to mainScene (Check 6 safeguard)
  if (mainScene && !mainScene.children.includes(moleculeGroup)) {
    mainScene.add(moleculeGroup);
  }

  // 2. Clear old bond angle structures
  bondAngleLines.forEach(line => {
    moleculeGroup.remove(line);
    disposeNode(line);
  });
  bondAngleLines = [];
  document.getElementById('bond-angles-overlay-container').innerHTML = '';
  angleLabels = [];

  // 3. Prepare target layouts
  const targets = distributeDomains(bonds, lonePairsCount, totalDomains);

  // Align active lists
  const maxItems = Math.max(activeDomains.length, targets.length);
  const animationPromisedTweens = [];

  for (let i = 0; i < maxItems; i++) {
    const target = targets[i];
    let active = activeDomains[i];

    if (!target) {
      // Surplus item: shrink scale and remove (Bug Fix 1 / local coordinate scaling)
      if (active) {
        const meshToShrink = active.mesh;
        const tweenObj = { scale: 1.0 };
        const tween = gsap.to(tweenObj, {
          scale: 0.0,
          duration: 0.45,
          ease: 'back.in(1.6)',
          onUpdate: () => {
            meshToShrink.scale.set(tweenObj.scale, tweenObj.scale, tweenObj.scale);
          },
          onComplete: () => {
            moleculeGroup.remove(meshToShrink);
            meshToShrink.traverse(child => {
              if (child.isMesh) disposeNode(child);
            });
          }
        });
        animationPromisedTweens.push(tween);
      }
      continue;
    }

    if (!active) {
      // New domain added: instantiate Group at origin and grow scale outwards (Bug Fix 1)
      const domGroup = new THREE.Group();
      domGroup.scale.set(0.001, 0.001, 0.001); // Start small
      moleculeGroup.add(domGroup);

      active = {
        type: target.type,
        mesh: domGroup,
        currentDir: new THREE.Vector3(0, 1, 0), // Default pointing local Y
        targetDir: target.targetDir.clone(),
        bondType: target.bondType
      };
      activeDomains.push(active);

      // Create static mesh items inside group (atoms and local bonds)
      buildDomainSubmeshes(active, outerColor);

      // Initial orientation set
      domGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), target.targetDir.clone().normalize());

      // Grow scale
      const scaleObj = { s: 0.001 };
      const tweenScale = gsap.to(scaleObj, {
        s: 1.0,
        duration: 0.5,
        ease: 'back.out(1.4)',
        onUpdate: () => {
          domGroup.scale.set(scaleObj.s, scaleObj.s, scaleObj.s);
        }
      });
      animationPromisedTweens.push(tweenScale);
    } else {
      // Existing domain: If its type changed, rebuild submeshes in local coordinates
      if (active.type !== target.type || active.bondType !== target.bondType) {
        active.mesh.traverse(child => {
          if (child.isMesh) disposeNode(child);
        });
        while (active.mesh.children.length > 0) {
          active.mesh.remove(active.mesh.children[0]);
        }
        active.type = target.type;
        active.bondType = target.bondType;
        buildDomainSubmeshes(active, outerColor);
      } else {
        // Just update outer atom color in case it was modified (Real Molecule switches)
        active.mesh.traverse(child => {
          if (child.name === 'atom_sphere') {
            child.material.color.set(outerColor);
          }
        });
      }
      active.targetDir.copy(target.targetDir);
    }

    // Interpolate direction vectors cleanly (resolves race condition NaN issues)
    const dirObj = {
      x: active.currentDir.x,
      y: active.currentDir.y,
      z: active.currentDir.z
    };

    const targetPos = target.targetDir.clone(); // Animating as unit vector

    const tweenDir = gsap.to(dirObj, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 0.55,
      ease: 'power2.out',
      onUpdate: () => {
        active.currentDir.set(dirObj.x, dirObj.y, dirObj.z);
        const len = active.currentDir.length();
        if (len > 0.01) {
          // Orient the parent group so its local Y axis points along currentDir
          const norm = active.currentDir.clone().normalize();
          active.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), norm);
        }
      }
    });

    animationPromisedTweens.push(tweenDir);
  }

  // Filter list
  activeDomains = activeDomains.slice(0, targets.length);

  // Toggle lone pairs visibility
  setLonePairsVisibility(state.settings.showLonePairs);

  // Wait for all GSAP tweens to complete
  if (animationPromisedTweens.length > 0) {
    Promise.all(animationPromisedTweens.map(t => new Promise(resolve => t.eventCallback('onComplete', resolve))))
      .then(() => {
        isTransitioning = false;
        window.setIsAnimatingState(false);
        
        // Rebuild bond angles once coordinates are locked
        buildBondAngles(state);

        if (onCompleteCallback) onCompleteCallback();
      });
  } else {
    isTransitioning = false;
    window.setIsAnimatingState(false);
    buildBondAngles(state);
    if (onCompleteCallback) onCompleteCallback();
  }
}

/**
 * Builds the static local submeshes inside the domain group.
 * The central atom is at local (0,0,0). The outer atom is placed at local (0, BOND_LENGTH, 0).
 * Cylinders are centered along local Y axis (from 0 to BOND_LENGTH).
 */
function buildDomainSubmeshes(domain, outerColorHex) {
  const group = domain.mesh;

  if (domain.type === 'bond') {
    // 1. Connect local Cylinder geometries from (0,0,0) to (0, BOND_LENGTH, 0) - Resolves missing bonds!
    let cylinderMesh;
    if (domain.bondType === 'single') {
      cylinderMesh = createStaticCylinder(BOND_LENGTH, 0.055);
    } else if (domain.bondType === 'double') {
      cylinderMesh = createLocalDoubleBond(BOND_LENGTH);
    } else {
      cylinderMesh = createLocalTripleBond(BOND_LENGTH);
    }
    cylinderMesh.name = 'bond_cylinder_holder';
    group.add(cylinderMesh);

    // 2. Add outer atom sphere at local (0, BOND_LENGTH, 0)
    const geom = new THREE.SphereGeometry(OUTER_RADIUS, 32, 32);
    const mat = createAtomMaterial(outerColorHex);
    const sphere = new THREE.Mesh(geom, mat);
    sphere.name = 'atom_sphere';
    sphere.position.set(0, BOND_LENGTH, 0); // Positioned at tip of local Y-axis
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    group.add(sphere);
  } else {
    // Add lone pair lobe mesh pointing up local Y
    const lobe = createLocalLonePairLobe();
    lobe.name = 'lobe_mesh';
    group.add(lobe);
  }
}

/**
 * Show or hide lone pair lobes based on visual toggle state
 */
function setLonePairsVisibility(visible) {
  activeDomains.forEach(dom => {
    if (dom.type === 'lone_pair') {
      dom.mesh.visible = visible;
    }
  });
}

// ==========================================================================
// Bond Angle Arcs & Floating Projected Labels
// ==========================================================================

/**
 * Performs SLERP to draw a smooth curved arc in 3D space
 */
function createArcPoints(v1, v2, radius, segments = 20) {
  const points = [];
  const u1 = v1.clone().normalize();
  const u2 = v2.clone().normalize();
  
  const dot = u1.dot(u2);
  let theta = Math.acos(Math.max(-1, Math.min(1, dot)));
  
  // Handle collinear (180°) cases
  if (Math.abs(theta - Math.PI) < 0.01) {
    let axis = new THREE.Vector3(0, 1, 0);
    if (Math.abs(u1.dot(axis)) > 0.95) {
      axis.set(1, 0, 0);
    }
    const perp = new THREE.Vector3().crossVectors(u1, axis).normalize();
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI;
      const p = u1.clone().multiplyScalar(Math.cos(angle)).add(perp.clone().multiplyScalar(Math.sin(angle)));
      points.push(p.multiplyScalar(radius));
    }
    return { points, mid: points[Math.floor(segments / 2)].clone(), theta };
  }

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const p = new THREE.Vector3();
    const s1 = Math.sin((1 - t) * theta);
    const s2 = Math.sin(t * theta);
    const s3 = Math.sin(theta);
    
    p.addScaledVector(u1, s1 / s3).addScaledVector(u2, s2 / s3);
    points.push(p.multiplyScalar(radius));
  }
  
  const mid = new THREE.Vector3();
  const sHalf = Math.sin(0.5 * theta);
  mid.addScaledVector(u1, sHalf / Math.sin(theta)).addScaledVector(u2, sHalf / Math.sin(theta));
  mid.normalize().multiplyScalar(radius);

  return { points, mid, theta };
}

/**
 * Determines adjacent bond-pairs and draws their line arcs. Spawns HTML overlay labels.
 */
function buildBondAngles(state) {
  bondAngleLines.forEach(line => {
    moleculeGroup.remove(line);
    disposeNode(line);
  });
  bondAngleLines = [];

  const overlayContainer = document.getElementById('bond-angles-overlay-container');
  overlayContainer.innerHTML = '';
  angleLabels = [];

  if (!state.settings.showBondAngles) return;

  const bonds = activeDomains.filter(dom => dom.type === 'bond');
  if (bonds.length < 2) return;

  // Retrieve angle string
  let angleString = '';
  const bondedCount = state.domains.bonds.length;
  const lonePairsCount = state.domains.lonePairs;
  const geomKey = `${bondedCount}_${lonePairsCount}`;
  const geometryInfo = window.VSEPR_GEOMETRIES[geomKey];

  if (geometryInfo) {
    // Resolve dynamically for the active language
    const val = geometryInfo.realAngleOverride || geometryInfo.idealAngle;
    angleString = val;
  }

  const drawnPairs = [];
  const threshold = 140 * Math.PI / 180;

  for (let i = 0; i < bonds.length; i++) {
    for (let j = i + 1; j < bonds.length; j++) {
      const v1 = bonds[i].currentDir.clone();
      const v2 = bonds[j].currentDir.clone();
      
      const dot = v1.clone().normalize().dot(v2.clone().normalize());
      const angleRad = Math.acos(Math.max(-1, Math.min(1, dot)));

      if (bonds.length === 2 || angleRad < threshold) {
        drawnPairs.push({ idx1: i, idx2: j, angle: angleRad, v1, v2 });
      }
    }
  }

  drawnPairs.sort((a, b) => a.angle - b.angle);
  const finalPairs = drawnPairs.slice(0, Math.min(drawnPairs.length, 4));

  // AX2 Linear special case override (180°)
  if (bondedCount === 2 && lonePairsCount === 0 && finalPairs.length === 0) {
    const v1 = bonds[0].currentDir;
    const v2 = bonds[1].currentDir;
    finalPairs.push({ idx1: 0, idx2: 1, angle: Math.PI, v1, v2 });
  }

  finalPairs.forEach(pair => {
    const arcRadius = 0.65;
    const { points, mid, theta } = createArcPoints(pair.v1, pair.v2, arcRadius, 20);

    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: 0x8B5CF6,
      linewidth: 2.5
    });
    
    const line = new THREE.Line(geom, mat);
    moleculeGroup.add(line);
    bondAngleLines.push(line);

    // HTML annotation label
    const div = document.createElement('div');
    div.className = 'bond-angle-label';
    
    // Resolve angle strings
    let displayAngle = angleString;
    if (bondedCount === 5 && lonePairsCount === 0) {
      const angleDeg = Math.round(theta * 180 / Math.PI);
      if (Math.abs(angleDeg - 120) < 5) displayAngle = '120°';
      else if (Math.abs(angleDeg - 90) < 5) displayAngle = '90°';
    }
    if (bondedCount === 7 && lonePairsCount === 0) {
      const angleDeg = Math.round(theta * 180 / Math.PI);
      if (Math.abs(angleDeg - 72) < 5) displayAngle = '72°';
      else if (Math.abs(angleDeg - 90) < 5) displayAngle = '90°';
    }

    div.textContent = displayAngle;
    overlayContainer.appendChild(div);

    angleLabels.push({
      element: div,
      pos3d: mid.clone()
    });
  });
}

/**
 * Projects 3D mid-points of bond arcs to 2D screen coordinates and updates their style positions
 */
function projectAngleLabels() {
  if (angleLabels.length === 0 || !mainCamera || !mainCanvasWrapper) return;

  const width = mainCanvasWrapper.clientWidth;
  const height = mainCanvasWrapper.clientHeight;

  angleLabels.forEach(label => {
    const worldPos = label.pos3d.clone();
    worldPos.applyMatrix4(moleculeGroup.matrixWorld);

    worldPos.project(mainCamera);

    if (worldPos.z > 1) {
      label.element.style.opacity = 0;
      return;
    }

    const x = (worldPos.x * .5 + .5) * width;
    const y = (-(worldPos.y * .5) + .5) * height;

    label.element.style.opacity = 1;
    label.element.style.left = `${x}px`;
    label.element.style.top = `${y}px`;
  });
}

// Global highlight animation tracking (Task 2)
let activeHighlightTweens = [];
let activeHighlightedMaterials = [];

/**
 * Highlights/glows specific domain meshes (bonds or lone pairs) in the 3D scene using GSAP.
 */
function triggerDomainHighlight(type) {
  // 1. Kill existing tweens and reset materials to prevent overlay stacking
  activeHighlightTweens.forEach(t => t.kill());
  activeHighlightTweens = [];
  
  activeHighlightedMaterials.forEach(mat => {
    if (mat) {
      mat.emissive.setHex(0x000000);
      mat.emissiveIntensity = 0.0;
    }
  });
  activeHighlightedMaterials = [];

  // 2. Locate target meshes based on domain type
  const targets = [];
  activeDomains.forEach(dom => {
    if (type === 'bond' && dom.type === 'bond') {
      dom.mesh.traverse(child => {
        // Find outer atom sphere tip to glow
        if (child.isMesh && child.name === 'atom_sphere') {
          targets.push(child);
        }
      });
    } else if (type === 'lone_pair' && dom.type === 'lone_pair') {
      dom.mesh.traverse(child => {
        // Highlight both the balloon lobe and internal electrons inside the lone pair group
        if (child.isMesh) {
          targets.push(child);
        }
      });
    }
  });

  // 3. Animate emissive intensity using GSAP with yoyo/repeat
  const glowColor = type === 'bond' ? 0x00d2ff : 0xffcc00; // Neon blue for bonds, neon yellow for lone pairs
  targets.forEach(mesh => {
    const mat = mesh.material;
    if (mat) {
      activeHighlightedMaterials.push(mat);
      
      mat.emissive.setHex(glowColor);
      mat.emissiveIntensity = 0.0;
      
      const tween = gsap.to(mat, {
        emissiveIntensity: 2.0,
        duration: 0.25,
        yoyo: true,
        repeat: 3,
        ease: 'power1.inOut',
        onComplete: () => {
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0.0;
        }
      });
      activeHighlightTweens.push(tween);
    }
  });
}

// Export functions to window
window.init3D = init3D;
window.clear3DScene = clear3DScene;
window.renderMoleculeScene = renderMoleculeScene;
window.setLonePairsVisibility = setLonePairsVisibility;
window.buildBondAngles = buildBondAngles;
window.resizeMainCanvas = resizeMainCanvas;
window.triggerDomainHighlight = triggerDomainHighlight;

// ==========================================================================
// Interactive Geometry Modal Context (Modal 3D Viewer - Context Isolation)
// ==========================================================================

let modalScene, modalCamera, modalRenderer, modalControls, modalMoleculeGroup, modalCanvas;
let modalAnimationId = null;

function onModalWindowResize() {
  if (!modalCanvas || !modalCamera || !modalRenderer) return;
  const parent = modalCanvas.parentElement;
  if (!parent) return;
  const width = parent.clientWidth;
  const height = parent.clientHeight;
  modalCamera.aspect = width / height;
  modalCamera.updateProjectionMatrix();
  modalRenderer.setSize(width, height);
}

function initModal3D(canvas, shapeKey, colorHex) {
  // 1. Re-verify clean previous disposal
  disposeModal3D();

  modalCanvas = canvas;
  window.addEventListener('resize', onModalWindowResize);

  // 2. Parse bonds & lone pairs count from key (e.g. '3_1')
  const parts = shapeKey.split('_');
  const bondedCount = parseInt(parts[0]) || 0;
  const lonePairsCount = parseInt(parts[1]) || 0;
  const totalDomains = bondedCount + lonePairsCount;

  // 3. Create modal context
  modalScene = new THREE.Scene();

  // Create Camera
  modalCamera = new THREE.PerspectiveCamera(
    38,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    100
  );
  modalCamera.position.set(0, 1.8, 5.2);

  // Create Renderer
  try {
    modalRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    modalRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    modalRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
    modalRenderer.shadowMap.enabled = true;
  } catch (e) {
    console.error("Modal WebGL initialization failed:", e);
    return;
  }

  // Lights
  const ambient = new THREE.AmbientLight(0xFFFFFF, 0.7);
  modalScene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
  dirLight.position.set(2, 6, 3);
  dirLight.castShadow = true;
  modalScene.add(dirLight);

  const specLight = new THREE.PointLight(0xFFFFFF, 0.5, 10);
  specLight.position.set(-2, 3, 2);
  modalScene.add(specLight);

  // Controls
  modalControls = new THREE.OrbitControls(modalCamera, canvas);
  modalControls.enableDamping = true;
  modalControls.dampingFactor = 0.05;
  modalControls.minDistance = 2.5;
  modalControls.maxDistance = 8;
  modalControls.enablePan = false;

  // Molecule group
  modalMoleculeGroup = new THREE.Group();
  modalScene.add(modalMoleculeGroup);

  // Re-build central atom
  const centralGeom = new THREE.SphereGeometry(CENTRAL_RADIUS, 32, 32);
  const centralMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(window.CPK_COLORS['Default']),
    roughness: 0.3,
    metalness: 0.1,
    shadowSide: THREE.DoubleSide
  });
  const centralAtom = new THREE.Mesh(centralGeom, centralMat);
  centralAtom.castShadow = true;
  modalMoleculeGroup.add(centralAtom);

  // Get direction vectors
  const targets = distributeDomains(
    Array.from({ length: bondedCount }, () => ({ type: 'single' })),
    lonePairsCount,
    totalDomains
  );

  targets.forEach(target => {
    const domGroup = new THREE.Group();
    modalMoleculeGroup.add(domGroup);

    // Orient group along target vector
    domGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), target.targetDir.clone().normalize());

    if (target.type === 'bond') {
      // Cylinder bond
      const cylinderGeom = new THREE.CylinderGeometry(0.055, 0.055, BOND_LENGTH, 16);
      cylinderGeom.translate(0, BOND_LENGTH / 2, 0);
      const cylinderMat = new THREE.MeshStandardMaterial({
        color: 0xE2E8F0,
        roughness: 0.5,
        metalness: 0.1
      });
      const cylinder = new THREE.Mesh(cylinderGeom, cylinderMat);
      cylinder.castShadow = true;
      domGroup.add(cylinder);

      // Outer atom
      const sphereGeom = new THREE.SphereGeometry(OUTER_RADIUS, 32, 32);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex || window.CPK_COLORS['Generic']),
        roughness: 0.3,
        metalness: 0.1
      });
      const sphere = new THREE.Mesh(sphereGeom, sphereMat);
      sphere.position.set(0, BOND_LENGTH, 0);
      sphere.castShadow = true;
      domGroup.add(sphere);
    } else {
      // Lone pair lobe
      const lobe = createLocalLonePairLobe();
      domGroup.add(lobe);
    }
  });

  // Start Animation Loop for Modal
  function animateModal() {
    if (!modalScene) return; // Closed
    modalAnimationId = requestAnimationFrame(animateModal);

    if (modalControls) modalControls.update();
    if (modalMoleculeGroup) {
      modalMoleculeGroup.rotation.y += 0.003; // Rotate slowly
    }

    if (modalRenderer && modalScene && modalCamera) {
      modalRenderer.render(modalScene, modalCamera);
    }
  }

  animateModal();
}

function disposeModal3D() {
  // Cancel resize listener
  window.removeEventListener('resize', onModalWindowResize);

  // Cancel animation frame loop
  if (modalAnimationId !== null) {
    cancelAnimationFrame(modalAnimationId);
    modalAnimationId = null;
  }

  if (modalControls) {
    modalControls.dispose();
    modalControls = null;
  }

  if (modalMoleculeGroup) {
    modalMoleculeGroup.traverse(child => {
      if (child.isMesh) {
        disposeNode(child);
      }
    });
    modalMoleculeGroup = null;
  }

  if (modalScene) {
    modalScene.traverse(child => {
      if (child.isMesh || child.isLight) {
        disposeNode(child);
      }
    });
    modalScene = null;
  }

  if (modalRenderer) {
    modalRenderer.dispose();
    modalRenderer = null;
  }

  modalCamera = null;
  modalCanvas = null;
}

function forceStopTransitions() {
  gsap.killTweensOf(moleculeGroup);
  if (activeDomains) {
    activeDomains.forEach(dom => {
      if (dom.mesh) gsap.killTweensOf(dom.mesh);
    });
  }
  isTransitioning = false;
  window.setIsAnimatingState(false);
}

window.initModal3D = initModal3D;
window.disposeModal3D = disposeModal3D;
window.forceStopTransitions = forceStopTransitions;
window.addLonePair = addLonePair;
