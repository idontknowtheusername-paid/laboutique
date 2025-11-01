Introduction
Bien démarrer
Apprenez à intégrer nos API dans vos applications

Vous devez créer un compte gratuit Lygos pour commencer à utiliser nos servces API.
​

Nos API
Nos API reposent sur les principes REST, une architecture qui garantit des services fiables, flexibles et faciles à intégrer. Elles utilisent les méthodes HTTP classiques comme GET, POST, PUT et DELETE pour interagir avec les ressources. Les réponses sont toujours au format JSON, ce qui les rend simples à comprendre et à utiliser avec les outils de développement modernes. Que vous construisiez une application, connectiez des systèmes ou enrichissiez votre plateforme, nos API sont là pour vous offrir une expérience fluide et agréable.


En apprendre davantage sur REST
View the OpenAPI specification file
​

Réponses et erreurs
Voici la liste des erreurs et des réponses associées que vous pourrez rencontrer durant la mise en place des API dans votre application. Lygos maintient un formattage clair et comprehensible pour vous faciliter l’intégration.

Code Statut	Catégorie	Description	Exemple
200	Succès	La requête a réussi, et le serveur a renvoyé les données attendues.	GET /users renvoie une liste d’utilisateurs.
201	Créé	La ressource a été créée avec succès.	POST /users renvoie les détails du nouvel utilisateur.
204	Aucun Contenu	La requête a réussi, mais aucune donnée n’est retournée.	DELETE /users/{id} après suppression réussie d’un utilisateur.
400	Requête Incorrecte	Le serveur n’a pas compris la requête en raison d’une syntaxe invalide.	Champs obligatoires manquants dans une requête POST.
401	Non Autorisé	Une authentification est requise ou a échoué.	Jeton API manquant ou invalide.
403	Interdit	Le client n’a pas les permissions nécessaires pour accéder à la ressource.	Tentative d’accès à des données restreintes.
404	Non Trouvé	La ressource demandée est introuvable.	GET /users/{id} pour un utilisateur inexistant.
409	Conflit	La requête entre en conflit avec l’état actuel du serveur.	Tentative de création d’une ressource en double.
422	Entité Non Traitée	La requête est bien formée mais contient des données invalides.	Données invalides pour la création d’une ressource.
500	Erreur Serveur Interne	Le serveur a rencontré une condition inattendue.	Erreurs générales ou exceptions inattendues du serveur.
502	Mauvaise Passerelle	Le serveur a reçu une réponse invalide d’un serveur en amont.	Problème temporaire avec les services en amont.
503	Service Indisponible	Le serveur est temporairement incapable de traiter la requête (surcharge ou maintenance).	Panne planifiée ou surcharge du serveur.
504	Délai d’Attente	Le serveur n’a pas reçu de réponse à temps d’un serveur en amont.	Requêtes longues causant des délais d’attente.
​

Authentification
Pour comprendre comment gérer l’authentification, vous pouvez vous réferrer à la section Authentification du guide.

    Introduction
Environnements et URLs
Informations concernant nos URLs et environnements.
​

Environnements disponibles
Actuellement, nous disposons uniquement d’un environnement de production. D’autres environnements (staging, développement) pourront être ajoutés ultérieurement en fonction des besoins.
​

Production
* 		API Backend : https://api.lygosapp.com/v1/
​

Accès et Sécurité
* 		L’accès à l’API nécessite une authentification via clé API ou OAuth selon les endpoints.
* 		Toutes les communications passent par HTTPS pour garantir la sécurité des échanges.
* 		Pour accéder aux endpoints de l’environnement ci-dessus, utilisez la base d’URL suivante : Copy  https://api.lygosapp.com/v1/
* 		    

Bien démarrer
List Payment Gateways


   Gateway
List Payment Gateways
GET
/
v1
/
gateway
Try it

List Payment Gateways

Copy
curl --request GET \
  --url https://api.lygosapp.com/v1/gateway \
  --header 'api-key: <api-key>'
200401404

422

Copy
{
  "detail": {
    "message": "API Key not found",
    "type": "API_KEY_NOT_FOUND"
  }
}
Headers

api-key
string | nullrequired

Response
200

application/json
Successful Response

id
string<uuid>required


amount
integerrequired


currency
stringrequired


shop_name
stringrequired


user_id
string<uuid>required


