export interface ScoreBreakdown {
  hospital_score: number;
  school_score: number;
  pollution_score: number;
}

export interface Neighborhood {
  id: string;
  name: string;
  city: string;
  region: string;
  area_km2: number;
  score: number;
  breakdown: ScoreBreakdown;
  coordinates: {
    lat: number;
    lng: number;
  };
  zone?: {
    x: number;
    y: number;
    width: number;
    height: number;
    pinX: number;
    pinY: number;
  };
}

export type ScoreCategory = 'all' | 'hospital_score' | 'school_score' | 'pollution_score';
export type MapLayer = 'livability' | 'hospital_score' | 'school_score' | 'pollution_score';
export type ScoreGrade = 'excellent' | 'average' | 'poor';

export interface TopbarFilters {
  minScore: number;
  includeExcellent: boolean;
  includeAverage: boolean;
  includePoor: boolean;
}

export interface NeighborhoodsResponse {
  neighborhoods: Neighborhood[];
  total: number;
}

export interface SearchResponse {
  query: string;
  results: Neighborhood[];
}
