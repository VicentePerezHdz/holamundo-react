# Documento de transición: Hola Mundo React 18 + .NET 8

> Manual para entender qué se construyó, cómo se comunican React y .NET, y qué hace cada componente, hook y función.
> Fecha: 2026-11-23 · Ruta: `C:\HolaMundo\05-React\holamundo-react`
> Backend: **el mismo** de `C:\HolaMundo\01-NetCore-Angular\backend`. React y Angular son dos frentes distintos para una sola API.

## 1. Qué hace la aplicación

Tres pantallas con su propia URL y un panel de historial que se conserva al navegar:

| Ruta | Control | Llamada HTTP | Qué hace .NET |
|---|---|---|---|
| `/saludo` | input de texto + botón | `POST /api/saludo` | valida y arma el saludo |
| `/calculadora` | 2 inputs numéricos + select | `POST /api/calculadora` | calcula; 400 si divides entre 0 |
| `/combo` | select llenado desde la API | `GET /api/catalogos/lenguajes` | devuelve las opciones |
| (todas) | panel **Historial** | — | estado global en el navegador (Context + useReducer) |

## 2. Cómo correrlo

```powershell
# Terminal 1: la API (la misma del proyecto 01)
cd C:\HolaMundo\01-NetCore-Angular\backend\HolaMundo.Api
dotnet run --launch-profile http          # http://localhost:5080

# Terminal 2: React
cd C:\HolaMundo\05-React\holamundo-react
npm install                               # solo la primera vez
npm run dev                               # http://localhost:5173
```

Otros comandos:

```powershell
npm test          # 6 pruebas con Vitest + React Testing Library (no necesitan la API)
npm run build     # compila TypeScript y genera dist/ para producción
npm run lint      # ESLint con reglas de hooks
```

El puerto 5173 ya está permitido en `Cors:Origenes` de `appsettings.json` de la API (verificado: responde `Access-Control-Allow-Origin: http://localhost:5173`).

## 3. Arquitectura

```
┌────────────────────────────── Navegador (localhost:5173) ───────────────────────────────┐
│ main.tsx:  <StrictMode> → <BrowserRouter> → <HistorialProvider> → <App/>                  │
│                                                                                           │
│ App ── <nav> NavLink ──► <Routes>                                                         │
│   │                       ├─ /saludo ───────► Saludo ─────────┐                           │
│   │                       ├─ /calculadora ──► Calculadora ────┼─► holaMundoApi (fetch) ─┐ │
│   │                       └─ /combo ────────► ComboLenguajes  │                         │ │
│   │                                             └─ useLenguajes (hook) ─┘               │ │
│   └─ Historial ◄── useHistorial() ◄── HistorialContext (useReducer) ◄── agregar(...)    │ │
│                  Mensaje: componente presentacional (role=status / role=alert)          │ │
└─────────────────────────────────────────────────────────────────────────────────────────┼─┘
                                         JSON por HTTP + CORS                            │
┌──────────────────────────── ASP.NET Core 8 (localhost:5080) ────────────────────────────▼─┐
│ Controllers → Services → ProblemDetails en errores (ver documento del proyecto 01)        │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

Capas en el frontend:

- **Contratos** (`api/contratos.ts`): tipos TS espejo de los records de C#.
- **Acceso a datos** (`api/holaMundoApi.ts`): el único que llama `fetch`; traduce ProblemDetails a texto.
- **Lógica reutilizable** (`hooks/`): hooks personalizados, como `useLenguajes`.
- **Estado global** (`estado/HistorialContext.tsx`): Context + reducer.
- **Presentación** (`componentes/`): componentes que pintan y reaccionan a eventos.
- **Composición y rutas** (`App.tsx`, `main.tsx`).

## 4. Recorrido de una petición (Calculadora, división entre cero)

1. El usuario va a `/calculadora`. React Router compara la URL y monta `<Calculadora/>`.
2. Elige `÷` en el select. `onChange` llama `setForm({ ...form, operacion: 'division' })`; React vuelve a ejecutar la función del componente (re-render) y el select muestra el valor nuevo.
3. Da clic en **Calcular**. El `<form>` dispara `onSubmit` → `calcular(e)`. `e.preventDefault()` evita que el navegador recargue la página.
4. `holaMundoApi.calcular({ a: 1, b: 0, operacion: 'division' })` hace `fetch POST http://localhost:5080/api/calculadora`.
5. .NET lanza `ReglaNegocioException`; el manejador global responde `400` con `{ "detail": "No se puede dividir entre cero." }`.
6. `pedir()` ve `resp.ok === false`, llama `aMensaje()` y lanza `ApiError` con el `detail`.
7. El `catch` del componente hace `setError(...)`; `<Mensaje>` pinta `<p role="alert">` en rojo y el lector de pantalla lo anuncia.

