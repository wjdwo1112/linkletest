import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export const useWebSocket = (memberId, onNotification) => {
  const clientRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const onNotificationRef = useRef(onNotification);

  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    if (!memberId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: {},
      debug: (str) => {
        console.log('STOMP:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('WebSocket 연결 성공');
      setConnected(true);

      client.subscribe(`/user/${memberId}/queue/notifications`, (message) => {
        const notification = JSON.parse(message.body);
        console.log('알림 수신:', notification);
        if (onNotificationRef.current) {
          onNotificationRef.current(notification);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('STOMP 에러:', frame);
      setConnected(false);
    };

    client.onDisconnect = () => {
      console.log('WebSocket 연결 해제');
      setConnected(false);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [memberId]);

  return { connected };
};
