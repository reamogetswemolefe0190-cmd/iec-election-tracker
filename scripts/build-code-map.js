const fs = require('fs');
const path = require('path');

const mapsDir = path.join(__dirname, '..', 'public', 'maps');
const provFiles = fs.readdirSync(mapsDir).filter(f => f.startsWith('province-') && f.endsWith('.json'));

const codeMap = {};

for (const pf of provFiles) {
  const content = JSON.parse(fs.readFileSync(path.join(mapsDir, pf), 'utf8'));
  for (const area of content.areas) {
    const code = area.id; // e.g. TSH, GT421
    const name = area.name; // e.g. City of Tshwane, Emfuleni
    codeMap[code.toLowerCase()] = code;
    codeMap[name.toLowerCase()] = code;
    
    // Normalized variations
    const cleanName = name.toLowerCase()
      .replace(/local municipality|metropolitan municipality|municipality/g, '')
      .trim();
    codeMap[cleanName] = code;

    // Prefixes like "TSH - City of Tshwane" or "GT421 - Emfuleni"
    codeMap[`${code.toLowerCase()} - ${cleanName}`] = code;
    codeMap[`${code.toLowerCase()} - ${name.toLowerCase()}`] = code;
  }
}

// Major metro aliases
codeMap['city of tshwane (pretoria)'] = 'TSH';
codeMap['city of johannesburg (jhb)'] = 'JHB';
codeMap['city of cape town (cpt)'] = 'CPT';
codeMap['ethekwini (durban)'] = 'ETH';
codeMap['city of ekurhuleni'] = 'EKU';
codeMap['nelson mandela bay (gqeberha)'] = 'NMA';
codeMap['buffalo city (east london)'] = 'BUF';
codeMap['mangaung (bloemfontein)'] = 'MAN';

const outPath = path.join(__dirname, '..', 'src', 'lib', 'municipality-code-map.json');
fs.writeFileSync(outPath, JSON.stringify(codeMap, null, 2));
console.log('Successfully wrote', Object.keys(codeMap).length, 'mappings to', outPath);

