/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {
  Button,
  FlatList,
  NativeEventEmitter,
  NativeModules,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import {Section} from './Section';
import {requestBluetoothPermission} from './specs';
import NativeModule from './specs/';
import {Device} from './specs/types/Device';

function App(): React.JSX.Element {
  const [msg, setMsg] = useState<string>('');
  const isDarkMode = useColorScheme() === 'dark';
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDev, setSelectedDev] = useState<Device | undefined>(undefined);
  const [reading, setReading] = useState<number | undefined>(undefined);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    padding: 20,
  };

  const initTherma = async () => {
    await requestBluetoothPermission();
  };

  const startScanning = async () => {
    await NativeModule?.startScanning();
    getDevices();
  };

  const getDevices = () => {
    const devs = NativeModule?.devices();
    if (devs) {
      setDevices(devs.map(d => d as Device));
    } else {
      console.log('No devices');
    }
  };

  const selectDevice = (deviceId: string) => {
    console.log('Fetch device', deviceId);
    const dev = NativeModule.readDevice(deviceId) as {device?: Device};
    if (dev?.device?.deviceName) {
      setSelectedDev(dev.device);
    }
  };

  const getTemperature = (deviceId: string) => {
    console.log('Scan device', deviceId);
    const read = NativeModule.readTemperature(deviceId) as {
      reading?: number;
    };
    setReading(read.reading);
  };

  useEffect(() => {
    setTimeout(() => {
      getDevices();
    }, 3 * 1000);
  }, []);

  useEffect(() => {
    var emitter = new NativeEventEmitter(NativeModules.ThermalibReactNative);
    const sub = emitter.addListener('onMessageChanged', (e: any) => {
      console.log(e);
      setMsg(e.message);
    });

    // IMPORTANT: kick off the native side AFTER adding the listener
    if ((NativeModule as any)?.initThermaLib) {
      (NativeModule as any).initThermaLib();
    } else if ((NativeModules as any).ThermalibReactNative?.initThermaLib) {
      (NativeModules as any).ThermalibReactNative.initThermaLib();
    }

    return () => {
      sub.remove();
    };
  }, []);

  const buttonColor = isDarkMode ? Colors.white : Colors.black;
  const containerStyle = {
    backgroundColor: isDarkMode ? Colors.black : Colors.white,
    padding: 20,
    gap: 10,
  };
  return (
    <SafeAreaView style={backgroundStyle}>
      <View style={containerStyle}>
        <ScrollView>
          <View style={styles.btnContainer}>
            <Button
              color={buttonColor}
              onPress={initTherma}
              title="Bluetooth"
            />
            <Button
              color={buttonColor}
              onPress={startScanning}
              title="Start scanning"
            />
            <Button
              color={buttonColor}
              onPress={async () => await getDevices()}
              title="Get devices"
            />
            <Button
              color={buttonColor}
              title="Get temperature"
              onPress={() => getTemperature(selectedDev?.identifier || '')}
            />
          </View>
          <View style={styles.btnContainer}>
            <Text>{msg}</Text>
            <Text style={styles.device}>{selectedDev?.deviceName}</Text>
            {reading && (
              <View style={styles.temperatureView}>
                <Text style={styles.temperatureText}>Reading: {reading}</Text>
              </View>
            )}
          </View>
          <FlatList
            style={styles.deviceList}
            data={devices}
            keyExtractor={i => i.identifier}
            renderItem={li => (
              <TouchableOpacity
                onPress={() => selectDevice(li.item.identifier)}>
                <View style={styles.deviceView}>
                  <Text
                    key={
                      li.item.identifier ||
                      li.item.deviceName ||
                      li.item.description
                    }>
                    {li.item.identifier} {li.item.deviceName}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </ScrollView>
        <ScrollView style={[backgroundStyle, styles.instructions]}>
          <ReloadInstructions />
          <DebugInstructions />
        </ScrollView>
      </View>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
    </SafeAreaView>
  );
}

export const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  deviceList: {
    minHeight: 100,
    gap: 5,
  },
  highlight: {
    fontWeight: '700',
  },
  btnContainer: {
    gap: 10,
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  device: {
    fontWeight: 500,
    fontStyle: 'italic',
  },
  instructions: {
    flexShrink: 1,
    maxHeight: 500,
  },
  deviceView: {
    minHeight: 15,
    marginVertical: 5,
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    alignContent: 'center',
    justifyContent: 'center',
  },
  temperatureView: {
    minHeight: 15,
    marginVertical: 5,
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#981435',
    padding: 6,
  },
  temperatureText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
});

export default App;
