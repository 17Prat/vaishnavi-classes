// Central WhatsApp Configuration for Vaishnavi Classes
export const BUSINESS_WHATSAPP_NUMBER = "919664257346";
export const INSTITUTE_NAME = "Vaishnavi Classes";
export const INSTITUTE_TAGLINE = "Since 1996";

/**
 * Normalizes phone number into international format without '+', spaces, or symbols.
 * Example: "9664257346" -> "919664257346"
 */
export function normalizePhoneNumber(raw: string): string {
  const digits = (raw || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
}

export interface EnquiryData {
  customerName: string;
  mobileNumber: string;
  email?: string;
  serviceType: string;
  message: string;
}

/**
 * Prepares the standard WhatsApp Enquiry Message per specification
 */
export function formatEnquiryWhatsAppMessage(data: EnquiryData): string {
  const name = (data?.customerName || "").trim();
  const phone = (data?.mobileNumber || "").trim();
  const emailText = data?.email && data.email.trim() ? data.email.trim() : "Not provided";
  const service = (data?.serviceType || "General Information").trim();
  const msg = (data?.message || "").trim();

  return (
    `*New Website Enquiry*\n\n` +
    `Customer Name: ${name || "Visitor"}\n` +
    `Mobile Number: ${phone || "Not provided"}\n` +
    `Email: ${emailText}\n` +
    `Service: ${service}\n` +
    `Message: ${msg || "Enquiry regarding admissions and fees"}\n\n` +
    `Source: Website Contact Form`
  );
}

/**
 * Generates official Click-to-Chat URL
 * Format: https://wa.me/91XXXXXXXXXX?text=ENCODED_MESSAGE
 */
export function getEnquiryWhatsAppUrl(data: EnquiryData, targetNumber: string = BUSINESS_WHATSAPP_NUMBER): string {
  const cleanNumber = normalizePhoneNumber(targetNumber);
  const text = formatEnquiryWhatsAppMessage(data);
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanNumber}?text=${encodedText}`;
}

/**
 * Generates direct chat WhatsApp URL for general inquiries
 */
export function getDirectChatWhatsAppUrl(
  message: string = "Hello Vaishnavi Classes, I would like to inquire about course admissions and fees.",
  targetNumber: string = BUSINESS_WHATSAPP_NUMBER
): string {
  const cleanNumber = normalizePhoneNumber(targetNumber);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedText}`;
}

/**
 * Opens WhatsApp link safely on both mobile devices and desktop
 */
export function openWhatsAppChat(url: string) {
  if (typeof window === "undefined") return;

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    // On mobile devices, window.location.href or direct open launches the native WhatsApp application
    window.open(url, "_blank");
  } else {
    // Desktop: opens WhatsApp Web or desktop client tab
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
