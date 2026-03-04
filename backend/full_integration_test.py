import json
from app import app, db, ensure_db_columns


def pretty(j):
    try:
        return json.dumps(j, indent=2, ensure_ascii=False)
    except Exception:
        return str(j)


def do_post(client, path, data):
    print(f"POST {path} -> payload: {data}")
    r = client.post(path, json=data)
    print('status:', r.status_code)
    try:
        print(pretty(r.get_json()))
    except Exception:
        print(r.get_data(as_text=True))
    print()
    return r


def do_get(client, path):
    print(f"GET {path}")
    r = client.get(path)
    print('status:', r.status_code)
    try:
        print(pretty(r.get_json()))
    except Exception:
        print(r.get_data(as_text=True))
    print()
    return r


def run():
    with app.app_context():
        db.create_all()
        try:
            ensure_db_columns()
        except Exception:
            pass

    client = app.test_client()

    # Register a fresh user for the test
    user = {'name': 'IntegrationUser', 'age': 30, 'gender': 'Male', 'email': 'integration@example.com'}
    r = do_post(client, '/api/patient/register', user)
    pid = None
    try:
        pid = r.get_json().get('id')
    except Exception:
        pid = None
    if not pid:
        print('Registration did not return an id — aborting')
        return

    # Login
    do_post(client, '/api/patient/login', {'name': user['name']})

    # Dashboard
    do_get(client, f"/api/dashboard/{pid}")

    # Diagnose
    do_post(client, '/api/diagnose', {'patient_id': pid, 'symptoms': 'fever cough sore throat'})

    # Diagnosis history
    r = do_get(client, f"/api/diagnosis-history/{pid}")
    diag_id = None
    try:
        hist = r.get_json()
        if isinstance(hist, list) and len(hist) > 0:
            diag_id = hist[0].get('id')
    except Exception:
        diag_id = None

    # Delete diagnosis if present
    if diag_id:
        print(f"DELETE /api/diagnosis/{diag_id}")
        r = client.delete(f'/api/diagnosis/{diag_id}')
        print('status:', r.status_code)
        try:
            print(pretty(r.get_json()))
        except Exception:
            print(r.get_data(as_text=True))
        print()

    # Health tracking
    do_post(client, '/api/health-track', {'patient_id': pid, 'heart_rate': 70, 'blood_pressure': '120/80', 'mental_health': 4.0, 'sleep_hours': 7, 'exercise_mins': 30, 'weight': 68, 'temperature': 36.6})

    # Health history
    do_get(client, f"/api/health-history/{pid}")

    # Consultation add & list
    do_post(client, '/api/consultation', {'patient_id': pid, 'doctor_name': 'Dr. Test', 'treatment': 'Rest', 'notes': 'Follow up in 1 week'})
    do_get(client, f"/api/consultation/{pid}")

    # Chat
    do_post(client, '/api/chat', {'message': 'I have cough and fever'})

    # Health endpoint
    do_get(client, '/api/health')

    print('Full integration test completed')


if __name__ == '__main__':
    run()
