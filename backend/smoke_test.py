import urllib.request, json, sys, time

BASE='http://127.0.0.1:5000'

def post(path, data):
    url = BASE + path
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type':'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            text = resp.read().decode('utf-8')
            print(path, '=>', text)
            return json.loads(text)
    except Exception as e:
        print('ERROR calling', path, e)
        raise

if __name__ == '__main__':
    print('Starting smoke tests...')
    # 1) register
    try:
        reg = post('/api/patient/register', {'name':'SmokeUser','age':25, 'gender':'Male'})
    except Exception:
        print('Register failed -- aborting smoke tests')
        sys.exit(2)
    pid = None
    if isinstance(reg, dict):
        pid = reg.get('id') or reg.get('patient_id') or reg.get('data',{}).get('id')
    if not pid:
        pid = 1
    time.sleep(0.5)
    # 2) diagnose
    try:
        post('/api/diagnose', {'patient_id': pid, 'symptoms': 'fever cough sore throat'})
    except Exception:
        print('Diagnose failed')
    time.sleep(0.5)
    # 3) chat
    try:
        post('/api/chat', {'message':'fever and cough'})
    except Exception:
        print('Chat failed')
    print('Smoke tests completed')
