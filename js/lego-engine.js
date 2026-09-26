/**
 * Valheim Lego-Style Step-by-Step Construction Engine
 * Slices 3D blueprints into logical vertical layers and structural phases,
 * managing the step navigation state machine, piece mapping, and highlighting.
 */

import { getPieceInfo } from './catalog.js';
import { ResourceCalculator } from './resources.js';
import { t } from './i18n.js';

export class LegoEngine {
  constructor(options = {}) {
    this.layerHeight = options.layerHeight || 1.5; // meters per vertical layer
    this.currentStep = 0;
    this.totalSteps = 1;
    this.steps = [];
    this.pieceStepMap = new Map(); // pieceId -> stepIndex
    this.blueprintData = null;
    this.displayMode = 'solid'; // 'solid' | 'ghost' | 'isolate'
    this.showAll = true; // Default to full structure view on initial load
    this.isPlaying = false;
    this.playTimer = null;
    this.playSpeed = 1500; // ms per step
    this.onStepChangeCallbacks = [];
  }

  /**
   * Register listener for step changes
   */
  onStepChange(callback) {
    this.onStepChangeCallbacks.push(callback);
  }

  notifyStepChange() {
    const stepInfo = this.getCurrentStepInfo();
    for (const cb of this.onStepChangeCallbacks) {
      cb(stepInfo);
    }
  }

  /**
   * Build construction steps from parsed blueprint
   * @param {Object} blueprintData 
   */
  loadBlueprint(blueprintData) {
    this.blueprintData = blueprintData;
    this.stopPlayback();
    this.generateSteps();
    this.showAll = true; // Show complete building initially
    this.currentStep = 0;
    this.notifyStepChange();
  }

  /**
   * Set vertical slice layer thickness (e.g. 0.75m, 1.0m, 1.5m, 2.0m)
   */
  setLayerHeight(height) {
    if (height <= 0.2) height = 0.2;
    this.layerHeight = height;
    if (this.blueprintData) {
      this.generateSteps();
      if (this.currentStep >= this.steps.length) {
        this.currentStep = Math.max(0, this.steps.length - 1);
      }
      this.notifyStepChange();
    }
  }

  /**
   * Classify piece into structural priority within a layer
   */
  getStructuralOrder(prefab, category) {
    const lower = prefab.toLowerCase();
    if (lower.includes('rock') || lower.includes('boulder') || lower.includes('foundation')) return 0;
    if (lower.includes('pole') || lower.includes('pillar') || lower.includes('log')) return 1;
    if (lower.includes('beam')) return 2;
    if (lower.includes('floor')) return 3;
    if (lower.includes('wall') || lower.includes('door') || lower.includes('gate') || lower.includes('window') || lower.includes('fence')) return 4;
    if (lower.includes('stair') || lower.includes('ladder')) return 5;
    if (lower.includes('roof') || lower.includes('crest') || lower.includes('ridge')) return 6;
    if (category === 'furniture' || lower.includes('chest') || lower.includes('table') || lower.includes('bed')) return 7;
    if (category === 'crafting' || lower.includes('torch') || lower.includes('hearth') || lower.includes('smelter') || lower.includes('kiln')) return 8;

    return 4; // default
  }

  /**
   * Determine descriptive stage title key based on layer height and structural composition
   */
  getStageNameKey(layerIndex, totalLayers, pieces) {
    if (layerIndex === 0) return 'stageFoundation';
    if (layerIndex === 1) return 'stageGroundDeck';
    
    let roofCount = 0;
    let wallCount = 0;
    let furnitureCount = 0;

    for (const p of pieces) {
      const low = p.prefab.toLowerCase();
      if (low.includes('roof')) roofCount++;
      else if (low.includes('wall')) wallCount++;
      else if (p.category === 'furniture' || p.category === 'crafting') furnitureCount++;
    }

    if (roofCount > pieces.length * 0.4) {
      return layerIndex >= totalLayers - 2 ? 'stageGablesChimneys' : 'stageRoofing';
    }
    if (furnitureCount > pieces.length * 0.4) {
      return 'stageInteriorDecor';
    }
    if (layerIndex < totalLayers / 2) {
      return 'stageLowerWalls';
    } else if (layerIndex < totalLayers - 2) {
      return 'stageMidFloor';
    } else {
      return 'stageUpperWalls';
    }
  }

