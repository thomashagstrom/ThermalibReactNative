import Foundation
import React

// Lazily resolve the shared instance to avoid early work
private let TL = ThermaLib.sharedInstance()!

@objc(ThermalibReactNative) // keep this if you use NativeModules.ThermalibReactNative in JS
class ThermalibModule: RCTEventEmitter {
  private var deviceList: [any TLDevice] = []
  private var hasListeners = false

  // Do NOT init/emit here. Let RN bring the module up first.
  override init() {
    super.init()
  }

  @objc override static func requiresMainQueueSetup() -> Bool { true }

  override func supportedEvents() -> [String]! {
    return ["onMessageChanged"]
  }

  override func startObserving() {
    hasListeners = true
    // You may attach SDK delegates here if needed
  }

  override func stopObserving() {
    hasListeners = false
    // Detach delegates if needed
  }

  // Safe emitter: only fires when JS has subscribed
  private func emit(_ msg: String) {
    guard hasListeners else { return }
    sendEvent(withName: "onMessageChanged", body: ["message": msg])
  }

  private func refreshDeviceList() {
    if let list = TL.deviceList() {
      deviceList = list
    }
  }

  // ---- JS-callable API ----

  // Call this from JS AFTER adding the event listener
  @objc func initThermaLib() {
    // Configure SDK + observers now that the bridge/listeners exist
    TL.setSupportedTransports([NSNumber(value: TLTransport.bluetoothLE.rawValue)])

    NotificationCenter.default.addObserver(
      self,
      selector: #selector(scanCompleted(_:)),
      name: NSNotification.Name(rawValue: ThermaLibScanCompletedNotificationName),
      object: nil
    )
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(newDeviceFound(_:)),
      name: NSNotification.Name(rawValue: ThermaLibNewDeviceFoundNotificationName),
      object: nil
    )
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(deviceUpdated(_:)),
      name: NSNotification.Name(rawValue: ThermaLibDeviceUpdatedNotificationName),
      object: nil
    )

    emit("Init ThermaLib")
  }

  @objc func startScanning(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    if !TL.isBluetoothAvailable() {
      emit("No bluetooth!")
      resolve(nil)
      return
    }
    emit("Starting to scan")
    TL.stopDeviceScan()
    TL.startDeviceScan(with: .bluetoothLE)
    resolve(nil)
  }

  @objc func devices() -> [[String: Any]]? {
    refreshDeviceList()
    if deviceList.isEmpty { return nil }
    // Note: convertDevice takes TLDevice (existential), so unwrap `any` existential
    return deviceList.map { convertDevice($0) }
  }

  @objc func readDevice(_ deviceId: String) -> [String: Any] {
    var result: [String: Any] = [:]
    refreshDeviceList()
    guard let dev = deviceList.first(where: { $0.deviceIdentifier == deviceId }) else {
      emit("Found no match for \(deviceId)")
      return result
    }
    TL.connect(to: dev)
    result["device"] = convertDevice(dev)
    return result
  }

  @objc func readTemperature(_ deviceId: String) -> [String: Any] {
    var result: [String: Any] = [:]
    guard let device = TL.device(withIdentifier: deviceId, transport: .bluetoothLE) else {
      emit("Found no match for \(deviceId)")
      return result
    }
    guard let first = device.sensors.first else {
      emit("Found no sensors on device \(deviceId)")
      return result
    }
    let reading = first.reading
    emit("Read device. Value: \(reading)")
    result["reading"] = reading
    return result
  }

  // Placeholder keeps TurboModule signature happy
  @objc func onMessageChanged() {}

  // ---- Notifications ----

  @objc private func scanCompleted(_ notification: Notification) {
    let count = TL.deviceList().count
    emit("\(count) found in scan")
    refreshDeviceList()
  }

  @objc private func newDeviceFound(_ notification: Notification) {
    if let device = notification.object as? TLDevice {
      emit("New device found: \(device.deviceName ?? "")")
      refreshDeviceList()
    }
  }

  @objc private func deviceUpdated(_ notification: Notification) {
    if let device = notification.object as? TLDevice {
      emit("Device \(device.deviceIdentifier ?? "") updated")
    }
  }

  // ---- Helpers ----

  private func convertDevice(_ dev: TLDevice) -> [String: Any] {
    var map: [String: Any] = [:]
    map["identifier"] = dev.deviceIdentifier ?? ""
    map["deviceName"] = dev.deviceName ?? ""
    map["connectionState"] = "\(dev.connectionState)"
    map["modelNumber"] = dev.modelNumber ?? ""
    map["manufacturerName"] = dev.manufacturerName ?? ""
    map["batteryLevel"] = dev.batteryLevel
    map["description"] = dev.description
    map["deviceType"] = dev.deviceTypeName ?? ""
    return map
  }
}
