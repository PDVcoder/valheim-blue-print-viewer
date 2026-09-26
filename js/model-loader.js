/**
 * Valheim Model Loader & Hybrid Instanced Mesh Manager
 * Manages procedural geometric proxies (Mode 1: CAD) and authentic extracted glTF/GLB models (Mode 2: In-Game)
 * with authentic Valheim PBR textures, high-performance instancing, and fallback handling.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { getPieceInfo } from './catalog.js';

export class ModelLoader {
  constructor() {
    this.gltfLoader = new GLTFLoader();
    this.textureLoader = new THREE.TextureLoader();
    this.geometryCache = new Map();
    this.textureCache = new Map();
    this.materialCache = new Map();
    this.glbCache = new Map();
    this.glbAvailability = new Map();

    this.texturesLoaded = false;

    // Color definitions
    this.COLOR_DEFAULT = new THREE.Color(0xffffff);  // White multiplier allows textures and CAD colors full brightness
    this.COLOR_HIGHLIGHT = new THREE.Color(0xffd700); // Bright Lego gold highlight
    this.COLOR_GHOST = new THREE.Color(0x8eaac7);     // Crisp, readable blueprint slate (avoids dark/black silhouettes)

    this.preloadTextures();
  }

  /**
   * Preload all authentic Valheim textures asynchronously
   */
  async preloadTextures() {
    if (this.texturesLoaded) return;
    const texFiles = {
      wood_planks: 'assets/textures/wood_planks.png',
      wood_wall: 'assets/textures/wood_wall.png',
      roof_thatch: 'assets/textures/roof_thatch.png',
      roof_wood: 'assets/textures/roof_wood.png',
      stone_wall: 'assets/textures/stone_wall.png',
      stone_floor: 'assets/textures/stone_floor.png',
      stone_block: 'assets/textures/stone_block.png',
      core_wood: 'assets/textures/core_wood.png',
      darkwood: 'assets/textures/darkwood_beam.png',
      iron: 'assets/textures/iron_beam.png',
      chest: 'assets/textures/wood_chest.png'
    };

    const promises = Object.entries(texFiles).map(([key, path]) => {
      return new Promise((resolve) => {
        this.textureLoader.load(
          path,
          (tex) => {
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.generateMipmaps = true;
            tex.minFilter = THREE.LinearMipmapLinearFilter;
            tex.magFilter = THREE.LinearFilter;
            this.textureCache.set(key, tex);
            resolve(tex);
          },
          undefined,
          (err) => {
            console.warn(`Texture ${key} load warning:`, err);
            resolve(null);
          }
        );
      });
    });

    await Promise.all(promises);
    this.texturesLoaded = true;
  }

  getTextureForPiece(prefabName, category) {
    const low = (prefabName || '').toLowerCase();
    if (low.includes('thatch') || low.includes('straw')) {
      return this.textureCache.get('roof_thatch') || this.textureCache.get('roof_wood');
    }
    if (low.includes('roof')) {
      return this.textureCache.get('roof_wood') || this.textureCache.get('roof_thatch');
    }
    if (low.includes('chest')) return this.textureCache.get('chest');
    if (category === 'stone' || low.includes('stone') || low.includes('rock') || low.includes('brick')) {
      if (low.includes('floor') || low.includes('stair')) {
        return this.textureCache.get('stone_floor');
      }
      return this.textureCache.get('stone_wall') || this.textureCache.get('stone_block');
    }
    if (category === 'corewood' || low.includes('log') || low.includes('pole')) {
      return this.textureCache.get('core_wood');
    }
    if (category === 'darkwood' || low.includes('darkwood') || low.includes('tar') || low.includes('stave')) {
      return this.textureCache.get('darkwood');
    }
    if (category === 'iron' || low.includes('iron') || low.includes('metal')) {
      return this.textureCache.get('iron');
    }
    if (low.includes('wall') || low.includes('gate') || low.includes('door') || low.includes('window') || low.includes('fence')) {
      return this.textureCache.get('wood_wall');
    }
    return this.textureCache.get('wood_planks');
  }

  createMaterial(pieceInfo, wireframe = false) {
    const tex = this.getTextureForPiece(pieceInfo.rawPrefab || pieceInfo.name?.en || '', pieceInfo.category);
    const isIron = pieceInfo.category === 'iron';
    const isStone = pieceInfo.category === 'stone';
    const solidColor = new THREE.Color(pieceInfo.proxy?.color || '#bf8652');

    const mat = new THREE.MeshStandardMaterial({
      map: tex || null,
      color: new THREE.Color(0xffffff), // Clean white allows texture to shine at 100% natural brightness
      roughness: isStone ? 0.75 : (isIron ? 0.35 : 0.6),
      metalness: isIron ? 0.45 : 0.02,
      wireframe,
      side: THREE.DoubleSide
    });
    return mat;
  }

  /**
   * Resolve prefab name to extracted GLB filename with modded piece aliasing
   */
  resolveModelPrefab(prefabName) {
    const aliases = {
      // Modded & variant walls -> standard woodwall
      'rae_woodwall_3': 'woodwall',
      'rae_woodwall_2': 'woodwall',
      'rae_woodwall_1': 'woodwall',
      'wooden_window_big': 'woodwall',
      'wooden_window_small': 'wood_wall_half',
      'wooden_fence_2': 'wood_wall_half',
      'stone_window_big': 'Piece_grausten_window_4x2',
      // Modded & variant stone masonry
      'rae_brickstone_wall_2x1': 'stone_wall_2x1',
      'rae_brickstone_wall_1x1': 'stone_wall_1x1',
      'stonewall_hardrock_2x1': 'stone_wall_2x1',
      'stonewall_hardrock_pillar': 'stone_pillar',
      // Modded floors & stairs
      'IG_Chevron_Floor': 'wood_floor',
      'stone_floor_1_new': 'stone_floor_2x2',
      'ig_tall_stairs': 'wood_stair',
      // Modded variants
      'wood_wall_roof_67_a': 'wood_wall_roof_a',
      'wood_dragon1': 'wood_roof_top',
      // Beams and logs
      'wood_beam_log': 'wood_pole_log',
      'wood_beam_log_4': 'wood_pole_log',
      'wood_pole_log_4': 'wood_pole_log',
      'rae_WoodPoleBig_4m': 'wood_pole_log',
      // Rocks and landscape
      'Placeable_Stone': 'placeable_bigrock_02',
      'Pickable_Stone': 'placeable_bigrock_02',
      'Pickable_Flint': 'placeable_bigrock_02',
      'Rock_4': 'placeable_bigrock_02'
    };
    return aliases[prefabName] || prefabName;
  }

  /**
   * Create or retrieve procedural proxy geometry for CAD mode
   */
  getProceduralGeometry(proxyDef) {
    const key = JSON.stringify(proxyDef);
    if (this.geometryCache.has(key)) {
      return this.geometryCache.get(key);
    }

    let geom;
    const shape = proxyDef.shape || 'box';
    const size = proxyDef.size || [2, 1, 1];

    switch (shape) {
      case 'cylinder':
      case 'tree':
        geom = new THREE.CylinderGeometry(
          proxyDef.radius || 0.15,
          proxyDef.radius || 0.15,
          proxyDef.height || size[1] || 2,
          16
        );
        break;

      case 'beam':
        geom = new THREE.BoxGeometry(size[0] || 2, size[1] || 0.2, size[2] || 0.2);
        break;

      case 'beam_sloped': {
        const len = proxyDef.length || 2.24;
        geom = new THREE.BoxGeometry(len, 0.2, 0.2);
        const angleRad = ((proxyDef.angle || 45) * Math.PI) / 180;
        geom.rotateZ(angleRad / 2);
        break;
      }

      case 'roof26':
      case 'roof45':
      case 'roof67':
        geom = this.createRoofWedgeGeometry(shape, size);
        break;

      case 'ridge26':
      case 'ridge45':
        geom = this.createRidgeGeometry(shape, size);
        break;

      case 'cross':
        geom = this.createCrossGeometry(size);
        break;

      case 'stairs':
      case 'ladder':
        geom = this.createStairsGeometry(size);
        break;

      case 'rock':
        geom = new THREE.DodecahedronGeometry(proxyDef.radius || 0.6, 1);
        break;

      case 'box':
      default:
        geom = new THREE.BoxGeometry(size[0] || 2, size[1] || 1, size[2] || 1);
        break;
    }

    if (proxyDef.offset) {
      geom.translate(proxyDef.offset[0], proxyDef.offset[1], proxyDef.offset[2]);
    }

    geom.computeVertexNormals();
    this.geometryCache.set(key, geom);
    return geom;
  }

  createRoofWedgeGeometry(shape, size) {
    const w = size[0] || 2;
    const h = size[1] || (shape === 'roof26' ? 1.0 : (shape === 'roof67' ? 3.0 : 2.0));
    const d = size[2] || 2;

    const hw = w / 2;
    const hd = d / 2;

    const vertices = [];
    const normals = [];
    const uvs = [];

    // Uncalibrated base roof geometry:
    // Low eaves at Z = +hd, high ridge at Z = -hd, width along X [-hw, +hw]
    const pEaveL = [-hw, 0, hd],   pEaveR = [hw, 0, hd];
    const pRidgeL = [-hw, h, -hd], pRidgeR = [hw, h, -hd];
    const pBaseL = [-hw, 0, -hd],  pBaseR = [hw, 0, -hd];

    // Sloped roof surface (outward normal pointing UP and FORWARD)
    this.addQuad(vertices, normals, uvs, pEaveL, pEaveR, pRidgeR, pRidgeL);
    // Back vertical face under the ridge (normal pointing -Z)
    this.addQuad(vertices, normals, uvs, pRidgeR, pBaseR, pBaseL, pRidgeL);
    // Bottom horizontal base face (normal pointing -Y)
    this.addQuad(vertices, normals, uvs, pBaseR, pEaveR, pEaveL, pBaseL);
    // Left triangular gable (normal pointing -X)
    this.addTri(vertices, normals, uvs, pBaseL, pEaveL, pRidgeL);
    // Right triangular gable (normal pointing +X)
    this.addTri(vertices, normals, uvs, pEaveR, pBaseR, pRidgeR);

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    return geom;
  }

  createRidgeGeometry(shape, size) {
    const w = size[0] || 2;
    const h = size[1] || (shape === 'ridge26' ? 0.6 : 1.0);
    const d = size[2] || 2;

    const hw = w / 2;
    const hd = d / 2;

    const vertices = [];
    const normals = [];
    const uvs = [];

    // In Valheim, ridge peak runs along X at Z = 0, sloping down to Z = +hd and Z = -hd
    const pTopL = [-hw, h, 0],   pTopR = [hw, h, 0];
    const pFrontL = [-hw, 0, hd], pFrontR = [hw, 0, hd];
    const pBackL = [-hw, 0, -hd], pBackR = [hw, 0, -hd];

    // Front slope (+Z)
    this.addQuad(vertices, normals, uvs, pFrontL, pFrontR, pTopR, pTopL);
    // Back slope (-Z)
    this.addQuad(vertices, normals, uvs, pTopL, pTopR, pBackR, pBackL);
    // Bottom face (-Y)
    this.addQuad(vertices, normals, uvs, pBackL, pBackR, pFrontR, pFrontL);
    // Left triangular gable (-X)
    this.addTri(vertices, normals, uvs, pBackL, pFrontL, pTopL);
    // Right triangular gable (+X)
    this.addTri(vertices, normals, uvs, pFrontR, pBackR, pTopR);

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    return geom;
  }

  createCrossGeometry(size) {
    const w = size[0] || 2;
    const t = 0.2;
    const g1 = new THREE.BoxGeometry(w, t, t);
    g1.rotateZ(Math.PI / 4);
    return g1;
  }

  createStairsGeometry(size) {
    return new THREE.BoxGeometry(size[0] || 2, size[1] || 1, size[2] || 2);
  }

  addTri(vertices, normals, uvs, p0, p1, p2) {
    vertices.push(...p0, ...p1, ...p2);
    const vA = new THREE.Vector3(...p0);
    const vB = new THREE.Vector3(...p1);
    const vC = new THREE.Vector3(...p2);
    const cb = new THREE.Vector3().subVectors(vC, vB);
    const ab = new THREE.Vector3().subVectors(vA, vB);
    cb.cross(ab).normalize();
    normals.push(cb.x, cb.y, cb.z, cb.x, cb.y, cb.z, cb.x, cb.y, cb.z);
    uvs.push(0, 0, 1, 0, 0.5, 1);
  }

  addQuad(vertices, normals, uvs, p0, p1, p2, p3) {
    this.addTri(vertices, normals, uvs, p0, p1, p2);
    this.addTri(vertices, normals, uvs, p0, p2, p3);
  }

  /**
   * Check and load authentic extracted .glb model with offset normalization
   */
  async loadGlbModel(rawPrefabName) {
    const modelName = this.resolveModelPrefab(rawPrefabName);

    if (this.glbCache.has(modelName)) {
      return this.glbCache.get(modelName);
    }

    if (this.glbAvailability.get(modelName) === false) {
      return null;
    }

    const url = `assets/models/${modelName}.glb`;
    try {
      const gltf = await this.gltfLoader.loadAsync(url);
      let targetMesh = null;

      gltf.scene.traverse((child) => {
        if (!targetMesh && child.isMesh && child.geometry) {
          targetMesh = child;
        }
      });

      if (targetMesh) {
        const geom = targetMesh.geometry.clone();
        geom.computeBoundingBox();
        const center = new THREE.Vector3();
        geom.boundingBox.getCenter(center);

        if (center.length() > 3.0) {
          geom.translate(-center.x, -geom.boundingBox.min.y, -center.z);
        }

        geom.computeVertexNormals();

        const pieceInfo = getPieceInfo(rawPrefabName);
        const solidColor = new THREE.Color(pieceInfo.proxy?.color || '#bf8652');

        // Use authentic embedded texture and material from the GLB if present
        let mat = null;
        if (targetMesh.material) {
          mat = (Array.isArray(targetMesh.material) ? targetMesh.material[0] : targetMesh.material).clone();
          mat.side = THREE.DoubleSide;
          mat.color = new THREE.Color(0xffffff); // Full natural brightness
          if (mat.roughness !== undefined) mat.roughness = 0.65;
          if (mat.metalness !== undefined) mat.metalness = 0.05;
          if (mat.map) {
            mat.map.colorSpace = THREE.SRGBColorSpace;
            mat.map.wrapS = THREE.RepeatWrapping;
            mat.map.wrapT = THREE.RepeatWrapping;
            mat.map.minFilter = THREE.LinearMipmapLinearFilter;
            mat.map.magFilter = THREE.LinearFilter;
            mat.map.needsUpdate = true;
          }
        }
        
        if (!mat || !mat.map) {
          // Fallback to procedural catalog texture
          mat = this.createMaterial(pieceInfo);
        }

        const modelObj = {
          geometry: geom,
          material: mat,
          originalTexture: mat.map || null,
          solidColor: solidColor
        };

        this.glbCache.set(modelName, modelObj);
        this.glbAvailability.set(modelName, true);
        return modelObj;
      }
    } catch {
      this.glbAvailability.set(modelName, false);
    }
    return null;
  }

  /**
   * Determine if a piece is a roof slope/ridge piece requiring local 180° Y flip
   */
  isRoofSlab(name) {
    if (!name) return false;
    const lower = name.toLowerCase();
    // Exclude triangular gable walls (wood_wall_roof_45, etc.) whose slope is in X/Y
    if (lower.includes('wall')) return false;
    return lower.includes('roof') || lower.includes('shingle') || lower.includes('straw');
  }
}
