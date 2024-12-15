import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';
import {ThermDevice} from './ThermalibExpo.types';

export interface Spec extends TurboModule {
  initThermalib(): Promise<void>;
  getDevices(): Promise<Array<ThermDevice[]>>;
  startScanning(): Promise<void>;
}

// Register with the NAME property specified on native side
export default TurboModuleRegistry.getEnforcing<Spec>('ThermalibReactNative');
