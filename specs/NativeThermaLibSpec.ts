import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';
import {ThermDevice} from './ThermalibExpo.types';

export interface Spec extends TurboModule {
  initThermalib(): Promise<void>;
  getDevices(): Promise<Array<ThermDevice[]>>;
  startScanning(): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeThermalib');
