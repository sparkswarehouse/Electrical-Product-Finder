export function normaliseProduct(product = {}) {
  const text = `${product.brand || ''} ${product.name || ''} ${product.description || ''}`.toLowerCase();

  return {
    ...product,
    attributes: {
      brand: product.brand || '',
      range: detectRange(text),
      category: detectCategory(text),
      finish: detectFinish(text),
      material: detectMaterial(text),
      voltage: detectVoltage(text),
      wattage: detectWattage(text),
      ipRating: detectIpRating(text),
      gang: detectGang(text),
      mounting: detectMounting(text),
      colour: detectColour(text),
      smartCompatible: /smart|wifi|zigbee|matter/i.test(text),
      dimmable: /dimmable/i.test(text),
      emergency: /emergency/i.test(text),
      led: /\bled\b/i.test(text),
      obsolete: /obsolete|discontinued/i.test(text)
    }
  };
}

function detectCategory(text='') {
  if (/socket/.test(text)) return 'Sockets';
  if (/switch/.test(text)) return 'Switches';
  if (/consumer unit|rcbo|mcb/.test(text)) return 'Circuit Protection';
  if (/lamp|bulb|led/.test(text)) return 'Lighting';
  if (/fan|extractor/.test(text)) return 'Ventilation';
  if (/cable|flex/.test(text)) return 'Cable';
  return 'Electrical Products';
}

function detectFinish(text='') {
  if (/brushed steel/.test(text)) return 'Brushed Steel';
  if (/polished chrome/.test(text)) return 'Polished Chrome';
  if (/black nickel/.test(text)) return 'Black Nickel';
  if (/white/.test(text)) return 'White';
  if (/black/.test(text)) return 'Black';
  return '';
}

function detectMaterial(text='') {
  if (/metal/.test(text)) return 'Metal';
  if (/plastic|moulded/.test(text)) return 'Plastic';
  if (/stainless/.test(text)) return 'Stainless Steel';
  return '';
}

function detectVoltage(text='') {
  const match = text.match(/(110v|115v|230v|240v|250v|400v)/i);
  return match ? match[1].toUpperCase() : '';
}

function detectWattage(text='') {
  const match = text.match(/(\d+)\s?w/i);
  return match ? `${match[1]}W` : '';
}

function detectIpRating(text='') {
  const match = text.match(/ip\s?(\d{2})/i);
  return match ? `IP${match[1]}` : '';
}

function detectGang(text='') {
  const match = text.match(/(1g|2g|3g|4g|1 gang|2 gang|3 gang|4 gang)/i);
  return match ? match[1].toUpperCase() : '';
}

function detectMounting(text='') {
  if (/surface/.test(text)) return 'Surface';
  if (/flush/.test(text)) return 'Flush';
  return '';
}

function detectColour(text='') {
  if (/white/.test(text)) return 'White';
  if (/black/.test(text)) return 'Black';
  if (/chrome/.test(text)) return 'Chrome';
  if (/steel/.test(text)) return 'Steel';
  return '';
}

function detectRange(text='') {
  const ranges = [
    'Logic Plus',
    'Screwless',
    'Click Deco',
    'Definity',
    'Mode',
    'BG Nexus',
    'Knightsbridge'
  ];

  return ranges.find(range => text.includes(range.toLowerCase())) || '';
}
