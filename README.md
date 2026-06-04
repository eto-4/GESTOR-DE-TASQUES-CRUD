# Gestor de Tasques - API REST

Una API REST desenvolupada amb **Node.js**, **Express** i **MongoDB** per gestionar tasques. Inclou un sistema complet d'autenticació JWT avançat (Access + Refresh Token), gestió de rols jeràrquics amb herència de permisos, delegació de permisos temporals, rate limiting per rol i auditoria completa de totes les accions.

---

## 📦 Tecnologies

- Node.js
- Express
- MongoDB + Mongoose
- bcrypt
- jsonwebtoken
- express-validator
- express-rate-limit
- nodemailer
- Cloudinary
- Multer

---

## 📂 Estructura del projecte
task-manager-api/
│
├── config/
│   ├── cloudinary.js
│   └── multer.js
│
├── controllers/
│   ├── authController.js
│   ├── adminController.js
│   ├── taskController.js
│   ├── roleController.js
│   ├── permissionController.js
│   ├── auditController.js
│   ├── delegationController.js
│   ├── userController.js
│   └── uploadController.js
│
├── middleware/
│   ├── auth.js
│   ├── checkPermission.js
│   ├── auditMiddleware.js
│   ├── rateLimiter.js
│   ├── roleCheck.js
│   ├── uploadParser.js
│   └── validators/
│       ├── authValidators.js
│       ├── roleValidators.js
│       └── permissionValidators.js
│
├── models/
│   ├── Task.js
│   ├── User.js
│   ├── Role.js
│   ├── Permission.js
│   ├── AuditLog.js
│   ├── TokenBlacklist.js
│   ├── DelegatedPermission.js
│   └── PasswordReset.js
│
├── routes/
│   ├── authRoutes.js
│   ├── adminRoutes.js
│   ├── taskRoutes.js
│   ├── roleRoutes.js
│   ├── permissionRoutes.js
│   ├── auditRoutes.js
│   ├── userRoutes.js
│   ├── delegationRoutes.js
│   └── uploadRoutes.js
│
├── services/
│   ├── jwtService.js
│   ├── emailService.js
│   └── delegationService.js
│   └── LocalFileManager.js
│   └── CloudManager.js
│
├── utils/
│   ├── errorResponse.js
│   ├── fileUtils.js
│   ├── generateToken.js
│   ├── seedPermissions.js
│   └── seedRoles.js
│
├── .env.example
├── app.js
├── index.js
└── package.json

---

## ✅ Estat d'Implementació

| Funcionalitat | T7 | T8 | T9 |
|---|---|---|---|
| 🔐 Registre i login amb JWT | ✅ | ✅ | ✅ |
| 🔑 Middleware d'autenticació | ✅ | ✅ | ✅ |
| 👤 Gestió de perfil d'usuari | ✅ | ✅ | ✅ |
| 🛡️ Protecció de rutes de tasques | ✅ | ✅ | ✅ |
| 👑 Rols simples (user/admin) | ✅ | — | — |
| 🎨 Sistema de rols dinàmics | — | ✅ | ✅ |
| 🔐 Permisos granulars | — | ✅ | ✅ |
| 🌱 Rols i permisos per defecte | — | ✅ | ✅ |
| 👥 Assignació de múltiples rols | — | ✅ | ✅ |
| 📋 Auditoria d'accions | — | ✅ | ✅ |
| ✔️ Validacions d'entrada | ✅ | ✅ | ✅ |
| ❗ Gestió d'errors HTTP | ✅ | ✅ | ✅ |
| 🔒 Seguretat (bcrypt, JWT, .env) | ✅ | ✅ | ✅ |
| 📤 Pujada d'imatges (local/cloud) | ✅ | ✅ | ✅ |
| 🎫 Access + Refresh Token | — | — | ✅ |
| 🚫 Token Blacklist (logout segur) | — | — | ✅ |
| 🏛️ Jerarquia de rols amb herència | — | — | ✅ |
| 🤝 Delegació de permisos temporals | — | — | ✅ |
| ⚡ Rate limiting per rol | — | — | ✅ |
| 📧 Recuperació de contrasenya | — | — | ✅ |

---

## ⚙️ Instal·lació

1. Clona el repositori:
```bash
git clone https://github.com/usuari/nom-del-repo.git
cd nom-del-repo
```

2. Instal·la les dependències:
```bash
npm install
```

