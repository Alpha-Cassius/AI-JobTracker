# AI JobTracker: Application Tracking & AI Optimization System 🚀

JobTracker is an all-in-one local desktop application designed to streamline your job search. Built with Python (**Eel**) and styled with **Tailwind CSS**, it brings production-grade AI directly to your machine using **Ollama (`gemma3:4b`)**. Track your applications, instantly find keyword gaps against job descriptions, generate customized cover letters, and turn raw LinkedIn data into clean Markdown resumes—all locally, securely, and with zero API subscription costs.

---

## ✨ Features

* 📊 **Interactive Dashboard:** Gain an overview of your application health with automated trackers for interviews, offers, and rejections.
* 🎯 **Application Optimizer:** Paste a job description and your resume to receive a real-time match score, a list of missing technical/soft skill keywords, and actionable AI improvement bullet points.
* ✍️ **Tailored Cover Letter Drafts:** Generate concise, context-aware cover letters matching your skills to the specific job post in under 300 words.
* 💼 **AI Resume Builder:** Convert messy, raw text exports from your LinkedIn profile into a structurally structured, result-driven Markdown resume.
* 🔒 **100% Private & Local:** Your resume data, notes, and metrics never leave your computer. 

---

## 🛠️ Tech Stack

* **Backend:** Python 3.x, [Eel](https://github.com/python-eel/Eel) (Chromium/Edge desktop wrapper)
* **Frontend:** HTML5, Tailwind CSS, JavaScript (ES6+), FontAwesome Icons, Marked.js (Markdown parsing)
* **AI Engine:** Local Ollama API running the `gemma3:4b` model
* **Storage:** Local `data.json` database

---

## 🚀 Getting Started

### Prerequisites

1. **Python 3.8+** installed on your system.
2. **Ollama** installed and running locally.
   * Download Ollama from [ollama.com](https://ollama.com).
   * Pull the target model in your terminal:
     ```bash
     ollama pull gemma3:4b
     ```

### Installation & Run

1. **Clone this repository** (or copy the files into a structured directory):
   ```bash
   git clone [https://github.com/yourusername/jobtracker.git](https://github.com/yourusername/jobtracker.git)
   cd jobtracker

```

2. **Install the dependencies:**
```bash
pip install -r requirements.txt

```


3. **Launch the app:**
```bash
python main.py

```


*The application will boot and launch an native desktop window using Microsoft Edge (fallback to default browser).*

---

## 📁 Project Structure

```text
├── main.py             # Python backend & Eel exposed API methods
├── requirements.txt    # Python package dependencies
├── data.json           # Local storage for your job logs (auto-created if missing)
└── web/                # Frontend application folder
    ├── index.html      # Single-page app layout (Dashboard, Tracker, Optimizer, Builder)
    ├── script.js       # Frontend UI handling & async bridge communication
    └── style.css       # Custom scrollbars, animations, and component styling

```

---

## 📝 License

Distributed under the MIT License. Feel free to modify and build upon it!

---
Made with ❤️ and ☕ by Vaibhav Pandey.
