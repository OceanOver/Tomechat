'use client';

import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/utils/cn';
import { ReactNode, memo, useCallback, useEffect, useState } from 'react';

export interface SliderWithInputProps {
  className?: string;
  disabled?: boolean;
  marks?: Record<number, ReactNode>;
  max?: number;
  min?: number;
  onChange?: (value: number) => void;
  step?: number;
  style?: React.CSSProperties;
  value?: number;
}

const SliderWithInput = memo<SliderWithInputProps>(
  ({ className, disabled, marks, max = 100, min = 0, onChange, step = 1, style, value }) => {
    const [inputValue, setInputValue] = useState<string>(String(value ?? min));

    useEffect(() => {
      if (value != null) setInputValue(String(value));
    }, [value]);

    const clamp = useCallback(
      (v: number) => Math.min(Math.max(v, min), max),
      [min, max],
    );

    const handleSliderChange = useCallback(
      (values: number[]) => {
        const v = values[0];
        setInputValue(String(v));
        onChange?.(v);
      },
      [onChange],
    );

    const commitInput = useCallback(() => {
      const parsed = Number.parseFloat(inputValue);
      if (Number.isNaN(parsed)) {
        setInputValue(String(value ?? min));
        return;
      }
      const clamped = clamp(parsed);
      setInputValue(String(clamped));
      if (clamped !== value) onChange?.(clamped);
    }, [clamp, inputValue, min, onChange, value]);

    const markEntries = marks ? Object.entries(marks) : [];

    return (
      <div className={cn('flex items-center gap-3', className)} style={style}>
        <div className="relative min-w-0 flex-1">
          <Slider
            className={marks ? 'mb-4' : undefined}
            defaultValue={value != null ? [value] : undefined}
            disabled={disabled}
            max={max}
            min={min}
            onValueChange={handleSliderChange}
            step={step}
            value={value != null ? [value] : undefined}
          />
          {markEntries.length > 0 && (
            <div className="pointer-events-none relative h-4">
              {markEntries.map(([key, node]) => (
                <span
                  className="absolute -translate-x-1/2 text-xs text-muted-foreground"
                  key={key}
                  style={{ left: `${((Number(key) - min) / (max - min)) * 100}%` }}
                >
                  {node}
                </span>
              ))}
            </div>
          )}
        </div>
        <Input
          className="h-7 w-16 px-2 text-center text-sm"
          disabled={disabled}
          onBlur={commitInput}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          }}
          type="number"
          value={inputValue}
        />
      </div>
    );
  },
);

SliderWithInput.displayName = 'SliderWithInput';

export default SliderWithInput;
