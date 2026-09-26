/**
 * Valheim Blueprint Viewer & Lego Guide - Internationalization (i18n) Module
 * Supports English (en) and Ukrainian (ua) with instant switching and persistence.
 */

export const translations = {
  en: {
    // App Header & Branding
    appTitle: "Valheim Blueprint & Lego Viewer",
    appSubtitle: "3D Visualizer, Resource Calculator & Step-by-Step Construction Guide",
    loadBlueprint: "Load Blueprint",
    dragDropPrompt: "Drop .blueprint here or click to browse",
    selectSample: "Choose Sample Blueprint...",
    sample1: "Mountain FOB v2 (Sheepshank - 1,763 pieces)",
    sample2: "Sweet House (TeSt - 1,032 pieces)",
    modeCAD: "Schematic CAD",
    modeGame: "In-Game 3D",
    modeCADDesc: "Lightweight procedural proxies with clean blueprint lines",
    modeGameDesc: "Authentic in-game 3D models with PBR textures",
    texturesOn: "Textures: ON",
    texturesOff: "Textures: OFF",
    
    // Viewport Controls & HUD
    resetCamera: "Reset Camera",
    viewPerspective: "Perspective",
    viewTop: "Top (Plan)",
    viewFront: "Front",
    viewSide: "Side",
    viewIso: "Isometric",
    toggleEdges: "Edge Outlines",
    toggleWireframe: "Wireframe",
    toggleGrid: "Ground Grid",
    explodeView: "Exploded View",
    focusAll: "Focus Structure",
    fps: "FPS",
    drawCalls: "Draw Calls",
    triangles: "Triangles",
    piecesCount: "Pieces",
    dimensions: "Dimensions",
    
    // Sidebar Tabs
    tabLego: "Lego Guide",
    tabResources: "Resources",
    tabPieces: "Piece Catalog",
    tabSettings: "Settings",

    // Lego Guide Tab
    legoHeader: "Assembly Instructions",
    legoSubheader: "Build layer-by-layer like a real Lego manual",
    stepLabel: "Step {current} of {total}",
    stepStage: "Stage: {stage}",
    stageFoundation: "1. Foundations & Ground Anchors",
    stageGroundDeck: "2. Ground Floor Decking & Beams",
    stageLowerWalls: "3. Lower Walls, Columns & Portals",
    stageMidFloor: "4. Intermediate Floor & Stairs",
    stageUpperWalls: "5. Upper Tier Walls & Trusses",
    stageRoofing: "6. Roof Framing & Shingles",
    stageGablesChimneys: "7. Gables, Crests & Chimneys",
    stageInteriorDecor: "8. Interior, Furniture & Crafting",
    stageAll: "Full Blueprint Overview",
    allPiecesVisible: "All {count} pieces displayed in 3D",
    partsForThisStep: "Parts for this step ({count})",
    stepCost: "Step Crafting Cost",
    stepMode: "Display Mode",
    modeAll: "Full View",
    modeGhost: "Ghost (Transparent Completed)",
    modeSolid: "Solid (Natural Completed)",
    modeIsolate: "Isolate (Current Step Only)",
    btnPrev: "Previous",
    btnNext: "Next",
    btnPlay: "Auto-Build",
    btnPause: "Pause",
    btnRestart: "From Start",
    speed: "Speed",
    layerHeight: "Layer Thickness",
    progress: "Progress",
    placementInfo: "Placement & Coordinates",
    placementElevation: "Elevation Range",
    placementCenter: "Placement Center",
    placementFootprint: "Footprint Bounds",
    layerNumber: "Layer #{layer} of {total}",
    stepMaterials: "Step Materials Required",
    itemsToPlace: "Pieces to Place",
    focusStep: "Focus 3D View",
    isolateStep: "Isolate Step",
    costPerPiece: "{cost} each",
    stepPiecesCount: "{count} pieces",
    placementTip: "Assembly Sequence",
    totalStepCost: "Total Step Materials",
    noMaterialsNeeded: "No materials needed (free placement)",

    // Resources Tab
    resHeader: "Bill of Materials",
    resSubheader: "Aggregated crafting cost and logistical requirements",
    totalMaterials: "Total Materials Required",
    stacksLogistics: "Logistics & Storage Footprint",
    fullStacks: "Full Inventory Stacks",
    stackSizeInfo: "Standard stack sizes: Wood/Stone (50), Tar (20), Iron/Metals (30)",
    woodChests: "Wood Chests (10 slots)",
    reinforcedChests: "Reinforced Chests (24 slots)",
    blackmetalChests: "Blackmetal Chests (32 slots)",
    copyResourceList: "Copy Materials List",
    copiedNotice: "Materials list copied to clipboard!",
    filterCategory: "Filter Category",
    allCategories: "All Categories",
    catWood: "Wood Construction",
    catStone: "Stone Masonry",
    catDarkwood: "Darkwood & Tar",
    catIron: "Iron & Metals",
    catFurniture: "Furniture & Comfort",
    catCrafting: "Crafting Stations",
    catMisc: "Decor & Landscape",

    // Piece Catalog Tab
    catalogHeader: "Pieces Breakdown",
    searchPieces: "Search piece name or prefab...",
    filterByStep: "Filter by step",
    visibility: "Visibility",
    highlightIn3D: "Click to highlight in 3D",
    countInstances: "instances",

    // Resource Names
    res_wood: "Wood",
    res_fineWood: "Fine Wood",
    res_coreWood: "Core Wood",
    res_ancientBark: "Ancient Bark",
    res_yggdrasilWood: "Yggdrasil Wood",
    res_ashwood: "Ashwood",
    res_roundLog: "Round Log",
    res_stone: "Stone",
    res_grausten: "Grausten",
    res_marble: "Black Marble",
    res_iron: "Iron",
    res_copper: "Copper",
    res_bronze: "Bronze",
    res_silver: "Silver",
    res_blackMetal: "Black Metal",
    res_flametal: "Flametal",
    res_tar: "Tar",
    res_resin: "Resin",
    res_coal: "Coal",
    res_leatherScraps: "Leather Scraps",
    res_deerHide: "Deer Hide",
    res_wolfPelt: "Wolf Pelt",
    res_loxPelt: "Lox Pelt",
    res_feathers: "Feathers",
    res_surtlingCore: "Surtling Core",
    res_crystal: "Crystal",
    res_ironNails: "Iron Nails",
    res_bronzeNails: "Bronze Nails",
    res_chain: "Chain",
    res_dandelion: "Dandelion",
    res_flint: "Flint",
    res_greydwarfEye: "Greydwarf Eye",
    res_guck: "Guck",
    res_boneFragments: "Bone Fragments",
    res_undiscovered: "Unlisted Material",

    // Metadata details
    blueprintInfo: "Blueprint Details",
    author: "Creator",
    totalPieces: "Total Pieces",
    categoriesCount: "Categories",
    unknownAuthor: "Anonymous Builder",
    untitledBlueprint: "Untitled Blueprint",

    // Dialogs & Messages
    loadingBlueprint: "Parsing blueprint & generating 3D geometry...",
    extractNotice: "Authentic In-Game Mode loads official extracted .glb assets. Any missing prefab seamlessly uses schematic proxy.",
    noPiecesFound: "No building pieces found in blueprint file.",
    invalidBlueprint: "Invalid blueprint format. PlanBuild header '#Pieces' expected."
  },

  ua: {
    // App Header & Branding
    appTitle: "Valheim Blueprint & Lego Переглядач",
    appSubtitle: "3D Візуалізатор, Калькулятор Ресурсів та Покрокова Інструкція Будівництва",
    loadBlueprint: "Завантажити креслення",
    dragDropPrompt: "Перетягніть .blueprint файл сюди або натисніть для огляду",
    selectSample: "Виберіть зразок креслення...",
    sample1: "Гірська база FOB v2 (Sheepshank - 1 763 деталі)",
    sample2: "Милий будинок (TeSt - 1 032 деталі)",
    modeCAD: "Схематичний CAD",
    modeGame: "Ігровий 3D",
    modeCADDesc: "Легкі геометричні проксі з чіткими контурами креслення",
    modeGameDesc: "Автентичні 3D-моделі з гри з PBR текстурами",
    texturesOn: "Текстури: УВІМК",
    texturesOff: "Текстури: ВИМК",

    // Viewport Controls & HUD
    resetCamera: "Скинути камеру",
    viewPerspective: "Перспектива",
    viewTop: "Зверху (План)",
    viewFront: "Спереду",
    viewSide: "Збоку",
    viewIso: "Ізометрія",
    toggleEdges: "Контури граней",
    toggleWireframe: "Каркасна сітка",
    toggleGrid: "Сітка землі",
    explodeView: "Вибухова схема",
    focusAll: "Центрувати споруду",
    fps: "FPS",
    drawCalls: "Виклики малювання",
    triangles: "Трикутники",
    piecesCount: "Деталей",
    dimensions: "Габарити",

    // Sidebar Tabs
    tabLego: "Lego Інструкція",
    tabResources: "Ресурси",
    tabPieces: "Каталог деталей",
    tabSettings: "Налаштування",

    // Lego Guide Tab
    legoHeader: "Інструкція зі збирання",
    legoSubheader: "Будуйте пошарово, немов за справжнім посібником Lego",
    stepLabel: "Крок {current} з {total}",
    stepStage: "Етап: {stage}",
    stageFoundation: "1. Фундамент та анкери в ґрунт",
    stageGroundDeck: "2. Настил та балки першого поверху",
    stageLowerWalls: "3. Нижні стіни, колони та дверні отвори",
    stageMidFloor: "4. Міжповерхове перекриття та сходи",
    stageUpperWalls: "5. Стіни верхнього ярусу та ферми",
    stageRoofing: "6. Крокви та покриття даху",
    stageGablesChimneys: "7. Фронтони, коники та димоходи",
    stageInteriorDecor: "8. Інтер'єр, меблі та верстати",
    stageAll: "Повний огляд споруди",
    allPiecesVisible: "Всі {count} деталей відображено в 3D",
    partsForThisStep: "Деталі для цього кроку ({count})",
    stepCost: "Вартість кроку",
    stepMode: "Режим показу",
    modeAll: "Вся споруда",
    modeGhost: "Привид (напівпрозорі попередні)",
    modeSolid: "Суцільний (природний вигляд попередніх)",
    modeIsolate: "Ізоляція (лише поточний крок)",
    btnPrev: "Назад",
    btnNext: "Вперед",
    btnPlay: "Автобудівництво",
    btnPause: "Пауза",
    btnFinish: "Показати все",
    speed: "Швидкість",
    layerHeight: "Товщина шару",
    progress: "Прогрес",
    placementInfo: "Розташування та координати",
    placementElevation: "Діапазон висоти",
    placementCenter: "Центр розміщення",
    placementFootprint: "Габарити шару",
    layerNumber: "Шар #{layer} з {total}",
    stepMaterials: "Матеріали для цього кроку",
    itemsToPlace: "Деталі для встановлення",
    focusStep: "Фокус на кроці",
    isolateStep: "Ізолювати крок",
    costPerPiece: "{cost} за шт.",
    stepPiecesCount: "{count} деталей",
    placementTip: "Послідовність збирання",
    totalStepCost: "Матеріали для кроку",
    noMaterialsNeeded: "Безкоштовне розміщення (ресурси не потрібні)",

    // Resources Tab
    resHeader: "Відомість матеріалів",
    resSubheader: "Загальні витрати на крафт та логістичний розрахунок",
    totalMaterials: "Всього необхідних матеріалів",
    stacksLogistics: "Логістика та зберігання",
    fullStacks: "Повних стаків в інвентарі",
    stackSizeInfo: "Стандартні стаки: Дерево/Камінь (50), Смола (20), Залізо/Метали (30)",
    woodChests: "Дерев'яні скрині (10 слотів)",
    reinforcedChests: "Укріплені скрині (24 слоти)",
    blackmetalChests: "Скрині з чорного металу (32 слоти)",
    copyResourceList: "Скопіювати список матеріалів",
    copiedNotice: "Список матеріалів скопійовано в буфер обміну!",
    filterCategory: "Фільтр за категорією",
    allCategories: "Всі категорії",
    catWood: "Дерев'яні конструкції",
    catStone: "Кам'яна кладка",
    catDarkwood: "Темне дерево та смола",
    catIron: "Залізо та метали",
    catFurniture: "Меблі та комфорт",
    catCrafting: "Верстати та ковальні",
    catMisc: "Декор та ландшафт",

    // Piece Catalog Tab
    catalogHeader: "Перелік деталей",
    searchPieces: "Пошук деталі чи префабу...",
    filterByStep: "Фільтр за кроком",
    visibility: "Видимість",
    highlightIn3D: "Натисніть для підсвічування в 3D",
    countInstances: "шт.",

    // Resource Names
    res_wood: "Деревина",
    res_fineWood: "Якісна деревина",
    res_coreWood: "Цілісна деревина",
    res_ancientBark: "Стародавня кора",
    res_yggdrasilWood: "Деревина Іґґдрасіля",
    res_ashwood: "Попеляста деревина",
    res_roundLog: "Кругляк",
    res_stone: "Камінь",
    res_grausten: "Грауштен",
    res_marble: "Чорний мармур",
    res_iron: "Залізо",
    res_copper: "Мідь",
    res_bronze: "Бронза",
    res_silver: "Срібло",
    res_blackMetal: "Чорний метал",
    res_flametal: "Вогнеметал",
    res_tar: "Смола",
    res_resin: "Живиця",
    res_coal: "Вугілля",
    res_leatherScraps: "Шматочки шкіри",
    res_deerHide: "Шкура оленя",
    res_wolfPelt: "Вовча шкура",
    res_loxPelt: "Шкура локса",
    res_feathers: "Пір'я",
    res_surtlingCore: "Ядро сюртлінга",
    res_crystal: "Кристал",
    res_ironNails: "Залізні цвяхи",
    res_bronzeNails: "Бронзові цвяхи",
    res_chain: "Ланцюг",
    res_dandelion: "Кульбаба",
    res_flint: "Кремінь",
    res_greydwarfEye: "Око сірогнома",
    res_guck: "Ґук",
    res_boneFragments: "Уламки кісток",
    res_undiscovered: "Невідомий матеріал",

    // Metadata details
    blueprintInfo: "Інформація про креслення",
    author: "Автор",
    totalPieces: "Всього деталей",
    categoriesCount: "Категорій",
    unknownAuthor: "Невідомий будівничий",
    untitledBlueprint: "Без назви",

    // Dialogs & Messages
    loadingBlueprint: "Аналіз креслення та створення 3D геометрії...",
    extractNotice: "Ігровий 3D режим завантажує вилучені з гри .glb моделі. Якщо модель відсутня, відображається точний CAD-проксі.",
    noPiecesFound: "У файлі креслення не знайдено будівельних деталей.",
    invalidBlueprint: "Неправильний формат креслення. Очікувався заголовок PlanBuild '#Pieces'."
  }
};

