import React, { createContext, useContext, useState, useEffect } from 'react';
import VPNService from '../services/VPNService';
import APIService from '../services/APIService';

const VPNContext = createContext();

export const useVPN = () => {
  const context = useContext(VPNContext);
  if (!context) {
    throw new Error('useVPN must be used within a VPNProvider');
  }
  return context;
};

export const VPNProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [currentServer, setCurrentServer] = useState(null);
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeVPN();
    loadServers();
  }, []);

  const initializeVPN = async () => {
    try {
      const status = VPNService.getStatus();
      setIsConnected(status.isConnected);
      setConnectionStatus(status.status);
      setCurrentServer(status.server);
    } catch (error) {
      console.error('VPN initialization failed:', error);
    }
  };

  const loadServers = async () => {
    try {
      setLoading(true);
      const serverList = await APIService.getServers();
      setServers(serverList);
    } catch (error) {
      console.error('Failed to load servers:', error);
      // Fallback to mock servers
      setServers([
        { id: 'us-east-1', region: 'US East', ip: '1.2.3.4', status: 'online' },
        { id: 'eu-west-1', region: 'EU West', ip: '5.6.7.8', status: 'online' },
        { id: 'asia-south-1', region: 'Asia South', ip: '9.10.11.12', status: 'online' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const connect = async (server) => {
    try {
      setLoading(true);
      setConnectionStatus('connecting');
      
      // Request VPN permission if needed
      const hasPermission = await VPNService.hasVPNPermission();
      if (!hasPermission) {
        const granted = await VPNService.requestVPNPermission();
        if (!granted) {
          throw new Error('VPN permission required');
        }
      }
      
      // Get VPN configuration from backend
      const configResponse = await APIService.assignVPN(server.id);
      
      // Connect using VPN service
      const result = await VPNService.connect({
        ...server,
        config: configResponse.config
      });
      
      if (result.success) {
        setIsConnected(true);
        setConnectionStatus('connected');
        setCurrentServer(server);
      }
      
      return result;
    } catch (error) {
      console.error('VPN connection failed:', error);
      setConnectionStatus('disconnected');
      setIsConnected(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    try {
      setLoading(true);
      setConnectionStatus('disconnecting');
      
      const result = await VPNService.disconnect();
      
      if (result.success) {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        setCurrentServer(null);
      }
      
      return result;
    } catch (error) {
      console.error('VPN disconnection failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isConnected,
    connectionStatus,
    currentServer,
    servers,
    loading,
    connect,
    disconnect,
    loadServers,
  };

  return (
    <VPNContext.Provider value={value}>
      {children}
    </VPNContext.Provider>
  );
};