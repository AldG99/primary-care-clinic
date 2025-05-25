// src/context/AlertContext.js
import React, { createContext, useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    // En web usamos notificaciones web nativas en lugar de Expo Notifications
    requestNotificationPermissions();
  }, []);

  const requestNotificationPermissions = async () => {
    // Solo intentamos solicitar permisos si las notificaciones web son compatibles
    if (!('Notification' in window)) {
      console.log('Este navegador no soporta notificaciones.');
      setNotificationsEnabled(false);
      return;
    }

    if (Notification.permission === 'granted') {
      console.log('Permisos de notificación ya concedidos');
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('No se obtuvieron permisos para enviar notificaciones');
        setNotificationsEnabled(false);
      }
    }
  };

  useEffect(() => {
    if (!user) {
      setAlerts([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const loadAlerts = async () => {
      try {
        console.log(
          '[AlertContext] Intentando cargar alertas para usuario:',
          user.uid
        );
        const now = new Date();
        const startOfDay = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        const alertsRef = collection(db, 'alerts');
        const q = query(
          alertsRef,
          where('assignedTo', 'array-contains', user.uid)
        );

        const snapshot = await getDocs(q);
        console.log(
          '[AlertContext] Alertas encontradas:',
          snapshot.docs.length
        );

        if (snapshot.empty) {
          console.log('[AlertContext] No se encontraron alertas');
          setAlerts([]);
          setLoading(false);
          return;
        }

        const alertsList = snapshot.docs.map(doc => {
          const data = doc.data();
          const scheduledDate =
            data.scheduledDate instanceof Timestamp
              ? data.scheduledDate.toDate()
              : new Date(data.scheduledDate);

          return {
            id: doc.id,
            ...data,
            scheduledDate,
          };
        });

        alertsList.sort((a, b) => {
          const dateA = a.scheduledDate;
          const dateB = b.scheduledDate;
          return dateA - dateB;
        });

        setAlerts(alertsList);

        if (notificationsEnabled) {
          scheduleNotifications(alertsList);
        }
      } catch (error) {
        console.error('[AlertContext] Error al cargar alertas:', error);
        console.error('[AlertContext] Detalle:', error.message, error.code);
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();

    const alertsQuery = query(
      collection(db, 'alerts'),
      where('assignedTo', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(
      alertsQuery,
      snapshot => {
        const alertsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          scheduledDate:
            doc.data().scheduledDate instanceof Timestamp
              ? doc.data().scheduledDate.toDate()
              : new Date(doc.data().scheduledDate),
        }));

        setAlerts(alertsList);

        if (notificationsEnabled) {
          scheduleNotifications(alertsList);
        }
      },
      error => {
        console.error('Error en tiempo real de alertas:', error);
      }
    );

    return () => unsubscribe();
  }, [user, notificationsEnabled]);

  // Implementación de notificaciones web en lugar de Expo Notifications
  const scheduleNotifications = alertsList => {
    console.log(
      '[AlertContext] Verificando notificaciones para',
      alertsList.length,
      'alertas'
    );

    if (!('Notification' in window) || Notification.permission !== 'granted') {
      console.log(
        'No se pueden programar notificaciones: permisos no concedidos'
      );
      return;
    }

    try {
      // Cancelar notificaciones programadas anteriores
      // En web, usaríamos setTimeout/clearTimeout en lugar del sistema de Expo
      window.scheduledNotifications = window.scheduledNotifications || [];
      window.scheduledNotifications.forEach(timeoutId =>
        clearTimeout(timeoutId)
      );
      window.scheduledNotifications = [];

      const futureAlerts = alertsList.filter(
        alert => alert.scheduledDate > new Date() && !alert.completed
      );

      console.log(
        '[AlertContext] Programando',
        futureAlerts.length,
        'notificaciones futuras'
      );

      // Programar notificaciones para el futuro
      for (const alert of futureAlerts.slice(0, 5)) {
        const timeUntilAlert = alert.scheduledDate.getTime() - Date.now();

        if (timeUntilAlert > 0) {
          const timeoutId = setTimeout(() => {
            try {
              // Mostrar la notificación cuando llegue el momento
              const notification = new Notification(alert.title, {
                body: alert.description || 'Tienes una alerta pendiente',
                icon: '/favicon.ico', // Ruta a un icono para la notificación
              });

              // Opcional: hacer algo cuando se hace clic en la notificación
              notification.onclick = () => {
                window.focus();
                // Aquí podrías agregar lógica para navegar a la página de alerta
              };
            } catch (error) {
              console.error('Error al mostrar notificación:', error);
            }
          }, timeUntilAlert);

          window.scheduledNotifications.push(timeoutId);

          console.log(
            '[AlertContext] Notificación programada para',
            alert.title,
            'el',
            alert.scheduledDate
          );
        }
      }
    } catch (error) {
      console.error(
        '[AlertContext] Error general al programar notificaciones:',
        error
      );
    }
  };

  const refreshAlerts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const alertsRef = collection(db, 'alerts');
      const q = query(
        alertsRef,
        where('assignedTo', 'array-contains', user.uid)
      );

      const snapshot = await getDocs(q);

      const alertsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledDate:
          doc.data().scheduledDate instanceof Timestamp
            ? doc.data().scheduledDate.toDate()
            : new Date(doc.data().scheduledDate),
      }));

      setAlerts(alertsList);

      if (notificationsEnabled) {
        scheduleNotifications(alertsList);
      }
    } catch (error) {
      console.error('[AlertContext] Error al refrescar alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const disableNotifications = () => {
    console.log('[AlertContext] Deshabilitando notificaciones');
    setNotificationsEnabled(false);

    // Limpiar las notificaciones programadas
    if (window.scheduledNotifications) {
      window.scheduledNotifications.forEach(timeoutId =>
        clearTimeout(timeoutId)
      );
      window.scheduledNotifications = [];
    }
  };

  const enableNotifications = () => {
    console.log('[AlertContext] Habilitando notificaciones');

    // Verificar permisos antes de habilitar
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
      scheduleNotifications(alerts);
    } else {
      // Solicitar permisos de nuevo
      requestNotificationPermissions().then(() => {
        if (Notification.permission === 'granted') {
          setNotificationsEnabled(true);
          scheduleNotifications(alerts);
        }
      });
    }
  };

  const value = {
    alerts,
    loading,
    refreshAlerts,
    disableNotifications,
    enableNotifications,
  };

  return (
    <AlertContext.Provider value={value}>{children}</AlertContext.Provider>
  );
};
