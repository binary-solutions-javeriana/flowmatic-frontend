import React, { useState } from 'react';
import { Mail, Building, User, MessageSquare, Send, CheckCircle, AlertCircle, Briefcase } from 'lucide-react';
import emailjs from '@emailjs/browser';

interface ContactFormData {
  name: string;
  email: string;
  institution: string;
  position: string;
  message: string;
}

interface ContactFormProps {
  onSuccess?: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    institution: '',
    position: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setErrorMessage('El nombre es requerido');
      return false;
    }
    if (!formData.email.trim()) {
      setErrorMessage('El email es requerido');
      return false;
    }
    if (!formData.institution.trim()) {
      setErrorMessage('La institución educativa es requerida');
      return false;
    }
    if (!formData.position.trim()) {
      setErrorMessage('El cargo es requerido');
      return false;
    }
    if (!formData.message.trim()) {
      setErrorMessage('El mensaje es requerido');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMessage('Por favor ingresa un email válido');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // EmailJS configuration
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

      if (!serviceId || !templateId || !publicKey) {
        throw new Error('EmailJS configuration is missing. Please check your environment variables.');
      }

      // Prepare template parameters
      const templateParams = {
        from_email: formData.email,
        from_name: formData.name,
        name: formData.name,
        institution: formData.institution,
        position: formData.position,
        message: formData.message,
        to_email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'your-email@example.com'
      };

      // Send email using EmailJS
      await emailjs.send(serviceId, templateId, templateParams, publicKey);

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        institution: '',
        position: '',
        message: ''
      });

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitStatus('error');
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : 'Hubo un error al enviar el mensaje. Por favor intenta de nuevo.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-[#0c272d] mb-2">Contáctanos</h3>
        <p className="text-gray-600">
          Completa el formulario y nos pondremos en contacto contigo pronto
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nombre Completo *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#14a67e] focus:border-transparent transition-all duration-200"
              placeholder="Juan Pérez"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#14a67e] focus:border-transparent transition-all duration-200"
                placeholder="tu@institucion.edu"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Institution Field */}
          <div className="space-y-2">
            <label htmlFor="institution" className="block text-sm font-medium text-gray-700">
              Institución Educativa *
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="institution"
                name="institution"
                value={formData.institution}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#14a67e] focus:border-transparent transition-all duration-200"
                placeholder="Universidad Nacional"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Position Field */}
        <div className="space-y-2">
          <label htmlFor="position" className="block text-sm font-medium text-gray-700">
            Cargo en la Institución *
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              id="position"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#14a67e] focus:border-transparent transition-all duration-200"
              placeholder="Decano, Director, Coordinador, etc."
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Message Field */}
        <div className="space-y-2">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            Mensaje *
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={4}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#14a67e] focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Cuéntanos sobre tu proyecto, necesidades específicas, número de usuarios, etc."
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Status Messages */}
        {submitStatus === 'error' && (
          <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{errorMessage}</p>
          </div>
        )}

        {submitStatus === 'success' && (
          <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-green-700 text-sm">
              ¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#14a67e] text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:bg-[#14a67e]/90 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Enviando...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Enviar Mensaje</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
