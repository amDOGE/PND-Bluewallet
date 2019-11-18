import React, { Component } from "react";
import { StyleSheet, View, Text } from "react-native";

function OverridesNavigationBarCenterTitle2(props) {
  return (
    <View style={[styles.root, props.style]}>
      <Text style={styles.titleLabel}>Title</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  titleLabel: {
    backgroundColor: "transparent",
    color: "rgba(12,37,80,1)",
    opacity: 1,
    fontSize: 17,
    letterSpacing: -0.41,
    textAlign: "center",
    marginTop: 12,
    marginLeft: 70
  }
});

export default OverridesNavigationBarCenterTitle2;
