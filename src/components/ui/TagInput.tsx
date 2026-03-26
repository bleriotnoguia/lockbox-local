import React, { useState, useRef, KeyboardEvent } from 'react';
import { X, Tag } from 'lucide-react';
import { clsx } from 'clsx';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
  maxTags?: number;
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onChange,
  placeholder = 'Add a tag...',
  label,
  helperText,
  maxTags = 20,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const normalizeTag = (raw: string) =>
    raw.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '');

  const addTag = (raw: string) => {
    const tag = normalizeTag(raw);
    if (!tag || tags.includes(tag) || tags.length >= maxTags) return;
    onChange([...tags, tag]);
    setInputValue('');
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (inputValue.trim()) addTag(inputValue);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div
        onClick={() => inputRef.current?.focus()}
        className={clsx(
          'min-h-[40px] w-full px-2 py-1.5 border rounded-lg shadow-sm transition-colors cursor-text',
          'bg-white dark:bg-gray-800',
          'flex flex-wrap gap-1.5 items-center',
          isFocused
            ? 'border-primary-500 ring-2 ring-primary-500/20'
            : 'border-gray-300 dark:border-gray-600'
        )}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-md text-xs font-medium"
          >
            <Tag className="h-3 w-3" />
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
              className="ml-0.5 hover:text-primary-900 dark:hover:text-primary-100 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {tags.length < maxTags && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[100px] outline-none bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
        )}
      </div>
      {helperText && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
};
