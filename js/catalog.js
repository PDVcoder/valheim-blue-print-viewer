/**
 * Valheim Building Pieces Catalog & Procedural Geometry Definitions
 * Contains recipes, localized names (EN / UA), and procedural proxy shape metrics.
 */

export const VALHEIM_MATERIALS = {
  wood: { id: 'wood', en: 'Wood', ua: 'Деревина', stackSize: 50, color: '#c68b59' },
  fineWood: { id: 'fineWood', en: 'Fine Wood', ua: 'Якісна деревина', stackSize: 50, color: '#e0ae6e' },
  coreWood: { id: 'coreWood', en: 'Core Wood', ua: 'Цілісна деревина', stackSize: 50, color: '#82522a' },
  ancientBark: { id: 'ancientBark', en: 'Ancient Bark', ua: 'Стародавня кора', stackSize: 50, color: '#574235' },
  yggdrasilWood: { id: 'yggdrasilWood', en: 'Yggdrasil Wood', ua: 'Деревина Іґґдрасіля', stackSize: 50, color: '#588750' },
  ashwood: { id: 'ashwood', en: 'Ashwood', ua: 'Попеляста деревина', stackSize: 50, color: '#4a4444' },
  roundLog: { id: 'roundLog', en: 'Round Log', ua: 'Кругляк', stackSize: 50, color: '#966035' },
  stone: { id: 'stone', en: 'Stone', ua: 'Камінь', stackSize: 50, color: '#9da2a6' },
  grausten: { id: 'grausten', en: 'Grausten', ua: 'Грауштен', stackSize: 50, color: '#696e73' },
  marble: { id: 'marble', en: 'Black Marble', ua: 'Чорний мармур', stackSize: 50, color: '#383b40' },
  iron: { id: 'iron', en: 'Iron', ua: 'Залізо', stackSize: 30, color: '#5c636d' },
  copper: { id: 'copper', en: 'Copper', ua: 'Мідь', stackSize: 30, color: '#c7754c' },
  bronze: { id: 'bronze', en: 'Bronze', ua: 'Бронза', stackSize: 30, color: '#a67d46' },
  silver: { id: 'silver', en: 'Silver', ua: 'Срібло', stackSize: 30, color: '#d8dee6' },
  blackMetal: { id: 'blackMetal', en: 'Black Metal', ua: 'Чорний метал', stackSize: 30, color: '#30473c' },
  flametal: { id: 'flametal', en: 'Flametal', ua: 'Вогнеметал', stackSize: 30, color: '#b5442b' },
  tar: { id: 'tar', en: 'Tar', ua: 'Смола', stackSize: 20, color: '#1f1c19' },
  resin: { id: 'resin', en: 'Resin', ua: 'Живиця', stackSize: 50, color: '#edaa26' },
  coal: { id: 'coal', en: 'Coal', ua: 'Вугілля', stackSize: 50, color: '#2b2927' },
  leatherScraps: { id: 'leatherScraps', en: 'Leather Scraps', ua: 'Шматочки шкіри', stackSize: 50, color: '#8a5938' },
  deerHide: { id: 'deerHide', en: 'Deer Hide', ua: 'Шкура оленя', stackSize: 50, color: '#a86c40' },
  wolfPelt: { id: 'wolfPelt', en: 'Wolf Pelt', ua: 'Вовча шкура', stackSize: 50, color: '#7f838a' },
  surtlingCore: { id: 'surtlingCore', en: 'Surtling Core', ua: 'Ядро сюртлінга', stackSize: 20, color: '#eb4621' },
  flint: { id: 'flint', en: 'Flint', ua: 'Кремінь', stackSize: 50, color: '#afb9c2' },
  ironNails: { id: 'ironNails', en: 'Iron Nails', ua: 'Залізні цвяхи', stackSize: 100, color: '#5b6169' },
  bronzeNails: { id: 'bronzeNails', en: 'Bronze Nails', ua: 'Бронзові цвяхи', stackSize: 100, color: '#9e7d42' },
  feathers: { id: 'feathers', en: 'Feathers', ua: 'Пір\'я', stackSize: 50, color: '#c7c4bb' },
  chain: { id: 'chain', en: 'Chain', ua: 'Ланцюг', stackSize: 20, color: '#555961' }
};

