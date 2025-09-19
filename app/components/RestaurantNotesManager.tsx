import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRestaurantContext } from '../contexts/restaurant';
import { useNotesByRestaurant } from '../hooks/useNotes';
import { Note } from '../types/convex';
import Colors from '../constants/Colors';
interface RestaurantNotesManagerProps {
  restaurantPlaceId: string;
}

export const RestaurantNotesManager: React.FC<RestaurantNotesManagerProps> = ({ 
  restaurantPlaceId,  
}) => {
  const [content, setContent] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const userId = "1";

  const notes = useNotesByRestaurant(restaurantPlaceId, userId);
  const { 
    createNote, 
    updateNote, 
    deleteNote,
    isCreatingNote,
    isUpdatingNote,
    isDeletingNote 
  } = useRestaurantContext();

  const handleCreateNote = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please write some content for your note');
      return;
    }

    // Use first line or first 50 characters as title
    const title = content.trim().split('\n')[0].substring(0, 50);
    const result = await createNote(restaurantPlaceId, title, content.trim());
    
    if (result.success) {
      setContent('');
      setIsExpanded(false);
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNote || !content.trim()) {
      Alert.alert('Error', 'Please write some content for your note');
      return;
    }

    // Use first line or first 50 characters as title
    const title = content.trim().split('\n')[0].substring(0, 50);
    const result = await updateNote(editingNote._id, {
      title: title,
      content: content.trim()
    });

    if (result.success) {
      setEditingNote(null);
      setContent('');
      setIsExpanded(false);
    }
  };

  const handleDeleteNote = (note: Note) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteNote(note._id),
        },
      ]
    );
  };

  const startEditing = (note: Note) => {
    setEditingNote(note);
    setContent(note.content || '');
    setIsExpanded(true);
  };

  const cancelEditing = () => {
    setEditingNote(null);
    setContent('');
    setIsExpanded(false);
  };

  const renderNote = ({ item }: { item: Note }) => (
    <View style={styles.noteCard}>
      <View style={styles.noteHeader}>
        <Text style={styles.noteTitle}>{item.title || ''}</Text>
        <View style={styles.noteActions}>
          <TouchableOpacity
            onPress={() => startEditing(item)}
            style={styles.actionButton}
            disabled={isUpdatingNote}
          >
            <Ionicons name="create-outline" size={18} color={Colors.colors.orange} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteNote(item)}
            style={styles.actionButton}
            disabled={isDeletingNote}
          >
            <Ionicons name="trash-outline" size={18} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </View>
      {/* <Text style={styles.noteContent}>{item.content || ''}</Text> */}
      <Text style={styles.noteDate}>
        {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.headerLeft}>
          <Ionicons name="document-text-outline" size={20} color={Colors.colors.orange} />
          <Text style={styles.headerTitle}>Notes ({notes?.length || 0})</Text>
        </View>
        <Ionicons 
          name={isExpanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#666" 
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* Add/Edit Note Form */}
          <View style={styles.noteForm}>
            <TextInput
              placeholder="Write your note here..."
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={4}
              style={styles.contentInput}
              maxLength={1000}
              autoFocus={isExpanded}
            />
            
            <View style={styles.formActions}>
              {editingNote && (
                <TouchableOpacity
                  onPress={cancelEditing}
                  style={[styles.button, styles.cancelButton]}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                onPress={editingNote ? handleUpdateNote : handleCreateNote}
                disabled={isCreatingNote || isUpdatingNote || !content.trim()}
                style={[
                  styles.button, 
                  styles.saveButton,
                  !content.trim() && styles.disabledButton
                ]}
              >
                <Text style={styles.saveButtonText}>
                  {isCreatingNote || isUpdatingNote 
                    ? (editingNote ? 'Updating...' : 'Saving...') 
                    : (editingNote ? 'Update Note' : 'Add Note')
                  }
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notes List */}
          {notes && notes.length > 0 ? (
            <View style={styles.notesList}>
              {notes.map((item) => (
                <View key={item._id}>
                  {renderNote({ item })}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={32} color="#ccc" />
              <Text style={styles.emptyText}>No notes yet</Text>
              <Text style={styles.emptySubtext}>Add your first note about this restaurant</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  expandedContent: {
    padding: 16,
  },
  noteForm: {
    marginBottom: 16,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: '#fafafa',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  formActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: Colors.colors.orange,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  notesList: {
    // No maxHeight needed since we're using map instead of FlatList
  },
  noteCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  noteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  noteContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
});
