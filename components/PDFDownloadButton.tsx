import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, Loader2 } from "lucide-react";

// You'll need to install these packages:
// npm install jspdf html2canvas

interface PDFDownloadButtonProps {
  statsData: any;
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  activeCustomers: number;
  monthlyData: Array<{ month: string; revenue: number }>;
  hourlyOrders: Array<{ hour: string; orders: number }>;
  paymentMethods: Array<{ method: string; amount: number }>;
  topProducts: Array<{ category: string; sales: number }>;
  customerGrowthData: Array<{ month: string; newCustomers: number }>;
}

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
}: PDFDownloadButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      // Dynamic import to avoid SSR issues
      const jsPDF = (await import("jspdf")).default;
      const html2canvas = (await import("html2canvas")).default;

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;

      // Helper function to add page break if needed
      let currentY = margin;
      const addPageBreakIfNeeded = (height: number): boolean => {
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
          color: [34, 197, 94] as [number, number, number],
        },
        {
          label: "Total Commandes",
          value: totalOrders.toLocaleString("fr-FR"),
          color: [59, 130, 246] as [number, number, number],
        },
        {
          label: "Clients Actifs",
          value: activeCustomers.toLocaleString("fr-FR"),
          color: [139, 92, 246] as [number, number, number],
        },
        {
          label: "Total Clients",
          value: totalCustomers.toLocaleString("fr-FR"),
          color: [249, 115, 22] as [number, number, number],
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

        // Add background
        pdf.setFillColor(...kpi.color, 0.1);
        pdf.rect(x, y, boxWidth, boxHeight, "F");

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

      // Monthly Revenue Chart Data
      addPageBreakIfNeeded(80);
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Évolution du Chiffre d'Affaires Mensuel", margin, currentY);
      currentY += 15;

      if (monthlyData && monthlyData.length > 0) {
        pdf.setFontSize(10);
        pdf.text("Mois", margin, currentY);
        pdf.text("Chiffre d'Affaires", margin + 60, currentY);
        currentY += 8;

        monthlyData.slice(0, 12).forEach((month) => {
          pdf.text(month.month, margin, currentY);
          pdf.text(
            `€${month.revenue.toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
            })}`,
            margin + 60,
            currentY
          );
          currentY += 6;
        });
      } else {
        pdf.setTextColor(100, 100, 100);
        pdf.text("Aucune donnée mensuelle disponible", margin, currentY);
      }

      currentY += 15;

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
      } else {
        pdf.setTextColor(100, 100, 100);
        pdf.text("Aucune donnée de produits disponible", margin, currentY);
      }

      currentY += 15;

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
      } else {
        pdf.setTextColor(100, 100, 100);
        pdf.text("Aucune donnée de paiement disponible", margin, currentY);
      }

      // Footer
      const totalPages = pdf.getNumberOfPages();

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

export default PDFDownloadButton;
