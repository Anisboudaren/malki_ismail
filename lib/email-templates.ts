const INK = "#0A0A0A";
const INK_CARD = "#171717";
const INK_LINE = "#262421";
const GOLD = "#FFB906";
const GOLD_MUTED = "#C9A24B";
const CREAM = "#F5F1E8";
const CREAM_DIM = "#A8A398";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function spacedCode(code: string) {
  return code.split("").join("  ");
}

function emailShell(preheader: string, inner: string) {
  const hiddenPreheader = `${escapeHtml(preheader)}${"\u00A0".repeat(80)}`;
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Malki Academy</title>
</head>
<body style="margin:0;padding:0;background:${INK};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${hiddenPreheader}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${INK};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:${INK_CARD};border:1px solid ${INK_LINE};border-radius:24px;overflow:hidden;">
          <tr>
            <td style="height:4px;background:${GOLD};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:36px 32px 40px;font-family:Georgia,'Times New Roman',serif;color:${CREAM};">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:${GOLD_MUTED};">
                Malki Academy
              </p>
              ${inner}
              <p style="margin:36px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:${CREAM_DIM};">
                Malki Academy · photographie, make-up &amp; mode
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function loginCodeEmail(code: string) {
  const digits = code.split("");
  const boxes = digits
    .map(
      (digit) =>
        `<td align="center" style="width:44px;height:56px;border:1px solid ${GOLD_MUTED};border-radius:10px;background:${INK};font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:700;letter-spacing:0;color:${GOLD};">${escapeHtml(digit)}</td>`,
    )
    .join(
      `<td width="8" style="font-size:0;line-height:0;">&nbsp;</td>`,
    );

  const html = emailShell(
    `${code} est votre code Malki. Il expire dans 10 minutes.`,
    `
      <h1 style="margin:18px 0 8px;font-size:28px;line-height:1.2;font-weight:600;color:${CREAM};">
        Votre code de connexion
      </h1>
      <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${CREAM_DIM};">
        Entrez ce code sur la page de vérification. Il expire dans <strong style="color:${CREAM};">10 minutes</strong>.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 20px;">
        <tr>${boxes}</tr>
      </table>
      <p style="margin:0;text-align:center;font-family:Georgia,'Times New Roman',serif;font-size:22px;letter-spacing:0.35em;color:${GOLD};">
        ${escapeHtml(spacedCode(code))}
      </p>
      <p style="margin:28px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:${CREAM_DIM};">
        Si vous n'avez pas demandé ce code, ignorez cet email. Ne le partagez avec personne.
      </p>
    `,
  );

  const text = [
    `Votre code Malki Academy : ${code}`,
    ``,
    `Il expire dans 10 minutes.`,
    `Si vous n'avez pas demandé ce code, ignorez cet email.`,
  ].join("\n");

  return {
    subject: `${code} — votre code Malki Academy`,
    html,
    text,
  };
}

export function newLoginEmail(device: string, ip: string) {
  const html = emailShell(
    `Nouvelle connexion depuis ${device}. L'ancienne session a été déconnectée.`,
    `
      <h1 style="margin:18px 0 8px;font-size:28px;line-height:1.2;font-weight:600;color:${CREAM};">
        Nouvelle connexion
      </h1>
      <p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${CREAM_DIM};">
        Une session a été ouverte depuis un autre appareil. L'ancienne a été déconnectée — un seul appareil à la fois.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${INK};border:1px solid ${INK_LINE};border-radius:16px;">
        <tr>
          <td style="padding:18px 20px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:${CREAM};">
            <p style="margin:0 0 8px;color:${GOLD_MUTED};font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">Appareil</p>
            <p style="margin:0 0 16px;">${escapeHtml(device)}</p>
            <p style="margin:0 0 8px;color:${GOLD_MUTED};font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">IP</p>
            <p style="margin:0;">${escapeHtml(ip)}</p>
          </td>
        </tr>
      </table>
      <p style="margin:24px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:${CREAM_DIM};">
        Si ce n'était pas vous, reconnectez-vous et contactez l'académie.
      </p>
    `,
  );

  const text = [
    `Nouvelle connexion à Malki Academy`,
    `Appareil : ${device}`,
    `IP : ${ip}`,
    `Toute session précédente a été déconnectée.`,
  ].join("\n");

  return {
    subject: "Nouvelle connexion à Malki Academy",
    html,
    text,
  };
}

export function contactMessageEmail(input: {
  name: string;
  contact: string;
  message: string;
}) {
  const html = emailShell(
    `Nouveau message de ${input.name}`,
    `
      <h1 style="margin:18px 0 8px;font-size:28px;line-height:1.2;font-weight:600;color:${CREAM};">
        Nouveau message
      </h1>
      <p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${CREAM_DIM};">
        ${escapeHtml(input.name)} a écrit depuis le formulaire de contact.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${INK};border:1px solid ${INK_LINE};border-radius:16px;">
        <tr>
          <td style="padding:18px 20px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:${CREAM};">
            <p style="margin:0 0 8px;color:${GOLD_MUTED};font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">Nom</p>
            <p style="margin:0 0 16px;">${escapeHtml(input.name)}</p>
            <p style="margin:0 0 8px;color:${GOLD_MUTED};font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">Email / WhatsApp</p>
            <p style="margin:0 0 16px;">${escapeHtml(input.contact)}</p>
            <p style="margin:0 0 8px;color:${GOLD_MUTED};font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">Message</p>
            <p style="margin:0;white-space:pre-wrap;">${escapeHtml(input.message)}</p>
          </td>
        </tr>
      </table>
    `,
  );
  const text = [
    `Nouveau message de ${input.name}`,
    `Contact : ${input.contact}`,
    ``,
    input.message,
  ].join("\n");
  return {
    subject: `Contact — ${input.name}`,
    html,
    text,
  };
}
