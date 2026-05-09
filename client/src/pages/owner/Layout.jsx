import React, { useEffect } from "react";
import Sidebar from "../../components/owner/Sidebar";
import NavbarOwner from "../../components/owner/NavbarOwner";
import { Outlet } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

const Layout = () => {
  const { isOwner, isSuperAdmin, navigate } = useAppContext()

  useEffect(() => {
    if (!isOwner && !isSuperAdmin) {
      navigate('/')
    }
  }, [isOwner, isSuperAdmin])

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F6FA]">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <NavbarOwner />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
