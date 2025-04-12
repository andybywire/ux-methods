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