export const PREFAB_CATALOG = {
  // --- Standard Wood Building Pieces ---
  wood_floor: {
    name: { en: 'Wood Floor 2x2', ua: 'Дерев\'яна підлога 2х2' },
    category: 'wood',
    recipe: { wood: 2 },
    proxy: { shape: 'box', size: [2, 0.1, 2], color: '#bf8652' }
  },
  wood_floor_1x1: {
    name: { en: 'Wood Floor 1x1', ua: 'Дерев\'яна підлога 1х1' },
    category: 'wood',
    recipe: { wood: 1 },
    proxy: { shape: 'box', size: [1, 0.1, 1], color: '#bf8652' }
  },
  woodwall: {
    name: { en: 'Wood Wall 2x2', ua: 'Дерев\'яна стіна 2х2' },
    category: 'wood',
    recipe: { wood: 2 },
    proxy: { shape: 'box', size: [2, 2, 0.15], offset: [0, 1, 0], color: '#b37746' }
  },
  wood_wall_half: {
    name: { en: 'Wood Wall Half', ua: 'Дерев\'яна півстіна' },
    category: 'wood',
    recipe: { wood: 1 },
    proxy: { shape: 'box', size: [2, 1, 0.15], offset: [0, 0.5, 0], color: '#b37746' }
  },
  wood_beam: {
    name: { en: 'Wood Beam 2m', ua: 'Дерев\'яна балка 2м' },
    category: 'wood',
    recipe: { wood: 2 },
    proxy: { shape: 'beam', size: [2, 0.2, 0.2], offset: [1, 0, 0], color: '#a06a38' }
  },
  wood_beam_1: {
    name: { en: 'Wood Beam 1m', ua: 'Дерев\'яна балка 1м' },
    category: 'wood',
    recipe: { wood: 1 },
    proxy: { shape: 'beam', size: [1, 0.2, 0.2], offset: [0.5, 0, 0], color: '#a06a38' }
  },
  wood_beam_26: {
    name: { en: 'Wood Beam 26°', ua: 'Дерев\'яна балка 26°' },
    category: 'wood',
    recipe: { wood: 2 },
    proxy: { shape: 'beam_sloped', angle: 26, length: 2.24, offset: [1, 0.5, 0], color: '#a06a38' }
  },
  wood_beam_45: {
    name: { en: 'Wood Beam 45°', ua: 'Дерев\'яна балка 45°' },
    category: 'wood',
    recipe: { wood: 2 },
    proxy: { shape: 'beam_sloped', angle: 45, length: 2.83, offset: [1, 1, 0], color: '#a06a38' }
  },
  wood_beam_67: {
    name: { en: 'Wood Beam 67°', ua: 'Дерев\'яна балка 67°' },
    category: 'wood',
    recipe: { wood: 2 },
    proxy: { shape: 'beam_sloped', angle: 67, length: 2.17, offset: [0.5, 1, 0], color: '#a06a38' }
  },
  wood_pole: {
    name: { en: 'Wood Pole 2m', ua: 'Дерев\'яний стовп 2м' },
    category: 'wood',
    recipe: { wood: 2 },
    proxy: { shape: 'cylinder', radius: 0.14, height: 2, offset: [0, 1, 0], color: '#965e2e' }
  },
  wood_pole2: {
    name: { en: 'Wood Pole 1m', ua: 'Дерев\'яний стовп 1м' },
    category: 'wood',
    recipe: { wood: 1 },
    proxy: { shape: 'cylinder', radius: 0.14, height: 1, offset: [0, 0.5, 0], color: '#965e2e' }
  },
  wood_roof: {
    name: { en: 'Thatch Roof 45°', ua: 'Солом\'яний дах 45°' },
    category: 'wood',
    recipe: { wood: 2 },
    proxy: { shape: 'roof45', size: [2, 2, 2], offset: [0, 0, 0], color: '#d4b36a' }
  },
  wood_roof_26: {
    name: { en: 'Thatch Roof 26°', ua: 'Солом\'яний дах 26°' },
    category: 'wood',
    recipe: { wood: 2 },
    proxy: { shape: 'roof26', size: [2, 1, 2], offset: [0, 0, 0], color: '#d4b36a' }
  },
  wood_roof_top: {
    name: { en: 'Thatch Roof Ridge 26°', ua: 'Коник даху 26°' },
    category: 'wood',
    recipe: { wood: 2 },
    proxy: { shape: 'ridge26', size: [2, 0.6, 2], color: '#d4b36a' }
  },
  wood_roof_top_45: {
    name: { en: 'Thatch Roof Ridge 45°', ua: 'Коник даху 45°' },
    category: 'wood',
    recipe: { wood: 2 },
    proxy: { shape: 'ridge45', size: [2, 1, 2], color: '#d4b36a' }
  },
  wood_wall_roof: {
    name: { en: 'Wood Roof Cross 45°', ua: 'Дерев\'яний коник-хрест 45°' },
    category: 'wood',
    recipe: { wood: 2 },
    proxy: { shape: 'cross', size: [2, 2, 0.2], offset: [0, 1, 0], color: '#a06a38' }
  },
  wood_wall_roof_upsidedown: {
    name: { en: 'Wood Wall Inverted Gable', ua: 'Перевернутий фронтон' },
    category: 'wood',
    recipe: { wood: 2 },
    proxy: { shape: 'roof45', size: [2, 1, 0.2], offset: [0, 0.5, 0], color: '#b37746' }
  },
  wood_door: {
    name: { en: 'Wood Door', ua: 'Дерев\'яні двері' },
    category: 'wood',
    recipe: { wood: 4 },
    proxy: { shape: 'box', size: [1.2, 2.1, 0.15], offset: [0, 1.05, 0], color: '#885025' }
  },
  wood_gate: {
    name: { en: 'Wood Gate', ua: 'Дерев\'яна брама' },
    category: 'wood',
    recipe: { wood: 12 },
    proxy: { shape: 'box', size: [3, 3, 0.2], offset: [0, 1.5, 0], color: '#885025' }
  },
  wood_stair: {
    name: { en: 'Wood Stairs', ua: 'Дерев\'яні сходи' },
    category: 'wood',
    recipe: { wood: 2 },
    proxy: { shape: 'stairs', size: [2, 1, 2], offset: [0, 0.5, 0], color: '#b37746' }
  },
  wood_stepladder: {
    name: { en: 'Wood Ladder', ua: 'Дерев\'яна драбина' },
    category: 'wood',
    recipe: { wood: 2 },
    proxy: { shape: 'stairs', size: [1, 2.5, 0.4], offset: [0, 1.25, 0], color: '#b37746' }
  },

  // --- Core Wood Building Pieces ---
  wood_pole_log: {
    name: { en: 'Core Wood Log 2m', ua: 'Колода з цілісної деревини 2м' },
    category: 'coreWood',
    recipe: { coreWood: 1 },
    proxy: { shape: 'cylinder', radius: 0.18, height: 2, offset: [0, 1, 0], color: '#73441e' }
  },
  wood_pole_log_4: {
    name: { en: 'Core Wood Log 4m', ua: 'Колода з цілісної деревини 4м' },
    category: 'coreWood',
    recipe: { coreWood: 2 },
    proxy: { shape: 'cylinder', radius: 0.18, height: 4, offset: [0, 2, 0], color: '#73441e' }
  },

  // --- Stone Masonry ---
  stone_wall_4x2: {
    name: { en: 'Stone Wall 4x2', ua: 'Кам\'яна стіна 4х2' },
    category: 'stone',
    recipe: { stone: 6 },
    proxy: { shape: 'box', size: [4, 2, 1], offset: [0, 0, 0], color: '#9da2a6' }
  },
  stone_wall_2x1: {
    name: { en: 'Stone Wall 2x1', ua: 'Кам\'яна стіна 2х1' },
    category: 'stone',
    recipe: { stone: 3 },
    proxy: { shape: 'box', size: [2, 1, 1], offset: [0, 0, 0], color: '#9da2a6' }
  },
  rae_brickstone_wall_2x1: {
    name: { en: 'Brickstone Wall 2x1', ua: 'Цегляна стіна 2х1' },
    category: 'stone',
    recipe: { stone: 3 },
    proxy: { shape: 'box', size: [2, 1, 1], offset: [0, 0, 0], color: '#9da2a6' }
  },
  stonewall_hardrock_2x1: {
    name: { en: 'Hardrock Wall 2x1', ua: 'Стіна з твердого каменю 2х1' },
    category: 'stone',
    recipe: { stone: 3 },
    proxy: { shape: 'box', size: [2, 1, 1], offset: [0, 0, 0], color: '#9da2a6' }
  },
  stone_wall_1x1: {
    name: { en: 'Stone Wall 1x1', ua: 'Кам\'яна стіна 1х1' },
    category: 'stone',
    recipe: { stone: 1 },
    proxy: { shape: 'box', size: [1, 1, 1], offset: [0, 0, 0], color: '#9da2a6' }
  },
  rae_brickstone_wall_1x1: {
    name: { en: 'Brickstone Wall 1x1', ua: 'Цегляна стіна 1х1' },
    category: 'stone',
    recipe: { stone: 1 },
    proxy: { shape: 'box', size: [1, 1, 1], offset: [0, 0, 0], color: '#9da2a6' }
  },
  stone_floor_2x2: {
    name: { en: 'Stone Floor 2x2', ua: 'Кам\'яна плита 2х2' },
    category: 'stone',
    recipe: { stone: 6 },
    proxy: { shape: 'box', size: [2, 0.4, 2], offset: [0, 0, 0], color: '#888d91' }
  },
  stone_floor_1_new: {
    name: { en: 'Stone Floor 1x1', ua: 'Кам\'яна плита 1х1' },
    category: 'stone',
    recipe: { stone: 2 },
    proxy: { shape: 'box', size: [1, 0.3, 1], offset: [0, 0, 0], color: '#888d91' }
  },
  stone_pillar: {
    name: { en: 'Stone Pillar', ua: 'Кам\'яна колона' },
    category: 'stone',
    recipe: { stone: 5 },
    proxy: { shape: 'box', size: [1, 2, 1], offset: [0, 0, 0], color: '#9da2a6' }
  },
  stonewall_hardrock_pillar: {
    name: { en: 'Hardrock Stone Pillar', ua: 'Колона з твердого каменю' },
    category: 'stone',
    recipe: { stone: 5 },
    proxy: { shape: 'box', size: [1, 2, 1], offset: [0, 0, 0], color: '#82878b' }
  },
  stone_arch: {
    name: { en: 'Stone Arch', ua: 'Кам\'яна арка' },
    category: 'stone',
    recipe: { stone: 4 },
    proxy: { shape: 'box', size: [2, 1, 1], offset: [0, 0, 0], color: '#8c9195' }
  },
  stone_stair: {
    name: { en: 'Stone Stairs', ua: 'Кам\'яні сходи' },
    category: 'stone',
    recipe: { stone: 8 },
    proxy: { shape: 'stairs', size: [2, 1, 2], offset: [0, 0.5, 0], color: '#8c9195' }
  },
  stone_fence: {
    name: { en: 'Stone Fence', ua: 'Кам\'яний паркан' },
    category: 'stone',
    recipe: { stone: 4 },
    proxy: { shape: 'box', size: [2, 1, 0.4], offset: [0, 0.5, 0], color: '#94999d' }
  },
  stone_window_big: {
    name: { en: 'Stone Window Big', ua: 'Велике кам\'яне вікно' },
    category: 'stone',
    recipe: { stone: 6 },
    proxy: { shape: 'box', size: [4, 2, 0.4], offset: [0, 0, 0], color: '#888d91' }
  },
  placeable_bigrock_01: {
    name: { en: 'Boulder 1', ua: 'Валун 1' },
    category: 'landscape',
    recipe: { stone: 4 },
    proxy: { shape: 'rock', radius: 0.6, color: '#6e7377' }
  },
  placeable_bigrock_02: {
    name: { en: 'Boulder 2', ua: 'Валун 2' },
    category: 'landscape',
    recipe: { stone: 4 },
    proxy: { shape: 'rock', radius: 0.5, color: '#6e7377' }
  },
  Placeable_Stone: {
    name: { en: 'Decorative Stone', ua: 'Декоративний камінь' },
    category: 'landscape',
    recipe: { stone: 1 },
    proxy: { shape: 'rock', radius: 0.35, color: '#6e7377' }
  },
  Pickable_Stone: {
    name: { en: 'Loose Stone', ua: 'Камінь (земля)' },
    category: 'landscape',
    recipe: { stone: 1 },
    proxy: { shape: 'rock', radius: 0.25, color: '#6e7377' }
  },
  Pickable_Flint: {
    name: { en: 'Flint', ua: 'Кремінь' },
    category: 'landscape',
    recipe: { flint: 1 },
    proxy: { shape: 'rock', radius: 0.2, color: '#7a858c' }
  },
  Rock_4: {
    name: { en: 'Landscape Rock', ua: 'Ландшафтна скеля' },
    category: 'landscape',
    recipe: { stone: 6 },
    proxy: { shape: 'rock', radius: 0.8, color: '#6e7377' }
  },

  // --- Utilities & Furniture ---
  piece_chest_wood: {
    name: { en: 'Wood Chest', ua: 'Дерев\'яна скриня' },
    category: 'furniture',
    recipe: { wood: 10 },
    proxy: { shape: 'box', size: [0.8, 0.6, 0.5], offset: [0, 0.3, 0], color: '#966035' }
  },
  hearth: {
    name: { en: 'Hearth', ua: 'Вогнище (Hearth)' },
    category: 'crafting',
    recipe: { stone: 15 },
    proxy: { shape: 'box', size: [2.5, 0.8, 2.5], offset: [0, 0.4, 0], color: '#615954' }
  },
  smelter: {
    name: { en: 'Smelter', ua: 'Плавильня' },
    category: 'crafting',
    recipe: { stone: 20, surtlingCore: 5 },
    proxy: { shape: 'cylinder', radius: 1.2, height: 3.5, offset: [0, 1.75, 0], color: '#4a4d52' }
  },
  charcoal_kiln: {
    name: { en: 'Charcoal Kiln', ua: 'Вугільна піч' },
    category: 'crafting',
    recipe: { stone: 20, surtlingCore: 5 },
    proxy: { shape: 'cylinder', radius: 1.5, height: 3.2, offset: [0, 1.6, 0], color: '#3d4045' }
  }
};

