import subprocess
from subprocess import Popen

import time

subprocess.Popen("git add .", cwd="/home/tsadmin/gitolite-admin/", shell=True)
time.sleep(1)
subprocess.Popen('git commit -m "added some data"', cwd="/home/tsadmin/gitolite-admin/", shell=True)
time.sleep(2)
subprocess.Popen("git push origin master", cwd="/home/tsadmin/gitolite-admin/", shell=True)
