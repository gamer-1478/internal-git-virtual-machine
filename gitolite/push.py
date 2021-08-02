import subprocess
from subprocess import Popen

import time

subprocess.Popen("git add .", cwd="/home/tsadmin/gitolite-admin")
time.sleep(1)
subprocess.Popen('git commit -m "added some data"', cwd="/home/tsadmin/gitolite-admin")
time.sleep(2)
subprocess.Popen("git push origin main", cwd="/home/tsadmin/gitolite-admin")
exit(0)