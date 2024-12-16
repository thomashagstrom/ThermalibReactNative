import {DeviceType} from './DeviceType';
import {GenericType} from './GenericType';
import {Sensor} from './Sensor';
import {Unit} from './Unit';

export type Device = {
  RSSI_UNAVAIL: number; // Integer.MIN_VALUE equivalent

  TransportType: number;

  ManufacturerName: string | null;

  SerialNumber: string | null;

  ModelNumber: string | null;

  ProtocolVersion: string;

  HardwareRevision: string;

  SoftwareRevision: string;

  FirmwareRevision: string | null;

  DeviceName: string;

  setDeviceName(name: string): void;

  /**
   * @deprecated
   */
  DeviceAddress: string;

  Identifier: string;

  ConnectionState: string;

  BatteryWarningLevel: string;

  isConnected: boolean;

  isReady: boolean;

  DeviceType: DeviceType;

  MaxSensorCount: number;

  Sensors: Sensor[];

  Sensor(index: number): Sensor;

  BatteryLevel: number;

  updateRssi: void;

  Rssi: number;

  Emissivity: number;

  setEmissivity(emissivity: number): void;

  /**
   * @deprecated
   */
  Unit: Unit; // Deprecated

  /**
   * @deprecated
   */
  setUnit(unit: Unit): void; // Deprecated

  TemperatureDisplayUnit: Unit;

  setTemperatureDisplayUnit(unit: Unit): void;

  DisplayedUnitForGenericSensorType(genericType: GenericType): Unit;

  setDisplayedUnitForGenericSensorType(
    genericType: GenericType,
    unit: Unit,
  ): void;

  MeasurementInterval: number;

  setMeasurementInterval(interval: number): void;

  TransmissionInterval: number;

  setTransmissionInterval(interval: number): void;

  AutoOffInterval: number;

  setAutoOffInterval(interval: number): void;

  isSensorEnabled(index: number): boolean;

  sendCommand(command: number, data: Uint8Array): void;

  isSupportedCommand(command: number): boolean;

  requestConnection(retryCount?: number): void;

  requestDisconnection: void;

  description: string;

  refresh: void;

  /**
   * @deprecated
   */
  inCurrentUnits(value: number): number; // Deprecated

  /**
   * @deprecated
   */
  HighAutoScaleValue: number; // Deprecated

  /**
   * @deprecated
   */
  LowAutoScaleValue: number; // Deprecated

  RemoteSettings: void;

  NextTransmissionTime: number;

  LastTransmissionTime: number;

  LastSettingsUpdateTime: number;

  setPollInterval(interval: number): void;

  PollInterval: number;

  Features: number;

  hasFeature(feature: number): boolean;

  AlarmSettingsAreLimits: boolean;

  setAlarmSettingsAreLimits(value: boolean): void;
};