/**
 * Intelligent Catalog Matcher with modded piece aliasing
 */
export function getPieceInfo(prefabName) {
  if (PREFAB_CATALOG[prefabName]) {
    return PREFAB_CATALOG[prefabName];
  }

  const lower = prefabName.toLowerCase();
  const cleanName = prefabName
    .replace(/^rae_|^piece_|^IG_/, '')
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2');
  
  let category = 'wood';
  let recipe = { wood: 2 };
  let proxy = { shape: 'box', size: [2, 1, 1], color: '#bf8652' };
  let uaName = cleanName;

  if (lower.includes('rock') || lower.includes('boulder')) {
    category = 'landscape';
    recipe = { stone: 4 };
    proxy = { shape: 'rock', radius: 0.5, color: '#6e7377' };
    uaName = `Скеля/Валун (${cleanName})`;
  } else if (lower.includes('stone') || lower.includes('brick') || lower.includes('marble')) {
    category = 'stone';
    recipe = { stone: lower.includes('big') || lower.includes('4x') ? 6 : 2 };
    if (lower.includes('pillar') || lower.includes('column')) {
      proxy = { shape: 'box', size: [1, 2, 1], offset: [0, 0, 0], color: '#9da2a6' };
      uaName = `Кам'яна колона (${cleanName})`;
    } else {
      proxy = { shape: 'box', size: [2, 1, 1], offset: [0, 0, 0], color: '#9da2a6' };
      uaName = `Кам'яний елемент (${cleanName})`;
    }
  } else if (lower.includes('darkwood') || lower.includes('tar') || lower.includes('stave')) {
    category = 'darkwood';
    recipe = { wood: 2, tar: 1 };
    proxy = { shape: 'box', size: [2, 0.3, 0.3], color: '#4d3322' };
    uaName = `Темне дерево (${cleanName})`;
  } else if (lower.includes('iron') || lower.includes('metal') || lower.includes('cage')) {
    category = 'iron';
    recipe = { iron: 1, wood: 2 };
    proxy = { shape: 'box', size: [2, 2, 0.1], offset: [0, 1, 0], color: '#545963' };
    uaName = `Залізний елемент (${cleanName})`;
  } else if (lower.includes('core') || lower.includes('log')) {
    category = 'coreWood';
    recipe = { coreWood: 2 };
    proxy = { shape: 'cylinder', radius: 0.18, height: 2, offset: [0, 1, 0], color: '#73441e' };
    uaName = `Цілісна колода (${cleanName})`;
  } else if (lower.includes('roof')) {
    category = 'wood';
    recipe = { wood: 2 };
    const isRidge = lower.includes('top') || lower.includes('ridge');
    if (isRidge) {
      proxy = { shape: 'ridge45', size: [2, 1, 2], color: '#d4b36a' };
      uaName = `Коник даху (${cleanName})`;
    } else {
      const angle = lower.includes('26') ? 26 : (lower.includes('67') ? 67 : 45);
      proxy = { shape: `roof${angle}`, size: [2, angle === 26 ? 1 : 2, 2], color: '#d4b36a' };
      uaName = `Дах ${angle}° (${cleanName})`;
    }
  } else if (lower.includes('floor')) {
    category = lower.includes('stone') ? 'stone' : 'wood';
    const is1x1 = lower.includes('1x1') || lower.includes('small');
    recipe = category === 'stone' ? { stone: is1x1 ? 2 : 6 } : { wood: is1x1 ? 1 : 2 };
    proxy = { shape: 'box', size: [is1x1 ? 1 : 2, 0.1, is1x1 ? 1 : 2], color: category === 'stone' ? '#888d91' : '#bf8652' };
    uaName = `Підлога (${cleanName})`;
  } else if (lower.includes('beam')) {
    category = 'wood';
    recipe = { wood: 2 };
    const isSloped = lower.includes('26') || lower.includes('45') || lower.includes('67');
    const angle = lower.includes('26') ? 26 : (lower.includes('67') ? 67 : 45);
    proxy = isSloped 
      ? { shape: 'beam_sloped', angle, length: 2.5, offset: [1, 0.5, 0], color: '#a06a38' }
      : { shape: 'beam', size: [2, 0.2, 0.2], offset: [1, 0, 0], color: '#a06a38' };
    uaName = `Балка (${cleanName})`;
  } else if (lower.includes('pole') || lower.includes('pillar')) {
    category = lower.includes('stone') ? 'stone' : 'wood';
    recipe = category === 'stone' ? { stone: 4 } : { wood: 2 };
    proxy = { shape: 'cylinder', radius: category === 'stone' ? 0.4 : 0.15, height: 2, offset: [0, 1, 0], color: category === 'stone' ? '#9da2a6' : '#965e2e' };
    uaName = `Стовп/Колона (${cleanName})`;
  } else if (lower.includes('wall')) {
    category = lower.includes('stone') || lower.includes('brick') ? 'stone' : 'wood';
    recipe = category === 'stone' ? { stone: 4 } : { wood: 2 };
    proxy = { shape: 'box', size: [2, 2, 0.15], offset: [0, 1, 0], color: category === 'stone' ? '#9da2a6' : '#b37746' };
    uaName = `Стіна (${cleanName})`;
  }

  return {
    name: { en: cleanName, ua: uaName },
    category,
    recipe,
    proxy
  };
}

