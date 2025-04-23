
import React from "react";
import { Court } from "@/types/supabase";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";

interface CourtMultiSelectProps {
  options: Court[];
  value: string[];
  onChange: (value: string[]) => void;
  /** Optional: Will show placeholder when nothing is selected */
  placeholder?: string;
  label?: string;
}

export const CourtMultiSelect: React.FC<CourtMultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select courts...",
  label,
}) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  // Filtered courts for search
  const filtered = options.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.type.toLowerCase().includes(search.toLowerCase())
  );

  // Option toggle
  const handleCheck = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter(v => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  // Remove by chip "X"
  const handleRemoveChip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== id));
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-1">{label}</label>
      )}
      {/* Multi-select input with chips */}
      <div
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        className={`
          w-full min-h-11 rounded-lg border border-input px-3 py-2 flex flex-wrap gap-1 items-center focus-within:ring-2 focus-within:ring-primary relative bg-white cursor-pointer
          ${open ? "ring-2 ring-primary border-primary z-50" : ""}
        `}
        style={{ minHeight: 44, position: 'relative' }}
      >
        {value.length === 0 && (
          <span className="text-muted-foreground text-sm">{placeholder}</span>
        )}
        {value.map(id => {
          const c = options.find(o => o.id.toString() === id);
          if (!c) return null;
          return (
            <span key={id} className="flex items-center bg-primary/5 border rounded px-2 py-0.5 text-sm mr-1 mb-1 max-w-[140px]">
              {c.name}
              <button
                className="ml-1 text-muted-foreground rounded hover:bg-primary/10"
                aria-label={`Remove ${c.name}`}
                type="button"
                onClick={(e) => handleRemoveChip(id, e)}
                tabIndex={-1}
              >
                <X size={16} />
              </button>
            </span>
          );
        })}
        {/* Dropdown close X */}
        {value.length > 0 &&
          <button
            type="button"
            aria-label="Remove all"
            className="ml-auto text-muted-foreground hover:bg-primary/10 rounded p-0.5"
            onClick={e => {
              e.stopPropagation();
              onChange([]);
            }}
            tabIndex={-1}
          >
            <X size={18} />
          </button>
        }
      </div>
      {/* Dropdown Popup */}
      {open && (
        <div
          className="absolute z-[100] bg-white rounded-xl border mt-1 p-2 w-full shadow-xl"
          style={{ minWidth: 260 }}
          onClick={e => e.stopPropagation()}
        >
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="block w-full px-2 py-1.5 rounded border mb-2 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Search courts..."
            autoFocus
          />
          <div className="max-h-52 overflow-auto flex flex-col gap-1">
            {filtered.length === 0 && (
              <span className="text-xs text-muted-foreground px-2">No courts found</span>
            )}
            {filtered.map(opt => (
              <label
                className={`
                  flex items-center gap-2 cursor-pointer py-1 px-2 rounded-lg hover:bg-primary/10 transition select-none
                  ${value.includes(opt.id.toString()) ? "bg-primary/10" : ""}
                `}
                key={opt.id}
                htmlFor={`multi-court-${opt.id}`}
              >
                <Checkbox
                  id={`multi-court-${opt.id}`}
                  checked={value.includes(opt.id.toString())}
                  onCheckedChange={() => handleCheck(opt.id.toString())}
                />
                <span className="truncate">{opt.name} <span className="text-muted-foreground text-xs">({opt.type})</span></span>
              </label>
            ))}
          </div>
          <button
            className="absolute top-2 right-3 text-muted-foreground hover:text-primary"
            aria-label="Close dropdown"
            type="button"
            tabIndex={-1}
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
      )}
      {/* Clicking outside closes dropdown */}
      {open && (
        <div
          className="fixed inset-0 z-[90]"
          onClick={() => setOpen(false)}
          tabIndex={-1}
        />
      )}
    </div>
  );
};
