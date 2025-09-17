import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotesByRestaurant } from '../hooks/useNotes';

interface NotesIndicatorProps {
  restaurantPlaceId: string;
  userId?: string;
}

export const NotesIndicator: React.FC<NotesIndicatorProps> = ({ 
  restaurantPlaceId, 
  userId = "1" 
}) => {
  const notes = useNotesByRestaurant(restaurantPlaceId, userId);
  const notesCount = notes?.length || 0;

  if (notesCount === 0) return null;

  return (
    <View style={styles.container}>
      <Ionicons name="document-text" size={12} color="#666" />
      <Text style={styles.count}>{notesCount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  count: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
});
