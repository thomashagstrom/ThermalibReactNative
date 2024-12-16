import {DeviceType} from './DeviceType';
import {GenericType} from './GenericType';
import {Sensor} from './Sensor';
import {Unit} from './Unit';

export type Device = {
  RSSI_UNAVAIL: number; // Integer.MIN_VALUE equivalent

  getTransportType(): number;

  getManufacturerName(): string | null;

  getSerialNumber(): string | null;

  getModelNumber(): string | null;

  getProtocolVersion(): string;

  getHardwareRevision(): string;

  getSoftwareRevision(): string;

  getFirmwareRevision(): string | null;

  getDeviceName(): string;

  setDeviceName(name: string): void;

  /**
   * @deprecated
   */
  getDeviceAddress(): string;

  getIdentifier(): string;

  getConnectionState(): string;

  getBatteryWarningLevel(): string;

  isConnected(): boolean;

  isReady(): boolean;

  getDeviceType(): DeviceType;

  getMaxSensorCount(): number;

  getSensors(): Sensor[];

  getSensor(index: number): Sensor;

  getBatteryLevel(): number;

  updateRssi(): void;

  getRssi(): number;

  getEmissivity(): number;

  setEmissivity(emissivity: number): void;

  /**
   * @deprecated
   */
  getUnit(): Unit; // Deprecated

  /**
   * @deprecated
   */
  setUnit(unit: Unit): void; // Deprecated

  getTemperatureDisplayUnit(): Unit;

  setTemperatureDisplayUnit(unit: Unit): void;

  getDisplayedUnitForGenericSensorType(genericType: GenericType): Unit;

  setDisplayedUnitForGenericSensorType(
    genericType: GenericType,
    unit: Unit,
  ): void;

  getMeasurementInterval(): number;

  setMeasurementInterval(interval: number): void;

  getTransmissionInterval(): number;

  setTransmissionInterval(interval: number): void;

  getAutoOffInterval(): number;

  setAutoOffInterval(interval: number): void;

  isSensorEnabled(index: number): boolean;

  sendCommand(command: number, data: Uint8Array): void;

  isSupportedCommand(command: number): boolean;

  requestConnection(retryCount?: number): void;

  requestDisconnection(): void;

  description(): string;

  refresh(): void;

  /**
   * @deprecated
   */
  inCurrentUnits(value: number): number; // Deprecated

  /**
   * @deprecated
   */
  getHighAutoScaleValue(): number; // Deprecated

  /**
   * @deprecated
   */
  getLowAutoScaleValue(): number; // Deprecated

  getRemoteSettings(): void;

  getNextTransmissionTime(): number;

  getLastTransmissionTime(): number;

  getLastSettingsUpdateTime(): number;

  setPollInterval(interval: number): void;

  getPollInterval(): number;

  getFeatures(): number;

  hasFeature(feature: number): boolean;

  getAlarmSettingsAreLimits(): boolean;

  setAlarmSettingsAreLimits(value: boolean): void;
};
