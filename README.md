# NetSecure Sim

<div align="center">

![NetSecure Sim Banner](https://img.shields.io/badge/NetSecure-Sim-blue?style=for-the-badge&logo=shield&logoColor=white)

**Simulador de Segmentación y Seguridad de Red (VLANs + UTM)**

[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)](https://react.dev/)
[![.NET](https://img.shields.io/badge/.NET-10-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![Electron](https://img.shields.io/badge/Electron-Desktop-47848F?logo=electron)](https://www.electronjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18.1-4169E1?logo=postgresql)](https://www.postgresql.org/)

</div>

---

## 📋 Descripción

**NetSecure Sim** es una aplicación de escritorio para simular y diseñar redes seguras segmentadas. Desarrollada como proyecto de tesis para Ingeniería en Informática.

### Tema de Tesis
> *"Diseño y Simulación de una Red Segura Segmentada mediante VLANs, ACLs y Firewall UTM para una Pequeña Empresa"*

---

## ✨ Características

| Característica | Descripción |
|----------------|-------------|
| 🖧 **VLANs** | Visualización y gestión de redes virtuales segmentadas |
| 🛡️ **ACLs** | Reglas de control de acceso (PERMIT/DENY) editables |
| 🔥 **Firewall UTM** | IPS, Antivirus y Web Filter simulados |
| 📊 **Simulación** | Pruebas de tráfico TCP/UDP/ICMP entre dispositivos |
| 🧠 **Análisis IA** | Evaluación de seguridad con Gemini o Ollama (phi4-mini) |
| 🌐 **i18n** | Soporte multiidioma (Español/Inglés) |
| 🔐 **Autenticación** | Login con roles (Administrador/Técnico) |
| 💾 **Offline** | Funciona sin conexión a internet |

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                 ELECTRON (App Desktop)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              FRONTEND (React + Vite + i18n)            │ │
│  │  Login → Dashboard → VLANs → ACLs → Simulador → Logs   │ │
│  └────────────────────────┬───────────────────────────────┘ │
│                           │ REST API + JWT                   │
│  ┌────────────────────────┴───────────────────────────────┐ │
│  │              BACKEND (.NET 10 Minimal API)              │ │
│  └────────────────────────┬───────────────────────────────┘ │
└───────────────────────────┼─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                  PostgreSQL 18.1 (Docker)                    │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚀 Requisitos Previos

- **Node.js** 20+ 
- **.NET SDK** 10
- **Docker Desktop** (para PostgreSQL)
- **Ollama** (opcional, para IA offline)

---

## 📦 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/netsecure-sim.git
cd netsecure-sim
```

### 2. Instalar dependencias del frontend
```bash
cd Frontend
npm install
```

### 3. Configurar variables de entorno
Editar `Frontend/.env.local`:
```env
GEMINI_API_KEY=tu_api_key_aqui
```

### 4. Iniciar PostgreSQL con Docker
```bash
cd backend
docker-compose up -d db
```

### 5. Iniciar el backend
```bash
cd backend/NetSecure.Api
dotnet run
```

### 6. Iniciar el frontend (desarrollo)
```bash
cd Frontend
npm run dev
```

### 7. Iniciar como aplicación de escritorio
```bash
cd Frontend
npm run electron:dev
```

---

## 🎮 Uso

### Credenciales de Acceso

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| `CENV` | `8994C` | Administrador |

### Permisos por Rol

| Acción | Técnico | Admin |
|--------|:-------:|:-----:|
| Ver topología | ✅ | ✅ |
| Simular tráfico | ✅ | ✅ |
| Ver logs | ✅ | ✅ |
| Agregar dispositivos | ✅ | ✅ |
| Crear/eliminar VLANs | ❌ | ✅ |
| Crear/eliminar ACLs | ❌ | ✅ |
| Exportar reportes | ❌ | ✅ |

---

## 🧠 Análisis con IA

La aplicación soporta dos motores de IA:

| Motor | Requisito | Uso |
|-------|-----------|-----|
| **Ollama + phi4-mini** | Ollama instalado localmente | Offline (prioridad) |
| **Gemini API** | API Key configurada + Internet | Online (fallback) |

### Configurar Ollama
```bash
# Instalar Ollama
winget install Ollama.Ollama

# Descargar modelo phi4-mini
ollama pull phi4-mini

# Iniciar servidor
ollama serve
```

---

## 🛠️ Stack Tecnológico

### Frontend
- React 19
- Vite
- TypeScript
- Tailwind CSS
- i18next (internacionalización)
- Electron (app desktop)
- Lucide React (iconos)

### Backend
- .NET 10
- Minimal APIs
- Entity Framework Core
- JWT Authentication
- PostgreSQL 18.1

### IA
- Google Gemini API
- Ollama + phi4-mini

---

## 📁 Estructura del Proyecto

```
netsecure-sim/
├── Frontend/                 # Aplicación React + Electron
│   ├── electron/            # Configuración Electron
│   │   ├── main.js
│   │   └── preload.js
│   ├── components/          # Componentes React
│   │   ├── LoginPage.tsx
│   │   ├── VlanDisplay.tsx
│   │   ├── AclTable.tsx
│   │   ├── SimulationPanel.tsx
│   │   └── LanguageSelector.tsx
│   ├── contexts/            # Contextos React
│   │   └── AuthContext.tsx
│   ├── core/                # Lógica de negocio
│   │   ├── TrafficEngine.ts
│   │   └── strategies.ts
│   ├── hooks/               # Custom hooks
│   │   └── useNetworkSimulation.ts
│   ├── i18n/                # Traducciones
│   │   ├── index.ts
│   │   ├── es.json
│   │   └── en.json
│   ├── services/            # Servicios API
│   │   ├── aiService.ts
│   │   ├── ollamaService.ts
│   │   └── geminiService.ts
│   ├── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                  # Backend .NET 10
│   ├── NetSecure.Api/
│   │   ├── Data/            # DbContext
│   │   ├── Models/          # Entidades y DTOs
│   │   ├── Services/        # Servicios
│   │   └── Program.cs       # Entry point
│   ├── docker-compose.yml
│   └── Dockerfile
│
└── README.md
```

---

## 🔧 Scripts Disponibles

```bash
# Frontend (desde carpeta Frontend/)
npm run dev              # Frontend en modo desarrollo
npm run electron:dev     # Electron + React
npm run build            # Build del frontend
npm run electron:build   # Build ejecutable

# Backend (desde carpeta backend/NetSecure.Api/)
dotnet run               # Iniciar API .NET

# Docker (desde carpeta backend/)
docker-compose up -d db  # Iniciar solo PostgreSQL
```

---

## 📄 Licencia

Este proyecto es parte de una tesis universitaria.

---

## 👤 Autor

Desarrollado para la carrera de **Ingeniería en Informática**

---

<div align="center">

**NetSecure Sim** - Simulador de Segmentación y Seguridad de Red (VLANs + UTM)

</div>
