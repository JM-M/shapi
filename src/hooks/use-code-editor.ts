import { useState, useCallback } from 'react';
import { SupportedLanguage } from '@/components/code-editor';

interface UseCodeEditorOptions {
  initialValue?: string;
  initialLanguage?: SupportedLanguage;
  onLanguageChange?: (language: SupportedLanguage) => void;
}

export function useCodeEditor({
  initialValue = '',
  initialLanguage = 'auto',
  onLanguageChange,
}: UseCodeEditorOptions = {}) {
  const [value, setValue] = useState(initialValue);
  const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage);

  const handleValueChange = useCallback((newValue: string) => {
    setValue(newValue);
  }, []);

  const handleLanguageChange = useCallback((newLanguage: SupportedLanguage) => {
    setLanguage(newLanguage);
    onLanguageChange?.(newLanguage);
  }, [onLanguageChange]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setLanguage(initialLanguage);
  }, [initialValue, initialLanguage]);

  const setValueAndLanguage = useCallback((newValue: string, newLanguage: SupportedLanguage) => {
    setValue(newValue);
    setLanguage(newLanguage);
  }, []);

  return {
    value,
    language,
    setValue: handleValueChange,
    setLanguage: handleLanguageChange,
    reset,
    setValueAndLanguage,
  };
}
