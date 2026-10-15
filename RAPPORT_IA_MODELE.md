# Rapport d'utilisation de l'IA â€” TP1, TP2 et TP3

J'ai utilisÃ© GitHub Copilot en mode Agent dans VS Code et ChatGPT pour m'aider pendant les TP1, TP2 et TP3. J'ai utilisÃ© l'IA pour analyser l'architecture, repÃ©rer les Ã©lÃ©ments Ã  complÃ©ter, proposer des changements ciblÃ©s, comprendre le code et prÃ©parer les rÃ©ponses thÃ©oriques. J'ai ensuite vÃ©rifiÃ© les changements par le build Angular, des essais manuels et des tests automatisÃ©s.

Pour ChatGPT, le modÃ¨le utilisÃ© Ã©tait **GPT-5.6 Sol**. Le modÃ¨le de GitHub Copilot dÃ©pend de celui sÃ©lectionnÃ© dans Copilot Chat ; je ne peux pas l'identifier avec certitude ici.

Je n'ai inclus dans ce rapport aucune valeur sensible.

---

# TP1 â€” Architecture, authentification et profil

## Mission 0 â€” Cartographie de l'application

### 1. Objectif

Je voulais comprendre comment l'application Angular est organisÃ©e, comment une connexion traverse le frontend et le backend, et quelles routes sont publiques ou protÃ©gÃ©es. Cette mission Ã©tait une analyse en lecture seule : **je n'ai modifiÃ© aucun fichier**.

### 2. Prompt principal

J'ai demandÃ© Ã  l'agent de cartographier le frontend Angular et les routes backend correspondantes sans Ã©crire dans le projet. Je lui ai demandÃ© d'identifier le composant racine, les routes, l'enregistrement de `HttpClient`, les modÃ¨les, les services, les pages, `authGuard`, `authInterceptor`, les routes publiques et protÃ©gÃ©es, ainsi que le trajet d'une connexion. J'ai Ã©galement demandÃ© de ne pas consulter les informations sensibles de configuration ni de les reproduire.

### 3. Plan proposÃ© par l'agent

L'agent a proposÃ© de partir du bootstrap Angular et du routeur, puis de suivre les composants de page vers les services HTTP et les modÃ¨les. Il a ensuite rapprochÃ© les appels du frontend du proxy Angular et des routes Express, afin de reconstituer le flux complet.

### 4. VÃ©rifications rÃ©alisÃ©es

J'ai vÃ©rifiÃ© dans le code les Ã©lÃ©ments suivants :

- **Composant racine :** `AppComponent`, qui fournit la navigation et le `router-outlet`.
- **Routes Angular :** la route vide redirige vers `/tracks` ; `/login` et `/register` sont publiques ; `/profile` et `/tracks` utilisent `authGuard` ; la route inconnue redirige vers `/tracks`.
- **Enregistrement HTTP :** le bootstrap dans `main.ts` installe `provideHttpClient` et enregistre `authInterceptor` avec `withInterceptors`.
- **Proxy :** les requÃªtes frontend prÃ©fixÃ©es par `/api` sont dirigÃ©es vers le serveur local dÃ©fini par `proxy.conf.json`.
- **ModÃ¨les :** `User`, `AuthResponse`, `Track` et `Page<T>` dÃ©crivent les rÃ©ponses utilisÃ©es par le frontend.
- **Services :** `AuthService` regroupe l'authentification et le profil ; `TrackService` regroupe les opÃ©rations liÃ©es aux pistes.
- **Pages :** `LoginPageComponent`, `RegisterPageComponent`, `ProfilePageComponent` et `TracksPageComponent`.
- **Protection Angular :** `authGuard` vÃ©rifie la prÃ©sence d'un token dans `AuthService` et redirige vers `/login` si nÃ©cessaire.
- **Interception HTTP :** `authInterceptor` ajoute le token aux requÃªtes protÃ©gÃ©es dans l'en-tÃªte `Authorization`, avec le schÃ©ma `Bearer`, et traite une rÃ©ponse `401`. Il n'ajoute pas le token aux appels de connexion et d'inscription.

Le flux de connexion est :

```text
LoginPageComponent
  â†’ AuthService.login()
  â†’ HttpClient : POST /api/auth/login
  â†’ proxy Angular
  â†’ API Express
  â†’ MongoDB : recherche et vÃ©rification du compte
  â† rÃ©ponse publique de l'utilisateur + JWT
  â†’ localStorage et Ã©tat rÃ©actif AuthService
  â†’ redirection vers /tracks
```

J'ai aussi testÃ© avec succÃ¨s `/api/health`. MongoDB Atlas a Ã©tÃ© configurÃ© ; la base `guitar-practice-cloud` contient notamment les collections `users` et `tracks`.

### 5. Erreurs ou propositions rejetÃ©es

Je n'ai pas eu Ã  rejeter de modification pendant cette mission : l'analyse Ã©tait en lecture seule. J'ai conservÃ© la consigne de ne pas modifier le projet pendant la cartographie.

### 6. Fichiers effectivement modifiÃ©s

**Aucun fichier n'a Ã©tÃ© modifiÃ© pour la Mission 0.**

### 7. Preuve de fonctionnement

J'ai rÃ©ellement vÃ©rifiÃ© que `/api/health` rÃ©pondait avec succÃ¨s. J'ai ajoutÃ© une capture de cette vÃ©rification :

