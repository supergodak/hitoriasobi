export interface Location {
  id: string;
  name: string;
  type: LocationType;
  latitude: number;
  longitude: number;
  district?: string;
  created_by: string;
  created_at: string;
}

export type LocationType = 'camp' | 'hotel' | 'spot' | 'shop';

export interface LocationFilters {
  type?: LocationType;
  amenities?: string[];
  district?: string;
}