# Deploying to Render

This document provides instructions for deploying the Invoice Management Frontend to Render.

## Deployment Steps

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Use the following settings:
   - **Environment**: Node
   - **Build Command**: `./build.sh`
   - **Start Command**: `npm run serve`
   - **Auto-Deploy**: Yes (if you want automatic deployments)

## Environment Variables

Make sure to set the following environment variables in your Render dashboard:

- `NODE_ENV`: `production`
- `REACT_APP_API_URL`: Your backend API URL (e.g., `https://your-backend-api.render.com/api`)

## Troubleshooting

If you encounter a "Not Found" error when refreshing pages or accessing routes directly:

1. Make sure the Express server is running correctly
2. Check that the `server.js` file is properly configured
3. Verify that the build process completed successfully

## Local Testing

To test the production build locally before deploying:

1. Run `npm run build` to create a production build
2. Run `npm run serve` to start the Express server
3. Visit `http://localhost:3000` to verify that routing works correctly

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [React Router Documentation](https://reactrouter.com/en/main) 