/**
 * Valheim Blueprint Viewer - Rotation Calibration Manager
 * Allows interactive rotation calibration per prefab type in 3D,
 * auto-saves to presets/rotation_calibration.json via backend server,
 * and persists to localStorage.
 */

export class CalibrationManager {
  constructor(viewer, appController) {
    this.viewer = viewer;
    this.app = appController;
    this.calibrations = {}; // { [prefab]: { x: 0, y: 180, z: 0 } }
    this.selectedPrefab = null;
    this.isActive = false;
    this.saveTimeout = null;
    this.saveStatusEl = null;

    this.init();
  }

  async init() {
    await this.loadCalibrations();
    this.setupUI();
    this.setupViewportRaycast();
  }

  /**
   * Load calibrations from presets/rotation_calibration.json and merge with localStorage
   */
  async loadCalibrations() {
    let fileData = {};
    try {
      const res = await fetch('presets/rotation_calibration.json?t=' + Date.now());
      if (res.ok) {
        fileData = await res.json();
      }
    } catch (e) {
      console.warn('[Calibration] Could not load presets/rotation_calibration.json:', e);
    }

    let localData = {};
    try {
      const stored = localStorage.getItem('valheim_rotation_calibration');
      if (stored) {
        localData = JSON.parse(stored);
      }
    } catch {
      // ignore
    }

    // Merge: file data is base, local data overlays recent unsaved tweaks
    this.calibrations = { ...fileData, ...localData };
    this.applyAllToViewer();
  }

  applyAllToViewer() {
    const map = new Map();
    for (const [prefab, offset] of Object.entries(this.calibrations)) {
      map.set(prefab, {
        x: offset.x || 0,
        y: offset.y || 0,
        z: offset.z || 0
      });
    }
    this.viewer.setCalibrationMap(map);
  }

  getPrefabCalibration(prefab) {
    if (!this.calibrations[prefab]) {
      this.calibrations[prefab] = { x: 0, y: 0, z: 0 };
    }
    return this.calibrations[prefab];
  }

  /**
   * Rotate all pieces of a prefab type by delta degrees around specified axis ('x', 'y', 'z')
   */
  rotatePrefab(prefab, axis, deltaDeg) {
    if (!prefab) return;
    const calib = this.getPrefabCalibration(prefab);
    let val = (calib[axis] || 0) + deltaDeg;
    // Normalize to [0, 360)
    val = ((val % 360) + 360) % 360;
    calib[axis] = val;

    this.viewer.updatePrefabRotation(prefab, calib);
    this.updateHUD();
    this.updateTabUI();
    this.scheduleSave();
  }

  /**
   * Set absolute rotation angles in degrees
   */
  setPrefabRotation(prefab, x, y, z) {
    if (!prefab) return;
    const calib = this.getPrefabCalibration(prefab);
    if (x !== undefined) calib.x = ((x % 360) + 360) % 360;
    if (y !== undefined) calib.y = ((y % 360) + 360) % 360;
    if (z !== undefined) calib.z = ((z % 360) + 360) % 360;

    this.viewer.updatePrefabRotation(prefab, calib);
    this.updateHUD();
    this.updateTabUI();
    this.scheduleSave();
  }

  /**
   * Reset rotation of a prefab to 0,0,0
   */
  resetPrefabRotation(prefab) {
    if (!prefab) return;
    this.setPrefabRotation(prefab, 0, 0, 0);
  }

  /**
   * Select a prefab for calibration (highlights it in 3D and updates controls)
   */
  selectPrefab(prefab) {
    this.selectedPrefab = prefab;
    if (prefab) {
      this.viewer.highlightPrefab(prefab);
    } else {
      this.viewer.resetHighlights();
    }
    this.updateHUD();
    this.updateTabUI();
  }

