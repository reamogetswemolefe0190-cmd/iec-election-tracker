// South African Suburb & Town Registry
// Maps popular suburbs, townships, and landmarks to their official IEC Municipality and Province.

export interface SuburbEntry {
  suburb: string;
  municipality: string;
  province: string;
  metro?: string;
}

export const SA_SUBURBS: SuburbEntry[] = [
  // --- Gauteng (City of Johannesburg) ---
  { suburb: 'Soweto', municipality: 'City of Johannesburg (JHB)', province: 'Gauteng', metro: 'JHB' },
  { suburb: 'Sandton', municipality: 'City of Johannesburg (JHB)', province: 'Gauteng', metro: 'JHB' },
  { suburb: 'Rosebank', municipality: 'City of Johannesburg (JHB)', province: 'Gauteng', metro: 'JHB' },
  { suburb: 'Randburg', municipality: 'City of Johannesburg (JHB)', province: 'Gauteng', metro: 'JHB' },
  { suburb: 'Roodepoort', municipality: 'City of Johannesburg (JHB)', province: 'Gauteng', metro: 'JHB' },
  { suburb: 'Alexandra (Alex)', municipality: 'City of Johannesburg (JHB)', province: 'Gauteng', metro: 'JHB' },
  { suburb: 'Diepsloot', municipality: 'City of Johannesburg (JHB)', province: 'Gauteng', metro: 'JHB' },
  { suburb: 'Midrand', municipality: 'City of Johannesburg (JHB)', province: 'Gauteng', metro: 'JHB' },
  { suburb: 'Fourways', municipality: 'City of Johannesburg (JHB)', province: 'Gauteng', metro: 'JHB' },
  { suburb: 'Lenasia', municipality: 'City of Johannesburg (JHB)', province: 'Gauteng', metro: 'JHB' },
  { suburb: 'Orange Farm', municipality: 'City of Johannesburg (JHB)', province: 'Gauteng', metro: 'JHB' },
  { suburb: 'Braamfontein', municipality: 'City of Johannesburg (JHB)', province: 'Gauteng', metro: 'JHB' },
  { suburb: 'Johannesburg CBD', municipality: 'City of Johannesburg (JHB)', province: 'Gauteng', metro: 'JHB' },

  // --- Gauteng (City of Tshwane) ---
  { suburb: 'Pretoria Central / CBD', municipality: 'City of Tshwane (Pretoria)', province: 'Gauteng', metro: 'TSH' },
  { suburb: 'Centurion', municipality: 'City of Tshwane (Pretoria)', province: 'Gauteng', metro: 'TSH' },
  { suburb: 'Mamelodi', municipality: 'City of Tshwane (Pretoria)', province: 'Gauteng', metro: 'TSH' },
  { suburb: 'Soshanguve', municipality: 'City of Tshwane (Pretoria)', province: 'Gauteng', metro: 'TSH' },
  { suburb: 'Atteridgeville', municipality: 'City of Tshwane (Pretoria)', province: 'Gauteng', metro: 'TSH' },
  { suburb: 'Garankuwa', municipality: 'City of Tshwane (Pretoria)', province: 'Gauteng', metro: 'TSH' },
  { suburb: 'Akasia', municipality: 'City of Tshwane (Pretoria)', province: 'Gauteng', metro: 'TSH' },
  { suburb: 'Pretoria East / Menlyn', municipality: 'City of Tshwane (Pretoria)', province: 'Gauteng', metro: 'TSH' },
  { suburb: 'Hammanskraal', municipality: 'City of Tshwane (Pretoria)', province: 'Gauteng', metro: 'TSH' },
  { suburb: 'Mabopane', municipality: 'City of Tshwane (Pretoria)', province: 'Gauteng', metro: 'TSH' },

  // --- Gauteng (City of Ekurhuleni) ---
  { suburb: 'Germiston', municipality: 'City of Ekurhuleni', province: 'Gauteng', metro: 'EKU' },
  { suburb: 'Boksburg', municipality: 'City of Ekurhuleni', province: 'Gauteng', metro: 'EKU' },
  { suburb: 'Benoni', municipality: 'City of Ekurhuleni', province: 'Gauteng', metro: 'EKU' },
  { suburb: 'Kempton Park (OR Tambo)', municipality: 'City of Ekurhuleni', province: 'Gauteng', metro: 'EKU' },
  { suburb: 'Tembisa', municipality: 'City of Ekurhuleni', province: 'Gauteng', metro: 'EKU' },
  { suburb: 'Katlehong', municipality: 'City of Ekurhuleni', province: 'Gauteng', metro: 'EKU' },
  { suburb: 'Vosloorus', municipality: 'City of Ekurhuleni', province: 'Gauteng', metro: 'EKU' },
  { suburb: 'Alberton', municipality: 'City of Ekurhuleni', province: 'Gauteng', metro: 'EKU' },
  { suburb: 'Springs', municipality: 'City of Ekurhuleni', province: 'Gauteng', metro: 'EKU' },
  { suburb: 'Brakpan', municipality: 'City of Ekurhuleni', province: 'Gauteng', metro: 'EKU' },
  { suburb: 'Daveyton', municipality: 'City of Ekurhuleni', province: 'Gauteng', metro: 'EKU' },

  // --- Western Cape (City of Cape Town) ---
  { suburb: 'Cape Town CBD', municipality: 'City of Cape Town (CPT)', province: 'Western Cape', metro: 'CPT' },
  { suburb: 'Khayelitsha', municipality: 'City of Cape Town (CPT)', province: 'Western Cape', metro: 'CPT' },
  { suburb: 'Mitchells Plain', municipality: 'City of Cape Town (CPT)', province: 'Western Cape', metro: 'CPT' },
  { suburb: 'Gugulethu', municipality: 'City of Cape Town (CPT)', province: 'Western Cape', metro: 'CPT' },
  { suburb: 'Bellville', municipality: 'City of Cape Town (CPT)', province: 'Western Cape', metro: 'CPT' },
  { suburb: 'Camps Bay / Clifton', municipality: 'City of Cape Town (CPT)', province: 'Western Cape', metro: 'CPT' },
  { suburb: 'Table View / Blouberg', municipality: 'City of Cape Town (CPT)', province: 'Western Cape', metro: 'CPT' },
  { suburb: 'Somerset West', municipality: 'City of Cape Town (CPT)', province: 'Western Cape', metro: 'CPT' },
  { suburb: 'Durbanville', municipality: 'City of Cape Town (CPT)', province: 'Western Cape', metro: 'CPT' },
  { suburb: 'Athlone', municipality: 'City of Cape Town (CPT)', province: 'Western Cape', metro: 'CPT' },
  { suburb: 'Muizenberg / Fish Hoek', municipality: 'City of Cape Town (CPT)', province: 'Western Cape', metro: 'CPT' },
  { suburb: 'Hout Bay', municipality: 'City of Cape Town (CPT)', province: 'Western Cape', metro: 'CPT' },
  { suburb: 'Atlantis', municipality: 'City of Cape Town (CPT)', province: 'Western Cape', metro: 'CPT' },

  // --- Western Cape Local Councils ---
  { suburb: 'Stellenbosch Central / Kayamandi', municipality: 'Stellenbosch', province: 'Western Cape' },
  { suburb: 'Paarl / Franschhoek', municipality: 'Drakenstein (Paarl)', province: 'Western Cape' },
  { suburb: 'George / Pacaltsdorp', municipality: 'George', province: 'Western Cape' },
  { suburb: 'Mossel Bay / KwaNonqaba', municipality: 'Mossel Bay', province: 'Western Cape' },
  { suburb: 'Hermanus / Gansbaai', municipality: 'Overstrand (Hermanus)', province: 'Western Cape' },
  { suburb: 'Worcester', municipality: 'Breede Valley (Worcester)', province: 'Western Cape' },
  { suburb: 'Knysna', municipality: 'Knysna', province: 'Western Cape' },
  { suburb: 'Saldanha / Langebaan', municipality: 'Saldanha Bay', province: 'Western Cape' },

  // --- KwaZulu-Natal (eThekwini) ---
  { suburb: 'Durban Central / South Beach', municipality: 'eThekwini (Durban)', province: 'KwaZulu-Natal', metro: 'ETH' },
  { suburb: 'Umhlanga / Gateway', municipality: 'eThekwini (Durban)', province: 'KwaZulu-Natal', metro: 'ETH' },
  { suburb: 'Chatsworth', municipality: 'eThekwini (Durban)', province: 'KwaZulu-Natal', metro: 'ETH' },
  { suburb: 'Phoenix', municipality: 'eThekwini (Durban)', province: 'KwaZulu-Natal', metro: 'ETH' },
  { suburb: 'Umlazi', municipality: 'eThekwini (Durban)', province: 'KwaZulu-Natal', metro: 'ETH' },
  { suburb: 'KwaMashu', municipality: 'eThekwini (Durban)', province: 'KwaZulu-Natal', metro: 'ETH' },
  { suburb: 'Pinetown / Westville', municipality: 'eThekwini (Durban)', province: 'KwaZulu-Natal', metro: 'ETH' },
  { suburb: 'Amanzimtoti', municipality: 'eThekwini (Durban)', province: 'KwaZulu-Natal', metro: 'ETH' },
  { suburb: 'Inanda / Ntuzuma', municipality: 'eThekwini (Durban)', province: 'KwaZulu-Natal', metro: 'ETH' },
  { suburb: 'Hillcrest / Kloof', municipality: 'eThekwini (Durban)', province: 'KwaZulu-Natal', metro: 'ETH' },

  // --- KwaZulu-Natal Local Councils ---
  { suburb: 'Pietermaritzburg / Edendale', municipality: 'Msunduzi (Pietermaritzburg)', province: 'KwaZulu-Natal' },
  { suburb: 'Richards Bay / Empangeni', municipality: 'uMhlathuze (Richards Bay)', province: 'KwaZulu-Natal' },
  { suburb: 'Ballito / Salt Rock', municipality: 'KwaDukuza (Ballito/Stanger)', province: 'KwaZulu-Natal' },
  { suburb: 'Newcastle / Madadeni', municipality: 'Newcastle', province: 'KwaZulu-Natal' },
  { suburb: 'Port Shepstone / Margate', municipality: 'Ray Nkonyeni (Port Shepstone)', province: 'KwaZulu-Natal' },
  { suburb: 'Howick / Hilton', municipality: 'uMngeni (Howick)', province: 'KwaZulu-Natal' },

  // --- Eastern Cape ---
  { suburb: 'Gqeberha (Port Elizabeth)', municipality: 'Nelson Mandela Bay (Gqeberha/PE)', province: 'Eastern Cape', metro: 'NMA' },
  { suburb: 'Summerstrand / Humewood', municipality: 'Nelson Mandela Bay (Gqeberha/PE)', province: 'Eastern Cape', metro: 'NMA' },
  { suburb: 'Kariega (Uitenhage)', municipality: 'Nelson Mandela Bay (Gqeberha/PE)', province: 'Eastern Cape', metro: 'NMA' },
  { suburb: 'New Brighton / Motherwell', municipality: 'Nelson Mandela Bay (Gqeberha/PE)', province: 'Eastern Cape', metro: 'NMA' },
  { suburb: 'East London / Mdantsane', municipality: 'Buffalo City (East London)', province: 'Eastern Cape', metro: 'BUF' },
  { suburb: 'Mthatha', municipality: 'King Sabata Dalindyebo (Mthatha)', province: 'Eastern Cape' },
  { suburb: 'Makhanda (Grahamstown)', municipality: 'Makana (Makhanda/Grahamstown)', province: 'Eastern Cape' },
  { suburb: 'Jeffreys Bay / St Francis', municipality: 'Kouga (Jeffreys Bay)', province: 'Eastern Cape' },

  // --- Free State ---
  { suburb: 'Bloemfontein Central', municipality: 'Mangaung (Bloemfontein)', province: 'Free State', metro: 'MAN' },
  { suburb: 'Botshabelo', municipality: 'Mangaung (Bloemfontein)', province: 'Free State', metro: 'MAN' },
  { suburb: 'Thaba Nchu', municipality: 'Mangaung (Bloemfontein)', province: 'Free State', metro: 'MAN' },
  { suburb: 'Welkom', municipality: 'Matjhabeng (Welkom)', province: 'Free State' },
  { suburb: 'Bethlehem / Phuthaditjhaba', municipality: 'Maluti-a-Phofung (QwaQwa)', province: 'Free State' },

  // --- Limpopo ---
  { suburb: 'Polokwane Central / Seshego', municipality: 'Polokwane', province: 'Limpopo' },
  { suburb: 'Tzaneen', municipality: 'Greater Tzaneen', province: 'Limpopo' },
  { suburb: 'Thohoyandou', municipality: 'Thulamela (Thohoyandou)', province: 'Limpopo' },
  { suburb: 'Mokopane (Potgietersrus)', municipality: 'Mogalakwena (Mokopane)', province: 'Limpopo' },

  // --- Mpumalanga ---
  { suburb: 'Mbombela / Nelspruit', municipality: 'City of Mbombela (Nelspruit)', province: 'Mpumalanga' },
  { suburb: 'eMalahleni / Witbank', municipality: 'eMalahleni (Witbank)', province: 'Mpumalanga' },
  { suburb: 'Secunda / Trichardt', municipality: 'Govan Mbeki (Secunda)', province: 'Mpumalanga' },
  { suburb: 'Middelburg', municipality: 'Steve Tshwete (Middelburg)', province: 'Mpumalanga' },

  // --- North West ---
  { suburb: 'Rustenburg / Phokeng', municipality: 'Rustenburg', province: 'North West' },
  { suburb: 'Potchefstroom / Ikageng', municipality: 'JB Marks (Potchefstroom)', province: 'North West' },
  { suburb: 'Mahikeng (Mafikeng)', municipality: 'Mahikeng', province: 'North West' },
  { suburb: 'Klerksdorp / Jouberton', municipality: 'City of Matlosana (Klerksdorp)', province: 'North West' },

  // --- Northern Cape ---
  { suburb: 'Kimberley / Galeshewe', municipality: 'Sol Plaatje (Kimberley)', province: 'Northern Cape' },
  { suburb: 'Upington', municipality: 'Dawid Kruiper (Upington)', province: 'Northern Cape' },
];

/**
 * Searches the suburb directory matching against query string.
 * Returns matches with suburb name, target municipality, and province.
 */
export function searchSuburbs(query: string): SuburbEntry[] {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim().toLowerCase();

  return SA_SUBURBS.filter(
    (entry) =>
      entry.suburb.toLowerCase().includes(q) ||
      entry.municipality.toLowerCase().includes(q) ||
      entry.province.toLowerCase().includes(q)
  ).slice(0, 8); // Top 8 matches
}
