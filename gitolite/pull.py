import subprocess
from subprocess import Popen
subprocess.Popen("git pull origin master", cwd="/home/tsadmin/gitolite-admin")
time.sleep(3)
exit(0)