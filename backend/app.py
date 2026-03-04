from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import os
import csv
import re
import difflib
import logging
import traceback
from sqlalchemy import text

# Setup basic logging to a file for backend errors
log_path = os.path.join(os.path.dirname(__file__), 'error.log')
logging.basicConfig(level=logging.INFO, filename=log_path, filemode='a', format='%(asctime)s %(levelname)s: %(message)s')

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ayurveda.db'
db = SQLAlchemy(app)
CORS(app)

class Patient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True)
    age = db.Column(db.Integer)
    gender = db.Column(db.String(10))
    email = db.Column(db.String(100))
    created_at = db.Column(db.Date, default=datetime.now().date)

class Diagnosis(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'))
    symptoms = db.Column(db.String(500))
    disease = db.Column(db.String(200))
    confidence = db.Column(db.Float)
    remedies = db.Column(db.String(1000))
    medicines = db.Column(db.String(500))
    lifestyle = db.Column(db.String(1000))
    date = db.Column(db.Date, default=datetime.now().date)
    time = db.Column(db.String(10), default=lambda: datetime.now().strftime('%H:%M'))

class HealthTracking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'))
    heart_rate = db.Column(db.Float)
    blood_pressure = db.Column(db.String(20))
    mental_health = db.Column(db.Float)
    sleep_hours = db.Column(db.Float)
    exercise_mins = db.Column(db.Float)
    weight = db.Column(db.Float)
    temperature = db.Column(db.Float)
    date = db.Column(db.Date, default=datetime.now().date)
    time = db.Column(db.String(10), default=lambda: datetime.now().strftime('%H:%M'))

class Consultation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'))
    doctor_name = db.Column(db.String(100))
    treatment = db.Column(db.String(500))
    notes = db.Column(db.String(1000))
    date = db.Column(db.Date, default=datetime.now().date)
    time = db.Column(db.String(10), default=lambda: datetime.now().strftime('%H:%M'))

DIAGNOSES_DB = {
    "Common Cold": {
        "symptoms": ["cold", "cough", "sneeze"],
        "remedies": "Ginger, Turmeric, Honey, Warm water. Drink 8 glasses water daily. Get rest 3 to 7 days.",
        "medicines": "Aspirin, Cough syrup",
        "lifestyle": "Rest, stay hydrated, avoid cold exposure, inhale steam, increase vitamin C-rich foods, avoid smoking and cold drinks."
    },
    "Asthma": {
        "symptoms": ["breathing", "wheeze", "chest"],
        "remedies": "Use licorice herb. Do steam inhalation 10 minutes. Take ginger tea twice daily. Avoid cold.",
        "medicines": "Inhaler, Albuterol",
        "lifestyle": "Avoid known triggers (smoke, pollen, dust), keep rescue inhaler available, maintain regular moderate exercise, control indoor humidity."
    },
    "Diabetes": {
        "symptoms": ["sugar", "thirst", "urination"],
        "remedies": "Eat fenugreek seeds. Drink bitter melon juice. Add cinnamon to food. Exercise 30 minutes daily.",
        "medicines": "Metformin, Insulin",
        "lifestyle": "Adopt a balanced low-glycemic diet, regular physical activity, weight management, regular blood glucose monitoring and medication adherence."
    },
    "Hypertension": {
        "symptoms": ["blood pressure", "headache"],
        "remedies": "Eat garlic daily. Drink warm lemon water. Do meditation 20 minutes. Reduce salt.",
        "medicines": "Lisinopril",
        "lifestyle": "Reduce salt, avoid processed foods, regular aerobic exercise, manage stress, limit alcohol and caffeine, maintain healthy weight."
    },
    "Arthritis": {
        "symptoms": ["joint pain", "swelling"],
        "remedies": "Apply turmeric ginger oil massage. Do gentle yoga. Take warm baths. Avoid cold.",
        "medicines": "Ibuprofen",
        "lifestyle": "Regular low-impact exercise, maintain healthy weight, avoid repetitive joint strain, use heat therapy and ergonomic adjustments."
    },
    "Migraine": {
        "symptoms": ["headache", "migraine"],
        "remedies": "Apply lavender oil to temples. Rest in dark room. Drink peppermint tea. Regular sleep.",
        "medicines": "Sumatriptan",
        "lifestyle": "Keep a regular sleep schedule, identify and avoid triggers (food, stress), stay hydrated, practice stress-reduction techniques."
    },
    "Anxiety": {
        "symptoms": ["anxiety", "panic"],
        "remedies": "Practice deep breathing. Yoga 30 min daily. Take ashwagandha herb. Meditate 15 min.",
        "medicines": "Sertraline",
        "lifestyle": "Regular relaxation (meditation, breathing), consistent exercise, reduce caffeine, social support, good sleep hygiene."
    },
    "Insomnia": {
        "symptoms": ["sleep", "insomnia"],
        "remedies": "Warm milk before bed. Valerian root. Lavender aromatherapy. Fixed sleep time.",
        "medicines": "Melatonin",
        "lifestyle": "Establish fixed sleep routine, avoid screens before bed, reduce stimulants, create a calm sleep environment."
    },
    "Thyroid": {
        "symptoms": ["fatigue", "weight", "thyroid", "hypothyroid", "hyperthyroid"],
        "remedies": "Eat kelp seaweed. Ashwagandha powder. Breathing exercises. Enough iodine.",
        "medicines": "Levothyroxine",
        "lifestyle": "Regular monitoring, consistent medication timing, balanced iodine intake, moderate exercise to support metabolism."
    },
    "Skin Allergy": {
        "symptoms": ["rash", "itching"],
        "remedies": "Neem paste on skin. Aloe vera gel. Turmeric milk. Avoid triggers.",
        "medicines": "Hydrocortisone",
        "lifestyle": "Avoid known allergens, use gentle skin care, keep skin moisturized, avoid hot showers and harsh soaps."
    },
}

# Load ayurvedic remedies CSV into memory for the mini-chatbot
REMEDIES = []
try:
    csv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'ayuervdic dataset', 'ayurvedic_symptom_remedies_bilingual.csv'))
    with open(csv_path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # normalize symptom key
            REMEDIES.append({
                'symptom': (row.get('symptom') or '').strip().lower(),
                'remedy_en': row.get('ayurvedic_remedy_english') or '',
                'remedy_local': row.get('ayurvedic_remedy_kannada') or ''
            })
except Exception as e:
    REMEDIES = []
    print('Warning: could not load remedies CSV:', e)

def analyze_symptoms(symptoms_text):
    symptoms_lower = (symptoms_text or '').lower()
    # tokenized words from the input (alphanumeric)
    tokens = re.findall(r"\w+", symptoms_lower)
    matched = []
    for disease, data in DIAGNOSES_DB.items():
        keywords = [k.lower() for k in data.get("symptoms", [])]
        match_count = 0
        for kw in keywords:
            # direct substring match (covers many cases: 'cough' in 'coughing')
            if kw in symptoms_lower:
                match_count += 1
                continue
            # exact token match or startswith (covers plurals / simple variants)
            if any(tok == kw or tok.startswith(kw) or kw.startswith(tok) for tok in tokens):
                match_count += 1
                continue
            # fuzzy match fallback (small typos)
            for tok in tokens:
                close = difflib.get_close_matches(tok, [kw], cutoff=0.8)
                if close:
                    match_count += 1
                    break

        if match_count > 0:
            confidence = min((match_count / max(1, len(keywords))) * 100, 95)
            matched.append({
                "disease": disease,
                "confidence": round(confidence, 1),
                "remedies": data.get("remedies", ""),
                "medicines": data.get("medicines", ""),
                "lifestyle": data.get("lifestyle", "")
            })

    matched.sort(key=lambda x: x["confidence"], reverse=True)
    return matched[:5]


def ensure_db_columns():
    """Ensure the Diagnosis table has the 'lifestyle' column; add it if missing."""
    try:
        # Use engine connection and explicit text() to run PRAGMA/ALTER reliably
        # only works for SQLite (the project uses sqlite:///ayurveda.db)
        with db.engine.connect() as conn:
            res = conn.execute(text("PRAGMA table_info('diagnosis')")).fetchall()
            cols = [r[1] for r in res]
            if 'lifestyle' not in cols:
                conn.execute(text("ALTER TABLE diagnosis ADD COLUMN lifestyle TEXT"))
                logging.info('Added missing column diagnosis.lifestyle')
                # commit any pending session transactions to reflect schema change
                db.session.commit()
    except Exception:
        logging.exception('Error ensuring DB columns')

@app.route('/api/patient/register', methods=['POST'])
def register():
    try:
        data = request.get_json(force=True)
    except Exception as e:
        return jsonify({'error': 'Invalid JSON payload', 'details': str(e)}), 400

    name = data.get('name')
    if not name:
        return jsonify({'error': 'Missing required field: name'}), 400

    # validate/convert age
    age = data.get('age')
    if age is not None and age != '':
        try:
            age = int(age)
        except Exception:
            return jsonify({'error': 'Invalid age; must be an integer'}), 400
    else:
        age = None

    gender = data.get('gender')

    try:
        existing = Patient.query.filter_by(name=name).first()
        if existing:
            return jsonify({'id': existing.id}), 200

        patient = Patient(name=name, age=age, gender=gender, email=data.get('email'))
        db.session.add(patient)
        db.session.commit()
        return jsonify({'id': patient.id}), 201
    except Exception as e:
        db.session.rollback()
        # If this failed due to a UNIQUE constraint on name, try to return the existing id
        msg = str(e)
        if 'UNIQUE constraint failed' in msg or 'unique constraint' in msg.lower():
            try:
                existing = Patient.query.filter_by(name=name).first()
                if existing:
                    return jsonify({'id': existing.id}), 200
            except Exception:
                pass
        return jsonify({'error': 'Server error saving patient', 'details': str(e)}), 500

@app.route('/api/patient/login', methods=['POST'])
def login():
    data = request.json
    patient = Patient.query.filter_by(name=data['name']).first()
    if not patient:
        return jsonify({'error': 'Not found'}), 404
    return jsonify({'id': patient.id, 'name': patient.name, 'age': patient.age})

@app.route('/api/patient/<int:id>/summary', methods=['GET'])
def get_summary(id):
    patient = Patient.query.get_or_404(id)
    recent_diagnoses = Diagnosis.query.filter_by(patient_id=id).order_by(Diagnosis.date.desc()).limit(5).all()
    recent_health = HealthTracking.query.filter_by(patient_id=id).order_by(HealthTracking.date.desc()).limit(5).all()
    return jsonify({'patient': {'id': patient.id, 'name': patient.name}, 'recent_diagnoses': [{'disease': d.disease, 'date': str(d.date), 'remedies': d.remedies} for d in recent_diagnoses], 'recent_health': [{'date': str(r.date), 'heart_rate': r.heart_rate} for r in recent_health]})

@app.route('/api/diagnose', methods=['POST'])
def diagnose():
    try:
        data = request.get_json(force=True, silent=True) or {}
    except Exception as e:
        logging.exception('Invalid JSON in /api/diagnose')
        return jsonify({'diagnoses': [], 'message': 'Invalid JSON payload'}), 400
    symptoms = (data.get('symptoms') or '').strip()
    patient_id = data.get('patient_id')
    if not symptoms:
        return jsonify({'diagnoses': [], 'message': 'No symptoms provided'}), 400
    matched = analyze_symptoms(symptoms)
    # if no matches, return helpful message without creating DB entries
    if not matched:
        return jsonify({'diagnoses': [], 'message': 'No matching diagnosis found. Try more specific keywords like "cough", "fever", "headache".'})
    for match in matched:
        try:
            diag = Diagnosis(
                patient_id=patient_id,
                symptoms=symptoms,
                disease=match.get('disease'),
                confidence=match.get('confidence'),
                remedies=match.get('remedies'),
                medicines=match.get('medicines'),
                lifestyle=match.get('lifestyle')
            )
            db.session.add(diag)
        except Exception:
            # skip DB save for problematic entries but continue
            db.session.rollback()

    # commit with simple retry for transient DB issues
    for attempt in range(3):
        try:
            db.session.commit()
            break
        except Exception:
            logging.exception('DB commit failed in /api/diagnose, attempt %s', attempt+1)
            db.session.rollback()
            time_to_wait = 0.1 * (attempt + 1)
            import time
            time.sleep(time_to_wait)

    return jsonify({'diagnoses': matched})


# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200


# Global exception handler to return JSON and log the traceback
@app.errorhandler(Exception)
def handle_exception(e):
    tb = traceback.format_exc()
    logging.error('Unhandled exception: %s\n%s', str(e), tb)
    return jsonify({'error': 'Server error', 'details': str(e)}), 500

@app.route('/api/diagnosis-history/<int:patient_id>', methods=['GET'])
def diagnosis_history(patient_id):
    diagnoses = Diagnosis.query.filter_by(patient_id=patient_id).order_by(Diagnosis.date.desc()).all()
    out = []
    for d in diagnoses:
        lifestyle = ''
        try:
            lifestyle = DIAGNOSES_DB.get(d.disease, {}).get('lifestyle', '')
        except Exception:
            lifestyle = ''
        out.append({
            'id': d.id,
            'date': str(d.date),
            'time': getattr(d, 'time', ''),
            'disease': d.disease,
            'symptoms': d.symptoms,
            'confidence': d.confidence,
            'remedies': d.remedies,
            'medicines': d.medicines,
            'lifestyle': lifestyle
        })
    return jsonify(out)


@app.route('/api/diagnosis/<int:diag_id>', methods=['DELETE'])
def delete_diagnosis(diag_id):
    diag = Diagnosis.query.get(diag_id)
    if not diag:
        return jsonify({'error': 'Not found'}), 404
    try:
        db.session.delete(diag)
        db.session.commit()
        return jsonify({'message': 'Deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Server error', 'details': str(e)}), 500

@app.route('/api/health-track', methods=['POST'])
def track_health():
    data = request.json
    tracking = HealthTracking(patient_id=data['patient_id'], heart_rate=float(data.get('heart_rate', 0)), blood_pressure=data.get('blood_pressure'), mental_health=float(data.get('mental_health', 0)), sleep_hours=float(data.get('sleep_hours', 0)), exercise_mins=float(data.get('exercise_mins', 0)), weight=float(data.get('weight', 0)), temperature=float(data.get('temperature', 0)))
    db.session.add(tracking)
    db.session.commit()
    return jsonify({'message': 'Tracked'})

@app.route('/api/health-history/<int:patient_id>', methods=['GET'])
def health_history(patient_id):
    records = HealthTracking.query.filter_by(patient_id=patient_id).order_by(HealthTracking.date.desc()).all()
    return jsonify([{'date': str(r.date), 'heart_rate': r.heart_rate, 'blood_pressure': r.blood_pressure, 'mental_health': r.mental_health, 'temperature': r.temperature} for r in records])

@app.route('/api/consultation', methods=['POST'])
def add_consultation():
    data = request.json
    consult = Consultation(patient_id=data['patient_id'], doctor_name=data.get('doctor_name'), treatment=data.get('treatment'), notes=data.get('notes'))
    db.session.add(consult)
    db.session.commit()
    return jsonify({'message': 'Added'})

@app.route('/api/consultation/<int:patient_id>', methods=['GET'])
def get_consultations(patient_id):
    consults = Consultation.query.filter_by(patient_id=patient_id).order_by(Consultation.date.desc()).all()
    return jsonify([{'id': c.id, 'date': str(c.date), 'doctor_name': c.doctor_name, 'treatment': c.treatment, 'notes': c.notes} for c in consults])

@app.route('/api/dashboard/<int:patient_id>', methods=['GET'])
def get_dashboard(patient_id):
    patient = Patient.query.get_or_404(patient_id)
    latest_health = HealthTracking.query.filter_by(patient_id=patient_id).order_by(HealthTracking.date.desc()).first()
    total_diagnoses = Diagnosis.query.filter_by(patient_id=patient_id).count()
    total_consultations = Consultation.query.filter_by(patient_id=patient_id).count()
    health_data = {}
    if latest_health:
        health_data = {'heart_rate': latest_health.heart_rate, 'blood_pressure': latest_health.blood_pressure, 'mental_health': latest_health.mental_health, 'temperature': latest_health.temperature}
    return jsonify({'patient': {'id': patient.id, 'name': patient.name}, 'latest_health': health_data, 'total_diagnoses': total_diagnoses, 'total_consultations': total_consultations})


@app.route('/api/chat', methods=['POST'])
def chat():
    """Simple chatbot endpoint: accepts JSON {message: '...'} and returns matching remedies from CSV."""
    data = request.get_json(force=True, silent=True) or {}
    message = (data.get('message') or '').lower()
    if not message:
        return jsonify({'error': 'Missing message'}), 400

    # simple matching: look for symptom keywords that appear in the message
    matches = []
    for r in REMEDIES:
        sym = r.get('symptom', '')
        if not sym:
            continue
        # exact symptom in message or any word in symptom appears in message
        if sym in message or any(word in message for word in sym.split() if len(word) > 2):
            matches.append(r)

    # deduplicate and limit results
    seen = set()
    filtered = []
    for m in matches:
        key = m['symptom']
        if key not in seen:
            seen.add(key)
            filtered.append(m)
    if not filtered:
        # fallback: return a small help message
        return jsonify({'matches': [], 'message': 'No direct match found. Try describing symptoms like "cough", "fever", "headache".'})

    return jsonify({'matches': filtered[:6]})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # ensure any new columns are added (SQLite runtime ALTER)
        ensure_db_columns()
    app.run(debug=True, port=5000)
