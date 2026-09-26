/**
 * Valheim Blueprint Viewer - Main Application Controller
 * Coordinates UI events, 3D viewport, parser, Lego engine, i18n, and resource calculations.
 */

import { initI18n, t, setLanguage, getLanguage, applyTranslations } from './i18n.js';
import { BlueprintParser } from './parser.js';
import { BlueprintViewer3D } from './viewer3d.js';
import { LegoEngine } from './lego-engine.js';
import { ResourceCalculator } from './resources.js';
import { getPieceInfo, MATERIAL_ICONS, CATEGORY_NAMES, VALHEIM_MATERIALS } from './catalog.js';
import { CalibrationManager } from './calibration.js';

class AppController {
  constructor() {
    this.currentBlueprintData = null;
    this.activeCategoryFilter = 'all';
    this.searchTerm = '';
    
    // Initialize Internationalization
    initI18n();

    // Initialize 3D Engine
    const viewportContainer = document.getElementById('viewport-container');
    this.viewer = new BlueprintViewer3D(viewportContainer);

    // Initialize Calibration Manager
    this.calibration = new CalibrationManager(this.viewer, this);

    // Initialize Lego Construction Engine
    this.lego = new LegoEngine({ layerHeight: 1.5 });

    this.bindEvents();
    this.startHudTicker();

    // Automatically load default sample blueprint
    this.loadSampleBlueprint('BluePrints/sheepshank-mountainfobv2.blueprint');
  }

