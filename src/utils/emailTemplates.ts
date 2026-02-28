interface ServiceItem {
  name?: string;
  price?: number;
}

interface ClientEmailData {
  nom?: string;
  selectedServices?: ServiceItem[];
  totalPrice?: number;
  whatsappLink?: string;
  description?: string;
}

interface AdminEmailData {
  nom?: string;
  email?: string;
  description?: string;
  selectedServices?: ServiceItem[];
  totalPrice?: number;
}

export const formatPrice = (price: number | string | null | undefined): string => {
  if (price === undefined || price === null) return "0 FCFA";
  try {
    const cleanPrice = String(price).replace(/[^0-9.]/g, '');
    const numPrice = Number(cleanPrice);
    
    if (isNaN(numPrice)) return "0 FCFA";
    
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numPrice);
  } catch (e) {
    console.error("Error formatting price:", e);
    return "0 FCFA";
  }
};

export const generateClientEmail = (data: ClientEmailData = {}): string => {
  const { 
    nom = 'Client', 
    selectedServices = [], 
    totalPrice = 0, 
    whatsappLink = '#', 
    description = '' 
  } = data;

  const services = Array.isArray(selectedServices) ? selectedServices : [];
  
  const servicesList = services.length > 0 
    ? services.map(service => `
      <tr style="border-bottom: 1px solid #333;">
        <td style="padding: 12px 5px; color: #ffffff;">${service?.name || 'Service'}</td>
        <td style="padding: 12px 5px; text-align: center; color: #aaaaaa;">1</td>
        <td style="padding: 12px 5px; text-align: right; color: #CCFF00; font-weight: bold;">${formatPrice(service?.price || 0)}</td>
      </tr>
    `).join('')
    : '<tr><td colspan="3" style="color: #999; padding: 10px;">Aucun service sélectionné</td></tr>';

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>Confirmation de Devis - Pelikulart.AI</title></head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr><td align="center" style="padding: 20px 0;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #000000; border-radius: 8px; overflow: hidden;">
            <tr><td align="center" style="background-color: #CCFF00; padding: 25px;">
              <h1 style="color: #000000; margin: 0; font-size: 24px; text-transform: uppercase;">Confirmation de Devis</h1>
            </td></tr>
            <tr><td style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #cccccc;">Bonjour <strong>${nom}</strong>,</p>
              <p style="font-size: 16px; color: #cccccc;">Nous avons bien reçu votre demande. Voici le détail :</p>
              <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 3px solid #CCFF00;">
                <h4 style="color: #CCFF00; margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase;">Votre Projet</h4>
                <p style="margin: 0; color: #aaaaaa; font-style: italic;">"${description || 'Aucune description fournie'}"</p>
              </div>
              <div style="background-color: #1a1a1a; padding: 25px; border-radius: 8px; margin: 30px 0;">
                <h3 style="color: #CCFF00; margin: 0 0 20px 0; font-size: 14px; text-transform: uppercase;">Services Sélectionnés</h3>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px;">
                  <thead><tr style="border-bottom: 2px solid #444;">
                    <th style="text-align: left; padding-bottom: 10px; color: #888;">Service</th>
                    <th style="text-align: center; padding-bottom: 10px; color: #888; width: 50px;">Qté</th>
                    <th style="text-align: right; padding-bottom: 10px; color: #888; width: 120px;">Prix</th>
                  </tr></thead>
                  <tbody>${servicesList}</tbody>
                  <tfoot><tr>
                    <td colspan="2" style="padding-top: 20px; color: #888888; text-align: right; padding-right: 15px;">TOTAL ESTIMÉ</td>
                    <td style="padding-top: 20px; text-align: right; color: #CCFF00; font-size: 20px; font-weight: bold;">${formatPrice(totalPrice)}</td>
                  </tr></tfoot>
                </table>
              </div>
              <p style="font-size: 16px; color: #cccccc;">Notre équipe reviendra vers vous très prochainement.</p>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 35px;">
                <tr><td align="center">
                  <a href="${whatsappLink}" style="background-color: #25D366; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: bold;">Discuter sur WhatsApp</a>
                </td></tr>
              </table>
            </td></tr>
            <tr><td style="background-color: #111111; padding: 20px; text-align: center; border-top: 1px solid #222;">
              <p style="margin: 0; font-size: 12px; color: #666666;">© ${new Date().getFullYear()} Pelikulart.AI - Tous droits réservés</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;
};

export const generateAdminEmail = (data: AdminEmailData = {}): string => {
  const { 
    nom = 'Inconnu', 
    email = 'Non fourni', 
    description = '', 
    selectedServices = [], 
    totalPrice = 0 
  } = data;

  const services = Array.isArray(selectedServices) ? selectedServices : [];
  
  const servicesList = services.length > 0
    ? services.map(service => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 8px 0;">${service?.name || 'Service'}</td>
        <td style="padding: 8px 0; text-align: center;">1</td>
        <td style="padding: 8px 0; text-align: right; font-weight: bold;">${formatPrice(service?.price || 0)}</td>
      </tr>
    `).join('')
    : '<tr><td colspan="3">Aucun service</td></tr>';

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>Nouvelle Demande - Pelikulart.AI</title></head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr><td align="center" style="padding: 20px 0;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 4px;">
            <tr><td style="background-color: #f8f9fa; padding: 20px; border-bottom: 3px solid #CCFF00;">
              <h2 style="margin: 0; color: #333333;">Nouvelle Demande de Devis</h2>
            </td></tr>
            <tr><td style="padding: 25px;">
              <h3 style="color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 10px;">👤 Client</h3>
              <p><strong>Nom :</strong> ${nom}</p>
              <p><strong>Email :</strong> <a href="mailto:${email}">${email}</a></p>
              <h3 style="color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 10px;">📝 Projet</h3>
              <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #CCFF00; border-radius: 4px;">
                <p style="margin: 0; white-space: pre-wrap; color: #555;">${description || 'Pas de description'}</p>
              </div>
              <h3 style="color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 20px;">💰 Services</h3>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <thead><tr>
                  <th style="text-align: left; color: #999; font-size: 12px;">SERVICE</th>
                  <th style="text-align: center; color: #999; font-size: 12px;">QTÉ</th>
                  <th style="text-align: right; color: #999; font-size: 12px;">PRIX</th>
                </tr></thead>
                <tbody>${servicesList}</tbody>
                <tfoot><tr>
                  <td colspan="2" style="padding-top: 15px; font-weight: bold; text-align: right; padding-right: 15px;">Total Estimé</td>
                  <td style="padding-top: 15px; text-align: right; font-weight: bold; color: #d35400; font-size: 18px;">${formatPrice(totalPrice)}</td>
                </tr></tfoot>
              </table>
            </td></tr>
            <tr><td style="background-color: #f1f1f1; padding: 12px; text-align: center; font-size: 11px; color: #999;">
              Généré par Pelikulart.AI | ${new Date().toLocaleString('fr-FR')}
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;
};
