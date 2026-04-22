/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Bell, 
  User, 
  Car, 
  UserRound, 
  AlertTriangle, 
  GraduationCap, 
  ChevronLeft,
  IdCard,
  FlaskConical,
  Award,
  ParkingCircle,
  MoreVertical,
  Download,
  Trash2,
  QrCode,
  History,
  Plus,
  X,
  Image as ImageIcon,
  RefreshCcw,
  RotateCcw,
  CloudUpload,
  CloudDownload
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, Reorder } from 'motion/react';
import { supabase } from './lib/supabase';

type View = 'home' | 'condutor' | 'habilitacao' | 'manage';

interface DocPage {
  id: string;
  type: 'custom' | 'default';
  content?: string; // URL or DataURL for custom images
}

const DEFAULT_PAGES: DocPage[] = [
  { 
    id: 'not_found', 
    type: 'default', 
    content: 'https://placehold.jp/24/ffffff/001a4b/800x1200.png?text=%0A%0A%0ACNH%20DO%20BRASIL%0A%0A%0A%0AVoc%C3%AA%20precisa%20baixar%20sua%20CNH-e%0Apara%20visualiz%C3%A1-la.%0A%0ABaixando%20a%20sua%20CNH-e%2C%0Aela%20ser%C3%A1%20gravada%20no%20seu%20dispositivo%0Ade%20maneira%20segura%20e%20voc%C3%AA%0Apoder%C3%A1%20acess%C3%A1-la%20sem%20internet.' 
  },
];

