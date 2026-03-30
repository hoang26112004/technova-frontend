import React, { Children } from "react";
import SidebarAdmin from "./SidebarAdmin";
import { Route, Routes } from "react-router-dom";
import Overview from "./Overview";

const LayoutAdmin = ({ children }) => {
	return (
		<div className="flex h-screen bg-white overflow-hidden">
			<div className="fixed inset-0 z-0">
				<div className="absolute inset-0 bg-white opacity-80" />
				<div className="absolute inset-0 backdrop-blur-sm" />
			</div>
			<SidebarAdmin />
            <div className="relative z-10 flex-1 overflow-auto">
                {children}
            </div>
		</div>
	);
};

export default LayoutAdmin;
