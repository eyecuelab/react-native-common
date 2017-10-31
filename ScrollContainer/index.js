import React, { Component } from 'react';
import { ScrollView, StyleSheet, Animated, View } from 'react-native';

// config header collapse settings
const collapseThreshold = 60;
const collapseDuration = 300;
const expandThreshold = 20;
const expandDuration = 200;
const gracePeriodBetweenAnimations = 300;

class ScrollContainer extends Component {
  _contentHeight = 0;
  _containerHeight = 0;
  _lowestYScrollPt = 0;

  _anim = new Animated.Value(0);
  _oldY = 0;
  _wasScrollingDown = false;
  _lastDirectionChangeY = 0;
  _isAnimating = false;
  // _lastEvtTime = new Date().getTime();

  state = {
    headerDimen: 0,
  }

  onContentSizeChange = (contentWidth, contentHeight) => {
    this._contentHeight = contentHeight;
    this.setLowestScrollPt();
  }

  onContainerLayout = ({ nativeEvent }) => {
    this._containerHeight = nativeEvent.layout.height;
    this.setLowestScrollPt();
  }

  onHeaderContainerLayout = ({ nativeEvent }) => {
    const headerDimen = this.props.horizontal ? nativeEvent.layout.width : nativeEvent.layout.height;
    this.setState({ headerDimen });
  }

  setLowestScrollPt = () => {
    this._lowestYScrollPt = this._contentHeight - this._containerHeight;
  }

  execAnimation = (toValue) => {
    this._isAnimating = true;
    Animated.timing(
      this._anim,
      {
        toValue,
        duration: toValue === 0 ? collapseDuration : expandDuration,
      }
    ).start(() => {
      setTimeout(() => {
        this._isAnimating = false;
      }, gracePeriodBetweenAnimations);
    });
  }

  onScroll = ({ nativeEvent }) => {
    const newY = nativeEvent.contentOffset.y;
    // if we are above or below content thresholds, disregard completely
    if (newY < 0 || newY > this._lowestYScrollPt) return null;
    // if we are at the top, expand
    if (newY === 0  && this._anim._value === 0) {
      this.execAnimation(0);
      return null;
    }
    const yDelta = newY - this._oldY;
    
    // get velocity and deliberate duration

    // const newMoment = new Date().getTime();
    // const timeSinceLastEvt = newMoment - this._lastEvtTime;
    // this._lastEvtTime = newMoment;
    // const yPerMs = Math.abs(yDelta / timeSinceLastEvt);
    // const animDist = globals.headerDimen - globals.headerMinHeight;
    // const duration = (animDist / yPerMs);

    // deliberate possible actions
    const isScrollingDown = yDelta > 0;
    const shouldCollapse = newY > (this._lastDirectionChangeY + collapseThreshold);
    const shouldExpand = newY < (this._lastDirectionChangeY - expandThreshold);
    if (this._wasScrollingDown !== isScrollingDown) this._lastDirectionChangeY = newY;
    // reset caches
    this._wasScrollingDown = isScrollingDown;
    this._oldY = newY;
    // go no further if animation in progress
    if (this._isAnimating) {
      // set most recent pt as 'zero' from which to measure deltas
       this._lastDirectionChangeY = newY;
      return null;
    }
    if (shouldCollapse && this._anim._value === 1) {
      this.execAnimation(1);
    } else if (shouldExpand && this._anim._value === 0) {
      this.execAnimation(0);
    }

  }

  render() {
    const headerTranslate = this._anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, (-this.state.headerDimen + (this.props.headerMinHeight || 0))],
    });
    const transform = this.props.horizontal ? [{ translateX: headerTranslate }] : [{ translateY: headerTranslate }];
    return (
      <View
        style={styles.container}
        onLayout={this.onContainerLayout}
      >
        <ScrollView
          {...this.props}
          style={[styles.sv, this.props.style]}
          contentContainerStyle={[styles.svContainer, this.props.contentContainerStyle]}
          onContentSizeChange={this.onContentSizeChange}
          scrollEventThrottle={30}
          onScroll={this.onScroll}
        >
          <Animated.View
            onLayout={this.onHeaderContainerLayout}
            style={[styles.headerContainerStyle, { transform }]}
          >
            {this.props.header ||
              <View style={[styles.deafultHeader, this.props.horizontal ? styles.defaultHeaderHorz : styles.defaultHeaderVert]} />
            }
          </Animated.View>
          {this.props.children}
        </ScrollView>
      </View>
    );
  }
};


const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    flex: 1,
  },
  sv: {
    alignSelf: 'stretch',
  },
  svContainer: {

  },
  headerContainerStyle: {
    alignSelf: 'flex-start',
  },
  defaultHeader: {
    alignSelf: 'stretch',
    backgroundColor: '#ccc',
  },
  defaultHeaderVert: {
    height: 100,
  },
  defaultHeaderHorz: {
    width: 100,
  },
});

export default ScrollContainer;
