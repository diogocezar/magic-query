export interface Driver {
  id: number;
  name: string;
  created_at: string;
}

export interface Device {
  id: number;
  identifier: string;
  model: string | null;
  vehicle_plate: string | null;
  driver_id: number | null;
  created_at: string;
}

export interface Position {
  id: number;
  device_id: number;
  latitude: number;
  longitude: number;
  speed: number | null;
  direction: number | null;
  collected_at: string;
  created_at: string;
}

export interface QueryResult {
  sql: string;
  data: any[];
  executionTime: number;
}
