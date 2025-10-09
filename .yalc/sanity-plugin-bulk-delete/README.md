# BulkDelete

BulkDelete is a Sanity Studio v3/4 tool plugin that allows administrators (and optionally other roles) to safely bulk delete documents of a selected type from your dataset. It prevents deletion of documents that are strongly referenced elsewhere, and provides a clear UI for selecting, reviewing, and confirming deletions.

## Features

- Select a document type and view all documents of that type
- Bulk select/deselect documents for deletion
- Prevents deletion of documents with strong references
- Indicates documents with weak references
- Role-based access (default: administrators, configurable)
- Confirmation dialog before deletion

## Installation

1. Install the plugin in your Sanity Studio project:

   ```sh
   npm install sanity-plugin-bulk-delete
   ```

2. Add the plugin to your `sanity.config.ts`:

   ```ts
   import {BulkDelete} from 'sanity-plugin-bulk-delete'

   export default defineConfig({
     // ...other config
     plugins: [
       BulkDelete({
         schemaTypes: schemaTypes, // Pass your schema types here
         // roles: ['administrator', 'editor'], // Optionally restrict to specific roles
       }),
     ],
   })
   ```

## Usage

- Open Sanity Studio.
- Click on **Bulk Delete** in the Studio navigation.
- Select a document type from the dropdown.
- Select individual documents or use "Select All".
- Click **Delete Selected** and confirm in the dialog.

## Configuration

| Option      | Type     | Description                                                                 |
|-------------|----------|-----------------------------------------------------------------------------|
| schemaTypes | array    | Required. List of schema types (usually from your schema export).           |
| roles       | string[] | Optional. Array of role names allowed to use the tool. Defaults to admin.   |

## Security

- Only users with the specified roles (default: `administrator`) can access the tool.
- Documents with strong references cannot be deleted to prevent breaking references.

## Development

- Components are modular and typed with TypeScript.
- See `src/types/BulkDeleteComponent.types.ts` for prop and config interfaces.

## License

MIT

---
**Note:** Use with caution. Deleted documents cannot be recovered unless you have backups or use Sanity's history/versioning features.

