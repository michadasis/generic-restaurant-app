import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { UpdateInfo } from '@/hooks/useUpdateChecker';
import { i18n, Lang } from '@/constants/i18n';
import { darkTheme, lightTheme, palette } from '@/constants/theme';

interface Props {
  updateInfo: UpdateInfo;
  onDismiss:  () => void;
  darkMode:   boolean;
  lang:       Lang;
}

export function UpdateModal({ updateInfo, onDismiss, darkMode, lang }: Props) {
  const th = darkMode ? darkTheme : lightTheme;
  const t  = i18n[lang];

  return (
    <Modal transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={s.overlay}>
        <View style={[s.dialog, { backgroundColor: th.surface }]}>
          {/* Teal top strip */}
          <View style={[s.strip, { backgroundColor: palette.teal }]} />

          <View style={s.body}>
            <Text style={[s.title, { color: th.textPrimary }]}>{t.updateTitle}</Text>
            <Text style={[s.desc, { color: th.textSecondary }]}>
              {lang === 'gr' ? 'Η έκδοση ' : 'Version '}
              <Text style={{ color: palette.amber, fontWeight: '800' }}>v{updateInfo.version}</Text>
              {lang === 'gr' ? ' είναι διαθέσιμη.' : ' is available.'}
            </Text>
            <Text style={[s.desc, { color: th.textSecondary }]}>{t.updateQuestion}</Text>

            <View style={s.buttons}>
              <Pressable
                style={[s.btn, { backgroundColor: th.surfaceAlt, flex: 1 }]}
                onPress={onDismiss}
              >
                <Text style={[s.btnText, { color: th.textPrimary }]}>{t.later}</Text>
              </Pressable>
              <Pressable
                style={[s.btn, { backgroundColor: palette.teal, flex: 1 }]}
                onPress={() => { Linking.openURL(updateInfo.downloadUrl); onDismiss(); }}
              >
                <Text style={[s.btnText, { color: '#fff' }]}>{t.download}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  dialog:   { width: '100%', borderRadius: 20, overflow: 'hidden' },
  strip:    { height: 4 },
  body:     { padding: 24 },
  title:    { fontSize: 18, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  desc:     { fontSize: 14, lineHeight: 21, textAlign: 'center', marginBottom: 4 },
  buttons:  { flexDirection: 'row', gap: 10, marginTop: 20 },
  btn:      { paddingVertical: 13, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnText:  { fontSize: 14, fontWeight: '700' },
});