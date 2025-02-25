import React, { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Button, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../redux/slices/productSlice';

const ProductListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.product);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  if (loading) return <ActivityIndicator size="large" />;
  if (error) return <Text>Алдаа: {error}</Text>;

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.name} - ${item.price}</Text>
            <Text>Ангилал: {item.category.name}</Text>
          </View>
        )}
      />
      <Button title="Профайл руу шилжих" onPress={() => navigation.navigate('UserProfile')} />
      <Button title="Шинэ бүтээгдэхүүн нэмэх" onPress={() => navigation.navigate('CreateProduct')} />
      <Button title="Постууд руу шилжих" onPress={() => navigation.navigate('PostList')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  item: { padding: 10, borderBottomWidth: 1 },
});

export default ProductListScreen;