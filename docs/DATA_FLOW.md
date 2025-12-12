# Diagramas de Flujo de Datos (DFD) - NetSecure Sim

## 1. DFD Nivel 0 (Diagrama de Contexto)

Representa la interacción del sistema completo con entidades externas.

```mermaid
graph TD
    User[Usuario (Admin/Técnico)]
    System((NetSecure Sim))
    AI_Engine[Motor IA Ext.]
    
    User -- "Credenciales, Configuración, Comandos" --> System
    System -- "Logs, Reportes, Estado Visual" --> User
    
    System -- "Contexto de Red (JSOSON)" --> AI_Engine
    AI_Engine -- "Análisis de Vulnerabilidades" --> System
```

## 2. DFD Nivel 1 (Diagrama de Nivel Superior)

Desglosa el sistema en sus principales subsistemas funcionales.

```mermaid
graph TD
    User[Usuario]
    
    P1((1.0 Autenticación))
    P2((2.0 Gestión Red))
    P3((3.0 Simulación))
    P4((4.0 Análisis IA))
    P5((5.0 Reportes/Logs))
    
    DS1[(Base de Datos Usuarios)]
    DS2[(Base de Datos Red/ACL)]
    DS3[(Base de Datos Logs)]
    
    %% Flujo 1: Auth
    User -->|Credenciales| P1
    P1 -->|Valida| DS1
    DS1 -->|Token JWT| P1
    P1 -->|Acceso Concedido| User
    
    %% Flujo 2: Gestión
    User -->|Define VLANs/ACLs| P2
    P2 -->|Guarda| DS2
    
    %% Flujo 3: Simulación
    User -->|Solicita Simulación| P3
    P3 -->|Lee Configuración| DS2
    P3 -->|Genera Resultado| P3
    P3 -->|Guarda Resultado| DS3
    P3 -->|Muestra Feedback| User
    
    %% Flujo 4: AI
    User -->|Solicita Análisis| P4
    DS2 -->|Lee Datos| P4
    P4 -->|Envía Contexto| ExtAI[Gemini/Ollama]
    ExtAI -->|Reporte| P4
    P4 -->|Muestra Recomendaciones| User
    
    %% Flujo 5: Logs
    User -->|Consulta Histórico| P5
    DS3 -->|Lee Logs| P5
    P5 -->|Listado Filtrado| User
```

## 3. Descripción de Procesos

### 1.0 Gestión de Autenticación
Recibe credenciales, verifica contra la base de datos de usuarios (con contraseñas hasheadas) y emite un token JWT que habilita el acceso a los demás procesos según el rol.

### 2.0 Gestión de Configuración de Red
Permite al Administrador definir la topología (VLANs, Dispositivos) y las reglas de seguridad (ACLs). Estos datos son persistentes y críticos para la simulación.

### 3.0 Motor de Simulación
El núcleo del sistema. Toma un paquete simulado (Origen, Destino, Protocolo), atraviesa la lógica de ruteo y firewall definida en la configuración, aplica reglas UTM probabilísticas, y determina si el tráfico pasa o se bloquea.

### 4.0 Análisis con IA
Extrae la configuración actual en formato JSON y la envía a un LLM (Modelo de Lenguaje) para que identifique posibles conflictos, brechas de seguridad o mejoras de optimización en las ACLs.

### 5.0 Gestión de Logs
Almacena cada evento de simulación para auditoría futura, permitiendo revisar qué tráfico fue permitido o bloqueado históricamente.
