                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    # Manual Técnico - NetSecure Sim

## 1. Introducción
**NetSecure Sim** es una plataforma de simulación de redes segura diseñada para entornos educativos y pequeñas empresas. Este documento detalla los aspectos técnicos para el despliegue, mantenimiento y extensión del sistema.

## 2. Requisitos del Sistema

### Entorno de Desarrollo
- **Sistema Operativo**: Windows 10/11, macOS, o Linux.
- **Node.js**: Versión 20.x o superior.
- **.NET SDK**: Versión 10.0 (Preview/RC).
- **Docker Desktop**: Para la gestión de contenedores PostgreSQL.
- **Git**: Para control de versiones.

### Entorno de Producción (Servidor)
- **Runtime**: ASP.NET Core Runtime 10.
- **Base de Datos**: PostgreSQL 18.
- **Frontend**: Servidor web estático (Nginx/Apache) o Electron (Desktop).

## 3. Instalación y Despliegue

### 3.1 Clonado y Configuración Inicial
```bash
git clone https://github.com/usuario/netsecure-sim.git
cd netsecure-sim
```

### 3.2 Base de Datos
El proyecto utiliza Docker Compose para levantar PostgreSQL.
```bash
cd backend
docker-compose up -d db
```
Esto iniciará PostgreSQL en el puerto `5432` con usuario `netsecure` y contraseña `netsecure_secret`.

### 3.3 Backend (.NET API)
```bash
cd backend/NetSecure.Api
dotnet restore
dotnet run
```
La API estará disponible en `http://localhost:5009`. Swagger UI en `/swagger`.

### 3.4 Frontend (React/Electron)
```bash
cd Frontend
npm install
npm run dev
```

## 4. Estructura de la Base de Datos

### Diagrama ER Simplificado
- **Users**: `id, username, password_hash, role`
- **Vlans**: `id, vlan_id, name, subnet`
- **Devices**: `id, name, ip, type, vlan_id (FK)`
- **AclRules**: `id, src_vlan_id, dst_vlan_id, protocol, action, priority`
- **TrafficLogs**: `id, timestamp, src_device, dst_device, protocol, result, reason`

## 5. Endpoints de la API

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Iniciar sesión y obtener JWT | No |
| GET | `/api/network/topology` | Obtener VLANs y Dispositivos | Sí |
| GET | `/api/firewall/rules` | Listar reglas ACL | Sí |
| POST | `/api/firewall/rules` | Crear regla ACL | Sí |
| DELETE | `/api/firewall/rules/{id}` | Eliminar regla ACL | Sí |
| POST | `/api/simulation` | Simular tráfico (Motor C#) | No |
| GET | `/api/logs` | Obtener historial de simulaciones | Sí |

## 6. Integración con IA
El sistema utiliza un patrón de **Estrategia** para el análisis de seguridad:
1. **Ollama Service**: Se conecta a `http://localhost:11434` para usar modelos locales (phi4-mini). Prioridad alta.
2. **Gemini Service**: Se conecta a Google Cloud Vertex AI/Gemini API si Ollama falla.
3. **Unified Analyzer**: Orquesta la llamada y formatea la respuesta en Markdown.

## 7. Solución de Problemas Comunes

- **Error de conexión DB**: Verificar que el contenedor Docker `netsecure_db` esté corriendo (`docker ps`).
- **Error CORS**: Verificar que `appsettings.Development.json` permita el origen del frontend (`http://localhost:3000`).
- **Error IA**: Asegurar que Ollama esté corriendo (`ollama serve`) o que la `GEMINI_API_KEY` esté configurada en `.env.local`.
