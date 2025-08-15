// Dashboard.tsx
import { useEffect, useState } from "react";
import * as api from "../api";



type DashboardData = {
  empresasAtivas: number;
  totalMotoristas: number;
  totalVeiculos: number;
  totalAbastecimentos: number;
};

export default function Dashboard() {
  const [, setData] = useState<DashboardData>({
    empresasAtivas: 0,
    totalMotoristas: 0,
    totalVeiculos: 0,
    totalAbastecimentos: 0,
  });

  useEffect(() => {
    (async () => {
      try {
 
        const d = api.dashboard() as unknown as Partial<DashboardData>;

        setData({
          empresasAtivas: d?.empresasAtivas ?? 0,
          totalMotoristas: d?.totalMotoristas ?? 0,
          totalVeiculos: d?.totalVeiculos ?? 0,
          totalAbastecimentos: d?.totalAbastecimentos ?? 0,
        });
      } catch (err) {
        console.error("Falha ao carregar dashboard:", err);
        setData({
          empresasAtivas: 0,
          totalMotoristas: 0,
          totalVeiculos: 0,
          totalAbastecimentos: 0,
        });
      }
    })();
  }, []);


  return null;
}
