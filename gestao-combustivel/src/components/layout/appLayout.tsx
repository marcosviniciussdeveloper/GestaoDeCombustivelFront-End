import type { PropsWithChildren } from "react";
import Sidebar from "../sidebar";


export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <div style={{display:"flex",minHeight:"100vh",background:"#f8f9fa"}}>
      <Sidebar />
      <main style={{flex:1, padding:24}}>{children}</main>
    </div>
  );
}
