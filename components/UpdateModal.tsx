import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Linking,
} from 'react-native';
import { UpdateInfo } from '@/hooks/useUpdateChecker';

interface Props {
  updateInfo: UpdateInfo;
  onDismiss: () => void;
  darkMode: boolean;
  lang: Lang;
}

import { i18n, Lang } from '@/constants/i18n';

export function UpdateModal({ updateInfo, onDismiss, darkMode, lang }: Props) {
  const themeStyles = darkMode ? darkStyles : lightStyles;
  const t = i18n[lang];

  const handleDownload = () => {
    Linking.openURL(updateInfo.downloadUrl);
    onDismiss();
  };

  return (
    <Modal transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={[styles.dialog, themeStyles.dialog]}>
          <Text style={[styles.title, themeStyles.title]}>{t.updateTitle}</Text>
          <Text style={[styles.body, themeStyles.body]}>
            {lang === 'gr' ? 'Η έκδοση ' : 'Version '}
            <Text style={themeStyles.version}>v{updateInfo.version}</Text>
            {lang === 'gr' ? ' είναι διαθέσιμη.' : ' is available.'}
          </Text>
          <Text style={[styles.body, themeStyles.body]}>{t.updateQuestion}</Text>
          <View style={styles.buttons}>
            <Pressable style={[styles.btn, styles.btnSecondary, themeStyles.btnSecondary]} onPress={onDismiss}>
              <Text style={[styles.btnText, themeStyles.btnSecondaryText]}>{t.later}</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.btnPrimary]} onPress={handleDownload}>
              <Text style={[styles.btnText, styles.btnPrimaryText]}>{t.download}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  dialog: {
    width: '100%',
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  body: {
    fontSize: 15,
    marginBottom: 6,
    lineHeight: 22,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: '#2e7d32',
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  btnSecondary: {},
  btnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

const lightStyles = StyleSheet.create({
  dialog: { backgroundColor: '#fff' },
  title: { color: '#111' },
  body: { color: '#444' },
  version: { color: '#2e7d32', fontWeight: '700' },
  btnSecondary: { backgroundColor: 'rgba(0,0,0,0.06)' },
  btnSecondaryText: { color: '#333' },
});

const darkStyles = StyleSheet.create({
  dialog: { backgroundColor: '#252525' },
  title: { color: '#fff' },
  body: { color: '#ccc' },
  version: { color: '#81c784', fontWeight: '700' },
  btnSecondary: { backgroundColor: 'rgba(255,255,255,0.1)' },
  btnSecondaryText: { color: '#ddd' },
});