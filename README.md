# Gestor de Tasques - API REST

Una API REST desenvolupada amb **Node.js**, **Express** i **MongoDB** per gestionar tasques. Inclou un sistema complet d'autenticació JWT, gestió avançada de rols i permisos granulars, i un sistema d'auditoria de totes les accions.

---

## Tecnologies

- Node.js
- Express
- MongoDB + Mongoose
- bcrypt
- jsonwebtoken
- express-validator
- Cloudinary
- Multer

---

## Estructura del projecte
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
│   └── uploadController.js
│
├── middleware/
│   ├── auth.js
│   ├── checkPermission.js
│   ├── auditMiddleware.js
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
│   └── AuditLog.js
│
├── routes/
│   ├── authRoutes.js
│   ├── adminRoutes.js
│   ├── taskRoutes.js
│   ├── roleRoutes.js
│   ├── permissionRoutes.js
│   ├── auditRoutes.js
│   └── uploadRoutes.js
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

| Funcionalitat | T7 | T8 |
|---|---|---|
| 🔐 Registre i login amb JWT | ✅ | ✅ |
| 🔑 Middleware d'autenticació | ✅ | ✅ |
| 👤 Gestió de perfil d'usuari | ✅ | ✅ |
| 🛡️ Protecció de rutes de tasques | ✅ | ✅ |
| 👑 Rols simples (user/admin) | ✅ | — |
| 🎨 Sistema de rols dinàmics | — | ✅ |
| 🔐 Permisos granulars | — | ✅ |
| 🌱 Rols i permisos per defecte | — | ✅ |
| 👥 Assignació de múltiples rols | — | ✅ |
| 📋 Auditoria d'accions | — | ✅ |
| ✔️ Validacions d'entrada | ✅ | ✅ |
| ❗ Gestió d'errors HTTP | ✅ | ✅ |
| 🔒 Seguretat (bcrypt, JWT, .env) | ✅ | ✅ |
| 📤 Pujada d'imatges (local/cloud) | ✅ | ✅ |

---

## Instal·lació

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
JWT_SECRET=la_teva_clau_secreta_super_segura
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=el_teu_cloud_name
CLOUDINARY_API_KEY=la_teva_api_key
CLOUDINARY_API_SECRET=el_teu_api_secret

5. Inicia el servidor:
```bash
npm run dev
```

> En arrencar, el sistema crea automàticament els permisos i rols per defecte si no existeixen.

---

## Sistema d'Autenticació i Autorització

### JWT
L'API utilitza **JWT (JSON Web Tokens)** per autenticar els usuaris. Cal registrar-se i iniciar sessió per obtenir un token.

### Rols per defecte

| Rol     | Permisos                                              | Eliminable |
|---------|-------------------------------------------------------|------------|
| admin   | Tots els permisos del sistema                         | No         |
| user    | tasks:create, tasks:read, tasks:update, tasks:delete  | No         |
| editor  | tasks:create, tasks:read, tasks:update, tasks:delete  | Sí         |
| viewer  | tasks:read                                            | Sí         |

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

---

## 🚀 Endpoints

### 🔑 Autenticació (`/api/auth`)

| Mètode | Ruta                        | Auth | Descripció                        |
|--------|-----------------------------|------|-----------------------------------|
| POST   | /api/auth/register          | No   | Registrar nou usuari              |
| POST   | /api/auth/login             | No   | Iniciar sessió                    |
| GET    | /api/auth/me                | Sí   | Obtenir perfil amb rols i permisos|
| PUT    | /api/auth/profile           | Sí   | Actualitzar perfil                |
| PUT    | /api/auth/change-password   | Sí   | Canviar contrasenya               |
| POST   | /api/auth/check-permission  | Sí   | Verificar si es té un permís      |

#### Exemple de login — resposta amb rols i permisos
```json
{
    "success": true,
    "message": "Sessió iniciada correctament",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
            "id": "507f1f77bcf86cd799439011",
            "name": "Joan Garcia",
            "email": "joan@example.com",
            "roles": ["user"],
            "permissions": ["tasks:create", "tasks:read", "tasks:update", "tasks:delete"]
        }
    }
}
```

#### Exemple de check-permission
```json
POST /api/auth/check-permission
{ "permission": "tasks:delete" }

Resposta:
{
    "success": true,
    "hasPermission": true,
    "message": "Tens permís per fer aquesta acció"
}
```

---

### Tasques (`/api/tasks`) — Totes protegides amb permisos