export default function App() {
  const [view, setView] = useState<View>('home');
  const [isAtTop, setIsAtTop] = useState(true);
  const [docPage, setDocPage] = useState(0);
  const [docPages, setDocPages] = useState<DocPage[]>(DEFAULT_PAGES);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [pullDist, setPullDist] = useState(0);
  const [sliderOffset, setSliderOffset] = useState(0);
  const [selectedZoomPage, setSelectedZoomPage] = useState<number | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [lastPinchDist, setLastPinchDist] = useState<number | null>(null);

  // Profile and Driver state
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [driverInfo, setDriverInfo] = useState({
    nome: "F******* A****** F***** T*******",
    sexo: "Masculino",
    cpf: "***.480.918-**",
    uf: "SP",
    categoria: "AB",
    emissao: "10/04/2026",
    validade: "09/04/2036"
  });

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePic(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && selectedZoomPage !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      if (lastPinchDist !== null) {
        const delta = dist / lastPinchDist;
        setZoomScale(prev => Math.min(Math.max(prev * delta, 1), 5));
      }
      setLastPinchDist(dist);
    }
  };

  const handleTouchEnd = () => {
    setLastPinchDist(null);
  };

  // Fetch from Supabase on mount
  useEffect(() => {
    fetchFromSupabase();
  }, []);

  useEffect(() => {
    setIsAtTop(true);
  }, [view]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsAtTop(e.currentTarget.scrollTop <= 0);
  };
  
  const fetchFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('cnh_pages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        setDocPages(data.map(item => ({
          id: item.id.toString(),
          type: item.type as 'custom' | 'default',
          content: item.content
        })));
      }
    } catch (err) {
      console.error('Error fetching from Supabase:', err);
    }
  };

  const saveToSupabase = async () => {
    if (isSaving) return;
    
    // Check payload size roughly
    const totalSize = JSON.stringify(docPages).length;
    if (totalSize > 5 * 1024 * 1024) { // 5MB limit
      alert('O tamanho total das imagens é muito grande para o Supabase (limite de ~5MB). Tente remover algumas imagens ou use arquivos menores.');
      return;
    }

    setIsSaving(true);
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout na sincronização')), 25000)
    );

    try {
      const syncAction = async () => {
        // Clear existing pages for this demo (simple sync)
        const { error: delError } = await supabase.from('cnh_pages').delete().neq('id', 0);
        if (delError) console.warn('Aviso no delete:', delError);

        const itemsToInsert = docPages.map((page) => ({
          type: page.type,
          content: page.content,
        }));

        if (itemsToInsert.length > 0) {
          const { error: insError } = await supabase.from('cnh_pages').insert(itemsToInsert);
          if (insError) throw insError;
        }
      };

      await Promise.race([syncAction(), timeoutPromise]);
      alert('Sincronizado com sucesso!');
    } catch (err: any) {
      console.error('Error saving to Supabase:', err);
      const msg = err.message || 'Erro deconhecido';
      alert(`Falha na sincronização: ${msg}. Verifique sua conexão e se a tabela "cnh_pages" existe no projeto.`);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await fetchFromSupabase();
      // Garantir pelo menos 800ms de feedback visual
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setIsRefreshing(false);
      setPullDist(0);
    }
  };

  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    const newPagesPromises = fileArray.map((file: File) => {
      return new Promise<DocPage>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1000;
            const MAX_HEIGHT = 1500;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
            } else {
              if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            
            const result = canvas.toDataURL('image/jpeg', 0.7);
            resolve({ id: Math.random().toString(36).substr(2, 9), type: 'custom', content: result });
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
    });

    const newPages = await Promise.all(newPagesPromises);
    setDocPages(prev => [...prev.filter(p => p.id !== 'not_found'), ...newPages]);
  };

  const handleRemovePage = (id: string) => {
    setDocPages(prev => {
      const filtered = prev.filter(p => p.id !== id);
      if (docPage >= filtered.length) {
        setDocPage(Math.max(0, filtered.length - 1));
      }
      return filtered;
    });
  };

  return (
    <div className="h-screen bg-[#001a4b] flex justify-center items-start sm:py-8 transition-all overflow-hidden">
      {/* Container - Responsive width */}
      <div className="w-full sm:max-w-[500px] md:max-w-[800px] lg:max-w-[1000px] bg-[#f8f9fa] sm:shadow-2xl flex flex-col h-full sm:h-[90vh] sm:rounded-[2.5rem] relative overflow-hidden transition-all">
        
        {/* Header */}
        <header className="bg-[#001a4b] text-white p-4 sticky top-0 z-50 shadow-md rounded-b-[2rem]">
          <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  if (view === 'manage') setView('habilitacao');
                  else if (view === 'habilitacao') setView('condutor');
                  else if (view === 'condutor') setView('home');
                }}
                className="p-2 -ml-2 active:bg-white/10 rounded-full transition-colors touch-manipulation"
              >
                {view === 'home' ? <Menu size={22} /> : <ChevronLeft size={22} />}
              </button>
              <h1 className="text-base font-bold tracking-wider uppercase truncate text-white">
                {view === 'home' ? 'FERNANDO AUGUSTO' : view === 'condutor' ? 'CONDUTOR' : view === 'habilitacao' ? 'HABILITAÇÃO' : 'GERENCIAR'}
              </h1>
            </div>
            {view === 'home' && (
              <div className="flex items-center gap-3">
                <button className="relative p-1 active:scale-95 transition-transform touch-manipulation">
                  <Bell size={22} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 border border-[#001a4b] rounded-full"></span>
                </button>
                <label className="w-8 h-8 rounded-full flex items-center justify-center font-black border border-white/20 text-sm shadow-sm overflow-hidden cursor-pointer active:scale-90 transition-transform bg-white text-[#001a4b]">
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    "F"
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
                </label>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Refresh Indicator */}
          <AnimatePresence>
            {(pullDist > 5 || isRefreshing) && (
              <motion.div 
                key="refresh-indicator"
                initial={{ opacity: 0, y: -20 }}
                animate={{ 
                  opacity: 1, 
                  y: isRefreshing ? 50 : Math.max(0, pullDist * 0.5),
                  rotate: isRefreshing ? 0 : pullDist * 2.4, // 150px = 360deg
                }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-0 left-1/2 -translate-x-1/2 z-[60] mt-2 pointer-events-none"
              >
                <div className="bg-white p-2.5 rounded-full text-[#5e4b8b]">
                  <RotateCcw size={18} className={isRefreshing ? "animate-spin" : ""} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className="flex-1 flex flex-col h-full bg-transparent overflow-hidden"
            onPan={(_, info) => {
              // Só ativa o pull se estiver no topo e puxando para baixo
              if (isAtTop && info.offset.y > 0 && Math.abs(info.offset.y) > Math.abs(info.offset.x) * 1.5) {
                const dist = info.offset.y * 0.4;
                setPullDist(dist);
              }
            }}
            onPanEnd={() => {
              if (pullDist > 40) {
                handleRefresh();
              } else {
                setPullDist(0);
              }
            }}
          >
            <AnimatePresence mode="wait">
            {view === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onScroll={handleScroll}
                className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pb-10 max-w-5xl mx-auto w-full"
              >
                {/* Home Cards */}
                <DashboardCard
                  title="CONDUTOR"
                  subtitle="Gerencie sua"
                  highlight="habilitação"
                  color="bg-[#00a859]"
                  icon={
                    <div className="flex items-end">
                      <User size={28} strokeWidth={3} className="-mr-1 mb-1" />
                      <Car size={40} strokeWidth={3} />
                    </div>
                  }
                  onClick={() => setView('condutor')}
                />
                <DashboardCard
                  title="VEÍCULOS"
                  subtitle="Acesso ao"
                  highlight="CRLV-e, venda digital"
                  color="bg-[#ffcc33]"
                  icon={<Car size={44} strokeWidth={3} className="text-white drop-shadow-sm" />}
                  textColor="text-black"
                />
                <DashboardCard
                  title="INFRAÇÕES"
                  subtitle="Visualize e pague infrações com até"
                  highlight="40% de desconto"
                  color="bg-[#1b3a8b]"
                  icon={
                    <div className="flex items-end">
                      <div className="relative -mr-1 mb-1">
                         <User size={26} strokeWidth={3} />
                         <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-white rounded-t-full" />
                      </div>
                      <Car size={38} strokeWidth={3} />
                    </div>
                  }
                />
                <DashboardCard
                  title="EDUCAÇÃO"
                  subtitle="Conheça nossa"
                  highlight="plataforma de cursos"
                  color="bg-[#66b3e6]"
                  icon={
                    <div className="flex items-end">
                      <User size={28} strokeWidth={3} className="-mr-1 mb-1" />
                      <div className="bg-white/20 p-1 rounded">
                         <div className="w-10 h-7 border-[3px] border-white rounded-sm relative">
                            <div className="absolute inset-1 bg-white/40" />
                         </div>
                      </div>
                    </div>
                  }
                />
              </motion.div>
            )}

            {view === 'condutor' && (
              <motion.div
                key="condutor"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onScroll={handleScroll}
                className="p-4 flex flex-col gap-4 h-full overflow-y-auto pb-10 max-w-4xl mx-auto w-full"
              >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 relative w-full max-w-2xl mx-auto">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-300">
                    <h2 className="text-black font-bold text-sm tracking-tight">
                      Informações do Condutor
                    </h2>
                    {isEditingInfo && (
                      <button 
                        onClick={() => setIsEditingInfo(false)}
                        className="text-[10px] font-bold text-[#001a4b] bg-gray-100 px-3 py-1 rounded-full uppercase"
                      >
                        Salvar
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-1 text-xs scale-[1.02] origin-left">
                    {isEditingInfo ? (
                      <>
                        <div className="col-span-2 flex flex-col gap-1">
                          <label className="text-[10px] text-gray-700 font-bold">Nome</label>
                          <input 
                            value={driverInfo.nome} 
                            onChange={e => setDriverInfo(prev => ({ ...prev, nome: e.target.value }))}
                            className="border-b border-gray-200 py-1 font-bold text-black focus:outline-none focus:border-[#1b3a8b]"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-gray-700 font-bold">CPF</label>
                          <input 
                            value={driverInfo.cpf} 
                            onChange={e => setDriverInfo(prev => ({ ...prev, cpf: e.target.value }))}
                            className="border-b border-gray-200 py-1 font-bold text-black focus:outline-none focus:border-[#1b3a8b]"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-gray-700 font-bold">Sexo</label>
                          <input 
                            value={driverInfo.sexo} 
                            onChange={e => setDriverInfo(prev => ({ ...prev, sexo: e.target.value }))}
                            className="border-b border-gray-200 py-1 font-bold text-black focus:outline-none focus:border-[#1b3a8b]"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-gray-700 font-bold">Categoria</label>
                          <input 
                            value={driverInfo.categoria} 
                            onChange={e => setDriverInfo(prev => ({ ...prev, categoria: e.target.value }))}
                            className="border-b border-gray-200 py-1 font-bold text-black focus:outline-none focus:border-[#1b3a8b]"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-gray-700 font-bold">UF</label>
                          <input 
                            value={driverInfo.uf} 
                            onChange={e => setDriverInfo(prev => ({ ...prev, uf: e.target.value }))}
                            className="border-b border-gray-200 py-1 font-bold text-black focus:outline-none focus:border-[#1b3a8b]"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-gray-700 font-bold">Data de Validade</label>
                          <input 
                            value={driverInfo.validade} 
                            onChange={e => setDriverInfo(prev => ({ ...prev, validade: e.target.value }))}
                            className="border-b border-gray-200 py-1 font-bold text-black focus:outline-none focus:border-[#1b3a8b]"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-gray-700 font-bold">Data de Emissão</label>
                          <input 
                            value={driverInfo.emissao} 
                            onChange={e => setDriverInfo(prev => ({ ...prev, emissao: e.target.value }))}
                            className="border-b border-gray-200 py-1 font-bold text-black focus:outline-none focus:border-[#1b3a8b]"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="col-span-2">
                          <InfoItem label="Nome" value={driverInfo.nome} />
                        </div>
                        <InfoItem label="CPF" value={driverInfo.cpf} />
                        <InfoItem label="Sexo" value={driverInfo.sexo} />
                        <InfoItem label="Categoria" value={driverInfo.categoria} />
                        <InfoItem label="UF de Emissão" value={driverInfo.uf} />
                        <InfoItem label="Data de Validade" value={driverInfo.validade} />
                        <InfoItem label="Data de Emissão" value={driverInfo.emissao} />
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1 max-w-4xl mx-auto w-full px-4">
                  <ActionGridItem icon={<IdCard size={28} />} label="HABILITAÇÃO" onClick={() => setView('habilitacao')} />
                  <ActionGridItem icon={<Award size={28} />} label="CADASTRO POSITIVO" onClick={() => setIsEditingInfo(!isEditingInfo)} />
                  <ActionGridItem icon={<FlaskConical size={28} />} label="EXAMES TOXICOLÓGICOS" />
                  <ActionGridItem icon={<GraduationCap size={28} />} label="CURSOS ESPECIALIZADOS" />
                  <ActionGridItem icon={<ParkingCircle size={28} />} label="CREDENCIAL DE ESTACIONAMENTO" />
                </div>
              </motion.div>
            )}

            {view === 'habilitacao' && (
              <motion.div
                key="habilitacao"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                onScroll={handleScroll}
                className="flex flex-col h-full overflow-y-auto bg-[#f8f9fa] max-w-4xl mx-auto w-full pb-1"
              >
                <div className="pt-0.5 pb-0 px-4 bg-[#f8f9fa] text-center">
                   <p className="text-[10px] font-bold text-[#001a4b]">
                      Verifique autenticidade do QR Code com o app <span className="underline decoration-[#001a4b]/30">Vio</span>
                   </p>
                </div>

                {/* Document Area */}
                <div className="flex flex-col items-center justify-center bg-[#f8f9fa] relative touch-none pt-0 pb-0">
                  <div className="w-full aspect-[1/1.5] relative">
                    <motion.div 
                      className="absolute inset-0 flex will-change-transform"
                      onPan={(_, info) => {
                        // Handle horizontal movement for a "light" feel following the finger
                        setSliderOffset(info.offset.x);
                      }}
                      onPanEnd={(_, info) => {
                        const swipeThreshold = 50;
                        const velocityThreshold = 500;
                        
                        // Transition to next or previous page based on swipe
                        if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
                          if (docPage < docPages.length - 1) setDocPage(prev => prev + 1);
                        } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
                          if (docPage > 0) setDocPage(prev => prev - 1);
                        }
                        
                        // Reset the temporary offset, the animate prop will take over for the snap
                        setSliderOffset(0);
                      }}
                      animate={{ x: `calc(-${docPage * 100}% + ${sliderOffset}px)` }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 38,
                        mass: 0.8,
                        // Faster transition when snapping back/moving
                        duration: sliderOffset === 0 ? 0.3 : 0
                      }}
                    >
                      {docPages.map((page, index) => (
                        <div 
                          key={page.id} 
                          className="min-w-full h-full flex items-center justify-center select-none cursor-zoom-in"
                          onClick={() => {
                            setSelectedZoomPage(index);
                            setZoomScale(1);
                          }}
                        >
                          {page.content ? (
                            <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
                               <img 
                                 src={page.content} 
                                 alt={`Página ${index + 1}`} 
                                 className="w-full h-full object-contain pointer-events-none" 
                                 referrerPolicy="no-referrer" 
                               />
                            </div>
                          ) : (
                            <div className="w-full h-full relative overflow-hidden border-y border-gray-200 bg-[#f9fafb]">
                              {page.id === 'front' && (
                                <div className="absolute inset-0 p-8 flex flex-col bg-[#e9f0ef]">
                                  <div className="flex justify-between items-start border-b border-black/20 pb-4 mb-6">
                                      <div className="text-[8px] font-bold tracking-tight leading-none text-gray-800 uppercase">
                                        República Federativa do Brasil<br/>
                                        Ministério dos Transportes<br/>
                                        Secretaria Nacional de Trânsito
                                      </div>
                                      <div className="w-8 h-8 rounded-full border border-black/40 flex items-center justify-center text-[8px] font-black">BR</div>
                                  </div>
                                  <div className="flex-1 flex flex-col gap-4">
                                      <div className="flex gap-4">
                                        <div className="w-24 h-28 bg-gray-100 rounded border border-gray-200 flex items-center justify-center shadow-inner overflow-hidden">
                                            <UserRound size={60} className="text-gray-300" />
                                        </div>
                                        <div className="flex-1 text-[8px] font-mono flex flex-col gap-2.5 pt-2">
                                            <div className="border-b border-black/10 pb-1"><span className="text-gray-400 uppercase">Nome: </span>FERNANDO AUGUSTO...</div>
                                            <div className="grid grid-cols-2 gap-2">
                                              <div className="border-b border-black/10 pb-1"><span className="text-gray-400 uppercase">CPF: </span>***.480...</div>
                                              <div className="border-b border-black/10 pb-1"><span className="text-gray-400 uppercase">CAT: </span>AB</div>
                                            </div>
                                            <div className="border-b border-black/10 pb-1"><span className="text-gray-400 uppercase">Registro: </span>08038...</div>
                                        </div>
                                      </div>
                                      <div className="mt-4 flex-1 flex flex-col items-center justify-center">
                                        <div className="w-32 h-32 bg-white border border-gray-200 p-2 flex items-center justify-center shadow-sm">
                                            <QrCode size={100} className="text-[#001a4b]" strokeWidth={1} />
                                        </div>
                                        <span className="text-[8px] mt-4 font-black text-gray-400 tracking-widest uppercase">Assinatura Digital</span>
                                      </div>
                                  </div>
                                </div>
                              )}
                              {page.id === 'back' && (
                                <div className="absolute inset-0 p-8 flex flex-col bg-[#e9f0ef]">
                                   <div className="border-b border-black/20 pb-4 mb-6">
                                      <div className="text-[8px] font-bold tracking-tight text-gray-800 uppercase">Observações / Filiação</div>
                                   </div>
                                   <div className="flex-1 text-[8px] font-mono flex flex-col gap-4">
                                      <div className="border-b border-black/10 pb-2"><span className="text-gray-400 uppercase">FILIAÇÃO:</span><br/>MARIA SILVA / JOÃO SANTOS</div>
                                      <div className="border-b border-black/10 pb-2"><span className="text-gray-400 uppercase">OBSERVAÇÕES:</span><br/>EXERCE ATIVIDADE REMUNERADA</div>
                                      <div className="mt-auto pt-4 flex justify-between border-t border-black/10">
                                         <div className="text-center font-bold">
                                            <div className="w-20 h-0.5 bg-black/40 mx-auto mb-1" />
                                            ASSINATURA DO EMISSOR
                                         </div>
                                         <div className="text-center font-bold">
                                            <div className="w-20 h-0.5 bg-black/40 mx-auto mb-1" />
                                            ASSINATURA DO CONDUTOR
                                         </div>
                                      </div>
                                   </div>
                                </div>
                              )}
                              {page.id === 'qr' && (
                                <div className="absolute inset-0 p-12 flex flex-col items-center justify-center gap-8 bg-white">
                                   <div className="text-center">
                                      <h3 className="text-xl font-black text-[#001a4b] tracking-tighter">QR CODE VIO</h3>
                                      <p className="text-[10px] text-gray-500 font-medium">Escaneie para validar as informações</p>
                                   </div>
                                   <div className="w-56 h-56 p-4 border-[12px] border-gray-50 rounded-3xl shadow-inner flex items-center justify-center">
                                      <QrCode size={180} className="text-[#001a4b]" strokeWidth={1} />
                                   </div>
                                </div>
                              )}
                              {page.id === 'photo' && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 bg-[#e9f0ef]">
                                   <div className="w-56 h-64 bg-gray-200 rounded-2xl border-[10px] border-white shadow-2xl flex items-center justify-center overflow-hidden">
                                      <UserRound size={150} className="text-gray-400" />
                                   </div>
                                   <div className="mt-8 text-center text-[#001a4b]">
                                      <h3 className="text-2xl font-black tracking-tight">FERNANDO AUGUSTO</h3>
                                      <p className="text-xs text-gray-500 font-mono tracking-widest uppercase">Habilitado desde 2016</p>
                                   </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  </div>

                  {docPages.length > 1 && (
                    <div className="flex gap-2 mt-2 mb-2">
                      {docPages.map((_, i) => (
                        <div
                          key={i}
                          onClick={() => setDocPage(i)}
                          className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer border ${i === docPage ? 'bg-[#3b82f6] border-[#3b82f6]' : 'bg-transparent border-[#001a4b]/20'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Menu - Seamless with background */}
                <div className="px-6 py-4 grid grid-cols-1 gap-6 bg-[#f8f9fa] pb-12 w-full max-w-4xl mx-auto">
                  <OptionButton icon={<History size={18} />} label="Histórico de emissões da CNH" />
                  <OptionButton icon={<Download size={18} />} label="Exportar" />
                  <OptionButton icon={<Trash2 size={18} />} label="Remover" />
                  <OptionButton icon={<QrCode size={18} />} label="Copiar QR Code" onClick={() => setView('manage')} />
                </div>
              </motion.div>
            )}

            {view === 'manage' && (
              <motion.div
                key="manage"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                onScroll={handleScroll}
                className="p-4 flex flex-col gap-5 h-full overflow-y-auto bg-[#f8f9fa] max-w-4xl mx-auto w-full pb-20"
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="text-[#001a4b] font-black text-lg leading-tight uppercase tracking-tight">Gerenciar Páginas</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Arraste para reordenar suas fotos</p>
                  </div>
                  <label className="bg-[#001a4b] text-white p-3 rounded-2xl shadow-lg active:scale-95 transition-transform cursor-pointer">
                    <Plus size={24} />
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleAddImage} />
                  </label>
                </div>

                <Reorder.Group axis="y" values={docPages} onReorder={setDocPages} className="flex flex-col gap-3">
                  {docPages.map((page, index) => (
                    <Reorder.Item 
                      key={page.id} 
                      value={page}
                      className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm active:shadow-xl transition-all relative touch-none"
                    >
                      <div className="w-16 h-24 bg-[#e9f0ef] rounded-md overflow-hidden border border-gray-100 flex-shrink-0 flex items-center justify-center">
                        {page.content ? (
                          <img src={page.content} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                        ) : (
                          <ImageIcon size={24} className="text-[#001a4b] opacity-20" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-[#001a4b] text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                            {index + 1}
                          </span>
                          <h3 className="text-[#001a4b] font-black text-xs uppercase tracking-wider">
                            Página {page.type === 'default' ? 'Padrão' : 'Customizada'}
                          </h3>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Pressone e arraste para mover</p>
                      </div>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePage(page.id);
                        }}
                        className="p-2.5 text-red-500 hover:bg-red-50 active:bg-red-100 rounded-full transition-colors"
                      >
                        <Trash2 size={22} />
                      </button>

                      <div className="p-1 text-gray-300">
                        <Menu size={20} />
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>

                <label className="w-full py-10 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-[#1b3a8b] hover:border-[#1b3a8b]/30 hover:bg-[#1b3a8b]/5 transition-all cursor-pointer group">
                  <Plus size={40} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Adicionar Fotos</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleAddImage} />
                </label>

                <div className="mt-auto pt-6 flex flex-col gap-3">
                  <button 
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="w-full bg-[#1b3a8b] text-white font-black py-4 rounded-2xl shadow-xl active:scale-[0.98] transition-transform uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                  >
                    {isRefreshing ? <RefreshCcw size={18} className="animate-spin" /> : <CloudDownload size={18} />}
                    Baixar da Nuvem
                  </button>
                  <button 
                    onClick={saveToSupabase}
                    disabled={isSaving}
                    className="w-full bg-[#00a859] text-white font-black py-4 rounded-2xl shadow-xl active:scale-[0.98] transition-transform uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                  >
                    {isSaving ? <RefreshCcw size={18} className="animate-spin" /> : <CloudUpload size={18} />}
                    Salvar na Nuvem
                  </button>
                  <button 
                    onClick={() => setView('habilitacao')}
                    className="w-full bg-[#001a4b] text-white font-black py-4 rounded-2xl shadow-xl active:scale-[0.98] transition-transform uppercase tracking-widest text-xs"
                  >
                    Voltar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        {/* Image Zoom Modal */}
        <AnimatePresence>
          {selectedZoomPage !== null && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="fixed inset-0 z-[100] bg-[#f8f9fa]/95 flex flex-col items-center justify-center p-2 touch-none"
            >
              <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
                <motion.div 
                  drag
                  dragConstraints={{ left: -800, right: 800, top: -1000, bottom: 1000 }}
                  className="w-full h-full bg-[#f8f9fa] relative overflow-hidden flex items-center justify-center"
                  style={{ scale: zoomScale }}
                >
                  {/* Re-using the same page rendering logic but in the modal */}
                  {docPages[selectedZoomPage].content ? (
                    <img 
                      src={docPages[selectedZoomPage].content} 
                      alt="Zoomed" 
                      className="w-full h-full object-contain" 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-full aspect-[1/1.5] max-h-full relative shadow-sm">
                        {docPages[selectedZoomPage].id === 'front' && (
                          <div className="absolute inset-0 p-8 flex flex-col bg-[#e9f0ef]">
                             <div className="flex justify-between items-start border-b border-black/20 pb-4 mb-6">
                                <div className="text-[8px] font-bold tracking-tight leading-none text-gray-800 uppercase">
                                  República Federativa do Brasil<br/>
                                  Ministério dos Transportes<br/>
                                  Secretaria Nacional de Trânsito
                                </div>
                                <div className="w-8 h-8 rounded-full border border-black/40 flex items-center justify-center text-[8px] font-black">BR</div>
                             </div>
                             <div className="flex-1 flex flex-col gap-4">
                                <div className="flex gap-4">
                                  <div className="w-24 h-28 bg-gray-100 rounded border border-gray-200 flex items-center justify-center shadow-inner overflow-hidden">
                                      <UserRound size={60} className="text-gray-300" />
                                  </div>
                                  <div className="flex-1 text-[8px] font-mono flex flex-col gap-2.5 pt-2">
                                      <div className="border-b border-black/10 pb-1"><span className="text-gray-400 uppercase">Nome: </span>FERNANDO AUGUSTO...</div>
                                      <div className="border-b border-black/10 pb-1"><span className="text-gray-400 uppercase">CPF: </span>***.480.918-**</div>
                                      <div className="border-b border-black/10 pb-1"><span className="text-gray-400 uppercase">CAT: </span>AB</div>
                                  </div>
                                </div>
                                <div className="mt-8 flex-1 flex flex-col items-center justify-center">
                                  <QrCode size={120} className="text-[#001a4b]" strokeWidth={1} />
                                  <span className="text-[10px] mt-4 font-black text-gray-400 tracking-widest uppercase">Assinatura Digital</span>
                                </div>
                             </div>
                          </div>
                        )}
                        {docPages[selectedZoomPage].id === 'back' && (
                           <div className="absolute inset-0 p-8 flex flex-col bg-[#e9f0ef]">
                              <div className="border-b border-black/20 pb-4 mb-6">
                                 <div className="text-[8px] font-bold tracking-tight text-gray-800 uppercase">Observações / Filiação</div>
                              </div>
                              <div className="flex-1 text-[10px] font-mono flex flex-col gap-6">
                                 <div className="border-b border-black/10 pb-2"><span className="text-gray-400 uppercase">FILIAÇÃO:</span><br/>MARIA SILVA / JOÃO SANTOS</div>
                                 <div className="border-b border-black/10 pb-2"><span className="text-gray-400 uppercase">OBSERVAÇÕES:</span><br/>EXERCE ATIVIDADE REMUNERADA</div>
                              </div>
                           </div>
                        )}
                        {docPages[selectedZoomPage].id === 'qr' && (
                          <div className="absolute inset-0 p-12 flex flex-col items-center justify-center gap-8 bg-white">
                             <div className="text-center">
                                <h3 className="text-2xl font-black text-[#001a4b] tracking-tighter">QR CODE VIO</h3>
                             </div>
                             <QrCode size={250} className="text-[#001a4b]" strokeWidth={1} />
                          </div>
                        )}
                        {docPages[selectedZoomPage].id === 'photo' && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 bg-[#e9f0ef]">
                             <UserRound size={200} className="text-gray-400" />
                             <h3 className="mt-8 text-3xl font-black text-[#001a4b]">FERNANDO AUGUSTO</h3>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Close Button Only */}
              <div className="pb-12 pt-6 w-full flex justify-center">
                <button 
                  onClick={() => setSelectedZoomPage(null)}
                  className="bg-[#1b3a8b] text-white px-12 py-3.5 rounded-full font-black uppercase text-[10px] tracking-widest active:scale-95 transition-transform"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
      </div>
    </div>
  );
}

function DashboardCard({ 
  title, 
  subtitle, 
  highlight, 
  color, 
  icon, 
  textColor = "text-white",
  onClick 
}: { 
  title: string; 
  subtitle: string; 
  highlight: string; 
  color: string; 
  icon: React.ReactNode; 
  textColor?: string;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative w-full h-[110px] rounded-2xl ${color} ${textColor} p-4 flex flex-col justify-center overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.15)] group text-left`}
    >
      <div className="z-10 flex flex-col">
        <h3 className="font-black text-xl tracking-tight leading-tight">{title}</h3>
        <p className="text-sm font-medium opacity-90 mt-0.5 leading-tight max-w-[60%]">
          {subtitle}<br/>
          <span className="font-black">{highlight}</span>
        </p>
      </div>

      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
         <div className="relative">
            {/* Soft inner shadow clone for the icon */}
            <div className="absolute inset-0 blur-sm brightness-50 translate-y-1 opacity-40">
               {icon}
            </div>
            <div className="text-white drop-shadow-md">
               {icon}
            </div>
         </div>
      </div>
    </motion.button>
  );
}

function InfoItem({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[10px] text-gray-700 font-bold tracking-wider">{label}</p>
      <p className="font-bold text-black">{value}</p>
    </div>
  );
}

function ActionGridItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border-0 flex flex-col items-center justify-center py-3 px-2 gap-1.5 group transition-colors w-full"
    >
      <div className="text-[#001a4b] transition-transform group-hover:scale-110 scale-95">
        {icon}
      </div>
      <span className="text-[11px] font-bold text-[#001a4b] text-center uppercase tracking-tight leading-tight">
        {label}
      </span>
    </motion.button>
  );
}

function OptionButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center gap-6 bg-white w-full rounded-2xl shadow-[0_12px_25px_-6px_rgba(0,0,0,0.25)] text-[#001a4b] font-black text-left active:bg-gray-50 transition-all touch-manipulation p-7 text-base sm:text-lg"
    >
      <span className="opacity-80 scale-125">{icon}</span>
      <span className="flex-1 truncate uppercase tracking-tight leading-none">{label}</span>
    </motion.button>
  );
}
