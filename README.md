<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [airflogotchi](#project_name)
  - [Development](#development)
  - [Best Practices](#best-practices)
  - [Troubleshooting](#troubleshooting)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# airflogotchi

Airflogotchi is a virtual pet game integrated with Apache Airflow. Keep your pet happy by running successful DAG runs!

## How to Play

Airflogotchi is a Tamagotchi-style game that responds to your Apache Airflow DAG runs:

### Game Mechanics

- **Hunger System**: Your pet has a hunger level displayed as a bar (0-10)
- **Feeding Your Pet**: Every minute, the game checks for successful DAG runs from the past minute
  - If successful runs are found, hunger increases to match the number of successful runs
  - If no successful runs are found, hunger decreases by 1
- **Creature States**: Your pet's appearance changes based on its condition (in priority order):
  - **Hungry state**: Hunger ≤ 3 (takes priority over all other states)
  - **Sleeping state**: No successful DAG runs in the past hour AND hunger > 3
  - **Normal state**: Default happy state when fed and active
- **Hunger Bar Colors**:
  - Green: Hunger > 6 (well-fed)
  - Yellow: Hunger 4-6 (getting hungry)
  - Red: Hunger ≤ 3 (very hungry)

### Getting Started

1. Start the development server: `pnpm dev`
2. Ensure your Apache Airflow instance is running and accessible
3. Run your DAGs successfully to feed your pet
4. Watch your Airflogotchi thrive or struggle based on your DAG performance!

The game automatically polls your Airflow instance every minute to check for successful DAG runs, so keep those DAGs running to keep your pet happy!

## Development

This template is configured to build your React component as a library that can be consumed by other applications.

### Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build the library for production
- `pnpm build:types` - Generate TypeScript declaration files only
- `pnpm build:lib` - Build the JavaScript library only
- `pnpm test` - Run tests
- `pnpm lint` - Check code quality
- `pnpm format` - Format code

### Library Output

When you run `pnpm build`, the template generates:

- `dist/main.js` - ES module JavaScript library
- `dist/main.d.ts` - TypeScript declaration file
- Source maps for debugging

### Usage as a Library

After building, other applications can import your component:

```typescript
import { PluginComponent } from 'your-plugin-name';

// Use in your React app
<PluginComponent />
```

### Development Mode

For development and testing, use `pnpm dev` which will:

- Start a development server on port 5173
- Load the component using `src/dev.tsx` entry point
- Enable hot module replacement

### Library Configuration

The template is configured with:

- **Vite** for fast building and development
- **TypeScript** with declaration file generation
- **CSS injection** - styles are automatically injected into the JavaScript bundle
- **External dependencies** - React and other common libraries are marked as external to reduce bundle size

### Upgrading dependencies

Be mindful when upgrading dependencies that are marked as external in `vite.config.ts`, those are shared dependencies with the host application
(Airflow UI) and should remain in a compatible version range to avoid issues.

### Customization

1. **Component Props**: Update the `PluginComponentProps` interface in `src/main.tsx`
2. **External Dependencies**: Modify the `external` array in `vite.config.ts`
3. **Build Output**: Adjust library configuration in `vite.config.ts`

### Package Configuration

The `package.json` is configured with:

- `main` and `module` pointing to the built library
- `types` pointing to generated declaration files
- `exports` for modern import/export support
- `files` array specifying what gets published

This ensures your plugin can be consumed as both a CommonJS and ES module with full TypeScript support.

## Best Practices

1. **Keep React External**: Always mark React ecosystem as external to avoid conflicts
2. **Global Naming**: Use standardized global name (`AirflowPlugin`) for consistency
3. **Error Handling**: Implement proper error boundaries and fallbacks
4. **TypeScript**: Use proper typing for plugin props and exports
5. **Bundle Size**: Monitor bundle size and externalize large dependencies if needed

## Troubleshooting

### Common Issues

**"Failed to resolve module specifier 'react'"**

- Ensure React is marked as external in `vite.config.ts`
- Verify host application exposes React globally

**"Cannot read properties of null (reading 'useState')"**

- React instance mismatch - check external configuration
- Verify global React is properly set in host application

**"Objects are not valid as a React child"**

- Ensure you're returning component functions, not JSX elements
- Check that lazy loading returns proper component structure

**MIME type issues**

- Ensure `.js` and `.cjs` files are served with correct MIME type

For more help, check the main project documentation.

### Deployment to Airflow Plugins

Once the development is complete, you can build the library using `pnpm build` and then host the content of the `dist` folder. You can do that on your own infrastructure or within airflow
by adding static file serving to your api server via registering a plugin `fastapi_apps`. You can take a look at the [Airflow documentation](https://airflow.apache.org/docs/apache-airflow/stable/plugins.html) for more information on how to do that.
