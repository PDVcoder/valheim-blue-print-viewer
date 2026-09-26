/**
 * Valheim Blueprint Parser (PlanBuild Specification)
 * Parses .blueprint text files, extracts metadata and piece transforms,
 * and performs coordinate conversions from Unity (Left-Handed) to Three.js (Right-Handed).
 */

export class BlueprintParser {
  /**
   * Parse raw text of a .blueprint file
   * @param {string} rawText 
   * @returns {BlueprintData}
   */
  static parse(rawText) {
    if (!rawText || typeof rawText !== 'string') {
      throw new Error('Empty or invalid blueprint content');
    }

    const lines = rawText.split(/\r?\n/);
    const metadata = {
      name: 'Untitled Blueprint',
      creator: 'Unknown',
      description: '',
      category: 'Blueprints',
      totalPieces: 0
    };

    const pieces = [];
    let inPiecesSection = false;

    // Track bounding box in Three.js coordinates
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    const prefabCounts = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (!inPiecesSection) {
        if (line.startsWith('#Name:')) {
          metadata.name = line.substring(6).trim() || metadata.name;
        } else if (line.startsWith('#Creator:')) {
          metadata.creator = line.substring(9).trim() || metadata.creator;
        } else if (line.startsWith('#Description:')) {
          let desc = line.substring(13).trim();
          if (desc.startsWith('"') && desc.endsWith('"')) {
            desc = desc.substring(1, desc.length - 1);
          }
          metadata.description = desc;
        } else if (line.startsWith('#Category:')) {
          metadata.category = line.substring(10).trim() || metadata.category;
        } else if (line === '#Pieces' || line.startsWith('#Pieces')) {
          inPiecesSection = true;
        }
        continue;
      }

      // We are in the #Pieces section
      // Line format:
      // <PrefabName>;<Category>;<PosX>;<PosY>;<PosZ>;<RotX>;<RotY>;<RotZ>;<RotW>;<ExtraData>;<ScaleX>;<ScaleY>;<ScaleZ>
      const parts = line.split(';');
      if (parts.length < 9) continue;

      const prefab = parts[0].trim();
      const category = parts[1].trim();
      
      const ux = parseFloat(parts[2]) || 0;
      const uy = parseFloat(parts[3]) || 0;
      const uz = parseFloat(parts[4]) || 0;

      const qx = parseFloat(parts[5]) || 0;
      const qy = parseFloat(parts[6]) || 0;
      const qz = parseFloat(parts[7]) || 0;
      const qw = parseFloat(parts[8]) || 1;

      const extraData = parts[9] !== undefined ? parts[9].trim() : '';

      // Scale defaults to (1, 1, 1)
      const sx = parts[10] !== undefined ? (parseFloat(parts[10]) || 1) : 1;
      const sy = parts[11] !== undefined ? (parseFloat(parts[11]) || 1) : 1;
      const sz = parts[12] !== undefined ? (parseFloat(parts[12]) || 1) : 1;

      // Coordinate System Transformation:
      // Unity Left-Handed -> Three.js Right-Handed
      // X_three = X_unity
      // Y_three = Y_unity
      // Z_three = -Z_unity
      const posX = ux;
      const posY = uy;
      const posZ = -uz;

      // Quaternion Transformation:
      // Convert Unity Left-Handed to Three.js Right-Handed:
      // Exact reflection across Z: (-qx, -qy, qz, qw)
      const rotX = -qx;
      const rotY = -qy;
      const rotZ = qz;
      const rotW = qw;

      // Update bounding limits
      if (posX < minX) minX = posX;
      if (posX > maxX) maxX = posX;
      if (posY < minY) minY = posY;
      if (posY > maxY) maxY = posY;
      if (posZ < minZ) minZ = posZ;
      if (posZ > maxZ) maxZ = posZ;

      prefabCounts[prefab] = (prefabCounts[prefab] || 0) + 1;

      pieces.push({
        id: pieces.length,
        prefab,
        category,
        unityPos: { x: ux, y: uy, z: uz },
        pos: { x: posX, y: posY, z: posZ },
        rot: { x: rotX, y: rotY, z: rotZ, w: rotW },
        scale: { x: sx, y: sy, z: sz },
        extraData
      });
    }

    if (pieces.length === 0) {
      throw new Error('No valid building pieces found in blueprint');
    }

    metadata.totalPieces = pieces.length;

    const bounds = {
      min: { x: minX, y: minY, z: minZ },
      max: { x: maxX, y: maxY, z: maxZ },
      size: {
        x: Math.round((maxX - minX) * 100) / 100,
        y: Math.round((maxY - minY) * 100) / 100,
        z: Math.round((maxZ - minZ) * 100) / 100
      },
      center: {
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2,
        z: (minZ + maxZ) / 2
      }
    };

    return {
      metadata,
      bounds,
      pieces,
      prefabCounts
    };
  }
}
