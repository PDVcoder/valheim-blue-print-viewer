/**
 * Valheim 3D Blueprint Viewer
 * Manages Three.js scene, camera, high-brightness lighting, OrbitControls,
 * instanced rendering, camera presets, exploded view, and Lego step states.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ModelLoader } from './model-loader.js';
import { getPieceInfo } from './catalog.js';

export class BlueprintViewer3D {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.modelLoader = new ModelLoader();

    this.useTextures = true;
    this.showWireframe = false;
    this.showGrid = true;
    this.explodeFactor = 0.0;

    this.blueprintData = null;
    this.instancedGroups = []; // Array of { prefab, mesh, instances: [...] }
    this.pieceIndexMap = new Map();
    this.calibrationMap = new Map();

    this.lastTime = performance.now();
    this.frameCount = 0;
    this.fps = 60;

    this.initScene();
    this.initLights();
    this.initGrid();
    this.setupEvents();
    this.animate();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x181e28); // Vibrant Nordic blue-slate

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.2, 3000);
    this.camera.position.set(30, 25, 35);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.LinearToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.15;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 1200;
    this.controls.target.set(0, 5, 0);

    this.assemblyGroup = new THREE.Group();
    this.scene.add(this.assemblyGroup);
  }

  initLights() {
    // 1. Ambient lighting for bright visibility from all directions
    const ambient = new THREE.AmbientLight(0xffffff, 2.2);
    this.scene.add(ambient);

    // 2. Hemisphere sky & ground bounce
    const hemiLight = new THREE.HemisphereLight(0xf5f8ff, 0x6e6050, 1.8);
    hemiLight.position.set(0, 80, 0);
    this.scene.add(hemiLight);

    // 3. Primary directional sun (Golden ray) with normal bias to prevent self-shadow acne
    this.dirLight = new THREE.DirectionalLight(0xfffaee, 2.2);
    this.dirLight.position.set(55, 85, 45);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 5;
    this.dirLight.shadow.camera.far = 350;
    this.dirLight.shadow.camera.left = -70;
    this.dirLight.shadow.camera.right = 70;
    this.dirLight.shadow.camera.top = 70;
    this.dirLight.shadow.camera.bottom = -70;
    this.dirLight.shadow.bias = -0.00005;
    this.dirLight.shadow.normalBias = 0.05;
    this.scene.add(this.dirLight);

    // 4. Fill light from front-left
    const fillLight1 = new THREE.DirectionalLight(0xb5d0ff, 1.6);
    fillLight1.position.set(-50, 45, -35);
    this.scene.add(fillLight1);

    // 5. Fill light from rear-right
    const fillLight2 = new THREE.DirectionalLight(0xffe8c7, 1.4);
    fillLight2.position.set(30, 20, -50);
    this.scene.add(fillLight2);

    // 6. Upward ground fill light to eliminate dark undersides
    const groundFill = new THREE.DirectionalLight(0xffffff, 1.2);
    groundFill.position.set(0, -30, 0);
    this.scene.add(groundFill);
  }

  initGrid() {
    this.gridHelper = new THREE.GridHelper(120, 120, 0x5a8cc2, 0x273445);
    this.gridHelper.position.y = -0.05;
    this.scene.add(this.gridHelper);
  }

  setupEvents() {
    window.addEventListener('resize', () => this.onResize());
  }

  onResize() {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Load and render parsed blueprint data
   */
  async loadBlueprint(blueprintData) {
    this.blueprintData = blueprintData;
    this.clearAssembly();

    if (!blueprintData || !blueprintData.pieces.length) return;

    // Ensure all Valheim textures are completely preloaded
    await this.modelLoader.preloadTextures();

    const bounds = blueprintData.bounds;
    this.gridHelper.position.y = bounds.min.y;

    // Group pieces by prefab
    const prefabGroups = new Map();
    for (const piece of blueprintData.pieces) {
      if (!prefabGroups.has(piece.prefab)) {
        prefabGroups.set(piece.prefab, []);
      }
      prefabGroups.get(piece.prefab).push(piece);
    }

    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    this.instancedGroups = [];
    this.pieceIndexMap.clear();

    for (const [prefab, pieces] of prefabGroups.entries()) {
      const pieceInfo = getPieceInfo(prefab);
      const count = pieces.length;

      let geometry = null;
      let material = null;
      let isGlb = false;
      let originalTexture = null;
      let solidColor = pieceInfo.proxy?.color ? new THREE.Color(pieceInfo.proxy.color) : new THREE.Color('#bf8652');

      const glbModel = await this.modelLoader.loadGlbModel(prefab);
      if (glbModel) {
        geometry = glbModel.geometry.clone();
        material = glbModel.material.clone();
        originalTexture = glbModel.originalTexture;
        if (glbModel.solidColor) solidColor = glbModel.solidColor;
        isGlb = true;
      }

      if (!geometry) {
        geometry = this.modelLoader.getProceduralGeometry(pieceInfo.proxy);
        material = this.modelLoader.createMaterial(pieceInfo, this.showWireframe);
        originalTexture = material.map || null;
      }

      // Configure initial texture state
      if (!this.useTextures) {
        material.map = null;
        material.color.copy(solidColor);
      } else {
        material.map = originalTexture;
        material.color.set(0xffffff);
      }
      material.wireframe = this.showWireframe;

      const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
      instancedMesh.castShadow = true;
      instancedMesh.receiveShadow = true;
      instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

      const instanceRecords = [];
        const defaultColor = this.modelLoader.COLOR_DEFAULT; // 0xffffff allows full texture brightness
      const calib = this.calibrationMap?.get(prefab);
      const qCalib = calib ? new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
          (calib.x || 0) * Math.PI / 180,
          (calib.y || 0) * Math.PI / 180,
          (calib.z || 0) * Math.PI / 180,
          'YXZ'
        )
      ) : null;

      pieces.forEach((piece, idx) => {
        position.set(piece.pos.x, piece.pos.y, piece.pos.z);
        quaternion.set(piece.rot.x, piece.rot.y, piece.rot.z, piece.rot.w);
        scale.set(piece.scale.x, piece.scale.y, piece.scale.z);

        const rawRot = quaternion.clone();
        if (qCalib) {
          quaternion.multiply(qCalib);
        }

        matrix.compose(position, quaternion, scale);
        instancedMesh.setMatrixAt(idx, matrix);
        instancedMesh.setColorAt(idx, defaultColor);

        instanceRecords.push({
          piece,
          origMatrix: matrix.clone(),
          origPos: position.clone(),
          origRot: rawRot,
          calibRot: quaternion.clone(),
          origScale: scale.clone(),
          defaultColor: defaultColor.clone(),
          currentColor: defaultColor.clone()
        });

        this.pieceIndexMap.set(piece.id, {
          groupIndex: this.instancedGroups.length,
          instanceIndex: idx
        });
      });

      instancedMesh.instanceMatrix.needsUpdate = true;
      if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;

      this.assemblyGroup.add(instancedMesh);

      this.instancedGroups.push({
        prefab,
        pieceInfo,
        mesh: instancedMesh,
        instances: instanceRecords,
        isGlb,
        originalTexture,
        solidColor
      });
    }

    this.focusAll();
  }

  clearAssembly() {
    while (this.assemblyGroup.children.length > 0) {
      const obj = this.assemblyGroup.children[0];
      this.assemblyGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    }
    this.instancedGroups = [];
    this.pieceIndexMap.clear();
  }

  /**
   * Toggle texture rendering on/off across all 3D instances
   */
  setTexturesEnabled(enabled) {
    this.useTextures = !!enabled;
    for (const group of this.instancedGroups) {
      const mat = group.mesh?.material;
      if (!mat) continue;
      if (this.useTextures) {
        mat.map = group.originalTexture || null;
        mat.color.set(0xffffff);
      } else {
        mat.map = null;
        if (group.solidColor) {
          mat.color.copy(group.solidColor);
        }
      }
      mat.needsUpdate = true;
    }
  }

  /**
   * Update Lego Step visibility and highlighting states
   */
  updateLegoStep(stepInfo) {
    if (!this.instancedGroups.length) return;

    const { current, total, step, displayMode, showAll, pieceStepMap } = stepInfo;
    const currentStepIdx = (current || 1) - 1;

    const zeroScale = new THREE.Vector3(0, 0, 0);
    const tempMatrix = new THREE.Matrix4();
    const tempPos = new THREE.Vector3();

    const defaultColor = this.modelLoader.COLOR_DEFAULT;
    const highlightColor = this.modelLoader.COLOR_HIGHLIGHT;
    const ghostColor = this.modelLoader.COLOR_GHOST;
    const yBaseline = this.blueprintData ? this.blueprintData.bounds.min.y : 0;

    for (const group of this.instancedGroups) {
      const mesh = group.mesh;
      let matrixNeedsUpdate = false;
      let colorNeedsUpdate = false;

      group.instances.forEach((inst, idx) => {
        const piece = inst.piece;
        const stepIdx = pieceStepMap ? pieceStepMap.get(piece.id) : 0;
        const activeRot = inst.calibRot || inst.origRot;

        tempPos.copy(inst.origPos);
        if (this.explodeFactor > 0) {
          const dy = Math.max(0, inst.origPos.y - yBaseline);
          tempPos.y += dy * this.explodeFactor * 1.5;
        }

        // Full Structure View (Show All)
        if (showAll) {
          tempMatrix.compose(tempPos, activeRot, inst.origScale);
          mesh.setMatrixAt(idx, tempMatrix);
          mesh.setColorAt(idx, defaultColor);
          matrixNeedsUpdate = true;
          colorNeedsUpdate = true;
          return;
        }

        // Step-by-Step Mode
        if (stepIdx === currentStepIdx) {
          tempMatrix.compose(tempPos, activeRot, inst.origScale);
          mesh.setMatrixAt(idx, tempMatrix);
          mesh.setColorAt(idx, highlightColor);
          matrixNeedsUpdate = true;
          colorNeedsUpdate = true;
        } else if (stepIdx < currentStepIdx) {
          if (displayMode === 'isolate') {
            tempMatrix.compose(tempPos, activeRot, zeroScale);
            mesh.setMatrixAt(idx, tempMatrix);
          } else if (displayMode === 'ghost') {
            tempMatrix.compose(tempPos, activeRot, inst.origScale);
            mesh.setMatrixAt(idx, tempMatrix);
            mesh.setColorAt(idx, ghostColor);
            colorNeedsUpdate = true;
          } else {
            tempMatrix.compose(tempPos, activeRot, inst.origScale);
            mesh.setMatrixAt(idx, tempMatrix);
            mesh.setColorAt(idx, defaultColor);
            colorNeedsUpdate = true;
          }
          matrixNeedsUpdate = true;
        } else {
          tempMatrix.compose(tempPos, activeRot, zeroScale);
          mesh.setMatrixAt(idx, tempMatrix);
          matrixNeedsUpdate = true;
        }
      });

      if (matrixNeedsUpdate) mesh.instanceMatrix.needsUpdate = true;
      if (colorNeedsUpdate && mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  }

  /**
   * Set vertical Exploded View factor (0.0 to 2.0)
   */
  setExplodeFactor(factor) {
    this.explodeFactor = Math.max(0, factor);
    const yBaseline = this.blueprintData ? this.blueprintData.bounds.min.y : 0;
    const tempMatrix = new THREE.Matrix4();
    const tempPos = new THREE.Vector3();
    const currentScale = new THREE.Vector3();

    for (const group of this.instancedGroups) {
      group.instances.forEach((inst, idx) => {
        tempPos.copy(inst.origPos);
        const dy = Math.max(0, inst.origPos.y - yBaseline);
        tempPos.y += dy * this.explodeFactor * 1.5;

        group.mesh.getMatrixAt(idx, tempMatrix);
        tempMatrix.decompose(new THREE.Vector3(), new THREE.Quaternion(), currentScale);

        const activeRot = inst.calibRot || inst.origRot;
        tempMatrix.compose(tempPos, activeRot, currentScale);
        group.mesh.setMatrixAt(idx, tempMatrix);
      });
      group.mesh.instanceMatrix.needsUpdate = true;
    }
  }

  /**
   * Focus camera onto structure bounding box with smooth framing
   */
  focusAll() {
    if (!this.blueprintData) return;

    const bounds = this.blueprintData.bounds;
    const center = new THREE.Vector3(bounds.center.x, bounds.center.y, bounds.center.z);
    const maxDim = Math.max(bounds.size.x, bounds.size.y, bounds.size.z, 10);

    const fov = this.camera.fov * (Math.PI / 180);
    let cameraDist = Math.abs(maxDim / Math.sin(fov / 2)) * 0.75;
    cameraDist = Math.max(cameraDist, 12);

    const offset = new THREE.Vector3(cameraDist * 0.7, cameraDist * 0.5, cameraDist * 0.75);
    this.camera.position.copy(center).add(offset);
    this.camera.lookAt(center);

    this.controls.target.copy(center);
    this.controls.update();
  }

  /**
   * Focus camera smoothly onto a specific Lego step bounding box
   */
  focusStep(step) {
    if (!step || !step.bounds) return;
    const { center: c, size: s } = step.bounds;
    const center = new THREE.Vector3(c.x, c.y, c.z);
    const maxDim = Math.max(s.x, s.y, s.z, 6);

    const fov = this.camera.fov * (Math.PI / 180);
    let cameraDist = Math.abs(maxDim / Math.sin(fov / 2)) * 0.85;
    cameraDist = Math.max(cameraDist, 8);

    const offset = new THREE.Vector3(cameraDist * 0.7, cameraDist * 0.5, cameraDist * 0.75);
    this.camera.position.copy(center).add(offset);
    this.camera.lookAt(center);

    this.controls.target.copy(center);
    this.controls.update();
  }

  /**
   * Camera view presets
   */
  setCameraPreset(preset) {
    if (!this.blueprintData) return;
    const center = new THREE.Vector3(
      this.blueprintData.bounds.center.x,
      this.blueprintData.bounds.center.y,
      this.blueprintData.bounds.center.z
    );
    const maxDim = Math.max(
      this.blueprintData.bounds.size.x,
      this.blueprintData.bounds.size.y,
      this.blueprintData.bounds.size.z,
      12
    );
    const dist = maxDim * 1.35;

    switch (preset) {
      case 'top':
        this.camera.position.set(center.x, center.y + dist, center.z + 0.001);
        break;
      case 'front':
        this.camera.position.set(center.x, center.y, center.z + dist);
        break;
      case 'side':
        this.camera.position.set(center.x + dist, center.y, center.z);
        break;
      case 'iso':
        this.camera.position.set(center.x + dist * 0.7, center.y + dist * 0.7, center.z + dist * 0.7);
        break;
      case 'perspective':
      default:
        this.focusAll();
        return;
    }

    this.controls.target.copy(center);
    this.camera.lookAt(center);
    this.controls.update();
  }

  toggleWireframe(show) {
    this.showWireframe = show;
    for (const g of this.instancedGroups) {
      if (g.mesh.material) {
        g.mesh.material.wireframe = show;
      }
    }
  }

  toggleGrid(show) {
    this.showGrid = show;
    this.gridHelper.visible = show;
  }

  highlightPrefab(prefabName) {
    const highlight = this.modelLoader.COLOR_HIGHLIGHT;
    for (const g of this.instancedGroups) {
      const isMatch = g.prefab === prefabName;
      g.instances.forEach((inst, idx) => {
        g.mesh.setColorAt(idx, isMatch ? highlight : inst.defaultColor);
      });
      if (g.mesh.instanceColor) g.mesh.instanceColor.needsUpdate = true;
    }
  }

  resetHighlights() {
    for (const g of this.instancedGroups) {
      g.instances.forEach((inst, idx) => {
        g.mesh.setColorAt(idx, inst.defaultColor);
      });
      if (g.mesh.instanceColor) g.mesh.instanceColor.needsUpdate = true;
    }
  }

  getMetrics() {
    return {
      fps: this.fps,
      drawCalls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles,
      pieces: this.blueprintData ? this.blueprintData.pieces.length : 0
    };
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.controls.update();
    this.renderer.render(this.scene, this.camera);

    this.frameCount++;
    const now = performance.now();
    if (now - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
      this.frameCount = 0;
      this.lastTime = now;
    }
  }

  /**
   * Set calibration map and update scene if blueprint is already loaded
   */
  setCalibrationMap(map) {
    this.calibrationMap = map;
    for (const [prefab, calib] of map.entries()) {
      this.updatePrefabRotation(prefab, calib);
    }
  }

  /**
   * Real-time interactive rotation of all pieces of a prefab type
   */
  updatePrefabRotation(prefab, calib) {
    if (!this.calibrationMap) this.calibrationMap = new Map();
    this.calibrationMap.set(prefab, calib);

    const group = this.instancedGroups.find(g => g.prefab === prefab);
    if (!group || !group.instances || group.instances.length === 0) return;

    const euler = new THREE.Euler(
      (calib.x || 0) * Math.PI / 180,
      (calib.y || 0) * Math.PI / 180,
      (calib.z || 0) * Math.PI / 180,
      'YXZ'
    );
    const qCalib = new THREE.Quaternion().setFromEuler(euler);
    const matrix = new THREE.Matrix4();
    const curPos = new THREE.Vector3();
    const curRot = new THREE.Quaternion();
    const curScale = new THREE.Vector3();

    group.instances.forEach((inst, idx) => {
      inst.calibRot = inst.origRot.clone().multiply(qCalib);

      // Preserve current matrix scale and position (vital during Lego step filtering or explode view)
      group.mesh.getMatrixAt(idx, matrix);
      matrix.decompose(curPos, curRot, curScale);

      matrix.compose(curPos, inst.calibRot, curScale);
      group.mesh.setMatrixAt(idx, matrix);
    });

    group.mesh.instanceMatrix.needsUpdate = true;
  }

  /**
   * Screen space raycast to identify piece under pointer
   */
  raycastPiece(clientX, clientY) {
    if (!this.instancedGroups || this.instancedGroups.length === 0) return null;

    const rect = this.renderer.domElement.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);

    const meshes = this.instancedGroups.map(g => g.mesh).filter(Boolean);
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const group = this.instancedGroups.find(g => g.mesh === hit.object);
      if (group) {
        return {
          prefab: group.prefab,
          pieceInfo: group.pieceInfo,
          instanceId: hit.instanceId,
          count: group.instances.length
        };
      }
    }
    return null;
  }
}
