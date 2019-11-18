import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import IPhoneXBarsNavigationNavigationBar1Action1 from "../components/IPhoneXBarsNavigationNavigationBar1Action1";
import Svg, { Path } from "react-native-svg";

function Success1() {
  return (
    <View style={styles.root}>
      <IPhoneXBarsNavigationNavigationBar1Action1
        style={styles.iPhoneXBarsNavigationNavigationBar1Action1}
      />
      <View style={styles.confirmations}>
        <View style={styles.ovalStack}>
          <Svg viewBox="-0 -0 120 120" style={styles.oval}>
            <Path
              strokeWidth={0}
              fill="rgba(204,221,249,1)"
              fillOpacity={1}
              strokeOpacity={1}
              d="M60.00 120.00 C93.14 120.00 120.00 93.14 120.00 60.00 C120.00 26.86 93.14 0.00 60.00 0.00 C26.86 0.00 0.00 26.86 0.00 60.00 C0.00 93.14 26.86 120.00 60.00 120.00 Z"
            />
          </Svg>
          <View style={styles.baselineCheck24Px}>
            <View style={styles.shapeStack}>
              <Svg viewBox="-0 -0 50 50" style={styles.shape}>
                <Path
                  strokeWidth={0}
                  fill="transparent"
                  fillOpacity={1}
                  strokeOpacity={1}
                  d="M0.00 0.00 L50.00 0.00 L50.00 50.00 L0.00 50.00 Z"
                />
              </Svg>
              <Svg viewBox="-0 -0 37 28" style={styles.shape1}>
                <Path
                  strokeWidth={0}
                  fill="rgba(47,95,179,1)"
                  fillOpacity={1}
                  strokeOpacity={1}
                  d="M11.76 22.09 L2.99 13.38 L0.00 16.33 L11.76 28.00 L37.00 2.94 L34.03 0.00 L11.76 22.09 Z"
                />
              </Svg>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,1)"
  },
  iPhoneXBarsNavigationNavigationBar1Action1: {
    width: 375,
    height: 88,
    backgroundColor: "transparent",
    opacity: 1
  },
  confirmations: {
    width: 120,
    height: 120,
    opacity: 1,
    marginTop: 225,
    marginLeft: 128
  },
  oval: {
    top: 0,
    left: 0,
    width: 120,
    height: 120,
    backgroundColor: "transparent",
    position: "absolute",
    borderColor: "transparent"
  },
  baselineCheck24Px: {
    top: 35,
    left: 35,
    width: 50,
    height: 50,
    position: "absolute",
    opacity: 1
  },
  shape: {
    top: 0,
    left: 0,
    width: 50,
    height: 50,
    backgroundColor: "transparent",
    position: "absolute",
    borderColor: "transparent"
  },
  shape1: {
    top: 12,
    left: 7,
    width: 37,
    height: 28,
    backgroundColor: "transparent",
    position: "absolute",
    borderColor: "transparent"
  },
  shapeStack: {
    width: 50,
    height: 50
  },
  ovalStack: {
    width: 120,
    height: 120
  }
});

export default Success1;
