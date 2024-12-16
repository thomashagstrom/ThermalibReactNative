import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export type onMessageEvent = (msg: unknown) => void;

export interface Spec extends TurboModule {
  devices(): Array<Object> | null;
  startScanning(): Promise<void>;
  onMessageChanged: () => void;
}

// Register with the NAME property specified on native side
export default TurboModuleRegistry.getEnforcing<Spec>('ThermalibReactNative');
