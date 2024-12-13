package com.thermalibreactnative

import android.os.Build
import android.os.Bundle
import android.bluetooth.BluetoothManager
import android.content.Context
import android.util.Log
import com.facebook.react.bridge.Promise
import com.thermalibreactnative.NativeThermaLibSpecSpec
import com.facebook.react.bridge.ReactApplicationContext
import uk.co.etiltd.thermalib.Device
import uk.co.etiltd.thermalib.Sensor
import uk.co.etiltd.thermalib.ThermaLib

const val TAG = "ThermalibReactNative"

class ThermalibExpoModule(reactContext: ReactApplicationContext) : NativeThermaLibSpecSpec(reactContext) {
    lateinit var TL: ThermaLib

    override fun getName() = NAME

    companion object {
        const val NAME = TAG
    }

    // It's a Bluetooth app, so FINE_LOCATION permission is required. See permissions() below
    private val MY_PERMISSIONS_REQUEST_FINE_LOCATION = 1

    // the ThermaLib devices the master list contains. Filled in by executing a ThermaLib scan for devices
    private var devices = arrayOf<Device>()

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
            return promise?.resolve(devices as Any)
        };
    }

    init {
        Log.d(TAG, "Init ThermaLib");
        TL = ThermaLib.instance(context);

        // sendEvent("onChange", mapOf(
        //   "value" to "Register callbacks"
        // ))

        Log.d(TAG, "Register callbacks");
        // ThermaLib: Register callbacks. A more sophisticated implementation may register and deregister
        // callbacks dynamically, according to the activity state (started/stopped, paused/resumed..)
        // to avoid callbacks being invoked at inappropriate times.
        TL.registerCallbacks(thermaLibCallbacks, TAG);
    }


    public fun sendEvent(msg: String, data: Any) {
        Log.d(TAG, msg + data)
    }

    private val context: Context
        get() = reactContext ?: throw Exceptions.ReactContextLost()

    private fun initThermalibAsync() {
        sendEvent(
            "onChange", mapOf(
                "value" to "context ${context}"
            )
        )

        Log.d(TAG, "Init ThermaLib");
        sendEvent(
            "onChange", mapOf(
                "value" to "Init ThermaLib"
            )
        )

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

    private fun refreshDeviceList() {
        // ThermaLib: illustrates the deviceList attribute
        devices = TL.deviceList.toTypedArray()
    }

    /**
     * Illustrates: Handling of scan-time ThermaLib callbacks
     */
    private val thermaLibCallbacks = object : ThermaLib.ClientCallbacksBase() {
        override fun onScanComplete(
            transport: Int,
            scanResult: ThermaLib.ScanResult,
            numDevices: Int,
            errorMsg: String?
        ) {
            if (scanResult == ThermaLib.ScanResult.SUCCESS) {
                sendEvent(
                    "onChange", mapOf(
                        "value" to "$numDevices found in scan"
                    )
                )

                Log.d(TAG, "$numDevices found in scan")
                refreshDeviceList()
            } else {
                sendEvent(
                    "onChange",
                    mapOf(
                        "value" to "Scan failed: ${scanResult.desc}"
                    )
                )

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
}
