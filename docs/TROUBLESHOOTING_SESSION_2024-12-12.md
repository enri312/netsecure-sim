# NetSecure Sim - Sesión de Troubleshooting
**Fecha:** 2024-12-12

## Problemas Encontrados

### 1. Aplicación Electron se "cerraba" al iniciar
**Causa:** La ventana tenía `show: false` y esperaba `ready-to-show`. Si Vite no estaba listo, la ventana nunca se mostraba.

**Solución:** Modificado `Frontend/electron/main.cjs`:
- Cambiado a `show: true`
- Agregado sistema de reintentos automáticos (10 intentos, 2s cada uno)
- Pantalla de carga mientras espera al servidor
- Pantalla de error amigable si falla

### 2. Error de compilación Backend .NET
**Causa:** Un proceso anterior de dotnet seguía corriendo y bloqueaba los archivos.

**Solución:**
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*dotnet*"} | Stop-Process -Force
dotnet build
```

### 3. VLANs y dispositivos no se cargan
**Causa:** El frontend tiene una sesión guardada en `localStorage` con un token inválido.

**Diagnóstico:**
- Backend responde correctamente en `http://localhost:5009/api/health` → "Healthy"
- Los datos EXISTEN en la base de datos PostgreSQL (4 VLANs confirmadas)
- El endpoint `/api/network/topology` retorna 401 porque el token no es válido

**Solución:**
1. Abrir DevTools (ahora habilitadas en `main.cjs`)
2. Ir a Application → Local Storage → `http://localhost:3000`
3. Borrar `netsecure_auth`
4. Refrescar (F5)
5. Login con: **Usuario:** `CENV` / **Contraseña:** `8994C`

---

## Estado Actual del Proyecto

### Backend (.NET 10)
- ✅ Compilando correctamente
- ✅ Corriendo en `http://localhost:5009`
- ✅ Base de datos PostgreSQL conectada
- ✅ Datos seed cargados (VLANs, Devices, ACLs)

### Frontend (React + Electron)
- ✅ Vite corriendo en `http://localhost:3000`
- ✅ Electron mostrando la app
- ⚠️ Sesión anterior corrupta en localStorage (necesita limpiarse)

### Base de Datos (PostgreSQL 18)
- ✅ Contenedor Docker corriendo (`netsecure_db`)
- ✅ Tablas creadas con migraciones
- ✅ Datos seed:
  - 1 Usuario (CENV/8994C)
  - 4 VLANs (Admin, Ventas, IoT, DMZ)
  - 5 Dispositivos
  - 3 Reglas ACL

---

## Comandos Útiles

```bash
# Iniciar todo el proyecto
npm start

# Solo base de datos
cd backend && docker-compose up -d

# Ver logs del backend
cd backend/NetSecure.Api && dotnet run

# Verificar tablas en PostgreSQL
docker exec netsecure_db psql -U netsecure -d netsecure_sim -c 'SELECT * FROM "Vlans";'

# Limpiar localStorage (ejecutar en consola del navegador)
localStorage.clear()
```

---

## Próximos Pasos
1. Limpiar localStorage y hacer login correcto
2. Verificar que las VLANs se muestren
3. Probar simulación de tráfico
