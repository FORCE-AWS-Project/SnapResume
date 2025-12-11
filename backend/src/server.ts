import { config } from 'dotenv';
import app from './app';

// Load environment variables from .env file
config();

const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
