# memory_Oclock
 
 Implémentation du jeu Memory en JS avec une persistance des scores en PHP
 
## Installation

Après avoir cloné le repo sur votre serveur, exécuter un composer install afin de charger les différentes dépendances.
 
## Notes et aides 
 
 Le fichier `config.php` contient les différentes variables nécessaires à la mise en place de la BDD. (variables de connexion et nom donné à la DB). Une seule table sera créée dans cette base de données et sera nommée `scores` 
 
 Dépendances tierces utilisées :
- Côté Front :
  - Jquery 3.5.1
  - progressbar.js@1.0.0 http://progressbarjs.readthedocs.org/en/1.0.0/ pour la barre de progression du temps de jeu.

- Côté Back :
  - AltoRouter pour le routing PHP. Système de redirection Apache dans le .htaccess. Il faut adapter ce système de redirection en cas d'utilisation d'un serveur nginx.

- Note d'introduction :

L'implémentation du jeu à travers JS est un bon exercice de développement. Il convient toutefois de noter que cette implémentation permet à un joueur "mal intentionné" d'avoir connaissance du DOM de la page HTML et de pouvoir en déduire facilement les paires de cartes. Une implémentation du jeu côté back avec une historisation des différentes parties et des jeux de cartes générés serait d'un point de vue "sécurité" plus adaptée. La partie front n'aurait connaissance de la valeur d'une carte que lors de son "clic" dessus qui effectuerait un appel vers le back (via un système d'API). Cela pourrait être, à mon sens, un bon exercice d'approfondissement.   



- Notes sur la partie persistance des scores :

On utilise la classe `PDO` de PHP. https://www.php.net/manual/fr/book.pdo.php <br/>
La fichier `Database.php` contient la classe qui implémente les différentes fonctions nécessaires :
- <b>connect()</b> : fonction permettant de se connecter à la bdd et de retourner un objet `PDO` qui va nous permettre de manipuler la bdd à travers des requêtes préparées.
- <b>createDB()</b> : fonction permettant de créer la BDD. L'utilisation du `IF NOT EXISTS` dans la requête `SQL` permet de ne créer qu'une seule fois la BDD. Elle n'est donc effective que lors de l'installation de l'application sur le serveur.
- <b>createTable()</b> : fonction permettant de créer la table `scores` de stockage des scores. Même utilisation que dans la fonction du `createDB()` du `IF NOT EXISTS`.
- <b>insert($datas)</b> : fonction permettant de stocker le nom du joueur ainsi que son score. Le paramètre `$datas` est un tableau associatif ['player'=>'name','score'=>tps_en_sec]. Ce paramètre provient d'un appel en `POST` fait par le front. Dès qu'une variable provenant de l'extérieur intervient dans une requête SQL il s'agit de s'assurer qu'elle ne contient pas une tentative d'injection SQL (https://fr.wikipedia.org/wiki/Injection_SQL). Pour ce faire l'objet `PDO` permet de "préparer" la requête, de "binder" les variables (le "bindage" permet de "nettoyer" la variable passée) et enfin de l'exécuter. <br/><br/><pre><code>$conn = $this->connect(); // on se connecte à la bdd
			$query = $conn->prepare("INSERT INTO scores (player_name, score) VALUES (:player, :score)"); // on "prépare" la requête sql
			$query->bindParam(":player", $player_name); // on "binde" la variable $player_name
			$query->bindParam(":score", $score, PDO::PARAM_INT); // on "binde" la variable $score en spécifiant qu'il s'agit d'un entier
			$query->execute(); // enfin on exécute la requête !...
   $conn = null; // ... sans oublier de fermer la connexion à la bdd !</code><pre>
- <b>getBestScores($limit=5)</b> : fonction permettant de récupérer les `$limit` meilleurs scores (par défaut 5). Une variable provient du monde extérieur ! On utilise donc là aussi une requête préparée. Il s'agit toutefois ici d'une requête de récupération de données. `PDO` permet de setter le format de retour de la data à travers la fonction `setFetchMode` (https://www.php.net/manual/fr/pdostatement.setfetchmode.php). Dans notre cas, je désire un retour sous forme d'un tableau associatif `PDO::FETCH_ASSOC`.<br/><br/><pre><code>$query->setFetchMode(PDO::FETCH_ASSOC); // La requête a été exécutée, on sette le type de retour de la donnée, ici un tableau associatif
return $query->fetchAll(); // Je retourne tous les résultats</pre></code>
- On "include" le fichier `config.php` afin de setter les différentes variables de connexion
- Pour chaque fonction, il ne faut pas oublier de refermer la connexion à la bdd en settant cette connexion à `null`

Il est important de bien avoir conscience que les injections SQL doivent absolument être évitées. L'utilisation des requêtes préparées est une façon de s'en prémunir. Les ORM du type Doctrine pour Symfony ou Eloquent pour Laravel font aussi le travail sous le capot sans que vous en ayez forcément conscience. Attention toutefois avec ces ORM, certaines de leurs fonctions permettent d'écrire des requêtes SQL brutes nécessaires dans certains cas. Si vous êtes amenés à devoir les utiliser de cette façon, consulter bien la documentation de ceux ci, une mauvaise utilisation pouvant entrainer des possibilités d'injections (Cas réel vu sur du vieux code legacy écrit avec des requêtes Eloquent à travers Laravel 5.4. C'est une vieille version de Laravel mais vous pourrez être amenés à travailler sur des projets n'étant pas forcément à jour...).   

