import React, { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Button, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../redux/slices/categorySlice';

const CategoryListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { categories, loading, error } = useSelector((state) => state.category);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  if (loading) return <ActivityIndicator size="large" />;
  if (error) return <Text>Алдаа: {error}</Text>;

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.name}</Text>
            <Text>{item.description || 'Тодорхойлолт байхгүй'}</Text>
          </View>
        )}
      />
      <Button title="Профайл руу шилжих" onPress={() => navigation.navigate('UserProfile')} />
      <Button title="Бүтээгдэхүүн рүү шилжих" onPress={() => navigation.navigate('ProductList')} />
      <Button title="Постууд руу шилжих" onPress={() => navigation.navigate('PostList')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  item: { padding: 10, borderBottomWidth: 1 },
});

export default CategoryListScreen;