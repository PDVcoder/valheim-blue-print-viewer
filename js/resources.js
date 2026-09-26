/**
 * Valheim Resource & Logistics Calculator
 * Aggregates crafting material requirements, stack counts, and chest storage logistics.
 */

import { VALHEIM_MATERIALS, getPieceInfo } from './catalog.js';
import { t, getLanguage } from './i18n.js';

export class ResourceCalculator {
  /**
   * Calculate total materials required for a list of blueprint pieces
   * @param {Array} pieces 
   * @returns {Object}
   */
  static calculate(pieces) {
    const rawTotals = {};
    const categoryTotals = {};
    let totalPieceCount = pieces.length;

    for (const piece of pieces) {
      const info = getPieceInfo(piece.prefab);
      const recipe = info.recipe || {};
      const category = info.category || 'misc';

      categoryTotals[category] = (categoryTotals[category] || 0) + 1;

      for (const [matId, amount] of Object.entries(recipe)) {
        rawTotals[matId] = (rawTotals[matId] || 0) + amount;
      }
    }

    // Calculate stacks and slots
    let totalSlots = 0;
    const materialsList = [];

    for (const [matId, count] of Object.entries(rawTotals)) {
      const matDef = VALHEIM_MATERIALS[matId] || {
        id: matId,
        en: matId,
        ua: matId,
        stackSize: 50,
        color: '#888888'
      };

      const stackSize = matDef.stackSize || 50;
      const stacks = Math.ceil(count / stackSize);
      totalSlots += stacks;

      materialsList.push({
        id: matId,
        nameEn: matDef.en,
        nameUa: matDef.ua,
        count,
        stackSize,
        stacks,
        color: matDef.color
      });
    }

    // Sort materials with largest count first
    materialsList.sort((a, b) => b.count - a.count);

    // Calculate chests required
    const chests = {
      woodChests: Math.ceil(totalSlots / 10),
      reinforcedChests: Math.ceil(totalSlots / 24),
      blackmetalChests: Math.ceil(totalSlots / 32)
    };

    return {
      totalPieceCount,
      totalSlots,
      materials: materialsList,
      categoryTotals,
      chests
    };
  }

  /**
   * Format materials list as text for copying to clipboard
   * @param {Array} materials 
   * @param {Object} chests 
   * @returns {string}
   */
  static formatForClipboard(materials, chests) {
    const lang = getLanguage();
    const isUa = lang === 'ua';

    let text = isUa 
      ? `=== Valheim Відомість Матеріалів ===\n\n`
      : `=== Valheim Bill of Materials ===\n\n`;

    for (const m of materials) {
      const name = isUa ? m.nameUa : m.nameEn;
      const stackText = isUa ? `(${m.stacks} стаків)` : `(${m.stacks} stacks)`;
      text += `• ${name}: ${m.count} ${stackText}\n`;
    }

    text += isUa
      ? `\n--- Необхідно скринь для зберігання ---\n`
      : `\n--- Storage Logistics Required ---\n`;
    text += isUa
      ? `• Дерев'яні скрині (10 слотів): ${chests.woodChests}\n` +
        `• Укріплені скрині (24 слоти): ${chests.reinforcedChests}\n`
      : `• Wood Chests (10 slots): ${chests.woodChests}\n` +
        `• Reinforced Chests (24 slots): ${chests.reinforcedChests}\n`;

    return text;
  }
}
