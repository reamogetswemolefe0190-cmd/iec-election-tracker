import { GpsLocation } from '@/types/election';

export const SA_PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape',
  'Western Cape',
];

export const SA_MUNICIPALITIES_BY_PROVINCE: Record<string, string[]> = {
  'Gauteng': [
    'City of Johannesburg (JHB)',
    'City of Tshwane (Pretoria)',
    'City of Ekurhuleni',
    'Mogale City (Krugersdorp)',
    'Emfuleni (Vereeniging)',
    'Midvaal (Meyerton)',
    'Lesedi (Heidelberg)',
    'Rand West City',
    'Merafong City (Carletonville)',
  ],
  'Western Cape': [
    'City of Cape Town (CPT)',
    'Drakenstein (Paarl)',
    'Stellenbosch',
    'George',
    'Mossel Bay',
    'Breede Valley (Worcester)',
    'Overstrand (Hermanus)',
    'Saldanha Bay',
    'Knysna',
    'Oudtshoorn',
    'Swartland (Malmesbury)',
    'Theewaterskloof',
    'Hessequa (Riversdale)',
    'Beaufort West',
    'Bitou (Plettenberg Bay)',
    'Langeberg',
    'Witzenberg (Ceres)',
    'Matzikama (Vredendal)',
  ],
  'KwaZulu-Natal': [
    'eThekwini (Durban)',
    'Msunduzi (Pietermaritzburg)',
    'uMhlathuze (Richards Bay)',
    'Newcastle',
    'Ray Nkonyeni (Port Shepstone)',
    'Alfred Duma (Ladysmith)',
    'KwaDukuza (Ballito/Stanger)',
    'Abaqulusi (Vryheid)',
    'uMngeni (Howick)',
    'Ulundi',
    'Jozini',
    'Mtubatuba',
    'Inkosi Langalibalele (Estcourt)',
    'Mandeni',
    'Maphumulo',
    'Nongoma',
  ],
  'Eastern Cape': [
    'Nelson Mandela Bay (Gqeberha/PE)',
    'Buffalo City (East London)',
    'King Sabata Dalindyebo (Mthatha)',
    'EC102 - Blue Crane Route',
    'Makana (Makhanda/Grahamstown)',
    'Kouga (Jeffreys Bay)',
    'Enoch Mgijima (Komani/Queenstown)',
    'Walter Sisulu (Aliwal North)',
    'Matatiele',
    'Ndlambe (Port Alfred)',
    'Dr Beyers Naudé (Graaff-Reinet)',
    'Ngqushwa (Peddie)',
    'Amahlathi (Stutterheim)',
  ],
  'Free State': [
    'Mangaung (Bloemfontein)',
    'Matjhabeng (Welkom)',
    'Maluti-a-Phofung (Phuthaditjhaba)',
    'Metsimaholo (Sasolburg)',
    'Dihlabeng (Bethlehem)',
    'Moqhaka (Kroonstad)',
    'Ngwathe (Parys)',
    'Setsoto (Ficksburg)',
    'Nketoana (Reitz)',
  ],
  'Limpopo': [
    'Polokwane',
    'Thabazimbi',
    'Mogalakwena (Mokopane)',
    'Makhado (Louis Trichardt)',
    'Thulamela (Thohoyandou)',
    'Greater Tzaneen',
    'Ba-Phalaborwa',
    'Lephalale (Ellisras)',
    'Elias Motsoaledi (Groblersdal)',
    'Bela-Bela',
    'Modimolle-Mookgophong',
    'Greater Letaba',
    'Greater Giyani',
  ],
  'Mpumalanga': [
    'City of Mbombela (Nelspruit)',
    'Emalahleni (Witbank)',
    'Govan Mbeki (Secunda)',
    'Steve Tshwete (Middelburg)',
    'Bushbuckridge',
    'Nkomazi (Malelane)',
    'Thaba Chweu (Lydenburg)',
    'Victor Khanye (Delmas)',
    'Lekwa (Standerton)',
    'Dr JS Moroka',
  ],
  'North West': [
    'Rustenburg',
    'Madibeng (Brits)',
    'JB Marks (Potchefstroom)',
    'City of Matlosana (Klerksdorp)',
    'Mahikeng',
    'Ditsobotla (Lichtenburg)',
    'Moses Kotane',
    'Naledi (Vryburg)',
    'Mamusa (Schweizer-Reneke)',
  ],
  'Northern Cape': [
    'Sol Plaatje (Kimberley)',
    'Dawid Kruiper (Upington)',
    'Ga-Segonyana (Kuruman)',
    'Nama Khoi (Springbok)',
    'Emthanjeni (De Aar)',
    'Gamagara (Kathu)',
    'Siyathemba (Prieska)',
    'Kai !Garib (Kakamas)',
  ],
};

