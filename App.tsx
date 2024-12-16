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
  LearnMoreLinks,
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
    const devs = await NativeModule?.getDevices();
    if (devs) {
      console.log('Devices', devs);
    } else {
      console.log('No devices');
    }
    setDevices(devs);
  };

  useEffect(() => {
    var emitter = new NativeEventEmitter(NativeModules.NativeThermaLib);
    var listener = emitter.addListener('onMessageChanged', e => {
      console.log(e);
      setMsg(e.message);
      getDevices();
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
            <ScrollView>
              {devices &&
                devices.map(dev => (
                  <Text>
                    {dev.Identifier} {dev?.description}
                  </Text>
                ))}
            </ScrollView>
          </Section>
          <Section title="See Your Changes">
            <ReloadInstructions />
          </Section>
          <Section title="Debug">
            <DebugInstructions />
          </Section>
          <Section title="Learn More">
            Read the docs to discover what to do next:
          </Section>
          <LearnMoreLinks />
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
  highlight: {
    fontWeight: '700',
  },
  btnContainer: {
    justifyContent: 'space-evenly',
    gap: 5,
  },
});

export default App;
