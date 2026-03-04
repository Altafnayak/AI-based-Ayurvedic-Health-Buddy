import urllib.request, json
BASE='http://127.0.0.1:5000'

def post(path, data):
    url = BASE + path
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type':'application/json'})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode('utf-8'))

def get(path):
    url = BASE + path
    with urllib.request.urlopen(url, timeout=15) as resp:
        return json.loads(resp.read().decode('utf-8'))

def delete(path):
    req = urllib.request.Request(BASE+path, method='DELETE')
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode('utf-8'))

if __name__ == '__main__':
    # create a diagnosis by posting
    reg = post('/api/patient/register', {'name':'DelTest','age':30})
    pid = reg.get('id',1)
    post('/api/diagnose', {'patient_id': pid, 'symptoms':'cough fever'})
    hist = get(f'/api/diagnosis-history/{pid}')
    print('HISTORY BEFORE:', json.dumps(hist, indent=2, ensure_ascii=False))
    if hist:
        did = hist[0]['id']
        print('Deleting id', did)
        print(delete(f'/api/diagnosis/{did}'))
        hist2 = get(f'/api/diagnosis-history/{pid}')
        print('HISTORY AFTER:', json.dumps(hist2, indent=2, ensure_ascii=False))
