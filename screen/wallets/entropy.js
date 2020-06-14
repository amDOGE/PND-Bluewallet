/* global alert */
import React, { useReducer } from 'react';
import PropTypes from 'prop-types';
import { Dimensions, View, ScrollView, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import bigInt from 'big-integer';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Icon } from 'react-native-elements';

import { SafeBlueArea, BlueNavigationStyle } from '../../BlueComponents';

// const loc = require('../../loc');
const BlueApp = require('../../BlueApp');

const initialState = { entropy: bigInt(0), bits: 0, items: [] };
export const eReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'push': {
      const { value, bits } = action;
      if (value >= 2 ** bits) {
        throw new TypeError("Can't push value exceeding size in bits");
      }
      const entropy = state.entropy.shiftLeft(bits).plus(value);
      const items = [...state.items, bits];
      return { entropy, bits: state.bits + bits, items };
    }
    case 'pop': {
      if (state.bits === 0) return state;
      const bits = state.items.pop();
      const entropy = state.entropy.shiftRight(bits);
      return { entropy, bits: state.bits - bits, items: [...state.items] };
    }
    default:
      return state;
  }
};

export const entropyToHex = ({ entropy, bits }) => {
  if (bits === 0) return '0x';
  const hex = entropy.toString(16);
  const hexSize = Math.floor((bits - 1) / 4) + 1;
  return '0x' + '0'.repeat(hexSize - hex.length) + hex;
};

export const getEntropy = (number, base) => {
  if (base === 1) return null;
  let maxPow = 1;
  while (2 ** (maxPow + 1) <= base) {
    maxPow += 1;
  }

  let bits = maxPow;
  let summ = 0;
  while (bits >= 1) {
    const block = 2 ** bits;
    if (number < summ + block) {
      return { value: number - summ, bits };
    }
    summ += block;
    bits -= 1;
  }
  return null;
};

const coinStyles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  coin: {
    flex: 0.33,
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 1,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: 'grey',
    margin: 10,
  },
  coinImage: {
    flex: 0.9,
    aspectRatio: 1,
  },
});

const Coin = ({ push }) => (
  <View style={coinStyles.root}>
    <TouchableOpacity onPress={() => push(getEntropy(0, 2))}>
      <View style={coinStyles.coin}>
        <Image style={coinStyles.coinImage} source={require('../../img/coin1.png')} />
      </View>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => push(getEntropy(1, 2))}>
      <View style={coinStyles.coin}>
        <Image style={coinStyles.coinImage} source={require('../../img/coin2.png')} />
      </View>
    </TouchableOpacity>
  </View>
);

Coin.propTypes = {
  push: PropTypes.func.isRequired,
};

const width4 = Dimensions.get('window').width / 4;
const diceStyles = StyleSheet.create({
  root: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  diceRoot: {
    width: width4,
    aspectRatio: 1,
  },
  dice: {
    margin: 3,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: 'grey',
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 1,
  },
  icon: {
    margin: 3,
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 1,
    color: 'grey',
  },
});