  /**
   * Debounced save to presets/rotation_calibration.json and localStorage
   */
  scheduleSave() {
    this.setSaveStatus('Saving...', 'warning');
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.save();
    }, 400);
  }

  async save() {
    try {
      localStorage.setItem('valheim_rotation_calibration', JSON.stringify(this.calibrations));
    } catch {
      // ignore
    }

    try {
      const res = await fetch('/api/save-calibration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.calibrations, null, 2)
      });
      if (res.ok) {
        const json = await res.json();
        this.setSaveStatus(`Saved to presets/rotation_calibration.json (${json.count || Object.keys(this.calibrations).length} items)`, 'success');
        return true;
      }
    } catch (e) {
      console.warn('[Calibration] Backend save failed, stored in localStorage:', e);
    }

    this.setSaveStatus('Saved in browser (server offline)', 'info');
    return false;
  }

  setSaveStatus(msg, type = 'info') {
    const el = document.getElementById('calib-save-status');
    const hudEl = document.getElementById('hud-calib-status');
    const colorMap = {
      success: 'var(--success, #4ade80)',
      warning: 'var(--warning, #f59e0b)',
      info: 'var(--text-muted, #94a3b8)',
      error: 'var(--error, #ef4444)'
    };
    const col = colorMap[type] || colorMap.info;

    if (el) {
      el.textContent = msg;
      el.style.color = col;
    }
    if (hudEl) {
      hudEl.textContent = msg;
      hudEl.style.color = col;
    }
  }

  /**
   * Setup click raycasting in viewport
   */
  setupViewportRaycast() {
    const dom = this.viewer.renderer.domElement;
    let downTime = 0;
    let downPos = { x: 0, y: 0 };

    dom.addEventListener('pointerdown', (e) => {
      downTime = performance.now();
      downPos = { x: e.clientX, y: e.clientY };
    });

    dom.addEventListener('pointerup', (e) => {
      // Ignore if dragging/orbiting (threshold 5px, 250ms)
      const dist = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
      if (dist > 6 || performance.now() - downTime > 300) return;

      const hit = this.viewer.raycastPiece(e.clientX, e.clientY);
      if (hit) {
        this.selectPrefab(hit.prefab);
        // Switch to calibration tab if not already open
        if (!this.isActive) {
          this.activate(true);
        }
      }
    });
  }

  activate(show) {
    this.isActive = show;
    const hud = document.getElementById('calib-floating-hud');
    const btn = document.getElementById('tool-calibrate');
    if (hud) hud.style.display = show ? 'flex' : 'none';
    if (btn) btn.classList.toggle('active', show);

    if (show) {
      if (!this.selectedPrefab) {
        const groups = this.viewer.instancedGroups;
        if (groups && groups.length > 0) {
          this.selectPrefab(groups[0].prefab);
        }
      } else {
        this.updateHUD();
        this.updateTabUI();
      }
    }
  }

  toggle() {
    this.activate(!this.isActive);
  }

  setupUI() {
    // Toolbar toggle button
    const btnCalib = document.getElementById('tool-calibrate');
    if (btnCalib) {
      btnCalib.addEventListener('click', () => this.toggle());
    }

    // Sidebar Tab switch
    const tabBtn = document.querySelector('[data-tab="tab-calibrate"]');
    if (tabBtn) {
      tabBtn.addEventListener('click', () => {
        this.activate(true);
      });
    }

    // Floating HUD button bindings
    this.bindHUDButtons();
    this.bindTabButtons();
  }

  bindHUDButtons() {
    const getActive = () => this.selectedPrefab;

    // Horizontal (Yaw - Y)
    document.getElementById('hud-rot-y-plus')?.addEventListener('click', () => {
      this.rotatePrefab(getActive(), 'y', 90);
    });
    document.getElementById('hud-rot-y-minus')?.addEventListener('click', () => {
      this.rotatePrefab(getActive(), 'y', -90);
    });
    document.getElementById('hud-rot-y-180')?.addEventListener('click', () => {
      this.rotatePrefab(getActive(), 'y', 180);
    });

    // Vertical (Pitch - X)
    document.getElementById('hud-rot-x-plus')?.addEventListener('click', () => {
      this.rotatePrefab(getActive(), 'x', 90);
    });
    document.getElementById('hud-rot-x-minus')?.addEventListener('click', () => {
      this.rotatePrefab(getActive(), 'x', -90);
    });
    document.getElementById('hud-rot-x-180')?.addEventListener('click', () => {
      this.rotatePrefab(getActive(), 'x', 180);
    });

    // Roll (Z) & Reset
    document.getElementById('hud-rot-z-plus')?.addEventListener('click', () => {
      this.rotatePrefab(getActive(), 'z', 90);
    });
    document.getElementById('hud-rot-z-minus')?.addEventListener('click', () => {
      this.rotatePrefab(getActive(), 'z', -90);
    });
    document.getElementById('hud-rot-reset')?.addEventListener('click', () => {
      this.resetPrefabRotation(getActive());
    });
    document.getElementById('hud-calib-close')?.addEventListener('click', () => {
      this.activate(false);
      this.viewer.resetHighlights();
    });
  }

  bindTabButtons() {
    const getActive = () => this.selectedPrefab;

    // Horizontal (Yaw - Y)
    document.getElementById('tab-rot-y-plus')?.addEventListener('click', () => {
      this.rotatePrefab(getActive(), 'y', 90);
    });
    document.getElementById('tab-rot-y-minus')?.addEventListener('click', () => {
      this.rotatePrefab(getActive(), 'y', -90);
    });
    document.getElementById('tab-rot-y-180')?.addEventListener('click', () => {
      this.rotatePrefab(getActive(), 'y', 180);
    });

    // Vertical (Pitch - X)
    document.getElementById('tab-rot-x-plus')?.addEventListener('click', () => {
      this.rotatePrefab(getActive(), 'x', 90);
    });
    document.getElementById('tab-rot-x-minus')?.addEventListener('click', () => {
      this.rotatePrefab(getActive(), 'x', -90);
    });
    document.getElementById('tab-rot-x-180')?.addEventListener('click', () => {
      this.rotatePrefab(getActive(), 'x', 180);
    });

    // Roll (Z) & Reset
    document.getElementById('tab-rot-z-plus')?.addEventListener('click', () => {
      this.rotatePrefab(getActive(), 'z', 90);
    });
    document.getElementById('tab-rot-z-minus')?.addEventListener('click', () => {
      this.rotatePrefab(getActive(), 'z', -90);
    });
    document.getElementById('tab-rot-reset')?.addEventListener('click', () => {
      this.resetPrefabRotation(getActive());
    });

    // Save Now Button
    document.getElementById('btn-calib-save-now')?.addEventListener('click', async () => {
      const ok = await this.save();
      if (ok) alert('Saved calibrations to presets/rotation_calibration.json!');
    });

    // Copy JSON Button
    document.getElementById('btn-calib-copy')?.addEventListener('click', () => {
      navigator.clipboard.writeText(JSON.stringify(this.calibrations, null, 2));
      this.setSaveStatus('Copied JSON to clipboard!', 'success');
    });

    // Download JSON Button
    document.getElementById('btn-calib-download')?.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(this.calibrations, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'rotation_calibration.json';
      a.click();
    });

    // Prefab search/select filter in tab
    const searchInput = document.getElementById('calib-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.renderPrefabList(e.target.value);
      });
    }
  }

  updateHUD() {
    const nameEl = document.getElementById('hud-calib-prefab-name');
    const anglesEl = document.getElementById('hud-calib-angles');
    const countEl = document.getElementById('hud-calib-count');

    if (!this.selectedPrefab) {
      if (nameEl) nameEl.textContent = 'None selected (Click a piece)';
      if (anglesEl) anglesEl.textContent = 'Yaw: 0° | Pitch: 0° | Roll: 0°';
      if (countEl) countEl.textContent = '';
      return;
    }

    const calib = this.getPrefabCalibration(this.selectedPrefab);
    const group = this.viewer.instancedGroups.find(g => g.prefab === this.selectedPrefab);
    const count = group ? group.instances.length : 0;

    if (nameEl) nameEl.textContent = this.selectedPrefab;
    if (anglesEl) anglesEl.textContent = `Yaw (Y): ${calib.y || 0}° | Pitch (X): ${calib.x || 0}° | Roll (Z): ${calib.z || 0}°`;
    if (countEl) countEl.textContent = `${count} pcs in build`;
  }

  updateTabUI() {
    const curTitle = document.getElementById('calib-selected-title');
    const curAngles = document.getElementById('calib-selected-angles');

    if (!this.selectedPrefab) {
      if (curTitle) curTitle.textContent = 'Click a piece or select below';
      if (curAngles) curAngles.textContent = 'Yaw: 0° | Pitch: 0° | Roll: 0°';
    } else {
      const calib = this.getPrefabCalibration(this.selectedPrefab);
      const group = this.viewer.instancedGroups.find(g => g.prefab === this.selectedPrefab);
      const count = group ? group.instances.length : 0;

      if (curTitle) curTitle.textContent = `${this.selectedPrefab} (${count} pcs)`;
      if (curAngles) curAngles.textContent = `Yaw (Y): ${calib.y || 0}° | Pitch (X): ${calib.x || 0}° | Roll (Z): ${calib.z || 0}°`;
    }

    this.renderPrefabList();
  }

  renderPrefabList(filterText = '') {
    const container = document.getElementById('calib-prefab-list');
    if (!container) return;

    const term = (filterText || '').toLowerCase().trim();
    const groups = [...(this.viewer.instancedGroups || [])].sort((a, b) => b.instances.length - a.instances.length);

    container.innerHTML = '';

    if (groups.length === 0) {
      container.innerHTML = '<div style="color:var(--text-muted); padding:10px; text-align:center;">No blueprint loaded</div>';
      return;
    }

    for (const group of groups) {
      const prefab = group.prefab;
      if (term && !prefab.toLowerCase().includes(term)) continue;

      const calib = this.calibrations[prefab] || { x: 0, y: 0, z: 0 };
      const isSelected = prefab === this.selectedPrefab;
      const isModified = (calib.x !== 0 || calib.y !== 0 || calib.z !== 0);

      const item = document.createElement('div');
      item.className = `calib-item ${isSelected ? 'selected' : ''} ${isModified ? 'modified' : ''}`;
      item.innerHTML = `
        <div class="calib-item-info">
          <span class="calib-item-name">${prefab}</span>
          <span class="calib-item-badge">${group.instances.length} pcs</span>
        </div>
        <div class="calib-item-angles">
          <span class="angle-tag ${calib.y ? 'active' : ''}">Y: ${calib.y || 0}°</span>
          ${calib.x ? `<span class="angle-tag active">X: ${calib.x}°</span>` : ''}
          ${calib.z ? `<span class="angle-tag active">Z: ${calib.z}°</span>` : ''}
        </div>
      `;

      item.addEventListener('click', () => {
        this.selectPrefab(prefab);
      });

      container.appendChild(item);
    }
  }
}
