import eel
import json
import os
import re
import requests

# Initialize eel with the web folder
base_dir = os.path.dirname(os.path.abspath(__file__))
eel.init(os.path.join(base_dir, 'web'))

# Absolute path for data file
DATA_FILE = os.path.join(base_dir, 'data.json')

def get_default_data():
    return {
        "jobs": []
    }

@eel.expose
def load_data():
    """Loads job data from the local JSON file."""
    if not os.path.exists(DATA_FILE):
        return get_default_data()
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading data: {e}")
        return get_default_data()

@eel.expose
def save_data(data):
    """Saves job data to the local JSON file."""
    try:
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4)
        return {"success": True}
    except Exception as e:
        print(f"Error saving data: {e}")
        return {"success": False, "error": str(e)}

@eel.expose
def optimize_resume(job_desc, resume_text):
    """
    Calls local Ollama API (gemma3:4b) to compare Job Description and Resume.
    Expects a JSON response with match_percentage, missing_keywords, and suggestions.
    """
    prompt = f"""
    You are an expert ATS (Applicant Tracking System) and career coach.
    Compare the following Job Description to the candidate's Resume.
    
    Job Description:
    {job_desc}
    
    Resume:
    {resume_text}
    
    Respond STRICTLY with a valid JSON object (no markdown, no extra text) with the following structure:
    {{
        "match_percentage": <integer from 0 to 100 representing how well they match>,
        "missing_keywords": [<list of up to 10 important technical or soft skill keywords missing from the resume>],
        "suggestions": [<list of 3 to 5 actionable bullet points on how to improve the resume for this specific role>]
    }}
    """
    
    try:
        response = requests.post('http://localhost:11434/api/generate', json={
            "model": "gemma3:4b",
            "prompt": prompt,
            "stream": False,
            "format": "json"
        }, timeout=60)
        
        response.raise_for_status()
        data = response.json()
        
        # Ollama returns the stringified JSON in the 'response' field
        result_str = data.get('response', '{}')
        try:
            result = json.loads(result_str)
            return {
                "success": True,
                "data": result
            }
        except json.JSONDecodeError:
            print(f"Failed to parse JSON from model: {result_str}")
            return {"success": False, "error": "Model returned invalid JSON formatting."}
            
    except requests.exceptions.ConnectionError:
        return {"success": False, "error": "Could not connect to Ollama. Please ensure Ollama is running (http://localhost:11434) and try again."}
    except Exception as e:
        print(f"Error calling Ollama: {e}")
        return {"success": False, "error": str(e)}

@eel.expose
def generate_cover_letter(job_desc, resume_text):
    """
    Calls local Ollama API (gemma3:4b) to generate a customized cover letter.
    """
    prompt = f"""
    You are an expert career coach writing a highly effective, modern cover letter.
    Write a concise, professional cover letter based on the following Job Description and the candidate's Resume.
    Do not include generic placeholders like [Your Name], just write the core body of the letter.
    Make it engaging, highlight key overlapping skills, and keep it under 300 words.
    
    Job Description:
    {job_desc}
    
    Resume:
    {resume_text}
    """
    
    try:
        response = requests.post('http://localhost:11434/api/generate', json={
            "model": "gemma3:4b",
            "prompt": prompt,
            "stream": False
        }, timeout=60)
        
        response.raise_for_status()
        data = response.json()
        return {"success": True, "cover_letter": data.get('response', '').strip()}
            
    except requests.exceptions.ConnectionError:
        return {"success": False, "error": "Could not connect to Ollama. Is it running?"}
    except Exception as e:
        return {"success": False, "error": str(e)}

@eel.expose
def generate_resume_from_linkedin(linkedin_text, target_role=""):
    """
    Calls local Ollama API (gemma3:4b) to build a professional resume from raw LinkedIn data.
    """
    role_instruction = f" Tailor the resume specifically for the role of '{target_role}'." if target_role else " Create a general, strong professional resume."
    
    prompt = f"""
    You are an expert executive resume writer. 
    Take the following raw, messy text (exported from a LinkedIn profile) and convert it into a highly polished, professional resume.
    {role_instruction}
    
    Format the output strictly in clean Markdown format with the following sections (if applicable based on the text):
    - Name & Contact Info
    - Professional Summary
    - Work Experience (rewrite bullet points to start with strong action verbs and highlight impact/results)
    - Education
    - Skills
    
    Do NOT include any introductory or concluding conversational text (e.g. "Here is your resume:"). Just output the Markdown.
    
    Raw LinkedIn Text:
    {linkedin_text}
    """
    
    try:
        response = requests.post('http://localhost:11434/api/generate', json={
            "model": "gemma3:4b",
            "prompt": prompt,
            "stream": False
        }, timeout=120)  # Longer timeout as resume generation is a larger task
        
        response.raise_for_status()
        data = response.json()
        return {"success": True, "resume_markdown": data.get('response', '').strip()}
            
    except requests.exceptions.ConnectionError:
        return {"success": False, "error": "Could not connect to Ollama. Is it running?"}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == '__main__':
    # Start the Eel desktop application
    # Uses Edge by default if available, otherwise Chrome
    print("Starting Application Tracking and Optimization System...")
    try:
        eel.start('index.html', size=(1200, 800), mode='edge', port=0)
    except EnvironmentError:
        # Fallback to default browser
        eel.start('index.html', size=(1200, 800), mode='default', port=0)