3. Copia el fitxer d'exemple i configura'l:
```bash
cp .env.example .env
```

4. Edita el fitxer `.env`:

PORT=3000
MONGO_URI=mongodb://localhost:27017/task-manager-db
JWT
JWT_SECRET=la_teva_clau_secreta_super_segura
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=una_clau_diferent_per_refresh_super_segura
Cloudinary
CLOUDINARY_CLOUD_NAME=el_teu_cloud_name
CLOUDINARY_API_KEY=la_teva_api_key
CLOUDINARY_API_SECRET=el_teu_api_secret
Mailtrap
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=el_teu_user
MAILTRAP_PASS=la_teva_pass
EMAIL_FROM=noreply@taskmanager.com

5. Inicia el servidor:
```bash
npm run dev
```

> En arrencar, el sistema crea automàticament els permisos i rols per defecte si no existeixen.

---

## 🔐 Sistema d'Autenticació i Autorització

### ⚠️ Notes tècniques
- S'utilitza `express-rate-limit` en lloc de **Redis** per al rate limiting. Funciona en memòria i ofereix el mateix comportament per a entorns de desenvolupament.
- El model d'usuari manté el camp `name` en lloc de `firstName`/`lastName` per consistència amb les entregues anteriors (T7, T8).
- Les rutes d'auditoria estan sota `/api/admin/audit-logs` en lloc de `/api/audit/logs` per consistència amb l'estructura del projecte.

### 🎫 JWT Avançat (Access + Refresh Token)

El sistema utilitza **dos tokens** en lloc d'un:

| Token | Durada | Ús |
|-------|--------|----|
| Access Token | 15 minuts | Enviar a cada petició protegida |
| Refresh Token | 7 dies | Renovar l'access token quan expira |

Com enviar el token:

Authorization: Bearer <access_token>

#### Flux de renovació

1. Login → reps accessToken (15min) + refreshToken (7dies)
2. Fas peticions amb accessToken
3. Als 15 minuts → 401 TOKEN_EXPIRED
4. POST /api/auth/refresh amb el refreshToken → nou accessToken
5. Continues fent peticions normalment

#### Logout segur
Al fer logout, els dos tokens s'afegeixen a una **blacklist** i queden invalidats immediatament.

### 🏛️ Jerarquia de Rols

Els rols hereten els permisos dels rols inferiors:

SUPER_ADMIN (nivell 5) → hereta d'ADMIN
ADMIN (nivell 4)   → hereta de MANAGER
MANAGER (nivell 3) → hereta de USER
USER (nivell 2) → hereta de VIEWER
VIEWER (nivell 1)

### Rols per defecte

| Rol         | Nivell | Permisos propis                                      | Eliminable |
|-------------|--------|------------------------------------------------------|------------|
| super_admin | 5      | Tots els permisos                                    | No         |
| admin       | 4      | Tots els permisos                                    | No         |
| manager     | 3      | users:read, audit:read                               | No         |
| user        | 2      | tasks:create, tasks:update, tasks:delete             | No         |
| editor      | 2      | tasks:create, tasks:update, tasks:delete             | Sí         |
| viewer      | 1      | tasks:read                                           | Sí         |

### Permisos del sistema

| Categoria   | Permís               | Descripció                  |
|-------------|----------------------|-----------------------------|
| tasks       | tasks:create         | Crear tasques               |
| tasks       | tasks:read           | Veure tasques               |
| tasks       | tasks:update         | Editar tasques              |
| tasks       | tasks:delete         | Eliminar tasques            |
| users       | users:manage         | Gestionar usuaris           |
| users       | users:read           | Veure usuaris               |
| roles       | roles:manage         | Gestionar rols              |
| roles       | roles:read           | Veure rols                  |
| permissions | permissions:manage   | Gestionar permisos          |
| permissions | permissions:read     | Veure permisos              |
| audit       | audit:read           | Veure logs d'auditoria      |
| reports     | reports:view         | Veure informes              |
| reports     | reports:export       | Exportar informes           |

### ⚡ Rate Limiting per Rol

| Rol         | Límit      |
|-------------|------------|
| super_admin | 1000 req/min |
| admin       | 500 req/min  |
| manager     | 200 req/min  |
| user        | 100 req/min  |
| viewer      | 50 req/min   |

### 🔑 Recuperació de Contrasenya

1. POST /api/auth/forgot-password → envia email amb token
2. Obrir email a Mailtrap → copiar token de la URL
3. POST /api/auth/reset-password/:token → nova contrasenya

