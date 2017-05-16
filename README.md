# Gilje

GitHub repozitorijum za API aplikacije "gilje". 

## Instalacija Noda

Instalacija NodeJS-a

https://nodejs.org/en/download/

## Instalacija MongoDB

Instalirati homebrew

```
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

Instalirati MongoDB

```
brew install mongodb
```

Napraviti folder za držanje baza

```
mkdir -p /data/db
```

## Instalacija MongoDB za Windows

Ukoliko koristite windows instalirati MongoDB koristeći sledeći link

https://www.mongodb.com/download-center#community
 

### NPM paketi i pokretanje servera

Globalna instalacija nodemon paketa

```
npm install -g nodemon
```

U rootu aplikacije instalirati pakete

```
npm install
```

Server pokrenuti pomocu nodemon-a

```
nodemon server.js
```

Aplikacija pokrenuta na 8080 portu

```
localhost:8080
```

## Tehnologije

* [Mongodb](https://www.mongodb.com/) - Baze podataka
* [NodeJS](https://nodejs.org/en/download/) - NodeJS 
* [Express](https://expressjs.com/) - Express NodeJS framework
* [Angular](https://angular.io/) - Angular one page JavaScript framework
