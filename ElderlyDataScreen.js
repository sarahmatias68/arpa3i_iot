import { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableWithoutFeedback, Keyboard, ActivityIndicator, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const API_URL = 'http://10.237.202.52:86';

const ElderlyDataScreen = () => {
  const [elderlyData, setElderlyData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('loading'); 
  const fetchData = useCallback(async () => {
    setLoading(true);
    setViewMode('loading');
    try {
      const response = await fetch(`${API_URL}/elderly`);
      const data = await response.json();
      if (data && data.id) {
        setElderlyData(data);
        setOriginalData(data);
        setViewMode('display');
      } else {
        setElderlyData({ name: '', age: '', family_contact_name: '', family_contact_phone: '', observations: '' });
        setOriginalData(null);
        setViewMode('empty');
      }
    } catch (error) {
      Alert.alert('Erro de Conexão', 'Não foi possível buscar os dados.');
      setViewMode('empty');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleInputChange = (field, value) => {
    setElderlyData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const { name, age, family_contact_name, family_contact_phone } = elderlyData;
    if (!name || !age || !family_contact_name || !family_contact_phone) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha nome, idade e contato familiar.');
      return;
    }

    const isUpdating = !!elderlyData.id;
    const url = isUpdating ? `${API_URL}/elderly/update` : `${API_URL}/elderly/add`;
    const body = `id=${elderlyData.id || ''}&name=${encodeURIComponent(name)}&age=${age}&family_contact_name=${encodeURIComponent(family_contact_name)}&family_contact_phone=${encodeURIComponent(family_contact_phone)}&observations=${encodeURIComponent(elderlyData.observations || '')}`;

    setLoading(true);
    try {
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
      if (!response.ok) throw new Error('Falha na resposta do servidor.');
      const result = await response.json();
      if (result.status === 'success') {
        Alert.alert('Sucesso', `Dados ${isUpdating ? 'atualizados' : 'salvos'}!`);
        fetchData(); 
      } else {
        throw new Error(result.message || 'Ocorreu um erro no servidor.');
      }
    } catch (error) {
      Alert.alert('Erro ao Salvar', error.message);
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Confirmar Exclusão', 'Tem certeza que deseja excluir os dados do idoso?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        setLoading(true);
        try {
          const response = await fetch(`${API_URL}/elderly/delete`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: `id=${elderlyData.id}` });
          const result = await response.json(); // Tenta ler a resposta JSON independentemente do status de 'ok'

          if (response.ok && result.status === 'success') {
            Alert.alert('Sucesso', 'Dados excluídos.');
            fetchData(); // Recarrega e vai para a tela 'empty'
          } else {
            // Se a resposta não for 'ok' ou o status for 'error', usa a mensagem do servidor
            throw new Error(result.message || 'Ocorreu uma falha ao tentar excluir.');
          }
        } catch (error) {
          Alert.alert('Erro ao Excluir', error.message);
        } finally {
          setLoading(false);
        }
      }},
    ]);
  };

  const renderEmptyView = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.title}>Nenhum Idoso Cadastrado</Text>
      <Text style={styles.emptyText}>Adicione os dados para começar o monitoramento.</Text>
      <TouchableOpacity style={styles.button} onPress={() => setViewMode('form')}>
        <Text style={styles.buttonText}>Cadastrar Dados do Idoso</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDisplayView = () => (
    <ScrollView style={styles.contentContainer}>
      <Text style={styles.title}>Dados do Idoso</Text>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Nome:</Text>
        <Text style={styles.cardValue}>{elderlyData.name}</Text>
        <Text style={styles.cardLabel}>Idade:</Text>
        <Text style={styles.cardValue}>{elderlyData.age}</Text>
        <Text style={styles.cardLabel}>Contato Familiar:</Text>
        <Text style={styles.cardValue}>{`${elderlyData.family_contact_name} (${elderlyData.family_contact_phone})`}</Text>
        {elderlyData.observations && (<>
          <Text style={styles.cardLabel}>Observações:</Text>
          <Text style={styles.cardValue}>{elderlyData.observations}</Text>
        </>)}
      </View>
      <TouchableOpacity style={styles.button} onPress={() => setViewMode('form')}>
        <Text style={styles.buttonText}>Editar Dados</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
        <Text style={styles.buttonText}>Excluir Cadastro</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderFormView = () => (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>{elderlyData.id ? 'Editar Dados' : 'Cadastrar Novo Idoso'}</Text>
        <Text style={styles.label}>Nome Completo</Text>
        <TextInput style={styles.input} value={elderlyData.name} onChangeText={(text) => handleInputChange('name', text)} placeholder="Nome do idoso" placeholderTextColor="#6b7280" />
        <Text style={styles.label}>Idade</Text>
        <TextInput style={styles.input} value={String(elderlyData.age)} onChangeText={(text) => handleInputChange('age', text)} placeholder="Idade" placeholderTextColor="#6b7280" keyboardType="numeric" />
        <Text style={styles.label}>Nome do Contato Familiar</Text>
        <TextInput style={styles.input} value={elderlyData.family_contact_name} onChangeText={(text) => handleInputChange('family_contact_name', text)} placeholder="Nome do familiar" placeholderTextColor="#6b7280" />
        <Text style={styles.label}>Telefone do Contato Familiar</Text>
        <TextInput style={styles.input} value={elderlyData.family_contact_phone} onChangeText={(text) => handleInputChange('family_contact_phone', text)} placeholder="(XX) XXXXX-XXXX" placeholderTextColor="#6b7280" keyboardType="phone-pad" />
        <Text style={styles.label}>Observações Médicas e Gerais</Text>
        <TextInput style={[styles.input, styles.textArea]} value={elderlyData.observations} onChangeText={(text) => handleInputChange('observations', text)} placeholder="Alergias, medicamentos..." placeholderTextColor="#6b7280" multiline />
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Salvar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => originalData ? setViewMode('display') : setViewMode('empty') }>
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  if (loading) {
    return <View style={styles.loader}><ActivityIndicator size="large" color="#3b82f6" /></View>;
  }

  return (
    <View style={styles.container}>
      {viewMode === 'display' && renderDisplayView()}
      {viewMode === 'form' && renderFormView()}
      {viewMode === 'empty' && renderEmptyView()}
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#9ca3af',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  cardLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 18,
    color: '#f9fafb',
    marginBottom: 16,
  },
  cancelButton: {
    backgroundColor: '#4b5563',
    marginTop: 15,
  },
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  contentContainer: {
    padding: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f9fafb',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#d1d5db',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1f2937',
    color: '#f9fafb',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  deleteButton: {
    backgroundColor: '#ef4444', // Cor vermelha para exclusão
    marginTop: 15,
  },
  buttonText: {
    color: '#f9fafb',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ElderlyDataScreen;
