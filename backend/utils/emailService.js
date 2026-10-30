const nodemailer = require("nodemailer");

let mailTransporter;

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[character]);

const formatCurrency = (amount) => `$${Number(amount || 0).toFixed(2)}`;

const getMailTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  const port = Number(SMTP_PORT || 587);

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !Number.isInteger(port) || port < 1) {
    throw new Error(
      "SMTP_HOST, SMTP_USER, SMTP_PASS, and a valid SMTP_PORT must be configured."
    );
  }

  if (!mailTransporter) {
    mailTransporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE === "true" || port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }

  return mailTransporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  if (!to) throw new Error("A recipient email address is required.");
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  await getMailTransporter().sendMail({ from, to, subject, html, text });
};

const emailLayout = (content) => `
  <div style="margin:0;background:#f5f2ed;padding:32px 12px;color:#292b25;font-family:Arial,Helvetica,sans-serif">
    <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #eae6df">
      <div style="padding:30px 36px;background:#414b36;color:#ffffff">
        <p style="margin:0;font-family:Georgia,serif;font-size:26px;letter-spacing:4px">MEGAKART</p>
        <p style="margin:8px 0 0;color:#e5e3d9;font-size:10px;letter-spacing:2px;text-transform:uppercase">A considered shopping experience</p>
      </div>
      <div style="padding:36px">${content}</div>
      <div style="padding:20px 36px;border-top:1px solid #eae6df;color:#77746d;font-size:12px;line-height:1.6">
        <p style="margin:0">Thank you for choosing MegaKart.</p>
        <p style="margin:6px 0 0">This is an automated message; please do not reply to this email.</p>
      </div>
    </div>
  </div>`;

