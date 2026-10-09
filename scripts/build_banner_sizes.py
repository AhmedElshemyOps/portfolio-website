"""Create responsive derivatives of approved artwork; requires Pillow, no redesign."""
import json
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
def build(root=ROOT):
 data=json.loads((root/'content/series-banners.json').read_text())
 for design in data['designs'].values():
  source=root/design['background'].lstrip('/')
  with Image.open(source) as im:
   for width in (240,640,960):
    im.resize((width,round(im.height*width/im.width)),Image.Resampling.LANCZOS).save(source.with_name(source.stem+f'-{width}.webp'),'WEBP',quality=82,method=6)
if __name__=='__main__':build()
