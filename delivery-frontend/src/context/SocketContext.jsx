import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { initSocket, connectSocket, disconnectSocket, getSocket } from '../api/socket';
import { useDelivery } from './DeliveryContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { deliveryBoy, isAuthenticated } = useDelivery();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [newOrderNotification, setNewOrderNotification] = useState(null);
  const lastNotifiedOrderRef = useRef(null);
  const notificationCooldownRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && deliveryBoy) {
      const socketInstance = initSocket();
      setSocket(socketInstance);

      socketInstance.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
        socketInstance.emit('delivery:join', deliveryBoy.id);
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      socketInstance.on('new:order', (data) => {
        console.log('New order notification:', data);
        setNewOrderNotification(data);
        
        // Only play sound/notification ONCE per unique order (prevent repeated sounds)
        const orderId = data?.orderId || data?._id || JSON.stringify(data);
        if (lastNotifiedOrderRef.current !== orderId && !notificationCooldownRef.current) {
          lastNotifiedOrderRef.current = orderId;
          notificationCooldownRef.current = true;

          // Play browser notification once
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New Order Available!', {
              body: `Order from ${data.restaurantName} - ₹${data.deliveryFee}`,
              icon: '/delivery-boy.svg'
            });
          }

          // Cooldown: prevent any notification sound for 15 seconds
          setTimeout(() => {
            notificationCooldownRef.current = false;
          }, 15000);
        }
      });

      connectSocket();

      return () => {
        if (deliveryBoy) {
          socketInstance.emit('delivery:leave', deliveryBoy.id);
        }
        disconnectSocket();
      };
    }
  }, [isAuthenticated, deliveryBoy]);

  const clearNotification = () => {
    setNewOrderNotification(null);
  };

  const value = {
    socket,
    connected,
    newOrderNotification,
    clearNotification
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
