import Foundation
import React

let TL = ThermaLib.sharedInstance()!

@objc(ThermalibReactNative)
class ThermalibModule: RCTEventEmitter {
    private var deviceList: [TLDevice] = []

    override init() {
        super.init()
        initLib()
    }

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    override func supportedEvents() -> [String]! {
        return ["onMessageChanged"]
    }

    private func refreshDeviceList() {
        if let list = TL.deviceList() as? [TLDevice] {
            deviceList = list
        }
    }

    private func sendEvent(_ msg: String) {
        self.sendEvent(withName: "onMessageChanged", body: ["message": msg])
    }

    @objc
    func startScanning(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        if !TL.isBluetoothAvailable() {
            sendEvent("No bluetooth!")
            resolve(nil)
            return
        }
        sendEvent("Starting to scan")
        TL.stopDeviceScan()
        TL.startDeviceScan(with: .bluetoothLE)
        resolve(nil)
    }

    @objc
    func devices() -> [[String: Any]]? {
        refreshDeviceList()
        if deviceList.isEmpty {
            return nil
        }
        return deviceList.map { convertDevice($0) }
    }

    @objc
    func readDevice(_ deviceId: String) -> [String: Any] {
        var result: [String: Any] = [:]
        refreshDeviceList()
        guard let dev = deviceList.first(where: { $0.identifier == deviceId }) else {
            sendEvent("Found no match for \(deviceId)")
            return result
        }
        TL.connect(to: dev)
        result["device"] = convertDevice(dev)
        return result
    }

    @objc
    func readTemperature(_ deviceId: String) -> [String: Any] {
        var result: [String: Any] = [:]
        guard let device = TL.device(withIdentifier: deviceId, transport: .bluetoothLE) as? TLDevice else {
            sendEvent("Found no match for \(deviceId)")
            return result
        }
        guard let sensor = device.sensor(at: 1) else {
            sendEvent("Found no sensors on device \(deviceId)")
            return result
        }
        let reading = sensor.reading
        sendEvent("Read device. Value: \(reading)")
        result["reading"] = reading
        return result
    }

    @objc
    func onMessageChanged() {
        // placeholder for TurboModule signature
    }

    private func convertDevice(_ dev: TLDevice) -> [String: Any] {
        var map: [String: Any] = [:]
        map["identifier"] = dev.identifier ?? ""
        map["deviceName"] = dev.deviceName ?? ""
        map["connectionState"] = "\(dev.connectionState)"
        map["modelNumber"] = dev.modelNumber ?? ""
        map["manufacturerName"] = dev.manufacturerName ?? ""
        map["batteryLevel"] = dev.batteryLevel
        map["description"] = dev.description
        map["deviceType"] = dev.deviceTypeName ?? ""
        return map
    }

    private func initLib() {
        sendEvent("Init ThermaLib")
        TL.setSupportedTransports([NSNumber(value: TLTransport.bluetoothLE.rawValue)])
        NotificationCenter.default.addObserver(self, selector: #selector(scanCompleted(_:)), name: NSNotification.Name(rawValue: ThermaLibScanCompletedNotificationName), object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(newDeviceFound(_:)), name: NSNotification.Name(rawValue: ThermaLibNewDeviceFoundNotificationName), object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(deviceUpdated(_:)), name: NSNotification.Name(rawValue: ThermaLibDeviceUpdatedNotificationName), object: nil)
    }

    @objc private func scanCompleted(_ notification: Notification) {
        let count = TL.deviceList().count
        sendEvent("\(count) found in scan")
        refreshDeviceList()
    }

    @objc private func newDeviceFound(_ notification: Notification) {
        if let device = notification.object as? TLDevice {
            sendEvent("New device found: \(device.deviceName ?? "")")
            refreshDeviceList()
        }
    }

    @objc private func deviceUpdated(_ notification: Notification) {
        if let device = notification.object as? TLDevice {
            sendEvent("Device \(device.identifier ?? "") updated")
        }
    }
}
