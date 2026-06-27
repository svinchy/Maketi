const variantGroup = (title, category, options) => ({
  display: 'flex',
  flow: 'y',
  gap: 'Z',

  H4: {
    tag: 'h4',
    text: title,
    margin: '0',
    fontFamily: 'ALKTallMtavruli',
    fontSize: 'B',
    fontWeight: '400'
  },

  Buttons: {
    display: 'flex',
    flow: 'x',
    gap: 'Z',
    flexWrap: 'wrap',
    childExtends: 'Button',
    childProps: (el, s) => ({
      text: s.text,
      type: 'button',
      border: '1px solid black',
      background: s.active ? 'black' : 'transparent',
      color: s.active ? 'cream' : 'black',
      padding: 'Z A',
      cursor: 'pointer',
      fontFamily: 'ALKTallMtavruli',
      fontSize: 'A',
      'data-maketi-variant-category': category,
      'data-maketi-variant-value': s.value
    }),
    children: options
  }
})

const roofOptions = [
  { text: 'standard flat', value: 'standardFlat' },
  { text: 'parapet', value: 'flatParapet' },
  { text: 'terrace', value: 'flatTerrace' },
  { text: 'pergola', value: 'flatPergola' },
  { text: 'overhang', value: 'flatOverhang' },
  { text: 'gable', value: 'standardGable' },
  { text: 'modern gable', value: 'modernGable', active: true },
  { text: 'open gable', value: 'openGable' },
  { text: 'asym gable', value: 'asymGable' },
  { text: 'cross gable', value: 'crossGable' },
  { text: 'hip', value: 'standardHip' },
  { text: 'low hip', value: 'lowPitchHip' },
  { text: 'modern hip', value: 'modernHip' },
  { text: 'wide eaves', value: 'hipWideEaves' },
  { text: 'single pitch', value: 'singlePitch' },
  { text: 'reverse shed', value: 'reverseShed' },
  { text: 'double shed', value: 'doubleShed' },
  { text: 'butterfly', value: 'butterflyRoof' },
  { text: 'a-frame', value: 'aFrameRoof' },
  { text: 'chalet', value: 'chaletRoof' },
  { text: 'dutch gable', value: 'dutchGable' },
  { text: 'clerestory', value: 'clerestoryRoof' }
]

