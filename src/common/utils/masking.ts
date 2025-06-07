export const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  if (!domain) return email;

  const localMasked = local.length > 3 ? local.slice(0, 2) + '***' + local.slice(-1) : local[0] + '***';

  const domainParts = domain.split('.');
  if (domainParts.length < 2) return localMasked + '@' + domain;

  const mainDomain = domainParts[0];
  const domainMasked = mainDomain.length > 3 ? mainDomain[0] + '**' + mainDomain.slice(-1) : mainDomain[0] + '**';

  return `${localMasked}@${domainMasked}.${domainParts.slice(1).join('.')}`;
};

export const maskPhone = (phone: string): string => {
  if (phone.length <= 4) return phone;
  return phone.slice(0, 2) + '*'.repeat(phone.length - 4) + phone.slice(-2);
};
