# Diagramas de Casos de Uso - NetSecure Sim

## 1. Diagrama General de Casos de Uso

```mermaid
usecaseDiagram
    actor "Administrador" as Admin
    actor "Técnico" as Tech
    actor "Sistema IA (Gemini/Ollama)" as AI

    package "NetSecure Sim" {
        usecase "Iniciar Sesión" as UC1
        usecase "Visualizar Topología" as UC2
        usecase "Simular Tráfico" as UC3
        usecase "Gestionar VLANs" as UC4
        usecase "Configurar ACLs" as UC5
        usecase "Configurar UTM (IPS/AV)" as UC6
        usecase "Consultar Logs" as UC7
        usecase "Analizar Seguridad con IA" as UC8
        usecase "Gestionar Usuarios" as UC9
    }

    %% Relaciones Admin
    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9

    %% Relaciones Técnico
    Tech --> UC1
    Tech --> UC2
    Tech --> UC3
    Tech --> UC6
    Tech --> UC7
    Tech --> UC8

    %% Relaciones IA
    UC8 ..> AI : <<include>>
    
    %% Herencia
    Admin --|> Tech : "Es un"
```

## 2. Especificación de Actores

| Actor | Descripción | Permisos |
|-------|-------------|----------|
| **Administrador** | Usuario con control total del sistema. | Gestión de usuarios, VLANs, ACLs, Configuración completa. |
| **Técnico** | Usuario operativo encargado de pruebas y monitoreo. | Simulación, visualización, logs, activación temporal de funciones UTM. |
| **Sistema IA** | Agente externo (Gemini/Ollama) que provee análisis. | Procesa la configuración (JSON) y devuelve recomendaciones. |

## 3. Detalles de Casos de Uso Críticos

### UC3: Simular Tráfico
- **Actor Principal**: Técnico / Administrador
- **Precondición**: Usuario autenticado y topología cargada.
- **Flujo Principal**:
  1. Usuario selecciona dispositivo origen.
  2. Usuario selecciona dispositivo destino.
  3. Usuario selecciona protocolo (TCP/UDP/ICMP).
  4. Usuario inicia simulación.
  5. Sistema evalúa reglas (VLANs, ACLs, UTM).
  6. Sistema muestra resultado (Permitido/Bloqueado) y guarda Log.

### UC5: Configurar ACLs
- **Actor Principal**: Administrador
- **Precondición**: Usuario autenticado como Admin.
- **Flujo Principal**:
  1. Admin selecciona "Agregar Regla".
  2. Define VLAN Origen y Destino.
  3. Define Protocolo y Acción (Permitir/Bloquear).
  4. Guarda la regla.
  5. Sistema actualiza la base de datos y la aplica inmediatamente.

### UC8: Analizar Seguridad con IA
- **Actor Principal**: Administrador / Técnico
- **Flujo Principal**:
  1. Usuario hace clic en "Análisis IA".
  2. Sistema recopila configuración actual (VLANs + ACLs).
  3. Sistema envía prompt al motor IA seleccionado (Local/Cloud).
  4. IA procesa y devuelve reporte de vulnerabilidades.
  5. Sistema muestra reporte en modal.
