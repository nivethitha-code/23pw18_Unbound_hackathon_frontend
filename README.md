AgentFlow - Agentic Workflow Builder 🚀
AgentFlow is a powerful, visual tool designed to build, visualize, and execute chains of AI agents. It allows users to create complex workflows where the output of one AI model serves as the context for the next, enabling sophisticated automation and reasoning tasks.

Builder Interface

✨ Features
Visual Workflow Builder: Intuitive interface to create multi-step AI workflows. Define prompts, select models, and set success criteria.
Chained Execution: Seamlessly pass context ({{context}}) from one step to the next.
Real-time Execution Status: Watch your workflow run step-by-step with live status updates.
Execution History: valid Track past runs, view success/failure rates, and inspect outputs.
Dark Mode: Sleek, developer-friendly dark mode UI.
Responsive Design: Built with Tailwind CSS for a seamless experience on any device.


📸 Screenshots
<img width="1451" height="665" alt="image" src="https://github.com/user-attachments/assets/9eb23ef6-647b-410f-bac7-73cc96617371" />
<img width="1451" height="665" alt="image" src="https://github.com/user-attachments/assets/9eb23ef6-647b-410f-bac7-73cc96617371" />

<img width="1451" height="654" alt="image" src="https://github.com/user-attachments/assets/d6be749e-229e-44ee-9328-04e3d59b16c1" />
<img width="1451" height="654" alt="image" src="https://github.com/user-attachments/assets/d6be749e-229e-44ee-9328-04e3d59b16c1" />

<img width="1443" height="660" alt="image" src="https://github.com/user-attachments/assets/6478d3ca-943c-4354-bbea-58a63dc56f67" />
<img width="1443" height="660" alt="image" src="https://github.com/user-attachments/assets/6478d3ca-943c-4354-bbea-58a63dc56f67" />


Execution History
View past workflow runs and their status at a glance. Execution History

Live Execution Status
Monitor step-by-step progress with detailed output and validation results. Execution Status

🛠️ Tech Stack
Framework: React (Vite)
Styling: Tailwind CSS, Lucide React (Icons)
Animations: Framer Motion
State Management: React Hooks
Backend Integration: REST API (FastAPI)
🚀 Getting Started
Clone the repository

bash
git clone https://github.com/nivethitha-code/23pw18_Unbound_hackathon_frontend.git
cd 23pw18_Unbound_hackathon_frontend
Install dependencies

bash
npm install
Setup Environment Variables Create a 
.env
 file in the root directory:

env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:8000
Run the development server

bash
npm run dev
