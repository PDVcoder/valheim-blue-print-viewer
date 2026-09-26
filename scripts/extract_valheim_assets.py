#!/usr/bin/env python3
"""
Valheim Game Asset Extraction Pipeline (Unity to WebGL / glTF)
Extracts authentic 3D meshes, hierarchy transforms, materials, and diffuse textures
from Valheim's Unity game data and exports web-optimized, self-contained glTF 2.0 Binary (.glb) models.

STRICT SAFETY GUARANTEE:
Original game directory is strictly READ-ONLY. Files are opened with 'rb' mode only.
All extracted assets, models, and presets are saved directly into the project workspace.
"""

import os
import sys
import io
import re
import json
import argparse
from pathlib import Path

try:
    import UnityPy
    import trimesh
    import numpy as np
    import PIL.Image
    from trimesh.transformations import quaternion_matrix, translation_matrix, concatenate_matrices
except ImportError as e:
    print(f"Missing required extraction dependency: {e}")
    print("Please install requirements: pip install -r scripts/requirements.txt")
    sys.exit(1)


DEFAULT_GAME_DIR = r"D:\SteamLibrary\steamapps\common\Valheim"
DEFAULT_MODELS_OUT = os.path.join("assets", "models")
DEFAULT_TEXTURES_OUT = os.path.join("assets", "textures")
DEFAULT_PRESETS_OUT = "presets"


def parse_args():
    parser = argparse.ArgumentParser(description="Valheim 3D Asset & Texture Extractor")
    parser.add_argument("--game-dir", default=DEFAULT_GAME_DIR, help="Path to Valheim game directory (Read-Only)")
    parser.add_argument("--models-dir", default=DEFAULT_MODELS_OUT, help="Output directory for .glb models")
    parser.add_argument("--textures-dir", default=DEFAULT_TEXTURES_OUT, help="Output directory for textures")
    parser.add_argument("--presets-dir", default=DEFAULT_PRESETS_OUT, help="Output directory for preset mappings")
    parser.add_argument("--limit", type=int, default=0, help="Maximum pieces to extract (0 = all)")
    parser.add_argument("--bundle", default="c4210710", help="Specific bundle hash to extract from")
    return parser.parse_args()


