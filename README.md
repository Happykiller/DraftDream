# DraftDream

## 🌐 Configuration DNS locale (environnement de développement)

Pour accéder facilement aux différents services de la plateforme **DraftDream** en local, ajoute les entrées suivantes dans ton fichier `hosts` :

### Linux / macOS

Éditer `/etc/hosts` avec les droits root :

```bash
sudo nano /etc/hosts
```

Ajoute ces lignes à la fin :

```
127.0.0.1  api.local.fo
127.0.0.1  front.local.fo
127.0.0.1  back.local.fo
127.0.0.1  showcase.local.fo
127.0.0.1  mobile.local.fo
127.0.0.1  io.local.fo
```

### Windows

Éditer le fichier `C:\Windows\System32\drivers\etc\hosts` avec un éditeur en mode Administrateur et ajouter les mêmes lignes :

```
127.0.0.1  api.local.fo
127.0.0.1  front.local.fo
127.0.0.1  back.local.fo
127.0.0.1  showcase.local.fo
127.0.0.1  mobile.local.fo
127.0.0.1  io.local.fo
```

---

## 🚀 Services accessibles

* **API** : [http://api.local.fo](http://api.local.fo)
* **Front office (athlète/coach)** : [http://front.local.fo](http://front.local.fo)
* **Back office (entreprise/admin)** : [http://back.local.fo](http://back.local.fo)
* **Showcase (site vitrine)** : [http://showcase.local.fo](http://showcase.local.fo)
* **Mobile (dev server PWA)** : [http://mobile.local.fo](http://mobile.local.fo)
* **IO (stockage objets / MinIO)** : [http://io.local.fo](http://io.local.fo)