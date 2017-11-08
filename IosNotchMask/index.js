import React, { Component } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import DeviceInfo from 'react-native-device-info';

const IosNotchMask = (props) => {
  const isIphoneX = DeviceInfo.getModel() === 'iPhone X';
  if (!isIphoneX) return null;
  return (
    <View style={styles.container} pointerEvents='none'>
      <View style={styles.topBar} />
      <View style={styles.overflowCutoffContainer}>
        <View style={styles.screenContainer} />
      </View>
    </View>
  );
}

export const notchMaskHeight = 35;
const borderWidth = 20;
const window = Dimensions.get('window');

const styles = {
  container: {
    height: notchMaskHeight + borderWidth / 2,
    marginTop: -borderWidth / 2,
    alignSelf: 'stretch',
    zIndex: 1,
  },
  topBar: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: '#000',
  },
  overflowCutoffContainer: {
    height: notchMaskHeight * 2,
    position: 'absolute',
    top: notchMaskHeight,
    overflow: 'hidden',
  },
  screenContainer: {
    height: window.height,
    width: window.width + (borderWidth * 2),
    marginLeft: -borderWidth,
    marginTop: -borderWidth / 2,
    backgroundColor: 'transparent',
    borderColor: '#000',
    borderWidth,
    borderRadius: 45,
  },
}

export default IosNotchMask;
