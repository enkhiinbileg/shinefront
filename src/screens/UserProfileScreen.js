import React, { useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile } from '../redux/slices/userSlice';

const UserProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector((state) => state.user);
  const userId = useSelector((state) => state.auth.user?.id);

  useEffect(() => {
    if (userId) dispatch(fetchUserProfile(userId));
  }, [dispatch, userId]);

  if (loading) return <ActivityIndicator size="large" color="blue" />;
  if (error) return <Text style={styles.error}>Алдаа: {error}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Нэр: {profile?.name}</Text>
      <Text style={styles.text}>Имэйл: {profile?.email}</Text>
      <Text style={styles.text}>Профайлын зураг: {profile?.profileImage || 'Байхгүй'}</Text>
      <Button title="Постууд руу шилжих" onPress={() => navigation.navigate('PostList')} />
      <Button title="Бүтээгдэхүүн рүү шилжих" onPress={() => navigation.navigate('ProductList')} />
      <Button title="Ангилал руу шилжих" onPress={() => navigation.navigate('CategoryList')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  text: { fontSize: 18, marginBottom: 10 },
  error: { color: 'red', fontSize: 16 },
});

export default UserProfileScreen;