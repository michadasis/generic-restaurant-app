import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView, Platform, StatusBar,
  Pressable, Modal, TextInput, KeyboardAvoidingView, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SuggestionRow } from '@/data/suggestionsService';
import { useSuggestions, VoteDirection } from '@/data/suggestions';
import { i18n, Lang } from '@/constants/i18n';
import { darkTheme, lightTheme, palette, Theme } from '@/constants/theme';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

export default function SuggestionsScreen() {
  const [dark, setDark] = useState(true);
  const [lang, setLang] = useState<Lang>('gr');
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(useCallback(() => {
    AsyncStorage.multiGet(['theme', 'lang']).then(pairs => {
      const map = Object.fromEntries(pairs);
      if (map.theme !== null) setDark(map.theme === 'dark');
      if (map.lang === 'en' || map.lang === 'gr') setLang(map.lang as Lang);
    });
  }, []));

  const th      = dark ? darkTheme : lightTheme;
  const t       = i18n[lang];
  const safePT  = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
  // The tab bar floats over the screen (position: 'absolute' in the tabs layout),
  // so its height isn't reserved automatically — pad content and float the FAB above it.
  const tabBarHeight = useBottomTabBarHeight();

  const { suggestions, myVotes, loading, error, refresh, create, vote } = useSuggestions();

  const handleVote = (id: number, direction: VoteDirection) => {
    vote(id, direction).catch(() => {});
  };

  const handleSubmit = async (email: string, content: string) => {
    await create(email, content);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={[s.root, { backgroundColor: th.bg, paddingTop: safePT }]}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerTitleRow}>
          <Ionicons name="bulb-outline" size={22} color={palette.amber} />
          <Text style={[s.title, { color: th.textPrimary }]}>{t.suggestionsTitle}</Text>
        </View>
        <Text style={[s.subtitle, { color: th.textMuted }]}>{t.suggestionsSubtitle}</Text>
      </View>

      {suggestions ? (
        <FlatList
          data={suggestions}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={[s.list, { paddingBottom: tabBarHeight + 90 }]}
          renderItem={({ item }) => (
            <SuggestionCard
              item={item}
              myVote={myVotes[item.id] ?? null}
              onVote={dir => handleVote(item.id, dir)}
              th={th}
            />
          )}
          ListEmptyComponent={
            <Text style={[s.empty, { color: th.textMuted }]}>{t.suggestionsEmpty}</Text>
          }
        />
      ) : error && !loading ? (
        <View style={s.centerWrap}>
          <Text style={[s.empty, { color: th.textMuted }]}>{t.suggestionsLoadError}</Text>
          <Pressable onPress={refresh} style={[s.retryBtn, { backgroundColor: th.surfaceAlt }]}>
            <Text style={[s.retryText, { color: th.textPrimary }]}>{t.retry}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={s.centerWrap}>
          <ActivityIndicator color={palette.teal} />
        </View>
      )}

      {/* Floating add button — sits above the floating tab bar, inside this screen */}
      <Pressable
        style={[s.fab, { backgroundColor: palette.teal, bottom: tabBarHeight + 16 }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      <NewSuggestionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        th={th}
        t={t}
      />
    </SafeAreaView>
  );
}

// Subcomponents

function SuggestionCard({ item, myVote, onVote, th }: {
  item: SuggestionRow;
  myVote: VoteDirection | null;
  onVote: (dir: VoteDirection) => void;
  th: Theme;
}) {
  const scoreColor = item.score > 0 ? palette.teal : item.score < 0 ? palette.amber : th.textMuted;

  return (
    <View style={[cs.card, { backgroundColor: th.surface }]}>
      <Text style={[cs.number, { color: th.textMuted }]}>#{item.id}</Text>
      <Text style={[cs.content, { color: th.textPrimary }]}>{item.content}</Text>
      <View style={cs.footer}>
        <Text style={[cs.date, { color: th.textMuted }]}>{formatDate(item.created_at)}</Text>
        <View style={cs.voteRow}>
          <Pressable onPress={() => onVote('like')} hitSlop={8} style={cs.voteBtn}>
            <Ionicons
              name={myVote === 'like' ? 'thumbs-up' : 'thumbs-up-outline'}
              size={17}
              color={myVote === 'like' ? palette.teal : th.textMuted}
            />
          </Pressable>
          <Text style={[cs.score, { color: scoreColor }]}>{item.score}</Text>
          <Pressable onPress={() => onVote('dislike')} hitSlop={8} style={cs.voteBtn}>
            <Ionicons
              name={myVote === 'dislike' ? 'thumbs-down' : 'thumbs-down-outline'}
              size={17}
              color={myVote === 'dislike' ? palette.amber : th.textMuted}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function NewSuggestionModal({ visible, onClose, onSubmit, th, t }: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (email: string, content: string) => Promise<void>;
  th: Theme;
  t: typeof i18n['gr'];
}) {
  const [email, setEmail]     = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg]     = useState<string | null>(null);

  const reset = () => { setEmail(''); setContent(''); setErrorMsg(null); };

  const handleCancel = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    if (!EMAIL_RE.test(email.trim()) || content.trim().length === 0) {
      setErrorMsg(t.suggestionValidation);
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await onSubmit(email, content);
      reset();
    } catch {
      setErrorMsg(t.suggestionSubmitError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={handleCancel}>
      <KeyboardAvoidingView
        style={ms.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[ms.dialog, { backgroundColor: th.surface }]}>
          <View style={[ms.strip, { backgroundColor: palette.teal }]} />

          <View style={ms.body}>
            <Text style={[ms.title, { color: th.textPrimary }]}>{t.newSuggestionTitle}</Text>

            <View style={[ms.hint, { backgroundColor: palette.amber + '18' }]}>
              <Ionicons name="bulb-outline" size={15} color={palette.amber} />
              <Text style={[ms.hintText, { color: palette.amberDark }]}>{t.newSuggestionHint}</Text>
            </View>

            <Text style={[ms.label, { color: th.textSecondary }]}>{t.emailLabel}</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={t.emailPlaceholder}
              placeholderTextColor={th.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={[ms.input, { backgroundColor: th.surfaceAlt, color: th.textPrimary }]}
            />
            <Text style={[ms.fieldHint, { color: th.textMuted }]}>{t.emailHint}</Text>

            <Text style={[ms.label, { color: th.textSecondary, marginTop: 12 }]}>{t.contentLabel}</Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder={t.contentPlaceholder}
              placeholderTextColor={th.textMuted}
              multiline
              numberOfLines={4}
              maxLength={1000}
              style={[ms.input, ms.textArea, { backgroundColor: th.surfaceAlt, color: th.textPrimary }]}
            />

            {errorMsg && <Text style={ms.error}>{errorMsg}</Text>}

            <View style={ms.buttons}>
              <Pressable
                style={[ms.btn, { backgroundColor: th.surfaceAlt, flex: 1 }]}
                onPress={handleCancel}
                disabled={submitting}
              >
                <Text style={[ms.btnText, { color: th.textPrimary }]}>{t.cancel}</Text>
              </Pressable>
              <Pressable
                style={[ms.btn, { backgroundColor: palette.teal, flex: 1, opacity: submitting ? 0.7 : 1 }]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={[ms.btnText, { color: '#fff' }]}>{t.submit}</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// Styles

const s = StyleSheet.create({
  root:   { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, marginBottom: 12 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title:          { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  subtitle:       { fontSize: 13, marginTop: 3 },
  list:      { paddingHorizontal: 20, paddingTop: 4 },
  centerWrap:{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  empty:     { fontSize: 14, textAlign: 'center' },
  retryBtn:  { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, marginTop: 14 },
  retryText: { fontSize: 14, fontWeight: '700' },
  fab: {
    position: 'absolute', right: 20, width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
});

const cs = StyleSheet.create({
  card:    { borderRadius: 14, padding: 14, marginBottom: 12 },
  number:  { fontSize: 11, fontWeight: '700', marginBottom: 3 },
  content: { fontSize: 14, lineHeight: 21, marginBottom: 10 },
  footer:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  date:    { fontSize: 12 },
  voteRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  voteBtn: { padding: 2 },
  score:   { fontSize: 13, fontWeight: '800', minWidth: 18, textAlign: 'center' },
});

const ms = StyleSheet.create({
  overlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  dialog:   { width: '100%', borderRadius: 20, overflow: 'hidden' },
  strip:    { height: 4 },
  body:     { padding: 22 },
  title:    { fontSize: 18, fontWeight: '800', marginBottom: 14, textAlign: 'center' },
  hint:     { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 12, padding: 12, marginBottom: 16 },
  hintText: { flex: 1, fontSize: 12.5, lineHeight: 18, fontWeight: '600' },
  label:    { fontSize: 12.5, fontWeight: '700', marginBottom: 6 },
  input:    { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  fieldHint:{ fontSize: 11, marginTop: 5 },
  error:    { color: '#c0392b', fontSize: 12.5, fontWeight: '700', marginTop: 14, textAlign: 'center' },
  buttons:  { flexDirection: 'row', gap: 10, marginTop: 20 },
  btn:      { paddingVertical: 13, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnText:  { fontSize: 14, fontWeight: '700' },
});