export const HouseModelSection = {
  tag: 'section',
  minHeight: '100vh',
  width: '100%',
  position: 'relative',
  padding: 'B1',
  background: 'cream',
  color: 'black',
  'data-maketi-house-section': 'true',

  Stage: {
    position: 'relative',
    width: '100%',
    minHeight: 'min(720px, 82vh)',
    overflow: 'hidden',
    background: 'cream',
    'data-maketi-house-model': 'true',

    Canvas: {
      tag: 'canvas',
      width: '100%',
      height: '100%',
      display: 'block',
      cursor: 'grab',
      'aria-label': '3D house model',
      'data-maketi-house-canvas': 'true'
    }
  },

  Controls: {
    position: 'absolute',
    right: 'B1',
    top: 'B1',
    width: 'min(300px, calc(100% - 64px))',
    maxHeight: 'calc(100vh - 64px)',
    overflowY: 'auto',
    display: 'flex',
    flow: 'y',
    gap: 'B',
    align: 'stretch',
    zIndex: '2',
    padding: 'A',
    background: 'rgba(253, 255, 212, .78)',
    backdropFilter: 'blur(10px)',

    H3: {
      tag: 'h3',
      text: 'მაკეტი',
      margin: '0',
      color: 'black',
      fontFamily: 'ALKTallMtavruli',
      fontSize: '64px',
      fontWeight: '400',
      lineHeight: '.9'
    },

    RoofGroup: variantGroup('სახურავი', 'roof', roofOptions),
    FacadeGroup: variantGroup('ფასადი', 'facade', [
      { text: 'white plaster', value: 'whitePlaster', active: true },
      { text: 'gray plaster', value: 'grayPlaster' },
      { text: 'black plaster', value: 'blackPlaster' },
      { text: 'red brick', value: 'redBrick' },
      { text: 'white brick', value: 'whiteBrick' },
      { text: 'stone', value: 'stone' },
      { text: 'wood', value: 'woodCladding' },
      { text: 'panels', value: 'compositePanels' },
      { text: 'concrete', value: 'concreteFinish' },
      { text: 'mixed', value: 'mixedMaterials' }
    ]),
    RoofMaterialGroup: variantGroup('სახურავის მასალა', 'roofMaterial', [
      { text: 'metal seam', value: 'metalStandingSeam', active: true },
      { text: 'shingles', value: 'asphaltShingles' },
      { text: 'clay tiles', value: 'clayTiles' },
      { text: 'concrete tiles', value: 'concreteTiles' },
      { text: 'wood shingles', value: 'woodShingles' }
    ]),
    WindowGroup: variantGroup('ფანჯარა', 'windows', [
      { text: 'standard', value: 'standard', active: true },
      { text: 'floor glass', value: 'floorToCeiling' },
      { text: 'corner', value: 'cornerGlass' },
      { text: 'panoramic', value: 'panoramic' },
      { text: 'black frame', value: 'blackFrame' },
      { text: 'white frame', value: 'whiteFrame' },
      { text: 'frameless', value: 'frameless' }
    ]),
    EntranceGroup: variantGroup('შესასვლელი', 'entrance', [
      { text: 'simple', value: 'simpleDoor', active: true },
      { text: 'modern', value: 'modernDoor' },
      { text: 'glass', value: 'glassDoor' },
      { text: 'wood', value: 'woodDoor' },
      { text: 'covered', value: 'coveredEntry' },
      { text: 'porch', value: 'porchEntry' }
    ]),
    GarageGroup: variantGroup('გარაჟი', 'garage', [
      { text: 'none', value: 'noGarage', active: true },
      { text: 'single', value: 'singleGarage' },
      { text: 'double', value: 'doubleGarage' },
      { text: 'side', value: 'sideGarage' },
      { text: 'detached', value: 'detachedGarage' }
    ]),
    TerraceGroup: variantGroup('ტერასა', 'terrace', [
      { text: 'none', value: 'none', active: true },
      { text: 'front', value: 'frontTerrace' },
      { text: 'rear', value: 'rearTerrace' },
      { text: 'wrap', value: 'wraparoundTerrace' },
      { text: 'covered', value: 'coveredTerrace' }
    ]),
    BalconyGroup: variantGroup('აივანი', 'balcony', [
      { text: 'none', value: 'none', active: true },
      { text: 'glass', value: 'glassBalcony' },
      { text: 'metal', value: 'metalBalcony' },
      { text: 'floating', value: 'floatingBalcony' },
      { text: 'wood', value: 'woodenBalcony' }
    ]),
    AddonGroup: variantGroup('დამატება', 'addon', [
      { text: 'none', value: 'none', active: true },
      { text: 'pergola', value: 'pergola' },
      { text: 'chimney', value: 'chimney' },
      { text: 'solar', value: 'solarPanels' },
      { text: 'skylights', value: 'skylights' },
      { text: 'columns', value: 'decorativeColumns' },
      { text: 'kitchen', value: 'outdoorKitchen' },
      { text: 'fire pit', value: 'firePit' }
    ]),
    StyleGroup: variantGroup('სტილი', 'houseStyle', [
      { text: 'modern', value: 'modern', active: true },
      { text: 'scandi', value: 'scandinavian' },
      { text: 'contemp.', value: 'contemporary' },
      { text: 'farmhouse', value: 'farmhouse' },
      { text: 'mediterr.', value: 'mediterranean' },
      { text: 'industrial', value: 'industrial' }
    ]),
    StoreyGroup: variantGroup('სართული', 'stories', [
      { text: 'one', value: 'one', active: true },
      { text: 'two', value: 'two' }
    ]),
    BlocksGroup: variantGroup('ბლოკები', 'blocks', [
      { text: '1', value: 'one' },
      { text: '2', value: 'two' },
      { text: '3', value: 'three', active: true },
      { text: '4', value: 'four' },
      { text: '5', value: 'five' }
    ]),
    AreaGroup: variantGroup('მ²', 'area', [
      { text: '80', value: '80' },
      { text: '120', value: '120', active: true },
      { text: '160', value: '160' }
    ]),
    FloorGroup: variantGroup('იატაკი', 'floor', [
      { text: 'stone', value: 'stone', active: true },
      { text: 'wood', value: 'wood' },
      { text: 'tile', value: 'tile' }
    ]),

    PricePanel: {
      borderTop: '1px solid black',
      padding: 'A - -',
      display: 'flex',
      flow: 'y',
      gap: 'X',
      'data-maketi-price-panel': 'true',

      Label: {
        tag: 'span',
        text: 'ფასი',
        color: 'black',
        fontFamily: 'ALKTallMtavruli',
        fontSize: 'B',
        fontWeight: '400',
        lineHeight: '1'
      },

      Value: {
        tag: 'strong',
        text: '₾0',
        color: 'black',
        fontFamily: 'ALKTallMtavruli',
        fontSize: 'C',
        fontWeight: '400',
        lineHeight: '1',
        'data-maketi-price-value': 'true'
      },

      Meta: {
        tag: 'span',
        text: 'ცვლილდება არჩეული პარამეტრებით',
        color: 'black',
        opacity: '.62',
        fontFamily: 'ALKTallMtavruli',
        fontSize: 'Z',
        fontWeight: '400',
        lineHeight: '1.2'
      }
    }
  }
}
