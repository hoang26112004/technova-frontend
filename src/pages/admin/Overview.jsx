import HeaderAdmin from "@/components/admin/HeaderAdmin";
import React, { useEffect, useMemo, useState } from "react";
import LayoutAdmin from "./LayoutAdmin";
import { BarChart2, ShoppingBag, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";
import StatCard from "@/components/admin/StatCard";
import SaleOverviewChart from "@/components/admin/chart/SaleOverviewChart";
import CategoryDistributionChart from "@/components/admin/chart/CategoryDistributionChart";
import WeeklySalesChart from "@/components/admin/chart/WeeklySalesChart";
import SalesByProductTypeChart from "@/components/admin/chart/SalesByProductTypeChart";
import dashboardApi from "@/utils/api/dashboardApi";

const formatCurrency = (value) => {
	const number = Number(value || 0);
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 0,
	}).format(number);
};

const formatNumber = (value) =>
	new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
		Number(value || 0)
	);

const formatOrdersPerUser = (value) =>
	new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
		Number(value || 0)
	);

const Overview = () => {
	const [overview, setOverview] = useState(null);
	const [loading, setLoading] = useState(true);
	const today = new Date();
	const [weeklyMonth, setWeeklyMonth] = useState(today.getMonth() + 1);
	const [weeklyYear] = useState(today.getFullYear());
	const [weeklySales, setWeeklySales] = useState([]);
	const [weeklySalesLoading, setWeeklySalesLoading] = useState(false);

	useEffect(() => {
		let mounted = true;
		setLoading(true);
		dashboardApi
			.getOverview()
			.then((res) => {
				const data = res?.data?.data || null;
				if (mounted) setOverview(data);
			})
			.catch((err) => {
				console.error("Load dashboard overview error:", err);
				if (mounted) setOverview(null);
			})
			.finally(() => {
				if (mounted) setLoading(false);
			});
		return () => {
			mounted = false;
		};
	}, []);

	useEffect(() => {
		let mounted = true;
		setWeeklySalesLoading(true);
		dashboardApi
			.getWeeklySalesByMonth({ year: weeklyYear, month: weeklyMonth })
			.then((res) => {
				const data = res?.data?.data || [];
				if (mounted) setWeeklySales(Array.isArray(data) ? data : []);
			})
			.catch((err) => {
				console.error("Load weekly sales error:", err);
				if (mounted) setWeeklySales([]);
			})
			.finally(() => {
				if (mounted) setWeeklySalesLoading(false);
			});
		return () => {
			mounted = false;
		};
	}, [weeklyYear, weeklyMonth]);

	const kpis = overview?.kpis || null;
	const monthlySales = useMemo(
		() => overview?.monthlySales || [],
		[overview?.monthlySales]
	);
	const categoryDistribution = useMemo(
		() => overview?.categoryDistribution || [],
		[overview?.categoryDistribution]
	);
	const salesByCategory = useMemo(
		() => overview?.salesByCategory || [],
		[overview?.salesByCategory]
	);

	const statValues = {
		totalSales: loading ? "..." : formatCurrency(kpis?.totalSales),
		newUsers: loading ? "..." : formatNumber(kpis?.newUsers),
		totalProducts: loading ? "..." : formatNumber(kpis?.totalProducts),
		ordersPerUser: loading ? "..." : formatOrdersPerUser(kpis?.ordersPerUser),
	};

	return (
		<LayoutAdmin>
			<div className="flex-1 overflow-auto relative z-10">
				<HeaderAdmin title={"Tổng quan"} />
				<main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
					<motion.div
						className="grid grid-cols-1 gap-5 mb-8 lg:grid-cols-4"
						initial={{ opacity: 0, x: 30 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}
					>
						<StatCard
							name="Tổng doanh số"
							icon={Zap}
							value={statValues.totalSales}
							color="#6366F1"
						/>
						<StatCard
							name="Người dùng mới"
							icon={Users}
							value={statValues.newUsers}
							color="#8B5CF6"
						/>
						<StatCard
							name="Tổng sản phẩm"
							icon={ShoppingBag}
							value={statValues.totalProducts}
							color="#EC4899"
						/>
						<StatCard
							name="Đơn hàng / người dùng"
							icon={BarChart2}
							value={statValues.ordersPerUser}
							color="#10B981"
						/>
					</motion.div>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						<SaleOverviewChart data={monthlySales} />
						<WeeklySalesChart
							data={weeklySales}
							month={weeklyMonth}
							onMonthChange={setWeeklyMonth}
							loading={weeklySalesLoading}
						/>
						<CategoryDistributionChart data={categoryDistribution} />
						<SalesByProductTypeChart data={salesByCategory} />
					</div>
				</main>
			</div>
		</LayoutAdmin>
	);
};

export default Overview;