const Dice = ({ push, sides }) => {
  const diceIcon = i => {
    switch (i) {
      case 1:
        return 'dice-one';
      case 2:
        return 'dice-two';
      case 3:
        return 'dice-three';
      case 4:
        return 'dice-four';
      case 5:
        return 'dice-five';
      default:
        return 'dice-six';
    }
  };

  return (
    <ScrollView contentContainerStyle={diceStyles.root}>
      {[...Array(sides)].map((_, i) => (
        <TouchableOpacity key={i} onPress={() => push(getEntropy(i, sides))}>
          <View style={diceStyles.diceRoot}>
            {sides === 6 ? (
              <Icon style={diceStyles.icon} name={diceIcon(i + 1)} size={70} color="grey" type="font-awesome-5" />
            ) : (
              <View style={diceStyles.dice}>
                <Text>{i + 1}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

Dice.propTypes = {
  sides: PropTypes.number.isRequired,
  push: PropTypes.func.isRequired,
};

const buttonsStyles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 30,
    borderRadius: 30,
    minHeight: 48,
    overflow: 'hidden',
  },
  body: {
    flex: 1,
    minWidth: 130,
    backgroundColor: BlueApp.settings.buttonBackgroundColor,
  },
  row: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  icon: {
    minWidth: 30,
    minHeight: 30,
    left: 5,
    backgroundColor: 'transparent',
    transform: [{ rotate: '-45deg' }],
    alignItems: 'center',
    marginBottom: -11,
  },
  label: {
    color: BlueApp.settings.buttonAlternativeTextColor,
    fontWeight: '500',
    left: 5,
    backgroundColor: 'transparent',
  },
});

const Buttons = ({ pop }) => (
  <View style={buttonsStyles.root}>
    <TouchableOpacity onPress={pop}>
      <View style={buttonsStyles.body}>
        <View style={buttonsStyles.row}>
          <View style={buttonsStyles.icon}>
            <Icon name="undo" size={16} type="font-awesome" color={BlueApp.settings.buttonAlternativeTextColor} />
          </View>
          <Text style={buttonsStyles.label}>Undo</Text>
        </View>
      </View>
    </TouchableOpacity>
    <TouchableOpacity>
      <View style={buttonsStyles.body}>
        <View style={buttonsStyles.row}>
          <View style={buttonsStyles.icon}>
            <Icon name="arrow-down" size={16} type="font-awesome" color={BlueApp.settings.buttonAlternativeTextColor} />
          </View>
          <Text style={buttonsStyles.label}>Save</Text>
        </View>
      </View>
    </TouchableOpacity>
  </View>
);

Buttons.propTypes = {
  pop: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  entropy: {
    padding: 5,
  },
  entropyText: {
    fontSize: 15,
    fontFamily: 'Courier',
  },
});

const Tab = createMaterialTopTabNavigator();

const Entropy = () => {
  const [entropy, dispatch] = useReducer(eReducer, initialState);

  const push = v => v && dispatch({ type: 'push', value: v.value, bits: v.bits });
  const pop = () => dispatch({ type: 'pop' });

  const hex = entropyToHex(entropy);
  let bits = entropy.bits.toString();
  bits = ' '.repeat(bits.length < 3 ? 3 - bits.length : 0) + bits;

  return (
    <SafeBlueArea>
      <View style={styles.entropy}>
        <Text style={styles.entropyText}>
          {bits} bits: {hex}
        </Text>
      </View>
      <Tab.Navigator>
        <Tab.Screen
          name="Coin"
          options={{
            // eslint-disable-next-line react/prop-types
            tabBarLabel: ({ focused }) => (
              <Icon
                name="toll"
                type="material"
                color={focused ? BlueApp.settings.buttonAlternativeTextColor : BlueApp.settings.buttonBackgroundColor}
              />
            ),
          }}
        >
          {props => <Coin {...props} push={push} />}
        </Tab.Screen>
        <Tab.Screen
          name="D6"
          options={{
            // eslint-disable-next-line react/prop-types
            tabBarLabel: ({ focused }) => (
              <Icon
                name="dice"
                type="font-awesome-5"
                color={focused ? BlueApp.settings.buttonAlternativeTextColor : BlueApp.settings.buttonBackgroundColor}
              />
            ),
          }}
        >
          {props => <Dice {...props} sides={6} push={push} />}
        </Tab.Screen>
        <Tab.Screen
          name="D20"
          options={{
            // eslint-disable-next-line react/prop-types
            tabBarLabel: ({ focused }) => (
              <Icon
                name="dice-d20"
                type="font-awesome-5"
                color={focused ? BlueApp.settings.buttonAlternativeTextColor : BlueApp.settings.buttonBackgroundColor}
              />
            ),
          }}
        >
          {props => <Dice {...props} sides={20} push={push} />}
        </Tab.Screen>
      </Tab.Navigator>
      <Buttons pop={pop} save={() => alert('save')} />
    </SafeBlueArea>
  );
};

Entropy.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
  }),
};

Entropy.navigationOptions = () => ({
  ...BlueNavigationStyle(),
  title: 'Entropy',
  // gestureEnabled: false, TODO
});

export default Entropy;
