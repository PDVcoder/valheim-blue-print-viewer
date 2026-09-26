import trimesh
import PIL.Image
import os

fixes = {
    'stone_pillar.glb': {'tex': 'stoneblock_d.png', 'shift_y': 0.5},
    'stone_wall_1x1.glb': {'tex': 'stoneblock_d.png', 'shift_y': 0.0},
    'stone_wall_2x1.glb': {'tex': 'stoneblock_d.png', 'shift_y': 0.0},
    'stone_wall_4x2.glb': {'tex': 'stonewall.png', 'shift_y': 0.0},
    'stone_arch.glb': {'tex': 'stoneblock_d.png', 'shift_y': 0.0},
    'stone_floor_2x2.glb': {'tex': 'stonefloor_2x2_d.png', 'shift_y': 0.0},
    'stone_floor.glb': {'tex': 'stonefloor_d.png', 'shift_y': 0.0},
    'stone_fence.glb': {'tex': 'stonefence_d.png', 'shift_y': 0.0},
    'stone_stair.glb': {'tex': 'stoneblock_d.png', 'shift_y': 0.0},
    'Piece_grausten_window_4x2.glb': {'tex': 'stonewall.png', 'shift_y': -1.0},
    'Piece_grausten_window_2x2.glb': {'tex': 'stonewall.png', 'shift_y': -1.0},
    'placeable_bigrock_01.glb': {'tex': 'stone.png', 'shift_y': 0.0},
    'placeable_bigrock_02.glb': {'tex': 'stone.png', 'shift_y': 0.0}
}

for glb_name, cfg in fixes.items():
    path = os.path.join('assets', 'models', glb_name)
    if not os.path.exists(path):
        print(f"Skipping missing {path}")
        continue
    tex_path = os.path.join('assets', 'textures', cfg['tex'])
    if not os.path.exists(tex_path):
        print(f"Missing texture {tex_path}")
        continue
    img = PIL.Image.open(tex_path).convert('RGBA')
    
    scene = trimesh.load(path)
    if cfg['shift_y'] != 0.0:
        scene.apply_translation([0, cfg['shift_y'], 0])
    
    pbr = trimesh.visual.material.PBRMaterial(
        baseColorTexture=img,
        roughnessFactor=0.75,
        metallicFactor=0.05
    )
    for geom in scene.geometry.values():
        geom.visual = trimesh.visual.TextureVisuals(uv=geom.visual.uv, material=pbr)
    
    data = scene.export(file_type='glb')
    with open(path, 'wb') as out_f:
        out_f.write(data)
    print(f"Updated {glb_name} with {cfg['tex']}, bounds: {scene.bounds.round(3).tolist()}")
