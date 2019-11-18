import React, { Component } from "react";
import { StyleSheet, View, Text } from "react-native";

function OverridesNavigationBarRightActionText1(props) {
  return (
    <View style={[styles.root, props.style]}>
      <View style={styles.editFiller} />
      <Text style={styles.edit}>Edit</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row"
  },
  editFiller: {
    flex: 1,
    flexDirection: "row"
  },
  edit: {
    backgroundColor: "transparent",
    color: "rgba(12,37,80,1)",
    opacity: 1,
    fontSize: 17,
    letterSpacing: -0.41,
    textAlign: "right",
    marginRight: 17,
    marginTop: 12
  }
});

export default OverridesNavigationBarRightActionText1;
