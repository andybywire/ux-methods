# Docker GraphDB Setup

- Pull and run the latest GraphDB Free edition.
- Expose it at http://localhost:7200.
- Mount your ./data folder for easy importing.

## 🛠️ One-time setup:

1. Install Docker Desktop for Mac:  
   [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

2. From the `graphdb-demo/` folder, run:

   ```bash
   docker compose up -d
   ```

3. Visit [http://localhost:7200](http://localhost:7200) in your browser.

## 🧼 Stop and Clean Up

To stop GraphDB, run:

```bash
docker compose down
```

Your data in `./data/` stays safe and portable.

## Test Queries

Query to test a tunnel to `kg.uxmethods.org` with basic authentication.

### Method Centrality

```bash
curl -u "username:password" \
   -X POST http://kg.uxmethods.org/repositories/uxm \
   -H "Content-Type: application/x-www-form-urlencoded" \
   -H "Accept: application/sparql-results+json" \
   --data-urlencode "query=
         PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
         PREFIX : <https://uxmethods.org/>
         PREFIX uxmo: <https://uxmethods.org/ontology/>

         SELECT ?method ?label (COUNT(?transput) AS ?centrality)
         WHERE {
               ?methodA skos:prefLabel ?label.
               {?methodA uxmo:hasInput ?transput.}
               UNION
               {?methodA uxmo:hasOutput ?transput.}
               BIND(?methodA AS ?method)
         }
         GROUP BY ?method ?label
         ORDER BY DESC (?centrality)
"
```

### Shared Output

```bash
curl -u "username:password" \
   -X POST http://kg.uxmethods.org/repositories/uxm \
   -H "Content-Type: application/x-www-form-urlencoded" \
   -H "Accept: application/sparql-results+json" \
   --data-urlencode "query=
         PREFIX : <https://uxmethods.org/>
         PREFIX uxmo: <https://uxmethods.org/ontology/>

         SELECT ?origin ?destination (COUNT(?output) AS ?sharedOutputCount)
                (GROUP_CONCAT(DISTINCT ?output; SEPARATOR=',') AS ?sharedOutput)
         WHERE {
            ?origin uxmo:hasOutput ?output.
            ?destination uxmo:hasInput ?output.
         }
         GROUP BY ?origin ?destination
         ORDER BY DESC(?sharedOutputCount)
"
```

Replace `username` and `password` with your actual credentials.

### Notes

- `-u` The most basic curl authentication option is -u / --user. It accepts an argument that is the username and password, colon separated.
- `-X` Tell curl to change the method into something else by using the -X or --request command-line options followed by the actual method name.
