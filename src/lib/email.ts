import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendAlertEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  if (!resend) {
    console.log("[Email] Resend not configured. Would send:", { to, subject });
    return false;
  }

  try {
    await resend.emails.send({
      from: "RadarPro Portugal <alertas@radarpro.pt>",
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

export function buildNewPropertyAlertEmail(
  propertyTitle: string,
  district: string,
  price: number,
  discount: number,
  score: number
): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Nova oportunidade em ${district}!</h1>
      <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <h2>${propertyTitle}</h2>
        <p><strong>Preço:</strong> ${price.toLocaleString()}€</p>
        <p><strong>Desconto:</strong> -${discount}%</p>
        <p><strong>Score:</strong> ${score}/100</p>
      </div>
      <a href="https://radarpro-portugal.vercel.app" style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
        Ver oportunidade
      </a>
    </div>
  `;
}
