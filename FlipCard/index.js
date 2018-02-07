import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  Easing,
  TextInput,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';

class FlipCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rotation: new Animated.Value(0),
      backface: !this.props.forwardFacing,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.forwardFacing !== nextProps.forwardFacing) {
      this.flip(nextProps.forwardFacing ? 0 : 1);
    }
  }

  flip(toValue = 1) {
    Animated.timing(this.state.rotation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start(this.props.onFlipEnd);
    this.setState({ backface: !!toValue });
  }

  render() {
    const frontScreenOpacity = this.state.rotation.interpolate({
      inputRange: [0.49, 0.51],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    const backScreenOpacity = this.state.rotation.interpolate({
      inputRange: [0.49, 0.51],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    const frontScreenRotation = this.state.rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    const backScreenRotation = this.state.rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['180deg', '360deg'],
    });
    return (
      <View style={[styles.container, this.props.style]}>
        <Animated.View
          style={{
              ...StyleSheet.absoluteFillObject,
              overflow: this.props.overflow,
              opacity: frontScreenOpacity,
              transform: [
                { rotateY: frontScreenRotation },
                { perspective: 1000 }, // TODO: why isn't persspective working?
              ],
            }}
          pointerEvents={this.state.backface ? 'none' : 'auto'}
        >
          {this.props.frontScreen}
        </Animated.View>
        <Animated.View
          style={{
              ...StyleSheet.absoluteFillObject,
              overflow: this.props.overflow,
              opacity: backScreenOpacity,
              transform: [
                { rotateY: backScreenRotation },
                { perspective: 1000 },
              ],
            }}
          pointerEvents={this.state.backface ? 'auto' : 'none'}
        >
          {this.props.backScreen}
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },

});

FlipCard.defaultProps = {
  frontScreen: <View />,
  backScreen: <View />,
  forwardFacing: true,
  backgroundColor: 'rgb(0, 0, 0)',
  overflow: 'hidden',
  style: null,
  onFlipEnd: () => {},
};
FlipCard.propTypes = {
  frontScreen: PropTypes.element,
  backScreen: PropTypes.element,
  forwardFacing: PropTypes.bool,
  backgroundColor: PropTypes.string,
  overflow: PropTypes.string,
  // onFlipEnd
  // style
};

export default FlipCard;
