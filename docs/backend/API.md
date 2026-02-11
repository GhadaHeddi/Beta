# Backend - Reference API

Tous les endpoints sont prefixes par `/api`. Authentification par JWT Bearer token sauf les endpoints `/dev/` (developpement uniquement).

---

## Authentification (`/api/auth`)

### `POST /auth/login`

Authentifie un utilisateur et retourne un token JWT.

- **Content-Type** : `application/x-www-form-urlencoded` (OAuth2PasswordRequestForm)
- **Body** : `username` (email), `password`
- **Reponse** : `{ "access_token": "...", "token_type": "bearer" }`
- **Erreurs** : `401` email ou mot de passe incorrect

### `GET /auth/me`

Retourne le profil de l'utilisateur connecte.

- **Auth** : Bearer token
- **Reponse** : `UserResponse`

### `PATCH /auth/me`

Met a jour le profil de l'utilisateur connecte.

- **Auth** : Bearer token
- **Body** : `UserUpdate` (first_name, last_name, email, phone - tous optionnels)
- **Reponse** : `UserResponse`
- **Erreurs** : `400` email deja pris, aucune donnee

### `POST /auth/me/change-password`

Change le mot de passe de l'utilisateur connecte.

- **Auth** : Bearer token
- **Body** : `{ "current_password", "new_password", "confirm_password" }`
- **Validation** : min 8 caracteres, 1 majuscule, 1 minuscule, 1 chiffre
- **Erreurs** : `400` mot de passe actuel incorrect, mots de passe non identiques

---

## Administration (`/api/admin`)

Tous les endpoints requierent le role `ADMIN`.

### `GET /admin/consultants`

Liste tous les consultants de l'administrateur connecte.

- **Auth** : Bearer token (ADMIN)
- **Reponse** : `List[UserResponse]`

### `POST /admin/consultants`

Cree un nouveau consultant rattache a l'administrateur.

- **Auth** : Bearer token (ADMIN)
- **Body** : `ConsultantCreate` (email, password, first_name, last_name, phone?)
- **Reponse** : `UserResponse` (201)
- **Erreurs** : `400` email deja existant

### `DELETE /admin/consultants/{consultant_id}`

Supprime un consultant et tous ses projets.

- **Auth** : Bearer token (ADMIN)
- **Reponse** : 204 No Content
- **Erreurs** : `404` consultant non trouve, `403` pas dans l'equipe

### `GET /admin/dashboard`

Statistiques du dashboard administrateur.

- **Auth** : Bearer token (ADMIN)
- **Reponse** :
```json
{
  "consultants_count": 5,
  "projects_count": 23,
  "projects_by_status": { "draft": 10, "in_progress": 8, "completed": 5 },
  "recent_projects": [{ "id": 1, "title": "...", "address": "...", "status": "draft", "owner_id": 2, "created_at": "..." }]
}
```

---

## Projets (`/api/projects`)

### `GET /projects/`

Liste les projets accessibles par l'utilisateur (exclut la corbeille).

- **Auth** : Bearer token
- **Logique d'acces** :
  - Admin : tous les projets de son equipe
  - Consultant : ses projets + projets partages avec lui
- **Reponse** : `List[ProjectWithDetails]` (inclut `user` et `property_info`)

### `POST /projects/`

Cree un nouveau projet.

- **Auth** : Bearer token
- **Body** : `ProjectCreate`
```json
{
  "title": "Bureau La Defense",
  "address": "1 Place de la Defense, 92400 Courbevoie",
  "property_type": "office"
}
```
- **PropertyType** : `office`, `warehouse`, `retail`, `industrial`, `land`, `mixed`
- **Reponse** : `ProjectResponse` (201)

### `GET /projects/{project_id}`

Detail d'un projet avec informations du proprietaire.

- **Auth** : Bearer token
- **Permissions** : `can_read_project` (proprietaire, admin equipe, partage)
- **Reponse** : `ProjectWithOwner`
- **Erreurs** : `404`, `403`

