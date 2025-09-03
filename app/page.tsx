"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { statsService } from "@/lib/api";
import {
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  CreditCard,
  ArrowUpRight,
  Activity,
  UserCheck,
  Calendar,
  FileDown,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  AreaChart,
  Area,
  Pie,
} from "recharts";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
];

// Safe data transformation helper
const safeTransform = (data, transformer) => {
  try {
    if (!data || !Array.isArray(data)) return [];
    return data
      .map(transformer)
      .filter((item) => item !== null && item !== undefined);
  } catch (error) {
    console.error("Data transformation error:", error);
    return [];
  }
};

// Safe array access
const ensureArray = (data) => {
  return Array.isArray(data) ? data : [];
};

// Safe number formatting
const safeNumber = (value, defaultValue = 0) => {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

// PDF Download Component
const PDFDownloadButton = ({
  statsData,
  totalRevenue,
  totalOrders,
  totalCustomers,
  activeCustomers,
  monthlyData,
  hourlyOrders,
  paymentMethods,
  topProducts,
  customerGrowthData,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      // Dynamic import to avoid SSR issues
      const jsPDF = (await import("jspdf")).default;

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;

      // Helper function to add page break if needed
      let currentY = margin;
      const addPageBreakIfNeeded = (height) => {
        if (currentY + height > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
          return true;
        }
        return false;
      };

      // Header
      pdf.setFontSize(24);
      pdf.setTextColor(59, 130, 246); // Blue color
      pdf.text("Rapport d'Analyse E-commerce", margin, currentY);
      currentY += 15;

      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        `Généré le ${new Date().toLocaleDateString("fr-FR")}`,
        margin,
        currentY
      );
      currentY += 20;

      // Executive Summary
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Résumé Exécutif", margin, currentY);
      currentY += 10;

      pdf.setFontSize(11);
      pdf.setTextColor(60, 60, 60);

      const summaryText = [
        `• Chiffre d'affaires total: €${totalRevenue.toLocaleString("fr-FR", {
          minimumFractionDigits: 2,
        })}`,
        `• Nombre total de commandes: ${totalOrders.toLocaleString("fr-FR")}`,
        `• Clients totaux: ${totalCustomers.toLocaleString("fr-FR")}`,
        `• Clients actifs: ${activeCustomers.toLocaleString("fr-FR")}`,
        `• Panier moyen: €${
          totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : "0.00"
        }`,
        `• Taux d'activité clients: ${
          totalCustomers > 0
            ? ((activeCustomers / totalCustomers) * 100).toFixed(1)
            : "0"
        }%`,
      ];

      summaryText.forEach((text) => {
        pdf.text(text, margin, currentY);
        currentY += 6;
      });

      currentY += 10;

      // KPIs Section
      addPageBreakIfNeeded(60);
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Indicateurs Clés de Performance", margin, currentY);
      currentY += 15;

      // Draw KPI boxes
      const kpiData = [
        {
          label: "Chiffre d'affaires",
          value: `€${totalRevenue.toLocaleString("fr-FR", {
            minimumFractionDigits: 2,
          })}`,
          color: [34, 197, 94],
        },
        {
          label: "Total Commandes",
          value: totalOrders.toLocaleString("fr-FR"),
          color: [59, 130, 246],
        },
        {
          label: "Clients Actifs",
          value: activeCustomers.toLocaleString("fr-FR"),
          color: [139, 92, 246],
        },
        {
          label: "Total Clients",
          value: totalCustomers.toLocaleString("fr-FR"),
          color: [249, 115, 22],
        },
      ];

      const boxWidth = (pageWidth - 2 * margin - 10) / 2;
      const boxHeight = 25;

      kpiData.forEach((kpi, index) => {
        const x = margin + (index % 2) * (boxWidth + 10);
        const y = currentY + Math.floor(index / 2) * (boxHeight + 10);

        // Draw colored border
        pdf.setDrawColor(...kpi.color);
        pdf.setLineWidth(0.5);
        pdf.rect(x, y, boxWidth, boxHeight);

        // Add text
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.text(kpi.label, x + 5, y + 8);

        pdf.setFontSize(14);
        pdf.setFont(undefined, "bold");
        pdf.text(kpi.value, x + 5, y + 18);
        pdf.setFont(undefined, "normal");
      });

      currentY += 60;

      // Top Products
      addPageBreakIfNeeded(80);
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Top Produits", margin, currentY);
      currentY += 15;

      if (topProducts && topProducts.length > 0) {
        pdf.setFontSize(10);
        pdf.text("Produit", margin, currentY);
        pdf.text("Quantité Vendue", margin + 100, currentY);
        currentY += 8;

        topProducts.forEach((product) => {
          const productName =
            product.category.length > 35
              ? product.category.substring(0, 32) + "..."
              : product.category;

          pdf.text(productName, margin, currentY);
          pdf.text(product.sales.toString(), margin + 100, currentY);
          currentY += 6;
        });
      }

      // Payment Methods
      addPageBreakIfNeeded(60);
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Répartition des Modes de Paiement", margin, currentY);
      currentY += 15;

      if (paymentMethods && paymentMethods.length > 0) {
        const totalPayments = paymentMethods.reduce(
          (sum, method) => sum + method.amount,
          0
        );

        pdf.setFontSize(10);
        pdf.text("Mode de Paiement", margin, currentY);
        pdf.text("Montant", margin + 80, currentY);
        pdf.text("Pourcentage", margin + 130, currentY);
        currentY += 8;

        paymentMethods.forEach((method) => {
          const percentage =
            totalPayments > 0
              ? ((method.amount / totalPayments) * 100).toFixed(1)
              : "0";

          pdf.text(method.method, margin, currentY);
          pdf.text(
            `€${method.amount.toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
            })}`,
            margin + 80,
            currentY
          );
          pdf.text(`${percentage}%`, margin + 130, currentY);
          currentY += 6;
        });
      }

      // Footer
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(
          `Page ${i} sur ${totalPages} - Rapport généré automatiquement`,
          margin,
          pageHeight - 10
        );
      }

      // Save the PDF
      const fileName = `analytics-report-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Erreur lors de la génération du PDF. Veuillez réessayer.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={isGenerating}
      size="sm"
      className="gap-2"
      variant="outline"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Génération...
        </>
      ) : (
        <>
          <FileDown className="w-4 h-4" />
          Télécharger PDF
        </>
      )}
    </Button>
  );
};

export default function DashboardPage() {
  // Fetch all dashboard data
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => statsService.getDashboard(),
    refetchInterval: 30000,
    retry: 3,
  });
  

  const { data: recentOrders } = useQuery({
    queryKey: ["recent-orders"],
    queryFn: () => statsService.getRecentOrders(),
    refetchInterval: 60000,
    retry: 2,
  });

  const { data: ordersByHour } = useQuery({
    queryKey: ["orders-by-hour"],
    queryFn: () => statsService.getOrdersByHour(),
    retry: 2,
  });

  const { data: salesByPayment } = useQuery({
    queryKey: ["sales-by-payment"],
    queryFn: () => statsService.getSalesByPaymentMethod(),
    retry: 2,
  });

  const { data: monthlyRevenue } = useQuery({
    queryKey: ["monthly-revenue"],
    queryFn: () => statsService.getMonthlyRevenue(),
    retry: 2,
  });

  const { data: topCategories } = useQuery({
    queryKey: ["top-categories"],
    queryFn: () => statsService.getTopCategories(),
    retry: 2,
  });

  const { data: lowStock } = useQuery({
    queryKey: ["low-stock"],
    queryFn: () => statsService.getLowStockProducts(),
    retry: 2,
  });

  const { data: customerGrowth } = useQuery({
    queryKey: ["customer-growth"],
    queryFn: () => statsService.getCustomerGrowth(),
    retry: 2,
  });

  const { data: customerActivity } = useQuery({
    queryKey: ["customer-activity"],
    queryFn: () => statsService.getCustomerActivity(),
    retry: 2,
  });

  // Extract the correct data structure with proper fallbacks
  const statsData = stats?.data?.stats || {};
  const totalProducts = safeNumber(statsData?.totalProducts, 0);
  const customerActivityData =
    customerActivity?.data?.data || customerActivity?.data || {};
  const ordersHourlyData = ordersByHour?.data?.data || ordersByHour?.data || [];
  const paymentMethodsData =
    salesByPayment?.data?.data || salesByPayment?.data || [];
  const monthlyRevenueData =
    monthlyRevenue?.data?.data || monthlyRevenue?.data || [];
  const customerGrowthDataRaw =
    customerGrowth?.data?.data || customerGrowth?.data || [];

  // Safe data extraction with validation
  const totalRevenue = safeNumber(statsData?.totalRevenue, 0);
  const totalOrders = safeNumber(statsData?.totalOrders, 0);
  const totalCustomers = safeNumber(statsData?.totalCustomers, 0);
  const activeCustomers = safeNumber(customerActivityData?.activeCustomers, 0);
  const inactiveCustomers = safeNumber(
    customerActivityData?.inactiveCustomers,
    0
  );

  // Transform all data with complete safety
  const hourlyOrders = safeTransform(ordersHourlyData, (item) => {
    if (
      !item ||
      typeof item._id === "undefined" ||
      typeof item.count === "undefined"
    ) {
      return null;
    }
    return {
      hour: `${item._id}h`,
      orders: safeNumber(item.count, 0),
    };
  });

  const paymentMethods = safeTransform(paymentMethodsData, (item) => {
    if (!item || !item._id || typeof item.revenue === "undefined") {
      return null;
    }
    return {
      method:
        item._id === "stripe"
          ? "Carte bancaire"
          : item._id === "espèces"
          ? "Espèces"
          : item._id,
      amount: safeNumber(item.revenue, 0),
    };
  });

  const monthlyData = safeTransform(monthlyRevenueData, (item) => {
    if (!item || !item._id || typeof item.revenue === "undefined") {
      return null;
    }
    return {
      month: item._id || "",
      revenue: safeNumber(item.revenue, 0),
    };
  });

  // Use topProducts from statsData with proper validation
  const topProducts = safeTransform(
    ensureArray(statsData?.topProducts).slice(0, 5),
    (product) => {
      if (
        !product ||
        !product.name ||
        typeof product.totalQty === "undefined"
      ) {
        return null;
      }
      return {
        category: product.name,
        sales: safeNumber(product.totalQty, 0),
      };
    }
  );

  const customerGrowthData = safeTransform(customerGrowthDataRaw, (item) => {
    if (!item || !item._id || typeof item.count === "undefined") {
      return null;
    }
    return {
      month: item._id,
      newCustomers: safeNumber(item.count, 0),
    };
  });

  const statCards = [
    {
      title: "Chiffre d'affaires",
      value: `€${totalRevenue.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: DollarSign,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      borderColor: "border-green-200 dark:border-green-800",
      growth: "+12.5%",
      isPositive: true,
    },
    {
      title: "Total Commandes",
      value: totalOrders.toLocaleString("fr-FR"),
      icon: ShoppingCart,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      growth: "+8.2%",
      isPositive: true,
    },
    {
    title: "Total Produits",
    value: totalProducts.toLocaleString("fr-FR"),
    icon: Package, // Use the Package icon
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    borderColor: "border-purple-200 dark:border-purple-800",
    growth: "+15.3%",
    isPositive: true,
  },

    {
      title: "Total Utilisateurs",
      value: totalCustomers.toLocaleString("fr-FR"),
      icon: UserCheck,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      borderColor: "border-orange-200 dark:border-orange-800",
      growth: "-2.1%",
      isPositive: false,
    },
  ];

  if (statsLoading) {
    return (
      <DashboardLayout title="Tableau de bord">
        <div className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-24 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (statsError) {
    return (
      <DashboardLayout title="Tableau de bord">
        <div className="p-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Erreur lors du chargement des données. Veuillez rafraîchir la
              page.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Tableau de bord">
      <div className="p-6 space-y-8">
        {/* Header with PDF Download only */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Tableau de bord
            </h1>
            <p className="text-muted-foreground">
              Vue d'ensemble de votre boutique e-commerce
            </p>
          </div>
          <PDFDownloadButton
            statsData={statsData}
            totalRevenue={totalRevenue}
            totalOrders={totalOrders}
            totalCustomers={totalCustomers}
            activeCustomers={activeCustomers}
            monthlyData={monthlyData}
            hourlyOrders={hourlyOrders}
            paymentMethods={paymentMethods}
            topProducts={topProducts}
            customerGrowthData={customerGrowthData}
          />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            const GrowthIcon = stat.isPositive ? TrendingUp : TrendingDown;

            return (
              <Card
                key={stat.title}
                className={`hover:shadow-lg transition-all duration-200 border-l-4 ${stat.borderColor}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div
                      className={`flex items-center gap-1 text-sm font-medium ${
                        stat.isPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      <GrowthIcon className="w-4 h-4" />
                      {stat.growth}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Revenue Chart */}
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Chiffre d'affaires mensuel
                </CardTitle>
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient
                          id="colorRevenue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="month"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `€${value.toLocaleString()}`}
                      />
                      <Tooltip
                        formatter={(value) => [
                          `€${value.toLocaleString()}`,
                          "Chiffre d'affaires",
                        ]}
                        labelStyle={{ color: "#374151" }}
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Aucune donnée disponible
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Orders by Hour */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Commandes par heure
                </CardTitle>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {hourlyOrders.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyOrders}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="hour"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        formatter={(value) => [value, "Commandes"]}
                        labelStyle={{ color: "#374151" }}
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="orders"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Aucune donnée disponible
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Products */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Top Produits
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length > 0 ? (
                <>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={topProducts}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="sales"
                          nameKey="category"
                        >
                          {topProducts.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [
                            value.toLocaleString(),
                            "Quantité",
                          ]}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4">
                    {topProducts.slice(0, 3).map((category, index) => (
                      <div
                        key={category.category}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index] }}
                          />
                          <span className="truncate">{category.category}</span>
                        </div>
                        <span className="font-semibold">{category.sales}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  Aucune donnée disponible
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Modes de paiement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.length > 0 ? (
                  paymentMethods.map((method, index) => {
                    const totalAmount = paymentMethods.reduce(
                      (sum, m) => sum + (m?.amount || 0),
                      0
                    );
                    const percentage =
                      totalAmount > 0
                        ? ((method.amount / totalAmount) * 100).toFixed(1)
                        : 0;

                    return (
                      <div key={method.method} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{method.method}</span>
                          <span className="text-muted-foreground">
                            {percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold">
                            €{method.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Aucune donnée disponible
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer Activity */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Activité Clients
                </CardTitle>
                <Activity className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {(() => {
                      const totalCustomerActivity =
                        activeCustomers + inactiveCustomers;
                      if (totalCustomerActivity === 0) return "0";
                      const percentage =
                        (activeCustomers / totalCustomerActivity) * 100;
                      return percentage.toFixed(1);
                    })()}
                    %
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Clients actifs
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-sm">Actifs</span>
                    </div>
                    <span className="text-sm font-semibold">
                      {activeCustomers.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-400" />
                      <span className="text-sm">Inactifs</span>
                    </div>
                    <span className="text-sm font-semibold">
                      {inactiveCustomers.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Customer Growth Mini Chart */}
                <div className="mt-6">
                  <div className="text-sm font-medium mb-3">
                    Croissance (3 derniers mois)
                  </div>
                  <div className="h-[100px]">
                    {customerGrowthData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={customerGrowthData.slice(-3)}>
                          <Line
                            type="monotone"
                            dataKey="newCustomers"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                          />
                          <XAxis
                            dataKey="month"
                            fontSize={10}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            formatter={(value) => [value, "Nouveaux clients"]}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                        Pas de données de croissance
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders / Top Customers */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Top Clients
                </CardTitle>
                <Button variant="ghost" size="sm" className="gap-2">
                  Voir tout <ArrowUpRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {ensureArray(statsData?.topCustomers).length > 0 ? (
                  ensureArray(statsData?.topCustomers)
                    .slice(0, 5)
                    .map((customer, index) => (
                      <div
                        key={customer?._id || index}
                        className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-sm">
                              {customer?.fullName || "Unknown"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {customer?._id || "N/A"}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-sm">
                            €{safeNumber(customer?.spent, 0).toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {safeNumber(customer?.orders, 0)} commandes
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    Aucun client trouvé
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Alerts & Low Stock */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Alertes & Stock faible
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Low Stock Alert */}
              {ensureArray(lowStock?.data?.data || lowStock?.data).length >
              0 ? (
                <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800 dark:text-orange-200">
                    <div className="flex items-center justify-between">
                      <span>
                        {
                          ensureArray(lowStock?.data?.data || lowStock?.data)
                            .length
                        }{" "}
                        produits en stock faible
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-orange-600"
                      >
                        Gérer
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                  <Package className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    <div className="flex items-center justify-between">
                      <span>Tous les produits sont en stock suffisant</span>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Low Stock Items */}
              {ensureArray(lowStock?.data?.data || lowStock?.data).length >
                0 && (
                <div className="space-y-3">
                  <div className="text-sm font-medium">
                    Produits concernés :
                  </div>
                  {ensureArray(lowStock?.data?.data || lowStock?.data)
                    .slice(0, 3)
                    .map((product, index) => (
                      <div
                        key={product?.productId || index}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/20 flex items-center justify-center">
                            <Package className="w-4 h-4 text-red-600" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {product?.name || "Unknown Product"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              #{product?.productId || "N/A"}
                            </div>
                          </div>
                        </div>
                        <Badge variant="destructive" className="text-xs">
                          Stock: {safeNumber(product?.stock, 0)}
                        </Badge>
                      </div>
                    ))}
                </div>
              )}

              {/* Quick Actions */}
              <Separator />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="gap-2">
                  <Package className="w-4 h-4" />
                  Gérer stock
                </Button>
                <Button size="sm" variant="outline" className="gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Commandes en attente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders Section */}
        {recentOrders?.data && recentOrders.data.length > 0 && (
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Commandes récentes
                </CardTitle>
                <Button variant="ghost" size="sm" className="gap-2">
                  Voir toutes <ArrowUpRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {ensureArray(recentOrders?.data?.data || recentOrders?.data)
                  .slice(0, 5)
                  .map((order, index) => (
                    <div
                      key={order?._id || index}
                      className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">
                            #{order?._id?.slice(-8) || "N/A"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {order?.customer?.fullName || "Client inconnu"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {order?.createdAt
                              ? new Date(order.createdAt).toLocaleDateString(
                                  "fr-FR"
                                )
                              : "Date inconnue"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">
                          €{safeNumber(order?.amount, 0).toFixed(2)}
                        </div>
                        <Badge
                          variant={
                            order?.status === "payé" ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {order?.status || "Inconnu"}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {order?.paymentMethod === "stripe"
                            ? "Carte"
                            : "Espèces"}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