creation_date
string<date-time>required


link
stringrequired


message
string | nulldefault:""


order_id
string | nulldefault:""


success_url
string | nulldefault:""


failure_url
string | nulldefault:""


Environnements et URLs
Create Payment Gateway


Create Payment Gateway
POST
/
v1
/
gateway
Try it

Create Payment Gateway

Copy
curl --request POST \
  --url https://api.lygosapp.com/v1/gateway \
  --header 'Content-Type: application/json' \
  --header 'api-key: <api-key>' \
  --data '{
  "amount": 123,
  "shop_name": "<string>",
  "message": "<string>",
  "success_url": "<string>",
  "failure_url": "<string>",
  "order_id": "<string>"
}'
200401404

422

Copy
{
  "detail": {
    "message": "API Key not found",
    "type": "API_KEY_NOT_FOUND"
  }
}
Headers

api-key
string | nullrequired

Body
application/json

amount
integerrequired


shop_name
stringrequired


order_id
stringrequired


message
string | nulldefault:""


success_url
string | nulldefault:""


failure_url
string | nulldefault:""

Response
200

application/json
Successful Response

id
string<uuid>required


amount
integerrequired


currency
stringrequired


shop_name
stringrequired


user_id
string<uuid>required


creation_date
string<date-time>required


link
stringrequired


message
string | nulldefault:""


order_id
string | nulldefault:""


success_url
string | nulldefault:""


failure_url
string | nulldefault:""


List Payment Gateways
Get Gateway




  Gateway
Get Gateway
GET
/
v1
/
gateway
/
{gateway_id}
Try it

Get Gateway

Copy
curl --request GET \
  --url https://api.lygosapp.com/v1/gateway/{gateway_id}

Copy
{
  "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "amount": 123,
  "currency": "<string>",
  "shop_name": "<string>",
  "message": "<string>",
  "user_country": {
    "name": "Cameroon",
    "iso_code": "CMR"
  },
  "creation_date": "2023-11-07T05:31:56Z",
  "link": "<string>",
  "order_id": "<string>",
  "success_url": "<string>",
  "failure_url": "<string>"
}
Path Parameters

gateway_id
string<uuid>required

Response
200

application/json
Successful Response

id
string<uuid>required


amount
integerrequired


currency
stringrequired


shop_name
stringrequired


message
stringrequired


user_country
objectrequired

Show child attributes








creation_date
string<date-time>required


link
stringrequired


success_url
stringrequired


failure_url
stringrequired


order_id
string | nulldefault:""


Create Payment Gateway
Update Gateway




Gateway
Update Gateway
PUT
/
v1
/
gateway
/
{gateway_id}
Try it

Update Gateway

Copy
curl --request PUT \
  --url https://api.lygosapp.com/v1/gateway/{gateway_id} \
  --header 'Content-Type: application/json' \
  --header 'api-key: <api-key>' \
  --data '{
  "amount": 123,
  "shop_name": "<string>",
  "message": "<string>",
  "success_url": "<string>",
  "failure_url": "<string>"
}'

Copy
"<any>"
Headers

api-key
string | nullrequired

Path Parameters

gateway_id
string<uuid>required

Body
application/json

amount
integer


shop_name
string


message
string


success_url
string


failure_url
string

Response
200

application/json
Successful Response
The response is of type any.

Get Gateway
 


Delete Gateway
DELETE
/
v1
/
gateway
/
{gateway_id}
Try it

Delete Gateway

Copy
curl --request DELETE \
  --url https://api.lygosapp.com/v1/gateway/{gateway_id} \
  --header 'api-key: <api-key>'

Copy
"<any>"
Headers

api-key
string | nullrequired

Path Parameters

gateway_id
string<uuid>required

Response
200

application/json
Successful Response
The response is of type any.


Payin
Get Payin Status
GET
/
v1
/
gateway
/
payin
/
{order_id}
Try it

Get Payin Status

Copy
curl --request GET \
  --url https://api.lygosapp.com/v1/gateway/payin/{order_id} \
  --header 'api-key: <api-key>'

Copy
{
  "order_id": "<string>",
  "status": "<string>"
}
Headers

api-key
string | nullrequired

Path Parameters

order_id
stringrequired

Response
200

application/json
Successful Response

status
stringrequired


order_id
string | nulldefault:""