# Gestor de Tasques - API REST

Una API REST desenvolupada amb **Node.js**, **Express** i **MongoDB** per gestionar tasques. Permet crear, consultar, actualitzar i eliminar tasques, amb camps específics com cost, hores estimades, hores reals, estat i imatge. Inclou un sistema complet d'autenticació i autorització amb JWT i gestió de rols.

---

## 📦 Tecnologies

- Node.js
- Express
- MongoDB
- Mongoose
- CORS
- Dotenv
- bcrypt
- jsonwebtoken
- express-validator
- Cloudinary
- Multer

---

## 📂 Estructura del projecte

APIRESTGestorTasques/
│
├─ config/
│ └─ .env
│
├─ controllers/
│ └─ taskController.js
│
├─ models/
│ └─ Task.js
│
├─ routes/
│ └─ taskRoutes.js
│
├─ index.js
├─ app.js
├─ package-lock.json
└─ package.json


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
JWT_SECRET=la_teva_clau_secreta_super_segura
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=el_teu_cloud_name
CLOUDINARY_API_KEY=la_teva_api_key
CLOUDINARY_API_SECRET=el_teu_api_secret

5. Inicia el servidor:

```bash
npm run dev
```

## 🔐 Sistema d'Autenticació

L'API utilitza **JWT (JSON Web Tokens)** per autenticar els usuaris. Cal registrar-se i iniciar sessió per obtenir un token, que s'ha d'enviar a totes les rutes protegides.

### Com enviar el token
Authorization: Bearer <el_teu_token>

### Rols disponibles

| Rol   | Descripció |
|-------|------------|
| user  | Pot gestionar les seves pròpies tasques |
| admin | Accés total: pot veure i gestionar tots els usuaris i tasques |

### Com crear un usuari admin
1. Registra un usuari normalment via `POST /api/auth/register`
2. Accedeix a MongoDB Compass
3. A la col·lecció `users`, edita el camp `role` de `"user"` a `"admin"`

---

## 🚀 Endpoints

### 🔑 Autenticació (`/api/auth`)

| Acció               | Mètode | Ruta                      | Auth |
|---------------------|--------|---------------------------|------|
| Registrar usuari    | POST   | /api/auth/register        | No   |
| Iniciar sessió      | POST   | /api/auth/login           | No   |
| Obtenir perfil      | GET    | /api/auth/me              | Sí   |
| Actualitzar perfil  | PUT    | /api/auth/profile         | Sí   |
| Canviar contrasenya | PUT    | /api/auth/change-password | Sí   |

#### Exemple de registre
```json
POST /api/auth/register
{
    "name": "Joan Garcia",
    "email": "joan@example.com",
    "password": "contrasenya123"
}
```

Resposta `201`:
```json
{
    "success": true,
    "message": "Usuari registrat correctament",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
            "id": "507f1f77bcf86cd799439011",
            "name": "Joan Garcia",
            "email": "joan@example.com",
            "role": "user",
            "createdAt": "2025-01-10T18:30:00.000Z"
        }
    }
}
```

---

### 📋 Tasques (`/api/tasks`) — Totes protegides

Cada usuari només pot veure i gestionar les seves pròpies tasques.

| Acció                     | Mètode | Ruta           |
|---------------------------|--------|----------------|
| Crear tasca               | POST   | /api/tasks     |
| Obtenir totes les tasques | GET    | /api/tasks     |
| Obtenir tasca per ID      | GET    | /api/tasks/:id |
| Actualitzar tasca         | PUT    | /api/tasks/:id |
| Eliminar tasca            | DELETE | /api/tasks/:id |

---

### 📤 Pujada d'arxius (`/api/upload`) — Totes protegides

| Acció                                   | Mètode | Ruta                        |
|-----------------------------------------|--------|-----------------------------|
| Pujar 1 fitxer (Local)                  | POST   | /api/upload/local           |
| Pujar múltiples fitxers (Local)         | POST   | /api/upload/local/multiple  |
| Pujar 1 fitxer (Cloudinary)             | POST   | /api/upload/cloud           |
| Pujar múltiples fitxers (Cloudinary)    | POST   | /api/upload/cloud/multiple  |
| Pujar 1 fitxer (Local + Cloud)          | POST   | /api/upload/both            |
| Pujar múltiples fitxers (Local + Cloud) | POST   | /api/upload/both/multiple   |

---

### 👑 Administració (`/api/admin`) — Només rol admin

| Acció                     | Mètode | Ruta                      |
|---------------------------|--------|---------------------------|
| Obtenir tots els usuaris  | GET    | /api/admin/users          |
| Obtenir totes les tasques | GET    | /api/admin/tasks          |
| Eliminar usuari           | DELETE | /api/admin/users/:id      |
| Canviar rol d'usuari      | PUT    | /api/admin/users/:id/role |

---

## ❌ Errors comuns

| Codi | Descripció                                          |
|------|-----------------------------------------------------|
| 400  | Dades invàlides (validació fallida, email duplicat) |
| 401  | Token no proporcionat o invàlid                     |
| 403  | Sense permisos per accedir al recurs                |
| 404  | Recurs no trobat                                    |
| 500  | Error intern del servidor                           |

---

## 🔒 Seguretat

- Contrasenyes xifrades amb **bcrypt** (cost factor 10)
- Tokens JWT amb expiració de **7 dies**
- `JWT_SECRET` emmagatzemada en variables d'entorn
- `.env` inclòs al `.gitignore`
- Les contrasenyes mai es retornen a les respostes
- Cada usuari només pot accedir als seus propis recursos