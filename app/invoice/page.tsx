import InvoiceDocument, { type InvoiceData } from "../../components/features/InvoiceDocument";

const sampleInvoice: InvoiceData = {
  invoiceId: "RPH-2026-001",
  invoiceDate: "2026-03-29",
  dueDate: "2026-04-12",
  client: {
    name: "St. Mary's Media Trust",
    addressLines: [
      "2nd Floor, Carmel Centre",
      "M.C. Road, Thiruvalla, Kerala 689101",
      "India",
    ],
  },
  items: [
    {
      id: 1,
      service: "Event highlight film production and edit",
      quantity: 1,
      rate: 28000,
    },
    {
      id: 2,
      service: "Photography coverage with color grading",
      quantity: 1,
      rate: 18000,
    },
    {
      id: 3,
      service: "Social media teaser cutdowns",
      quantity: 4,
      rate: 2500,
    },
  ],
  discount: 3000,
  tax: 0,
  payment: {
    upiId: "raphaelproductionhouse@okaxis",
    bankName: "South Indian Bank",
    accountName: "Raphael Production House",
    accountNumber: "1234567890123456",
    ifsc: "SIBL0000123",
  },
  terms: "Payment within 14 days from the invoice date. Kindly process the full outstanding amount before the due date to avoid scheduling delays for final asset delivery.",
};

export default function InvoicePage() {
  return <InvoiceDocument invoice={sampleInvoice} />;
}
