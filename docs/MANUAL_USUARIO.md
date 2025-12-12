# Manual de Usuario - NetSecure Sim

## 1. Acceso al Sistema

1. Abra la aplicación de escritorio **NetSecure Sim**.
2. En la pantalla de inicio de sesión, introduzca sus credenciales:
   - **Usuario**: `CENV`
   - **Contraseña**: `8994C`
3. Haga clic en **Acceso Seguro**.

> **Nota**: Si es la primera vez que ingresa, asegúrese de tener permisos de Administrador para configurar la red.

## 2. Pantalla Principal

La interfaz se divide en dos secciones principales:
- **Panel Izquierdo (Visualización y Configuración)**: Muestra las VLANs, dispositivos y la tabla de reglas de Firewall.
- **Panel Derecho (Control y Logs)**: Controles de simulación, configuración UTM y consola de registros.

## 3. Gestión de Reglas de Firewall (ACLs)

Para permitir o bloquear tráfico entre segmentos de red:
1. Ubique la sección **Políticas de Firewall (ACLs)** en el panel izquierdo.
2. Complete el formulario superior:
   - **Origen**: Seleccione la VLAN desde donde sale el tráfico.
   - **Destino**: Seleccione la VLAN a donde va el tráfico.
   - **Protocolo**: TCP, UDP, ICMP o ANY.
   - **Acción**: `PERMITIR` (Verde) o `BLOQUEAR` (Rojo).
   - **Descripción**: Escriba un motivo breve.
3. Haga clic en el botón **+ (Agregar)**.
4. La regla aparecerá en la tabla y se guardará automáticamente en la base de datos.
5. Para eliminar una regla, haga clic en el icono de papelera a la derecha de la fila.

## 4. Simulación de Tráfico

Para probar la seguridad de su red:
1. En el panel derecho (**Simulación de Tráfico**):
   - Seleccione el **Dispositivo Origen** (ej. Admin-PC).
   - Seleccione el **Dispositivo Destino** (ej. WebServer).
   - Elija el **Protocolo** (ej. TCP).
2. Configure las opciones **UTM (Unified Threat Management)** si desea simular amenazas:
   - `IPS`: Prevenión de Intrusos.
   - `Antivirus`: Detección de malware.
   - `Web Filter`: Filtrado de contenido web.
3. Haga clic en el botón grande **SIMULAR TRÁFICO**.
4. Observe el resultado en la **Consola de Logs** en la parte inferior derecha:
   - ✅ **SUCCESS**: Tráfico permitido.
   - ❌ **BLOCKED**: Bloqueado por Firewall/ACL.
   - ⚠️ **UTM_BLOCKED**: Bloqueado por módulos de seguridad (Virus/Ataque).
5. El sistema simulará el viaje del paquete a través de la red y aplicará todas las reglas configuradas.

## 5. Análisis Inteligente (IA)

Si tiene dudas sobre su configuración de seguridad:
1. Haga clic en el botón **Análisis IA** en la barra superior (color violeta).
2. El sistema enviará su topología y reglas actuales al motor de IA.
3. Espere unos segundos mientras se procesa la información.
4. Se abrirá una ventana con un reporte detallado:
   - Vulnerabilidades detectadas.
   - Reglas redundantes o peligrosas (ej. "ANY/ANY ALLOW").
   - Recomendaciones de mejores prácticas.

## 6. Cerrar Sesión

Para salir del sistema, haga clic en el icono de "Salida" (puerta) en la esquina superior derecha, junto a su nombre de usuario.