  bindEvents() {
    // Language Switcher
    const langBtn = document.getElementById('btn-lang');
    if (langBtn) {
      langBtn.textContent = getLanguage().toUpperCase();
      langBtn.addEventListener('click', () => {
        const nextLang = getLanguage() === 'en' ? 'ua' : 'en';
        setLanguage(nextLang);
        langBtn.textContent = nextLang.toUpperCase();
        this.updateUI();
      });
    }

    // Textures On/Off Toggle
    const btnTextures = document.getElementById('btn-toggle-textures');
    if (btnTextures) {
      btnTextures.addEventListener('click', () => {
        const isCurrentlyActive = btnTextures.classList.contains('active');
        const newState = !isCurrentlyActive;
        btnTextures.classList.toggle('active', newState);
        const textSpan = btnTextures.querySelector('.tex-text');
        if (textSpan) {
          textSpan.setAttribute('data-i18n', newState ? 'texturesOn' : 'texturesOff');
          textSpan.textContent = newState ? t('texturesOn') : t('texturesOff');
        }
        this.viewer.setTexturesEnabled(newState);
      });
    }

    // Sample Blueprint Selector
    const sampleSelect = document.getElementById('sample-select');
    if (sampleSelect) {
      sampleSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) {
          this.loadSampleBlueprint(val);
        }
      });
    }

    // File Upload (Input & Drag-Drop)
    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) this.readFile(file);
      });
    }

    this.setupDragAndDrop();

    // Viewport Toolbar Controls
    const btnReset = document.getElementById('tool-reset');
    if (btnReset) btnReset.addEventListener('click', () => this.viewer.focusAll());

    const btnWireframe = document.getElementById('tool-wireframe');
    if (btnWireframe) {
      btnWireframe.addEventListener('click', () => {
        const active = btnWireframe.classList.toggle('active');
        this.viewer.toggleWireframe(active);
      });
    }

    const btnGrid = document.getElementById('tool-grid');
    if (btnGrid) {
      btnGrid.addEventListener('click', () => {
        const active = btnGrid.classList.toggle('active');
        this.viewer.toggleGrid(active);
      });
    }

    // Camera Preset Buttons
    document.querySelectorAll('[data-camera-preset]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const preset = e.currentTarget.getAttribute('data-camera-preset');
        this.viewer.setCameraPreset(preset);
      });
    });

    // Exploded View Slider
    const explodeSlider = document.getElementById('explode-slider');
    if (explodeSlider) {
      explodeSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) || 0;
        this.viewer.setExplodeFactor(val);
      });
    }

    // Lego Step Controller
    this.lego.onStepChange((stepInfo) => this.handleStepChange(stepInfo));

    const btnPrev = document.getElementById('btn-lego-prev');
    if (btnPrev) btnPrev.addEventListener('click', () => this.lego.prevStep());

    const btnNext = document.getElementById('btn-lego-next');
    if (btnNext) btnNext.addEventListener('click', () => this.lego.nextStep());

    const btnPlay = document.getElementById('btn-lego-play');
    if (btnPlay) {
      btnPlay.addEventListener('click', () => {
        this.lego.togglePlayback();
        btnPlay.classList.toggle('playing', this.lego.isPlaying);
        btnPlay.textContent = this.lego.isPlaying ? t('btnPause') : t('btnPlay');
      });
    }

    const btnFirst = document.getElementById('btn-lego-first');
    if (btnFirst) btnFirst.addEventListener('click', () => this.lego.goToStep(0));

    const btnLast = document.getElementById('btn-lego-last');
    if (btnLast) btnLast.addEventListener('click', () => this.lego.goToStep(this.lego.totalSteps - 1));

    const btnAll = document.getElementById('btn-lego-all');
    if (btnAll) btnAll.addEventListener('click', () => this.lego.toggleShowAll());

    const legoSlider = document.getElementById('lego-step-slider');
    if (legoSlider) {
      legoSlider.addEventListener('input', (e) => {
        const idx = parseInt(e.target.value, 10);
        this.lego.goToStep(idx);
      });
    }

    // Lego Display Modes (All / Ghost / Solid / Isolate)
    document.querySelectorAll('[data-lego-mode]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.currentTarget.getAttribute('data-lego-mode');
        if (mode === 'all') {
          this.lego.setShowAll(true);
        } else {
          this.lego.setShowAll(false);
          this.lego.setDisplayMode(mode);
        }
      });
    });

    // Layer Thickness Selector
    const layerSelect = document.getElementById('layer-height-select');
    if (layerSelect) {
      layerSelect.addEventListener('change', (e) => {
        const h = parseFloat(e.target.value) || 1.5;
        this.lego.setLayerHeight(h);
      });
    }

    // Sidebar Tab Navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        e.currentTarget.classList.add('active');
        const targetTabId = e.currentTarget.getAttribute('data-tab');
        const targetTab = document.getElementById(targetTabId);
        if (targetTab) targetTab.classList.add('active');
      });
    });

    // Copy Materials Button
    const btnCopy = document.getElementById('btn-copy-resources');
    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        if (!this.currentBlueprintData) return;
        const res = ResourceCalculator.calculate(this.currentBlueprintData.pieces);
        const text = ResourceCalculator.formatForClipboard(res.materials, res.chests);
        navigator.clipboard.writeText(text).then(() => {
          this.showToast(t('copiedNotice'));
        });
      });
    }

    // Piece Search Filter
    const searchInput = document.getElementById('pieces-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value.toLowerCase();
        this.renderPieceCatalogTab();
      });
    }

    // Category Filter Buttons
    document.querySelectorAll('[data-cat-filter]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-cat-filter]').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.activeCategoryFilter = e.currentTarget.getAttribute('data-cat-filter');
        this.renderResourcesTab();
        this.renderPieceCatalogTab();
      });
    });
  }

  setupDragAndDrop() {
    const overlay = document.getElementById('drop-overlay');
    window.addEventListener('dragenter', (e) => {
      e.preventDefault();
      if (overlay) overlay.classList.add('active');
    });
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('dragleave', (e) => {
      if (e.target === overlay) {
        if (overlay) overlay.classList.remove('active');
      }
    });
    window.addEventListener('drop', (e) => {
      e.preventDefault();
      if (overlay) overlay.classList.remove('active');
      const file = e.dataTransfer?.files[0];
      if (file) this.readFile(file);
    });
  }

  readFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        this.processBlueprintText(text, file.name);
      } catch (err) {
        alert(t('invalidBlueprint') + '\n' + err.message);
      }
    };
    reader.readAsText(file);
  }

  async loadSampleBlueprint(url) {
    try {
      const select = document.getElementById('sample-select');
      if (select && select.value !== url) {
        select.value = url;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      await this.processBlueprintText(text, url.split('/').pop());
    } catch (err) {
      console.error('Failed to load sample:', err);
    }
  }

  async processBlueprintText(rawText, fallbackName) {
    try {
      const data = BlueprintParser.parse(rawText);
      if (!data.metadata.name || data.metadata.name === 'Untitled Blueprint') {
        data.metadata.name = fallbackName.replace(/\.blueprint$/i, '');
      }

      this.currentBlueprintData = data;

      // Update 3D Viewport with full assembly
      await this.viewer.loadBlueprint(data);

      // Initialize Lego Construction Engine (starts with showAll = true)
      this.lego.loadBlueprint(data);

      // Update UI Tabs & Badges
      this.updateUI();

      if (this.calibration) {
        this.calibration.updateTabUI();
      }
    } catch (err) {
      alert(t('invalidBlueprint') + ': ' + err.message);
    }
  }

  updateUI() {
    if (!this.currentBlueprintData) return;
    const { metadata, bounds, pieces } = this.currentBlueprintData;

    // Header Details
    const titleEl = document.getElementById('blueprint-name');
    if (titleEl) titleEl.textContent = metadata.name;

    const authorEl = document.getElementById('blueprint-author');
    if (authorEl) authorEl.textContent = metadata.creator;

    const countEl = document.getElementById('blueprint-pieces-count');
    if (countEl) countEl.textContent = pieces.length.toLocaleString();

    // Render Tabs
    this.renderLegoTab();
    this.renderResourcesTab();
    this.renderPieceCatalogTab();
    applyTranslations();
  }

  handleStepChange(stepInfo) {
    this.viewer.updateLegoStep(stepInfo);

    const { current, total, step, progress, showAll, displayMode } = stepInfo;
    if (this.lastActiveStep !== current) {
      if (this.collapsedSteps) {
        this.collapsedSteps.delete(current - 1);
      }
      this.lastActiveStep = current;
    }
    const stepLabel = document.getElementById('lego-step-number');
    const stageDesc = document.getElementById('lego-stage-desc');
    const slider = document.getElementById('lego-step-slider');
    const progressEl = document.getElementById('lego-progress-text');
    const partsContainer = document.getElementById('lego-step-parts');

    // Update Mode Buttons Active State
    document.querySelectorAll('[data-lego-mode]').forEach(b => {
      const m = b.getAttribute('data-lego-mode');
      if (showAll) {
        b.classList.toggle('active', m === 'all');
      } else {
        b.classList.toggle('active', m === displayMode);
      }
    });

    if (showAll) {
      if (stepLabel) stepLabel.textContent = t('modeAll');
      if (stageDesc) stageDesc.textContent = t('stageAll');
      if (slider) {
        slider.max = Math.max(0, total - 1);
        slider.value = total - 1;
      }
      if (progressEl) progressEl.textContent = '100%';

      if (partsContainer && this.currentBlueprintData) {
        partsContainer.innerHTML = '';
        const count = this.currentBlueprintData.pieces.length;
        const pill = document.createElement('span');
        pill.className = 'part-pill';
        pill.innerHTML = `🌟 <strong>${count.toLocaleString()}</strong> ${t('allPiecesVisible', { count })}`;
        partsContainer.appendChild(pill);
      }
    } else {
      if (stepLabel) {
        stepLabel.textContent = t('stepLabel', { current, total });
      }

      if (stageDesc && step) {
        stageDesc.textContent = t(step.stageKey);
      }

      if (slider) {
        slider.max = Math.max(0, total - 1);
        slider.value = current - 1;
      }

      if (progressEl) {
        progressEl.textContent = `${progress}%`;
      }

      // Update parts and placement pill card in bottom HUD
      if (partsContainer && step) {
        partsContainer.innerHTML = '';
        const isUa = getLanguage() === 'ua';

        // 1. Placement position chip
        if (step.bounds) {
          const posPill = document.createElement('span');
          posPill.className = 'part-pill';
          posPill.style.borderColor = 'rgba(229, 169, 60, 0.4)';
          posPill.innerHTML = `📍 <strong>Y: ${step.yStart}m~${step.yEnd}m</strong> &bull; Center (${step.bounds.center.x}, ${step.bounds.center.z})`;
          partsContainer.appendChild(posPill);
        }

        // 2. Material requirements chips
        const matsList = step.resources?.materials || [];
        for (const m of matsList.slice(0, 4)) {
          const matName = isUa ? m.nameUa : m.nameEn;
          const icon = MATERIAL_ICONS[m.id] || '📦';
          const matPill = document.createElement('span');
          matPill.className = 'part-pill';
          matPill.innerHTML = `${icon} <strong>${m.count}</strong> ${matName}`;
          partsContainer.appendChild(matPill);
        }

        // 3. Focus button chip
        const focusBtn = document.createElement('button');
        focusBtn.className = 'part-pill';
        focusBtn.style.cursor = 'pointer';
        focusBtn.style.background = 'var(--gold)';
        focusBtn.style.color = '#0b0e14';
        focusBtn.style.fontWeight = 'bold';
        focusBtn.innerHTML = `🔍 ${t('focusStep')}`;
        focusBtn.addEventListener('click', () => {
          this.viewer.focusStep(step);
        });
        partsContainer.appendChild(focusBtn);

        // 4. Pieces pills
        for (const [prefab, count] of Object.entries(step.partsSummary)) {
          const info = getPieceInfo(prefab);
          const name = isUa ? info.name.ua : info.name.en;
          const pill = document.createElement('span');
          pill.className = 'part-pill';
          pill.innerHTML = `<strong>${count}x</strong> ${name}`;
          partsContainer.appendChild(pill);
        }
      }
    }

    this.renderLegoTab();
  }

  renderLegoTab() {
    const container = document.getElementById('lego-timeline-container');
    if (!container || !this.lego.steps) return;

    container.innerHTML = '';
    const isUa = getLanguage() === 'ua';

    if (!this.expandedSteps) {
      this.expandedSteps = new Set();
    }
    if (!this.collapsedSteps) {
      this.collapsedSteps = new Set();
    }

    this.lego.steps.forEach((step, idx) => {
      const isCurrent = !this.lego.showAll && idx === this.lego.currentStep;
      const isExplicitlyCollapsed = this.collapsedSteps.has(idx);
      const isExpanded = !isExplicitlyCollapsed && (isCurrent || this.expandedSteps.has(idx));

      const card = document.createElement('div');
      card.className = `lego-step-card ${isCurrent ? 'active' : ''} ${isExpanded ? 'expanded' : ''}`;
      card.setAttribute('data-step-index', idx);

      // Materials chips summary
      const matsList = step.resources?.materials || [];
      const matsChips = matsList.map(m => {
        const matName = isUa ? m.nameUa : m.nameEn;
        const icon = MATERIAL_ICONS[m.id] || '📦';
        return `<span class="step-mat-chip" style="border-left: 3px solid ${m.color || 'var(--gold)'};" title="${m.count} ${matName}">
          <span>${icon}</span> <strong>${m.count}</strong> <span class="mat-label">${matName}</span>
        </span>`;
      }).join('');

      // Items to place list
      const itemsList = (step.detailedParts || []).map(part => {
        const pName = isUa ? part.info.name.ua : part.info.name.en;
        const catObj = CATEGORY_NAMES[part.category] || { en: part.category, ua: part.category };
        const catName = isUa ? catObj.ua : catObj.en;
        const recipeSummary = Object.entries(part.recipe || {})
          .map(([matKey, amt]) => {
            const mDef = VALHEIM_MATERIALS[matKey];
            const mName = isUa ? (mDef?.ua || matKey) : (mDef?.en || matKey);
            const icon = MATERIAL_ICONS[matKey] || '•';
            return `${icon} ${amt} ${mName}`;
          }).join(', ');

        return `
          <div class="step-piece-item" data-prefab="${part.prefab}">
            <div class="step-piece-left">
              <span class="step-piece-count">${part.count}x</span>
              <div class="step-piece-names">
                <span class="step-piece-title">${pName}</span>
                <span class="step-piece-meta">${part.prefab} &bull; <span class="cat-tag">${catName}</span></span>
              </div>
            </div>
            <div class="step-piece-cost" title="${recipeSummary}">
              ${recipeSummary || `<span style="color: var(--text-dim);">${t('noMaterialsNeeded')}</span>`}
            </div>
          </div>
        `;
      }).join('');

      card.innerHTML = `
        <div class="step-card-header">
          <div class="step-card-header-left">
            <span class="step-badge">#${idx + 1}</span>
            <div class="step-title-wrap">
              <div class="step-main-title">${t(step.stageKey)}</div>
              <div class="step-sub-meta">
                <span class="layer-pill">${t('layerNumber', { layer: step.layerIndex || 1, total: step.totalLayers || 1 })}</span>
                <span>•</span>
                <span class="pieces-pill">${t('stepPiecesCount', { count: step.pieces.length })}</span>
                <span>•</span>
                <span class="elev-pill">Y: ${step.yStart}m</span>
              </div>
            </div>
          </div>
          <button class="step-toggle-btn" title="Expand/Collapse">
            ${isExpanded ? '▲' : '▼'}
          </button>
        </div>

        <div class="step-card-body" style="display: ${isExpanded ? 'flex' : 'none'};">
          <!-- Placement & Coordinates Section -->
          <div class="step-section">
            <div class="step-section-heading">
              <span style="display: flex; align-items: center; gap: 6px;">📍 <strong>${t('placementInfo')}</strong></span>
              <span style="font-size: 0.72rem; color: var(--gold); font-family: monospace;">Layer ${step.layerIndex}/${step.totalLayers}</span>
            </div>
            <div class="placement-grid">
              <div class="placement-box">
                <span class="p-label">${t('placementElevation')}</span>
                <span class="p-value">Y: ${step.yStart}m ~ ${step.yEnd}m <span class="p-dim">(Δ${Math.round((step.yEnd - step.yStart)*100)/100}m)</span></span>
              </div>
              <div class="placement-box">
                <span class="p-label">${t('placementCenter')}</span>
                <span class="p-value">X: ${step.bounds.center.x}m, Z: ${step.bounds.center.z}m</span>
              </div>
              <div class="placement-box full-width">
                <span class="p-label">${t('placementFootprint')}</span>
                <span class="p-value">${step.bounds.size.x}m (W) &times; ${step.bounds.size.z}m (L) &bull; Height: ${step.bounds.size.y}m</span>
              </div>
            </div>

            <!-- Quick Action Buttons -->
            <div class="step-actions-row">
              <button class="btn-step-action btn-step-focus" data-focus-step="${idx}">
                <span>🔍</span> ${t('focusStep')}
              </button>
              <button class="btn-step-action btn-step-isolate" data-isolate-step="${idx}">
                <span>👁️</span> ${t('isolateStep')}
              </button>
            </div>
          </div>

          <!-- Material Requirements Section -->
          <div class="step-section">
            <div class="step-section-heading">
              <span style="display: flex; align-items: center; gap: 6px;">📦 <strong>${t('stepMaterials')}</strong></span>
              <span class="mats-slot-info">${step.resources.totalSlots} stacks</span>
            </div>
            <div class="step-mats-grid">
              ${matsChips || `<span style="color: var(--text-dim); font-size: 0.75rem;">${t('noMaterialsNeeded')}</span>`}
            </div>
          </div>

          <!-- Items to Place Section -->
          <div class="step-section">
            <div class="step-section-heading">
              <span style="display: flex; align-items: center; gap: 6px;">🧱 <strong>${t('itemsToPlace')}</strong></span>
              <span class="items-count-badge">${(step.detailedParts || []).length} types / ${step.pieces.length} pcs</span>
            </div>
            <div class="step-pieces-container">
              ${itemsList}
            </div>
          </div>
        </div>
      `;

      // Event Listeners
      const toggleExpand = () => {
        if (isExpanded) {
          this.collapsedSteps.add(idx);
          this.expandedSteps.delete(idx);
        } else {
          this.collapsedSteps.delete(idx);
          this.expandedSteps.add(idx);
        }
        this.renderLegoTab();
      };

      // Toggle chevron button directly collapses / expands
      const toggleBtn = card.querySelector('.step-toggle-btn');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleExpand();
        });
      }

      // Header click selects step in 3D or collapses if already selected
      const header = card.querySelector('.step-card-header');
      header.addEventListener('click', (e) => {
        if (!isCurrent) {
          this.collapsedSteps.delete(idx);
          this.expandedSteps.add(idx);
          this.lego.goToStep(idx);
        } else {
          toggleExpand();
        }
      });

      // Focus button listener
      const btnFocus = card.querySelector('.btn-step-focus');
      if (btnFocus) {
        btnFocus.addEventListener('click', (e) => {
          e.stopPropagation();
          this.lego.goToStep(idx);
          this.viewer.focusStep(step);
        });
      }

      // Isolate button listener
      const btnIsolate = card.querySelector('.btn-step-isolate');
      if (btnIsolate) {
        btnIsolate.addEventListener('click', (e) => {
          e.stopPropagation();
          this.lego.goToStep(idx);
          this.lego.setShowAll(false);
          this.lego.setDisplayMode('isolate');
        });
      }

      // Hover on individual piece item highlights prefab in 3D
      card.querySelectorAll('.step-piece-item').forEach(itemEl => {
        const pref = itemEl.getAttribute('data-prefab');
        itemEl.addEventListener('mouseenter', () => {
          if (pref) this.viewer.highlightPrefab(pref);
        });
        itemEl.addEventListener('mouseleave', () => {
          this.viewer.resetHighlights();
        });
      });

      container.appendChild(card);

      if (isCurrent) {
        setTimeout(() => {
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);
      }
    });
  }

  renderResourcesTab() {
    if (!this.currentBlueprintData) return;
    const { pieces } = this.currentBlueprintData;
    const isUa = getLanguage() === 'ua';

    // Filter pieces by active category if not 'all'
    const filteredPieces = this.activeCategoryFilter === 'all'
      ? pieces
      : pieces.filter(p => {
          const info = getPieceInfo(p.prefab);
          return info.category === this.activeCategoryFilter;
        });

    const res = ResourceCalculator.calculate(filteredPieces);

    // Update Chest Logistics Cards
    const woodChestEl = document.getElementById('count-wood-chests');
    if (woodChestEl) woodChestEl.textContent = res.chests.woodChests;

    const reinfChestEl = document.getElementById('count-reinf-chests');
    if (reinfChestEl) reinfChestEl.textContent = res.chests.reinforcedChests;

    const slotsEl = document.getElementById('count-total-slots');
    if (slotsEl) slotsEl.textContent = res.totalSlots;

    // Render Material Rows
    const listContainer = document.getElementById('materials-list-container');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    res.materials.forEach(mat => {
      const row = document.createElement('div');
      row.className = 'material-item';

      const matName = isUa ? mat.nameUa : mat.nameEn;
      const stackLabel = isUa ? `стаків` : `stacks`;

      row.innerHTML = `
        <div class="material-info">
          <div class="material-swatch" style="background-color: ${mat.color}"></div>
          <span class="material-name">${matName}</span>
        </div>
        <div class="material-quantities">
          <div class="material-count">${mat.count.toLocaleString()}</div>
          <div class="material-stacks">${mat.stacks} ${stackLabel}</div>
        </div>
      `;
      listContainer.appendChild(row);
    });
  }

  renderPieceCatalogTab() {
    if (!this.currentBlueprintData) return;
    const { prefabCounts } = this.currentBlueprintData;
    const container = document.getElementById('pieces-list-container');
    if (!container) return;

    container.innerHTML = '';
    const isUa = getLanguage() === 'ua';

    const sortedPrefabs = Object.entries(prefabCounts)
      .sort((a, b) => b[1] - a[1]);

    sortedPrefabs.forEach(([prefab, count]) => {
      const info = getPieceInfo(prefab);
      const name = isUa ? info.name.ua : info.name.en;

      // Filter by search query
      if (this.searchTerm) {
        const matchesName = name.toLowerCase().includes(this.searchTerm);
        const matchesPrefab = prefab.toLowerCase().includes(this.searchTerm);
        if (!matchesName && !matchesPrefab) return;
      }

      // Filter by category
      if (this.activeCategoryFilter !== 'all' && info.category !== this.activeCategoryFilter) {
        return;
      }

      const row = document.createElement('div');
      row.className = 'piece-row';
      row.innerHTML = `
        <div class="piece-row-title">
          <span class="piece-row-name">${name}</span>
          <span class="piece-row-prefab">${prefab}</span>
        </div>
        <span class="piece-row-count">${count}</span>
      `;

      row.addEventListener('mouseenter', () => {
        this.viewer.highlightPrefab(prefab);
      });
      row.addEventListener('mouseleave', () => {
        this.viewer.resetHighlights();
      });

      container.appendChild(row);
    });
  }

  startHudTicker() {
    setInterval(() => {
      const metrics = this.viewer.getMetrics();
      const fpsEl = document.getElementById('hud-fps');
      if (fpsEl) fpsEl.textContent = metrics.fps;

      const dcEl = document.getElementById('hud-draw-calls');
      if (dcEl) dcEl.textContent = metrics.drawCalls;

      const triEl = document.getElementById('hud-triangles');
      if (triEl) triEl.textContent = (metrics.triangles).toLocaleString();

      if (this.currentBlueprintData) {
        const bounds = this.currentBlueprintData.bounds;
        const dimEl = document.getElementById('hud-dimensions');
        if (dimEl) dimEl.textContent = `${bounds.size.x}m × ${bounds.size.y}m × ${bounds.size.z}m`;
      }
    }, 500);
  }

  showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  }
}

// Start application once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.app = new AppController();
});
