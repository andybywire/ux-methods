# Sanity Functions
prefer managing dependencies at the project level (top level directory of this repo)

[Deploying & Destroying Functions](https://www.sanity.io/docs/compute-and-ai/function-quickstart#k9ef7ef8d924b)

`npx sanity blueprints deploy`

## Testing
```
npx sanity functions test <function-name> --document-id <documentId> --dataset production --with-user-token
```

## Redeploying a destroyed blueprint
When you run blueprints destroy, it's as if you never used blueprints init during setup. The only difference is you still have all the files in your directory. To use this blueprint again and redeploy it, you'll need to let Sanity know about it. You can do this by running the following:

``` CLI
npx sanity blueprints config --edit --test
```

This launches an editing interface that lets you reconfigure the blueprint, if needed, and it reconnects the blueprint to Sanity. 