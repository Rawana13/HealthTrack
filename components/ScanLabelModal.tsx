import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { FoodItem, FoodLogEntry } from '../types';
import { genId } from '../constants/foods';

const API_KEY_STORAGE = '@ht_anthropic_key';
const CLAUDE_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';

const PROMPT =
  'Read the nutrition facts label in this image carefully. ' +
  'Return ONLY a valid JSON object and nothing else — no explanation, no markdown:\n' +
  '{"name":"product name or Custom Food","servingSize":"serving size as printed",' +
  '"calories":number,"protein":number,"carbs":number,"fat":number}\n' +
  'All macro values must be numbers in grams per serving. calories is a number in kcal.';

type Stage = 'setup' | 'ready' | 'loading' | 'review' | 'error';

interface ParsedLabel {
  name: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const MEALS = ['Meal 1', 'Meal 2', 'Meal 3', 'Added'];

interface Props {
  visible: boolean;
  onAdd: (entry: FoodLogEntry) => void;
  onClose: () => void;
}

export default function ScanLabelModal({ visible, onAdd, onClose }: Props) {
  const [stage, setStage] = useState<Stage>('setup');
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [form, setForm] = useState<ParsedLabel>({
    name: '',
    servingSize: '1 serving',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [meal, setMeal] = useState('Meal 1');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!visible) return;
    AsyncStorage.getItem(API_KEY_STORAGE).then((k) => {
      if (k) {
        setSavedKey(k);
        setStage('ready');
      } else {
        setStage('setup');
      }
    });
  }, [visible]);

