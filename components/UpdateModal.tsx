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
}

export function UpdateModal({ updateInfo, onDismiss, darkMode }: Props) {
  const themeStyles = darkMode ? darkStyles : lightStyles;

  const handleDownload = () => {
    Linking.openURL(updateInfo.downloadUrl);
    onDismiss();
  };

  return (
    <Modal transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={[styles.dialog, themeStyles.dialog]}>
          <Text style={[styles.title, themeStyles.title]}>Νέα Ενημέρωση</Text>
          <Text style={[styles.body, themeStyles.body]}>
            Η έκδοση <Text style={themeStyles.version}>v{updateInfo.version}</Text> είναι διαθέσιμη.
          </Text>
          <Text style={[styles.body, themeStyles.body]}>
            Θέλεις να κατεβάσεις το νέο APK;
          </Text>
          <View style={styles.buttons}>
            <Pressable style={[styles.btn, styles.btnSecondary, themeStyles.btnSecondary]} onPress={onDismiss}>
              <Text style={[styles.btnText, themeStyles.btnSecondaryText]}>Αργότερα</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.btnPrimary]} onPress={handleDownload}>
              <Text style={[styles.btnText, styles.btnPrimaryText]}>Λήψη</Text>
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
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
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
