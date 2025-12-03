export enum WeldingProcess {
  MMA = 'MMA (111)', // Arc Manuel, k=0.8
  MIG_MAG = 'MIG/MAG (131/135)', // k=0.8
  TIG = 'TIG (141)', // k=0.6
  SAW = 'SAW (121)', // Arc submergé, k=1.0
  FCAW = 'FCAW (136)', // Fil fourré, k=0.8
}

export interface WeldingParams {
  voltage: number; // Volts
  current: number; // Amps
  length: number; // mm (Weld length)
  time: number; // seconds (Arc time)
  process: WeldingProcess;
  // Traçabilité
  projectName: string;
  welderName: string;
  weldName: string;
}

export interface CalculationResult {
  heatInput: number; // kJ/mm
  travelSpeed: number; // mm/s
  power: number; // Watts
  isValid: boolean;
}

export interface AiAdviceResponse {
  analysis: string;
  recommendations: string[];
  safety: string;
}

export interface WeldingPass {
  id: string;
  timestamp: number;
  process: WeldingProcess;
  current: number;
  voltage: number;
  length: number;
  time: number;
  heatInput: number;
  kFactor: number;
  // Traçabilité
  projectName: string;
  welderName: string;
  weldName: string;
}