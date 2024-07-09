import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { initLlama } from 'llama.rn';
import RNFS from 'react-native-fs';

const Colors = {
  dark: '#000',
  light: '#fff',
};

const Message = ({ text, isUser }) => (
  <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.botMessage]}>
    <Text style={styles.messageText}>{text}</Text>
  </View>
);

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('Hello');
  const [llamaContext, setLlamaContext] = useState(null);
  // const filePath = RNFS.DocumentDirectoryPath + '/llama-2-7b-chat.Q4_K_M.gguf';

  const filePath= "/Users/jinendramalekar/Desktop/llmphone/LLMPhone/llama-2-7b-chat.Q4_0.gguf"
  useEffect(() => {
    const initLlamaContext = async () => {
      try {
        const context = await initLlama({
          model:filePath,
          use_mlock: true,
          n_ctx: 1024,
          n_gpu_layers: 1,
        });
        setLlamaContext(context);
      } catch (error) {
        console.error('Error initializing Llama:', error);
      }
    };
    initLlamaContext();
  }, []);

  const sendMessage = async () => {
    if (!llamaContext) return;

    const newMessage = { text: inputText, isUser: true };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInputText('');

    try {
      const { text: responseText } = await llamaContext.completion({
        prompt: `You are a teacher, answer to the query of the User \n\nUser: ${inputText} \nTeacher:`,
        n_predict: 10,
        stop: ['</s>', 'Llama:', 'User:'],
      });
      const responseMessage = { text: responseText, isUser: false };
      setMessages(prevMessages => [...prevMessages, responseMessage]);
    } catch (error) {
      console.error('Error getting response from Llama:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? Colors.dark : Colors.light }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.messagesContainer}>
        {messages.map((message, index) => (
          <Message key={index} text={message.text} isUser={message.isUser} />
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { backgroundColor: isDarkMode ? Colors.dark : Colors.light }]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message here..."
          placeholderTextColor={isDarkMode ? Colors.light : Colors.dark}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flexGrow: 1,
    padding: 16,
  },
  messageContainer: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    maxWidth: '70%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 8,
    fontSize: 16,
  },
  sendButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#007BFF',
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;
