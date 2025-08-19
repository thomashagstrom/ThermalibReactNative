//
//  RCTThermalibReactNative.m
//  ThermalibReactNative
//
//  Created by Thomas Hagström on 2025-08-19.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

// The name here MUST match @objc(...) in Swift: ThermalibReactNative
@interface RCT_EXTERN_MODULE(ThermalibReactNative, RCTEventEmitter)

// Export the Swift methods you want JS to call:
RCT_EXTERN_METHOD(initThermaLib)

RCT_EXTERN_METHOD(startScanning:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

// For sync-returning methods (Turbo/Codegen handles returns).
// Declaring them here is enough to expose them.
RCT_EXTERN_METHOD(devices)
RCT_EXTERN_METHOD(readDevice:(NSString *)deviceId)
RCT_EXTERN_METHOD(readTemperature:(NSString *)deviceId)

@end
