import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export type onMessageEvent = (msg: unknown) => void;

export interface Spec extends TurboModule {
  /**
   * Get the current list of devices.
   */
  devices(): Array<Object> | null;
  startScanning(): Promise<void>;
  onMessageChanged: () => void;
  /**
   *
   * @param deviceId ID of the device {@link Device.identifier}
   */
  readDevice(deviceId: string): Object;
}

// Register with the NAME property specified on native side
export default TurboModuleRegistry.getEnforcing<Spec>('ThermalibReactNative');
