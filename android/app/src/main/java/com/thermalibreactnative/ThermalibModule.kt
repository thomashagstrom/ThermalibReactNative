package com.thermalibreactnative

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import uk.co.etiltd.thermalib.Device
import uk.co.etiltd.thermalib.ThermaLib

// the ThermaLib devices the master list contains. Filled in by executing a ThermaLib scan for devices
var devices = arrayOf<Device>()

lateinit var context: ReactApplicationContext

fun refreshDeviceList() {
    devices = TL.deviceList.toTypedArray()
    sendEvent("devices are ${devices.count()}")
}

fun sendEvent(msg: String) {
    Log.d(TAG, msg)
    try {
        val map: WritableMap = Arguments.createMap()
        map.putString("message", msg)
        context.getJSModule(
            DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
        ).emit(
            "onMessageChanged",
            map
        )
    } catch (ex: Exception) {
        ex.message?.let { Log.d(TAG, it) }
    }
}

class ThermalibModule(private val reactContext: ReactApplicationContext) :
    NativeThermaLibSpecSpec(reactContext) {

    override fun getName() = NAME

    companion object {
        const val NAME = TAG
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    override fun initThermalib(promise: Promise?) {
        sendEvent(
            "Register callbacks on ${TL}"
        )
        TL.registerCallbacks(thermaLibCallbacks, TAG)
    }

    override fun startScanning(promise: Promise?) {
        sendEvent(
            "Starting to scan"
        )

        // You can alter how ThermaLib responds to a call to a method that is not applicable to the Device/Sensor for which
        // it has been called. See the documentation for ThermaLib.UnsupportedCallHandling
        //
        TL.unsupportedCallHandling = ThermaLib.UnsupportedCallHandling.LOG

        // ThermaLib: start scan for Bluetooth LE devices, with a 5-second timeout.
        // Completion will be dispatched via tlCallbacks
        TL.stopScanForDevices()
        TL.startScanForDevices(ThermaLib.Transport.BLUETOOTH_LE, 15)
    }

    override fun onMessageChanged() {
        TODO("Not yet implemented")
    }

    override fun getDevices(promise: Promise?) {
        refreshDeviceList()
        if (promise != null) {
            return promise.resolve(devices)
        }
    }

    init {
        context = reactContext
        sendEvent("Init ThermaLib")
        TL = ThermaLib.instance(reactContext)
    }
}

/**
 * Illustrates: Handling of scan-time ThermaLib callbacks
 */
val thermaLibCallbacks = object : ThermaLib.ClientCallbacksBase() {
    override fun onScanComplete(
        transport: Int, scanResult: ThermaLib.ScanResult, numDevices: Int, errorMsg: String?
    ) {
        if (scanResult == ThermaLib.ScanResult.SUCCESS) {
            sendEvent(
                "$numDevices found in scan"
            )

            refreshDeviceList()
        } else {
            sendEvent(
                "Scan failed: ${scanResult.desc}"
            )
        }
    }

    override fun onNewDevice(device: Device, timestamp: Long) {
        sendEvent(
            "New device found: ${device.deviceName}"
        )
        refreshDeviceList()
    }

    override fun onDeviceConnectionStateChanged(
        device: Device, newState: Device.ConnectionState?, timestamp: Long
    ) {
        sendEvent(
            "Device ${device.identifier} changed state -> ${device.connectionState}"
        )
    }

    override fun onDeviceUpdated(device: Device, timestamp: Long) {
    }
}
