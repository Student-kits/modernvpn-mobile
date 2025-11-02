import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { useVPN } from '../context/VPNContext';
import APIService from '../services/APIService';

const VPNStatusScreen = ({ navigation }) => {
  const { isConnected, connectionStatus, currentServer, disconnect } = useVPN();
  const [usage, setUsage] = useState('0');
  const [submitting, setSubmitting] = useState(false);

  const handleDisconnect = async () => {
    try {
      await disconnect();
      Alert.alert('Disconnected', 'VPN has been disconnected');
      navigation.navigate('Dashboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to disconnect VPN');
    }
  };

  const handleUsageUpdate = async () => {
    if (!usage || isNaN(usage)) {
      Alert.alert('Error', 'Please enter a valid number');
      return;
    }

    try {
      setSubmitting(true);
      await APIService.updateUsage(parseInt(usage));
      Alert.alert('Success', 'Usage updated successfully');
      setUsage('0');
    } catch (error) {
      Alert.alert('Error', 'Failed to update usage');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#10b981';
      case 'connecting': return '#f59e0b';
      case 'disconnecting': return '#f59e0b';
      default: return '#ef4444';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected & Protected';
      case 'connecting': return 'Establishing Connection...';
      case 'disconnecting': return 'Disconnecting...';
      default: return 'Not Connected';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statusSection}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusTitle}>{getStatusText()}</Text>
        
        {currentServer && (
          <View style={styles.serverDetails}>
            <Text style={styles.detailLabel}>Server Location</Text>
            <Text style={styles.detailValue}>{currentServer.region}</Text>
            
            <Text style={styles.detailLabel}>Server IP</Text>
            <Text style={styles.detailValue}>{currentServer.ip}</Text>
            
            <Text style={styles.detailLabel}>Protocol</Text>
            <Text style={styles.detailValue}>WireGuard</Text>
          </View>
        )}
      </View>

      {isConnected && (
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnect}>
            <Text style={styles.buttonText}>Disconnect VPN</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.usageSection}>
        <Text style={styles.sectionTitle}>Report Data Usage</Text>
        <Text style={styles.sectionSubtitle}>
          Help us track your data consumption (in MB)
        </Text>
        
        <View style={styles.usageInput}>
          <TextInput
            style={styles.input}
            placeholder="Data used (MB)"
            value={usage}
            onChangeText={setUsage}
            keyboardType="numeric"
          />
          <TouchableOpacity 
            style={[styles.updateButton, submitting && styles.buttonDisabled]} 
            onPress={handleUsageUpdate}
            disabled={submitting}
          >
            <Text style={styles.updateButtonText}>
              {submitting ? 'Updating...' : 'Update'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Connection Info</Text>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Encryption:</Text>
          <Text style={styles.infoValue}>ChaCha20-Poly1305</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Key Exchange:</Text>
          <Text style={styles.infoValue}>Curve25519</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>DNS:</Text>
          <Text style={styles.infoValue}>1.1.1.1, 1.0.0.1</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Kill Switch:</Text>
          <Text style={styles.infoValue}>Enabled</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  statusSection: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  serverDetails: {
    width: '100%',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 12,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  actionSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  disconnectButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  usageSection: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  usageInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    fontSize: 16,
    backgroundColor: '#f8fafc',
  },
  updateButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  updateButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
});

export default VPNStatusScreen;