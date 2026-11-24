# HUELLA DIGITAL: Piensa antes de publicar

Página web educativa interactiva sobre ciudadanía digital, identidad, privacidad, consentimiento y responsabilidad en redes sociales, diseñada para grado undécimo del **Colegio Diego Montaña Cuéllar IED** (Usme, Bogotá D. C.).

## Requisitos previos

- Node.js 20 o superior
- npm 10 o superior

## Ejecución local

```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Compilación para producción

```bash
npm run build
```

Genera la carpeta estática optimizada en `dist/` junto con las ilustraciones en `dist/src/assets/images/` y el favicon en `dist/favicon.svg`.

## Despliegue en Vercel

### Opción 1: Desde GitHub (recomendada)

1. Sube este repositorio a GitHub, GitLab o Bitbucket.
2. Ingresa a [vercel.com](https://vercel.com) y selecciona **Add New Project**.
3. Importa el repositorio; Vercel detectará automáticamente el archivo `vercel.json` (`Vite`, comando `npm run build` y salida `dist`).
4. Haz clic en **Deploy**.

### Opción 2: Con Vercel CLI

```bash
npm i -g vercel
vercel
vercel --prod
```

## Rutas de la aplicación

El archivo `vercel.json` incluye reescritura SPA para que todas las rutas limpias funcionen directamente o al recargar el navegador:

- `/` — Inicio, reflexión inicial y caso central
- `/modulos` — Ruta interactiva de seis módulos
- `/modulo/1` a `/modulo/6` — Desarrollo en nueve momentos de cada módulo
- `/desafio-final` — Actividad integradora final
- `/mis-creaciones` — Portafolio digital e impresión/guardado en PDF
- `/recursos` — Glosario, derechos digitales, preguntas frecuentes y fuentes
- `/acerca` — Información institucional y reinicio de progreso local
- `/cierre` — Pantalla de cierre del recorrido

> **Nota sobre privacidad:** Las respuestas y materiales creativos se almacenan únicamente de forma local en el navegador (`localStorage`), sin cuentas de usuario ni variables de entorno privadas requeridas.
