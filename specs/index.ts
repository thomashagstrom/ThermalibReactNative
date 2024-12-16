// Reexport the native module. On web, it will be resolved to ThermalibExpoModule.web.ts
// and on native platforms to ThermalibExpoModule.ts
import mod from './NativeThermaLibSpec';
export {mod as thermalib};
export type {Device} from './types/';
export * from './requestBluetoothPermission';

export default mod;
