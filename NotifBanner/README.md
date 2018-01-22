### NotifBanner

## Description

This component will handle display of errors or other notifications, animating them in/out at the top of the screen. every time a new `msg.moment` is changed, the component initializes a new banner in its local state and manages it until the end of its animation cycle.

## API
* `height (optional, default is 50)` = height of banner
* `message` =

```{
  msg: 'Message to be shown in banner',
  moment: new Date().getTime(), // used to differentiate messages from one another. can be in any consistent format
  // optional:
  containerStyle,
  textStyle,
}```