  /**
   * Partition blueprint pieces into sequential steps
   */
  generateSteps() {
    if (!this.blueprintData || !this.blueprintData.pieces.length) {
      this.steps = [];
      this.totalSteps = 0;
      this.pieceStepMap.clear();
      return;
    }

    const { pieces, bounds } = this.blueprintData;
    const yMin = bounds.min.y;
    const yMax = bounds.max.y;
    const heightSpan = Math.max(0.1, yMax - yMin);

    const layerCount = Math.max(1, Math.ceil(heightSpan / this.layerHeight));
    const layers = Array.from({ length: layerCount }, () => []);

    for (const piece of pieces) {
      let layerIdx = Math.floor((piece.pos.y - yMin) / this.layerHeight);
      if (layerIdx < 0) layerIdx = 0;
      if (layerIdx >= layerCount) layerIdx = layerCount - 1;
      layers[layerIdx].push(piece);
    }

    this.steps = [];
    this.pieceStepMap.clear();

    layers.forEach((layerPieces, layerIdx) => {
      if (layerPieces.length === 0) return;

      layerPieces.sort((a, b) => {
        const orderA = this.getStructuralOrder(a.prefab, a.category);
        const orderB = this.getStructuralOrder(b.prefab, b.category);
        if (orderA !== orderB) return orderA - orderB;
        return a.pos.y - b.pos.y;
      });

      const yStart = yMin + layerIdx * this.layerHeight;
      const yEnd = Math.min(yMax, yStart + this.layerHeight);
      const stageKey = this.getStageNameKey(layerIdx, layerCount, layerPieces);

      // Sub-divide layers if they contain too many pieces for clear instructions
      const subChunkSize = 140;
      for (let c = 0; c < layerPieces.length; c += subChunkSize) {
        const chunk = layerPieces.slice(c, c + subChunkSize);
        const stepIndex = this.steps.length;
        const stepMaterials = ResourceCalculator.calculate(chunk);

        const partsSummary = {};
        for (const p of chunk) {
          partsSummary[p.prefab] = (partsSummary[p.prefab] || 0) + 1;
          this.pieceStepMap.set(p.id, stepIndex);
        }

        // Compute spatial bounding box and center for placement guidance
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;

        for (const p of chunk) {
          if (p.pos.x < minX) minX = p.pos.x;
          if (p.pos.x > maxX) maxX = p.pos.x;
          if (p.pos.y < minY) minY = p.pos.y;
          if (p.pos.y > maxY) maxY = p.pos.y;
          if (p.pos.z < minZ) minZ = p.pos.z;
          if (p.pos.z > maxZ) maxZ = p.pos.z;
        }

        const bounds = {
          min: { x: Math.round(minX * 100) / 100, y: Math.round(minY * 100) / 100, z: Math.round(minZ * 100) / 100 },
          max: { x: Math.round(maxX * 100) / 100, y: Math.round(maxY * 100) / 100, z: Math.round(maxZ * 100) / 100 },
          center: {
            x: Math.round(((minX + maxX) / 2) * 100) / 100,
            y: Math.round(((minY + maxY) / 2) * 100) / 100,
            z: Math.round(((minZ + maxZ) / 2) * 100) / 100
          },
          size: {
            x: Math.round(Math.max(0.1, maxX - minX) * 100) / 100,
            y: Math.round(Math.max(0.1, maxY - minY) * 100) / 100,
            z: Math.round(Math.max(0.1, maxZ - minZ) * 100) / 100
          }
        };

        const detailedParts = Object.entries(partsSummary).map(([pref, count]) => {
          const info = getPieceInfo(pref);
          return {
            prefab: pref,
            count,
            info,
            category: info.category || 'wood',
            recipe: info.recipe || {},
            totalRecipe: Object.fromEntries(
              Object.entries(info.recipe || {}).map(([m, c]) => [m, c * count])
            )
          };
        }).sort((a, b) => b.count - a.count);

        this.steps.push({
          index: stepIndex,
          stageKey,
          layerIndex: layerIdx + 1,
          totalLayers: layerCount,
          yStart: Math.round(yStart * 100) / 100,
          yEnd: Math.round(yEnd * 100) / 100,
          bounds,
          pieces: chunk,
          pieceIds: new Set(chunk.map(p => p.id)),
          partsSummary,
          detailedParts,
          resources: stepMaterials
        });
      }
    });

    this.totalSteps = this.steps.length;
  }

  getCurrentStepInfo() {
    if (!this.steps || this.steps.length === 0) {
      return {
        current: 0,
        total: 0,
        step: null,
        displayMode: this.displayMode,
        showAll: this.showAll,
        progress: 100
      };
    }

    const step = this.steps[this.currentStep] || this.steps[0];
    const progress = this.showAll ? 100 : Math.round(((this.currentStep + 1) / this.totalSteps) * 100);

    return {
      current: this.currentStep + 1,
      total: this.totalSteps,
      step,
      displayMode: this.displayMode,
      showAll: this.showAll,
      pieceStepMap: this.pieceStepMap,
      progress
    };
  }

  nextStep() {
    if (this.showAll) {
      this.showAll = false;
      this.currentStep = 0;
      this.notifyStepChange();
      return true;
    }

    if (this.currentStep < this.totalSteps - 1) {
      this.currentStep++;
      this.notifyStepChange();
      return true;
    }
    return false;
  }

  prevStep() {
    if (this.showAll) {
      this.showAll = false;
      this.currentStep = Math.max(0, this.totalSteps - 1);
      this.notifyStepChange();
      return true;
    }

    if (this.currentStep > 0) {
      this.currentStep--;
      this.notifyStepChange();
      return true;
    }
    return false;
  }

  goToStep(index) {
    if (index >= 0 && index < this.totalSteps) {
      this.showAll = false;
      this.currentStep = index;
      this.notifyStepChange();
    }
  }

  toggleShowAll() {
    this.showAll = !this.showAll;
    this.stopPlayback();
    this.notifyStepChange();
  }

  setShowAll(val) {
    this.showAll = val;
    this.stopPlayback();
    this.notifyStepChange();
  }

  setDisplayMode(mode) {
    if (['ghost', 'solid', 'isolate'].includes(mode)) {
      this.displayMode = mode;
      this.notifyStepChange();
    }
  }

  togglePlayback() {
    if (this.isPlaying) {
      this.stopPlayback();
    } else {
      this.startPlayback();
    }
  }

  startPlayback() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.showAll = false;

    if (this.currentStep >= this.totalSteps - 1) {
      this.currentStep = 0;
      this.notifyStepChange();
    }

    this.playTimer = setInterval(() => {
      const hasNext = this.nextStep();
      if (!hasNext) {
        this.stopPlayback();
      }
    }, this.playSpeed);
  }

  stopPlayback() {
    this.isPlaying = false;
    if (this.playTimer) {
      clearInterval(this.playTimer);
      this.playTimer = null;
    }
  }

  setPlaySpeed(speedMs) {
    this.playSpeed = speedMs;
    if (this.isPlaying) {
      this.stopPlayback();
      this.startPlayback();
    }
  }
}
