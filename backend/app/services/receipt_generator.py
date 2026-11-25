import os
import qrcode
from io import BytesIO
from decimal import Decimal
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from app.config import settings

def generate_qr_code_image(data: str) -> BytesIO:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=4,
        border=1,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#312e81", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return buffer

def create_receipt_pdf(
    receipt_data: dict,
    output_filename: str
) -> str:
    """
    receipt_data contains:
      - receipt_number
      - payment_date
      - institute_name
      - institute_code
      - institute_address
      - institute_phone
      - student_name
      - student_id (STU0001)
      - course_name
      - batch_name
      - amount_paid (float)
      - balance_after (float)
      - payment_method (cash/upi/bank/cheque)
      - transaction_ref
      - verification_url
      - collected_by
    """
    file_path = os.path.join(settings.RECEIPTS_DIR, output_filename)
    doc = SimpleDocTemplate(
        file_path,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    primary_color = colors.HexColor("#4f46e5")
    dark_color = colors.HexColor("#1e1b4b")
    gray_color = colors.HexColor("#64748b")
    light_bg = colors.HexColor("#f8fafc")

    title_style = ParagraphStyle(
        "InstTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=20,
        textColor=primary_color,
        spaceAfter=4,
    )
    subtitle_style = ParagraphStyle(
        "InstSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        textColor=gray_color,
        spaceAfter=12,
    )
    badge_style = ParagraphStyle(
        "ReceiptBadge",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=14,
        textColor=colors.HexColor("#166534"),
        alignment=2, # right
    )
    bold_label = ParagraphStyle(
        "BoldLabel",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        textColor=dark_color,
    )
    value_style = ParagraphStyle(
        "ValueText",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        textColor=colors.HexColor("#334155"),
    )

    story = []

    # Logo & Header section
    logo_path = os.path.join(os.path.dirname(__file__), "..", "static", "logo.jpg")
    logo_flowable = None
    if os.path.exists(logo_path):
        try:
            logo_flowable = RLImage(logo_path, width=0.85 * inch, height=0.85 * inch)
        except Exception:
            logo_flowable = None

    if logo_flowable:
        inst_info_table = Table([
            [
                logo_flowable,
                [
                    Paragraph(f"<b>{receipt_data.get('institute_name', 'Vaishnavi Classes')}</b>", title_style),
                    Paragraph("Since 1996 • Excellence in Education", subtitle_style),
                ]
            ]
        ], colWidths=[0.95 * inch, 3.25 * inch])
        inst_info_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
            ('TOPPADDING', (0,0), (-1,-1), 0),
        ]))
        header_data = [
            [
                inst_info_table,
                Paragraph("<b>OFFICIAL FEE RECEIPT</b><br/><font size=8 color='#4b5563'>ORIGINAL VERIFIED COPY</font>", badge_style)
            ],
            [
                Paragraph(f"{receipt_data.get('institute_address', 'Vaishnavi Classes Campus')}<br/>Contact: {receipt_data.get('institute_phone', '+91 96642 57346')}", subtitle_style),
                Paragraph(f"<b>Receipt No:</b> {receipt_data.get('receipt_number')}<br/><b>Date:</b> {receipt_data.get('payment_date')}", value_style)
            ]
        ]
    else:
        header_data = [
            [
                Paragraph(f"<b>{receipt_data.get('institute_name', 'Vaishnavi Classes')}</b>", title_style),
                Paragraph("<b>OFFICIAL FEE RECEIPT</b><br/><font size=8 color='#4b5563'>ORIGINAL COPY</font>", badge_style)
            ],
            [
                Paragraph(f"{receipt_data.get('institute_address', 'Vaishnavi Classes Campus')}<br/>Contact: {receipt_data.get('institute_phone', '+91 96642 57346')}", subtitle_style),
                Paragraph(f"<b>Receipt No:</b> {receipt_data.get('receipt_number')}<br/><b>Date:</b> {receipt_data.get('payment_date')}", value_style)
            ]
        ]
    t_header = Table(header_data, colWidths=[4.2 * inch, 3.0 * inch])
    t_header.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(t_header)
    story.append(Spacer(1, 10))

    # Divider
    divider = Table([[""]], colWidths=[7.2 * inch], rowHeights=[2])
    divider.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), primary_color),
    ]))
    story.append(divider)
    story.append(Spacer(1, 12))

    # Student & Payment details table
    info_data = [
        [
            Paragraph("Student Name:", bold_label),
            Paragraph(str(receipt_data.get("student_name")), value_style),
            Paragraph("Student ID:", bold_label),
            Paragraph(str(receipt_data.get("student_id")), value_style),
        ],
        [
            Paragraph("Course / Program:", bold_label),
            Paragraph(str(receipt_data.get("course_name", "General")), value_style),
            Paragraph("Batch:", bold_label),
            Paragraph(str(receipt_data.get("batch_name", "Regular")), value_style),
        ],
        [
            Paragraph("Payment Method:", bold_label),
            Paragraph(str(receipt_data.get("payment_method", "Cash")).upper(), value_style),
            Paragraph("Transaction Ref:", bold_label),
            Paragraph(str(receipt_data.get("transaction_ref") or "N/A"), value_style),
        ],
    ]
    t_info = Table(info_data, colWidths=[1.5 * inch, 2.1 * inch, 1.4 * inch, 2.2 * inch])
    t_info.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), light_bg),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_info)
    story.append(Spacer(1, 15))

    # Fee Items Table
    currency = receipt_data.get("currency_symbol", "₹")
    amount_paid = float(receipt_data.get("amount_paid", 0.0))
    balance_after = float(receipt_data.get("balance_after", 0.0))

    items_data = [
        [
            Paragraph("<b>#</b>", bold_label),
            Paragraph("<b>Fee Particulars / Description</b>", bold_label),
            Paragraph("<b>Paid Amount</b>", ParagraphStyle("RightH", parent=bold_label, alignment=2)),
        ],
        [
            Paragraph("1", value_style),
            Paragraph(f"Installment / Academic Fee Payment — {receipt_data.get('installment_title', 'Tuition & Academic')}", value_style),
            Paragraph(f"<b>{currency} {amount_paid:,.2f}</b>", ParagraphStyle("RightV", parent=value_style, alignment=2)),
        ],
        [
            Paragraph("", value_style),
            Paragraph("<b>Total Received Amount:</b>", ParagraphStyle("TotalL", parent=bold_label, alignment=2)),
            Paragraph(f"<b>{currency} {amount_paid:,.2f}</b>", ParagraphStyle("TotalV", parent=bold_label, alignment=2, textColor=primary_color)),
        ],
        [
            Paragraph("", value_style),
            Paragraph("<b>Remaining Outstanding Balance:</b>", ParagraphStyle("BalL", parent=bold_label, alignment=2)),
            Paragraph(f"<b>{currency} {balance_after:,.2f}</b>", ParagraphStyle("BalV", parent=bold_label, alignment=2, textColor=colors.HexColor("#dc2626") if balance_after > 0 else colors.HexColor("#16a34a"))),
        ],
    ]
    t_items = Table(items_data, colWidths=[0.5 * inch, 4.7 * inch, 2.0 * inch])
    t_items.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#e0e7ff")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_items)
    story.append(Spacer(1, 20))

    # QR Code & Verification footer
    verification_url = receipt_data.get("verification_url", f"https://feeflow.internal/verify-receipt/{receipt_data.get('receipt_number')}")
    qr_buf = generate_qr_code_image(verification_url)
    qr_img = RLImage(qr_buf, width=1.1 * inch, height=1.1 * inch)

    footer_data = [
        [
            qr_img,
            Paragraph(
                f"<b>Scan to Verify Online:</b><br/>"
                f"<font size=8 color='#64748b'>Receipt Verification Code: {receipt_data.get('receipt_number')}<br/>"
                f"This document is digitally validated by {receipt_data.get('institute_name')}.<br/>"
                f"Authorized Signatory: {receipt_data.get('collected_by', 'Administration Desk')}</font>",
                value_style
            ),
            Paragraph(
                "<br/><br/><b>_____________________</b><br/><b>Authorized Signature</b><br/><font size=7 color='#64748b'>Cashier / Finance Officer</font>",
                ParagraphStyle("Sig", parent=value_style, alignment=1)
            )
        ]
    ]
    t_footer = Table(footer_data, colWidths=[1.3 * inch, 3.9 * inch, 2.0 * inch])
    t_footer.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_footer)

    doc.build(story)
    return file_path
