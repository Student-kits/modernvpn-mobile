import {NativeModules, Platform, PermissionsAndroid} from 'react-native';

// Import VPN modules (these would be native modules)
// For now, we'll create a mock service that demonstrates the interface
// In production, you'd use react-native-wireguard or similar

class VPNService {
  constructor() {
    this.isConnected = false;
    this.currentServer = null;
    this.connectionStatus = 'disconnected';
    this.listeners = [];
  }

  // Request VPN permissions (Android)
  async requestVPNPermission() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          'android.permission.BIND_VPN_SERVICE',
          {
            title: 'VPN Permission',
            message: 'ModernVPN needs permission to create VPN connections',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS handles permissions differently
  }

  // Connect to VPN server
  async connect(serverConfig) {
    try {
      this.connectionStatus = 'connecting';
      this.notifyListeners();

      // Request permissions first
      const hasPermission = await this.requestVPNPermission();
      if (!hasPermission) {
        throw new Error('VPN permission denied');
      }

      console.log('Connecting to VPN with config:', serverConfig);

      // In a real implementation, this would:
      // 1. Parse the WireGuard config
      // 2. Create native VPN connection
      // 3. Start the tunnel

      // Mock implementation - simulate connection
      await new Promise(resolve => setTimeout(resolve, 2000));

      this.isConnected = true;
      this.currentServer = serverConfig;
      this.connectionStatus = 'connected';
      this.notifyListeners();

      return {success: true, message: 'Connected successfully'};
    } catch (error) {
      this.connectionStatus = 'disconnected';
      this.notifyListeners();
      throw error;
    }
  }

  // Disconnect from VPN
  async disconnect() {
    try {
      this.connectionStatus = 'disconnecting';
      this.notifyListeners();

      console.log('Disconnecting from VPN');

      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.isConnected = false;
      this.currentServer = null;
      this.connectionStatus = 'disconnected';
      this.notifyListeners();

      return {success: true, message: 'Disconnected successfully'};
    } catch (error) {
      this.connectionStatus = 'error';
      this.notifyListeners();
      throw error;
    }
  }

  // Get connection status
  getStatus() {
    return {
      isConnected: this.isConnected,
      status: this.connectionStatus,
      currentServer: this.currentServer,
    };
  }

  // Add listener for status changes
  addStatusListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  // Notify all listeners of status change
  notifyListeners() {
    const status = this.getStatus();
    this.listeners.forEach(callback => callback(status));
  }

  // Parse WireGuard config (helper method)
  parseWireGuardConfig(configString) {
    const lines = configString.split('\n');
    const config = {};
    let currentSection = null;

    lines.forEach(line => {
      line = line.trim();
      if (line.startsWith('[') && line.endsWith(']')) {
        currentSection = line.slice(1, -1).toLowerCase();
        config[currentSection] = {};
      } else if (line.includes('=') && currentSection) {
        const [key, value] = line.split('=').map(s => s.trim());
        config[currentSection][key.toLowerCase()] = value;
      }
    });

    return config;
  }
}

export default new VPNService();