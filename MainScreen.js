import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Modal, TouchableOpacity } from 'react-native';
import useWebSocket from './useWebSocketSensor';
import ConnectionStatusBanner from './ConnectionStatusBanner';

const WEBSOCKET_URL = 'ws://10.237.202.52:86/ws';

export default function MainScreen({ navigation, user }) {
  const { connectionStatus, sensorState, buttonState, fallState } = useWebSocket(WEBSOCKET_URL);
  const [activeAlert, setActiveAlert] = useState(null);

  useEffect(() => {
    // Pânico
    if (buttonState === 'Apertado') {
      setActiveAlert({ title: 'Botão de Pânico Acionado', message: 'O botão de pânico foi pressionado. Verifique a situação imediatamente.' });
    }
    // Queda
    else if (fallState === 'Queda Detectada') {
      setActiveAlert({ title: 'Alerta de Queda', message: 'Uma possível queda foi detectada.' });
    }
    // Gás e Fumaça
    else if (sensorState === 'Gás e Fumaça Detectados') {
      setActiveAlert({ title: 'Alerta de Gás e Fumaça', message: 'Níveis perigosos de gás e fumaça foram detectados.' });
    }
    // Apenas Fumaça
    else if (sensorState === 'Fumaça Detectada') {
      setActiveAlert({ title: 'Alerta de Fumaça', message: 'Fumaça foi detectada no ambiente.' });
    }
    // Apenas Gás
    else if (sensorState === 'Vazamento de Gás') {
      setActiveAlert({ title: 'Alerta de Gás', message: 'Um vazamento de gás foi detectado.' });
    }
  }, [sensorState, buttonState, fallState]);

  const getColorForSensorState = (state) => {
    switch (state) {
      case 'Ambiente Seguro': return '#22c55e';
      case 'Vazamento de Gás': return '#facc15';
      case 'Fumaça Detectada': return '#ef4444';
      case 'Gás e Fumaça Detectados': return '#a855f7';
      default: return '#6b7280';
    }
  };

  const getColorForButtonState = (state) => {
    switch (state) {
      case 'Apertado': return '#ef4444';
      case 'Conectado': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getColorForFallState = (state) => {
    switch (state) {
        case 'Queda Detectada': return '#ef4444';
        case 'Nenhuma Queda': return '#22c55e';
        default: return '#6b7280';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ConnectionStatusBanner status={connectionStatus} />

      {activeAlert && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={Boolean(activeAlert)}
          onRequestClose={() => setActiveAlert(null)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>{activeAlert.title}</Text>
              <Text style={styles.modalText}>{activeAlert.message}</Text>
              <TouchableOpacity style={styles.modalButton} onPress={() => setActiveAlert(null)}>
                <Text style={styles.modalButtonText}>OK, ESTOU CIENTE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      <View style={styles.card}>
        <Text style={styles.title}>Status do Ambiente</Text>
        <Text style={[styles.status, { color: getColorForSensorState(sensorState) }]}>
          {sensorState}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Botão de Pânico</Text>
        <Text style={[styles.status, { color: getColorForButtonState(buttonState) }]}>
          {buttonState}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Detector de Queda</Text>
        <Text style={[styles.status, { color: getColorForFallState(fallState) }]}>
          {fallState}
        </Text>
      </View>

      <TouchableOpacity style={styles.logsButton} onPress={() => navigation.navigate('History', { user: user })}>
        <Text style={styles.logsButtonText}>Histórico de Registros</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    padding: 20,
  },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 25,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f9fafb',
    marginBottom: 15,
  },
  status: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalView: {
    margin: 20,
    backgroundColor: '#1f2937',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f9fafb',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 18,
    color: '#f9fafb',
  },
  modalButton: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 2,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logsButton: {
    marginTop: 20,
    backgroundColor: '#374151',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  logsButtonText: {
    color: '#f9fafb',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