En éxito, además se llama `agregar('calculadora', r.expresion)` del contexto; el reducer crea un arreglo nuevo y **todos** los componentes que usan `useHistorial()` (el panel) se vuelven a pintar.

## 5. Inventario de archivos, componentes, hooks y funciones

| Archivo | Tipo | Miembros | Responsabilidad |
|---|---|---|---|
| `src/main.tsx` | entrada | `createRoot().render()` | Monta la app con `StrictMode`, `BrowserRouter` y `HistorialProvider` (como `Program.cs`) |
| `src/App.tsx` | componente raíz | `App` | Menú con `NavLink`, tabla de rutas, `Navigate` de `/` a `/saludo`, ruta `*` 404 |
| `src/api/contratos.ts` | tipos TS | `SaludoResponse`, `Operacion`, `CalculoRequest`, `CalculoResponse`, `OpcionCatalogo`, `ProblemDetails` | Forma del JSON (camelCase) |
| `src/api/holaMundoApi.ts` | módulo | `holaMundoApi.saludar/calcular/lenguajes`, `pedir<T>()`, `aMensaje()`, clase `ApiError` | Único punto HTTP; acepta `AbortSignal`; errores legibles |
| `src/hooks/useLenguajes.ts` | hook | devuelve `{ opciones, cargando, error }` | Carga al montar con `useEffect` y cancela con `AbortController` al desmontar |
| `src/estado/HistorialContext.tsx` | contexto | `historialReducer`, `HistorialProvider`, `useHistorial()`, tipos `EntradaHistorial`, `Accion` | Estado global de las últimas 10 acciones |
| `src/componentes/Saludo.tsx` | componente | `enviar()`; estados `nombre`, `mensaje`, `error`, `cargando` | Input controlado + POST |
| `src/componentes/Calculadora.tsx` | componente | `calcular()`; estado `form` (objeto) | Calculadora |
| `src/componentes/ComboLenguajes.tsx` | componente | `elegir()`; valor derivado `seleccion` | Combobox con mensaje |
| `src/componentes/Historial.tsx` | componente | — | Lee el contexto; botón Limpiar |
| `src/componentes/Mensaje.tsx` | componente presentacional | props `exito`, `error` | Éxito/error accesible |
| `src/index.css` | estilos | variables CSS, `.oculto`, `:focus-visible` | Diseño y accesibilidad |
| `src/test/App.test.tsx` | pruebas | 6 pruebas | Saludo OK, validación 400, división entre 0, combo, API caída, reducer |
| `src/test/setup.ts` | config pruebas | — | Matchers de jest-dom |
| `vite.config.ts` | config | puerto 5173, bloque `test` | Servidor, build y Vitest |
| `.env` | config | `VITE_API_URL` | URL de la API (como `environment.ts` en Angular) |

## 6. Conceptos clave

| Concepto | Dónde verlo | En una frase |
|---|---|---|
| Componente funcional | todos | Una función que recibe props y devuelve JSX |
| `useState` | `Saludo`, `Calculadora` | Estado local; cambiarlo provoca un re-render |
| Input controlado | `Saludo` | `value` + `onChange`: React es la única fuente de verdad |
| Estado inmutable | `setForm({ ...form, a })`, reducer | Nunca se modifica el objeto; se crea uno nuevo para que React detecte el cambio |
| `useEffect` + limpieza | `useLenguajes` | Efectos secundarios (HTTP) después de pintar; el `return` limpia al desmontar |
| Arreglo de dependencias | `useEffect(..., [])` | `[]` = solo al montar; `[x]` = cada vez que cambie `x` |
| Hook personalizado | `useLenguajes`, `useHistorial` | Reutilizar lógica con estado entre componentes |
| Reglas de los hooks | todos | Solo en el nivel superior, nunca dentro de `if` o ciclos |
| Context + `useReducer` | `HistorialContext` | Estado global sin pasar props por cada nivel (evita *prop drilling*) |
| Valor derivado | `seleccion` en `ComboLenguajes` | Si se puede calcular, no se guarda en otro estado |
| `key` en listas | `opciones.map(...)` | Le dice a React qué elemento es cuál entre renders |
| Routing | `App.tsx` | `Routes`/`Route`/`NavLink`/`Navigate`; navega sin recargar la página |
| `StrictMode` | `main.tsx` | En desarrollo ejecuta efectos dos veces para detectar efectos sin limpieza |
| Cancelación | `AbortController` | El equivalente de `CancellationToken` en .NET |
| Accesibilidad | `label htmlFor`, `role="alert"`, `aria-labelledby`, `:focus-visible`, `.oculto` | Usable con teclado y lector de pantalla |
| React Testing Library | `App.test.tsx` | Se prueba por lo que ve el usuario (`getByLabelText`, `getByRole`), no por la implementación |
| Doble de prueba | `vi.spyOn(globalThis, 'fetch')` | Se reemplaza fetch para no depender de la API |
| Depurar en el navegador | F12 → Network / Console; extensión React DevTools | Ver la petición, el CORS y el estado de cada componente |