const orderSummaryHtml = (order) => {
  const items = (order.orderItems || []).map((item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #eeeae3">
        <strong>${escapeHtml(item.name)}</strong>
        <div style="margin-top:4px;color:#77746d;font-size:12px">
          Qty ${escapeHtml(item.quantity)}${item.size ? ` | Size ${escapeHtml(item.size)}` : ""}${item.color ? ` | ${escapeHtml(item.color)}` : ""}
        </div>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #eeeae3;text-align:right;white-space:nowrap">${formatCurrency(Number(item.price) * Number(item.quantity))}</td>
    </tr>`).join("");
  const address = order.shippingAddress || {};

  return `
    <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px">
      <tbody>${items}
        <tr>
          <td style="padding:16px 0 0;font-weight:bold">Total paid</td>
          <td style="padding:16px 0 0;text-align:right;font-weight:bold">${formatCurrency(order.totalPrice)}</td>
        </tr>
      </tbody>
    </table>
    <div style="margin-top:28px;padding:18px;background:#faf9f6">
      <p style="margin:0 0 8px;color:#77746d;font-size:10px;font-weight:bold;letter-spacing:1px;text-transform:uppercase">Delivering to</p>
      <p style="margin:0;font-size:14px;line-height:1.6">${escapeHtml(address.address)}<br>${escapeHtml(address.city)}, ${escapeHtml(address.postalCode)}<br>${escapeHtml(address.country)}</p>
    </div>`;
};

const sendRegistrationVerificationEmail = async (email, name, otp) => {
  const safeName = escapeHtml(name);
  const html = emailLayout(`
    <p style="margin:0 0 10px;color:#a94f38;font-size:10px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">Email verification</p>
    <h1 style="margin:0;color:#171714;font-family:Georgia,serif;font-size:30px;font-weight:normal">Welcome to MegaKart, ${safeName}</h1>
    <p style="margin:18px 0;color:#55564f;font-size:15px;line-height:1.7">Use this one-time code to verify your email address and complete your registration.</p>
    <div style="padding:20px;background:#faf9f6;text-align:center">
      <span style="color:#414b36;font-family:Georgia,serif;font-size:32px;letter-spacing:8px">${escapeHtml(otp)}</span>
    </div>
    <p style="margin:18px 0 0;color:#77746d;font-size:13px;line-height:1.6">This code expires in 10 minutes. If you did not request it, you can safely ignore this email.</p>`);

  await sendEmail({
    to: email,
    subject: "Verify your email | MegaKart",
    html,
    text: `Welcome to MegaKart, ${name}.\n\nYour email verification code is ${otp}. It expires in 10 minutes.\n\nIf you did not request this code, you can ignore this email.`,
  });
};

const sendPasswordResetEmail = async (user, otp) => {
  const safeName = escapeHtml(user.name || "there");
  const html = emailLayout(`
    <p style="margin:0 0 10px;color:#a94f38;font-size:10px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">Password reset</p>
    <h1 style="margin:0;color:#171714;font-family:Georgia,serif;font-size:30px;font-weight:normal">Reset your password, ${safeName}</h1>
    <p style="margin:18px 0;color:#55564f;font-size:15px;line-height:1.7">Use this one-time code to reset your MegaKart password.</p>
    <div style="padding:20px;background:#faf9f6;text-align:center">
      <span style="color:#414b36;font-family:Georgia,serif;font-size:32px;letter-spacing:8px">${escapeHtml(otp)}</span>
    </div>
    <p style="margin:18px 0 0;color:#77746d;font-size:13px;line-height:1.6">This code expires in 10 minutes and can be used once. If you did not request a password reset, you can safely ignore this email.</p>`);

  await sendEmail({
    to: user.email,
    subject: "Your password reset code | MegaKart",
    html,
    text: `Hello ${user.name || "there"},\n\nYour MegaKart password reset code is ${otp}. It expires in 10 minutes and can be used once.\n\nIf you did not request a password reset, you can ignore this email.`,
  });
};

const sendWelcomeEmail = async (user) => {
  const safeName = escapeHtml(user.name || "there");
  const html = emailLayout(`
    <p style="margin:0 0 10px;color:#a94f38;font-size:10px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">Welcome to the edit</p>
    <h1 style="margin:0;color:#171714;font-family:Georgia,serif;font-size:30px;font-weight:normal">We are glad you are here, ${safeName}.</h1>
    <p style="margin:18px 0;color:#55564f;font-size:15px;line-height:1.7">Your MegaKart account is ready. Discover considered pieces, keep your favorites close, and enjoy a more personal shopping experience.</p>
    <div style="padding:18px;background:#faf9f6;color:#55564f;font-size:14px;line-height:1.7">
      Your account is registered with <strong>${escapeHtml(user.email)}</strong>.
    </div>
    <p style="margin:20px 0 0;color:#77746d;font-size:13px;line-height:1.6">We look forward to helping you find something you love.</p>`);

  await sendEmail({
    to: user.email,
    subject: "Welcome to MegaKart",
    html,
    text: `Welcome to MegaKart, ${user.name || "there"}.\n\nYour account is ready. Discover considered pieces, keep your favorites close, and enjoy a more personal shopping experience.\n\nYour account is registered with ${user.email}.\n\nWe look forward to helping you find something you love.`,
  });
};

const sendNewsletterWelcomeEmail = async (email) => {
  const safeEmail = escapeHtml(email);
  const html = emailLayout(`
    <p style="margin:0 0 10px;color:#a94f38;font-size:10px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">You are on the list</p>
    <h1 style="margin:0;color:#171714;font-family:Georgia,serif;font-size:30px;font-weight:normal">A more considered inbox starts here.</h1>
    <p style="margin:18px 0;color:#55564f;font-size:15px;line-height:1.7">Thank you for subscribing to MegaKart. Look forward to curated arrivals, thoughtful edits, and occasional notes from our world of style.</p>
    <div style="padding:18px;background:#faf9f6;color:#55564f;font-size:14px;line-height:1.7">
      Newsletter updates will be sent to <strong>${safeEmail}</strong>.
    </div>
    <p style="margin:20px 0 0;color:#77746d;font-size:13px;line-height:1.6">We are delighted to have you with us.</p>`);

  await sendEmail({
    to: email,
    subject: "Welcome to the MegaKart edit",
    html,
    text: `Thank you for subscribing to MegaKart.\n\nLook forward to curated arrivals, thoughtful edits, and occasional notes from our world of style.\n\nNewsletter updates will be sent to ${email}.\n\nWe are delighted to have you with us.`,
  });
};

const sendOrderConfirmationEmail = async (order, user) => {
  const orderId = escapeHtml(order._id);
  const name = escapeHtml(user.name || "there");
  const html = emailLayout(`
    <p style="margin:0 0 10px;color:#a94f38;font-size:10px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">Order confirmed | Payment received</p>
    <h1 style="margin:0;color:#171714;font-family:Georgia,serif;font-size:30px;font-weight:normal">Thank you, ${name}</h1>
    <p style="margin:14px 0 24px;color:#55564f;font-size:15px;line-height:1.7">Your order is confirmed and your payment has been received. We are preparing your selection with care.</p>
    <p style="margin:0 0 12px;color:#77746d;font-size:11px;letter-spacing:1px;text-transform:uppercase">Order #${orderId}</p>
    ${orderSummaryHtml(order)}`);

  await sendEmail({
    to: user.email,
    subject: `Order confirmed & payment received | MegaKart #${order._id}`,
    html,
    text: `Thank you, ${user.name || "there"}.\n\nYour order #${order._id} is confirmed and payment has been received.\n\n${(order.orderItems || []).map((item) => `${item.name} x ${item.quantity}: ${formatCurrency(Number(item.price) * Number(item.quantity))}`).join("\n")}\n\nTotal paid: ${formatCurrency(order.totalPrice)}\n\nDelivering to: ${order.shippingAddress?.address}, ${order.shippingAddress?.city}, ${order.shippingAddress?.postalCode}, ${order.shippingAddress?.country}`,
  });
};

