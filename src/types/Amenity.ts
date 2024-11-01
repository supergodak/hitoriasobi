export interface Amenity {
  id: string;
  location_id: string;
  has_shower: boolean;
  has_power: boolean;
  has_parking: boolean;
  is_pet_friendly: boolean;
  has_wifi: boolean;
  created_at: string;
}

export interface AmenityFilters {
  requireShower?: boolean;
  requirePower?: boolean;
  requireParking?: boolean;
  requirePetFriendly?: boolean;
  requireWifi?: boolean;
}