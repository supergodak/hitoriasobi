import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../db/config';

interface UserMentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onMentionsChange: (mentions: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

interface User {
  id: string;
  username: string;
}

const UserMentionInput: React.FC<UserMentionInputProps> = ({
  value,
  onChange,
  onMentionsChange,
  placeholder,
  disabled
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionStart, setMentionStart] = useState(-1);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (mentionSearch) {
      const fetchUsers = async () => {
        const { data } = await supabase
          .from('users')
          .select('id, username')
          .ilike('username', `${mentionSearch}%`)
          .limit(5);

        setUsers(data || []);
      };

      fetchUsers();
    } else {
      setUsers([]);
    }
  }, [mentionSearch]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const lastChar = newValue[newValue.length - 1];
    
    if (lastChar === '@') {
      setMentionStart(newValue.length - 1);
      setShowSuggestions(true);
      setMentionSearch('');
    } else if (mentionStart >= 0) {
      const searchText = newValue.slice(mentionStart + 1);
      setMentionSearch(searchText);
    }

    onChange(newValue);
  };

  const handleSelectUser = (user: User) => {
    const beforeMention = value.slice(0, mentionStart);
    const afterMention = value.slice(mentionStart + mentionSearch.length + 1);
    const newValue = `${beforeMention}@${user.username} ${afterMention}`;
    
    onChange(newValue);
    onMentionsChange([...new Set([user.id])]);
    setShowSuggestions(false);
    setMentionStart(-1);
    setMentionSearch('');
  };

  return (
    <div className="relative">
      <textarea
        ref={inputRef}
        value={value}
        onChange={handleInput}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        rows={3}
      />
      
      {showSuggestions && users.length > 0 && (
        <div className="absolute bottom-full left-0 w-full bg-white border rounded-lg shadow-lg mb-1">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => handleSelectUser(user)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100"
            >
              @{user.username}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserMentionInput;