import React from "react";
import { useNavigate } from "react-router-dom";
import { performLogout } from "@/utils/logout";

const HeaderAdmin = ({ title }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await performLogout();
    navigate("/auth?mode=login", { replace: true });
  };

  return (
    <header className="bg-[#FFFDD0] bg-opacity-50 backdrop-blur-md shadow-lg ">
			<div className="max-w-7xl flex justify-between items-center mx-auto py-4 px-4 sm:px-6 lg:px-8">
				<h1 className="text-2xl font-semibold text-black">
					{title}
				</h1>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm font-medium text-black shadow-sm transition-colors hover:bg-black hover:text-white"
        >
          Đăng xuất
        </button>
			</div>
		</header>
  );
};

export default HeaderAdmin