### `PUT /projects/{project_id}`

Modifie un projet existant.

- **Auth** : Bearer token
- **Permissions** : `can_write_project` (proprietaire, admin equipe, partage write/admin)
- **Body** : `ProjectUpdate` (title?, address?, property_type?, status?, current_step?)
- **Reponse** : `ProjectResponse`

### `DELETE /projects/{project_id}`

Soft delete - deplace le projet dans la corbeille.

- **Auth** : Bearer token
- **Permissions** : `can_delete_project` (proprietaire, admin equipe, partage admin)
- **Reponse** : `ProjectResponse` (avec `deleted_at` renseigne)
- **Erreurs** : `400` deja dans la corbeille

---

## Corbeille (`/api/projects`)

### `GET /projects/trash`

Liste les projets dans la corbeille.

- **Auth** : Bearer token
- **Logique d'acces** : Admin voit l'equipe, Consultant voit ses projets
- **Reponse** : `List[ProjectWithDetails]`

### `POST /projects/{project_id}/restore`

Restaure un projet depuis la corbeille.

- **Auth** : Bearer token
- **Permissions** : `can_delete_project`
- **Erreurs** : `400` pas dans la corbeille

### `DELETE /projects/{project_id}/permanent`

Supprime definitivement un projet (doit etre dans la corbeille).

- **Auth** : Bearer token
- **Permissions** : `can_delete_project`
- **Reponse** : 204 No Content
- **Cascade** : supprime les partages associes

---

## Informations du bien (`/api/projects/{project_id}`)

### `GET /projects/{project_id}/property-info`

Recupere les informations detaillees du bien.

- **Auth** : Bearer token
- **Permissions** : `can_read_project`
- **Reponse** : `PropertyInfoResponse`

### `PUT /projects/{project_id}/property-info`

Cree ou met a jour les informations du bien (upsert).

- **Auth** : Bearer token
- **Permissions** : `can_write_project`
- **Body** : `PropertyInfoUpdate` (tous les champs optionnels)
```json
{
  "owner_name": "SCI Immobiliere",
  "construction_year": 1995,
  "total_surface": 2500.0,
  "terrain_surface": 5000.0,
  "latitude": 48.8924,
  "longitude": 2.2359,
  "postal_code": "92400",
  "city": "Courbevoie",
  "geographic_sector": "La Defense",
  "plu_zone": "UA",
  "swot_strengths": "Emplacement premium, acces transports",
  "swot_weaknesses": "Parking limite",
  "notes": "A renover partiellement"
}
```
- **Reponse** : `PropertyInfoResponse`

---

## Partage de projets (`/api/projects/{project_id}`)

### `GET /projects/{project_id}/available-users?search=`

