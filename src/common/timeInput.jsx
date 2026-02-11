import { useEffect, useState } from "react";

const TimeInput = ({ label, value, onChange, error }) => {
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));
  const ampm = ["AM", "PM"];

  const [local, setLocal] = useState({ hour: "", minute: "", ampm: "" });

  // Convert 24h ("13:45") -> 12h UI ("01", "45", "PM")
  const convert24to12 = (time) => {
    if (!time) return { hour: "", minute: "", ampm: "" };
    const [h, m] = time.split(":");
    let hour = parseInt(h, 10);
    let minute = m;
    let period = "AM";

    if (hour === 0) {
      hour = 12; // midnight
      period = "AM";
    } else if (hour === 12) {
      period = "PM";
    } else if (hour > 12) {
      hour -= 12;
      period = "PM";
    }

    return {
      hour: hour.toString().padStart(2, "0"),
      minute,
      ampm: period,
    };
  };

  // Convert 12h (UI) -> 24h ("HH:mm")
  const convert12to24 = ({ hour, minute, ampm }) => {
    let h = parseInt(hour, 10);

    if (ampm === "AM" && h === 12) h = 0;
    if (ampm === "PM" && h !== 12) h += 12;

    return `${h.toString().padStart(2, "0")}:${minute}`;
  };

  // Load old value in edit mode
  useEffect(() => {
    setLocal(convert24to12(value));
  }, [value]);

  const updateLocal = (field, val) => {
    setLocal((prev) => {
      const updated = { ...prev, [field]: val };

      if (updated.hour && updated.minute && updated.ampm) {
        const final24 = convert12to24(updated);
        onChange(final24); // send 24-hour format to parent
      }

      return updated;
    });
  };

  return (
    <div className="mb-4 w-full">
      {label && (
        <label className="block text-sm font-medium text-primary mb-1">
          {label}
        </label>
      )}

      <div className="flex items-center gap-2">
        {/* Hour */}
        <select
          value={local.hour}
          onChange={(e) => updateLocal("hour", e.target.value)}
          className="border border-borderColor text-sm p-3 rounded-md text-primary w-full"
        >
          <option value="">HH</option>
          {hours.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>

        <span className="font-bold text-gray-500">:</span>

        {/* Minute */}
        <select
          value={local.minute}
          onChange={(e) => updateLocal("minute", e.target.value)}
          className="border border-borderColor  text-sm p-3 rounded-md text-primary w-full"
        >
          <option value="">MM</option>
          {minutes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        {/* AM/PM */}
        <select
          value={local.ampm}
          onChange={(e) => updateLocal("ampm", e.target.value)}
          className="border border-borderColor  text-sm p-3 rounded-md text-primary w-full"
        >
          <option value="" disabled>-</option>
          {ampm.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default TimeInput;
