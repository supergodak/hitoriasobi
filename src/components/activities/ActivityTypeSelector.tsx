import React from 'react';
import { Tent, Compass, Activity } from 'lucide-react';
import { ActivityType } from '../../types/Activity';

interface ActivityTypeSelectorProps {
  value: ActivityType;
  onChange: (type: ActivityType) => void;
  disabled?: boolean;
}

const ActivityTypeSelector: React.FC<ActivityTypeSelectorProps> = ({
  value,
  onChange,
  disabled
}) => {
  const types = [
    { type: 'camp' as ActivityType, icon: <Tent />, label: 'キャンプ' },
    { type: 'travel' as ActivityType, icon: <Compass />, label: '旅行' },
    { type: 'other' as ActivityType, icon: <Activity />, label: 'その他' }
  ];

  return (
    <div className="flex space-x-2">
      {types.map(({ type, icon, label }) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          disabled={disabled}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            value === type
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className="w-5 h-5 mr-2">{icon}</span>
          {label}
        </button>
      ))}
    </div>
  );
};

export default ActivityTypeSelector;