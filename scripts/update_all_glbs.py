import trimesh
import PIL.Image
import glob
import os

MODELS_DIR = os.path.join('assets', 'models')
TEX_DIR = os.path.join('assets', 'textures')

def get_texture_for_model(filename):
    f = filename.lower()
    
    # Wall pieces (including triangular gable walls like wood_wall_roof_45, wood_wall_roof_67_a, etc.)
    if 'wall' in f:
        if 'ashwood' in f:
            return 'ashwooddoor_d.png'
        if 'stone' in f:
            if '4x2' in f or 'window' in f:
                return 'stonewall.png'
            return 'stoneblock_d.png'
        return 'Planks5c_low.png'

    # Roof coverings
    if 'shingle' in f or 'wood_roof' in f or 'roof_wood' in f:
        return 'wood_roof_d.png'
    if 'roof' in f or 'thatch' in f or 'straw' in f:
        return 'straw_roof.png'
        
    # Stone
    if 'stone_floor_2x2' in f:
        return 'stonefloor_2x2_d.png'
    if 'stone_floor' in f:
        return 'stonefloor_d.png'
    if 'stone_fence' in f:
        return 'stonefence_d.png'
    if 'stone_wall_4x2' in f or 'window_4x2' in f or 'window_2x2' in f:
        return 'stonewall.png'
    if 'stone_pillar' in f or 'stone_wall' in f or 'stone_arch' in f or 'stone_stair' in f or 'stonecutter' in f:
        return 'stoneblock_d.png'
    if 'rock' in f or 'boulder' in f or 'portal_stone' in f:
        return 'stone.png'
        
    # Metal / Iron
    if 'iron' in f or 'metal' in f or 'cage' in f:
        return 'iron_beam.png'
        
    # Darkwood
    if 'darkwood' in f or 'tar' in f:
        return 'darkwood_beam.png'
        
    # Core wood
    if 'core' in f or 'wood_pole_log' in f or 'wood_log' in f:
        return 'core_wood.png'
        
    # Floors
    if 'floor' in f:
        return 'Planks5c_low.png'
        
    # Chest
    if 'chest' in f:
        return 'wood_chest.png'
        
    # Default wood pieces (walls, beams, stairs, doors, etc.)
    return 'wood_wall.png'

tex_images = {}

all_glbs = sorted(glob.glob(os.path.join(MODELS_DIR, '*.glb')))
print(f"Processing {len(all_glbs)} models...")

updated = 0
for glb_path in all_glbs:
    base = os.path.basename(glb_path)
    tex_name = get_texture_for_model(base)
    tex_file = os.path.join(TEX_DIR, tex_name)
    
    if not os.path.exists(tex_file):
        print(f"Warning: Texture {tex_file} not found for {base}")
        continue
        
    if tex_name not in tex_images:
        tex_images[tex_name] = PIL.Image.open(tex_file).convert('RGBA')
    img = tex_images[tex_name]
    
    try:
        scene = trimesh.load(glb_path)
        
        # Check current texture size
        needs_update = False
        for geom in scene.geometry.values():
            mat = getattr(geom.visual, 'material', None)
            tex = getattr(mat, 'baseColorTexture', None)
            if tex is None or getattr(tex, 'size', (0,0))[0] <= 4:
                needs_update = True
                break
                
        if needs_update or 'stone' in base.lower():
            pbr = trimesh.visual.material.PBRMaterial(
                baseColorTexture=img,
                roughnessFactor=0.7 if 'stone' in base else 0.6,
                metallicFactor=0.2 if 'iron' in base else 0.05
            )
            for geom in scene.geometry.values():
                uv = getattr(geom.visual, 'uv', None)
                geom.visual = trimesh.visual.TextureVisuals(uv=uv, material=pbr)
                
            glb_data = scene.export(file_type='glb')
            with open(glb_path, 'wb') as f:
                f.write(glb_data)
            updated += 1
            print(f"[{updated}] Updated {base} with {tex_name} ({img.size})")
    except Exception as e:
        print(f"Error updating {base}: {e}")

print(f"Finished! Successfully embedded textures in {updated} models.")
