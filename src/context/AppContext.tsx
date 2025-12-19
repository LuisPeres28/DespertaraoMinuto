import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

type AppContextType = {
  bookings: any[];
  clients: any[];
  services: any[];
  therapists: any[];
  payments: any[];
  coupons: any[];
  setBookings: (bookings: any[]) => void;
  setClients: (clients: any[]) => void;
  setServices: (services: any[]) => void;
  setTherapists: (therapists: any[]) => void;
  setPayments: (payments: any[]) => void;
  setCoupons: (coupons: any[]) => void;
  refreshData: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const [bookingsRes, clientsRes, servicesRes, therapistsRes, paymentsRes, couponsRes] = await Promise.all([
        supabase.from("bookings").select("*").order("booking_date", { ascending: false }),
        supabase.from("user_profiles").select("*"),
        supabase.from("services").select("*"),
        supabase.from("users").select("*").eq("user_type", "therapist"),
        supabase.from("payments").select("*"),
        supabase.from("coupons").select("*"),
      ]);

      if (bookingsRes.data) setBookings(bookingsRes.data);
      if (clientsRes.data) setClients(clientsRes.data);
      if (servicesRes.data) setServices(servicesRes.data);
      if (therapistsRes.data) setTherapists(therapistsRes.data);
      if (paymentsRes.data) setPayments(paymentsRes.data);
      if (couponsRes.data) setCoupons(couponsRes.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AppContext.Provider
      value={{
        bookings,
        clients,
        services,
        therapists,
        payments,
        coupons,
        setBookings,
        setClients,
        setServices,
        setTherapists,
        setPayments,
        setCoupons,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext deve ser usado dentro de AppProvider");
  }
  return context;
}

export const useApp = useAppContext;
