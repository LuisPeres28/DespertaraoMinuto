import React, { useState } from 'react';
import { X, LogIn, UserPlus, Eye, EyeOff, Mail, Lock, User, ArrowLeft, CheckCircle, AlertTriangle, Shield, Heart } from 'lucide-react';

interface UniversalAuthProps {
  onLogin: (username: string, password: string) => Promise<any>;
  onClose: () => void;
  title?: string;
  restrictToStaff?: boolean;
}

export function UniversalAuth({ onLogin, onClose, title = "Entrar na Desperto", restrictToStaff = false }: UniversalAuthProps) {
  const [mode, setMode] = useState<'login'>('login'); 
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Tentando login com:', formData.email, formData.password);
      
      const result = await onLogin(formData.email, formData.password);   
      console.log('📡 Resultado do login:', result);
      
      if (result.success && result.user) {
        // Check user type restriction
        if (restrictToStaff && result.user.userType === 'client') {
          setError('Esta área é apenas para staff/admin. Clientes devem usar a área de cliente.');
          setLoading(false);
          return;
        }
        
        setSuccess('Login realizado com sucesso!');
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 500);
      } else {
        setError(result.error || 'Credenciais incorretas');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const fillTestCredentials = (type: 'admin' | 'therapist' | 'client') => {
    const credentials = {
      admin: { email: 'euestoudesperto@gmail.com', password: 'Dhvif2m1' },
      therapist: { email: 'luisperes28@gmail.com', password: 'Dhvif2m0' },
      client: { email: 'cliente@teste.com', password: '123456' }
    };
    
    if (restrictToStaff && type === 'client') return;
    
    setFormData(prev => ({
      ...prev,
      email: credentials[type].email,
      password: credentials[type].password
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <LogIn className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Entrar na Desperto</h2>
                <p className="text-white/90 text-sm">Entre na sua conta</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">{success}</span>
              </div>
            </div>
          )}

          {/* LOGIN FORM */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-4 top-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-4 top-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-12 pr-14 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                  placeholder="Sua password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800 text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Entrar</span>
              )}
            </button>
          </form>

          {/* Test Credentials */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
            <div className="flex items-center space-x-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">Sistema de Produção</h4>
            </div>
            <div className="text-sm text-blue-800 space-y-2">
              <p>Este é um ambiente de produção. As contas de demonstração foram removidas por segurança.</p>
              <p><strong>Para aceder:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Registe-se como novo utilizador</li>
                <li>Contacte o administrador para credenciais de staff</li>
                <li>Use apenas credenciais válidas fornecidas oficialmente</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}