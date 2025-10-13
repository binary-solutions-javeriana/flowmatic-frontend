# EmailJS Setup Guide

This guide will help you set up EmailJS to handle contact form submissions in your Flowmatic application.

## Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

## Step 2: Create an Email Service

1. In your EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions for your provider
5. Note down your **Service ID** (starts with `service_`)

## Step 3: Create an Email Template

1. Go to **Email Templates** in your dashboard
2. Click **Create New Template**
3. Use this template content:

### Template Subject:
```
Nuevo mensaje de contacto - Flowmatic
```

### Template Body:
```
Hola,

Has recibido un nuevo mensaje de contacto desde Flowmatic:

**Información del contacto:**
- Nombre: {{name}}
- Email: {{from_email}}
- Institución: {{institution}}
- Cargo: {{position}}

**Mensaje:**
{{message}}

---
Este mensaje fue enviado desde el formulario de contacto de Flowmatic.
```

4. Save the template and note down your **Template ID** (starts with `template_`)

## Step 4: Get Your Public Key

1. Go to **Account** in your EmailJS dashboard
2. Find your **Public Key** (long string of characters)
3. Copy this key

## Step 5: Configure Environment Variables

1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add the following variables:

```env
# EmailJS Configuration
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id_here
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id_here
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key_here
NEXT_PUBLIC_CONTACT_EMAIL=your-email@example.com
```

3. Replace the placeholder values with your actual EmailJS credentials
4. Replace `your-email@example.com` with the email address where you want to receive contact form submissions

## Step 6: Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to the pricing section of your website
3. Fill out the contact form
4. Submit the form
5. Check your email for the contact form submission

## Important Notes

- **Never commit your `.env.local` file** to version control
- The `NEXT_PUBLIC_` prefix is required for Next.js to expose these variables to the client-side
- EmailJS free tier allows 200 emails per month
- For production deployment, make sure to set these environment variables in your hosting platform (Vercel, Netlify, etc.)

## Troubleshooting

### Common Issues:

1. **"EmailJS configuration is missing" error:**
   - Make sure all environment variables are set correctly
   - Restart your development server after adding environment variables

2. **Emails not being received:**
   - Check your spam folder
   - Verify your email service configuration in EmailJS
   - Check the EmailJS dashboard for error logs

3. **Template variables not working:**
   - Make sure the template variable names match exactly (case-sensitive)
   - Use double curly braces: `{{variable_name}}`

## Security Considerations

- EmailJS public key is safe to expose in client-side code
- The service ID and template ID are also safe to expose
- Never expose your private keys or sensitive credentials
- Consider implementing rate limiting for production use

## Support

If you encounter issues:
1. Check the EmailJS documentation: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
2. Review the EmailJS dashboard for error logs
3. Test your email service configuration independently