### React vs Angular (mismo backend)

| Tema | Angular 17 (proyecto 01) | React 18 (este) |
|---|---|---|
| Estado local | `signal()` | `useState()` |
| Valor derivado | `computed()` | variable calculada en el render |
| Al iniciar | `ngOnInit` | `useEffect(..., [])` |
| HTTP | `HttpClient` + RxJS `Observable` | `fetch` + `Promise` / `async-await` |
| DI | `inject()` / `providedIn: 'root'` | módulos ES + Context |
| Plantillas | `@if`, `@for` | JSX con `? :` y `.map()` |
| Pruebas | Jasmine + `HttpTestingController` | Vitest + Testing Library + `vi.spyOn(fetch)` |

## 7. Paso a paso para volver a hacer el proyecto

1. `npm create vite@5 holamundo-react -- --template react-ts` → `cd holamundo-react` → `npm install`.
2. `npm install react-router-dom@6`.
3. `npm install -D vitest@2 jsdom@25 @testing-library/react@16 @testing-library/dom @testing-library/jest-dom @testing-library/user-event`.
4. Borra `App.css`, `assets/react.svg`, `public/vite.svg` y el contenido de `App.tsx`.
5. `vite.config.ts`: puerto 5173 y el bloque `test`. En `package.json` agrega `"test": "vitest run"`.
6. `.env` con `VITE_API_URL`.
7. `src/api/contratos.ts` → `src/api/holaMundoApi.ts`.
8. `src/estado/HistorialContext.tsx` y envuelve `<App/>` en `main.tsx` con `BrowserRouter` y `HistorialProvider`.
9. `src/componentes/Mensaje.tsx`, luego `Saludo`, `Calculadora`, `hooks/useLenguajes.ts` + `ComboLenguajes`, `Historial`.
10. Rutas en `App.tsx`.
11. `src/test/setup.ts` y `src/test/App.test.tsx` → `npm test`.
12. Levanta la API y `npm run dev`.

## 8. Plantilla para una HU nueva (ejemplo: "como usuario quiero despedirme")

1. Backend: igual que la sección 7 del documento del proyecto 01 (contrato, interfaz, servicio, endpoint, prueba).
2. `contratos.ts`: `DespedidaResponse`.
3. `holaMundoApi.ts`: `despedir(nombre, signal?)`.
4. Componente `componentes/Despedida.tsx` (copia la estructura de `Saludo`).
5. Ruta `/despedida` y su `NavLink` en `App.tsx`. Si va al historial, agrega `'despedida'` al tipo `origen`.
6. Prueba en `App.test.tsx` con `vi.spyOn(globalThis, 'fetch')`.
7. Documento de transición de la HU con las secciones 3, 4 y 5 de este archivo.

## 9. Problemas comunes

| Síntoma | Causa | Solución |
|---|---|---|
| "No hay conexión con la API" | la API no corre o usa otro puerto | `dotnet run --launch-profile http` (puerto 5080) |
| Error CORS en la consola | el origen no está permitido | agrega `http://localhost:5173` en `Cors:Origenes` |
| `Port 5173 is in use` | otra app de Vite abierta | ciérrala; `strictPort: true` evita que cambie de puerto sin avisar |
| El efecto se ejecuta dos veces en desarrollo | `StrictMode` | es intencional; por eso `useLenguajes` cancela con `AbortController` |
| `Can't perform a React state update on an unmounted component` | respuesta HTTP después de salir de la pantalla | cancela en la limpieza del `useEffect` |
| `import.meta.env.API_URL` es `undefined` | la variable no empieza con `VITE_` | renómbrala a `VITE_…` y reinicia `npm run dev` |
| Avisos "React Router Future Flag" | React Router 6 avisa cambios de la v7 | ya se activaron con `future={{ v7_startTransition, v7_relativeSplatPath }}` |
