import { ChevronDown } from "lucide-react";
import { useState } from "react";

const TemplateDropdown = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("Template A");

  const templates = ["Template A", "Template B"];

  const filtered = templates.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-44">
      {/* Button */}
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between rounded-full px-5 py-2 cursor-pointer bg-primary text-white"
      >
        <span className="text-sm font-medium">{selected}</span>
        <ChevronDown size={18} />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute mt-2 w-full bg-white rounded-lg shadow-lg z-50 p-2">
          {/* Search */}
          <input
            type="text"
            placeholder="Search..."
            className="w-full border border-borderColor rounded-md px-2 py-1 mb-2 text-sm outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Options */}
          <div className="max-h-32 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <div
                  key={item}
                  onClick={() => {
                    setSelected(item);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="px-2 py-1 text-sm hover:bg-gray-100 cursor-pointer rounded"
                >
                  {item}
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-400 px-2 py-1">
                No results
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateDropdown;
