import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useVPN } from '../context/VPNContext';

const ServerListScreen = ({ navigation }) => {
  const { servers, loading, connect, loadServers } = useVPN();

  useEffect(() => {
    loadServers();
  }, []);

  const handleConnect = async (server) => {
    try {
      Alert.alert(
        'Connect to VPN',
        `Connect to ${server.region}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Connect', 
            onPress: async () => {
              try {
                await connect(server);
                Alert.alert(
                  'Connected!', 
                  `Successfully connected to ${server.region}`,
                  [{ text: 'OK', onPress: () => navigation.navigate('Dashboard') }]
                );
              } catch (error) {
                Alert.alert('Connection Failed', error.message);
              }
            }
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to server');
    }
  };

  const renderServer = ({ item }) => (
    <TouchableOpacity 
      style={styles.serverCard} 
      onPress={() => handleConnect(item)}
    >
      <View style={styles.serverInfo}>
        <Text style={styles.serverName}>{item.region}</Text>
        <Text style={styles.serverIP}>{item.ip}</Text>
      </View>
      <View style={styles.serverStatus}>
        <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />
        <Text style={styles.statusText}>Online</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading servers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Server</Text>
        <Text style={styles.subtitle}>Select a server to connect to</Text>
      </View>

      <FlatList
        data={servers}
        renderItem={renderServer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          All servers support WireGuard protocol for maximum security and speed.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  listContainer: {
    padding: 20,
  },
  serverCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  serverInfo: {
    flex: 1,
  },
  serverName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  serverIP: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  serverStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default ServerListScreen;