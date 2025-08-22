import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
// import InterRegular from "@/assets/fonts/Inter-Regular-normal.js"; // generated base64

export const generateMeetingPDF = (meeting, meeting_insights, speaker_summaries) => {
  const doc = new jsPDF();

  // Add custom font (optional)
  // doc.addFileToVFS("Inter-Regular.ttf", InterRegular);
  // doc.addFont("Inter-Regular.ttf", "Inter", "normal");
  // doc.setFont("Inter");

  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginTop = 20;
  const marginBottom = 20;
  let y = marginTop;

  const paintBackground = () => {
    doc.setFillColor(240, 253, 244); // #F0FDF4
    doc.rect(0, 0, pageWidth, pageHeight, "F");
  };

  const addNewPage = () => {
    doc.addPage();
    paintBackground();
    y = marginTop;
  };

  // Paint background for first page
  paintBackground();

  // --- Title ---
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text(
    "AI Insights",
    doc.internal.pageSize.getWidth() / 2, // center X
    y,
    { align: "center" }
  );
  y += 14;

  // --- Meeting Summary ---
  if (meeting_insights?.structured_summary?.summary_text) {
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Meeting Summary", 14, y);
    y += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, "normal");

    const lines = meeting_insights.structured_summary.summary_text.split("\n");
    let currentHeading = "";

    lines.forEach((line) => {
      const trimmed = line.trim();

      if (trimmed.startsWith("## ")) {
        currentHeading = trimmed.replace("## ", "");
        if (y + 8 > pageHeight - marginBottom) addNewPage();
        doc.setFont(undefined, "bold");
        doc.text(currentHeading, 14, y);
        doc.setFont(undefined, "normal");
        y += 8;
      } else if (trimmed.startsWith("- ")) {
        // Normal bullet points
        const bullet = `• ${trimmed.replace("- ", "")}`;
        const wrapped = doc.splitTextToSize(bullet, 170);
        if (y + wrapped.length * 7 > pageHeight - marginBottom) addNewPage();
        doc.text(wrapped, 20, y);
        y += wrapped.length * 7;
      } else if (trimmed !== "") {
        const wrapped = doc.splitTextToSize(trimmed, 180);
        if (y + wrapped.length * 7 > pageHeight - marginBottom) addNewPage();

        // Force bullets for these headings
        if (
          currentHeading.includes("Key Discussion Themes") ||
          currentHeading.includes("High-Level Outcomes")
        ) {
          doc.text(`• ${wrapped}`, 20, y);
        } else {
          doc.text(wrapped, 14, y);
        }

        y += wrapped.length * 7;
      } else {
        y += 5;
      }
    });

    y += 12;
  }

  // --- Minutes ---
  if (meeting_insights?.structured_summary?.minutes) {
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Minutes of the Meeting", 14, y);
    y += 10;

    // Date
    doc.setFontSize(12);
    doc.setFont(undefined, "normal");
    doc.text(
      `Date: ${
        meeting?.end_time
          ? format(new Date(meeting.end_time), "MMMM d, yyyy, h:mm a")
          : "N/A"
      }`,
      14,
      y
    );
    y += 8;

    // Attendees
    if (speaker_summaries) {
      const attendeesText = `Attendees: ${Object.keys(speaker_summaries).join(", ")}`;
      const wrapped = doc.splitTextToSize(attendeesText, 180);
      if (y + wrapped.length * 7 > pageHeight - marginBottom) addNewPage();
      doc.text(wrapped, 14, y);
      y += wrapped.length * 7 + 8;
    }

    doc.setFontSize(11);
    const lines = meeting_insights.structured_summary.minutes.split("\n");
    let sectionNum = 0;
    let currentHeading = "";

    lines.forEach((line) => {
      const trimmed = line.trim();

      if (trimmed.startsWith("## ")) {
        sectionNum++;
        currentHeading = trimmed.replace("## ", "");
        const heading = `${sectionNum}. ${currentHeading}`;
        if (y + 8 > pageHeight - marginBottom) addNewPage();
        doc.setFont(undefined, "bold");
        doc.text(heading, 14, y);
        doc.setFont(undefined, "normal");
        y += 8;
      } else if (trimmed.startsWith("- ")) {
        const bullet = `• ${trimmed.replace("- ", "")}`;
        const wrapped = doc.splitTextToSize(bullet, 170);
        if (y + wrapped.length * 7 > pageHeight - marginBottom) addNewPage();
        doc.text(wrapped, 20, y);
        y += wrapped.length * 7;
      } else if (trimmed !== "") {
        const wrapped = doc.splitTextToSize(trimmed, 180);
        if (y + wrapped.length * 7 > pageHeight - marginBottom) addNewPage();
        // Force bullet for "Key Discussion Themes" & "High-Level Outcomes"
        if (
          currentHeading.includes("Key Discussion Themes") ||
          currentHeading.includes("High-Level Outcomes")
        ) {
          doc.text(`• ${wrapped}`, 20, y);
        } else {
          doc.text(wrapped, 14, y);
        }
        y += wrapped.length * 7;
      } else {
        y += 5;
      }
    });

    y += 12;
  }

  // --- Action Items ---
  if (meeting_insights?.structured_summary?.action_items?.length > 0) {
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Action Items", 14, y);
    y += 10;

    autoTable(doc, {
      startY: y,
      head: [["Task", "Responsible Person", "Deadline"]],
      body: meeting_insights.structured_summary.action_items.map((item) => [
        item.Task?.replace("- Task: ", ""),
        item["Responsible Person"]?.replace("Owner: ", ""),
        item.Deadline?.replace("Deadline: ", ""),
      ]),
      styles: { fontSize: 11 },
      headStyles: { fillColor: [240, 240, 240], textColor: 20, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      margin: { top: y },
      didDrawPage: (data) => {
        y = data.cursor?.y ? data.cursor.y + 12 : marginTop;
      },
    });
  }

  // --- Footer ---
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(
      `Generated by Nous Meeting · Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  doc.save(`Meeting_${meeting?.id || "insights"}.pdf`);
};
