import urllib.request, json
BASE='http://127.0.0.1:5000'

def post(path, data):
    url = BASE + path
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type':'application/json'})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode('utf-8'))

if __name__ == '__main__':
    try:
        r = post('/api/diagnose', {'patient_id':1, 'symptoms':'thyroid'})
        print(json.dumps(r, indent=2, ensure_ascii=False))
    except Exception as e:
        print('ERROR', e)
