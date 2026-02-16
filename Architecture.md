# Arquitectura del Sistema - Lab PBM Senasa

Este documento describe la arquitectura técnica, las tecnologías empleadas y la estructura del proyecto **lab_pbm_senasa**, con un enfoque en el desarrollo y despliegue local.

## 1. Visión General
El sistema sigue una arquitectura moderna de **Single Page Application (SPA)** desacoplada. Aunque está diseñado para ser compatible con plataformas Serverless como Vercel, el entorno de desarrollo local está completamente configurado para funcionar de manera autónoma utilizando un servidor Express personalizado.

- **Frontend**: React + TypeScript + Vite
- **Backend**: Servidor Express (Local) / API Serverless (Producción)
- **Base de Datos**: PostgreSQL
- **Conexión Externa**: Proxy reverso para API de Unipago

---

## 2. Tecnologías Clave

### Frontend (Presentación)
- **Framework**: `React 19`
- **Lenguaje**: `TypeScript`
- **Build Tool**: `Vite` (Optimizado para desarrollo rápido)
- **Estilos**: `Tailwind CSS 4`
- **Routing**: `React Router DOM 7`
- **Gestión de Estado**: `Context API`
- **Iconografía**: `Lucide React`

### Backend (Lógica y Datos)
- **Runtime**: `Node.js`
- **Servidor Local**: `Express` (emula el comportamiento de funciones serverless y maneja rutas de API)
- **Base de Datos**: `PostgreSQL` (driver `pg`)
- **Seguridad**:
    - `JWT`: Manejo de sesiones sin estado.
    - `bcryptjs`: Hashing seguro de contraseñas.

---

## 3. Estructura del Proyecto

### 📂 `/src` (Frontend)
El código fuente del cliente está organizado siguiendo principios de arquitectura limpia:

- **`presentation/`**: Componentes visuales y páginas.
    - `components/`: Elementos de UI reutilizables.
    - `pages/`: Vistas completas de la aplicación.
    - `hooks/`: Lógica encapsulada de React.
- **`domain/`**: Reglas de negocio y definiciones de tipos.
    - `models/`: Interfaces de TypeScript (ej: `User`, `Authorization`).
    - `usecases/`: Lógica de negocio pura.
- **`data/`**: Capa de acceso a datos e infraestructura.
    - `infrastructure/`: Clientes HTTP y de base de datos.
    - `repositories/`: Implementaciones concretas de acceso a datos.
- **`server/`**: **Servidor de Desarrollo Local**.
    - `index.ts`: Punto de entrada del servidor Express que permite ejecutar la API completa (incluyendo proxies y endpoints) en tu máquina local sin depender de servicios en la nube para la ejecución del código.

### 📂 `/api` (Backend)
Esta carpeta contiene la lógica de los endpoints de la API. En producción (Vercel) cada archivo es una función independiente. En local, el servidor Express (`src/server/index.ts`) importa y utiliza esta lógica o la replica para garantizar paridad.

- **`_lib/db.ts`**: Cliente de base de datos optimizado.
- **`login.ts`**: Autenticación de usuarios.
- **`proxy.ts`**: Middleware crítico que maneja la comunicación con Unipago (Senasa) resolviendo problemas de CORS y ocultando credenciales sensibles.
- **`authorizations/`**: Endpoints para crear y anular autorizaciones.

### 📂 `/database`
Scripts de gestión de base de datos:
- **`migrations/`**: Archivos SQL secuenciales para versionar el esquema de la base de datos.

---

## 4. Flujos Clave (Entorno Local)

### Ejecución Local (`npm run dev`)
Al ejecutar el comando de desarrollo, se inician simultáneamente:
1.  **Vite Server**: Sirve el frontend y habilita Hot Module Replacement (HMR).
2.  **Express Server (`src/server/index.ts`)**: Levanta una API local en el puerto 3001.

### Proxy de Unipago
El sistema incluye un proxy local para comunicarse con la API de Senasa.
1.  El frontend hace una petición a `/api/unipago/...` (en local).
2.  El servidor Express intercepta esta ruta.
3.  El servidor (backend) hace la petición real a `http://186.148.93.132/MedicamentosUnipago/...`.
4.  Esto evita errores de **CORS** que ocurrirían si el navegador intentara conectar directamente con Senasa.

---

## 5. Configuración Local Recomendada

Para trabajar de forma local, asegúrate de tener un archivo `.env` en la raíz con las siguientes variables configuradas:

```env
# Base de Datos
DATABASE_URL=postgresql://usuario:password@host:port/database?sslmode=require

# Seguridad
JWT_SECRET=tu_secreto_super_seguro

# Integración Senasa (Unipago)
VITE_SENASA_BASE_URL=http://186.148.93.132/
VITE_SENASA_USERNAME=tu_usuario
VITE_SENASA_PASSWORD=tu_password
```
