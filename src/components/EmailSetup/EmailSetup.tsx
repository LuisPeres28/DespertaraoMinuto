import React, { useState } from 'react';
import { Mail, Key, Settings, CheckCircle, AlertCircle } from 'lucide-react';

export function EmailSetup() {
  const [serviceId, setServiceId] = useState('service_eqp55ju');
  const [templateId, setTemplateId] = useState('');
  const [publicKey, setPublicKey] = useState('760566696417-10jkflpar8h9u7nei0v2idv5p2rbtpgq.apps.googleusercontent.com');
  const [privateKey, setPrivateKey] = useState('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');
  const [isConfigured, setIsConfigured] = useState(false);

  const handleSave = () => {
    // Save configuration to localStorage
    localStorage.setItem('emailjs_service_id', serviceId);
    localStorage.setItem('emailjs_template_id', templateId);
    localStorage.setItem('emailjs_public_key', publicKey);
    localStorage.setItem('google_oauth_private_key', privateKey);
    setIsConfigured(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Mail className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Configuração de Email</h2>
        </div>

        {!isConfigured ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-800 font-medium">Configuração de Email Necessária</p>
            </div>
            <p className="text-yellow-700 text-sm mt-2">
              Para enviar emails reais, precisa de configurar o EmailJS. Siga os passos abaixo.
            </p>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">Email Configurado com Sucesso!</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Passos para Configurar EmailJS:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Vá para <a href="https://www.emailjs.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">emailjs.com</a> e crie uma conta gratuita</li>
              <li>Conecte o seu email (Gmail, Outlook, etc.)</li>
              <li>Crie um serviço de email</li>
              <li>Crie um template de email</li>
              <li>Copie as suas chaves e cole abaixo</li>
            </ol>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">💳 Ativar Pagamentos MB WAY:</h4>
              <p className="text-sm text-blue-800 mb-2">Para aceitar pagamentos MB WAY reais, precisa de:</p>
              <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
                <li><strong>Stripe:</strong> Criar conta em stripe.com (suporta MB WAY)</li>
                <li><strong>Easypay:</strong> Conta portuguesa em easypay.pt</li>
                <li><strong>Configurar:</strong> Adicionar as chaves API no código</li>
              </ol>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service ID
              </label>
              <div className="relative">
                <Settings className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  placeholder="service_xxxxxxx"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  placeholder="template_xxxxxxx"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google OAuth Client ID (Public Key)
              </label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  placeholder="760566696417-xxxxxxxxx.apps.googleusercontent.com"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google OAuth Client Secret (Private Key)
              </label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder="GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!serviceId || !templateId || !publicKey || !privateKey}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Guardar Configuração
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Template de Email Sugerido:</h4>
          <pre className="text-xs text-gray-600 whitespace-pre-wrap">
{`Assunto: {{subject}}

Olá,

{{message}}

Cumprimentos,
Equipa Desperto
{{from_email}}`}
          </pre>
        </div>
      </div>
    </div>
  );
}