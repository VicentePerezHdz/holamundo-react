# Hola Mundo · React 18 + TypeScript

[![CI](https://github.com/VicentePerezHdz/holamundo-react/actions/workflows/ci.yml/badge.svg)](https://github.com/VicentePerezHdz/holamundo-react/actions/workflows/ci.yml) [![Licencia: MIT](https://img.shields.io/badge/licencia-MIT-blue.svg)](LICENSE)

Frontend en React con Vite. Tiene tres funciones: saludo con input de texto, calculadora y combobox con mensaje.

## Qué demuestra
- Hooks, incluido uno propio (`useLenguajes`).
- Rutas con React Router.
- Estado global con Context + `useReducer` (historial).
- Accesibilidad con roles y etiquetas.
- Pruebas con Vitest y React Testing Library.

## Cómo correrlo
Consume la API del proyecto **holamundo-netcore-angular** en `http://localhost:5080`. La URL se cambia en `.env` (`VITE_API_URL`).

```powershell
cd holamundo-react
npm install
npm run dev     # http://localhost:5173
npm test        # 6 pruebas (no necesitan la API)
npm run build
npm run lint
```

La explicación completa está en [`docs/Documento_Transicion.md`](docs/Documento_Transicion.md).

## Licencia

[MIT](LICENSE)
