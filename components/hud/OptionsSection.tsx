'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';

interface OptionsSectionProps {
  onOptionsChanged?: () => void;
}

export default function OptionsSection({ onOptionsChanged }: OptionsSectionProps) {
  const [options, setOptions] = useState({
    showFavoritesFirst: true,
    autoScrollList: true,
    confirmBeforeDelete: true,
    showButtonNumbers: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const result = await apiClient.getOptions();
      setOptions(result.options || options);
    } catch (err) {
      console.error('Failed to load options:', err);
    }
  };

  const handleToggle = async (key: keyof typeof options) => {
    const newOptions = {
      ...options,
      [key]: !options[key],
    };

    setOptions(newOptions);
    setIsSaving(true);

    try {
      await apiClient.updateOptions(newOptions);
      onOptionsChanged?.();
    } catch (err) {
      console.error('Failed to save options:', err);
      // Revert on error
      setOptions(options);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="options-section">
      <div className="options-header">
        <h3>Options</h3>
      </div>

      <div className="options-list">
        <div className="option-item">
          <label className="option-label">
            <input
              type="checkbox"
              checked={options.showFavoritesFirst}
              onChange={() => handleToggle('showFavoritesFirst')}
              disabled={isSaving}
            />
            <span>Show Favorites First</span>
          </label>
        </div>

        <div className="option-item">
          <label className="option-label">
            <input
              type="checkbox"
              checked={options.autoScrollList}
              onChange={() => handleToggle('autoScrollList')}
              disabled={isSaving}
            />
            <span>Auto Scroll List</span>
          </label>
        </div>

        <div className="option-item">
          <label className="option-label">
            <input
              type="checkbox"
              checked={options.confirmBeforeDelete}
              onChange={() => handleToggle('confirmBeforeDelete')}
              disabled={isSaving}
            />
            <span>Confirm Before Delete</span>
          </label>
        </div>

        <div className="option-item">
          <label className="option-label">
            <input
              type="checkbox"
              checked={options.showButtonNumbers}
              onChange={() => handleToggle('showButtonNumbers')}
              disabled={isSaving}
            />
            <span>Show Button Numbers</span>
          </label>
        </div>
      </div>
    </div>
  );
}
