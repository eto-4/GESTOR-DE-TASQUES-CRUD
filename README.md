# Gestor de Tasques - API REST

Una API REST desenvolupada amb **Node.js**, **Express** i **MongoDB** per gestionar tasques. Permet crear, consultar, actualitzar i eliminar tasques, amb camps específics com cost, hores estimades, hores reals, estat i imatge.

---

## 📦 Tecnologies

- Node.js
- Express
- MongoDB
- Mongoose
- Body-Parser
- CORS
- Dotenv

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

3. Configura les variables d’entorn a config/.env:

```bash
PORT=3000
MONGO_URI=<URL_de_la_teva_base_de_dades>
```

4. Inicia el servidor:

```bash
npm run start
```
o
```bash
npm run dev
```

## 🚀 Rutes principals

| Acció                    | Mètode | Ruta           |
|--------------------------|--------|----------------|
| Crear tasca              | POST   | /api/tasks     |
| Obtenir totes les tasques| GET    | /api/tasks     |
| Obtenir tasca per ID     | GET    | /api/tasks/:id |
| Actualitzar tasca        | PUT    | /api/tasks/:id |
| Eliminar tasca           | DELETE | /api/tasks/:id |

## 📁 Rutes de pujada d'arxius

| Acció                                  | Mètode | Ruta                        |
|----------------------------------------|--------|-----------------------------|
| Pujar 1 fitxer (Local)                 |  POST  | /api/upload/local           |
| Pujar múltiples fitxers (Local)        |  POST  | /api/upload/local/multiple  |
| Pujar 1 fitxer (Cloudinary)            |  POST  | /api/upload/cloud           |
| Pujar múltiples fitxers (Cloudinary)   |  POST  | /api/upload/cloud/multiple  |
| Pujar 1 fitxer (Local + Cloud)         |  POST  | /api/upload/both            |
| Pujar múltiples fitxers (Local + Cloud)|  POST  | /api/upload/both/multiple   |