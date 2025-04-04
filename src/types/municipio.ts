/**
 * Interface para representar um município brasileiro com suas coordenadas geográficas
 */
export interface Municipio {
  codigo_ibge: number;
  nome: string;
  latitude: number;
  longitude: number;
  capital: number;
  codigo_uf: number;
  siafi_id: number;
  ddd: number;
  fuso_horario: string;
} 