import { createContext, useContext, useState, ReactNode } from "react";

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  department: string;
  postalCode: string;
}

interface CustomerInfoContextType {
  customerInfo: CustomerInfo;
  setCustomerInfo: (info: CustomerInfo) => void;
  updateCustomerInfo: (updates: Partial<CustomerInfo>) => void;
}

const CustomerInfoContext = createContext<CustomerInfoContextType | undefined>(undefined);

export function CustomerInfoProvider({ children }: { children: ReactNode }) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    department: "",
    postalCode: "",
  });

  const updateCustomerInfo = (updates: Partial<CustomerInfo>) => {
    setCustomerInfo(prev => ({ ...prev, ...updates }));
  };

  return (
    <CustomerInfoContext.Provider value={{
      customerInfo,
      setCustomerInfo,
      updateCustomerInfo
    }}>
      {children}
    </CustomerInfoContext.Provider>
  );
}

export function useCustomerInfo() {
  const context = useContext(CustomerInfoContext);
  if (context === undefined) {
    throw new Error('useCustomerInfo must be used within a CustomerInfoProvider');
  }
  return context;
}