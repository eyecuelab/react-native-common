import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import DeviceInfo from 'react-native-device-info';

const iPhoneXNotchMask = (props) => {
  const isIphoneX = DeviceInfo.getModel() === 'iPhone X';
  if (!isIphoneX) return null;
  return (
    <View style={styles.container} />
  );
}

const styles = {
  container: {
    alignSelf: 'stretch',
    height: 35,
    backgroundColor: '#000',
  },
}

export default iPhoneXNotchMask;
