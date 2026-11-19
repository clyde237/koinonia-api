# API Koinonia · identité Neon Auth et profils

L’identité est assurée par **Better Auth géré par Neon**. L’application mobile communique avec le service Neon Auth et conserve ses cookies dans Expo SecureStore. Elle demande un JWT au point d’entrée `/token` pour accéder à cette API. Le jeton de session opaque renvoyé par `/get-session` ne remplace pas ce JWT.

L’API TypeScript utilise Hono, `jose` et le pilote PostgreSQL HTTP officiel de Neon. Elle vérifie la signature EdDSA, l’expiration, l’émetteur et l’audience avant toute lecture ou écriture du profil. Les URL PostgreSQL restent uniquement dans le fichier `.env` du serveur.

## Démarrer

Depuis `koinonia-api` :

```bash
npm install
npm run db:check
npm run db:migrate
npm run dev
```

Le `.env` de développement est déjà renseigné pour la branche fournie. Il est exclu des commits. Pour un autre poste, copier `.env.example` vers `.env`, puis renseigner ses valeurs. La migration crée uniquement `koinonia_profiles` et `koinonia_migrations` ; les tables gérées par Neon Auth ne sont pas recréées.

Dans un deuxième terminal :

```bash
cd ../koinonia-app
npm install
npx expo start -c
```

Le téléphone et le PC doivent pouvoir communiquer sur le réseau local. L’application déduit l’adresse du PC depuis le serveur Metro d’Expo Go. Si nécessaire, créer `koinonia-app/.env.local` et y définir **uniquement les valeurs publiques** :

```dotenv
EXPO_PUBLIC_API_URL=http://IP_LOCALE_DU_PC:3000
EXPO_PUBLIC_AUTH_ORIGIN=http://localhost:3000
EXPO_PUBLIC_NEON_AUTH_URL=https://VOTRE_SERVICE_NEON_AUTH/neondb/auth
```

Ne pas utiliser `localhost` comme URL d’API sur un téléphone physique : ce serait le téléphone lui-même. Pour l’émulateur Android standard, utiliser `http://10.0.2.2:3000`. Ne jamais mettre les URL PostgreSQL dans une variable `EXPO_PUBLIC_*`.

L’origine d’authentification est différente de l’adresse réseau de l’API : elle représente l’origine autorisée par Neon pour les requêtes du client natif. `http://localhost:3000` a été vérifiée sur la branche de développement actuelle. L’option « Allow Localhost » doit rester activée dans Neon pendant ce développement. En production, fournir une origine HTTPS propre au projet, l’autoriser dans Neon et renseigner les trois variables publiques pour cet environnement.

## Parcours disponibles

- Création d’un compte et connexion avec e-mail et mot de passe.
- Restauration de session via SecureStore ; reprise à la dernière étape enregistrée de l’onboarding ou ouverture de l’accueil si le parcours est terminé.
- Sauvegarde du profil et des préférences à chaque étape. Une erreur n’efface pas les champs ni ne fait avancer l’étape.
- Déconnexion depuis le profil ou les réglages.
- Changement du mot de passe avec vérification du mot de passe actuel et révocation des autres sessions Better Auth.
- Vérification d’adresse et récupération du compte par code e-mail. Les réponses et erreurs de Neon sont affichées sans annoncer une réussite avant confirmation du service.
- Enregistrement de la photo de profil dans le stockage local de développement de l’API. Les images sont accessibles uniquement au propriétaire authentifié.

L’écran d’accueil contient encore des méditations et communautés de démonstration. Les communautés sélectionnées pendant l’onboarding sont des préférences conservées ; elles ne constituent pas encore des demandes envoyées à des administrateurs.

## E-mails sans Brevo

Neon Auth dispose d’un SMTP partagé pour le développement. Il prend en charge les codes de vérification et la récupération de mot de passe. L’activation des fonctionnalités se règle dans **Settings → Better Auth** de la branche. La vérification d’adresse n’est pas obligatoire par défaut ; le champ `emailVerified` n’est jamais mis à `true` artificiellement.

Aucun SMTP local ni boîte de réception simulée n’est utilisé dans cette version gérée par Neon. Pour Brevo, renseigner plus tard les paramètres « Custom SMTP provider » dans Neon : hôte, port, identifiant, mot de passe SMTP et expéditeur vérifié. La configuration de l’envoi appartient au service Neon Auth. La réception réelle des codes devra être vérifiée avec une adresse qui vous appartient.

## Données et identité

L’URL Auth fournie comporte `/neondb/auth` tandis que les profils sont enregistrés dans `koinonia_db`. Ce sont deux destinations distinctes sur la branche : l’API utilise l’identifiant externe `sub` vérifié dans le JWT. Elle ne crée pas de clé étrangère vers une table d’utilisateurs supposée exister dans `koinonia_db`.

Un JWT déjà délivré peut rester utilisable par une API indépendante jusqu’à son expiration après déconnexion ou révocation de session ; les JWT Neon sont de courte durée. Le client ne les conserve pas en stockage persistant et redemande un jeton avec sa session pour les nouvelles requêtes. Les signatures publiques sont mises en cache et rechargées lors des rotations.

Les photos dans `.data/avatars` sont une solution **de développement**. Avant un hébergement sans disque persistant ou une mise en production, remplacer cette couche par Cloudflare R2, comme prévu dans le cadrage. Les mots de passe des utilisateurs ne sont jamais enregistrés par l’API Koinonia.

## Contrôles

```bash
npm run typecheck
npm run build
npm test
npm run test:integration
```

Le test d’intégration contacte réellement la branche de développement. Il utilise un compte technique sous `example.invalid`, vérifie sa session, son JWT, le changement de mot de passe, la persistance du profil et l’importation/lecture/suppression d’une photo privée, puis supprime son profil de test et ferme sa session. Ce compte unique est conservé et réutilisé à l’aide d’un fichier privé `.data/integration-user.json` ; il ne crée pas un nouvel utilisateur à chaque exécution. Le service géré n’expose pas `/delete-user` : la suppression définitive de comptes se fait depuis Neon Console. Les premiers essais ont laissé quelques comptes portant les préfixes `koinonia-test-` et `koinonia-integration-`, exclusivement sur la branche dev. Il ne faut pas l’exécuter sur une base de production. Les tests unitaires refusent notamment les jetons forgés, expirés, provenant d’un autre émetteur et les tentatives de modifier l’identité par le formulaire de profil.

## Références

- [Intégration Expo de Better Auth](https://better-auth.com/docs/integrations/expo)
- [JWT dans Neon Auth](https://neon.com/docs/auth/guides/plugins/jwt)
- [E-mails et paramètres SMTP de Neon Auth](https://neon.com/docs/auth/production-checklist)
- [Pilote PostgreSQL HTTP Neon](https://neon.com/docs/serverless/serverless-driver)

## Vérifications effectuées le 18 novembre 2026

Les contrôles TypeScript du mobile et de l’API, la compilation de l’API et l’export Android ont réussi. Les tests unitaires passent. Sur les services réels de la branche dev, l’inscription, la reconnexion, la déconnexion, la validation JWT/JWKS, le refus d’un mauvais mot de passe, le changement de mot de passe, la sauvegarde/relecture du profil et le cycle d’une photo privée ont été vérifiés. Les points d’entrée de vérification et de récupération refusent un code OTP invalide.

La réception d’un vrai e-mail et le parcours complet dans Expo Go sur le téléphone ne sont pas vérifiés depuis cet environnement. Démarrer l’API sur le PC et tester l’application avec une adresse e-mail qui vous appartient.