---

## 🚀 Endpoints

### 🔑 Autenticació (`/api/auth`)

| Mètode | Ruta                            | Auth | Descripció                         |
|--------|---------------------------------|------|------------------------------------|
| POST   | /api/auth/register              | No   | Registrar nou usuari               |
| POST   | /api/auth/login                 | No   | Iniciar sessió                     |
| POST   | /api/auth/refresh               | No   | Renovar access token               |
| POST   | /api/auth/logout                | Sí   | Logout segur amb blacklist         |
| POST   | /api/auth/forgot-password       | No   | Sol·licitar reset de contrasenya   |
| POST   | /api/auth/reset-password/:token | No   | Restablir contrasenya              |
| GET    | /api/auth/me                    | Sí   | Obtenir perfil amb rols i permisos |
| PUT    | /api/auth/profile               | Sí   | Actualitzar perfil                 |
| PUT    | /api/auth/change-password       | Sí   | Canviar contrasenya                |
| POST   | /api/auth/check-permission      | Sí   | Verificar si es té un permís       |

---

### 👥 Usuaris (`/api/users`)

| Mètode | Ruta                       | Permís        | Descripció               |
|--------|----------------------------|---------------|--------------------------|
| GET    | /api/users                 | users:read    | Llistar usuaris          |
| GET    | /api/users/:id             | users:read    | Obtenir usuari per ID    |
| GET    | /api/users/:id/permissions | users:read    | Permisos efectius        |
| PUT    | /api/users/:id             | users:manage  | Actualitzar usuari       |
| DELETE | /api/users/:id             | users:manage  | Eliminar usuari          |

---

### 📋 Tasques (`/api/tasks`) — Totes protegides amb permisos

| Mètode | Ruta             | Permís        |
|--------|------------------|---------------|
| GET    | /api/tasks       | tasks:read    |
| POST   | /api/tasks       | tasks:create  |
| GET    | /api/tasks/:id   | tasks:read    |
| PUT    | /api/tasks/:id   | tasks:update  |
| DELETE | /api/tasks/:id   | tasks:delete  |

Suporta paginació: `GET /api/tasks?page=1&limit=10`

---

### 📤 Pujada d'arxius (`/api/upload`) — Totes protegides

| Mètode | Ruta                        |
|--------|-----------------------------|
| POST   | /api/upload/local           |
| POST   | /api/upload/local/multiple  |
| POST   | /api/upload/cloud           |
| POST   | /api/upload/cloud/multiple  |
| POST   | /api/upload/both            |
| POST   | /api/upload/both/multiple   |

---

### 👑 Administració (`/api/admin`)

| Mètode | Ruta                                    | Permís        | Descripció                          |
|--------|-----------------------------------------|---------------|-------------------------------------|
| GET    | /api/admin/users                        | users:read    | Llistar tots els usuaris            |
| GET    | /api/admin/tasks                        | users:read    | Llistar totes les tasques           |
| DELETE | /api/admin/users/:id                    | users:manage  | Eliminar usuari i les seves tasques |
| PUT    | /api/admin/users/:id/role               | users:manage  | Canviar rol per nom                 |
| POST   | /api/admin/users/:userId/roles          | users:manage  | Assignar rol a usuari               |
| DELETE | /api/admin/users/:userId/roles/:roleId  | users:manage  | Eliminar rol d'usuari               |
| GET    | /api/admin/users/:userId/permissions    | users:read    | Obtenir permisos efectius           |

---

### 🎨 Rols (`/api/admin/roles` i `/api/roles`)

| Mètode | Ruta                                           | Permís        | Descripció                  |
|--------|------------------------------------------------|---------------|-----------------------------|
| GET    | /api/roles                                     | roles:read    | Llistar tots els rols       |
| POST   | /api/roles                                     | roles:manage  | Crear rol                   |
| GET    | /api/roles/:id                                 | roles:read    | Obtenir rol per ID          |
| GET    | /api/roles/:id/hierarchy                       | roles:read    | Jerarquia del rol           |
| GET    | /api/roles/:id/permissions                     | roles:read    | Permisos propis + heretats  |
| PUT    | /api/roles/:id                                 | roles:manage  | Actualitzar rol             |
| DELETE | /api/roles/:id                                 | roles:manage  | Eliminar rol                |
| POST   | /api/roles/:id/permissions                     | roles:manage  | Afegir permís a rol         |
| DELETE | /api/roles/:id/permissions/:permissionId       | roles:manage  | Eliminar permís de rol      |