  const saveKey = async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) return;
    await AsyncStorage.setItem(API_KEY_STORAGE, trimmed);
    setSavedKey(trimmed);
    setApiKey('');
    setStage('ready');
  };

  const analyzeImage = async (base64: string) => {
    setStage('loading');
    try {
      const res = await fetch(CLAUDE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': savedKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 512,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: { type: 'base64', media_type: 'image/jpeg', data: base64 },
                },
                { type: 'text', text: PROMPT },
              ],
            },
          ],
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: { message?: string } };
        throw new Error(
          body.error?.message ?? `API error ${res.status}. Check your API key.`,
        );
      }

      const data = await res.json() as { content?: { text?: string }[] };
      const text = data.content?.[0]?.text ?? '';

      // Extract JSON block (handles markdown code fences too)
      const match = text.match(/\{[\s\S]*?\}/);
      if (!match) {
        throw new Error(
          "Couldn't find nutrition data in this image. Try a clearer, closer photo of the label.",
        );
      }

      const parsed = JSON.parse(match[0]) as Partial<ParsedLabel>;
      setForm({
        name: String(parsed.name ?? 'Scanned Food'),
        servingSize: String(parsed.servingSize ?? '1 serving'),
        calories: Math.round(Number(parsed.calories) || 0),
        protein: Math.round(Number(parsed.protein) || 0),
        carbs: Math.round(Number(parsed.carbs) || 0),
        fat: Math.round(Number(parsed.fat) || 0),
      });
      setMeal('Meal 1');
      setStage('review');
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
      setStage('error');
    }
  };

  const pickImage = async (useCamera: boolean) => {
    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera permission needed',
          'Go to Settings → HealthTrack and enable Camera access.',
        );
        return;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Photo library permission needed',
          'Go to Settings → HealthTrack and enable Photo Library access.',
        );
        return;
      }
    }

    const opts: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.8,
      allowsEditing: true,
      aspect: [3, 4],
    };

    const result = useCamera
      ? await ImagePicker.launchCameraAsync(opts)
      : await ImagePicker.launchImageLibraryAsync(opts);

    if (!result.canceled && result.assets?.[0]?.base64) {
      await analyzeImage(result.assets[0].base64);
    }
  };

  const handleAdd = () => {
    const food: FoodItem = {
      id: genId(),
      name: form.name || 'Scanned Food',
      category: 'Meals',
      calories: form.calories,
      protein: form.protein,
      carbs: form.carbs,
      fat: form.fat,
      serving: form.servingSize || '1 serving',
    };
    const entry: FoodLogEntry = {
      id: genId(),
      food,
      multiplier: 1,
      servingLabel: food.serving,
      meal,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      timestamp: Date.now(),
    };
    onAdd(entry);
    onClose();
    setStage('ready');
  };

  const setField = <K extends keyof ParsedLabel>(key: K, raw: string) => {
    const isNumeric = key !== 'name' && key !== 'servingSize';
    setForm((prev) => ({
      ...prev,
      [key]: isNumeric ? (parseFloat(raw) || 0) : raw,
    }));
  };

  const reset = () => {
    setErrorMsg('');
    setStage(savedKey ? 'ready' : 'setup');
  };

  const handleClose = () => {
    onClose();
    setApiKey('');
    setErrorMsg('');
    setTimeout(() => setStage(savedKey ? 'ready' : 'setup'), 300);
  };

  const titleMap: Record<Stage, string> = {
    setup: '🔑 API Key Setup',
    ready: '📷 Scan Nutrition Label',
    loading: '🔍 Reading Label…',
    review: '✅ Review & Confirm',
    error: '⚠️ Could Not Read Label',
  };

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ width: '100%' }}
        >
          <View style={styles.sheet}>
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{titleMap[stage]}</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* ── Setup ────────────────────────────────────────── */}
            {stage === 'setup' && (
              <ScrollView contentContainerStyle={styles.body}>
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={20} color={Colors.blue} />
                  <Text style={styles.infoTxt}>
                    This feature uses Claude AI to read nutrition labels. You need a free Anthropic API key — it's stored only on your device.
                  </Text>
                </View>
                <Text style={styles.fieldLabel}>Anthropic API Key</Text>
                <TextInput
                  style={styles.apiInput}
                  value={apiKey}
                  onChangeText={setApiKey}
                  placeholder="sk-ant-api03-…"
                  placeholderTextColor={Colors.textSecondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                />
                <Text style={styles.apiHint}>
                  Get a free key at console.anthropic.com → API Keys
                </Text>
                <TouchableOpacity
                  style={[styles.primaryBtn, !apiKey.trim() && styles.disabled]}
                  onPress={saveKey}
                  disabled={!apiKey.trim()}
                >
                  <Text style={styles.primaryBtnTxt}>Save Key & Continue</Text>
                </TouchableOpacity>
              </ScrollView>
            )}

            {/* ── Ready ────────────────────────────────────────── */}
            {stage === 'ready' && (
              <View style={styles.body}>
                <Text style={styles.hint}>
                  Take a photo of the Nutrition Facts panel on any food packaging. Claude AI will extract the values instantly.
                </Text>
                <TouchableOpacity
                  style={styles.cameraBtn}
                  onPress={() => pickImage(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="camera" size={26} color={Colors.white} />
                  <Text style={styles.cameraBtnTxt}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.galleryBtn}
                  onPress={() => pickImage(false)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="images-outline" size={22} color={Colors.accent} />
                  <Text style={styles.galleryBtnTxt}>Choose from Photo Library</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.linkBtn}
                  onPress={() => { setSavedKey(''); setStage('setup'); }}
                >
                  <Text style={styles.linkTxt}>Change API key</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Loading ───────────────────────────────────────── */}
            {stage === 'loading' && (
              <View style={[styles.body, styles.centered]}>
                <ActivityIndicator size="large" color={Colors.accent} />
                <Text style={styles.loadingTitle}>Analyzing nutrition label…</Text>
                <Text style={styles.loadingSub}>Claude AI is reading the values</Text>
              </View>
            )}

            {/* ── Review ───────────────────────────────────────── */}
            {stage === 'review' && (
              <ScrollView
                contentContainerStyle={styles.body}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {/* Parsed preview banner */}
                <View style={styles.previewBanner}>
                  <Text style={styles.previewName}>{form.name}</Text>
                  <Text style={styles.previewServing}>Per {form.servingSize}</Text>
                  <View style={styles.macroRow}>
                    <MacroChip value={form.calories} label="Cal" color={Colors.accent} unit="kcal" />
                    <MacroChip value={form.protein}  label="Protein" color={Colors.pink}   unit="g" />
                    <MacroChip value={form.carbs}    label="Carbs"   color={Colors.orange} unit="g" />
                    <MacroChip value={form.fat}      label="Fat"     color={Colors.blue}   unit="g" />
                  </View>
                </View>

                <Text style={styles.reviewHint}>Edit any field if needed, then add to your log.</Text>

                {/* Editable fields */}
                <FieldInput
                  label="Food Name"
                  value={form.name}
                  onChangeText={(v) => setField('name', v)}
                />
                <FieldInput
                  label="Serving Size"
                  value={form.servingSize}
                  onChangeText={(v) => setField('servingSize', v)}
                />

                <View style={styles.numGrid}>
                  <NumField label="Calories" unit="kcal" color={Colors.accent}
                    value={form.calories} onChangeText={(v) => setField('calories', v)} />
                  <NumField label="Protein" unit="g" color={Colors.pink}
                    value={form.protein} onChangeText={(v) => setField('protein', v)} />
                  <NumField label="Carbs" unit="g" color={Colors.orange}
                    value={form.carbs} onChangeText={(v) => setField('carbs', v)} />
                  <NumField label="Fat" unit="g" color={Colors.blue}
                    value={form.fat} onChangeText={(v) => setField('fat', v)} />
                </View>

                {/* Meal selector */}
                <Text style={styles.fieldLabel}>Add to Meal</Text>
                <View style={styles.mealRow}>
                  {MEALS.map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.mealChip, meal === m && styles.mealChipActive]}
                      onPress={() => setMeal(m)}
                    >
                      <Text style={[styles.mealChipTxt, meal === m && styles.mealChipTxtActive]}>
                        {m}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={handleAdd}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.white} style={{ marginRight: 8 }} />
                  <Text style={styles.primaryBtnTxt}>Add to Food Log</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.linkBtn} onPress={reset}>
                  <Text style={styles.linkTxt}>← Scan another label</Text>
                </TouchableOpacity>
              </ScrollView>
            )}

            {/* ── Error ────────────────────────────────────────── */}
            {stage === 'error' && (
              <View style={[styles.body, styles.centered]}>
                <Ionicons name="warning" size={48} color={Colors.red} />
                <Text style={styles.errorTitle}>Scanning failed</Text>
                <Text style={styles.errorMsg}>{errorMsg}</Text>
                <TouchableOpacity style={styles.primaryBtn} onPress={reset}>
                  <Text style={styles.primaryBtnTxt}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ── Small sub-components ────────────────────────────────────────────────────

function MacroChip({
  value, label, color, unit,
}: { value: number; label: string; color: string; unit: string }) {
  return (
    <View style={mc.wrap}>
      <Text style={[mc.val, { color }]}>{value}</Text>
      <Text style={mc.unit}>{unit}</Text>
      <Text style={mc.label}>{label}</Text>
    </View>
  );
}
const mc = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center' },
  val:  { fontSize: 20, fontWeight: '800' },
  unit: { fontSize: 10, color: Colors.textSecondary },
  label:{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
});

function FieldInput({
  label, value, onChangeText,
}: { label: string; value: string; onChangeText: (v: string) => void }) {
  return (
    <View style={fi.wrap}>
      <Text style={fi.label}>{label}</Text>
      <TextInput
        style={fi.input}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={Colors.textSecondary}
      />
    </View>
  );
}
const fi = StyleSheet.create({
  wrap:  { marginBottom: 14 },
  label: { color: Colors.textSecondary, fontSize: 12, marginBottom: 6 },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: Colors.border,
  },
});

