import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '../constants/theme';
import { Goals } from '../types';

interface Props {
  visible: boolean;
  goals: Goals;
  onSave: (goals: Goals) => void;
  onClose: () => void;
}

type GoalKey = keyof Goals;

const FIELDS: { label: string; key: GoalKey; unit: string }[] = [
  { label: 'Daily Calories', key: 'calories', unit: 'kcal' },
  { label: 'Protein', key: 'protein', unit: 'g' },
  { label: 'Carbohydrates', key: 'carbs', unit: 'g' },
  { label: 'Fat', key: 'fat', unit: 'g' },
  { label: 'Water Bottles (40oz each)', key: 'waterBottles', unit: 'bottles' },
];

export default function GoalsModal({ visible, goals, onSave, onClose }: Props) {
  const [form, setForm] = useState<Goals>(goals);

  useEffect(() => {
    if (visible) setForm(goals);
  }, [visible, goals]);

  const set = (key: GoalKey, val: string) =>
    setForm((f) => ({ ...f, [key]: parseFloat(val) || 0 }));

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kav}
        >
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.title}>Daily Goals</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {FIELDS.map(({ label, key, unit }) => (
                <View key={key} style={styles.field}>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={styles.input}
                      value={String(form[key])}
                      onChangeText={(v) => set(key, v)}
                      keyboardType="numeric"
                      selectTextOnFocus
                      placeholderTextColor={Colors.textSecondary}
                    />
                    <Text style={styles.unit}>{unit}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.btns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={() => {
                  onSave(form);
                  onClose();
                }}
              >
                <Text style={styles.saveTxt}>Save Goals</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'flex-end' },
  kav: { justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 24,
  },
  field: { marginBottom: 18 },
  fieldLabel: { color: Colors.textSecondary, fontSize: 13, marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Colors.white,
    fontSize: 17,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unit: { color: Colors.textSecondary, marginLeft: 12, fontSize: 14, width: 55 },
  btns: { flexDirection: 'row', gap: 12, marginTop: 28 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelTxt: { color: Colors.textSecondary, fontWeight: '600', fontSize: 15 },
  saveBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    alignItems: 'center',
  },
  saveTxt: { color: Colors.white, fontWeight: '700', fontSize: 15 },
});
