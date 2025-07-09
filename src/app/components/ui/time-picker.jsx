'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TimePicker({ value, onChange }) {
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [ampm, setAmpm] = useState('AM');

  useEffect(() => {
    const h = value.getHours();
    const m = value.getMinutes();
    setHour(((h % 12) || 12).toString().padStart(2, '0'));
    setMinute(m.toString().padStart(2, '0'));
    setAmpm(h >= 12 ? 'PM' : 'AM');
  }, [value]);

  const updateTime = (newHour, newMinute, newAmpm) => {
    let h = parseInt(newHour);
    if (newAmpm === 'PM' && h < 12) h += 12;
    if (newAmpm === 'AM' && h === 12) h = 0;
    const newDate = new Date(value);
    newDate.setHours(h);
    newDate.setMinutes(parseInt(newMinute));
    newDate.setSeconds(0);
    onChange(newDate);
  };

  return (
    <div className="flex gap-1 items-center">
      <Input
        type="number"
        min={1}
        max={12}
        value={hour}
        onChange={(e) => {
          setHour(e.target.value);
          updateTime(e.target.value, minute, ampm);
        }}
        className="w-12"
      />
      <span className="text-sm">:</span>
      <Input
        type="number"
        min={0}
        max={59}
        value={minute}
        onChange={(e) => {
          setMinute(e.target.value);
          updateTime(hour, e.target.value, ampm);
        }}
        className="w-12"
      />
      <select
        value={ampm}
        onChange={(e) => {
          setAmpm(e.target.value);
          updateTime(hour, minute, e.target.value);
        }}
        className="border rounded px-1 text-sm"
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}
