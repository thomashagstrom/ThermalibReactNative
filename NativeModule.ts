import {NativeModules} from 'react-native';
import {Spec} from './specs/NativeThermalibReactNativeSpec';

export const {ThermalibModule}: {ThermalibModule: Spec} =
  NativeModules.NativeThermaLib;
export default ThermalibModule;
