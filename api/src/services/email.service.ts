import { BrevoClient } from "@getbrevo/brevo";

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY ?? "",
});

interface OrderLine {
  productName: string;
  quantity: number;
  finish: string;
  height: number;
  width: number;
}

interface OrderForEmail {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  createdAt: Date;
  lines: OrderLine[];
}

interface CustomerForEmail {
  name: string;
  email: string;
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function buildOrderConfirmationHtml(order: OrderForEmail): string {
  const linesHtml = order.lines
    .map(
      (l) =>
        `<li>${l.productName} × ${l.quantity} — ${l.finish}, ${l.height}×${l.width}cm</li>`,
    )
    .join("\n");
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Order Confirmation</title></head>
<body>
  <h1>Order Confirmation – Mirror Shop</h1>
  <p>Hi ${order.customerName},</p>
  <p>Thank you for your order. Here are the details:</p>
  <p><strong>Order ID:</strong> ${order.id}</p>
  <p><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
  <h2>Items</h2>
  <ul>${linesHtml}</ul>
  <p>We'll be in touch soon.</p>
  <p>— Mirror Shop</p>
</body>
</html>
  `.trim();
}

function buildOrderConfirmationText(order: OrderForEmail): string {
  const linesText = order.lines
    .map(
      (l) =>
        `  - ${l.productName} × ${l.quantity} (${l.finish}, ${l.height}×${l.width}cm)`,
    )
    .join("\n");
  return `Hi ${order.customerName},

Thank you for your order. Here are the details:

Order ID: ${order.id}
Date: ${formatDate(order.createdAt)}

Items:
${linesText}

We'll be in touch soon.

— Mirror Shop`;
}

function buildAdminForwardHtml(order: OrderForEmail): string {
  const linesHtml = order.lines
    .map(
      (l) =>
        `<tr><td>${l.productName}</td><td>${l.quantity}</td><td>${l.finish}</td><td>${l.height}×${l.width}cm</td></tr>`,
    )
    .join("\n");
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New Order</title></head>
<body>
  <h1>New Order #${order.id}</h1>
  <h2>Customer</h2>
  <p><strong>Name:</strong> ${order.customerName}</p>
  <p><strong>Email:</strong> ${order.customerEmail}</p>
  <p><strong>Phone:</strong> ${order.customerPhone}</p>
  <h2>Order details</h2>
  <p><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
  <table border="1" cellpadding="4" cellspacing="0">
    <thead><tr><th>Product</th><th>Qty</th><th>Finish</th><th>Size</th></tr></thead>
    <tbody>${linesHtml}</tbody>
  </table>
</body>
</html>
  `.trim();
}

export async function sendOrderConfirmation(
  order: OrderForEmail,
  _customer: CustomerForEmail,
): Promise<void> {
  if (!process.env.BREVO_API_KEY || !process.env.BREVO_FROM_EMAIL) {
    console.warn("Brevo not configured: missing BREVO_API_KEY or BREVO_FROM_EMAIL");
    return;
  }
  await brevo.transactionalEmails.sendTransacEmail({
    sender: {
      email: process.env.BREVO_FROM_EMAIL,
      name: "Mirror Shop",
    },
    to: [
      {
        email: order.customerEmail,
        name: order.customerName,
      },
    ],
    subject: "Order Confirmation – Mirror Shop",
    htmlContent: buildOrderConfirmationHtml(order),
    textContent: buildOrderConfirmationText(order),
  });
}

export async function forwardOrderToAdmin(
  order: OrderForEmail,
  _customer: CustomerForEmail,
): Promise<void> {
  if (
    !process.env.BREVO_API_KEY ||
    !process.env.BREVO_FROM_EMAIL ||
    !process.env.ADMIN_ORDER_EMAIL
  ) {
    console.warn(
      "Brevo not configured: missing BREVO_API_KEY, BREVO_FROM_EMAIL, or ADMIN_ORDER_EMAIL",
    );
    return;
  }
  await brevo.transactionalEmails.sendTransacEmail({
    sender: {
      email: process.env.BREVO_FROM_EMAIL,
      name: "Mirror Shop",
    },
    to: [
      {
        email: process.env.ADMIN_ORDER_EMAIL,
        name: "Admin",
      },
    ],
    subject: `New Order #${order.id}`,
    htmlContent: buildAdminForwardHtml(order),
  });
}
