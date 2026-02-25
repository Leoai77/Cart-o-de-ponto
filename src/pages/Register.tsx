import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Clock } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    company: '',
    password: '',
  });
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    register(formData);
    navigate('/');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 py-12">
      <div className="w-full max-w-sm space-y-8 bg-white p-8 rounded-2xl shadow-sm border">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <Clock className="text-white w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Cadastro</h2>
          <p className="text-sm text-slate-500 mt-2">Crie sua conta no PontoSmart</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
            <Input name="name" required value={formData.name} onChange={handleChange} placeholder="João da Silva" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
            <Input name="cpf" required value={formData.cpf} onChange={handleChange} placeholder="000.000.000-00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
            <Input name="phone" required value={formData.phone} onChange={handleChange} placeholder="(00) 00000-0000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
            <Input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="seu@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Empresa Vinculada</label>
            <Input name="company" required value={formData.company} onChange={handleChange} placeholder="Nome da Empresa" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <Input type="password" name="password" required value={formData.password} onChange={handleChange} placeholder="••••••••" />
          </div>

          <Button type="submit" className="w-full h-12 text-base mt-6">
            Cadastrar
          </Button>
        </form>

        <div className="text-center text-sm">
          <p className="text-slate-500">
            Já tem uma conta?{' '}
            <button onClick={() => navigate('/login')} className="font-medium text-indigo-600 hover:text-indigo-500">
              Entrar
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
