# Arquitectura del Sistema - NetSecure Sim

## 1. Diagrama de Arquitectura (C4 - Nivel Contenedor)

```mermaid
C4Container
    title Diagrama de Contenedores - NetSecure Sim

    Person(user, "Usuario", "Administrador o Técnico de Redes")

    System_Boundary(c1, "NetSecure Sim App") {
        
        Container(frontend, "Frontend Desktop", "Electron + React + TypeScript", "Interfaz de usuario para simulación y gestión.")
        
        Container(api, "Backend API", ".NET 10 Minimal API", "Lógica de negocio, motor de simulación y autenticación.")
        
        ContainerDb(db, "Base de Datos", "PostgreSQL 18 (Docker)", "Almacena usuarios, configuraciones de red, ACLs y logs.")
        
    }

    System_Ext(ollama, "Ollama (Local AI)", "Motor de IA offline (phi4-mini) para análisis de seguridad.")
    System_Ext(gemini, "Gemini API (Cloud AI)", "Motor de IA online (Google) como respaldo.")

    Rel(user, frontend, "Interactúa con", "Mouse/Teclado")
    Rel(frontend, api, "Envía peticiones JSON (HTTPS)", "REST / JWT")
    Rel(api, db, "Lee/Escribe datos", "EF Core / Npgsql")
    
    Rel(frontend, ollama, "Solicita análisis (Prioridad)", "HTTP REST")
    Rel(frontend, gemini, "Solicita análisis (Fallback)", "REST API")
```

## 2. Diagrama de Componentes del Backend

```mermaid
classDiagram
    class Program {
        +Main()
        +MapEndpoints()
    }
    
    class TrafficEngine {
        +Simulate(request)
        -CheckUtm(features)
        -CheckAcls(rules)
    }
    
    class AuthService {
        +Login(creds)
        +GenerateToken(user)
    }
    
    class AppDbContext {
        +Users
        +Vlans
        +AclRules
        +TrafficLogs
    }
    
    Program --> AuthService : Uses
    Program --> TrafficEngine : Uses
    Program --> AppDbContext : DI Injection
    TrafficEngine ..> AppDbContext : Reads Rules (via Request)
```

## 3. Tecnologías Clave

### Frontend (Client-Side)
- **Framework**: React 19 con Vite.
- **Empaquetado**: Electron (para experiencia desktop nativa).
- **Estilos**: Tailwind CSS con diseño "Glassmorphism" y modo oscuro.
- **Internacionalización**: i18next (Español/Inglés).

### Backend (Server-Side)
- **Runtime**: .NET 10 (Preview/RC).
- **Arquitectura**: Minimal APIs (ligero y rápido).
- **ORM**: Entity Framework Core.
- **Seguridad**: JWT (JSON Web Tokens) con BCrypt para hashing.

### Infraestructura
- **Contenedores**: Docker Compose para orquestar la base de datos PostgreSQL.
- **IA**: Arquitectura híbrida (Local-First con Ollama, Cloud-Fallback con Gemini).
