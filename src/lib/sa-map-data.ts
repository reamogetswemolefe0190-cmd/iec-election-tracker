import mapGeo from './sa-map-data.json';

export interface ProvinceMapFeature {
  id: string;
  name: string;
  fullName: string;
  centroid: { x: number; y: number };
  path: string;
}

export const SA_MAP_VIEWBOX = {
  width: mapGeo.width || 640,
  height: mapGeo.height || 561,
  padding: 4,
};

export const SA_PROVINCES_GEO: ProvinceMapFeature[] = mapGeo.areas.map((a) => ({
  id: a.id,
  name: a.name,
  fullName: a.name,
  centroid: { x: a.x, y: a.y },
  path: a.d,
}));

/**
 * Calculates monochromatic saturation band matching ElectAI's visual honesty design.
 * Band 1: Under 25% (pale blue tint)
 * Band 2: 25% to 49%
 * Band 3: 50% to 74%
 * Band 4: 75% to 99%
 * Band 5: 100% (solid civic cobalt)
 */
export function getCompletionBand(perc: number): {
  band: 0 | 1 | 2 | 3 | 4 | 5;
  className: string;
  fillColor: string;
  textColor: string;
  label: string;
} {
  if (perc === 0 || !perc) {
    return {
      band: 0,
      className: 'res-map-b0',
      fillColor: '#edf3fa', // Pale grey-blue
      textColor: '#64748b',
      label: 'No results yet',
    };
  }
  if (perc >= 100) {
    return {
      band: 5,
      className: 'res-map-b5',
      fillColor: '#0047b9', // solid cobalt
      textColor: '#ffffff',
      label: 'All counted (100%)',
    };
  }
  if (perc >= 75) {
    return {
      band: 4,
      className: 'res-map-b4',
      fillColor: '#2563eb',
      textColor: '#ffffff',
      label: '75 to 99%',
    };
  }
  if (perc >= 50) {
    return {
      band: 3,
      className: 'res-map-b3',
      fillColor: '#5f97e8',
      textColor: '#ffffff',
      label: '50 to 74%',
    };
  }
  if (perc >= 25) {
    return {
      band: 2,
      className: 'res-map-b2',
      fillColor: '#96bcf2',
      textColor: '#0f172a',
      label: '25 to 49%',
    };
  }
  return {
    band: 1,
    className: 'res-map-b1',
    fillColor: '#cfe2ff', // light blue tint
    textColor: '#1e293b',
    label: 'Under 25%',
  };
}
