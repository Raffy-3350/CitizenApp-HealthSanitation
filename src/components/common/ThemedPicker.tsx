import { Picker } from '@react-native-picker/picker';
import React from 'react';
import { Platform } from 'react-native';

export interface ThemedPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: string[];
  isDarkMode: boolean;
}

export function ThemedPicker({
  value,
  onChange,
  placeholder,
  options,
  isDarkMode,
}: ThemedPickerProps) {
  if (Platform.OS === 'web') {
    return React.createElement(
      'select',
      {
        value,
        onChange: (event: { target: { value: string } }) => onChange(event.target.value),
        style: {
          boxSizing: 'border-box',
          width: '100%',
          height: 50,
          padding: '0 10px',
          color: isDarkMode ? '#F8FAFC' : '#1E293B',
          backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
          border: `1px solid ${isDarkMode ? '#3A506B' : '#CBD5E1'}`,
          borderRadius: 8,
          fontSize: 13,
          appearance: 'auto',
        },
      },
      React.createElement(
        'option',
        {
          value: '',
          style: {
            color: isDarkMode ? '#94A3B8' : '#64748B',
            backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
          },
        },
        placeholder,
      ),
      ...options.map((option) =>
        React.createElement(
          'option',
          {
            key: option,
            value: option,
            style: {
              color: isDarkMode ? '#F8FAFC' : '#1E293B',
              backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
            },
          },
          option,
        ),
      ),
    );
  }

  return (
    <Picker
      selectedValue={value}
      onValueChange={onChange}
      dropdownIconColor={isDarkMode ? '#CBD5E1' : '#64748B'}
      style={{ color: isDarkMode ? '#F8FAFC' : '#1E293B', height: 50 }}
    >
      <Picker.Item label={placeholder} value="" color={isDarkMode ? '#94A3B8' : '#64748B'} />
      {options.map((option) => (
        <Picker.Item
          key={option}
          label={option}
          value={option}
          color={isDarkMode ? '#F8FAFC' : '#1E293B'}
        />
      ))}
    </Picker>
  );
}
