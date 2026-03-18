import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { updateDeviceTelemetry, updateDeviceStatus } from '../features/devices/devicesSlice';
import { requestNotificationPermission, showEmergencyNotification } from '../services/notificationService';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useSocket = () => {
  const dispatch = useDispatch();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to WebSocket server:', socket.id);
    });

    socket.on('device:update', (data: { id: string; currentValue: Record<string, unknown>; lastPing: string }) => {
      dispatch(updateDeviceTelemetry(data));
    });

    socket.on('device:status', (data: { id: string; status: 'online' | 'offline'; lastPing: string }) => {
      dispatch(updateDeviceStatus(data));
    });

    // Phase 6: Listen for emergency automation alerts
    socket.on('emergency-alert', (data: { deviceName: string; ruleName: string; message: string }) => {
      showEmergencyNotification(
        `⚠️ ${data.deviceName} — Alert`,
        `Rule "${data.ruleName}" triggered: ${data.message}`
      );
    });

    // Request notification permission on first connect
    requestNotificationPermission();

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [dispatch]);
};
