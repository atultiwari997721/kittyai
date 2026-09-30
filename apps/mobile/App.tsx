import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from 'react-native';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'tasks' | 'approvals' | 'devices'>('chat');
  const [messages, setMessages] = useState([
    { id: '1', sender: 'ai', text: 'Hello! I am KritiAI. "Your Personal AI That Gets Things Done."\n\nConnected to your paired cloud sync.' }
  ]);
  const [input, setInput] = useState('');
  const [desktopOnline, setDesktopOnline] = useState(true);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `Task received: "${userMsg.text}". If desktop execution is required, this task will be forwarded to your Windows PC.`
        }
      ]);
    }, 600);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>KritiAI</Text>
          <Text style={styles.subtitle}>PERSONAL AI OPERATING SYSTEM</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: desktopOnline ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }]}>
          <Text style={[styles.badgeText, { color: desktopOnline ? '#34d399' : '#f87171' }]}>
            {desktopOnline ? '● Desktop Online' : '○ Desktop Offline'}
          </Text>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        {activeTab === 'chat' && (
          <View style={styles.chatContainer}>
            <ScrollView style={styles.messagesList} contentContainerStyle={{ paddingBottom: 20 }}>
              {messages.map((m) => (
                <View
                  key={m.id}
                  style={[
                    styles.messageBubble,
                    m.sender === 'user' ? styles.userBubble : styles.aiBubble
                  ]}
                >
                  <Text style={styles.messageText}>{m.text}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.inputBar}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Ask KritiAI on mobile..."
                placeholderTextColor="#64748b"
                style={styles.textInput}
              />
              <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'tasks' && (
          <ScrollView style={styles.tabContent}>
            <Text style={styles.sectionHeader}>Active Tasks</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Fix authentication error in VS Code</Text>
              <Text style={styles.cardMeta}>Agent: CodingAgent • Forwarded to Desktop</Text>
              <Text style={styles.cardStatus}>STATUS: WAITING_APPROVAL</Text>
            </View>
          </ScrollView>
        )}

        {activeTab === 'approvals' && (
          <ScrollView style={styles.tabContent}>
            <Text style={styles.sectionHeader}>Pending Approvals</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Consequential Action: Send Email</Text>
              <Text style={styles.cardMeta}>To: rahul@project.io</Text>
              <Text style={styles.cardBody}>"I will send the finalized project deliverables tomorrow morning."</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]}>
                  <Text style={styles.btnText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]}>
                  <Text style={styles.btnText}>Authorize</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}

        {activeTab === 'devices' && (
          <ScrollView style={styles.tabContent}>
            <Text style={styles.sectionHeader}>Paired Ecosystem</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Windows Desktop (Primary)</Text>
              <Text style={styles.cardMeta}>Last seen: Just now • Local PyAutoGUI & Ollama</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Mobile Companion (This Device)</Text>
              <Text style={styles.cardMeta}>State: Synchronized via Supabase Realtime</Text>
            </View>
          </ScrollView>
        )}
      </View>

      {/* Bottom Tabs */}
      <View style={styles.bottomNav}>
        {[
          { id: 'chat', label: 'Chat' },
          { id: 'tasks', label: 'Tasks' },
          { id: 'approvals', label: 'Approvals' },
          { id: 'devices', label: 'Devices' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id as any)}
            style={styles.navItem}
          >
            <Text style={[styles.navText, activeTab === tab.id && styles.navTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0d14',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#0e1322',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#e879f9',
  },
  subtitle: {
    fontSize: 9,
    color: '#94a3b8',
    letterSpacing: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  messagesList: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: '#4f46e5',
    alignSelf: 'flex-end',
    borderTopRightRadius: 2,
  },
  aiBubble: {
    backgroundColor: 'rgba(17, 23, 38, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 2,
  },
  messageText: {
    color: '#f8fafc',
    fontSize: 13,
    lineHeight: 18,
  },
  inputBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#0e1322',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#111726',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 13,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#c026d3',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'rgba(17, 23, 38, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 12,
    color: '#cbd5e1',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  cardStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fbbf24',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  rejectBtn: {
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
  },
  approveBtn: {
    backgroundColor: '#10b981',
  },
  btnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#0d121f',
    paddingVertical: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  navTextActive: {
    color: '#e879f9',
    fontWeight: '800',
  },
});
