import React from 'react';
import { Button as RNButton, ButtonProps as RNButtonProps, StyleSheet, View } from 'react-native';

export type ButtonProps = RNButtonProps;
export const Button = (props: ButtonProps) => (
  <View style={styles.container}>
    <RNButton {...props} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 8,
    marginVertical: 4,
  },
});
