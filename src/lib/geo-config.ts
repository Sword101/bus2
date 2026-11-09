/**
 * Geographical Configuration for BusTrack
 * Default City: Bhopal, Madhya Pradesh, India
 */

export const BHOPAL_CENTER = {
  city: 'Bhopal',
  state: 'Madhya Pradesh',
  country: 'India',
  lat: 23.2599,
  lng: 77.4126,
} as const;

export const DEFAULT_MAP_CENTER: [number, number] = [BHOPAL_CENTER.lat, BHOPAL_CENTER.lng];
export const DEFAULT_MAP_ZOOM = 13;

/**
 * Real Bhopal Transit Hubs & Landmarks
 */
export interface BhopalLandmark {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category: 'railway' | 'transit_hub' | 'academic' | 'medical' | 'commercial' | 'junction';
}

export const BHOPAL_LANDMARKS: BhopalLandmark[] = [
  {
    name: 'Bhopal Junction Railway Station',
    address: 'Platform 1, Station Road, Old Bhopal',
    latitude: 23.2694,
    longitude: 77.4126,
    category: 'railway',
  },
  {
    name: 'Rani Kamlapati Railway Station (Habibganj)',
    address: 'Habibganj Commercial Complex, South Bhopal',
    latitude: 23.2144,
    longitude: 77.4379,
    category: 'railway',
  },
  {
    name: 'MP Nagar Zone-1 (DB City Mall)',
    address: 'Hoshangabad Road, MP Nagar, Bhopal',
    latitude: 23.2332,
    longitude: 77.4332,
    category: 'commercial',
  },
  {
    name: 'New Market (TT Nagar)',
    address: 'Malviya Nagar, TT Nagar, Bhopal',
    latitude: 23.2361,
    longitude: 77.3994,
    category: 'commercial',
  },
  {
    name: 'MANIT Bhopal Campus',
    address: 'Link Road Number 3, Near Kali Mata Mandir, Bhopal',
    latitude: 23.2163,
    longitude: 77.4067,
    category: 'academic',
  },
  {
    name: 'AIIMS Bhopal',
    address: 'Saket Nagar, Habibganj, Bhopal',
    latitude: 23.2069,
    longitude: 77.4600,
    category: 'medical',
  },
  {
    name: 'Lalghati Circle (VIP Road)',
    address: 'Lalghati Junction, VIP Road, Northern Bhopal',
    latitude: 23.2838,
    longitude: 77.3629,
    category: 'junction',
  },
  {
    name: 'Karond Chowk (Berasia Road)',
    address: 'Berasia Road, Karond, Northern Bhopal',
    latitude: 23.3082,
    longitude: 77.3970,
    category: 'junction',
  },
  {
    name: 'Raja Bhoj Airport (Gandhi Nagar)',
    address: 'Airport Road, Gandhi Nagar, Bhopal',
    latitude: 23.2875,
    longitude: 77.3378,
    category: 'transit_hub',
  },
  {
    name: 'Shahpura Lake Bus Stop',
    address: 'Rohit Nagar / Kolar Road Junction, Bhopal',
    latitude: 23.1950,
    longitude: 77.4270,
    category: 'transit_hub',
  },
  {
    name: 'Bairagarh (Sant Hirdaram Nagar)',
    address: 'Main Market Road, Bairagarh, Bhopal',
    latitude: 23.2730,
    longitude: 77.3420,
    category: 'transit_hub',
  },
  {
    name: 'Govindpura BHEL Complex',
    address: 'JK Road, Govindpura Industrial Area, Bhopal',
    latitude: 23.2550,
    longitude: 77.4650,
    category: 'transit_hub',
  },
];
