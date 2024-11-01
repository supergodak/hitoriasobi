import { useState, useEffect } from 'react';
import { supabase } from '../db/config';
import { ChatMessage } from '../types/Chat';

const DEBUG = true;

export const useLocationChat = (locationId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    if (DEBUG) console.log('🔄 Fetching messages for location:', locationId);
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('location_messages')
        .select(`
          *,
          user:users (username)
        `)
        .eq('location_id', locationId)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      if (DEBUG) console.log('📥 Received messages:', data?.length);
      setMessages(data || []);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching messages:', err);
      setError('メッセージの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (DEBUG) console.log('🔌 Setting up realtime subscription for location:', locationId);
    fetchMessages();

    const channel = supabase.channel(`location_messages:${locationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'location_messages',
          filter: `location_id=eq.${locationId}`
        },
        (payload) => {
          if (DEBUG) console.log('📨 Received realtime event:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as ChatMessage;
            if (DEBUG) console.log('➕ Adding new message:', newMessage);
            setMessages(prev => [...prev, newMessage]);
          } else if (payload.eventType === 'DELETE') {
            if (DEBUG) console.log('➖ Removing message:', payload.old.id);
            setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
          }
        }
      )
      .subscribe(status => {
        if (DEBUG) console.log('📡 Channel status:', status);
      });

    return () => {
      if (DEBUG) console.log('🔌 Cleaning up subscription');
      channel.unsubscribe();
    };
  }, [locationId]);

  const sendMessage = async (content: string, mentions: string[] = []) => {
    if (DEBUG) console.log('📤 Sending message:', { content, mentions });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ログインが必要です');

      const { data, error } = await supabase
        .from('location_messages')
        .insert({
          location_id: locationId,
          user_id: user.id,
          content,
          mentions,
          expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
        })
        .select(`
          *,
          user:users (username)
        `)
        .single();

      if (error) throw error;
      if (DEBUG) console.log('✅ Message sent successfully:', data);

      // 送信後に即時反映
      setMessages(prev => [...prev, data]);
    } catch (err) {
      console.error('❌ Error sending message:', err);
      throw new Error('メッセージの送信に失敗しました');
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage
  };
};