def extract_assets(args):
    game_data_dir = os.path.join(args.game_dir, "valheim_Data")
    if not os.path.exists(game_data_dir):
        print(f"Error: valheim_Data directory not found at {game_data_dir}")
        return False

    softref_dir = os.path.join(game_data_dir, "StreamingAssets", "SoftRef")
    bundles_dir = os.path.join(softref_dir, "Bundles")

    os.makedirs(args.models_dir, exist_ok=True)
    os.makedirs(args.textures_dir, exist_ok=True)
    os.makedirs(args.presets_dir, exist_ok=True)

    print("=" * 65)
    print("Valheim Game Asset Extraction Pipeline (Meshes + Authentic Textures)")
    print(f"Source Game Dir (READ-ONLY): {args.game_dir}")
    print(f"Models Output: {args.models_dir}")
    print(f"Textures Output: {args.textures_dir}")
    print(f"Presets Output: {args.presets_dir}")
    print("=" * 65)

    # 1. Parse manifest_extended (Read-Only) to find all piece prefabs
    manifest_file = os.path.join(softref_dir, "manifest_extended")
    piece_prefabs = set()

    if os.path.exists(manifest_file):
        print(f"Reading SoftRef manifest (read-only): {manifest_file}")
        with open(manifest_file, "r", encoding="utf-8-sig", errors="ignore") as f:
            content = f.read()

        matches = re.findall(r"Assets/GameElements/Pieces/([^\r\n/]+)\.prefab", content)
        piece_prefabs = set(matches)
        print(f"Identified {len(piece_prefabs)} official Valheim piece prefabs in manifest.")

    # Also include essential building prefabs that might be in props or crafting
    extra_prefabs = {
        'hearth', 'smelter', 'charcoal_kiln', 'forge', 'fire_pit',
        'piece_workbench', 'piece_chest_wood', 'piece_chest_barrel', 'piece_chest_blackmetal',
        'woodwall', 'wood_wall_half', 'wood_wall_log', 'wood_wall_quarter', 'wood_wall_roof',
        'wood_wall_roof_45', 'wood_wall_roof_45_upsidedown', 'wood_wall_roof_67_a',
        'wood_wall_roof_a', 'wood_wall_roof_top', 'wood_wall_roof_top_45', 'wood_wall_roof_upsidedown',
        'wood_floor', 'wood_floor_1x1', 'wood_roof', 'wood_roof_45', 'wood_roof_67',
        'wood_roof_top', 'wood_roof_top_45', 'wood_beam', 'wood_beam_1', 'wood_beam_26',
        'wood_beam_45', 'wood_beam_67', 'wood_pole', 'wood_pole2', 'wood_pole_log',
        'wood_stair', 'wood_stepladder', 'wood_door', 'wood_gate',
        'darkwood_roof', 'darkwood_roof_45', 'darkwood_roof_67', 'darkwood_roof_top',
        'darkwood_roof_top_45', 'darkwood_roof_icorner', 'darkwood_roof_icorner_45',
        'darkwood_roof_icorner_67', 'darkwood_roof_ocorner', 'darkwood_roof_ocorner_45',
        'darkwood_roof_ocorner_67', 'darkwood_beam', 'darkwood_beam_67', 'darkwood_decowall',
        'stone_wall_1x1', 'stone_wall_2x1', 'stone_wall_4x2', 'stone_floor_2x2',
        'stone_pillar', 'stone_stair', 'stone_fence', 'woodiron_beam', 'woodiron_beam_45',
        'woodiron_pole'
    }
    all_target_prefabs = piece_prefabs.union(extra_prefabs)

    bundle_path = os.path.join(bundles_dir, args.bundle)
    if not os.path.exists(bundle_path):
        print(f"Bundle {args.bundle} not found at {bundle_path}")
        return False

    print(f"Loading bundle: {args.bundle} (read-only binary mode)...")
    with open(bundle_path, "rb") as f:
        env = UnityPy.load(f)

    # 2. Extract and cache all diffuse textures into memory
    print("Caching bundle textures...")
    tex_cache = {}
    for obj in env.objects:
        if obj.type.name == "Texture2D":
            try:
                t = obj.read()
                tname = getattr(t, "m_Name", "")
                if tname and hasattr(t, "image"):
                    tex_cache[tname] = t.image
                    # Save key textures to disk as well
                    if any(k in tname.lower() for k in ['wood', 'roof', 'thatch', 'straw', 'stone', 'beam', 'chest', 'plank']):
                        tex_file = os.path.join(args.textures_dir, f"{tname}.png")
                        if not os.path.exists(tex_file):
                            try:
                                t.image.save(tex_file)
                            except Exception: pass
            except Exception: pass
    print(f"Cached {len(tex_cache)} authentic textures.")

    # 3. Find and extract piece GameObjects
    extracted_count = 0
    exported_prefabs = {}

    for obj in env.objects:
        if args.limit > 0 and extracted_count >= args.limit:
            break

        if obj.type.name == "GameObject":
            try:
                data = obj.read()
                name = getattr(data, "m_Name", "")
                if not name or name not in all_target_prefabs:
                    continue

                root_t = getattr(data, "m_Transform", None)
                if not root_t:
                    continue
                root_trans = root_t.read()

                # Verify this is a root GameObject (prefab definition)
                father = getattr(root_trans, "m_Father", None)
                if father and getattr(father, "path_id", 0) != 0:
                    continue

                # Collect submeshes with local hierarchy transforms
                meshes = []

                def walk(trans, parent_mat):
                    cgo = trans.m_GameObject.read()
                    cname = cgo.m_Name.lower()
                    # Skip non-mesh helpers and preview geometry
                    if any(k in cname for k in ['snow', 'collider', 'lod', 'broken', 'worn', 'hud', 'wet', '_combined', 'destruction']):
                        return

                    pos = [trans.m_LocalPosition.x, trans.m_LocalPosition.y, trans.m_LocalPosition.z]
                    q = [trans.m_LocalRotation.w, trans.m_LocalRotation.x, trans.m_LocalRotation.y, trans.m_LocalRotation.z]
                    scale = [trans.m_LocalScale.x, trans.m_LocalScale.y, trans.m_LocalScale.z]
                    local_mat = concatenate_matrices(translation_matrix(pos), quaternion_matrix(q), np.diag([*scale, 1.0]))
                    cur_mat = concatenate_matrices(parent_mat, local_mat)

                    for comp in cgo.m_Components:
                        try:
                            c = comp.read()
                            if hasattr(c, 'm_Mesh') and c.m_Mesh:
                                m = c.m_Mesh.read()
                                mname = getattr(m, 'm_Name', '').lower()
                                if not any(k in mname for k in ['snow', 'broken', 'worn', 'lod', 'collider']):
                                    obj_str = m.export(format='obj')
                                    if obj_str and len(obj_str.strip()) > 50:
                                        tm = trimesh.load(io.StringIO(obj_str), file_type='obj')
                                        tm.apply_transform(cur_mat)

                                        # Find MainTex from material
                                        tex_img = None
                                        if hasattr(c, 'm_Materials'):
                                            for mr in c.m_Materials:
                                                mat_obj = mr.read()
                                                for prop, tr in getattr(mat_obj, 'm_SavedProperties', None).m_TexEnvs:
                                                    if prop == '_MainTex' and tr.m_Texture:
                                                        tname = tr.m_Texture.read().m_Name
                                                        if tname in tex_cache:
                                                            tex_img = tex_cache[tname]
                                                            break
                                                if tex_img:
                                                    break

                                        if tex_img:
                                            pbr_mat = trimesh.visual.material.PBRMaterial(
                                                baseColorTexture=tex_img,
                                                roughnessFactor=0.65,
                                                metallicFactor=0.05
                                            )
                                            tm.visual = trimesh.visual.TextureVisuals(uv=tm.visual.uv, material=pbr_mat)
                                        meshes.append(tm)
                        except Exception: pass

                    for cr in trans.m_Children:
                        walk(cr.read(), cur_mat)

                # Prioritize 'New', 'new', 'model' child containers if available
                has_new_container = False
                for cr in root_trans.m_Children:
                    ct = cr.read()
                    cname = ct.m_GameObject.read().m_Name
                    if cname in ['New', 'new', 'model']:
                        has_new_container = True
                        walk(ct, np.eye(4))

                if not has_new_container:
                    for cr in root_trans.m_Children:
                        walk(cr.read(), np.eye(4))

                if not meshes:
                    continue

                # Concatenate submeshes and export textured .glb
                comb = trimesh.util.concatenate(meshes) if len(meshes) > 1 else meshes[0]
                glb_filename = f"{name}.glb"
                glb_path = os.path.join(args.models_dir, glb_filename)

                glb_data = comb.export(file_type='glb')
                with open(glb_path, 'wb') as out_f:
                    out_f.write(glb_data)

                extracted_count += 1
                exported_prefabs[name] = glb_filename
                print(f"[{extracted_count}] Exported: {name} -> {glb_path} ({len(glb_data)} bytes, {len(meshes)} submeshes)")

            except Exception as ex:
                pass

    print("-" * 65)
    print(f"Extraction completed! Successfully extracted {extracted_count} authentic models into {args.models_dir}")

    exported_preset_path = os.path.join(args.presets_dir, "extracted_models.json")
    with open(exported_preset_path, "w", encoding="utf-8") as out:
        json.dump(exported_prefabs, out, indent=2)
    print(f"Saved extracted inventory to {exported_preset_path}")
    return True


if __name__ == "__main__":
    cli_args = parse_args()
    extract_assets(cli_args)
