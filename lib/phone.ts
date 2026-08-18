export function digits(value: string) {
  return value.replace(/[^\d+]/g, "");
}

export function phoneLinks(raw: string) {
  const trimmed = raw.trim();
  const digitsOnly = trimmed.replace(/[^\d]/g, "");
  const intl = digitsOnly.startsWith("00")
    ? digitsOnly.slice(2)
    : digitsOnly.startsWith("0")
      ? `213${digitsOnly.slice(1)}`
      : digitsOnly;
  const tel = trimmed.startsWith("+") ? `+${digitsOnly}` : intl ? `+${intl}` : trimmed;
  return {
    whatsapp: intl ? `https://wa.me/${intl}` : null,
    tel: tel ? `tel:${tel}` : null,
  };
}