[Preuve TP1 â€” vÃ©rification de l'API](./preuves/tp1-health.png)

Je n'ai pas trouvÃ© de capture de la cartographie rÃ©alisÃ©e par l'agent ; **preuve Ã  ajouter** si elle est demandÃ©e : `./preuves/tp1-analyse-agent.png`.

### 8. Ce que je sais maintenant expliquer sans l'agent

Je sais suivre une requÃªte depuis le composant Angular jusqu'Ã  Express en passant par `HttpClient` et le proxy. Je sais aussi expliquer la diffÃ©rence entre une route frontend protÃ©gÃ©e par un guard et un appel API authentifiÃ© par l'interceptor, ainsi que le rÃ´le respectif des modÃ¨les, services et composants.

---

## Mission 1 â€” Inscription, connexion et profil

### 1. Objectif

Je voulais permettre Ã  une utilisatrice de s'inscrire, se connecter, conserver l'Ã©tat de connexion, accÃ©der Ã  son profil, modifier son nom et se dÃ©connecter.

### 2. Prompt principal

J'ai demandÃ© Ã  l'agent de complÃ©ter le flux d'authentification et de profil en respectant l'architecture existante : formulaires rÃ©actifs, appels aux routes d'API prÃ©vues, gestion du token et du profil, navigation, dÃ©connexion et traitement des rÃ©ponses `401`. Je lui ai demandÃ© de limiter les changements aux Ã©lÃ©ments nÃ©cessaires.

### 3. Plan proposÃ© par l'agent

L'agent a proposÃ© de relier les formulaires d'inscription et de connexion Ã  `AuthService`, de conserver le token reÃ§u aprÃ¨s authentification et de mettre Ã  jour le signal de l'utilisateur. Il a Ã©galement reliÃ© le chargement et l'enregistrement du profil aux appels HTTP protÃ©gÃ©s, puis ajoutÃ© le comportement de dÃ©connexion et de redirection.

### 4. VÃ©rifications rÃ©alisÃ©es

Les formulaires utilisent **Reactive Forms**. L'inscription vÃ©rifie les champs obligatoires, le format de l'email et une longueur minimale de mot de passe ; la connexion vÃ©rifie les champs requis et le format de l'email ; le profil exige un nom.

Les appels concernÃ©s sont :

- `POST /api/auth/register` pour l'inscription ;
- `POST /api/auth/login` pour la connexion ;
- `GET /api/users/me` pour lire le profil ;
- `PUT /api/users/me` pour enregistrer le nom.

AprÃ¨s l'inscription ou la connexion, `AuthService` stocke le JWT dans `localStorage` sous la clÃ© `gpc_token` et met Ã  jour le signal `currentUser`. La page de connexion redirige vers `/tracks` ; l'inscription dirige vers `/profile`. La dÃ©connexion supprime le token du stockage, remet Ã  zÃ©ro les signaux d'authentification et redirige vers `/login`.

L'interceptor transmet le token dans l'en-tÃªte `Authorization` avec le schÃ©ma `Bearer` pour les requÃªtes authentifiÃ©es, sauf aux routes de connexion et d'inscription. Si une requÃªte protÃ©gÃ©e Ã©choue avec `401`, il dÃ©connecte l'utilisateur et le redirige vers la page de connexion.

Je distingue les deux mÃ©canismes de stockage : `localStorage` conserve le token entre les rechargements de la page ; le signal `currentUser` expose l'utilisateur Ã  l'interface pendant l'exÃ©cution de l'application et permet Ã  Angular de rÃ©agir Ã  ses changements. Le guard Angular amÃ©liore la navigation, mais ne sÃ©curise pas une API Ã  lui seul : le backend doit vÃ©rifier le token Ã  chaque route protÃ©gÃ©e.

Le flux de mise Ã  jour du profil est :

```text
profile-page.ts
  â†’ AuthService.update()
  â†’ auth.service.ts
  â†’ PUT /api/users/me
  â†’ backend/src/app.js : authentification et mise Ã  jour
  â†’ backend/src/models/User.js
  â†’ MongoDB
  â† utilisateur public mis Ã  jour
  â†’ mise Ã  jour du signal currentUser
```

Le modÃ¨le `User` hache le mot de passe avant sa sauvegarde et n'expose que les donnÃ©es publiques dans les rÃ©ponses. Pour la mise Ã  jour du profil, le backend recherche l'utilisateur identifiÃ© par le token, modifie son nom et renvoie ses donnÃ©es publiques.

Le build Angular a rÃ©ussi. Les tests automatiques n'ont pas pu Ãªtre exÃ©cutÃ©s, car l'environnement de test ne disposait ni de `jsdom` ni de `happy-dom`. Je n'ai pas ajoutÃ© de dÃ©pendance hors sujet pour contourner ce blocage.

### 5. Erreurs ou propositions rejetÃ©es

L'agent a accidentellement vidÃ© `app.html`, ce qui a provoquÃ© une page blanche. J'ai rejetÃ© ce changement et restaurÃ© le contenu nÃ©cessaire Ã  l'affichage de l'application. Ensuite, j'ai rendu mes consignes plus strictes afin que l'agent ne modifie que le minimum nÃ©cessaire.

PowerShell bloquait l'exÃ©cution de `npm.ps1` ; j'ai donc utilisÃ© `npm.cmd`.

### 6. Fichiers effectivement modifiÃ©s

Le commit Git `14414fe` (Â« Complete TP1 authentication and profile Â») indique les fichiers modifiÃ©s pour l'implÃ©mentation TP1 :

- `frontend-starter/angular.json`
- `frontend-starter/package-lock.json`
- `frontend-starter/src/app/components/app/app.html`
- `frontend-starter/src/app/components/app/app.ts`
- `frontend-starter/src/app/components/login-page/login-page.html`
- `frontend-starter/src/app/components/login-page/login-page.ts`
- `frontend-starter/src/app/components/profile-page/profile-page.html`
- `frontend-starter/src/app/components/profile-page/profile-page.ts`
- `frontend-starter/src/app/components/register-page/register-page.html`
- `frontend-starter/src/app/components/register-page/register-page.ts`
- `frontend-starter/src/app/shared/interceptors/auth.interceptor.ts`

Je me base ici sur les noms enregistrÃ©s dans l'historique Git, et non sur une dÃ©duction Ã  partir du code actuel.

### 7. Preuve de fonctionnement

Le build Angular est la vÃ©rification confirmÃ©e. Les tests automatiques n'ont pas pu Ãªtre exÃ©cutÃ©s Ã  ce stade, car l'environnement de test ne disposait ni de `jsdom` ni de `happy-dom`. J'ai ensuite ajoutÃ© `happy-dom` lors de la Mission 7 du TP3 et les quatre tests frontend ont rÃ©ussi. J'ai aussi capturÃ© le parcours de connexion :

[Preuve TP1 â€” connexion](./preuves/tp1-login.png)

Je n'ai pas trouvÃ© de capture du profil ; **preuve Ã  ajouter** : `./preuves/tp1-profile.png`.

### 8. Ce que je sais maintenant expliquer sans l'agent

Je sais expliquer le rÃ´le des validateurs Reactive Forms, le stockage sÃ©parÃ© du token et des donnÃ©es utilisateur, l'ajout du header d'authentification par l'interceptor et le traitement d'une erreur `401`. Je sais aussi pourquoi la protection du routeur Angular ne remplace pas la vÃ©rification d'autorisation cÃ´tÃ© backend.

---

# TP2 â€” BibliothÃ¨que et audio

## Mission 2 â€” BibliothÃ¨que paginÃ©e

### 1. Objectif

Je voulais afficher les pistes de l'utilisateur par pages, en faisant effectuer la pagination par le serveur plutÃ´t qu'en chargeant toute la bibliothÃ¨que puis en la dÃ©coupant dans le navigateur.

### 2. Prompt principal

J'ai demandÃ© Ã  l'agent de mettre en place une bibliothÃ¨que paginÃ©e Ã  partir de l'API existante, avec un chargement HTTP pour chaque page, un Ã©tat visible de chargement ou d'erreur et des boutons de navigation. J'ai prÃ©cisÃ© que la pagination devait rester cÃ´tÃ© serveur.

### 3. Plan proposÃ© par l'agent

L'agent a proposÃ© d'utiliser `TrackService.list(page, limit)`, de conserver dans `TracksPageComponent` les pistes et les informations de pagination dans des signaux, puis de relancer la requÃªte lors du changement de page. Le template devait afficher les Ã©tats de chargement, d'erreur et de liste vide avec les blocs de contrÃ´le Angular.

### 4. VÃ©rifications rÃ©alisÃ©es

`TrackService.list(page, limit)` appelle `GET /api/tracks?page=...&limit=...`. Le backend filtre les pistes par propriÃ©taire et applique le tri, `skip` et `limit` dans MongoDB. Il renvoie une page contenant `items`, `page`, `limit`, `total` et `pages`. Le frontend ne rÃ©cupÃ¨re donc pas toutes les pistes pour paginer localement.

Dans `TracksPageComponent`, les signaux `tracks`, `page`, `pages` et `loading` stockent l'Ã©tat de la liste ; `libraryError` contient le message d'erreur de chargement. Ã€ chaque clic sur PrÃ©cÃ©dent ou Suivant, le numÃ©ro de page change et `load()` effectue une nouvelle requÃªte HTTP.

Le template utilise `@if` pour les Ã©tats de chargement et d'erreur, `@for` pour parcourir les pistes et `@empty` pour afficher le cas d'une liste vide.

J'ai uploadÃ© plusieurs pistes. Lors de mon essai avec six pistes, l'interface indiquait **Page 1 / 2**, affichait cinq pistes sur la premiÃ¨re page et le bouton Suivant permettait d'accÃ©der Ã  la deuxiÃ¨me page.

### 5. Erreurs ou propositions rejetÃ©es

Je n'ai pas de proposition rejetÃ©e ou d'erreur de pagination supplÃ©mentaire Ã  signaler. Je n'ai pas remplacÃ© la pagination serveur par un dÃ©coupage local.

### 6. Fichiers effectivement modifiÃ©s

Dans l'Ã©tat Git actuel, les fichiers fonctionnels modifiÃ©s pour l'Ã©cran de bibliothÃ¨que sont :

- `frontend-starter/src/app/components/tracks-page/tracks-page.ts`
- `frontend-starter/src/app/components/tracks-page/tracks-page.html`
- `frontend-starter/src/app/components/tracks-page/tracks-page.css`

`TrackService` et les routes backend utilisÃ©s par cette bibliothÃ¨que existent dans le projet ; ils ne figurent pas parmi les fichiers modifiÃ©s dans l'Ã©tat Git observÃ©.

### 7. Preuve de fonctionnement

J'ai vÃ©rifiÃ© manuellement la pagination avec six pistes. La capture de pagination n'est pas prÃ©sente dans le dÃ©pÃ´t ; **preuve Ã  ajouter** : `./preuves/tp2-pagination.png`.

### 8. Ce que je sais maintenant expliquer sans l'agent

Je sais expliquer pourquoi le serveur doit appliquer `skip` et `limit`, ce que reprÃ©sentent `total` et `pages`, et pourquoi le passage Ã  une autre page doit dÃ©clencher un nouvel appel HTTP. La rÃ©ponse paginÃ©e permet de ne charger que les mÃ©tadonnÃ©es nÃ©cessaires Ã  la page affichÃ©e.

---

## Mission 3 â€” Upload et lecture audio

### 1. Objectif

Je voulais permettre Ã  l'utilisateur d'envoyer une piste audio, de retrouver cette piste dans sa bibliothÃ¨que paginÃ©e et de l'Ã©couter aprÃ¨s vÃ©rification de ses droits.

### 2. Prompt principal

J'ai demandÃ© Ã  l'agent de complÃ©ter l'interface d'upload et de lecture audio en s'appuyant sur l'API dÃ©jÃ  prÃ©sente. Je lui ai demandÃ© de vÃ©rifier le fichier et son titre cÃ´tÃ© frontend, d'utiliser `FormData` avec les noms de champs attendus et de charger l'audio avec une requÃªte HTTP authentifiÃ©e avant de le transmettre au lecteur.

### 3. Plan proposÃ© par l'agent

L'agent a proposÃ© de valider le formulaire avant l'envoi, de bloquer une seconde soumission pendant l'upload, de prÃ©senter les Ã©tats d'erreur et de succÃ¨s, puis de rÃ©initialiser le formulaire et de recharger la premiÃ¨re page. Pour la lecture, il a proposÃ© de rÃ©cupÃ©rer un `Blob` par `TrackService`, de crÃ©er une ObjectURL pour le lecteur et de rÃ©voquer les ObjectURL devenues inutiles.

### 4. VÃ©rifications rÃ©alisÃ©es

Le formulaire permet de choisir un fichier et de saisir un titre. Avant l'envoi, le frontend vÃ©rifie que le fichier existe, que le titre n'est pas vide aprÃ¨s suppression des espaces, que le type MIME fait partie des types audio autorisÃ©s et que la taille ne dÃ©passe pas **25 Mo**. Le backend applique Ã©galement ses propres contrÃ´les de taille et de type.

`TrackService.upload()` construit un `FormData` avec exactement les champs `audio` et `title`, puis appelle `POST /api/tracks`. `TracksPageComponent` passe Ã  l'Ã©tat `uploading`, empÃªche un nouvel envoi pendant le traitement et affiche un message d'erreur ou de succÃ¨s. AprÃ¨s le succÃ¨s, le titre et le fichier sont rÃ©initialisÃ©s, l'interface du champ fichier est vidÃ©e, la page revient Ã  la premiÃ¨re page et la bibliothÃ¨que est rechargÃ©e.

Le flux d'upload est :

```text
TracksPageComponent
  â†’ validation frontend
  â†’ TrackService
  â†’ FormData(audio + title)
  â†’ HttpClient
  â†’ authInterceptor
  â†’ POST /api/tracks
  â†’ Express / Multer
  â†’ fichier audio Ã©crit sur disque
  â†’ mÃ©tadonnÃ©es enregistrÃ©es dans MongoDB
```

Le backend conserve les octets audio sur disque et les mÃ©tadonnÃ©es dans MongoDB. Le modÃ¨le de piste associe notamment chaque piste Ã  son propriÃ©taire.

Pour Ã©couter une piste, le clic sur Lire appelle `TrackService.audio(id)`. Ce service effectue un `GET /api/tracks/:id/audio` avec `responseType: 'blob'`. L'interceptor ajoute le token ; le backend recherche la piste en vÃ©rifiant son propriÃ©taire et renvoie le contenu audio. Le frontend crÃ©e ensuite une ObjectURL avec `URL.createObjectURL(blob)` et la transmet au lecteur `<audio>`.

Une URL placÃ©e directement dans `src` d'un Ã©lÃ©ment `<audio>` dÃ©clenche une requÃªte effectuÃ©e par le navigateur, hors de la chaÃ®ne `HttpClient` d'Angular. L'interceptor Angular ne peut donc pas y ajouter automatiquement le header `Authorization`. La requÃªte `HttpClient` permet au contraire l'interception et le passage explicite de l'authentification avant de fournir le Blob au lecteur.

Lorsqu'une nouvelle piste est chargÃ©e, le composant rÃ©voque l'ancienne ObjectURL avant d'en crÃ©er une autre. Il rÃ©voque Ã©galement l'ObjectURL restante Ã  la destruction du composant. L'interface indique la piste en cours de lecture et prÃ©sente un message si le chargement de l'audio Ã©choue. Les cartes de piste s'adaptent aux petits Ã©crans.

J'ai testÃ© rÃ©ellement l'upload de pistes, le message de succÃ¨s, l'affichage de la bibliothÃ¨que, la pagination sur deux pages et la lecture audio, qui a fonctionnÃ©. Le build Angular a rÃ©ussi. Les missions principales TP2 n'ont nÃ©cessitÃ© aucune modification du code source backend.

### 5. Erreurs ou propositions rejetÃ©es

Je n'ai pas de proposition rejetÃ©e ni d'erreur audio particuliÃ¨re Ã  signaler. La capture `tp2-upload.png` montre Ã©galement l'onglet Network et des requÃªtes de la bibliothÃ¨que aprÃ¨s l'upload.

### 6. Fichiers effectivement modifiÃ©s

Pour l'upload et la lecture, les changements fonctionnels visibles dans l'Ã©tat Git concernent les trois fichiers de l'Ã©cran :

- `frontend-starter/src/app/components/tracks-page/tracks-page.ts`
- `frontend-starter/src/app/components/tracks-page/tracks-page.html`
- `frontend-starter/src/app/components/tracks-page/tracks-page.css`

Le CSS ajoute notamment la prÃ©sentation responsive des cartes. `TrackService` et le backend qui reÃ§oit les fichiers et sert l'audio ne figurent pas parmi les fichiers modifiÃ©s dans l'Ã©tat Git observÃ©.

Pour Ãªtre prÃ©cise sur l'Ã©tat du dÃ©pÃ´t, Git signale aussi deux autres fichiers modifiÃ©s qui ne constituent pas l'implÃ©mentation fonctionnelle de l'upload/lecture :

- `frontend-starter/src/app/components/app/app.html` : la navigation affiche Connexion ou DÃ©connexion selon l'Ã©tat du token ;
- `backend/package-lock.json` : fichier de verrouillage modifiÃ©, sans modification correspondante des fichiers source backend pour les missions principales.

### 7. Preuve de fonctionnement

J'ai rÃ©ellement testÃ© l'upload, la pagination et la lecture. J'ai conservÃ© les captures rÃ©ellement prÃ©sentes :

[Preuve TP2 â€” upload](./preuves/tp2-upload.png)

[Preuve TP2 â€” lecture audio](./preuves/tp2-audio.png)

Je n'ai trouvÃ© aucune capture TP2 dÃ©diÃ©e Ã  la pagination. La capture d'upload rÃ©fÃ©rencÃ©e ci-dessus contient toutefois l'onglet Network.

### 8. Ce que je sais maintenant expliquer sans l'agent

Je sais expliquer le rÃ´le de `FormData`, pourquoi ses noms de champs doivent correspondre Ã  ceux attendus par Multer, et pourquoi l'envoi doit passer par `HttpClient` pour bÃ©nÃ©ficier de l'interceptor. Je sais aussi suivre le cycle de vie d'un Blob et de son ObjectURL, ainsi que la diffÃ©rence entre les octets audio stockÃ©s sur disque et les mÃ©tadonnÃ©es conservÃ©es dans MongoDB.

---

## Questions mÃ©moire, buffering et streaming

### 1. Le backend envoie-t-il tout le fichier en mÃ©moire ou peut-il l'envoyer progressivement depuis le disque ?

Dans le code actuel, la route audio utilise `res.sendFile(audioPath)` au lieu de lire explicitement tout le fichier avec une fonction de lecture complÃ¨te avant l'envoi. Express peut transfÃ©rer le fichier depuis le disque progressivement au moyen du flux de rÃ©ponse. Cela Ã©vite d'avoir Ã  construire d'abord un grand tampon JavaScript contenant tout le fichier ; cela n'exclut pas les tampons internes du systÃ¨me et du rÃ©seau.

### 2. Avec `HttpClient` et `responseType: "blob"`, Ã  quel moment Angular reÃ§oit-il gÃ©nÃ©ralement le fichier ?

Dans l'appel prÃ©sent dans `TrackService.audio()`, le composant reÃ§oit le Blob dans `next` lorsque la rÃ©ponse HTTP est terminÃ©e. Ce code n'exploite pas un flux audio progressif : le frontend rÃ©cupÃ¨re la rÃ©ponse complÃ¨te avant de crÃ©er l'ObjectURL et d'alimenter le lecteur.

### 3. Avec 100 pistes, les 100 fichiers audio sont-ils chargÃ©s en mÃ©moire dÃ¨s l'affichage ?

Non. L'appel de bibliothÃ¨que charge une page de mÃ©tadonnÃ©es au format JSON ; il ne tÃ©lÃ©charge pas les fichiers audio. Le code ne demande le Blob d'une piste que lorsque je clique sur Lire.

### 4. Quelle diffÃ©rence avec 100 Ã©lÃ©ments `<audio>` ayant chacun une URL HTTP ?

Avec une URL HTTP dans chaque Ã©lÃ©ment, le navigateur gÃ¨re les requÃªtes audio indÃ©pendamment, selon ses rÃ¨gles et l'attribut `preload` ; les 100 fichiers ne sont donc pas nÃ©cessairement tous tÃ©lÃ©chargÃ©s intÃ©gralement dÃ¨s l'affichage. En revanche, ces requÃªtes ne passent pas par `HttpClient` et ne reÃ§oivent pas automatiquement l'en-tÃªte d'authentification ajoutÃ© par l'interceptor Angular. Dans le code du projet, je tÃ©lÃ©charge seulement l'audio demandÃ© avec `HttpClient`, puis je fournis un Blob au lecteur.

### 5. Pourquoi faut-il appeler `URL.revokeObjectURL()` ?

Une ObjectURL maintient une rÃ©fÃ©rence permettant au navigateur d'accÃ©der au Blob. Je rÃ©voque l'ancienne URL lorsque je charge une autre piste et la derniÃ¨re Ã  la destruction du composant afin de libÃ©rer cette rÃ©fÃ©rence lorsque je n'en ai plus besoin.

---

---

# TP3 â€” Fiabilisation et enrichissement du frontend

## Mission 5 â€” Suppression d'une piste

### 1. Objectif

Je voulais permettre la suppression d'une piste depuis chaque carte de la bibliothÃ¨que, tout en demandant confirmation, en donnant un retour clair et en conservant la pagination serveur.

### 2. Prompt principal

J'ai demandÃ© Ã  l'agent d'utiliser la route backend dÃ©jÃ  existante `DELETE /api/tracks/:id` pour ajouter la suppression cÃ´tÃ© frontend. Je lui ai demandÃ© de garder les appels HTTP dans `TrackService`, d'ajouter une confirmation et un Ã©tat empÃªchant les doubles clics, de traiter le rÃ©sultat et le cas du 404, et de revenir Ã  la page prÃ©cÃ©dente si la suppression rendait la page courante vide. Le sujet imposant un SnackBar, j'ai ensuite demandÃ© l'ajout ciblÃ© de MatSnackBar.

### 3. Plan proposÃ© par l'agent

L'agent a proposÃ© d'ajouter `delete(id)` au service, puis de relier un bouton Supprimer Ã  une mÃ©thode du composant. Cette mÃ©thode confirmerait l'action, suivrait l'identifiant en cours de suppression, appellerait le service, prÃ©senterait le rÃ©sultat dans MatSnackBar et rechargerait la bibliothÃ¨que.

### 4. VÃ©rifications rÃ©alisÃ©es

J'ai ajoutÃ© `TrackService.delete(id)`, qui appelle `DELETE /api/tracks/:id`. Le composant ne crÃ©e pas lui-mÃªme de requÃªte `HttpClient` : il dÃ©lÃ¨gue cet appel Ã  `TrackService`. Chaque carte propose un bouton Supprimer ; `window.confirm` demande l'accord avant l'appel et un signal contenant l'identifiant en cours de suppression empÃªche les clics rÃ©pÃ©tÃ©s sur cette piste.

AprÃ¨s un succÃ¨s, MatSnackBar affiche `Piste supprimÃ©e avec succÃ¨s.` La liste est rechargÃ©e depuis le serveur. Si la piste supprimÃ©e Ã©tait la derniÃ¨re de la page et que la page est supÃ©rieure Ã  1, je passe d'abord Ã  la page prÃ©cÃ©dente afin que le rechargement n'affiche pas une page vide.

En cas de `404`, MatSnackBar affiche `Piste introuvable ou inaccessible. Elle a peut-Ãªtre dÃ©jÃ  Ã©tÃ© supprimÃ©e.` et le composant recharge la bibliothÃ¨que, car la piste peut avoir Ã©tÃ© supprimÃ©e dans un autre onglet. Pour une autre erreur, le message est `Impossible de supprimer la piste.`

Angular Material n'Ã©tait pas installÃ© initialement. J'ai ajoutÃ© `@angular/material` **22.1.0**, compatible avec le major Angular 22, et configurÃ© le thÃ¨me nÃ©cessaire Ã  son affichage. Je n'ai utilisÃ© MatSnackBar que pour le rÃ©sultat de suppression ; les messages d'upload restent ceux de TP2/TP3.

La sÃ©curitÃ© ne repose pas sur le bouton ni sur `authGuard` : le guard contrÃ´le la navigation Angular, mais une personne peut appeler l'API directement sans passer par Angular. Le backend vÃ©rifie rÃ©ellement le JWT et vÃ©rifie aussi que la piste recherchÃ©e appartient Ã  l'utilisateur authentifiÃ©. Le frontend n'essaie pas de contourner le 404 utilisÃ© lorsque la piste est absente ou inaccessible.

J'ai testÃ© la suppression dans le navigateur et observÃ© dans Network la requÃªte DELETE avec le statut HTTP `204`, suivie du rechargement de la bibliothÃ¨que par `GET /api/tracks?page=1&limit=5`. Cette preuve ne prÃ©tend pas montrer la valeur d'un en-tÃªte d'authentification.

### 5. Erreurs ou propositions rejetÃ©es

MatSnackBar Ã©tant explicitement exigÃ©, j'ai d'abord vÃ©rifiÃ© sa disponibilitÃ©. Comme Angular Material n'Ã©tait pas installÃ©, je me suis arrÃªtÃ©e pour demander confirmation avant l'installation ; aprÃ¨s accord, j'ai ajoutÃ© uniquement la version compatible. J'ai conservÃ© le reste du comportement de suppression et les messages d'upload.

### 6. Fichiers effectivement modifiÃ©s

Pour la suppression et son SnackBar, j'ai modifiÃ© :

- `frontend-starter/src/app/shared/services/track.service.ts`
- `frontend-starter/src/app/components/tracks-page/tracks-page.ts`
- `frontend-starter/src/app/components/tracks-page/tracks-page.html`
- `frontend-starter/src/app/components/tracks-page/tracks-page.css`
- `frontend-starter/package.json`
- `frontend-starter/package-lock.json`
- `frontend-starter/angular.json`

### 7. Preuve de fonctionnement

[Preuve TP3 â€” suppression et requÃªte HTTP observÃ©e](./preuves/tp3-delete.png)

### 8. Ce que je sais maintenant expliquer sans l'agent

Je sais expliquer pourquoi le composant passe par `TrackService` pour envoyer DELETE, pourquoi la confirmation et l'Ã©tat de suppression sont utiles, et pourquoi la pagination doit reculer si la page courante devient vide. Je sais aussi expliquer que seule l'autorisation vÃ©rifiÃ©e par le backend protÃ¨ge rÃ©ellement la suppression : une interface Angular peut Ãªtre contournÃ©e par un appel HTTP direct.

---

## Mission 6 â€” Progression de l'upload

### 1. Objectif

Je voulais rendre visible l'avancement de l'envoi d'un fichier audio sans casser l'upload TP2, ses validations, ses messages ni le rechargement de la bibliothÃ¨que.

### 2. Prompt principal

J'ai demandÃ© Ã  l'agent de faire Ã©voluer `TrackService.upload()` pour observer les Ã©vÃ©nements HTTP, puis de distinguer les Ã©vÃ©nements de progression de la rÃ©ponse finale dans le composant. J'ai demandÃ© de conserver les validations et le comportement de succÃ¨s/erreur existants et de ne diviser que si le total transmis Ã©tait disponible et non nul.

### 3. Plan proposÃ© par l'agent

L'agent a proposÃ© d'activer `reportProgress: true` et `observe: 'events'`, d'utiliser `HttpEventType.UploadProgress` pour mettre Ã  jour un signal numÃ©rique, puis de traiter sÃ©parÃ©ment l'Ã©vÃ©nement de rÃ©ponse finale. Le template afficherait une barre accessible et le pourcentage lorsqu'il est connu.

### 4. VÃ©rifications rÃ©alisÃ©es

J'ai conservÃ© l'upload TP2 et l'ai enrichi : `TrackService.upload()` observe maintenant les Ã©vÃ©nements HTTP Angular avec `reportProgress: true` et `observe: 'events'`. Le composant reprÃ©sente l'absence d'upload, l'envoi en cours, la progression connue, la rÃ©ussite et l'Ã©chec. Lorsque l'Ã©vÃ©nement est `HttpEventType.UploadProgress` et que `event.total` est disponible et supÃ©rieur Ã  zÃ©ro, il calcule :

```ts
Math.round((100 * event.loaded) / event.total)
```

Je n'effectue donc pas de division si le total est absent ou nul. Pendant l'envoi, les contrÃ´les concernÃ©s sont dÃ©sactivÃ©s et une nouvelle soumission est empÃªchÃ©e. Je conserve les validations de titre, de type audio et de taille maximale de 25 Mo, le message de succÃ¨s ou d'erreur, la remise Ã  zÃ©ro du formulaire aprÃ¨s succÃ¨s, le retour Ã  la page 1 et le rechargement de la liste.

Le frontend n'utilise pas `withFetch()` : il utilise la configuration HTTP Angular avec le backend standard, adaptÃ©e Ã  l'observation de la progression d'upload.

Un appel HTTP classique fournit gÃ©nÃ©ralement une rÃ©ponse finale Ã  son abonnÃ©. Avec la progression, la requÃªte Ã©met plusieurs Ã©vÃ©nements intermÃ©diaires. Le composant doit donc reconnaÃ®tre `UploadProgress` et le distinguer de l'Ã©vÃ©nement de rÃ©ponse finale, qui seul dÃ©clenche le succÃ¨s, le reset et le rechargement.

J'ai vÃ©rifiÃ© le build Angular aprÃ¨s cette Ã©volution. Je n'ai pas trouvÃ© de capture de progression dans le dÃ©pÃ´t ; elle reste Ã  ajouter si elle est requise.

### 5. Erreurs ou propositions rejetÃ©es

Je n'ai pas ajoutÃ© de deuxiÃ¨me mÃ©canisme rÃ©seau ni remplacÃ© l'upload existant. J'ai conservÃ© le service comme point unique d'accÃ¨s HTTP et gardÃ© les messages d'upload hors du SnackBar, qui est rÃ©servÃ© Ã  la suppression.

### 6. Fichiers effectivement modifiÃ©s

Pour la progression d'upload, j'ai modifiÃ© :

- `frontend-starter/src/app/shared/services/track.service.ts`
- `frontend-starter/src/app/components/tracks-page/tracks-page.ts`
- `frontend-starter/src/app/components/tracks-page/tracks-page.html`
- `frontend-starter/src/app/components/tracks-page/tracks-page.css`

### 7. Preuve de fonctionnement

**Preuve Ã  ajouter :** `./preuves/tp3-upload-progress.png` (le fichier n'est pas prÃ©sent dans le dÃ©pÃ´t).

### 8. Ce que je sais maintenant expliquer sans l'agent

Je sais expliquer qu'une progression nÃ©cessite de recevoir les Ã©vÃ©nements intermÃ©diaires de la requÃªte, de calculer un pourcentage seulement avec un total valable, et de traiter sÃ©parÃ©ment la rÃ©ponse finale. Je sais aussi que la validation frontend ne remplace pas les contrÃ´les backend.

---

## Mission 7 â€” Tests automatisÃ©s frontend

### 1. Objectif

Je voulais tester sans backend ni MongoDB les appels HTTP de connexion, de pagination et de suppression, ainsi que l'ajout du header par l'interceptor.

### 2. Prompt principal

J'ai demandÃ© quatre tests frontend ciblÃ©s : `AuthService.login()`, `TrackService.list()`, `authInterceptor` et `TrackService.delete()`. J'ai imposÃ© des valeurs factices, des requÃªtes HTTP simulÃ©es, la vÃ©rification des dÃ©tails des requÃªtes et l'absence de dÃ©pendance au backend rÃ©el.

### 3. Plan proposÃ© par l'agent

L'agent a commencÃ© par lancer le test frontend existant, puis a ajoutÃ© l'environnement DOM manquant et a utilisÃ© `HttpTestingController`, `provideHttpClient()` et `provideHttpClientTesting()` pour intercepter et simuler les requÃªtes. Pour l'interceptor, il a configurÃ© le vrai interceptor du projet dans les providers de test et fourni le routeur requis.

### 4. VÃ©rifications rÃ©alisÃ©es

La premiÃ¨re exÃ©cution de `npm.cmd test` Ã©chouait parce qu'aucun environnement DOM n'Ã©tait installÃ©. J'ai ajoutÃ© uniquement `happy-dom` **20.14.5** en dÃ©pendance de dÃ©veloppement. L'exÃ©cution suivante a rÃ©vÃ©lÃ© que le builder cherchait `gpc:build:development`, configuration inexistante dans `angular.json` ; j'ai configurÃ© le build target de test comme `gpc:build`.

J'ai crÃ©Ã© trois fichiers de tests :

- `src/app/shared/services/auth.service.spec.ts`
- `src/app/shared/services/track.service.spec.ts`
- `src/app/shared/interceptors/auth.interceptor.spec.ts`

Les quatre tests exÃ©cutÃ©s ont vÃ©rifiÃ© :

1. **`AuthService.login()`** : mÃ©thode `POST`, URL `/api/auth/login`, corps avec des identifiants fictifs, rÃ©ponse contenant un faux utilisateur et un faux token, et valeur reÃ§ue par le subscriber.
2. **`TrackService.list()`** : mÃ©thode `GET`, URL `/api/tracks`, paramÃ¨tres `page=2` et `limit=5`, puis rÃ©ponse paginÃ©e simulÃ©e reÃ§ue.
3. **`authInterceptor`** : prÃ©sence du header `Authorization` avec le schÃ©ma Bearer et un token fictif sur une requÃªte protÃ©gÃ©e.
4. **`TrackService.delete()`** : mÃ©thode `DELETE`, URL `/api/tracks/track-123` et complÃ©tion de l'Observable aprÃ¨s une rÃ©ponse simulÃ©e `204`.

`HttpTestingController` permet d'intercepter les requÃªtes `HttpClient` et de fournir des rÃ©ponses simulÃ©es. Les tests ne dÃ©marrent donc pas l'API, n'utilisent pas MongoDB et n'emploient aucune donnÃ©e rÃ©elle. Les contrÃ´les de nettoyage vÃ©rifient qu'aucune requÃªte inattendue ne reste ouverte.

Le rÃ©sultat rÃ©el de `npm.cmd test` est **3 fichiers rÃ©ussis, 4 tests rÃ©ussis et 0 Ã©chec**.

### 5. Erreurs ou propositions rejetÃ©es

J'ai corrigÃ© la configuration du build target requise pour lancer les tests avec le builder prÃ©sent, sans ajouter un autre framework et sans modifier les tests pour introduire des accÃ¨s backend. Je n'ai pas ajoutÃ© de tests backend facultatifs.

### 6. Fichiers effectivement modifiÃ©s

Pour la configuration et les tests frontend, j'ai modifiÃ© :

- `frontend-starter/angular.json`
- `frontend-starter/package.json`
- `frontend-starter/package-lock.json`
- `frontend-starter/src/app/shared/services/auth.service.spec.ts`
- `frontend-starter/src/app/shared/services/track.service.spec.ts`
- `frontend-starter/src/app/shared/interceptors/auth.interceptor.spec.ts`

### 7. Preuve de fonctionnement

[Preuve TP3 â€” tests frontend](./preuves/tp3-tests-frontend.png)

Les tests backend existants ont Ã©tÃ© exÃ©cutÃ©s sÃ©parÃ©ment avec `npm.cmd test` dans le dossier backend : `health sans dÃ©pendre de MongoDB` et `schÃ©mas Mongoose et relation`. RÃ©sultat rÃ©el : **2 tests exÃ©cutÃ©s, 2 rÃ©ussis, 0 Ã©chec**. Je n'ai ajoutÃ© aucun test backend facultatif.

Je n'ai pas trouvÃ© de capture des tests backend ; **preuve Ã  ajouter** si elle est nÃ©cessaire : `./preuves/tp3-tests-backend.png`.

### 8. Ce que je sais maintenant expliquer sans l'agent

Je sais expliquer pourquoi des tests HTTP avec `HttpTestingController` n'ont pas besoin de MongoDB, et ce qu'un test de l'interceptor vÃ©rifie : le passage d'une requÃªte rÃ©elle dans la logique de l'interceptor configurÃ© et l'ajout attendu de l'en-tÃªte. Je distingue un **test unitaire**, qui vÃ©rifie une unitÃ© isolÃ©e avec ses dÃ©pendances simulÃ©es, d'un **test d'intÃ©gration**, qui vÃ©rifie que plusieurs composants rÃ©els fonctionnent ensemble.

---

## VÃ©rification finale TP3

J'ai exÃ©cutÃ© `npm.cmd run build`. Le build a rÃ©ussi avec le message `Application bundle generation complete` et a gÃ©nÃ©rÃ© la sortie dans `dist/gpc`.

[Preuve TP3 â€” build Angular](./preuves/tp3-build.png)

### RÃ©sultat global des tests

- **Frontend :** 4 tests rÃ©ussis sur 4, 0 Ã©chec.
- **Backend existant :** 2 tests rÃ©ussis sur 2, 0 Ã©chec.
- **Total :** 6 tests rÃ©ussis sur 6, 0 Ã©chec.
- **Build Angular :** rÃ©ussi.

### Fichiers TP3 et Ã©tat Git

Les fichiers frontend concernÃ©s par les missions obligatoires TP3, d'aprÃ¨s les modifications prÃ©sentes dans Git, sont :

- `frontend-starter/angular.json`
- `frontend-starter/package.json`
- `frontend-starter/package-lock.json`
- `frontend-starter/src/app/shared/services/track.service.ts`
- `frontend-starter/src/app/components/tracks-page/tracks-page.ts`
- `frontend-starter/src/app/components/tracks-page/tracks-page.html`
- `frontend-starter/src/app/components/tracks-page/tracks-page.css`
- `frontend-starter/src/app/shared/services/auth.service.spec.ts`
- `frontend-starter/src/app/shared/services/track.service.spec.ts`
- `frontend-starter/src/app/shared/interceptors/auth.interceptor.spec.ts`

Je n'ai modifiÃ© aucun code backend pour les missions obligatoires du TP3. `backend/package-lock.json` apparaÃ®t Ã©galement modifiÃ© dans l'Ã©tat Git, mais il Ã©tait dÃ©jÃ  signalÃ© comme modifiÃ© avant les travaux TP3 dans l'historique de cette session ; je ne le compte donc pas comme un changement des missions TP3. Le template `frontend-starter/src/app/components/app/app.html` est aussi un changement antÃ©rieur du TP2, sans lien avec ces missions TP3.

### Restitution orale

Ã€ la fin du TP3, je sais expliquer :

1. pourquoi l'appel DELETE est centralisÃ© dans un service plutÃ´t que placÃ© directement dans le composant ;
2. comment le backend vÃ©rifie le JWT et la propriÃ©tÃ© de la piste avant d'autoriser sa suppression ;
3. comment Angular calcule le pourcentage d'upload Ã  partir des Ã©vÃ©nements de progression ;
4. pourquoi un test HTTP isolÃ© peut simuler la rÃ©ponse sans MongoDB ;
5. ce que vÃ©rifie un test de l'interceptor en contrÃ´lant l'en-tÃªte de la requÃªte ;
6. la diffÃ©rence entre test unitaire avec dÃ©pendances simulÃ©es et test d'intÃ©gration entre composants rÃ©els.

---

## Ã‰tat des preuves TP1, TP2 et TP3

Les captures prÃ©sentes dans le dÃ©pÃ´t se trouvent dans `./preuves/` :

- TP1 health : [tp1-health.png](./preuves/tp1-health.png)
- TP1 connexion : [tp1-login.png](./preuves/tp1-login.png)
- TP2 upload : [tp2-upload.png](./preuves/tp2-upload.png)
- TP2 lecture audio : [tp2-audio.png](./preuves/tp2-audio.png)
- TP3 suppression : [tp3-delete.png](./preuves/tp3-delete.png)
- TP3 tests frontend : [tp3-tests-frontend.png](./preuves/tp3-tests-frontend.png)
- TP3 build : [tp3-build.png](./preuves/tp3-build.png)

Je n'ai pas trouvÃ© les captures suivantes dans le dÃ©pÃ´t ; elles restent Ã  ajouter si elles sont nÃ©cessaires :

- TP1 cartographie/analyse de l'agent ;
- TP1 profil (`tp1-profile.png`) ;
- TP2 pagination (`tp2-pagination.png`) ;
- TP2 capture Network ;
- TP3 progression upload (`tp3-upload-progress.png`) ;
- TP3 tests backend (`tp3-tests-backend.png`).


