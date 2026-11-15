"""Fetch documented visual context, preserve originals locally and produce web assets.

Run from the checkout: uv run --locked python scripts/fetch-visuals.py
Scientific maps and measurements are never altered by this script.
"""
from pathlib import Path
from urllib.request import Request, urlopen
from hashlib import sha256
from datetime import datetime, timezone
import json
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / 'science/cache/visual-originals'
OUT = ROOT / 'web/public/media'
ITEMS = [
    dict(id='cerro', page='https://commons.wikimedia.org/wiki/File:Cerro_Turub%C3%B3_-_San_Jos%C3%A9_de_Chiquitos,_Bolivia.jpg',
         url='https://upload.wikimedia.org/wikipedia/commons/d/df/Cerro_Turub%C3%B3_-_San_Jos%C3%A9_de_Chiquitos%2C_Bolivia.jpg',
         credit='Ruditaly / Wikimedia Commons', license='CC BY-SA 4.0', licenseUrl='https://creativecommons.org/licenses/by-sa/4.0/',
         alt={'es':'Vista real del Cerro Turubó y el bosque de San José de Chiquitos.', 'en':'A real view of Cerro Turubó and the forest of San José de Chiquitos.'}),
    dict(id='valle', page='https://commons.wikimedia.org/wiki/File:Imagen_del_Ni%C3%B1o_Jes%C3%BAs_en_la_monta%C3%B1a_del_Valle_de_la_luna_de_San_Jos%C3%A9_de_Chiquitos.jpg',
         url='https://upload.wikimedia.org/wikipedia/commons/e/e2/Imagen_del_Ni%C3%B1o_Jes%C3%BAs_en_la_monta%C3%B1a_del_Valle_de_la_luna_de_San_Jos%C3%A9_de_Chiquitos.jpg',
         credit='Aldrihe / Wikimedia Commons', license='CC BY-SA 4.0', licenseUrl='https://creativecommons.org/licenses/by-sa/4.0/',
         alt={'es':'Figura del Niño Jesús y paisaje del Valle de la Luna de San José de Chiquitos.', 'en':'A Child Jesus statue and the landscape of Valle de la Luna in San José de Chiquitos.'}),
    dict(id='nobile', page='https://science.nasa.gov/mission/viper/lunar-operations/',
         url='https://science.nasa.gov/wp-content/uploads/2023/05/max-lit-mosaic2-jpg.webp',
         credit='NASA / LRO', license='NASA media usage guidelines', licenseUrl='https://www.nasa.gov/nasa-brand-center/images-and-media/',
         alt={'es':'Reconstrucción regional de una meseta sobre Nobile a partir de 147 imágenes LRO; no es el recorte medido.', 'en':'Regional reconstruction of a plateau above Nobile from 147 LRO images; not our measured tile.'}),
    dict(id='jezero', page='https://science.nasa.gov/photojournal/detailed-panorama-of-mars-jezero-crater-delta/',
         url='https://assets.science.nasa.gov/dynamicimage/assets/science/psd/photojournal/pia/pia24/pia24921/PIA24921.jpg?w=1920&h=539&fit=clip',
         credit='NASA/JPL-Caltech/ASU/MSSS · PIA24921', license='JPL image use policy', licenseUrl='https://www.jpl.nasa.gov/jpl-image-use-policy/',
         alt={'es':'Panorama del delta de Jezero tomado por Perseverance; mosaico en color realzado, contexto regional.', 'en':'Perseverance panorama of the Jezero delta; enhanced-color mosaic, regional context.'}),
    dict(id='moon-texture', page='https://svs.gsfc.nasa.gov/4720/',
         url='https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/lroc_color_2k.jpg',
         credit='NASA/GSFC/SVS · Ernie Wright · LROC', license='NASA SVS media use', licenseUrl='https://svs.gsfc.nasa.gov/help/',
         alt={'es':'Mapa global LROC para el globo lunar artístico, sin escala de análisis.', 'en':'Global LROC map for the illustrative lunar globe, without an analysis scale.'}),
    dict(id='mars-texture', page='https://science.nasa.gov/3d-resources/mars/',
         url='https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/image/mars/Mars.jpg',
         credit='NASA/JPL-Caltech · USGS · Viking', license='JPL image use policy', licenseUrl='https://www.jpl.nasa.gov/jpl-image-use-policy/',
         alt={'es':'Mapa global de Marte basado en Viking para el globo artístico.', 'en':'Viking-based global Mars map for the illustrative globe.'}),
]

def main():
    CACHE.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    records=[]
    for item in ITEMS:
        original=CACHE / (item['id']+'-viking' if item['id']=='mars-texture' else item['id'])
        if not original.exists():
            with urlopen(Request(item['url'], headers={'User-Agent':'TURUBO-SpaceApps/1.0'}), timeout=40) as response:
                data=response.read(16_000_001)
            if len(data)>16_000_000:
                raise ValueError('Oversized visual: '+item['id'])
            original.write_bytes(data)
        data=original.read_bytes()
        image=ImageOps.exif_transpose(Image.open(original)).convert('RGB')
        files=[]
        widths=[min(2048,image.width)] if 'texture' in item['id'] else sorted(set(min(w,image.width) for w in [640,1280,1920]))
        for width in widths:
            size=(width, round(image.height*width/image.width))
            target=OUT / (item['id']+'.webp' if 'texture' in item['id'] else f'{item["id"]}-{width}.webp')
            image.resize(size,Image.Resampling.LANCZOS).save(target,'WEBP',quality=83,method=6)
            files.append(dict(path='media/'+target.name,width=size[0],height=size[1],bytes=target.stat().st_size,sha256=sha256(target.read_bytes()).hexdigest()))
        if 'texture' in item['id']:
            # Static view of the same global texture for reduced motion / no WebGL.
            import numpy as np
            sz=800
            axis=(np.arange(sz)+.5-sz/2)/(sz/2-2)
            x,y=np.meshgrid(axis,-axis)
            r2=x*x+y*y
            z=np.sqrt(np.maximum(1-r2,0))
            pixels=np.asarray(image)
            yaw=-.20 if item['id']=='moon-texture' else .65
            # View facing the centre of the equirectangular image.
            u=(.5+(np.arctan2(x,z)+yaw)/(2*np.pi))%1
            v=.5-np.arcsin(np.clip(y,-1,1))/np.pi
            rgb=pixels[np.clip((v*image.height).astype(int),0,image.height-1),(u*image.width).astype(int)].astype(float)
            light=np.clip(-.55*x+.36*y+.75*z,0,1)
            rgb=np.clip(rgb*(.11+.98*np.sqrt(light))[...,None],0,255)
            rgba=np.dstack([rgb,np.clip((1-r2)*sz/2,0,1)*255]).astype(np.uint8)
            target=OUT / item['id'].replace('-texture','-globe.webp')
            Image.fromarray(rgba).save(target,'WEBP',quality=85,method=6)
            files.append(dict(path='media/'+target.name,width=sz,height=sz,bytes=target.stat().st_size,sha256=sha256(target.read_bytes()).hexdigest(),modification='Static illustrative sphere, lit and projected from this global texture.'))
        records.append(dict(**item, acquiredAt=datetime.now(timezone.utc).isoformat(), originalSha256=sha256(data).hexdigest(),originalDimensions=list(image.size),modifications='EXIF orientation; resized; WebP encoding. No generative editing.',files=files))
        print(item['id'],image.size, sum(f['bytes'] for f in files),'bytes')
    (ROOT/'design/media-manifest.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf8')

if __name__=='__main__':main()