const statusContent = {
  Shipped: {
    eyebrow: "Your order is on its way",
    heading: "A little something is headed your way.",
    message: "Your order has been shipped. Tracking details will be shared as soon as they are available.",
  },
  Delivered: {
    eyebrow: "Delivery complete",
    heading: "Your order has arrived.",
    message: "We hope you love your new pieces. Thank you for making MegaKart part of your day.",
  },
  Cancelled: {
    eyebrow: "Order update",
    heading: "Your order has been cancelled.",
    message: "If payment was collected, any applicable refund will be handled separately and shared with you once processed.",
  },
};

const sendOrderStatusEmail = async (order, user, status) => {
  const content = statusContent[status];
  if (!content) throw new Error(`No email template is available for order status "${status}".`);
  const html = emailLayout(`
    <p style="margin:0 0 10px;color:#a94f38;font-size:10px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">${content.eyebrow}</p>
    <h1 style="margin:0;color:#171714;font-family:Georgia,serif;font-size:30px;font-weight:normal">${content.heading}</h1>
    <p style="margin:18px 0;color:#55564f;font-size:15px;line-height:1.7">${content.message}</p>
    <div style="padding:18px;background:#faf9f6;color:#55564f;font-size:14px;line-height:1.7">
      <strong>Order #${escapeHtml(order._id)}</strong><br>
      ${order.orderItems?.length || 0} ${(order.orderItems?.length || 0) === 1 ? "item" : "items"} | ${formatCurrency(order.totalPrice)}
    </div>`);

  await sendEmail({
    to: user.email,
    subject: `${status === "Cancelled" ? "Order cancelled" : `Order ${status.toLowerCase()}`} | MegaKart #${order._id}`,
    html,
    text: `${content.heading}\n\n${content.message}\n\nOrder #${order._id} | ${order.orderItems?.length || 0} items | ${formatCurrency(order.totalPrice)}`,
  });
};

const sendAdminNewOrderEmail = async (order, user) => {
  const recipient = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!recipient) {
    throw new Error("ADMIN_NOTIFICATION_EMAIL must be configured for new-order alerts.");
  }

  const html = emailLayout(`
    <p style="margin:0 0 10px;color:#a94f38;font-size:10px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">Store alert</p>
    <h1 style="margin:0;color:#171714;font-family:Georgia,serif;font-size:30px;font-weight:normal">A new order has arrived.</h1>
    <p style="margin:18px 0 24px;color:#55564f;font-size:14px;line-height:1.7">Order #${escapeHtml(order._id)} | ${escapeHtml(user.name)} | ${escapeHtml(user.email)}</p>
    ${orderSummaryHtml(order)}`);

  await sendEmail({
    to: recipient,
    subject: `New order #${order._id} | MegaKart`,
    html,
    text: `A new order has arrived.\n\nOrder #${order._id}\nCustomer: ${user.name} (${user.email})\n\n${(order.orderItems || []).map((item) => `${item.name} x ${item.quantity}`).join("\n")}\n\nTotal: ${formatCurrency(order.totalPrice)}`,
  });
};

module.exports = {
  sendAdminNewOrderEmail,
  sendNewsletterWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendPasswordResetEmail,
  sendRegistrationVerificationEmail,
  sendWelcomeEmail,
};
