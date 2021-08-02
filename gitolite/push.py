import subprocess
from subprocess import Popen

import time

subprocess.Popen("git add .", cwd="D:/BIG PROJECTS/internal-git-virtual-machine/gitolite/gitolite-conf")
time.sleep(1)
subprocess.Popen('git commit -m "added some data"', cwd="D:/BIG PROJECTS/internal-git-virtual-machine/gitolite/gitolite-conf")
time.sleep(2)
subprocess.Popen("git push origin main", cwd="D:/BIG PROJECTS/internal-git-virtual-machine/gitolite/gitolite-conf")
exit(0)