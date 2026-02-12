import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { getAllCustomersApi } from "../../API/customerApi";

const TemplateDropdown = ({ onCustomerSelect, selectedCustomer }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("Select Customer");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Update selected name when selectedCustomer prop changes
  useEffect(() => {
    if (selectedCustomer) {
      setSelected(selectedCustomer.customer_name || "Customer Selected");
    } else {
      // Load saved customer on mount if no prop provided
      const savedCustomer = localStorage.getItem("selectedQuotationCustomer");
      if (savedCustomer) {
        try {
          const customer = JSON.parse(savedCustomer);
          setSelected(customer.customer_name || "Customer Selected");
        } catch (error) {
          console.error("Error loading saved customer:", error);
        }
      }
    }
  }, [selectedCustomer]);

  // Fetch active customers
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const response = await getAllCustomersApi(search);
        if (response.success) {
          const clients = response.data?.clients || response.data || [];
          // Filter only active customers
          const activeCustomers = clients.filter(
            (customer) => customer.is_active !== false
          );
          setCustomers(activeCustomers);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchCustomers();
    }
  }, [open, search]);

  const filtered = customers.filter((customer) => {
    const searchLower = search.toLowerCase();
    return (
      customer.customer_name?.toLowerCase().includes(searchLower) ||
      customer.company_name?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower)
    );
  });

  const handleSelect = (customer) => {
    setSelected(customer.customer_name || "Customer");
    setOpen(false);
    setSearch("");
    // Pass selected customer to parent component
    if (onCustomerSelect) {
      onCustomerSelect(customer);
    }
  };

  return (
    <div className="relative w-56">
      {/* Button */}
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between rounded-full px-5 py-2 cursor-pointer bg-primary text-white"
      >
        <span className="text-sm font-medium truncate max-w-45">
          {selected}
        </span>
        <ChevronDown size={18} className="shrink-0" />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute mt-2 w-full bg-white rounded-lg shadow-lg z-50 p-2 min-w-62.5">
          {/* Search */}
          <input
            type="text"
            placeholder="Search customer..."
            className="w-full border border-borderColor rounded-md px-2 py-1 mb-2 text-sm outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />

          {/* Options */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="text-sm text-gray-400 px-2 py-1 text-center">
                Loading...
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => handleSelect(customer)}
                  className="px-2 py-2 text-sm hover:bg-gray-100 cursor-pointer rounded"
                >
                  <div className="font-medium text-textPrimary">
                    {customer.customer_name}
                  </div>
                  {customer.company_name && (
                    <div className="text-xs text-gray-500">
                      {customer.company_name}
                    </div>
                  )}
                  {customer.email && (
                    <div className="text-xs text-gray-400">{customer.email}</div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-400 px-2 py-1 text-center">
                No customers found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateDropdown;
