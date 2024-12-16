package com.thermalibreactnative

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import uk.co.etiltd.thermalib.Device
import uk.co.etiltd.thermalib.ThermaLib

// the ThermaLib devices the master list contains. Filled in by executing a ThermaLib scan for devices
var deviceList = arrayOf<Device>()

lateinit var context: ReactApplicationContext

fun refreshDeviceList() {
    deviceList = TL.deviceList.toTypedArray()
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

    override fun startScanning(promise: Promise?) {
        // ThermaLib: start scan for Bluetooth LE devices, with a 5-second timeout.
        // Completion will be dispatched via tlCallbacks
        val isConnected = TL.isServiceConnected(ThermaLib.Transport.BLUETOOTH_LE)
        if (isConnected === false) {
            sendEvent("No bluetooth!")
            return
        }

        sendEvent(
            "Starting to scan"
        )

        TL.stopScanForDevices()
        TL.startScanForDevices(ThermaLib.Transport.BLUETOOTH_LE, 20)
    }

    override fun onMessageChanged() {
        TODO("Not yet implemented")
    }

    override fun devices(): WritableArray? {
        refreshDeviceList()
        val map: WritableMap = Arguments.createMap()
        if(deviceList.isNotEmpty()){
            val result = Arguments.createArray()
            for(dev in deviceList){
                result.pushMap(convertDeviceToWritebleMap(dev))
            }
            return result
        }

        return null
    }

    init {
        initLib()
    }

    private fun initLib() {
        context = reactContext
        sendEvent("Init ThermaLib")

        TL = ThermaLib.instance(reactContext)
        // You can alter how ThermaLib responds to a call to a method that is not applicable to the Device/Sensor for which
        // it has been called. See the documentation for ThermaLib.UnsupportedCallHandling
        //
        TL.unsupportedCallHandling = ThermaLib.UnsupportedCallHandling.LOG
        sendEvent("Supported protocols: ${TL.supportedTransports}")
        sendEvent(
            "Register callbacks on ${TL}"
        )

        TL.registerCallbacks(thermaLibCallbacks, TAG)
    }
}

private fun convertDeviceToWritebleMap(dev: Device): WritableMap {
    val map = Arguments.createMap()
    map.putString("identifier", dev.identifier)
    map.putString("deviceName", dev.deviceName)
    map.putString("connectionState", dev.connectionState.toString())
    map.putString("modelNumber",dev.modelNumber)
    map.putString("manufacturerName",dev.manufacturerName)
    map.putInt("batteryLevel",dev.batteryLevel)
    map.putString("description", dev.description())
    map.putString("deviceType", dev.deviceType.toString())
    return map
}

/**
 * Illustrates: Handling of scan-time ThermaLib callbacks
 */
val thermaLibCallbacks = object : ThermaLib.ClientCallbacksBase() {
    override fun onScanComplete(
        transport: Int, scanResult: ThermaLib.ScanResult, numDevices: Int, errorMsg: String?
    ) {
        if (errorMsg !== null) {
            sendEvent(errorMsg)
        }

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
        sendEvent(
            "Device ${device.identifier} updated"
        )
    }
}

data class NameAndID(val name: String, val id: String)