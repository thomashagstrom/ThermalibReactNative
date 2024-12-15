package com.thermalibreactnative

import android.util.Log
import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import uk.co.etiltd.thermalib.ThermaLib

const val TAG = "ThermalibReactNative"
lateinit var TL: ThermaLib

class ThermalibPackage : TurboReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
        if (name == ThermalibModule.NAME) {
            Log.d(TAG, "Init module");
            ThermalibModule(reactContext);
        } else {
            null
        }

    override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
        mapOf(
            ThermalibModule.NAME to ReactModuleInfo(
                _name = ThermalibModule.NAME,
                _className = ThermalibModule.NAME,
                _canOverrideExistingModule = false,
                _needsEagerInit = false,
                isCxxModule = false,
                isTurboModule = true
            )
        )
    }
}