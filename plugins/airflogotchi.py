from pathlib import Path
from fastapi import FastAPI
from starlette.staticfiles import StaticFiles
import mimetypes

from airflow.plugins_manager import AirflowPlugin

# Ensure proper MIME types for cjs files
mimetypes.add_type("application/javascript", ".cjs")

# Create FastAPI app to serve static files
app = FastAPI()

# Mount your React app's dist folder
react_app_directory = Path(__file__).parent.joinpath("airflogotchi", "dist")
app.mount(
    "/my-react-app",
    StaticFiles(directory=react_app_directory, html=True),
    name="my_react_app_static",
)


class MyReactPlugin(AirflowPlugin):
    name = "My React Plugin"

    # Serve static files
    fastapi_apps = [
        {
            "app": app,
            "url_prefix": "/my_plugin",
            "name": "Airflogotchi Static Server",
        }
    ]

    # Register React application
    react_apps = [
        {
            "name": "Airflogotchi",
            "url_route": "my-awesome-app",
            "bundle_url": "/my_plugin/my-react-app/main.umd.cjs",
            "destination": "nav",
        }
    ]
