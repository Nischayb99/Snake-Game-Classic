import { createContext, useContext, useState } from "react";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message, duration = 5000) => {
    setNotification({ type, message });

    // Auto-hide notification after duration
    setTimeout(() => {
      setNotification(null);
    }, duration);
  };

  const clearNotification = () => setNotification(null);

  return (
    <NotificationContext.Provider
      value={{ notification, showNotification, clearNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
