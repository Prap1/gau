import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import { FloatingActionButtons } from "./FloatingActionButtons";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import FullScreenLoader from "./FullScreenLoader";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <div className="min-h-screen flex flex-col relative">
      <FullScreenLoader />
      <Header />
      <div className="flex flex-1">
        {isAuthenticated && <Sidebar />}
        <main className={`flex-1 min-w-0 pt-[120px] transition-all duration-300 ${isAuthenticated ? "lg:pl-64" : ""}`}>
          {children}
        </main>
      </div>
      {!isAuthenticated && <Footer />}
      {!isAuthenticated && <FloatingActionButtons />}
    </div>
  );
};

export default Layout;
