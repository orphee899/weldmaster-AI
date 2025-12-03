import { WeldingProcess } from './types';

// Thermal Efficiency (k factor) according to EN 1011-1
export const PROCESS_EFFICIENCY: Record<WeldingProcess, number> = {
  [WeldingProcess.MMA]: 0.8,
  [WeldingProcess.MIG_MAG]: 0.8,
  [WeldingProcess.TIG]: 0.6,
  [WeldingProcess.SAW]: 1.0,
  [WeldingProcess.FCAW]: 0.8,
};

export const INITIAL_PARAMS = {
  voltage: 0,
  current: 0,
  length: 0,
  time: 0,
  process: WeldingProcess.MIG_MAG,
  projectName: '',
  welderName: '',
  weldName: '',
};