Recherche les utilisateurs disponibles pour le partage (membres de l'equipe sans acces).

- **Auth** : Bearer token
- **Permissions** : `can_share_project`
- **Query** : `search` (nom, prenom, email)
- **Reponse** : `List[UserBrief]` (max 10)

### `GET /projects/{project_id}/shares`

Liste les collaborateurs d'un projet.

- **Auth** : Bearer token
- **Permissions** : `can_read_project`
- **Reponse** : `List[ProjectShareResponse]` (avec `user` imbrique)

### `POST /projects/{project_id}/shares`

Partage un projet avec un utilisateur.

- **Auth** : Bearer token
- **Permissions** : `can_share_project` (proprietaire, admin equipe, partage admin)
- **Body** :
```json
{
  "user_id": 5,
  "permission": "write"
}
```
ou :
```json
{
  "email": "consultant@arthurlloyd.fr",
  "permission": "read"
}
```
- **Permissions** : `read`, `write`, `admin`
- **Erreurs** : `400` (soi-meme, proprietaire, deja partage, hors equipe)

### `PUT /projects/{project_id}/shares/{user_id}`

Modifie le niveau de permission d'un partage.

- **Auth** : Bearer token
- **Permissions** : `can_share_project`
- **Body** : `{ "permission": "admin" }`

### `DELETE /projects/{project_id}/shares/{user_id}`

Retire un collaborateur.

- **Auth** : Bearer token
- **Permissions** : `can_share_project`
- **Reponse** : 204 No Content

---

## Comparables (`/api/projects/{project_id}/comparables`)

### `GET /comparables/search`

Recherche spatiale dans le pool de comparables.

- **Auth** : Bearer token
- **Query params** :
  - `surface_min` / `surface_max` : surface en m2
  - `year_min` / `year_max` : annee de construction
  - `distance_km` : rayon de recherche (0.1 a 50, defaut 5.0)
  - `source` : `all`, `arthur_loyd`, `concurrence`
- **Filtre automatique** : meme `property_type` que le projet
- **Reponse** :
```json
{
  "comparables": [
    {
      "id": 1, "address": "...", "postal_code": "92400", "city": "Courbevoie",
      "latitude": 48.89, "longitude": 2.24, "property_type": "office",
      "surface": 1200.0, "construction_year": 2005,
      "transaction_type": "sale", "price": 3600000.0, "price_per_m2": 3000.0,
      "transaction_date": "2025-06-15", "source": "arthur_loyd",
      "distance_km": 1.2
    }
  ],
  "stats": {
    "avg_rent_per_m2": 250.0, "rent_count": 5,
    "avg_sale_per_m2": 3200.0, "sale_count": 8,
    "latest_sale_per_m2": 3100.0, "latest_sale_date": "2025-11-01",
    "total_count": 13
  },
  "center": { "lat": 48.8924, "lng": 2.2359 }
}
```

### `GET /comparables/selected`

Liste les comparables selectionnes pour le projet.

- **Auth** : Bearer token
- **Reponse** : `List[SelectedComparableResponse]`

### `POST /comparables/select`

Selectionne un comparable du pool (max 3 par projet).

- **Auth** : Bearer token
- **Body** :
```json
{
  "comparable_pool_id": 12,
  "adjustment": -5.0,
  "notes": "Bien similaire mais plus ancien"
}
```
- **Reponse** : `SelectedComparableResponse` (201)

### `DELETE /comparables/select/{comparable_id}`

Retire un comparable de la selection.

- **Auth** : Bearer token
- **Reponse** : 204 No Content

### `PUT /comparables/select/{comparable_id}/adjustment`

Met a jour l'ajustement (decote/surcote en %) d'un comparable.

- **Auth** : Bearer token
- **Body** : `{ "adjustment": -10.0 }`
- **Reponse** : `SelectedComparableResponse` (avec `adjusted_price_per_m2` recalcule)

### `POST /comparables/validate`

Valide les comparables et avance a l'etape 3.

- **Auth** : Bearer token
- **Precondition** : au moins 1 comparable valide
- **Reponse** :
```json
{
  "message": "Comparables valides avec succes",
  "current_step": 3,
  "selected_count": 2
}
```

---

## Fichiers (`/api/projects`)

> Note : ces endpoints utilisent actuellement les routes `/dev/` (sans auth).

### `POST /projects/dev/{project_id}/files/upload`

Upload un fichier pour un projet.

- **Content-Type** : `multipart/form-data`
- **Body** : `file` (champ fichier)
- **Stockage** : `/app/uploaded_files/project_{id}/`
- **Reponse** : `{ "id", "name", "mime_type", "size", "uploaded_at" }`

### `GET /projects/dev/{project_id}/files`

Liste les fichiers d'un projet.

- **Reponse** : `List[{ id, name, mime_type, size, uploaded_at }]`

### `GET /projects/dev/{project_id}/files/{file_id}`

Telecharge ou affiche un fichier (inline).

- **Reponse** : `FileResponse` avec header `Content-Disposition: inline`

### `DELETE /projects/dev/{project_id}/files/{file_id}`

Supprime un fichier (base + fichier physique).

---

## Endpoints DEV (sans authentification)

> Ces endpoints sont destines au developpement uniquement et doivent etre supprimes en production.

| Endpoint | Equivalent auth |
|----------|----------------|
| `GET /projects/dev/all` | `GET /projects/` (avec filtrage/pagination) |
| `GET /projects/dev/filters/metadata` | Inclus dans `GET /projects/` via `include_metadata` |
| `POST /projects/dev/create` | `POST /projects/` |
| `GET /projects/dev/{id}` | `GET /projects/{id}` |
| `PUT /projects/dev/{id}/property-info` | `PUT /projects/{id}/property-info` |
| `DELETE /projects/dev/{id}` | `DELETE /projects/{id}` |
| `POST /projects/dev/{id}/restore` | `POST /projects/{id}/restore` |
| `DELETE /projects/dev/{id}/permanent` | `DELETE /projects/{id}/permanent` |
| `GET /projects/dev/trash/all` | `GET /projects/trash` |
| `GET /comparables/dev/search` | `GET /comparables/search` |
| `GET /comparables/dev/selected` | `GET /comparables/selected` |
| `POST /comparables/dev/select` | `POST /comparables/select` |
| `DELETE /comparables/dev/select/{id}` | `DELETE /comparables/select/{id}` |
| `POST/GET/DELETE /projects/dev/{id}/files/*` | A migrer vers endpoints auth |

---

## Systeme de permissions

Les fonctions helper dans `routers/projects.py` controlent l'acces :

| Fonction | Proprietaire | Admin equipe | Partage read | Partage write | Partage admin |
|----------|:---:|:---:|:---:|:---:|:---:|
| `can_read_project` | oui | oui | oui | oui | oui |
| `can_write_project` | oui | oui | - | oui | oui |
| `can_delete_project` | oui | oui | - | - | oui |
| `can_share_project` | oui | oui | - | - | oui |

---

## Schemas Pydantic de reference

### User

| Schema | Champs | Usage |
|--------|--------|-------|
| `UserBase` | email, first_name, last_name, phone? | Base commune |
| `ConsultantCreate` | + password | Creation consultant |
| `UserUpdate` | first_name?, last_name?, email?, phone? | Mise a jour profil |
| `UserResponse` | + id, role, avatar_url?, admin_id?, created_at, updated_at | Reponse API |
| `UserBrief` | id, email, first_name, last_name, role | Version light |
| `Token` | access_token, token_type | Reponse login |
| `ChangePasswordRequest` | current_password, new_password, confirm_password | Changement mot de passe |

### Project

| Schema | Champs | Usage |
|--------|--------|-------|
| `ProjectCreate` | title, address, property_type | Creation |
| `ProjectUpdate` | title?, address?, property_type?, status?, current_step? | Modification |
| `ProjectResponse` | + id, user_id, status, current_step, created_at, updated_at, deleted_at | Reponse standard |
| `ProjectWithOwner` | + user (UserBrief) | Reponse avec proprietaire |
| `ProjectWithDetails` | + user, property_info? (PropertyInfoBrief) | Reponse complete |
| `ProjectsPaginatedResponse` | projects, total, page, page_size, total_pages, filters_metadata? | Reponse paginee |

### PropertyInfo

| Schema | Champs | Usage |
|--------|--------|-------|
| `PropertyInfoBrief` | total_surface?, occupant_name?, construction_year? | Version light (listes) |
| `PropertyInfoUpdate` | tous les champs optionnels (voir section Informations du bien) | Creation/modification |
| `PropertyInfoResponse` | tous les champs + id, project_id, created_at, updated_at | Reponse complete |

### Partage

| Schema | Champs | Usage |
|--------|--------|-------|
| `ProjectShareCreate` | user_id?, email?, permission | Creation partage |
| `ProjectShareUpdate` | permission | Modification permission |
| `ProjectShareResponse` | id, project_id, user_id, permission, created_at, user? | Reponse |
| `FiltersMetadata` | available_cities, available_consultants, construction_year_range, property_type_counts | Metadonnees filtres |