export function getMunicipalitiesForProvince(provName: string | null): string[] {
  if (!provName) {
    return [
      'City of Johannesburg (JHB)',
      'City of Cape Town (CPT)',
      'eThekwini (Durban)',
      'City of Tshwane (Pretoria)',
      'City of Ekurhuleni',
      'Nelson Mandela Bay (Gqeberha/PE)',
      'Buffalo City (East London)',
      'Mangaung (Bloemfontein)',
      'Polokwane',
      'City of Mbombela (Nelspruit)',
      'Rustenburg',
      'Sol Plaatje (Kimberley)',
      'EC102 - Blue Crane Route',
      'Msunduzi (Pietermaritzburg)',
      'Stellenbosch',
      'George',
    ];
  }
  const clean = normalizeProvinceName(provName);
  return SA_MUNICIPALITIES_BY_PROVINCE[clean] || [];
}

export function findProvinceForMunicipality(municName: string): string | null {
  const clean = municName.toLowerCase();
  for (const [prov, munics] of Object.entries(SA_MUNICIPALITIES_BY_PROVINCE)) {
    if (
      munics.some(
        (m) =>
          m.toLowerCase().includes(clean) ||
          clean.includes(m.toLowerCase().split('(')[0].trim())
      )
    ) {
      return prov;
    }
  }
  return null;
}

export function normalizeProvinceName(raw: string): string {
  const clean = raw.toLowerCase().replace(/[\-\s]/g, '');
  for (const prov of SA_PROVINCES) {
    if (prov.toLowerCase().replace(/[\-\s]/g, '') === clean) {
      return prov;
    }
  }
  // Loose matching
  if (clean.includes('gauteng')) return 'Gauteng';
  if (clean.includes('westerncape')) return 'Western Cape';
  if (clean.includes('kwazulu') || clean.includes('natal')) return 'KwaZulu-Natal';
  if (clean.includes('easterncape')) return 'Eastern Cape';
  if (clean.includes('freestate')) return 'Free State';
  if (clean.includes('limpopo')) return 'Limpopo';
  if (clean.includes('mpumalanga')) return 'Mpumalanga';
  if (clean.includes('northwest')) return 'North West';
  if (clean.includes('northerncape')) return 'Northern Cape';
  return raw;
}

interface LocalityAdministrative {
  name: string;
  order?: number;
  adminLevel?: number;
  description?: string;
}

export async function reverseGeocodeCoordinates(
  lat: number,
  lon: number
): Promise<GpsLocation> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );

    if (!res.ok) {
      throw new Error(`Reverse geocode failed: HTTP ${res.status}`);
    }

    const data = await res.json();
    const admin: LocalityAdministrative[] = data.localityInfo?.administrative || [];

    // Find ward
    const wardItem = admin.find((a) => typeof a?.name === 'string' && /ward\s*\d+/i.test(a.name));
    const ward = wardItem ? wardItem.name : 'Local Voting Ward';

    // Find municipality
    const municItem = admin.find((a) => typeof a?.name === 'string' && /municipality/i.test(a.name));
    const municipality = municItem
      ? municItem.name
      : data.city || data.locality || 'Local Municipality';

    // Province
    const rawProv = data.principalSubdivision || 'Gauteng';
    const province = normalizeProvinceName(rawProv);

    return {
      latitude: lat,
      longitude: lon,
      province,
      municipality,
      ward,
      city: data.city || data.locality || province,
    };
  } catch (err) {
    console.error('Error reverse geocoding coordinates:', err);
    throw err;
  }
}