export const MATERIAL_ICONS = {
  wood: '🪵',
  fineWood: '✨',
  coreWood: '🌲',
  ancientBark: '🍂',
  yggdrasilWood: '🌿',
  ashwood: '🔥',
  roundLog: '🪵',
  stone: '🪨',
  grausten: '🧱',
  marble: '🏛️',
  iron: '⛓️',
  copper: '🥉',
  bronze: '🔶',
  silver: '🥈',
  blackMetal: '🛡️',
  flametal: '🌋',
  tar: '⚫',
  resin: '🍯',
  coal: '⬛',
  leatherScraps: '📜',
  deerHide: '🦌',
  wolfPelt: '🐺',
  surtlingCore: '🔥',
  flint: '💎',
  ironNails: '🔩',
  bronzeNails: '📌',
  feathers: '🪶',
  chain: '⛓️'
};

export const CATEGORY_NAMES = {
  wood: { en: 'Wood', ua: 'Дерево' },
  stone: { en: 'Stone', ua: 'Камінь' },
  corewood: { en: 'Core Wood', ua: 'Цілісна деревина' },
  darkwood: { en: 'Darkwood', ua: 'Темне дерево' },
  iron: { en: 'Iron', ua: 'Залізо' },
  furniture: { en: 'Furniture', ua: 'Меблі' },
  crafting: { en: 'Crafting', ua: 'Верстати' },
  misc: { en: 'Misc', ua: 'Різне' }
};
