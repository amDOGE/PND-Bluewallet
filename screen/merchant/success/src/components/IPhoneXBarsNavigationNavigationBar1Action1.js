import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import OverridesNavigationBarLeftBackButton1 from "./OverridesNavigationBarLeftBackButton1";
import OverridesNavigationBarCenterTitle1 from "./OverridesNavigationBarCenterTitle1";
import OverridesNavigationBarRightActionText1 from "./OverridesNavigationBarRightActionText1";

function IPhoneXBarsNavigationNavigationBar1Action1(props) {
  return (
    <View style={[styles.root, props.style]}>
      <View style={styles.stackFiller} />
      <View style={styles.overridesNavigationBarLeftBackButton1StackStack}>
        <View style={styles.overridesNavigationBarLeftBackButton1Stack}>
          <OverridesNavigationBarLeftBackButton1
            style={styles.overridesNavigationBarLeftBackButton1}
          />
          <OverridesNavigationBarCenterTitle1
            style={styles.overridesNavigationBarCenterTitle1}
          />
        </View>
        <OverridesNavigationBarRightActionText1
          style={styles.overridesNavigationBarRightActionText1}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  stackFiller: {
    flex: 1
  },
  overridesNavigationBarLeftBackButton1: {
    left: 0,
    width: 128,
    height: 44,
    backgroundColor: "transparent",
    position: "absolute",
    bottom: 0,
    opacity: 1
  },
  overridesNavigationBarCenterTitle1: {
    left: 100,
    width: 175,
    height: 44,
    backgroundColor: "transparent",
    position: "absolute",
    bottom: 0,
    opacity: 1
  },
  overridesNavigationBarLeftBackButton1Stack: {
    left: 0,
    width: 275,
    height: 44,
    position: "absolute",
    bottom: 0
  },
  overridesNavigationBarRightActionText1: {
    width: 122,
    height: 44,
    backgroundColor: "transparent",
    position: "absolute",
    right: 0,
    bottom: 0,
    opacity: 1
  },
  overridesNavigationBarLeftBackButton1StackStack: {
    width: 375,
    height: 44
  }
});

export default IPhoneXBarsNavigationNavigationBar1Action1;
