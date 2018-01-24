import React, { Component } from 'react';
import { ScrollView, StyleSheet, Animated, View, Text, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';

const ACTIVITY_INDICATOR_MARGIN = 10;
const ACTIONABLE_HEIGHT = 20 + (ACTIVITY_INDICATOR_MARGIN * 2); // height of view (on ios at least)

class ScrollContainer extends Component {
  // these will be set onLayout, used for calculations regarding position as a factor of total height
  _contentLength = 0;
  _containerLength = 0;
  _lowestScrollPt = 0;

  // config header collapse settings
  _collapseThreshold = this.props.collapseThreshold || 60;
  _collapseDuration = this.props.collapseDuration || 300;
  _expandThreshold = this.props.expandThreshold || 20
  _expandDuration = this.props.expandDuration || 200;
  _animGracePeriod = this.props.animGracePeriod || 300;

  _anim = new Animated.Value(1);
  _oldPt = 0;
  _wasScrollingDown = false;
  _lastDirectionChangePt = 0;
  _isAnimating = false;
  // _lastEvtTime = new Date().getTime();

  _aiHeight = new Animated.Value(ACTIONABLE_HEIGHT);

  state = {
    headerDimen: 0,
    actionActive: false,
  }

  componentDidUpdate(prevProps) {
    if (prevProps.endActionMoment !== this.props.endActionMoment) {
      if (this.state.actionActive) this.endAction();
    }
  }

  onContentSizeChange = (contentWidth, contentHeight) => {
    this._contentLength = this.props.horizontal ? contentWidth : contentHeight;
    this.setLowestScrollPt();
  }

  onContainerLayout = ({ nativeEvent }) => {
    this._containerLength = this.props.horizontal ? nativeEvent.layout.width : nativeEvent.layout.height;
    this.setLowestScrollPt();
  }

  onHeaderContainerLayout = ({ nativeEvent }) => {
    if (this.state.headerDimen !== 0) return null;
    const headerDimen = this.props.horizontal ? nativeEvent.layout.width : nativeEvent.layout.height;
    this.setState({ headerDimen });
  }

  setLowestScrollPt = () => {
    this._lowestScrollPt = this._contentLength - this._containerLength;
  }

  execAnimation = (toValue) => {
    this._isAnimating = true;
    Animated.timing(
      this._anim,
      {
        toValue,
        duration: toValue === 0 ? this._collapseDuration : this._expandDuration,
      }
    ).start(() => {
      setTimeout(() => {
        this._isAnimating = false;
      }, this._animGracePeriod);
    });
  }

  onScroll = ({ nativeEvent }) => {
    this.checkAction
    this.checkCollapse(nativeEvent);
  }

  checkCollapse = (nativeEvent) => {
    const newPt = nativeEvent.contentOffset[this.props.horizontal ? 'x' : 'y'];
    // check if need be to launch action
    if (this.props.hasAction && newY <= -ACTIONABLE_HEIGHT && !this.state.actionActive) this.startAction();
    // if we are above or below content thresholds, disregard completely
    if (newPt < 0 || newPt > this._lowestScrollPt) return null;
    // if we are at the top, expand
    if (newPt === 0  && this._anim._value === 0) {
      this.execAnimation(1);
      return null;
    }
    const delta = newPt - this._oldPt;

    // get velocity and deliberate duration

    // const newMoment = new Date().getTime();
    // const timeSinceLastEvt = newMoment - this._lastEvtTime;
    // this._lastEvtTime = newMoment;
    // const yPerMs = Math.abs(delta / timeSinceLastEvt);
    // const animDist = globals.headerDimen - globals.headerMinHeight;
    // const duration = (animDist / yPerMs);

    // deliberate possible actions
    const isScrollingDown = delta > 0;
    const shouldCollapse = newPt > (this._lastDirectionChangePt + this._collapseThreshold);
    const shouldExpand = newPt < (this._lastDirectionChangePt - this._expandThreshold);
    if (this._wasScrollingDown !== isScrollingDown) this._lastDirectionChangePt = newPt;
    // reset caches
    this._wasScrollingDown = isScrollingDown;
    this._oldPt = newPt;
    // go no further if animation in progress
    if (this._isAnimating) {
      // set most recent pt as 'zero' from which to measure deltas
       this._lastDirectionChangePt = newPt;
      return null;
    }
    if (shouldCollapse && this._anim._value === 1) {
      this.execAnimation(0);
    } else if (shouldExpand && this._anim._value === 0) {
      this.execAnimation(1);
    }

  }

  startAction = () => {
    this.props.action();
    this.setState({ actionActive: true });
  }

  endAction = () => {
    Animated.timing(
      this._aiHeight,
      { duration: 300, toValue: 0 }
    ).start(() => {
      this.setState({ actionActive: false }, () => {
        this._aiHeight = new Animated.Value(ACTIONABLE_HEIGHT);
      });
    })
  }

  render() {
    const headerDimenInt = this._anim.interpolate({
      inputRange: [0, 1],
      outputRange: [this.props.headerMinHeight || 0, this.state.headerDimen],
    });
    // if we dont yet have headerDimen (from onLayout), we have no max(height/width) to set
    const headerDimenStyle = this.state.headerDimen !== 0 ? (this.props.horizontal ? { width: headerDimenInt } : { height: headerDimenInt }) : null;
    // we can't make innerContainer position absolutely tethered until its wrapper first assesses its significant dimen (onLayout)
    const innerContainerStyle = this.state.headerDimen !== 0 ? (this.props.horizontal ? styles.innerHeaderContainerHorz : styles.innerHeaderContainerVert) : null
    return (
      <View
        style={[styles.container, this.props.horizontal ? styles.containerHorz : null]}
        onLayout={this.onContainerLayout}
      >
        <Animated.View
          onLayout={this.onHeaderContainerLayout}
          style={[styles.headerContainerStyle, headerDimenStyle]}
        >
          <View style={innerContainerStyle}>
            {this.props.header ||
              <View style={this.props.headerContainerStyle || [styles.defaultHeader, this.props.horizontal ? styles.defaultHeaderHorz : styles.defaultHeaderVert]}>
                <Text style={this.props.headerTextStyle}>{this.props.headerText}</Text>
              </View>
            }
          </View>
        </Animated.View>
        <ScrollView
          {...this.props}
          style={[styles.sv, this.props.style]}
          contentContainerStyle={[styles.svContainer, this.props.contentContainerStyle]}
          onContentSizeChange={this.onContentSizeChange}
          scrollEventThrottle={30}
          onScroll={this.onScroll}
        >
          {this.state.actionActive &&
            <Animated.View
              style={[styles.aiContainer, { height: this._aiHeight }]}
            >
              <ActivityIndicator
                size='small'
                style={styles.activityIndicator}
              />
            </Animated.View>
          }
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
  containerHorz: {
    flexDirection: 'row',
  },
  sv: {
    alignSelf: 'stretch',
  },
  svContainer: {

  },
  headerContainerStyle: {
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
  innerHeaderContainerVert: {
    // this will anchor header component to the bottom
    // cannot be applied until
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
  },
  innerHeaderContainerHorz: {
    // this will anchor header component to the right
    // cannot be applied until
    position: 'absolute',
    right: 0,
    bottom: 0,
    top: 0,
    flexDirection: 'row',
  },
  defaultHeader: {
    alignSelf: 'stretch',
    backgroundColor: 'orchid',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultHeaderVert: {
    height: 60,
  },
  defaultHeaderHorz: {
    width: 60,
  },
  activityIndicator: {
    marginTop: ACTIVITY_INDICATOR_MARGIN,
    marginBottom: ACTIVITY_INDICATOR_MARGIN,
  },
  aiContainer: {
    overflow: 'hidden',
  },
});

ScrollContainer.defaultProps = {
  collapseThreshold: 0,
  collapseDuration: 0,
  expandThreshold: 0,
  expandDuration: 0,
  animGracePeriod: 0,
  horizontal: false,
  header: null,
  headerMinHeight: 0,
  headerText: '',
  headerContainerStyle: null,
  headerTextStyle: null,
  hasAction: false,
  action: () => {},
};

ScrollContainer.propTypes = {
  collapseThreshold: PropTypes.number,
  collapseDuration: PropTypes.number,
  expandThreshold: PropTypes.number,
  expandDuration: PropTypes.number,
  animGracePeriod: PropTypes.number,
  horizontal: PropTypes.bool,
  header: PropTypes.element,
  headerMinHeight: PropTypes.number,
  headerText: PropTypes.string,
  // headerContainerStyle,
  // headerTextStyle,
};

export default ScrollContainer;
