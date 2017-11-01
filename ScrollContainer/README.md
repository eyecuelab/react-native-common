# ScrollContainer

*A ScrollView with a collapsible header*

### Properties

`collapseThreshold` - pts from last direction change before header collapse
`expandThreshold` - pts from last direction change before header expansion
`collapseDuration` - duration of collapse anim, generally quicker than expand
`expandDuration` - expansion anim duraiton
`animGracePeriod` - time (in Ms) after one animation before we allow another animation
`header` - header component
`headerMinHeight` - if you want header to not collapse completely, set a min Height
`headerContainerStyle` - style for default header container
`headerTextStyle` - style for default header text
`headerText` - text for default header


all ScrollView props are passed down as well, including `horizontal`
