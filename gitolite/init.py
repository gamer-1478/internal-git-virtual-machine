import subprocess
from subprocess import Popen
import time
subprocess.Popen("git clone git@git.displicare.us:gitolite-admin", cwd="/home/tsadmin/")
time.sleep(3)
exit(0)