import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable, Platform, StatusBar, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AboutScreen() {
  const [darkMode, setDarkMode] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('theme').then(saved => setDarkMode(saved === 'dark'));
  }, []);

  useEffect(() => {
    if (darkMode !== null) {
      AsyncStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }
  }, [darkMode]);

  if (darkMode === null) return null;

  const themeStyles = darkMode ? darkStyles : lightStyles;
  const safePaddingTop = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  return (
    <SafeAreaView style={[styles.root, themeStyles.container, { paddingTop: safePaddingTop }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={themeStyles.card}>
          <Text style={themeStyles.cardTitle}>About this app</Text>
          <View style={themeStyles.divider} />
          <Text style={themeStyles.item}>
            This app was developed for the University of West Macedonia's students in order for them to have easier access to the weekly menu in a clean and simple way.
          </Text>
          <Text style={themeStyles.item}>
            Developed with React Native and designed for mobile devices.
          </Text>
          <Text style={themeStyles.item}>
            Made by Michadasis Ioannis. {' '}
            <Text style={themeStyles.link} onPress={() => Linking.openURL('https://github.com/michadasis/generic-restaurant-app')}>
              GitHub Repo
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 60 },
  themeButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignSelf: 'flex-start',
  },
});

const lightStyles = StyleSheet.create({
  container: { backgroundColor: '#fafafa' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 10, marginBottom: 12 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 8 },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.06)', marginVertical: 8 },
  item: { fontSize: 16, color: '#222', marginBottom: 8, lineHeight: 22 },
  toggleButtonText: { fontSize: 16, color: '#111' },
  link: { color: '#2e7d32', fontWeight: '600', textDecorationLine: 'underline' },
});

const darkStyles = StyleSheet.create({
  container: { backgroundColor: '#181818' },
  card: { backgroundColor: '#252525', padding: 16, borderRadius: 10, marginBottom: 12 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 8 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 8 },
  item: { fontSize: 16, color: '#eee', marginBottom: 8, lineHeight: 22 },
  toggleButtonText: { fontSize: 16, color: '#fff' },
  link: { color: '#81c784', fontWeight: '600', textDecorationLine: 'underline' },
});