---

### 🔐 Permisos (`/api/admin/permissions` i `/api/permissions`)

| Mètode | Ruta                              | Permís              | Descripció                      |
|--------|-----------------------------------|---------------------|---------------------------------|
| GET    | /api/permissions                  | permissions:read    | Llistar tots els permisos       |
| POST   | /api/permissions                  | permissions:manage  | Crear permís                    |
| GET    | /api/permissions/:id              | permissions:read    | Obtenir permís per ID           |
| GET    | /api/permissions/categories       | permissions:read    | Permisos agrupats per categoria |
| PUT    | /api/permissions/:id              | permissions:manage  | Actualitzar permís              |
| DELETE | /api/permissions/:id              | permissions:manage  | Eliminar permís                 |

---

### 🤝 Delegació de Permisos (`/api/delegations`)

| Mètode | Ruta                          | Auth | Descripció                    |
|--------|-------------------------------|------|-------------------------------|
| GET    | /api/delegations              | Sí   | Llistar delegacions           |
| GET    | /api/delegations/:id          | Sí   | Obtenir delegació per ID      |
| GET    | /api/delegations/user/:userId | Sí   | Delegacions d'un usuari       |
| POST   | /api/delegations              | Sí   | Crear delegació               |
| DELETE | /api/delegations/:id          | Sí   | Revocar delegació             |

---

### 📋 Auditoria (`/api/admin/audit-logs`)

| Mètode | Ruta                               | Permís      | Descripció                  |
|--------|------------------------------------|-------------|-----------------------------|
| GET    | /api/admin/audit-logs              | audit:read  | Llistar logs amb filtres    |
| GET    | /api/admin/audit-logs/stats        | audit:read  | Estadístiques d'auditoria   |
| GET    | /api/admin/audit-logs/export       | audit:read  | Exportar logs a CSV         |
| GET    | /api/admin/audit-logs/user/:userId | audit:read  | Logs d'un usuari específic  |
| GET    | /api/admin/audit-logs/:id          | audit:read  | Obtenir log per ID          |

Filtres disponibles:

GET /api/admin/audit-logs?userId=123&action=tasks:update&startDate=2025-01-01&endDate=2025-12-31&page=1&limit=20

---

## ❌ Errors comuns

| Codi | Descripció                                          |
|------|-----------------------------------------------------|
| 400  | Dades invàlides o duplicades                        |
| 401  | Token no proporcionat, invàlid o expirat            |
| 403  | Sense permisos per accedir al recurs                |
| 404  | Recurs no trobat                                    |
| 429  | Massa peticions (rate limit superat)                |
| 500  | Error intern del servidor                           |

---

## 🔒 Seguretat

- Contrasenyes xifrades amb **bcrypt** (cost factor 10)
- Access Token de **15 minuts** + Refresh Token de **7 dies**
- Logout segur amb **token blacklist**
- `JWT_SECRET` i `JWT_REFRESH_SECRET` en variables d'entorn
- `.env` inclòs al `.gitignore`
- Les contrasenyes mai es retornen a les respostes
- Cada usuari només pot accedir als seus propis recursos
- Els rols i permisos del sistema no es poden eliminar
- Totes les accions d'escriptura queden registrades a l'auditoria
- Rate limiting per rol per prevenir atacs de força bruta

---

## 📬 Postman Collection

Al repositori trobaràs el fitxer `postman-collection.json` amb totes les peticions de l'API llestes per importar.

### Com importar-la
1. Obre Postman
2. Fes clic a **Import**
3. Selecciona el fitxer `postman-collection.json`
4. Un cop importada, configura les variables d'entorn:
   - `accessToken` — token obtingut al fer login
   - `refreshToken` — refresh token obtingut al fer login
   - `userId`, `taskId`, `roleId`, `permissionId`, `delegationId` — IDs obtinguts de les respostes

---

## 📖 Documentació Swagger

La documentació interactiva de l'API està disponible un cop el servidor està en funcionament:
http://localhost:3000/api-docs

Permet veure tots els endpoints, els paràmetres esperats i fer peticions directament des del navegador.

### Regenerar la documentació
Si afegeixes nous endpoints, regenera el fitxer Swagger amb:

```bash
npm run swagger
```