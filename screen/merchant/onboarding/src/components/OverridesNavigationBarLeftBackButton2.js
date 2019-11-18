import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

function OverridesNavigationBarLeftBackButton2(props) {
  return (
    <View style={[styles.root, props.style]}>
      <View style={styles.pinLeft}>
        <View style={styles.path6Stack}>
          <Svg viewBox="-0 -0 12 21" style={styles.path6}>
            <Path
              strokeWidth={0}
              fill="rgba(12,37,80,1)"
              fillOpacity={1}
              strokeOpacity={1}
              d="M3.62 10.50 L11.56 2.56 C12.15 1.97 12.15 1.03 11.56 0.44 C10.97 -0.15 10.03 -0.15 9.44 0.44 L0.44 9.44 C-0.15 10.03 -0.15 10.97 0.44 11.56 L9.44 20.56 C10.03 21.15 10.97 21.15 11.56 20.56 C12.15 19.97 12.15 19.03 11.56 18.44 L3.62 10.50 Z"
            />
          </Svg>
          <Svg viewBox="-0 -0 24 24" style={styles.shape198}>
            <Path
              strokeWidth={0}
              fill="transparent"
              fillOpacity={1}
              strokeOpacity={1}
              d="M0.00 0.00 L24.00 0.00 L24.00 24.00 L0.00 24.00 Z"
            />
          </Svg>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  pinLeft: {
    width: 24,
    height: 24,
    opacity: 1,
    marginTop: 10,
    marginLeft: 16
  },
  path6: {
    top: 2,
    left: 4,
    width: 12,
    height: 21,
    backgroundColor: "transparent",
    position: "absolute",
    borderColor: "transparent"
  },
  shape198: {
    top: 0,
    left: 0,
    width: 24,
    height: 24,
    backgroundColor: "transparent",
    position: "absolute",
    borderColor: "transparent"
  },
  path6Stack: {
    width: 24,
    height: 24
  }
});

export default OverridesNavigationBarLeftBackButton2;
