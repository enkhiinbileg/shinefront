import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const Chip = ({ children, selected, onPress, style }) => {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        selected && styles.selectedChip,
        style
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.label,
        selected && styles.selectedLabel
      ]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedChip: {
    backgroundColor: '#007AFF',
  },
  label: {
    fontSize: 14,
    color: '#000000',
  },
  selectedLabel: {
    color: '#FFFFFF',
  },
});

export default Chip; 