let currentLang = 'en';

// Initialize language from localStorage or browser preferences
export function initI18n() {
  const saved = localStorage.getItem('valheim_bp_lang');
  if (saved && (saved === 'en' || saved === 'ua')) {
    currentLang = saved;
  } else {
    const navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    if (navLang.startsWith('uk') || navLang.startsWith('ua')) {
      currentLang = 'ua';
    } else {
      currentLang = 'en';
    }
  }
  applyTranslations();
  return currentLang;
}

export function getLanguage() {
  return currentLang;
}

export function setLanguage(lang) {
  if (lang !== 'en' && lang !== 'ua') return;
  currentLang = lang;
  localStorage.setItem('valheim_bp_lang', lang);
  applyTranslations();
  window.dispatchEvent(new CustomEvent('langChanged', { detail: { lang } }));
}

/**
 * Translate string by key with optional string interpolation parameters
 * Example: t('stepLabel', { current: 3, total: 10 })
 */
export function t(key, params = {}) {
  const dict = translations[currentLang] || translations.en;
  let text = dict[key] || translations.en[key] || key;
  for (const [k, v] of Object.entries(params)) {
    text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
  }
  return text;
}

/**
 * Update all elements in the DOM with data-i18n attributes
 */
export function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    el.setAttribute('title', t(key));
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.setAttribute('placeholder', t(key));
  });
}
