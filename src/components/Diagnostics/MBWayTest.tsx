import React, { useState } from 'react';
import { Smartphone, CheckCircle, X, Loader } from 'lucide-react';

export function MBWayTest() {
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('10');
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  const testMBWay = async () => {
    setTesting(true);
    setResult(null);
    setLogs([]);

    addLog('Iniciando teste MB WAY...');

    try {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

      addLog(`URL: ${url}`);
      addLog(`Key presente: ${key ? 'Sim' : 'Não'}`);

      const cleanPhone = phone.replace(/\s/g, '');
      addLog(`Telefone limpo: ${cleanPhone}`);

      const body = {
        action: "create",
        phoneNumber: cleanPhone,
        amount: parseFloat(amount),
        bookingId: 'test-booking-' + Date.now()
      };

      addLog(`Body: ${JSON.stringify(body)}`);

      const response = await fetch(`${url}/functions/v1/easypay-mbway`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`
        },
        body: JSON.stringify(body)
      });

      addLog(`Status: ${response.status}`);

      const responseText = await response.text();
      addLog(`Resposta bruta: ${responseText}`);

      let data;
      try {
        data = JSON.parse(responseText);
        addLog(`JSON parseado: ${JSON.stringify(data, null, 2)}`);
      } catch (e) {
        addLog(`Erro ao parsear JSON: ${e}`);
        data = { error: 'Resposta não é JSON válido', raw: responseText };
      }

      setResult(data);
    } catch (error) {
      addLog(`Erro fatal: ${error}`);
      setResult({ error: String(error) });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Smartphone className="w-8 h-8 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Teste MB WAY</h2>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Telemóvel
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="912345678"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor (€)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10.00"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            onClick={testMBWay}
            disabled={testing || !phone || !amount}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center font-semibold"
          >
            {testing ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <Smartphone className="w-5 h-5 mr-2" />
                Testar MB WAY
              </>
            )}
          </button>
        </div>

        {result && (
          <div className={`p-4 rounded-lg mb-4 ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <X className="w-5 h-5 text-red-600" />
              )}
              <span className={`font-semibold ${
                result.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {result.success ? 'Sucesso!' : 'Erro'}
              </span>
            </div>
            <pre className="text-xs overflow-x-auto bg-white p-3 rounded">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {logs.length > 0 && (
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs">
            <div className="font-semibold mb-2 text-green-300">Console:</div>
            {logs.map((log, i) => (
              <div key={i} className="mb-1">{log}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
