import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
// import { isValidStructuredSummary } from "./validators"; // <-- assuming you export it

export const generateMeetingPDF = (meeting, meeting_insights, speaker_summaries) => {
  const structured = meeting_insights?.structured_summary;


  const doc = new jsPDF();
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
  doc.text("AI-Generated Insights", pageWidth / 2, y, { align: "center" });
  y += 14;

  // --- Meeting Summary ---
  const summary = structured.summary_text;
  if (summary) {
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Meeting Summary", 14, y);
    y += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, "normal");

    // Meeting Objective
    if (summary.meeting_objective) {
      doc.setFont(undefined, "bold");
      doc.text("Meeting Objective:", 14, y);
      y += 7;
      doc.setFont(undefined, "normal");
      const wrapped = doc.splitTextToSize(summary.meeting_objective, 180);
      doc.text(wrapped, 14, y);
      y += wrapped.length * 7 + 5;
    }

    // High-level Outcomes
    if (summary.high_level_outcomes?.length > 0) {
      doc.setFont(undefined, "bold");
      doc.text("High-level Outcomes:", 14, y);
      y += 7;
      doc.setFont(undefined, "normal");
      summary.high_level_outcomes.forEach((outcome) => {
        const wrapped = doc.splitTextToSize(`• ${outcome}`, 170);
        if (y + wrapped.length * 7 > pageHeight - marginBottom) addNewPage();
        doc.text(wrapped, 20, y);
        y += wrapped.length * 7;
      });
      y += 5;
    }

    // Key Discussion Themes
    if (summary.key_discussion_themes?.length > 0) {
      doc.setFont(undefined, "bold");
      doc.text("Key Discussion Themes:", 14, y);
      y += 7;
      doc.setFont(undefined, "normal");
      summary.key_discussion_themes.forEach((theme) => {
        const wrapped = doc.splitTextToSize(`• ${theme}`, 170);
        if (y + wrapped.length * 7 > pageHeight - marginBottom) addNewPage();
        doc.text(wrapped, 20, y);
        y += wrapped.length * 7;
      });
      y += 5;
    }
    y += 10;
  }

  // --- Minutes ---
  const minutes = structured.minutes;
  if (minutes) {
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
    if (structured.attendees?.length > 0) {
      const attendeesText = `Attendees: ${structured.attendees.join(", ")}`;
      const wrapped = doc.splitTextToSize(attendeesText, 180);
      if (y + wrapped.length * 7 > pageHeight - marginBottom) addNewPage();
      doc.text(wrapped, 14, y);
      y += wrapped.length * 7 + 8;
    }

    // Sections
    if (minutes.sections?.length > 0) {
      doc.setFontSize(11);
      minutes.sections.forEach((section, index) => {
        const heading = `${index + 1}. ${section.title}`;
        if (y + 8 > pageHeight - marginBottom) addNewPage();
        doc.setFont(undefined, "bold");
        doc.text(heading, 14, y);
        y += 7;
        doc.setFont(undefined, "normal");

        section.points.forEach((point) => {
          const wrapped = doc.splitTextToSize(`• ${point}`, 170);
          if (y + wrapped.length * 7 > pageHeight - marginBottom) addNewPage();
          doc.text(wrapped, 20, y);
          y += wrapped.length * 7;
        });

        y += 5;
      });
    }
    y += 10;
  }

  // --- Action Items ---
  if (structured.action_items?.length > 0) {
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Action Items", 14, y);
    y += 10;

    autoTable(doc, {
      startY: y,
      head: [["Task", "Responsible Person", "Deadline"]],
      body: structured.action_items.map((item) => [
        item.task,
        item.owner || "N/A",
        item.deadline || "N/A",
      ]),
      styles: { fontSize: 11 },
      headStyles: { fillColor: [240, 240, 240], textColor: 20, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [250, 250, 250] },
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
