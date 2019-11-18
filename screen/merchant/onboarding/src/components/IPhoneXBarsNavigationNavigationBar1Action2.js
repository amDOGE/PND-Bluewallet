import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import OverridesNavigationBarLeftBackButton2 from "./OverridesNavigationBarLeftBackButton2";
import OverridesNavigationBarCenterTitle2 from "./OverridesNavigationBarCenterTitle2";
import OverridesNavigationBarRightActionText2 from "./OverridesNavigationBarRightActionText2";

function IPhoneXBarsNavigationNavigationBar1Action2(props) {
  return (
    <View style={[styles.root, props.style]}>
      <View style={styles.stackFiller} />
      <View style={styles.overridesNavigationBarLeftBackButton2StackStack}>
        <View style={styles.overridesNavigationBarLeftBackButton2Stack}>
          <OverridesNavigationBarLeftBackButton2
            style={styles.overridesNavigationBarLeftBackButton2}
          />
          <OverridesNavigationBarCenterTitle2
            style={styles.overridesNavigationBarCenterTitle2}
          />
        </View>
        <OverridesNavigationBarRightActionText2
          style={styles.overridesNavigationBarRightActionText2}
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
  overridesNavigationBarLeftBackButton2: {
    left: 0,
    width: 128,
    height: 44,
    backgroundColor: "transparent",
    position: "absolute",
    bottom: 0,
    opacity: 1
  },
  overridesNavigationBarCenterTitle2: {
    left: 100,
    width: 175,
    height: 44,
    backgroundColor: "transparent",
    position: "absolute",
    bottom: 0,
    opacity: 1
  },
  overridesNavigationBarLeftBackButton2Stack: {
    left: 0,
    width: 275,
    height: 44,
    position: "absolute",
    bottom: 0
  },
  overridesNavigationBarRightActionText2: {
    width: 122,
    height: 44,
    backgroundColor: "transparent",
    position: "absolute",
    right: 0,
    bottom: 0,
    opacity: 1
  },
  overridesNavigationBarLeftBackButton2StackStack: {
    width: 375,
    height: 44
  }
});

export default IPhoneXBarsNavigationNavigationBar1Action2;
