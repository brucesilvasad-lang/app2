
import emailjs from '@emailjs/browser';
import toast from 'react-hot-toast';

// ==============================================================================
// CONFIGURAÇÃO DO EMAILJS
// 1. Crie uma conta grátis em https://www.emailjs.com/
// 2. Crie um "Service" (ex: Gmail)
// 3. Crie um "Email Template".
// 4. Substitua as chaves abaixo pelas suas.
// ==============================================================================

const SERVICE_ID = 'YOUR_SERVICE_ID'; // Ex: service_xyz123
const TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // Ex: template_abc456
const PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Ex: user_123456789

// ==============================================================================

interface EmailParams {
    to_name: string;
    to_email: string;
    class_date: string;
    class_time: string;
    action_type: 'AGENDAMENTO' | 'CANCELAMENTO';
    message: string;
}

export const emailService = {
    sendNotification: async (params: EmailParams) => {
        // Notificação Visual (Toast)
        const actionText = params.action_type === 'AGENDAMENTO' ? 'agendada' : 'cancelada';
        
        // Verifica se o EmailJS está configurado
        if (SERVICE_ID === 'YOUR_SERVICE_ID') {
            console.warn('EmailJS não configurado. Simulando envio de e-mail:', params);
            toast.success(`Aula ${actionText} com sucesso! (E-mail simulado)`);
            return;
        }

        const loadingToast = toast.loading('Enviando confirmação por e-mail...');

        try {
            await emailjs.send(
                SERVICE_ID,
                TEMPLATE_ID,
                {
                    to_name: params.to_name,
                    to_email: params.to_email,
                    class_date: params.class_date,
                    class_time: params.class_time,
                    action: params.action_type,
                    message: params.message
                },
                PUBLIC_KEY
            );
            
            toast.dismiss(loadingToast);
            toast.success(`Aula ${actionText}! E-mail de confirmação enviado.`);
        } catch (error) {
            console.error('Erro ao enviar e-mail:', error);
            toast.dismiss(loadingToast);
            toast.error(`Aula ${actionText}, mas houve erro ao enviar o e-mail.`);
        }
    }
};
