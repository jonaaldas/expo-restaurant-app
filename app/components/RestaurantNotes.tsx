import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useNotes, useNotesByRestaurant } from '../hooks/useNotes';
import { Note } from '../types/convex';

interface RestaurantNotesProps {
  restaurantPlaceId: string;
  userId?: string;
}

export const RestaurantNotes: React.FC<RestaurantNotesProps> = ({ 
  restaurantPlaceId, 
  userId 
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const notes = useNotesByRestaurant(restaurantPlaceId, userId);
  const { createNote, updateNote, deleteNote } = useNotes(userId);

  const handleCreateNote = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please fill in both title and content');
      return;
    }

    setIsCreating(true);
    const result = await createNote(restaurantPlaceId, title, content, userId);
    
    if (result.success) {
      setTitle('');
      setContent('');
      Alert.alert('Success', 'Note created successfully!');
    } else {
      Alert.alert('Error', result.error || 'Failed to create note');
    }
    setIsCreating(false);
  };

  const handleDeleteNote = async (noteId: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteNote(noteId as any);
            if (result.success) {
              Alert.alert('Success', 'Note deleted successfully!');
            } else {
              Alert.alert('Error', result.error || 'Failed to delete note');
            }
          },
        },
      ]
    );
  };

  const renderNote = ({ item }: { item: Note }) => (
    <View style={{ padding: 16, marginVertical: 8, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>{item.title}</Text>
      <Text style={{ fontSize: 14, marginBottom: 8 }}>{item.content}</Text>
      <Text style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
      <TouchableOpacity
        onPress={() => handleDeleteNote(item._id)}
        style={{ backgroundColor: '#ff4444', padding: 8, borderRadius: 4, alignSelf: 'flex-start' }}
      >
        <Text style={{ color: 'white', fontSize: 12 }}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Notes</Text>
      
      <View style={{ marginBottom: 24 }}>
        <TextInput
          placeholder="Note title"
          value={title}
          onChangeText={setTitle}
          style={{ borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 8 }}
        />
        <TextInput
          placeholder="Note content"
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={4}
          style={{ borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 8 }}
        />
        <TouchableOpacity
          onPress={handleCreateNote}
          disabled={isCreating}
          style={{ 
            backgroundColor: isCreating ? '#ccc' : '#007AFF', 
            padding: 12, 
            borderRadius: 8, 
            alignItems: 'center' 
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
            {isCreating ? 'Creating...' : 'Add Note'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notes || []}
        renderItem={renderNote}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};
