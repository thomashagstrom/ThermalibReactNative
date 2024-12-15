package com.thermalibreactnative

import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import uk.co.etiltd.thermalib.Device
import uk.co.etiltd.thermalib.ThermaLib

// the ThermaLib devices the master list contains. Filled in by executing a ThermaLib scan for devices

var devices = arrayOf<Device>()

fun refreshDeviceList() {
    // ThermaLib: illustrates the deviceList attribute
    devices = TL.deviceList.toTypedArray()
}

fun sendEvent(msg: String, data: Any) {
    Log.d(TAG, msg + data)
}

class ThermalibModule(private val reactContext: ReactApplicationContext) :
    NativeThermaLibSpecSpec(reactContext) {

    override fun getName() = NAME

    companion object {
        const val NAME = TAG
    }

    // It's a Bluetooth app, so FINE_LOCATION permission is required. See permissions() below
    private val MY_PERMISSIONS_REQUEST_FINE_LOCATION = 1

    // the ThermaLib devices the master list contains. Filled in by executing a ThermaLib scan for devices
    // private var devices = arrayOf<Device>()

    // Defines event names that the module can send to JavaScript.
    //Events("onChange")

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    override fun initThermalib(promise: Promise?) {
        return initThermalibAsync()
    }

    override fun startScanning(promise: Promise?) {
        return startScanningAsync()
    }

    override fun getDevices(promise: Promise?) {
        refreshDeviceList()
        if (promise != null) {
            return promise?.resolve(devices)!!
        }
    }

    init {
        Log.d(TAG, "Init ThermaLib");
        TL = ThermaLib.instance(reactContext);

        // sendEvent("onChange", mapOf(
        //   "value" to "Register callbacks"
        // ))

    }
    
    private fun initThermalibAsync() {
        Log.d(TAG, "Register callbacks");
        sendEvent(
            "onChange", mapOf(
                "value" to "Register callbacks on ${TL}"
            )
        )
        TL.registerCallbacks(thermaLibCallbacks, TAG);
    }

    private fun startScanningAsync() {
        sendEvent(
            "onChange", mapOf(
                "value" to "Starting to scan"
            )
        )

        Log.d(TAG, "Start scanning");

        // You can alter how ThermaLib responds to a call to a method that is not applicable to the Device/Sensor for which
        // it has been called. See the documentation for ThermaLib.UnsupportedCallHandling
        //
        TL.unsupportedCallHandling = ThermaLib.UnsupportedCallHandling.LOG

        // ThermaLib: start scan for Bluetooth LE devices, with a 5-second timeout.
        // Completion will be dispatched via tlCallbacks
        TL.stopScanForDevices();
        TL.startScanForDevices(ThermaLib.Transport.BLUETOOTH_LE, 15);
    }

}

/**
 * Illustrates: Handling of scan-time ThermaLib callbacks
 */
val thermaLibCallbacks = object : ThermaLib.ClientCallbacksBase() {
    override fun onScanComplete(
        transport: Int,
        scanResult: ThermaLib.ScanResult,
        numDevices: Int,
        errorMsg: String?
    ) {
        if (scanResult == ThermaLib.ScanResult.SUCCESS) {
//                sendEvent(
//                    "onChange", mapOf(
//                        "value" to "$numDevices found in scan"
//                    )
//                )

            Log.d(TAG, "$numDevices found in scan")
            refreshDeviceList()
        } else {
//                sendEvent(
//                    "onChange",
//                    mapOf(
//                        "value" to "Scan failed: ${scanResult.desc}"
//                    )
//                )

            Log.e(
                TAG, "Scan failed: ${scanResult.desc}",
                IllegalStateException("Scan requested when already scanning")
            )
        }
    }

    override fun onNewDevice(device: Device, timestamp: Long) {
        Log.d(TAG, "New device found: ${device.deviceName}");
        sendEvent(
            "onChange", mapOf(
                "value" to "New device found: ${device.deviceName}"
            )
        )
        refreshDeviceList()
    }

    override fun onDeviceConnectionStateChanged(
        device: Device,
        newState: Device.ConnectionState?,
        timestamp: Long
    ) {
        Log.d(
            TAG,
            "Device ${device.identifier} changed state -> ${device.connectionState.toString()}"
        )
        sendEvent(
            "onChange", mapOf(
                "value" to "Device ${device.identifier} changed state -> ${device.connectionState.toString()}"
            )
        )
        // instrument_list.adapter?.notifyDataSetChanged()
    }

    override fun onDeviceUpdated(device: Device, timestamp: Long) {
        // instrument_list.adapter?.notifyDataSetChanged()
    }
}
