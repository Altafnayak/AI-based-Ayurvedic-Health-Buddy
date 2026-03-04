import urllib.request, json

BASE='http://127.0.0.1:5000'

def post(path, data):
    url = BASE + path
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type':'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            text = resp.read().decode('utf-8')
            print('STATUS', resp.getcode())
            print('BODY', text)
            return json.loads(text)
    except Exception as e:
        print('ERROR calling', path, type(e), e)
        try:
            if hasattr(e, 'read'):
                print('BODY:', e.read().decode())
        except Exception:
            pass
        raise

if __name__ == '__main__':
    print('Posting register payload...')
    post('/api/patient/register', {'name': 'SmokeUser', 'age': 25, 'gender': 'Male'})
