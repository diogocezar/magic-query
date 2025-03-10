export const drivers = [
  { name: "João Silva" },
  { name: "Maria Oliveira" },
  { name: "Carlos Santos" },
  { name: "Ana Pereira" },
  { name: "Pedro Souza" },
];

export const devices = [
  {
    identifier: "DEV001",
    model: "Tracker X1",
    vehicle_plate: "ABC1234",
    driver_id: 1,
  },
  {
    identifier: "DEV002",
    model: "Tracker X1",
    vehicle_plate: "DEF5678",
    driver_id: 2,
  },
  {
    identifier: "DEV003",
    model: "Tracker X2",
    vehicle_plate: "GHI9012",
    driver_id: 3,
  },
  {
    identifier: "DEV004",
    model: "Tracker X2",
    vehicle_plate: "JKL3456",
    driver_id: 4,
  },
  {
    identifier: "DEV005",
    model: "Tracker X3",
    vehicle_plate: "MNO7890",
    driver_id: 5,
  },
  {
    identifier: "DEV006",
    model: "Tracker X3",
    vehicle_plate: "PQR1234",
    driver_id: null,
  },
];

interface Position {
  device_id: number;
  latitude: number;
  longitude: number;
  speed: number;
  direction: number;
  collected_at: string;
}

// Função para gerar posições aleatórias em torno de São Paulo
function generateRandomPositions(deviceId: number, count: number): Position[] {
  const positions: Position[] = [];
  // Coordenadas base (São Paulo)
  const baseLat = -23.55;
  const baseLng = -46.64;

  // Data base (últimas 24 horas)
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  for (let i = 0; i < count; i++) {
    // Gerar coordenadas aleatórias em torno da base
    const lat = baseLat + (Math.random() - 0.5) * 0.1;
    const lng = baseLng + (Math.random() - 0.5) * 0.1;

    // Gerar timestamp aleatório entre ontem e hoje
    const timestamp = new Date(
      yesterday.getTime() +
        Math.random() * (now.getTime() - yesterday.getTime())
    ).toISOString();

    // Gerar velocidade aleatória entre 0 e 120 km/h
    const speed = Math.floor(Math.random() * 120);

    // Gerar direção aleatória (0-359 graus)
    const direction = Math.floor(Math.random() * 360);

    positions.push({
      device_id: deviceId,
      latitude: lat,
      longitude: lng,
      speed,
      direction,
      collected_at: timestamp,
    });
  }

  return positions;
}

// Gerar 20 posições para cada dispositivo
export const positions: Position[] = [
  ...generateRandomPositions(1, 20),
  ...generateRandomPositions(2, 20),
  ...generateRandomPositions(3, 20),
  ...generateRandomPositions(4, 20),
  ...generateRandomPositions(5, 20),
  ...generateRandomPositions(6, 20),
];