function NumField({
  label, unit, color, value, onChangeText,
}: { label: string; unit: string; color: string; value: number; onChangeText: (v: string) => void }) {
  return (
    <View style={nf.wrap}>
      <Text style={nf.label}>
        {label} <Text style={nf.unit}>{unit}</Text>
      </Text>
      <TextInput
        style={[nf.input, { borderColor: color + '66' }]}
        value={String(value)}
        onChangeText={onChangeText}
        keyboardType="numeric"
        selectTextOnFocus
        placeholderTextColor={Colors.textSecondary}
      />
    </View>
  );
}
const nf = StyleSheet.create({
  wrap:  { width: '48%', marginBottom: 12 },
  label: { color: Colors.textSecondary, fontSize: 12, marginBottom: 6 },
  unit:  { color: Colors.border, fontSize: 11 },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.white,
    fontSize: 18,
    fontWeight: '800',
    borderWidth: 1.5,
  },
});

// ── Main styles ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { color: Colors.white, fontSize: 18, fontWeight: '800' },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: { padding: 24, paddingBottom: 40 },
  centered: { alignItems: 'center', paddingVertical: 40 },

  // Setup
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.blue + '20',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
    alignItems: 'flex-start',
  },
  infoTxt: { flex: 1, color: Colors.textPrimary, fontSize: 13, lineHeight: 20 },
  fieldLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  apiInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.white,
    fontSize: 13,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
    fontVariant: ['tabular-nums'],
  },
  apiHint: { color: Colors.textSecondary, fontSize: 12, marginBottom: 24 },

  // Ready
  hint: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 28,
  },
  cameraBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.accent,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  cameraBtnTxt: { color: Colors.white, fontSize: 17, fontWeight: '800' },
  galleryBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  galleryBtnTxt: { color: Colors.accent, fontSize: 15, fontWeight: '700' },
  linkBtn: { alignItems: 'center', paddingVertical: 8 },
  linkTxt: { color: Colors.textSecondary, fontSize: 13, textDecorationLine: 'underline' },

  // Loading
  loadingTitle: { color: Colors.white, fontSize: 17, fontWeight: '700', marginTop: 20 },
  loadingSub:   { color: Colors.textSecondary, fontSize: 13, marginTop: 8 },

  // Review
  previewBanner: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewName:    { color: Colors.white, fontSize: 17, fontWeight: '800', marginBottom: 2 },
  previewServing: { color: Colors.textSecondary, fontSize: 13, marginBottom: 16 },
  macroRow:       { flexDirection: 'row' },
  reviewHint:     { color: Colors.textSecondary, fontSize: 13, marginBottom: 16 },
  numGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mealRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  mealChip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mealChipActive:    { backgroundColor: Colors.accent, borderColor: Colors.accent },
  mealChipTxt:       { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  mealChipTxtActive: { color: Colors.white },

  // Shared
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryBtnTxt: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  disabled:      { opacity: 0.4 },

  // Error
  errorTitle: { color: Colors.white, fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 10 },
  errorMsg:   { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 28, paddingHorizontal: 8 },
});
