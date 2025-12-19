import React, { useState } from 'react';
import { X, User, LogIn, UserPlus, Lock, ArrowLeft, Mail, Eye, EyeOff, Phone, MessageSquare } from 'lucide-react';
import { PasswordRecovery } from './PasswordRecovery';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';

interface ClientLoginProps {
  onLogin: (clientData: any) => void;
  onClose: () => void;
}

export function ClientLogin({ onLogin, onClose }: ClientLoginProps) {
  const { signIn, signUp } = useSupabaseAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const result = await signIn(formData.username, formData.password);
        
        if (result.success && result.user) {
          // RESTRIÇÃO: Só clientes podem fazer login aqui
          if (result.user.userType !== 'client') {
            setError('Esta área é apenas para clientes. Use o botão Staff/Admin para aceder como terapeuta ou administrador.');
            setLoading(false);
            return;
          }
          
          onLogin({
            name: result.user.fullName,
            email: result.user.email,
            phone: formData.phone
          });
        } else {
          setError(result.error || 'Login failed');
        }
      } else {
        // REGISTO
        if (!formData.email || !formData.fullName) {
          setError('Email e nome completo são obrigatórios para registo');
          setLoading(false);
          return;
        }

        const result = await signUp(formData.username, formData.email, formData.password, formData.fullName, formData.phone);
        
        if (result.success && result.user) {
          onLogin({
            name: result.user.fullName,
            email: result.user.email,
            phone: formData.phone
          });
        } else {
          setError(result.error || 'Registration failed');
        }
      }
    } catch (error) {
      setError('Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const fillTestCredentials = () => {
    setFormData({
      username: 'cliente@teste.com',
      email: 'cliente@teste.com',
      password: '123456',
      fullName: 'Cliente Teste',
      phone: ''
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-[#6B6538] text-white rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <LogIn className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold leading-tight">{showPasswordRecovery ? 'Recuperar Password' : isLogin ? 'Entrar' : 'Criar Conta'}</h2>
                <p className="text-white/90 text-sm mt-0.5">
                  {showPasswordRecovery ? 'Recupere a sua password' : isLogin ? 'Aceda à sua conta Desperto' : 'Crie a sua conta Desperto'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/90 hover:text-white p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {showPasswordRecovery ? (
            <div className="space-y-4">
              <button
                onClick={() => setShowPasswordRecovery(false)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar ao Login</span>
              </button>
              <PasswordRecovery
                onBack={() => setShowPasswordRecovery(false)}
                onSuccess={() => {
                  setShowPasswordRecovery(false);
                  setIsLogin(true);
                }}
                isStaffLogin={false}
              />
            </div>
          ) : (
            <>
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {isLogin ? (
                  <>
                    {/* Login Form - Simple */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                          className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B6538] focus:border-transparent text-gray-600 placeholder-gray-400"
                          placeholder="seu@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Password *
                      </label>
                      <div className="relative">
                        <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B6538] focus:border-transparent text-gray-600 placeholder-gray-400"
                          placeholder="Sua password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setShowPasswordRecovery(true)}
                        className="text-[#8B7355] hover:text-[#6B6538] text-sm transition-colors"
                      >
                        Esqueceu a password?
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Registration Form - Full */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Nome Completo *
                      </label>
                      <div className="relative">
                        <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                          className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B6538] focus:border-transparent text-gray-600 placeholder-gray-400"
                          placeholder="O seu nome completo"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B6538] focus:border-transparent text-gray-600 placeholder-gray-400"
                          placeholder="seu@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Username *
                      </label>
                      <div className="relative">
                        <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                          className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B6538] focus:border-transparent text-gray-600 placeholder-gray-400"
                          placeholder="username"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Telefone (opcional)
                      </label>
                      <div className="relative">
                        <Phone className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B6538] focus:border-transparent text-gray-600 placeholder-gray-400"
                          placeholder="+351 xxx xxx xxx"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Password *
                      </label>
                      <div className="relative">
                        <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B6538] focus:border-transparent text-gray-600 placeholder-gray-400"
                          placeholder="Sua password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3.5 bg-[#6B6538] text-white rounded-xl font-medium hover:bg-[#5A5530] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-sm"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>{isLogin ? 'Entrar' : 'Criar Conta'}</span>
                  )}
                </button>
              </form>

              {/* Toggle to Registration/Login */}
              <div className="mt-5 text-center text-sm">
                {isLogin ? (
                  <p className="text-gray-600">
                    Não tem conta?{' '}
                    <button
                      onClick={() => setIsLogin(false)}
                      className="text-[#8B7355] hover:text-[#6B6538] font-medium transition-colors"
                    >
                      Criar Conta
                    </button>
                  </p>
                ) : (
                  <p className="text-gray-600">
                    Já tem conta?{' '}
                    <button
                      onClick={() => setIsLogin(true)}
                      className="text-[#8B7355] hover:text-[#6B6538] font-medium transition-colors"
                    >
                      Entrar
                    </button>
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}