| Mètode | Ruta             | Permís         |
|--------|------------------|----------------|
| GET    | /api/tasks       | tasks:read     |
| POST   | /api/tasks       | tasks:create   |
| GET    | /api/tasks/:id   | tasks:read     |
| PUT    | /api/tasks/:id   | tasks:update   |
| DELETE | /api/tasks/:id   | tasks:delete   |

---

### Pujada d'arxius (`/api/upload`) — Totes protegides

| Mètode | Ruta                        |
|--------|-----------------------------|
| POST   | /api/upload/local           |
| POST   | /api/upload/local/multiple  |
| POST   | /api/upload/cloud           |
| POST   | /api/upload/cloud/multiple  |
| POST   | /api/upload/both            |
| POST   | /api/upload/both/multiple   |

---

### Administració (`/api/admin`)

| Mètode | Ruta                              | Permís         | Descripció                        |
|--------|-----------------------------------|----------------|-----------------------------------|
| GET    | /api/admin/users                  | users:read     | Llistar tots els usuaris          |
| GET    | /api/admin/tasks                  | users:read     | Llistar totes les tasques         |
| DELETE | /api/admin/users/:id              | users:manage   | Eliminar usuari i les seves tasques|
| PUT    | /api/admin/users/:id/role         | users:manage   | Canviar rol per nom               |
| POST   | /api/admin/users/:userId/roles    | users:manage   | Assignar rol a usuari             |
| DELETE | /api/admin/users/:userId/roles/:roleId | users:manage | Eliminar rol d'usuari          |
| GET    | /api/admin/users/:userId/permissions | users:read  | Obtenir permisos efectius         |

---

### Rols (`/api/admin/roles`)

| Mètode | Ruta                                        | Permís        | Descripció                  |
|--------|---------------------------------------------|---------------|-----------------------------|
| GET    | /api/admin/roles                            | roles:read    | Llistar tots els rols       |
| POST   | /api/admin/roles                            | roles:manage  | Crear rol                   |
| GET    | /api/admin/roles/:id                        | roles:read    | Obtenir rol per ID          |
| PUT    | /api/admin/roles/:id                        | roles:manage  | Actualitzar rol             |
| DELETE | /api/admin/roles/:id                        | roles:manage  | Eliminar rol                |
| POST   | /api/admin/roles/:id/permissions            | roles:manage  | Afegir permís a rol         |
| DELETE | /api/admin/roles/:id/permissions/:permissionId | roles:manage | Eliminar permís de rol   |

---

### Permisos (`/api/admin/permissions`)

| Mètode | Ruta                              | Permís              | Descripció                    |
|--------|-----------------------------------|---------------------|-------------------------------|
| GET    | /api/admin/permissions            | permissions:read    | Llistar tots els permisos     |
| POST   | /api/admin/permissions            | permissions:manage  | Crear permís                  |
| GET    | /api/admin/permissions/categories | permissions:read    | Permisos agrupats per categoria|
| PUT    | /api/admin/permissions/:id        | permissions:manage  | Actualitzar permís            |
| DELETE | /api/admin/permissions/:id        | permissions:manage  | Eliminar permís               |

---

### Auditoria (`/api/admin/audit-logs`)

| Mètode | Ruta                              | Permís      | Descripció                        |
|--------|-----------------------------------|-------------|-----------------------------------|
| GET    | /api/admin/audit-logs             | audit:read  | Llistar logs amb filtres          |
| GET    | /api/admin/audit-logs/stats       | audit:read  | Estadístiques d'auditoria         |
| GET    | /api/admin/audit-logs/user/:userId| audit:read  | Logs d'un usuari específic        |
| GET    | /api/admin/audit-logs/:id         | audit:read  | Obtenir log per ID                |

#### Filtres disponibles per als logs

GET /api/admin/audit-logs?userId=123&action=tasks:update&startDate=2025-01-01&endDate=2025-12-31&page=1&limit=20

---

## Errors comuns

| Codi | Descripció                                          |
|------|-----------------------------------------------------|
| 400  | Dades invàlides o duplicades                        |
| 401  | Token no proporcionat o invàlid                     |
| 403  | Sense permisos per accedir al recurs                |
| 404  | Recurs no trobat                                    |
| 500  | Error intern del servidor                           |

---

## Seguretat

- Contrasenyes xifrades amb **bcrypt** (cost factor 10)
- Tokens JWT amb expiració de **7 dies**
- `JWT_SECRET` emmagatzemada en variables d'entorn
- `.env` inclòs al `.gitignore`
- Les contrasenyes mai es retornen a les respostes
- Cada usuari només pot accedir als seus propis recursos
- Els rols i permisos del sistema no es poden eliminar
- Totes les accions d'escriptura queden registrades a l'auditoria