import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {vpnAPI, authAPI} from '../services/api';
import VPNService from '../services/vpnService';

const DashboardScreen = ({navigation, onLogout}) => {
  const [user, setUser] = useState(null);
  const [vpnStatus, setVpnStatus] = useState(VPNService.getStatus());
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserProfile();
    loadServers();

    // Listen for VPN status changes
    const unsubscribe = VPNService.addStatusListener(setVpnStatus);
    return unsubscribe;
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await authAPI.getProfile();
      setUser(profile);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const loadServers = async () => {
    try {
      const serverList = await vpnAPI.getServers();
      setServers(serverList);
    } catch (error) {
      console.error('Failed to load servers:', error);
      // Use mock servers if API fails
      setServers([
        {id: 'us-east-1', region: 'US East', ip: '1.2.3.4', status: 'online'},
        {id: 'eu-west-1', region: 'EU West', ip: '5.6.7.8', status: 'online'},
        {id: 'asia-south-1', region: 'Asia South', ip: '9.10.11.12', status: 'online'},
      ]);
    }
  };

  const handleConnect = async () => {
    if (vpnStatus.isConnected) {
      // Disconnect
      setLoading(true);
      try {
        await VPNService.disconnect();
        Alert.alert('Disconnected', 'VPN connection has been stopped');
      } catch (error) {
        Alert.alert('Error', 'Failed to disconnect VPN');
      } finally {
        setLoading(false);
      }
    } else {
      // Navigate to server selection
      navigation.navigate('ServerList', {
        servers,
        onServerSelect: connectToServer,
      });
    }
  };

  const connectToServer = async (server) => {
    setLoading(true);
    try {
      // Get VPN config from backend
      const config = await vpnAPI.assignServer(server.id);
      
      // Connect to VPN
      await VPNService.connect({
        ...server,
        config: config.config || config,
      });
      
      Alert.alert('Connected', `Connected to ${server.region}`);
      navigation.goBack();
    } catch (error) {
      console.error('Connection error:', error);
      Alert.alert('Connection Failed', error.message || 'Unable to connect to VPN');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Logout',
          onPress: async () => {
            if (vpnStatus.isConnected) {
              await VPNService.disconnect();
            }
            onLogout();
          },
        },
      ],
    );
  };

  const getStatusColor = () => {
    switch (vpnStatus.status) {
      case 'connected':
        return '#10b981';
      case 'connecting':
      case 'disconnecting':
        return '#f59e0b';
      case 'error':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const getStatusText = () => {
    switch (vpnStatus.status) {
      case 'connected':
        return `Connected to ${vpnStatus.currentServer?.region || 'Server'}`;
      case 'connecting':
        return 'Connecting...';
      case 'disconnecting':
        return 'Disconnecting...';
      case 'error':
        return 'Connection Error';
      default:
        return 'Not Connected';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.emailText}>{user?.email || 'Loading...'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, {backgroundColor: getStatusColor()}]} />
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.connectButton,
            vpnStatus.isConnected ? styles.disconnectButton : null,
            loading && styles.buttonDisabled,
          ]}
          onPress={handleConnect}
          disabled={loading || vpnStatus.status === 'connecting' || vpnStatus.status === 'disconnecting'}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.connectButtonText}>
              {vpnStatus.isConnected ? 'Disconnect' : 'Connect'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Quick Stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{servers.length}</Text>
            <Text style={styles.statLabel}>Servers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{vpnStatus.isConnected ? '1' : '0'}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>256</Text>
            <Text style={styles.statLabel}>Encryption</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsCard}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('ServerList', {servers})}>
          <Text style={styles.actionButtonText}>Choose Server</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.actionButtonText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  emailText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ef4444',
    borderRadius: 6,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  statusCard: {
    margin: 20,
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  connectButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    minWidth: 160,
    alignItems: 'center',
  },
  disconnectButton: {
    backgroundColor: '#ef4444',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default DashboardScreen;