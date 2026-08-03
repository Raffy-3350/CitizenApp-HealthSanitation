import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useColors } from '../../hooks/useColors';

interface OptionPickerModalProps {
  visible: boolean;
  title: string;
  options: string[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export function OptionPickerModal({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: OptionPickerModalProps) {
  const colors = useColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]} onStartShouldSetResponder={() => true}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
            {options.map((option, index) => {
              const isSelected = selectedValue === option;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionItem,
                    { backgroundColor: colors.background },
                    isSelected && { backgroundColor: colors.primaryLight + '40', borderWidth: 1, borderColor: colors.primary },
                  ]}
                  onPress={() => {
                    onSelect(option);
                    onClose();
                  }}
                >
                  <Text style={[styles.optionText, { color: isSelected ? colors.primary : colors.text }, isSelected && { fontWeight: '600' }]}>
                    {option}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 79, 100, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: Spacing.md,
    maxHeight: '60%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF5FF',
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.subheading,
    color: '#0d4f64',
  },
  closeButton: {
    padding: 4,
  },
  optionsList: {
    paddingVertical: Spacing.xs,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
    backgroundColor: '#EEF5FF50',
  },
  selectedItem: {
    backgroundColor: '#B4D4FF40',
    borderWidth: 1,
    borderColor: '#176B87',
  },
  optionText: {
    ...Typography.body,
    color: '#0d4f64',
  },
  selectedOptionText: {
    fontWeight: '600',
    color: '#176B87',
  },
});
