/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import type {PropsWithChildren} from 'react';
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

import ThermaLib from './specs/NativeThermaLibSpec';
import {requestBluetoothPermission} from './specs';

type SectionProps = PropsWithChildren<{
  title: string;
  vertical?: boolean;
}>;

function Section({children, title, vertical}: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View
      style={
        (styles.sectionContainer,
        vertical === true ? {flexDirection: 'row'} : {})
      }>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App(): React.JSX.Element {
  const [msg, setMsg] = useState<string>('');
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const initTherma = async () => {
    await requestBluetoothPermission();
  };

  const startScanning = async () => {
    await ThermaLib?.startScanning();
  };

  const getDevices = async () => {
    await ThermaLib?.getDevices();
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
            <Button onPress={getDevices} title="Get devices" />
          </View>
          <Section title="Native">
            <Text>{msg}</Text>
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

const styles = StyleSheet.create({
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
