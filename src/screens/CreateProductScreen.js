import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { createProduct } from '../redux/slices/productSlice';

const CreateProductScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.product);

  const handleSubmit = () => {
    dispatch(createProduct({ name, price: parseFloat(price), categoryId }));
    setName('');
    setPrice('');
    setCategoryId('');
    navigation.navigate('ProductList'); // Амжилттай бол буцна
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Бүтээгдэхүүний нэр"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Үнэ"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Ангилалын ID"
        value={categoryId}
        onChangeText={setCategoryId}
      />
      <Button title="Бүтээгдэхүүн нэмэх" onPress={handleSubmit} disabled={loading} />
      {error && <Text style={styles.error}>Алдаа: {error}</Text>}
      <Button title="Бүтээгдэхүүний жагсаалт руу буцах" onPress={() => navigation.navigate('ProductList')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 },
  error: { color: 'red' },
});

export default CreateProductScreen;