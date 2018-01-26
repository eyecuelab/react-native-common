import React, { Component } from 'react';
import { Animated, StyleSheet, TouchableOpacity, Text, View, Dimensions } from 'react-native';

const SLIDE_DURATION = 400;
const SIT_DURATION = 7500;
const ON_PRESS_SPEED_MULTIPLIER = 3;

const DEFAULT_BANNER_HEIGHT = 50;

class NotifBanner extends Component {
  state = {
    banners: [],
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.notif) return null;
    if (prevProps.notif.moment !== this.props.notif.moment) {
      this.addNewBanner(this.props.notif);
    }
  }

  addNewBanner = (notif) => {
    const banner = {
      translateY: new Animated.Value(0),
      ...notif,
    }
    this.setState({ banners: this.state.banners.concat(banner) });
    this.openBanner(banner);
  }

  removeBanner = (banner) => {
    const banners = [...this.state.banners];
    let index = null;
    for (var i = 0; i < banners.length; i++) {
      if (banners[i].moment === banner.moment) index = i;
    }
    banners.splice(index, 1);
    this.setState({ banners });

  }

  openBanner = (banner) => {
    const height = this.props.height || DEFAULT_BANNER_HEIGHT;
    const toValue = height;
    Animated.timing(
      banner.translateY,
      { toValue, duration: SLIDE_DURATION }
    ).start(() => {
      // once anim open complete
      // if banner has moved, ignore
      if (banner.translateY._value !== toValue) return null;
      setTimeout(() => {
        this.closeBanner(banner, false);
      }, banner.sitDuration || SIT_DURATION);
    });
  }

  closeBanner = (banner, closeQuickly) => {
    const multiplier = closeQuickly ? ON_PRESS_SPEED_MULTIPLIER : 1;
    Animated.timing(
      banner.translateY,
      { toValue: 0, duration: SLIDE_DURATION / multiplier }
    ).start(() => {
      this.removeBanner(banner);
    });
  }

  renderBanner = (banner, index) => {
    if (!banner ||!banner.moment) return null;
    const height = this.props.height || DEFAULT_BANNER_HEIGHT;
    return (
      <Animated.View
        key={`${banner.moment}`}
        style={[
          styles.bannerContainer,
          { height, top: -height },
          { transform: [{ translateY: banner.translateY }] },
        ]}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.bannerTouchCont, banner.containerStyle || null]}
          onPress={() => {
            this.closeBanner(banner, true);
          }}
        >
          <Text style={[styles.text, banner.textStyle || null]}>{banner.msg}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  renderAllBanners() {
    return this.state.banners.map(this.renderBanner);
  }

  render() {
    const height = this.props.height || DEFAULT_BANNER_HEIGHT;
    return (
      <View
        style={[
          styles.container,
          { height },
        ]}
        pointerEvents='box-none'
      >
        {this.renderAllBanners()}
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  bannerContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  text: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Avenir',
    textAlign: 'center',
  },
  bannerTouchCont: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'red',
    shadowColor: 'black',
    paddingLeft: 20,
    paddingRight: 20,
    shadowOpacity: 0.3,
    shadowOffset: {
      width: 0, height: 0,
    },
    shadowRadius: 14,
    // add elevation for android
    elevation: 5,
  },
});

NotifBanner.defaultProps = {
  notif: {},
}

export default NotifBanner;
