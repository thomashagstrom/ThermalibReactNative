/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import {requestBluetoothPermission} from './specs';
import {Section} from './Section';
import {Device} from './specs/types/Device';
import NativeModule from './specs/';

function App(): React.JSX.Element {
  const [msg, setMsg] = useState<string>('');
  const isDarkMode = useColorScheme() === 'dark';
  const [devices, setDevices] = useState<Device[]>([]);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const initTherma = async () => {
    await requestBluetoothPermission();
  };

  const startScanning = async () => {
    await NativeModule?.startScanning();
  };

  const getDevices = async () => {
    const devs = NativeModule?.devices();
    if (devs) {
      console.log('Devices', devs);
    } else {
      console.log('No devices');
      return;
    }

    setDevices(devs.map(d => d as Device));
  };

  useEffect(() => {
    var emitter = new NativeEventEmitter(NativeModules.NativeThermaLib);
    var listener = emitter.addListener('onMessageChanged', e => {
      console.log(e);
      setMsg(e.message);
    });
    return () => {
      listener.remove();
    };
  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <View style={styles.btnContainer}>
            <Button onPress={initTherma} title="Bluetooth" />
            <Button onPress={startScanning} title="Start scanning" />
            <Button
              onPress={async () => await getDevices()}
              title="Get devices"
            />
          </View>
          <Section title="Native">
            <Text>{msg}</Text>
          </Section>
          <Section title="Devices">
            <View style={styles.deviceList}>
              {devices &&
                devices.map((dev, i) => (
                  <Text
                    key={
                      dev.identifier || dev.deviceName || dev.description || i
                    }>
                    {dev.identifier} {dev?.deviceName}
                  </Text>
                ))}
            </View>
          </Section>
          <Section title="See Your Changes">
            <ReloadInstructions />
          </Section>
          <Section title="Debug">
            <DebugInstructions />
          </Section>
        </View>
      </ScrollView>
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
    justifyContent: 'space-evenly',
    gap: 5,
  },
});

export default App;
