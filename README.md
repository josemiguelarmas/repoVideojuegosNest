# Taller NestJS — Tienda de Videojuegos

API REST construida con NestJS, TypeORM y SQLite. Incluye autenticación JWT y operaciones CRUD con lógica de dominio.

## Requisitos

- Node.js v20 o superior
- npm

## Instalación

```bash
npm install
```

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
JWT_SECRET=un_secreto_largo_y_seguro
```

## Correr en desarrollo

```bash
npm run start:dev
```

La API queda disponible en `http://localhost:3000`.

## Correr en producción

```bash
npm run build
npm run start
```

## Pruebas

```bash
# Correr todos los tests una vez
npm run test

# Modo watch (re-corre al guardar)
npm run test:watch

# Con reporte de cobertura
npm run test:cov
```

## Endpoints principales

### Auth
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/auth/login` | Login, devuelve JWT | No |

### Users
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/users` | Registrar usuario | No |
| GET | `/users` | Listar usuarios | Sí |
| GET | `/users/:id` | Obtener usuario | Sí |
| PATCH | `/users/:id` | Actualizar usuario | Sí |
| DELETE | `/users/:id` | Eliminar usuario | Sí |

### Games
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/games` | Crear juego | Sí |
| GET | `/games` | Listar todos | No |
| GET | `/games?order=ASC` | Listar ordenados por precio | No |
| GET | `/games/available` | Juegos disponibles | No |
| GET | `/games/sold` | Juegos vendidos | No |
| GET | `/games/genre/:genre` | Filtrar por género | No |
| GET | `/games/platform/:platform` | Filtrar por plataforma | No |
| GET | `/games/owner/:ownerId` | Juegos de un usuario | Sí |
| GET | `/games/:id` | Obtener juego | No |
| POST | `/games/:gameId/purchase/:userId` | Comprar juego | Sí |
| PATCH | `/games/:id/unavailable` | Marcar no disponible | Sí |
| PATCH | `/games/:id` | Actualizar juego | Sí |
| DELETE | `/games/:id` | Eliminar juego | Sí |

Para endpoints protegidos, incluir en el header:
```
Authorization: Bearer <token>
```