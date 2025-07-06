from mangum import Mangum

# Import the existing FastAPI app
from main import app

# Expose the AWS Lambda / Vercel handler
aws_handler = Mangum(app) 