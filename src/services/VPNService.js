import { NativeModules, NativeEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// This is a mock VPN service - in production you'd use a real WireGuard native module
const { WireGuardVPN } = NativeModules;

class VPNService {
  constructor() {
    this.isConnected = false;
    this.currentServer = null;
    this.connectionStatus = 'disconnected';
    this.eventEmitter = new NativeEventEmitter(WireGuardVPN);
    
    // Listen to VPN status changes
    this.eventEmitter.addListener('VPNStatusChanged', this.handleStatusChange);
  }

  handleStatusChange = (status) => {
    this.connectionStatus = status;
    this.isConnected = status === 'connected';
  };

  async connect(serverConfig) {
    try {
      console.log('Connecting to VPN server:', serverConfig.region);
      
      // Store current server
      this.currentServer = serverConfig;
      await AsyncStorage.setItem('currentServer', JSON.stringify(serverConfig));
      
      // Mock connection for demo - replace with real WireGuard connection
      this.connectionStatus = 'connecting';
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, this would call the native WireGuard module:
      // const result = await WireGuardVPN.connect(serverConfig.config);
      
      this.connectionStatus = 'connected';
      this.isConnected = true;
      
      console.log('VPN connected successfully');
      return { success: true, status: 'connected' };
      
    } catch (error) {
      console.error('VPN connection failed:', error);
      this.connectionStatus = 'disconnected';
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    try {
      console.log('Disconnecting VPN...');
      
      this.connectionStatus = 'disconnecting';
      
      // Simulate disconnection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production: await WireGuardVPN.disconnect();
      
      this.connectionStatus = 'disconnected';
      this.isConnected = false;
      this.currentServer = null;
      
      await AsyncStorage.removeItem('currentServer');
      
      console.log('VPN disconnected successfully');
      return { success: true, status: 'disconnected' };
      
    } catch (error) {
      console.error('VPN disconnection failed:', error);
      throw error;
    }
  }

  getStatus() {
    return {
      isConnected: this.isConnected,
      status: this.connectionStatus,
      server: this.currentServer
    };
  }

  async getCurrentServer() {
    try {
      const serverData = await AsyncStorage.getItem('currentServer');
      return serverData ? JSON.parse(serverData) : null;
    } catch (error) {
      console.error('Failed to get current server:', error);
      return null;
    }
  }

  // Request VPN permission (Android)
  async requestVPNPermission() {
    try {
      // In production: return await WireGuardVPN.requestPermission();
      return true; // Mock permission granted
    } catch (error) {
      console.error('VPN permission request failed:', error);
      return false;
    }
  }

  // Check if VPN permission is granted
  async hasVPNPermission() {
    try {
      // In production: return await WireGuardVPN.hasPermission();
      return true; // Mock permission granted
    } catch (error) {
      console.error('VPN permission check failed:', error);
      return false;
    }
  }
}

export default new VPNService();