"use client";

import { useEffect, useMemo, useState } from "react";

type InvoiceLineItem = {
  id: number;
  service: string;
  quantity: number;
  rate: number;
};

type InvoiceParty = {
  name: string;
  addressLines: string[];
};

type InvoicePaymentDetails = {
  upiId: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifsc: string;
};

export type InvoiceData = {
  invoiceId: string;
  invoiceDate: string;
  dueDate: string;
  client: InvoiceParty;
  items: InvoiceLineItem[];
  discount: number;
  tax: number;
  payment: InvoicePaymentDetails;
  terms: string;
};

interface InvoiceDocumentProps {
  invoice: InvoiceData;
}

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const longDateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function formatCurrency(value: number) {
  return currency.format(value);
}

// Convert YYYY-MM-DD input string (if standard) to localized text
// We can just rely on standard input typing "date" or just text.
// For the interactive invoice, standard text inputs or date inputs are best.

export default function InvoiceDocument({ invoice: initialInvoice }: InvoiceDocumentProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  // --- Editable State ---
  const [invoiceMeta, setInvoiceMeta] = useState({
    invoiceId: initialInvoice.invoiceId,
    invoiceDate: initialInvoice.invoiceDate,
    dueDate: initialInvoice.dueDate,
    discount: initialInvoice.discount,
    tax: initialInvoice.tax,
    terms: initialInvoice.terms,
  });

  const [client, setClient] = useState({
    name: initialInvoice.client.name,
    address: initialInvoice.client.addressLines.join("\n"),
  });

  const [items, setItems] = useState<InvoiceLineItem[]>(initialInvoice.items);

  // --- Handlers ---
  const updateMeta = (field: keyof typeof invoiceMeta, value: string | number) => {
    setInvoiceMeta((prev) => ({ ...prev, [field]: value }));
  };

  const updateClient = (field: keyof typeof client, value: string) => {
    setClient((prev) => ({ ...prev, [field]: value }));
  };

  const updateItem = (id: number, field: keyof InvoiceLineItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now(), service: "New Service Description", quantity: 1, rate: 0 },
    ]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  useEffect(() => {
    const handleBeforePrint = () => setIsPrinting(true);
    const handleAfterPrint = () => setIsPrinting(false);

    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  // --- Calculations ---
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0), 0),
    [items]
  );
  
  const discountAmount = Number(invoiceMeta.discount) || 0;
  const taxAmount = Number(invoiceMeta.tax) || 0;
  const total = subtotal - discountAmount + taxAmount;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          size: A4;
          margin: 12mm;
        }

        .invoice-screen-shell {
          margin: 0 auto;
          width: 100%;
          max-width: 1200px;
          padding: 24px 16px;
        }

        .invoice-sheet {
          width: min(100%, 210mm);
          min-height: 297mm;
          margin: 0 auto;
          background: #ffffff;
          border: 1px solid rgba(35, 31, 32, 0.08);
          border-radius: 20px;
          box-shadow: 0 24px 60px rgba(35, 31, 32, 0.12);
          overflow: hidden;
          color: #231f20;
        }

        .invoice-section,
        .avoid-break {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        /* Seamless input styling for the editable invoice */
        .invoice-input {
          width: 100%;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 4px;
          transition: all 0.2s;
          padding: 2px 4px;
          font-family: inherit;
          color: inherit;
        }
        .invoice-input:hover {
          background: rgba(35, 31, 32, 0.03);
          border-color: rgba(35, 31, 32, 0.1);
        }
        .invoice-input:focus {
          background: #ffffff;
          border-color: #5B2333;
          outline: none;
          box-shadow: 0 0 0 2px rgba(91, 35, 51, 0.1);
        }
        textarea.invoice-input {
          resize: vertical;
          min-height: 24px;
        }

        @media print {
          html, body { background: #ffffff !important; }
          body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-hidden { display: none !important; }
          .invoice-screen-shell { padding: 0 !important; margin: 0 !important; max-width: none !important; }
          .invoice-sheet { width: 100% !important; min-height: auto !important; border: none !important; border-radius: 0 !important; box-shadow: none !important; }
          .invoice-sheet * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          
          /* Hide inputs and textareas UI during print */
          .invoice-input {
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
            box-shadow: none !important;
            resize: none !important;
            appearance: none;
            -webkit-appearance: none;
          }
        }
      `}} />

      <div className="invoice-screen-shell flex flex-col gap-6">
        <div className="print-hidden">
          <div className="flex flex-col gap-4 rounded-[24px] border border-[#231F201A] bg-white/90 p-4 shadow-[0_24px_60px_rgba(35,31,32,0.10)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#5B2333B3]">
                Interactive Invoice
              </p>
              <h1 className="mt-1 text-3xl font-bold text-[#231F20]">Raphael Production House Editor</h1>
              <p className="mt-2 max-w-2xl text-sm text-[#231F20A6]">
                Click on any text fields below to edit them directly. Totals will automatically update. Use the print dialog to export a polished PDF.
              </p>
            </div>

            <button
              type="button"
              className="min-w-[190px] rounded-[10px] bg-[#5B2333] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#6A2A3C] disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => window.print()}
              disabled={isPrinting}
            >
              {isPrinting ? "Preparing Print..." : "Print Invoice"}
            </button>
          </div>
        </div>

        <article className="invoice-sheet">
          <div className="h-5 rounded-t-[20px] bg-[#5B2333]" />

          <div className="space-y-8 p-6 sm:p-8">
            <header className="invoice-section avoid-break flex flex-col sm:flex-row justify-between gap-6 border-b border-[#231F201A] pb-8">
              <div className="flex gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl overflow-hidden border border-[#231F201A] bg-[#5B23330D]">
                  <img src="/logo.jpeg" alt="Raphael Media and Events Logo" className="h-full w-full object-cover" />
                </div>

                <div>
                  <h3 className="mt-1 text-2xl font-bold text-[#231F20]">Raphael Production House</h3>
                  <div className="mt-2 space-y-1 text-sm leading-6 text-[#231F20BD]">
                    <p>Kuttoor P.O., Thiruvalla, Kerala, 689106</p>
                    <p>Mobile: 9446915892, 9446915862</p>
                    <p>Email: raphaelproductionhouse@gmail.com</p>
                  </div>
                </div>
              </div>

              <div className="sm:text-right">
                <h2 className="mt-1 text-4xl font-bold text-[#231F20]">INVOICE</h2>
              </div>
            </header>

            <section className="invoice-section avoid-break grid gap-4 sm:grid-cols-2">
              <div className="rounded-[18px] border border-[#231F201A] bg-[#F7F4F3CC] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5B2333CC]">Invoice Details</p>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-[#231F2099] whitespace-nowrap">Invoice ID</dt>
                    <dd className="font-mono font-medium text-[#231F20] w-full max-w-[150px]">
                      <input 
                        className="invoice-input text-right" 
                        value={invoiceMeta.invoiceId} 
                        onChange={(e) => updateMeta("invoiceId", e.target.value)} 
                      />
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-[#231F2099] whitespace-nowrap">Date</dt>
                    <dd className="font-medium text-[#231F20] w-full max-w-[150px]">
                      <input 
                        type="date"
                        className="invoice-input text-right" 
                        value={invoiceMeta.invoiceDate} 
                        onChange={(e) => updateMeta("invoiceDate", e.target.value)} 
                      />
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-[#231F2099] whitespace-nowrap">Due Date</dt>
                    <dd className="font-medium text-[#231F20] w-full max-w-[150px]">
                      <input 
                        type="date"
                        className="invoice-input text-right" 
                        value={invoiceMeta.dueDate} 
                        onChange={(e) => updateMeta("dueDate", e.target.value)} 
                      />
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-[18px] border border-[#231F201A] bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5B2333CC]">Bill To</p>
                <div className="mt-3">
                  <input 
                    className="invoice-input text-lg font-semibold text-[#231F20] w-full !p-0" 
                    value={client.name} 
                    onChange={(e) => updateClient("name", e.target.value)} 
                    placeholder="Client Name"
                  />
                  <div className="mt-2 text-sm leading-6 text-[#231F20B3]">
                    <textarea 
                      className="invoice-input w-full h-[80px] !p-0" 
                      value={client.address} 
                      onChange={(e) => updateClient("address", e.target.value)}
                      placeholder="Client Address Details..."
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="invoice-section avoid-break overflow-hidden rounded-[20px] border border-[#231F201A] bg-white">
              <table className="w-full border-collapse text-left">
                <thead className="bg-[#5B2333] text-sm text-white">
                  <tr>
                    <th className="px-4 py-3 font-medium sm:px-5 w-12 text-center print-hidden">X</th>
                    <th className="px-4 py-3 font-medium sm:px-5 w-12 text-center print:table-cell hidden">No</th>
                    <th className="px-4 py-3 font-medium sm:px-5">Service</th>
                    <th className="px-4 py-3 text-right font-medium sm:px-5 w-24">Qty</th>
                    <th className="px-4 py-3 text-right font-medium sm:px-5 w-32">Rate</th>
                    <th className="px-4 py-3 text-right font-medium sm:px-5 w-32">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const amount = (Number(item.quantity) || 0) * (Number(item.rate) || 0);

                    return (
                      <tr key={item.id} className="border-t border-[#231F2014] group">
                        <td className="px-2 py-2 text-center align-top print-hidden">
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-red-400 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Remove Line Item"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                          </button>
                        </td>
                        <td className="px-4 py-4 text-sm text-center align-top text-[#231F20B3] sm:px-5 print:table-cell hidden">{index + 1}</td>
                        <td className="px-4 py-2 sm:px-5 align-top">
                          <textarea
                            className="invoice-input text-sm font-medium text-[#231F20] w-full"
                            value={item.service}
                            onChange={(e) => updateItem(item.id, "service", e.target.value)}
                            rows={2}
                          />
                        </td>
                        <td className="px-4 py-2 sm:px-5 align-top">
                          <input
                            type="number"
                            className="invoice-input text-right text-sm text-[#231F20B3]"
                            value={item.quantity === 0 ? "" : item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-2 sm:px-5 align-top">
                          <input
                            type="number"
                            className="invoice-input text-right text-sm text-[#231F20B3]"
                            value={item.rate === 0 ? "" : item.rate}
                            onChange={(e) => updateItem(item.id, "rate", e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-semibold text-[#231F20] sm:px-5 align-top whitespace-nowrap">
                          {formatCurrency(amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="p-3 border-t border-[#231F2014] bg-gray-50 print-hidden">
                <button
                  onClick={addItem}
                  className="text-sm font-medium text-[#5B2333] hover:text-[#381621] px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                  Add Line Item
                </button>
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              {/* Note: The Summary block has been moved ON TOP/BEFORE the Payment details block as requested */}
              <div className="invoice-section avoid-break rounded-[20px] border border-[#231F201A] bg-white p-5 lg:order-1">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5B2333CC]">Summary</p>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-[#231F2099]">Subtotal</dt>
                    <dd className="font-medium text-[#231F20]">{formatCurrency(subtotal)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-[#231F2099]">Discount</dt>
                    <dd className="font-medium text-[#231F20] flex items-center justify-end gap-1">
                      - <input 
                        type="number"
                        className="invoice-input font-medium text-right w-24 !py-0" 
                        value={invoiceMeta.discount === 0 ? "" : invoiceMeta.discount}
                        placeholder="0"
                        onChange={(e) => updateMeta("discount", e.target.value)}
                      />
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 rounded-[18px] bg-[#5B2333] px-4 py-4 text-white">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm uppercase tracking-[0.24em] text-white/75">Total Payable</p>
                    <p className="text-2xl font-bold">{formatCurrency(total)}</p>
                  </div>
                </div>
              </div>

              <div className="invoice-section avoid-break rounded-[20px] border border-[#231F201A] bg-[#F7F4F3B8] p-5 lg:order-2">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5B2333CC]">Payment Details</p>
                <div className="mt-4 grid gap-5 sm:grid-cols-[1fr_120px]">
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-[#231F208C]">Bank Details</p>
                      <div className="mt-1 space-y-1 text-[#231F20BD] font-medium text-xs leading-5">
                        <p>Name: RAPHAEL MEDIA AND EVENTS</p>
                        <p>Account No: 41701728314</p>
                        <p>IFSC Code: SBIN0070482</p>
                        <p>STATE BANK OF INDIA</p>
                        <p>MGM H.S. Branch, THIRUVALLA</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center rounded-[18px] border border-[#231F201A] bg-white p-3 overflow-hidden shadow-sm h-[130px] self-start">
                    <div className="text-center w-full h-full flex flex-col items-center justify-center">
                      <img src="/qr_code.jpeg" alt="Payment QR Code" className="max-w-[100px] object-contain" />
                      <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#5B2333]">
                        Scan to Pay
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="invoice-section avoid-break grid gap-5 lg:grid-cols-2">
              <div className="rounded-[18px] border border-[#231F201A] bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5B2333CC]">Terms</p>
                <textarea 
                  className="invoice-input mt-3 text-sm leading-7 text-[#231F20B8] w-full min-h-[60px]" 
                  value={invoiceMeta.terms} 
                  onChange={(e) => updateMeta("terms", e.target.value)}
                />
              </div>

              <div className="rounded-[18px] border border-[#231F201A] bg-[#F7F4F3B8] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5B2333CC]">Notes</p>
                <p className="mt-3 text-sm leading-7 text-[#231F20B8]">
                  Please share the payment reference after transfer so the project records can be updated without delay.
                </p>
              </div>
            </section>
          </div>

          <footer className="invoice-section mt-8 bg-[#5B2333] px-6 py-4 text-center text-sm font-medium text-white">
            Thank you for doing business with us
          </footer>
        </article>
      </div>
    </>
  );
}
