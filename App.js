// Kompletní základní React Native aplikace s více městy a offline JSON synchronizací

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const REMOTE_JSON_URL = 'https://raw.githubusercontent.com/vaclavpi/mista-cz/refs/heads/main/data.json';
const STORAGE_KEY = 'cityData';

export default function App() {
  const [data, setData] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedData) {
          setData(JSON.parse(savedData));
        }

        const response = await fetch(REMOTE_JSON_URL);
        const json = await response.json();
        setData(json);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(json));
      } catch (error) {
        console.error('Chyba při načítání dat:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <ActivityIndicator size="large" style={styles.loader} />;

  if (!data) return <Text style={styles.errorText}>Data nelze načíst.</Text>;

  if (selectedCity) {
    return (
      <ScrollView style={styles.container}>
        <TouchableOpacity onPress={() => setSelectedCity(null)}>
          <Text style={styles.back}>← Zpět na seznam měst</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{selectedCity.name}</Text>
        {selectedCity.places.map((place, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>{place.name}</Text>
            <Text style={styles.cardText}>{place.description}</Text>
          </View>
        ))}
      </ScrollView>
    );
  }

  return (
    <FlatList
      data={data.cities}
      keyExtractor={(item) => item.name}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => setSelectedCity(item)} style={styles.card}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardText}>{item.description}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f7fa',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  back: {
    fontSize: 16,
    color: '#1daab1',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: 'red'
  }
});
