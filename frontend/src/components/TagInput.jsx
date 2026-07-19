import { useState } from 'react';
import { X, Tag } from 'lucide-react';

const PRESET_COLORS = [
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
];

function colorFor(tag) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  return PRESET_COLORS[Math.abs(hash) % PRESET_COLORS.length];
}

function TagInput({ tags = [], onChange }) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const value = input.trim();
    if (!value || tags.includes(value)) {
      setInput('');
      return;
    }
    onChange([...tags, value]);
    setInput('');
  };

  const removeTag = (tag) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${colorFor(tag)}`}
          >
            {tag}
            <button type="button" onClick={() => removeTag(tag)}>
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <Tag className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Gõ nhãn rồi nhấn Enter (VD: Remote, Ưu tiên cao)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
}

export default TagInput;